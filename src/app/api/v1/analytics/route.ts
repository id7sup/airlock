import { NextRequest } from "next/server";
import { validateAPIKey, checkScope } from "@/lib/api/auth";
import { checkRateLimit, trackAPIUsage, getAPIKeyUsageStats } from "@/lib/api/ratelimit";
import { successResponse, responses } from "@/lib/api/responses";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/analytics
 * Get analytics data for share links (views, downloads, etc)
 *
 * Query params:
 * - days: 7 | 30 | 90 (optional, defaults to 7)
 * - folderId: string (optional, filter by folder)
 *
 * Returns: {
 *   summary: { totalViews, totalDownloads, activeLinks },
 *   daily: Array<{ date, views, downloads }>
 * }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/analytics";
  const method = "GET";
  const clientIP = getClientIP(req);
  const ipHash = crypto
    .createHash("sha256")
    .update(clientIP + "salt")
    .digest("hex")
    .substring(0, 16);

  try {
    // 1. Validate API key
    const authResult = await validateAPIKey(req);
    if (!authResult.valid) {
      await trackAPIUsage({
        apiKeyId: "unknown",
        userId: "unknown",
        workspaceId: "unknown",
        endpoint,
        method,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "AUTH_FAILED",
      });
      return authResult.error!;
    }

    const apiKey = authResult.apiKey!;

    // 2. Check scope
    if (!checkScope(apiKey, "analytics:read")) {
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 403,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "INSUFFICIENT_SCOPE",
      });
      return responses.insufficientScope("analytics:read");
    }

    // 3. Check rate limit
    const rateLimitResult = await checkRateLimit(
      apiKey.id,
      apiKey.rateLimit
    );
    if (!rateLimitResult.allowed) {
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 429,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "RATE_LIMIT_EXCEEDED",
      });
      const response = responses.rateLimitExceeded(
        rateLimitResult.retryAfter || 60
      );
      response.headers.set("Retry-After", String(rateLimitResult.retryAfter || 60));
      return response;
    }

    // 4. Parse query params
    const { searchParams } = new URL(req.url);
    const daysStr = searchParams.get("days") || "7";
    const folderId = searchParams.get("folderId");

    let days = 7;
    if (daysStr === "30") days = 30;
    else if (daysStr === "90") days = 90;

    // 5. Get analytics data
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = now.toISOString().split("T")[0];

    let query = db
      .collection("shareLinks")
      .where("creatorId", "==", apiKey.userId) as any;

    if (folderId) {
      query = query.where("folderId", "==", folderId);
    }

    const linksSnapshot = await query.get();
    const links = linksSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get analytics for all these links
    let analyticsQuery = db
      .collection("shareAnalytics")
      .where("ownerId", "==", apiKey.userId) as any;

    const analyticsSnapshot = await analyticsQuery
      .where("date", ">=", startDateStr)
      .where("date", "<=", endDateStr)
      .get();

    const analytics = analyticsSnapshot.docs.map((doc: any) => doc.data());

    // Filter by folderId if specified
    let filteredAnalytics = analytics;
    if (folderId) {
      const folderLinkIds = links.map((l: any) => l.id);
      filteredAnalytics = analytics.filter((a: any) =>
        folderLinkIds.includes(a.linkId)
      );
    }

    // 6. Calculate summary stats
    const totalViews = filteredAnalytics.filter(
      (a: any) => a.eventType === "OPEN_SHARE"
    ).length;
    const totalDownloads = filteredAnalytics.filter(
      (a: any) => a.eventType === "DOWNLOAD_FILE"
    ).length;
    const activeLinks = new Set(filteredAnalytics.map((a: any) => a.linkId)).size;

    // 7. Group by date for daily breakdown
    const byDate: Record<string, any> = {};
    filteredAnalytics.forEach((event: any) => {
      if (!byDate[event.date]) {
        byDate[event.date] = {
          date: event.date,
          views: 0,
          downloads: 0,
          other: 0,
        };
      }

      if (event.eventType === "OPEN_SHARE") {
        byDate[event.date].views++;
      } else if (event.eventType === "DOWNLOAD_FILE") {
        byDate[event.date].downloads++;
      } else {
        byDate[event.date].other++;
      }
    });

    const daily = Object.values(byDate)
      .map((d: any) => ({
        date: d.date,
        views: d.views,
        downloads: d.downloads,
        total: d.views + d.downloads + d.other,
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // 8. Track usage
    await trackAPIUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      workspaceId: apiKey.workspaceId,
      endpoint,
      method,
      statusCode: 200,
      responseTime: Date.now() - startTime,
      requestSize: 0,
      ipHash,
    });

    // 9. Return response
    return successResponse({
      summary: {
        totalViews,
        totalDownloads,
        activeLinks,
        period: `last ${days} days`,
      },
      daily,
      shareCount: links.length,
    });
  } catch (error) {
    console.error("GET /api/v1/analytics error:", error);
    return responses.internalError();
  }
}

/**
 * Helper to extract real client IP from headers
 */
function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}
