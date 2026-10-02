import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/server/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orgName,
      eventTitle,
      cohort,
      scale,
      eventDate,
      needGrouping,
      applicantName,
      applicantRole,
      contactLine,
      contactPhone,
      notes,
      honeypot, // 蜜罐欄位（正常使用者不會填寫）
    } = body;

    // 1. 機器人蜜罐防護
    if (honeypot && String(honeypot).trim() !== "") {
      console.warn("[ApplicationAPI] Spam bot detected via honeypot field.");
      return NextResponse.json({
        success: true,
        message: "申請已收到，專案團隊將盡速為您聯繫！",
      });
    }

    // 2. 必填欄位防禦性檢查
    if (!orgName || !eventTitle || !applicantName || !contactLine) {
      return NextResponse.json(
        { success: false, message: "請填寫完整必要資訊（單位、活動名稱、聯絡人、LINE ID）！" },
        { status: 400 }
      );
    }

    // 3. 儲存至 Supabase 雲端資料庫
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.from("event_applications").insert({
        org_name: String(orgName).trim(),
        event_title: String(eventTitle).trim(),
        cohort: cohort ? String(cohort).trim() : null,
        scale: String(scale || "30~80人"),
        event_date: String(eventDate || ""),
        need_grouping: Boolean(needGrouping),
        applicant_name: String(applicantName).trim(),
        applicant_role: String(applicantRole || "活動發起人").trim(),
        contact_line: String(contactLine).trim(),
        contact_phone: contactPhone ? String(contactPhone).trim() : null,
        notes: notes ? String(notes).trim() : null,
        status: "pending",
      });

      if (error) {
        console.error("[ApplicationAPI] Supabase insert error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "🎉 活動開辦預約已成功送出！專案特助將於 24 小時內透過 LINE 聯繫您。",
    });
  } catch (err: any) {
    console.error("[ApplicationAPI] Submit error:", err);
    return NextResponse.json(
      { success: false, message: "伺服器處理申請時發生異常，請稍後再試。" },
      { status: 500 }
    );
  }
}
