"use client";

import React from "react";
import { useNetwork } from "../context/NetworkContext";
import { User, Edit3, ArrowRight, PlusCircle, CheckCircle2, StickyNote, Users, Grid, Sparkles } from "lucide-react";

interface MyHubViewProps {
  onOpenEditModal: () => void;
  onOpenAdminModal: () => void;
  onOpenJoinModal?: () => void;
}

export function MyHubView({ onOpenEditModal, onOpenAdminModal, onOpenJoinModal }: MyHubViewProps) {
  const { 
    currentUser, 
    myJoinedEvents, 
    currentEvent, 
    switchEvent, 
    privateNotes, 
    showToast,
    members,
    setActiveTab,
    openDrawer,
    isAdminUnlocked
  } = useNetwork();

  const totalNotesCount = Object.keys(privateNotes).length;

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* 個人主名片卡 (Single Source of Truth) */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0 overflow-hidden">
              <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.surname
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>全局已同步</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                {currentUser.company} · {currentUser.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>🆔 LINE: {currentUser.lineId}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentUser.industry}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>更新個人現職與名片</span>
          </button>
        </div>

        {/* 人脈存摺累計指標 */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{myJoinedEvents.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">參加活動房</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">155</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">累計認識人脈</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">{totalNotesCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">已寫私密筆記</div>
          </div>
        </div>
      </div>

      {/* 全班名冊快捷導覽列 (清楚引導查看 52 人) */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>目前【{currentEvent.title}】共有 {members.length} 位同學已在線！</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              包含真實大頭貼照片、公司、職稱、LINE 與 1~50 組分組，點擊立即開啟完整互動名冊
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("directory")}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Grid className="w-4 h-4" />
            <span>全班名冊 ({members.length}人)</span>
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>動態關係圖譜</span>
          </button>
        </div>
      </div>

      {/* 歷次活動人脈空間清單 (嚴格隔離僅限本人參與過的活動) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>我的活動人脈庫 (已加入 {myJoinedEvents.length} 場)</span>
          </h3>
          <div className="flex items-center gap-2">
            {onOpenJoinModal && (
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1 transition bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-1 rounded-xl"
              >
                <span>+ 輸入代碼換房</span>
              </button>
            )}
            {isAdminUnlocked && (
              <button
                onClick={onOpenAdminModal}
                className="text-xs text-amber-600 hover:text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1 transition"
              >
                <span>主辦後台 👑</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {myJoinedEvents.map((evt) => {
            const isCurrent = evt.id === currentEvent.id || evt.slug === currentEvent.slug;

            return (
              <div
                key={evt.id}
                onClick={() => {
                  switchEvent(evt.id);
                  setActiveTab("directory");
                }}
                className={`border rounded-2xl p-4 flex items-center justify-between transition cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-50/50 dark:bg-slate-900/80 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrent ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {evt.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {evt.cohort}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                        檢視中
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    認識時間：{evt.date} • 我的身分：{evt.userRole} • 全場共 {evt.totalMembers} 人
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    switchEvent(evt.id);
                    setActiveTab("directory");
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <span>查看名片 ({members.length}人)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {myJoinedEvents.length === 1 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-2">
              ✨ 您已加入「{currentEvent.title}」。未來若使用本 LINE 帳號參與其他班級或社團，跨活動人脈將自動彙整於此。
            </p>
          )}
        </div>
      </div>

      {/* 本活動房全體同學名冊預覽 (讓人脈存摺內直接看到所有人！) */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              【{currentEvent.title}】同班夥伴即時名冊 ({members.length} 位)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("directory")}
            className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1 transition"
          >
            <span>切換至完整目錄過濾</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.slice(0, 12).map((m) => (
            <div
              key={m.id}
              onClick={() => openDrawer(m)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-center gap-3 shadow-xs group"
            >
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-105 transition">
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{m.surname}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ${
                    m.role?.includes("導師") || m.role?.includes("講師") || m.role === "講師"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30"
                      : m.role?.includes("助教") || m.role === "助教"
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-500/30"
                      : m.role?.includes("社長") || m.role?.includes("組長") || m.role?.includes("會長") || m.role?.includes("幹部")
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-500/30"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                  }`}>
                    {m.group === 0 ? "🎓 巡迴" : `第 ${m.group} 組`}
                    {m.role && m.role !== "一般學員" && m.role !== "學員" ? ` · ${m.role === "講師" ? "導師" : m.role === "助教" ? "助教" : m.role}` : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{m.company}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{m.title}</p>
              </div>
            </div>
          ))}
        </div>

        {members.length > 12 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setActiveTab("directory")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-md transition inline-flex items-center gap-2"
            >
              <span>查看全班全部 {members.length} 位同學完整名片名冊</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
