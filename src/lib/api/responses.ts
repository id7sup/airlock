import { NextResponse } from "next/server";

/**
 * Standardized API Response Formats
 * Used across all /api/v1/* endpoints
 */

export type ErrorCode =
  | "AUTH_MISSING"
  | "AUTH_INVALID"
  | "AUTH_REVOKED"
  | "AUTH_EXPIRED"
  | "INSUFFICIENT_SCOPE"
  | "RATE_LIMIT_EXCEEDED"
  | "RESOURCE_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "STORAGE_QUOTA_EXCEEDED"
  | "INTERNAL_ERROR"
  | "PERMISSION_DENIED"
  | "INVALID_WORKSPACE";

interface ErrorDetails {
  [key: string]: any;
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number,
  details?: ErrorDetails
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

// Common error responses
export const responses = {
  authMissing: () =>
    errorResponse(
      "AUTH_MISSING",
      "Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY",
      401
    ),

  authInvalid: () =>
    errorResponse("AUTH_INVALID", "Invalid API key", 401),

  authRevoked: () =>
    errorResponse(
      "AUTH_REVOKED",
      "This API key has been disabled or revoked",
      401
    ),

  authExpired: () =>
    errorResponse("AUTH_EXPIRED", "This API key has expired", 401),

  insufficientScope: (scope: string) =>
    errorResponse(
      "INSUFFICIENT_SCOPE",
      `This API key does not have the required scope: ${scope}`,
      403
    ),

  rateLimitExceeded: (retryAfter: number) =>
    errorResponse(
      "RATE_LIMIT_EXCEEDED",
      "You have exceeded the rate limit for this API key",
      429,
      { retryAfter }
    ),

  resourceNotFound: (resource: string) =>
    errorResponse(
      "RESOURCE_NOT_FOUND",
      `${resource} not found`,
      404
    ),

  validationError: (message: string, details?: ErrorDetails) =>
    errorResponse(
      "VALIDATION_ERROR",
      message,
      400,
      details
    ),

  storageQuotaExceeded: () =>
    errorResponse(
      "STORAGE_QUOTA_EXCEEDED",
      "Storage quota exceeded for this workspace",
      402
    ),

  permissionDenied: (message?: string) =>
    errorResponse(
      "PERMISSION_DENIED",
      message || "You do not have permission to access this resource",
      403
    ),

  invalidWorkspace: () =>
    errorResponse(
      "INVALID_WORKSPACE",
      "Invalid or mismatched workspace",
      403
    ),

  internalError: () =>
    errorResponse(
      "INTERNAL_ERROR",
      "An internal server error occurred",
      500
    ),
};
