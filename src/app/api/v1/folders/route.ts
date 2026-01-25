import { NextRequest } from "next/server";
import { validateAPIKey, checkScope } from "@/lib/api/auth";
import { checkRateLimit, trackAPIUsage } from "@/lib/api/ratelimit";
import { responses } from "@/lib/api/responses";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/folders
 * List folders in a workspace
 *
 * Query params:
 * - workspaceId: string (optional, pre-filled from API key)
 * - parentId: string (optional, defaults to root)
 * - limit: number (optional, defaults to 20)
 * - offset: number (optional, defaults to 0)
 *
 * Returns: { folders: Array<{id, name, parentId, createdAt, updatedAt}>, total: number }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/folders";
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
    if (!checkScope(apiKey, "folders:read")) {
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
      return responses.insufficientScope("folders:read");
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
    const parentId = searchParams.get("parentId") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // 5. Query folders
    let query = db
      .collection("folders")
      .where("workspaceId", "==", apiKey.workspaceId) as any;

    if (parentId) {
      query = query.where("parentId", "==", parentId);
    } else {
      // Root folders
      query = query.where("parentId", "==", null);
    }

    // Get total count (approximate, but good enough)
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Get paginated results
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const folders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        parentId: data.parentId || null,
        createdAt: data.createdAt
          ? data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
          : new Date().toISOString(),
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt
          : new Date().toISOString(),
      };
    });

    // 6. Track usage
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

    // 7. Return response
    return responses.successResponse({ folders, total });
  } catch (error) {
    console.error("GET /api/v1/folders error:", error);
    return responses.internalError();
  }
}

/**
 * POST /api/v1/folders
 * Create a new folder
 *
 * Body: { name: string, parentId?: string }
 *
 * Returns: { id, name, parentId, createdAt }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/folders";
  const method = "POST";
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
    if (!checkScope(apiKey, "folders:write")) {
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
      return responses.insufficientScope("folders:write");
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

    // 4. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 400,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "VALIDATION_ERROR",
      });
      return responses.validationError("Invalid JSON body");
    }

    const { name, parentId } = body;

    // 5. Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 400,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "VALIDATION_ERROR",
      });
      return responses.validationError("'name' field is required and must be a non-empty string");
    }

    // 6. Verify parent folder exists (if specified)
    if (parentId) {
      const parentDoc = await db.collection("folders").doc(parentId).get();
      if (
        !parentDoc.exists ||
        parentDoc.data()?.workspaceId !== apiKey.workspaceId
      ) {
        await trackAPIUsage({
          apiKeyId: apiKey.id,
          userId: apiKey.userId,
          workspaceId: apiKey.workspaceId,
          endpoint,
          method,
          statusCode: 404,
          responseTime: Date.now() - startTime,
          requestSize: 0,
          ipHash,
          errorType: "RESOURCE_NOT_FOUND",
        });
        return responses.resourceNotFound("Parent folder");
      }
    }

    // 7. Create folder
    const now = new Date();
    const folderData = {
      name: name.trim(),
      parentId: parentId || null,
      workspaceId: apiKey.workspaceId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("folders").add(folderData);

    // 8. Track usage
    await trackAPIUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      workspaceId: apiKey.workspaceId,
      endpoint,
      method,
      statusCode: 201,
      responseTime: Date.now() - startTime,
      requestSize: 0,
      ipHash,
    });

    // 9. Return response
    return responses.successResponse(
      {
        id: docRef.id,
        name: folderData.name,
        parentId: folderData.parentId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/v1/folders error:", error);
    return responses.internalError();
  }
}

/**
 * Helper to extract real client IP from headers
 * Supports Cloudflare, Vercel, and other proxies
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
