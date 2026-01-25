import { db } from "@/lib/firebase";
import crypto from "crypto";
import * as admin from "firebase-admin";

/**
 * API Key Management Service
 *
 * Handles creation, validation, and management of API keys
 * Follows the same pattern as shareLinks with SHA-256 hashing
 */

export interface CreateAPIKeyData {
  name: string;
  userId: string;
  workspaceId: string;
  scopes: string[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  expiresAt?: Date | null;
}

export interface APIKeyResponse {
  id: string;
  key: string; // Plain text, shown only at creation
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
  lastUsedAt: string | null;
  totalRequests: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new API key
 * Returns plain key (only shown once, like GitHub PAT)
 */
export async function createAPIKey(
  data: CreateAPIKeyData
): Promise<APIKeyResponse> {
  // Generate 64-character hex token (matching share link pattern from sharing.ts:80)
  const key = crypto.randomBytes(32).toString("hex");
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const now = new Date();

  const apiKeyData = {
    keyHash, // Store hash for validation
    name: data.name,
    userId: data.userId,
    workspaceId: data.workspaceId,
    scopes: data.scopes || [],
    rateLimit: {
      requestsPerMinute: data.rateLimit?.requestsPerMinute ?? 60,
      requestsPerHour: data.rateLimit?.requestsPerHour ?? 1000,
      requestsPerDay: data.rateLimit?.requestsPerDay ?? 10000,
    },
    isActive: true,
    isRevoked: false,
    lastUsedAt: null,
    totalRequests: 0,
    expiresAt: data.expiresAt || null,
    createdAt: now,
    updatedAt: now,
  };

  // Create document in Firestore
  const docRef = await db.collection("apiKeys").add(apiKeyData);

  // Convert timestamps to ISO strings for response
  return {
    id: docRef.id,
    key, // Return plain key only at creation
    name: data.name,
    userId: data.userId,
    workspaceId: data.workspaceId,
    scopes: data.scopes || [],
    rateLimit: apiKeyData.rateLimit,
    isActive: true,
    isRevoked: false,
    lastUsedAt: null,
    totalRequests: 0,
    expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Get API key by ID (without plain key)
 */
export async function getAPIKey(apiKeyId: string) {
  try {
    const doc = await db.collection("apiKeys").doc(apiKeyId).get();

    if (!doc.exists) {
      return null;
    }

    return convertAPIKeyDoc(apiKeyId, doc.data()!);
  } catch (error) {
    console.error("Failed to get API key:", error);
    return null;
  }
}

/**
 * List all API keys for a user
 */
export async function listAPIKeys(userId: string, workspaceId?: string) {
  try {
    let query = db
      .collection("apiKeys")
      .where("userId", "==", userId) as any;

    if (workspaceId) {
      query = query.where("workspaceId", "==", workspaceId);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    return snapshot.docs.map((doc: any) => convertAPIKeyDoc(doc.id, doc.data()));
  } catch (error) {
    console.error("Failed to list API keys:", error);
    return [];
  }
}

/**
 * Revoke an API key (set isRevoked = true)
 */
export async function revokeAPIKey(apiKeyId: string): Promise<boolean> {
  try {
    await db.collection("apiKeys").doc(apiKeyId).update({
      isRevoked: true,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Failed to revoke API key:", error);
    return false;
  }
}

/**
 * Delete an API key (hard delete)
 */
export async function deleteAPIKey(apiKeyId: string): Promise<boolean> {
  try {
    await db.collection("apiKeys").doc(apiKeyId).delete();
    return true;
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return false;
  }
}

/**
 * Update API key settings (name, scopes, rate limits)
 */
export async function updateAPIKey(
  apiKeyId: string,
  updates: {
    name?: string;
    scopes?: string[];
    rateLimit?: {
      requestsPerMinute?: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
    };
  }
): Promise<boolean> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.scopes) updateData.scopes = updates.scopes;

    if (updates.rateLimit) {
      // Get existing rate limit to preserve unspecified values
      const doc = await db.collection("apiKeys").doc(apiKeyId).get();
      const existing = doc.data()?.rateLimit || {};

      updateData.rateLimit = {
        requestsPerMinute:
          updates.rateLimit.requestsPerMinute ??
          existing.requestsPerMinute ??
          60,
        requestsPerHour:
          updates.rateLimit.requestsPerHour ?? existing.requestsPerHour ?? 1000,
        requestsPerDay:
          updates.rateLimit.requestsPerDay ?? existing.requestsPerDay ?? 10000,
      };
    }

    await db.collection("apiKeys").doc(apiKeyId).update(updateData);
    return true;
  } catch (error) {
    console.error("Failed to update API key:", error);
    return false;
  }
}

/**
 * Helper to convert Firestore API key document to response object
 * Converts timestamps to ISO strings (critical for client components)
 */
function convertAPIKeyDoc(docId: string, data: any): Omit<APIKeyResponse, 'key'> {
  const createdAtDate = data.createdAt
    ? data.createdAt.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt)
    : new Date();

  const updatedAtDate = data.updatedAt
    ? data.updatedAt.toDate
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt)
    : new Date();

  const expiresAtDate = data.expiresAt
    ? data.expiresAt.toDate
      ? data.expiresAt.toDate()
      : new Date(data.expiresAt)
    : null;

  const lastUsedAtDate = data.lastUsedAt
    ? data.lastUsedAt.toDate
      ? data.lastUsedAt.toDate()
      : new Date(data.lastUsedAt)
    : null;

  return {
    id: docId,
    name: data.name,
    userId: data.userId,
    workspaceId: data.workspaceId,
    scopes: data.scopes || [],
    rateLimit: data.rateLimit || {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    isActive: data.isActive ?? true,
    isRevoked: data.isRevoked ?? false,
    lastUsedAt: lastUsedAtDate ? lastUsedAtDate.toISOString() : null,
    totalRequests: data.totalRequests || 0,
    expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
    createdAt: createdAtDate.toISOString(),
    updatedAt: updatedAtDate.toISOString(),
  };
}
