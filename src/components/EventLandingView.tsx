"use client";

import React, { useMemo } from "react";
import { useNetwork } from "../context/NetworkContext";
import { 
  Sparkles, 
  Users, 
  Layers, 
  Building2, 
  Share2, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Grid, 
  Network, 
  CreditCard, 
  BookMarked, 
  ShieldCheck, 
  Calendar,
  ChevronRight,
  ExternalLink,
  Edit3,
  KeyRound
} from "lucide-react";
import { INDUSTRIES } from "../lib/mockData";

interface EventLandingViewProps {
  onOpenOnboardingModal: () => void;
  onOpenEditModal: () => void;
  onOpenAdminModal?: () => void;
  onOpenJoinModal?: () => void;
}

export function EventLandingView({
  onOpenOnboardingModal,
  onOpenEditModal,
  onOpenAdminModal,
  onOpenJoinModal
}: EventLandingViewProps) {
  const { 
    currentEvent, 
    members, 
    currentUser, 
    setActiveTab, 
    showToast, 
    openDrawer
  } = useNetwork();

  const isUserJoined = useMemo(() => {
    return members.some((m) => m.isCurrentUser);
  }, [members]);

  const currentUserMember = useMemo(() => {
    return members.find((m) => m.isCurrentUser);
  }, [members]);

  const allIndustries = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.industry) set.add(m.industry);
    });
    return Array.from(set);
  }, [members]);

  const recentMembers = useMemo(() => {
    return members.slice(0, 10);
  }, [members]);

  const handleShare = () => {
    const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
    const inviteUrl = `${liffBaseUrl}?event=${currentEvent.slug || "aia"}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      showToast(`已複製專屬邀請連結！可直接分享給同學：\n${inviteUrl}`);
    } else {
      showToast(`邀請連結：${inviteUrl}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 核心主視覺 (Hero Cover) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-emerald-950/20">
        {/* 背景裝飾光暈 */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-5 max-w-3xl">
          {/* 活動標籤 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 border border-white/25">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>活動專屬人脈空間</span>
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/40 rounded-full text-[11px] text-emerald-200 border border-emerald-400/30 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              <span>{currentEvent.date || "2026"} · {currentEvent.cohort}</span>
            </span>
            {currentEvent.isDemoMode === false ? (
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-100 rounded-full text-[11px] border border-emerald-400/40 font-semibold">
                🌱 純淨真實名冊
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-200 rounded-full text-[11px] border border-amber-400/40 font-semibold">
                示範模式 (55位虛擬)
              </span>
            )}
          </div>

          {/* 活動大標題與介紹 */}
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {currentEvent.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 mt-2 font-medium leading-relaxed max-w-2xl">
              跨界人脈網絡圖譜與數位名片存摺 · 專屬為本期同學、導師與助教打造的即時人脈互動平台。
            </p>
          </div>

          {/* 核心行動按鈕區 (CTA) */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!isUserJoined ? (
              <button
                onClick={onOpenOnboardingModal}
                className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 transition group-hover:scale-110" />
                <span>✨ 立即登記名片，進駐班級名冊</span>
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => setActiveTab("directory")}
                  className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <span>進入班級名冊清單 ➔</span>
                </button>
                <button
                  onClick={onOpenEditModal}
                  className="px-4 py-3.5 bg-emerald-800/60 hover:bg-emerald-800/80 text-white rounded-2xl text-xs sm:text-sm font-bold border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>修改名片資料</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab("graph")}
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span>探索全班關係圖譜</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-3.5 bg-black/20 hover:bg-black/30 active:scale-98 text-emerald-200 hover:text-white rounded-2xl text-xs sm:text-sm font-medium border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="複製專屬邀請連結"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">邀請同學</span>
            </button>
          </div>

          {/* 若已就位提示小條 */}
          {isUserJoined && currentUserMember && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 border border-emerald-400/40 rounded-xl text-xs text-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                您已成功進駐 <strong>第 {currentUserMember.group || 9} 組</strong>（{currentUserMember.role || "一般學員"}）
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 即時數據指標看板 (3 大核心數據) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        <div 
          onClick={() => setActiveTab("directory")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition flex items-center">
              查看名冊 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {members.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            位已進駐夥伴
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("directory")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center">
              組別分組 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {currentEvent.totalGroups || 30}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            個專案小組
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("directory")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition flex items-center">
              產業分類 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {Math.max(allIndustries.length, 1)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            跨界產業領域
          </div>
        </div>
      </div>

      {/* 已就位夥伴縮圖預覽牆 (Avatar Stack Preview) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>👥 已就位夥伴名單</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                共 {members.length} 人
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              點選任意名片可直接查看其專長、需求與交換 LINE 聯繫方式
            </p>
          </div>
          <button
            onClick={() => setActiveTab("directory")}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <span>查看完整名冊</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 成員卡片水平排列 */}
        {recentMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => openDrawer(m)}
                className="p-3 bg-slate-50 dark:bg-slate-950/80 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    m.surname
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {m.name}
                    </span>
                    {m.isCurrentUser && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 font-bold shrink-0">
                        我
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 shrink-0">
                      第 {m.group || 9} 組
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {m.company} · {m.title}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                    {m.industry}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            目前名冊尚無成員，歡迎點擊上方「立即登記名片」成為第一位進駐夥伴！
          </div>
        )}
      </div>

      {/* 活動人脈特色卡片 (3 大核心優勢) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">數位名片與 LINE 互換</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            告別紙本名片遺失窘境，支援一鍵加 LINE 好友、LinkedIn 連結與專屬私密備忘錄。
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">動態關係網絡圖譜</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            透過力導向物理圖譜，直觀探索同組同行、跨界產業人脈集群與潛在合作夥伴。
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">封閉房間與隱私保護</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            僅限持有專屬邀請連結的同學與社友進入，可設置入房密碼，資料安全有保障。
          </p>
        </div>
      </div>

      {/* 底部代碼換房與跨活動入口 */}
      {onOpenJoinModal && (
        <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                參加了其他活動？輸入專屬代碼快速換房
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                持有其他主辦單位提供的專屬代碼（如：the-rotary、aia-12），即可快速跨房參與
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenJoinModal}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold transition shrink-0 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>輸入活動代碼通關</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
