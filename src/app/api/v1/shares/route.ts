import { NextRequest } from "next/server";
import { validateAPIKey, checkScope } from "@/lib/api/auth";
import { checkRateLimit, trackAPIUsage } from "@/lib/api/ratelimit";
import { responses } from "@/lib/api/responses";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/shares
 * List share links for a workspace
 *
 * Query params:
 * - folderId: string (optional, filter by folder)
 * - limit: number (optional, defaults to 20)
 * - offset: number (optional, defaults to 0)
 *
 * Returns: { shares: Array<{id, token, folderId, expiresAt, maxViews, viewCount, ...}>, total: number }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/shares";
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
    if (!checkScope(apiKey, "shares:read")) {
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
      return responses.insufficientScope("shares:read");
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

    // 5. Build query - find shares by creatorId in workspace
    let query = db
      .collection("shareLinks")
      .where("creatorId", "==", apiKey.userId) as any;

    if (folderId) {
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

    const shares = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        token: data.token,
        folderId: data.folderId,
        expiresAt: data.expiresAt
          ? data.expiresAt.toDate
            ? data.expiresAt.toDate().toISOString()
            : data.expiresAt
          : null,
        maxViews: data.maxViews || null,
        viewCount: data.viewCount || 0,
        downloadCount: data.downloadCount || 0,
        isRevoked: data.isRevoked || false,
        allowDownload: data.allowDownload ?? true,
        allowViewOnline: data.allowViewOnline ?? true,
        shareUrl: `${getBaseUrl()}/share/${data.token}`,
        createdAt: data.createdAt
          ? data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
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
    return responses.successResponse({ shares, total });
  } catch (error) {
    console.error("GET /api/v1/shares error:", error);
    return responses.internalError();
  }
}

/**
 * POST /api/v1/shares
 * Create a new share link
 *
 * Body: {
 *   folderId: string,
 *   expiresAt?: Date,
 *   password?: string,
 *   maxViews?: number,
 *   allowDownload?: boolean,
 *   allowViewOnline?: boolean
 * }
 *
 * Returns: { id, token, shareUrl, folderId, expiresAt, createdAt }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/shares";
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
    if (!checkScope(apiKey, "shares:write")) {
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
      return responses.insufficientScope("shares:write");
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

    const { folderId, expiresAt, password, maxViews, allowDownload, allowViewOnline } = body;

    // 5. Validate required fields
    if (!folderId || typeof folderId !== "string") {
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
      return responses.validationError("'folderId' field is required and must be a string");
    }

    // 6. Verify folder exists and belongs to this workspace
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

    // 7. Generate token (matching pattern from sharing.ts:80-81)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Hash password if provided
    let passwordHash = null;
    if (password && typeof password === "string") {
      passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    }

    // 8. Create share link
    const now = new Date();
    const shareLinkData = {
      folderId,
      creatorId: apiKey.userId,
      token, // Plain text for dashboard
      tokenHash, // Hash for validation
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      passwordHash,
      maxViews: maxViews ? parseInt(maxViews) : null,
      viewCount: 0,
      downloadCount: 0,
      isRevoked: false,
      allowDownload: allowDownload ?? true,
      allowViewOnline: allowViewOnline ?? true,
      allowFolderAccess: true,
      restrictDomain: false,
      blockVpn: false,
      allowedDomains: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("shareLinks").add(shareLinkData);

    // 9. Track usage
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

    // 10. Return response
    return responses.successResponse(
      {
        id: docRef.id,
        token,
        folderId,
        shareUrl: `${getBaseUrl()}/share/${token}`,
        expiresAt: shareLinkData.expiresAt ? shareLinkData.expiresAt.toISOString() : null,
        maxViews: shareLinkData.maxViews,
        allowDownload: shareLinkData.allowDownload,
        allowViewOnline: shareLinkData.allowViewOnline,
        createdAt: now.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/v1/shares error:", error);
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

/**
 * Helper to get base URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_DOMAIN || "https://airlock.app";
}
