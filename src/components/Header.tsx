"use client";

import React from "react";
import { useNetwork } from "../context/NetworkContext";
import { Users, Grid, Sparkles, BookOpen, User, Briefcase, Share2, Settings, Sun, Moon, Home, KeyRound } from "lucide-react";

interface HeaderProps {
  onOpenEditModal: () => void;
  onOpenAdminModal: () => void;
  onOpenJoinModal?: () => void;
}

export function Header({ onOpenEditModal, onOpenAdminModal, onOpenJoinModal }: HeaderProps) {
  const { 
    currentEvent, 
    activeTab, 
    setActiveTab, 
    currentUser, 
    members,
    openDrawer, 
    isCloudConnected,
    theme,
    toggleTheme,
    isAdminUnlocked
  } = useNetwork();

  const industryCount = React.useMemo(() => {
    const set = new Set(members.map((m) => m.industry));
    return Math.max(set.size, 1);
  }, [members]);

  return (
    <header className="bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md transition-colors">
      {/* 頂部品牌與活動資訊列 */}
      <div className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            LINE
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <h1 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                {currentEvent.title}
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 font-medium">
                {currentEvent.cohort}
              </span>
              {currentEvent.isDemoMode !== false ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50 font-medium hidden sm:inline">
                  示範展示模式 (55位)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700/50 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>專屬房間</span>
                </span>
              )}
              {isCloudConnected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="hidden sm:inline">雲端已連線</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>👥 全體 {members.length} 位</span>
              {currentEvent.totalGroups > 1 && (
                <>
                  <span>•</span>
                  <span>🧩 {currentEvent.totalGroups} 個組別</span>
                </>
              )}
              <span>•</span>
              <span className="hidden sm:inline">🏢 {industryCount} 大產業</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* 主題切換按鈕 (🌞 / 🌙) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === "light" ? "切換為深色模式" : "切換為淺色模式"}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* 分享按鈕 */}
          <button
            onClick={() => {
              const liffUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
              const text = encodeURIComponent(`邀請你加入「${currentEvent.title} · ${currentEvent.cohort}」人脈圖！點擊直接看全班同學名冊與動態關係圖譜：\n${liffUrl}`);
              window.open(`https://line.me/R/share?text=${text}`, "_blank");
            }}
            className="hidden sm:flex text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 dark:border-emerald-500/40 px-3 py-1.5 rounded-full transition items-center gap-1.5 shadow-xs font-medium"
            title="分享此活動到 LINE 群組"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>分享到 LINE</span>
          </button>

          {/* 加入/換房按鈕 (代碼快速通關) */}
          {onOpenJoinModal && (
            <button
              onClick={onOpenJoinModal}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-full transition flex items-center gap-1 shadow-2xs font-medium cursor-pointer"
              title="輸入代碼加入其他活動或切換房間"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">換房/代碼</span>
              <span className="sm:hidden">換房</span>
            </button>
          )}

          {/* 我的名片 */}
          <button
            onClick={() => openDrawer(currentUser)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-sm font-medium"
          >
            <User className="w-3.5 h-3.5" />
            <span>我的名片</span>
          </button>

          {/* 活動後台按鈕（需管理員密鑰驗證） */}
          <button
            onClick={onOpenAdminModal}
            className={`hidden sm:flex text-xs ${
              isAdminUnlocked
                ? "bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-sm"
                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-amber-500/40"
            } px-2.5 py-1.5 rounded-full transition items-center gap-1 font-medium shadow-xs`}
            title={isAdminUnlocked ? "主辦後台管理（已解鎖）" : "活動主辦管理後台（需密鑰驗證）"}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isAdminUnlocked ? "管理後台 👑" : "主辦後台"}</span>
          </button>
        </div>
      </div>

      {/* 視圖切換導覽列 */}
      <div className="px-3 py-1.5 flex items-center justify-between gap-2 bg-slate-50/90 dark:bg-slate-900/60 border-t border-slate-100 dark:border-transparent">
        <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === "landing"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>活動首頁</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === "directory"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>目錄清單 ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === "graph"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>動態圖譜 ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hub")}
            className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === "hub"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>人脈存摺</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
          <span>點選同學名片可直接一鍵加 LINE / 瀏覽 LinkedIn / 寫私密備忘</span>
        </div>
      </div>
    </header>
  );
}
