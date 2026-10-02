import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 伺服器端專用 Supabase 管理員實例 (Server-Side Supabase Client)
 * 擁有完整的資料庫操作權限 (Service Role 或 Anon Key 降級相容)
 * 警告：此模組嚴禁被任何 Client Component (前端瀏覽器) 引用打包！
 */
let cachedServerClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 優先使用 Service Role Key，若尚未配置則使用 Anon Key 作為相容降級
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[ServerSupabase] Supabase URL or Key not configured on server.");
    return null;
  }

  if (!cachedServerClient) {
    cachedServerClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedServerClient;
}
