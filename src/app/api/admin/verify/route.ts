import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/authGuard";

export async function GET(request: NextRequest) {
  const isAuthed = verifyAdminRequest(request);
  return NextResponse.json({
    authenticated: isAuthed,
  });
}
