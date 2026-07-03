import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
const SCRYPT_KEYLEN = 64;

function getSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret-change-in-production";
}

/** Hash a plaintext password with a random salt: returns "saltHex:hashHex". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Constant-time verification of a plaintext password against a stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

/**
 * On a fresh database the admin table is empty, so bootstrap the first admin
 * from the ADMIN_USERNAME / ADMIN_PASSWORD env vars (defaults: admin /
 * damascus2026). After this, the database is the source of truth.
 */
async function bootstrapAdminIfEmpty(): Promise<void> {
  const count = await prisma.adminUser.count();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "damascus2026";
  await prisma.adminUser.create({
    data: { username, passwordHash: hashPassword(password) },
  });
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  await bootstrapAdminIfEmpty();

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return false;

  return verifyPassword(password, user.passwordHash);
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;

    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number };

    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return !!token && verifySessionToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

/** Returns a 401 response if the caller is not authenticated. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }
  return null;
}
