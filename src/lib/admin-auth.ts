import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 heures

export function validateAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false;

  const emailLower = email.toLowerCase();
  const adminEmailLower = ADMIN_EMAIL.toLowerCase();

  // timingSafeEqual exige des buffers de même longueur
  if (Buffer.byteLength(emailLower) !== Buffer.byteLength(adminEmailLower)) return false;
  if (Buffer.byteLength(password) !== Buffer.byteLength(ADMIN_PASSWORD)) return false;

  const emailMatch = crypto.timingSafeEqual(
    Buffer.from(emailLower),
    Buffer.from(adminEmailLower)
  );
  const passwordMatch = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(ADMIN_PASSWORD)
  );

  return emailMatch && passwordMatch;
}

export function createAdminToken(): string {
  if (!ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET not configured");

  const payload = {
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!ADMIN_JWT_SECRET) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return false;

  const expectedSig = crypto
    .createHmac("sha256", ADMIN_JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (Buffer.byteLength(signature) !== Buffer.byteLength(expectedSig)) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<{ authenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return { authenticated: false };
    return { authenticated: verifyAdminToken(token) };
  } catch {
    return { authenticated: false };
  }
}
