import { NextRequest } from "next/server";
import { validateAPIKey, checkScope } from "@/lib/api/auth";
import { checkRateLimit, trackAPIUsage } from "@/lib/api/ratelimit";
import { responses } from "@/lib/api/responses";
import { db } from "@/lib/firebase";
import { getUploadUrl } from "@/services/storage";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/upload
 * Get a presigned upload URL for uploading files to R2 storage
 *
 * Body: {
 *   folderId: string,
 *   name: string,
 *   size: number,
 *   mimeType: string
 * }
 *
 * Returns: { uploadUrl, s3Key, fileId }
 * Client uploads directly to R2, then calls /api/v1/upload/confirm to create file record
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = "/api/v1/upload";
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
    if (!checkScope(apiKey, "files:write")) {
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
      return responses.insufficientScope("files:write");
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

    const { folderId, name, size, mimeType } = body;

    // 5. Validate required fields
    if (
      !folderId ||
      typeof folderId !== "string" ||
      !name ||
      typeof name !== "string" ||
      !size ||
      typeof size !== "number" ||
      !mimeType ||
      typeof mimeType !== "string"
    ) {
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
      return responses.validationError(
        "Missing or invalid fields: folderId, name, size, mimeType (all required)"
      );
    }

    // 6. Verify folder exists and belongs to workspace
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

    // 7. Check storage quota (5 GB default)
    const MAX_STORAGE = 5 * 1024 * 1024 * 1024;
    const workspaceId = folderDoc.data()?.workspaceId;

    const workspaceDoc = await db
      .collection("workspaces")
      .doc(workspaceId)
      .get();
    const currentUsage = workspaceDoc.data()?.totalStorageUsed || 0;

    if (currentUsage + size > MAX_STORAGE) {
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 402,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "STORAGE_QUOTA_EXCEEDED",
      });
      return responses.storageQuotaExceeded();
    }

    // 8. Generate S3 key and get presigned upload URL
    const s3Key = `uploads/${apiKey.userId}/${Date.now()}-${name}`;

    let uploadUrl: string;
    try {
      uploadUrl = await getUploadUrl(s3Key, mimeType);
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      await trackAPIUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        workspaceId: apiKey.workspaceId,
        endpoint,
        method,
        statusCode: 500,
        responseTime: Date.now() - startTime,
        requestSize: 0,
        ipHash,
        errorType: "INTERNAL_ERROR",
      });
      return responses.internalError();
    }

    // 9. Generate a temporary file ID (used as reference until upload confirmation)
    const fileId = crypto.randomBytes(16).toString("hex");

    // 10. Track usage
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

    // 11. Return presigned URL
    return responses.successResponse({
      uploadUrl,
      s3Key,
      fileId,
      expiresIn: 3600, // URL expires in 1 hour
      note: "Upload file to the provided URL, then call POST /api/v1/upload/confirm with the s3Key",
    });
  } catch (error) {
    console.error("POST /api/v1/upload error:", error);
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
