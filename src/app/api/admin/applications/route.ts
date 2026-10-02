import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/authGuard";
import { getServerSupabase } from "@/lib/server/supabaseServer";

/**
 * 列出所有預約開房申請 (需 Admin 權限)
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, message: "未經授權之存取，請先登入主辦後台！" },
      { status: 401 }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ success: true, applications: [] });
  }

  const { data, error } = await supabase
    .from("event_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, applications: data });
}

/**
 * 審核申請 (核准開房 / 駁回) (需 Admin 權限)
 */
export async function PATCH(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, message: "未經授權之存取，請先登入主辦後台！" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, action, customSlug } = body;

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: "雲端資料庫未連線" },
        { status: 500 }
      );
    }

    if (action === "approve") {
      // 1. 抓取申請詳情
      const { data: appData, error: fetchErr } = await supabase
        .from("event_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !appData) {
        return NextResponse.json(
          { success: false, message: "找不到該筆申請記錄" },
          { status: 404 }
        );
      }

      // 2. 生成乾淨安全的 URL Slug
      let baseSlug = customSlug || appData.cohort || appData.org_name;
      baseSlug = String(baseSlug)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (!baseSlug || baseSlug.length < 2) {
        baseSlug = `club-${Date.now().toString().slice(-4)}`;
      }

      // 檢查 slug 是否已被使用
      let finalSlug = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();

        if (!existing) break;
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // 3. 在 events 資料庫自動開房 (若不需要分組，組數為 0)
      const totalGroups = appData.need_grouping ? 6 : 0;
      const { data: newEvent, error: insertErr } = await supabase
        .from("events")
        .insert({
          slug: finalSlug,
          name: appData.event_title,
          cohort: appData.cohort || appData.org_name,
          total_groups: totalGroups,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("[AdminApproveAPI] Event creation failed:", insertErr);
        return NextResponse.json(
          { success: false, message: "建立專屬房間失敗：" + insertErr.message },
          { status: 500 }
        );
      }

      // 4. 更新申請狀態為 approved
      await supabase
        .from("event_applications")
        .update({ status: "approved" })
        .eq("id", id);

      const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
      const inviteUrl = `${liffBaseUrl}?event=${finalSlug}`;

      return NextResponse.json({
        success: true,
        message: "已成功核准並建立專屬活動空間！",
        slug: finalSlug,
        event: newEvent,
        inviteUrl,
      });
    } else if (action === "reject") {
      await supabase
        .from("event_applications")
        .update({ status: "rejected" })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        message: "已標記駁回該筆申請",
      });
    }

    return NextResponse.json({ success: false, message: "未知操作" }, { status: 400 });
  } catch (err: any) {
    console.error("[AdminApproveAPI] Error:", err);
    return NextResponse.json(
      { success: false, message: "伺服器內部異常" },
      { status: 500 }
    );
  }
}
