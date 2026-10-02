import { NextRequest, NextResponse } from "next/server";
import {
  verifyPinCode,
  signAdminToken,
  ADMIN_COOKIE_NAME,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/server/authGuard";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. 防暴力破解檢查
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `登入失敗次數過多，該 IP 已暫時鎖定。請於 ${rateCheck.remainingMinutes} 分鐘後再試。`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pin } = body;

    // 2. PIN 碼安全比對
    const isPinCorrect = verifyPinCode(pin);

    if (!isPinCorrect) {
      const attemptRes = recordFailedAttempt(ip);
      if (attemptRes.locked) {
        return NextResponse.json(
          {
            success: false,
            message: "密鑰錯誤達 5 次，系統已暫時鎖定該 IP 15 分鐘！",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: `主辦人驗證密鑰錯誤！剩餘嘗試次數：${attemptRes.attemptsLeft} 次`,
        },
        { status: 401 }
      );
    }

    // 3. 驗證通過，清除失敗計數並簽發 JWT
    clearFailedAttempts(ip);
    const token = signAdminToken("master_admin");

    const response = NextResponse.json({
      success: true,
      message: "後端管理員憑證驗證成功，歡迎進入主辦後台！",
    });

    // 4. 寫入高安全性 HttpOnly Cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 小時
    });

    return response;
  } catch (err: any) {
    console.error("[AdminLoginAPI] Error:", err);
    return NextResponse.json(
      { success: false, message: "伺服器內部錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
