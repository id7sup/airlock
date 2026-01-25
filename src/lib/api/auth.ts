import { db } from "@/lib/firebase";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { responses } from "./responses";

/**
 * API Key Authentication Middleware
 *
 * Validates Bearer tokens against hashed API keys (SHA-256)
 * Following the same pattern as share link validation in sharing.ts
 */

export interface ValidatedAPIKey {
  id: string;
  key?: string; // Not included after creation
  keyHash: string;
  name: string;
  userId: string;
  workspaceId: string;
  scopes: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  isActive: boolean;
  isRevoked: boolean;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  totalRequests: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function validateAPIKey(req: NextRequest): Promise<{
  valid: boolean;
  apiKey?: ValidatedAPIKey;
  error?: ReturnType<typeof responses[keyof typeof responses]>;
}> {
  // Extract Bearer token from Authorization header
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      error: responses.authMissing(),
    };
  }

  const key = authHeader.substring(7); // Remove "Bearer "

  if (!key || key.length === 0) {
    return {
      valid: false,
      error: responses.authInvalid(),
    };
  }

  try {
    // Hash the provided key (matching the pattern from sharing.ts:81)
    const keyHash = crypto
      .createHash("sha256")
      .update(key)
      .digest("hex");

    // Query Firestore for the hashed key
    // Using where clause to find the matching hash
    const snapshot = await db
      .collection("apiKeys")
      .where("keyHash", "==", keyHash)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        valid: false,
        error: responses.authInvalid(),
      };
    }

    const apiKeyDoc = snapshot.docs[0];
    const apiKeyData = apiKeyDoc.data();

    // Check if key is active
    if (!apiKeyData.isActive || apiKeyData.isRevoked) {
      return {
        valid: false,
        error: responses.authRevoked(),
      };
    }

    // Check expiration
    if (apiKeyData.expiresAt) {
      const expiresAt = apiKeyData.expiresAt.toDate
        ? apiKeyData.expiresAt.toDate()
        : new Date(apiKeyData.expiresAt);

      if (expiresAt < new Date()) {
        return {
          valid: false,
          error: responses.authExpired(),
        };
      }
    }

    // Update last used timestamp (async, don't wait)
    db.collection("apiKeys")
      .doc(apiKeyDoc.id)
      .update({
        lastUsedAt: new Date(),
      })
      .catch((err) => {
        console.error("Failed to update lastUsedAt:", err);
      });

    // Convert Firestore timestamps to JS dates
    const expiresAtDate = apiKeyData.expiresAt
      ? apiKeyData.expiresAt.toDate
        ? apiKeyData.expiresAt.toDate()
        : new Date(apiKeyData.expiresAt)
      : null;

    const createdAtDate = apiKeyData.createdAt
      ? apiKeyData.createdAt.toDate
        ? apiKeyData.createdAt.toDate()
        : new Date(apiKeyData.createdAt)
      : new Date();

    const updatedAtDate = apiKeyData.updatedAt
      ? apiKeyData.updatedAt.toDate
        ? apiKeyData.updatedAt.toDate()
        : new Date(apiKeyData.updatedAt)
      : new Date();

    const lastUsedAtDate = apiKeyData.lastUsedAt
      ? apiKeyData.lastUsedAt.toDate
        ? apiKeyData.lastUsedAt.toDate()
        : new Date(apiKeyData.lastUsedAt)
      : null;

    return {
      valid: true,
      apiKey: {
        id: apiKeyDoc.id,
        keyHash: apiKeyData.keyHash,
        name: apiKeyData.name,
        userId: apiKeyData.userId,
        workspaceId: apiKeyData.workspaceId,
        scopes: apiKeyData.scopes || [],
        rateLimit: apiKeyData.rateLimit || {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
        },
        isActive: apiKeyData.isActive,
        isRevoked: apiKeyData.isRevoked,
        expiresAt: expiresAtDate,
        lastUsedAt: lastUsedAtDate,
        totalRequests: apiKeyData.totalRequests || 0,
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
      },
    };
  } catch (error) {
    console.error("API key validation error:", error);
    return {
      valid: false,
      error: responses.internalError(),
    };
  }
}

/**
 * Check if API key has required scope
 */
export function checkScope(apiKey: ValidatedAPIKey, requiredScope: string): boolean {
  return apiKey.scopes.includes(requiredScope) || false;
}

/**
 * Check if API key has any of the required scopes
 */
export function checkAnyScopeOf(
  apiKey: ValidatedAPIKey,
  requiredScopes: string[]
): boolean {
  return requiredScopes.some((scope) => apiKey.scopes.includes(scope));
}

/**
 * Check if API key has all required scopes
 */
export function checkAllScopesOf(
  apiKey: ValidatedAPIKey,
  requiredScopes: string[]
): boolean {
  return requiredScopes.every((scope) => apiKey.scopes.includes(scope));
}
