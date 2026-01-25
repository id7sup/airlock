import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

/**
 * Rate Limiting Service
 *
 * Uses Firestore atomic increments to track requests per minute/hour/day
 * Similar pattern to share link viewCount/downloadCount tracking
 *
 * Rate limit docs have TTL (24 hours) for automatic cleanup
 */

export async function checkRateLimit(
  apiKeyId: string,
  limits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  }
): Promise<{
  allowed: boolean;
  error?: string;
  retryAfter?: number; // seconds
}> {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const hour = now.getHours().toString().padStart(2, "0"); // HH
  const minute = now.getMinutes().toString().padStart(2, "0"); // MM

  // Document ID includes time buckets for easy querying
  const rateLimitId = `${apiKeyId}:${date}:${hour}:${minute}`;
  const rateLimitRef = db.collection("apiRateLimits").doc(rateLimitId);

  try {
    // Use transaction to atomically check and increment counters
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);

      let requestsThisMinute = 0;
      let requestsThisHour = 0;
      let requestsThisDay = 0;

      if (doc.exists) {
        const data = doc.data()!;
        requestsThisMinute = data.requestsThisMinute || 0;
        requestsThisHour = data.requestsThisHour || 0;
        requestsThisDay = data.requestsThisDay || 0;
      }

      // Check minute limit
      if (requestsThisMinute >= limits.requestsPerMinute) {
        return { allowed: false, reason: "MINUTE", retryAfter: 60 };
      }

      // Check hour limit
      if (requestsThisHour >= limits.requestsPerHour) {
        return { allowed: false, reason: "HOUR", retryAfter: 3600 };
      }

      // Check day limit
      if (requestsThisDay >= limits.requestsPerDay) {
        return { allowed: false, reason: "DAY", retryAfter: 86400 };
      }

      // All checks passed, increment counters
      if (doc.exists) {
        // Document exists, increment all counters
        transaction.update(rateLimitRef, {
          requestsThisMinute: admin.firestore.FieldValue.increment(1),
          requestsThisHour: admin.firestore.FieldValue.increment(1),
          requestsThisDay: admin.firestore.FieldValue.increment(1),
          updatedAt: new Date(),
        });
      } else {
        // Create new document with TTL (24 hours for auto-cleanup)
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        transaction.set(rateLimitRef, {
          apiKeyId,
          date,
          hour,
          minute,
          requestsThisMinute: 1,
          requestsThisHour: 1,
          requestsThisDay: 1,
          createdAt: now,
          expiresAt, // For TTL cleanup
          updatedAt: now,
        });
      }

      return { allowed: true };
    });

    if (!result.allowed) {
      return {
        allowed: false,
        error: `Rate limit exceeded (${result.reason})`,
        retryAfter: result.retryAfter,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open: if there's a database error, allow the request
    // Better UX than blocking users due to infrastructure issues
    return { allowed: true };
  }
}

/**
 * Track API usage for analytics and monitoring
 * Should be called after request completes (async, non-blocking)
 */
export async function trackAPIUsage(data: {
  apiKeyId: string;
  userId: string;
  workspaceId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number; // milliseconds
  requestSize: number; // bytes
  ipHash?: string;
  userAgent?: string | null;
  errorType?: string | null;
}) {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const hour = now.getHours().toString().padStart(2, "0"); // HH
  const minute = now.getMinutes().toString().padStart(2, "0"); // MM

  try {
    await db.collection("apiUsage").add({
      apiKeyId: data.apiKeyId,
      userId: data.userId,
      workspaceId: data.workspaceId,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      requestSize: data.requestSize,
      ipHash: data.ipHash || null,
      userAgent: data.userAgent || null,
      errorType: data.errorType || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date,
      hour,
      minute,
    });

    // Increment total requests counter on API key (async, non-blocking)
    db.collection("apiKeys")
      .doc(data.apiKeyId)
      .update({
        totalRequests: admin.firestore.FieldValue.increment(1),
      })
      .catch((err) => {
        console.error("Failed to increment totalRequests:", err);
      });
  } catch (error) {
    console.error("Failed to track API usage:", error);
    // Don't throw - usage tracking should not block the API response
  }
}

/**
 * Get API usage stats for a specific API key
 * Used for dashboard analytics
 */
export async function getAPIKeyUsageStats(
  apiKeyId: string,
  days: number = 7
) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = now.toISOString().split("T")[0];

  try {
    const snapshot = await db
      .collection("apiUsage")
      .where("apiKeyId", "==", apiKeyId)
      .where("date", ">=", startDateStr)
      .where("date", "<=", endDateStr)
      .get();

    const docs = snapshot.docs.map((doc) => doc.data());

    // Group by date
    const byDate: Record<string, any[]> = {};
    docs.forEach((doc) => {
      if (!byDate[doc.date]) {
        byDate[doc.date] = [];
      }
      byDate[doc.date].push(doc);
    });

    // Calculate stats
    const daily = Object.entries(byDate)
      .map(([date, entries]) => {
        const successCount = entries.filter(
          (e) => e.statusCode >= 200 && e.statusCode < 300
        ).length;
        const errorCount = entries.filter(
          (e) => e.statusCode >= 400
        ).length;

        return {
          date,
          requests: entries.length,
          successCount,
          errorCount,
          avgResponseTime:
            entries.reduce((sum, e) => sum + (e.responseTime || 0), 0) /
            entries.length,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRequests = docs.length;
    const totalSuccess = docs.filter(
      (d) => d.statusCode >= 200 && d.statusCode < 300
    ).length;
    const successRate =
      totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0;
    const avgResponseTime =
      totalRequests > 0
        ? docs.reduce((sum, d) => sum + (d.responseTime || 0), 0) / totalRequests
        : 0;

    return {
      summary: {
        totalRequests,
        successCount: totalSuccess,
        errorCount: totalRequests - totalSuccess,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
      },
      daily,
    };
  } catch (error) {
    console.error("Failed to get usage stats:", error);
    return {
      summary: {
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        avgResponseTime: 0,
      },
      daily: [],
    };
  }
}
