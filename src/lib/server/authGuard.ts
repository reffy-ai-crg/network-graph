import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "network_graph_secret_master_key_2026_xyz!";
const DEFAULT_MASTER_PIN = process.env.ADMIN_MASTER_PIN || "888888";
export const ADMIN_COOKIE_NAME = "ng_admin_session";

// 內存防暴力破解暫存 (IP 失敗計數器)
interface AttemptRecord {
  count: number;
  lockedUntil?: number;
}
const failedAttempts = new Map<string, AttemptRecord>();

/**
 * 檢查 IP 是否遭到暴力破解鎖定 (5 次失敗鎖定 15 分鐘)
 */
export function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const record = failedAttempts.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remainingMinutes: remaining };
  }

  // 若鎖定時間已過，重設
  if (record.lockedUntil && record.lockedUntil <= now) {
    failedAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * 記錄登入失敗次數
 */
export function recordFailedAttempt(ip: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0 };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 鎖定 15 分鐘
    failedAttempts.set(ip, record);
    return { locked: true, attemptsLeft: 0 };
  }

  failedAttempts.set(ip, record);
  return { locked: false, attemptsLeft: 5 - record.count };
}

/**
 * 登入成功時清除該 IP 的失敗計數
 */
export function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

/**
 * 建立具備 HMAC-SHA256 簽署的 Admin Token
 */
export function signAdminToken(role: string = "master_admin"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 小時有效
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * 驗證 Token 簽章與過期狀態
 */
export function verifyAdminToken(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSig) {
      return { valid: false };
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp && decodedPayload.exp < now) {
      return { valid: false }; // 已過期
    }

    return { valid: true, payload: decodedPayload };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * 伺服器端守門函式：驗證請求中的 Admin Cookie
 */
export function verifyAdminRequest(request?: NextRequest): boolean {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  } else {
    try {
      token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      return false;
    }
  }

  if (!token) return false;
  const res = verifyAdminToken(token);
  return res.valid;
}

/**
 * 比對 Master PIN 碼
 */
export function verifyPinCode(inputPin: string): boolean {
  if (!inputPin) return false;
  // 常數時間比對防止時序攻擊 (Timing Attack)
  const expected = Buffer.from(DEFAULT_MASTER_PIN);
  const actual = Buffer.from(inputPin.trim());
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
