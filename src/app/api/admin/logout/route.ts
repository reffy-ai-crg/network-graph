import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/server/authGuard";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "已安全登出主辦管理後台",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
