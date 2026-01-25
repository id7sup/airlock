import { NextRequest } from "next/server";
import { validateAPIKey, checkScope } from "@/lib/api/auth";
import { checkRateLimit, trackAPIUsage } from "@/lib/api/ratelimit";
import { responses } from "@/lib/api/responses";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/files
 * List files in a folder or workspace
 *
 * Query params:
 * - folderId: string (optional, list all files if not specified)
 * - limit: number (optional, defaults to 20)
 * - offset: number (optional, defaults to 0)
 *
 * Returns: { files: Array<{id, name, size, mimeType, folderId, createdAt, updatedAt}>, total: number }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/files";
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
    if (!checkScope(apiKey, "files:read")) {
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
      return responses.insufficientScope("files:read");
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
    const folderId = searchParams.get("folderId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // 5. Build query
    let query = db
      .collection("files")
      .where("workspaceId", "==", apiKey.workspaceId) as any;

    if (folderId) {
      // Verify folder belongs to this workspace
      const folderDoc = await db.collection("folders").doc(folderId).get();
      if (
        !folderDoc.exists ||
        folderDoc.data()?.workspaceId !== apiKey.workspaceId
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
        return responses.resourceNotFound("Folder");
      }

      query = query.where("folderId", "==", folderId);
    }

    // Get total count
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Get paginated results
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const files = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        size: data.size,
        mimeType: data.mimeType,
        folderId: data.folderId,
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
    return responses.successResponse({ files, total });
  } catch (error) {
    console.error("GET /api/v1/files error:", error);
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
