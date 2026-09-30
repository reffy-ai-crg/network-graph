"use client";

import React from "react";
import { useNetwork } from "../context/NetworkContext";
import { User, Edit3, ArrowRight, PlusCircle, CheckCircle2, StickyNote, Users } from "lucide-react";

interface MyHubViewProps {
  onOpenEditModal: () => void;
  onOpenAdminModal: () => void;
}

export function MyHubView({ onOpenEditModal, onOpenAdminModal }: MyHubViewProps) {
  const { currentUser, events, currentEvent, switchEvent, privateNotes, showToast } = useNetwork();

  const totalNotesCount = Object.keys(privateNotes).length;

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* 個人主名片卡 (Single Source of Truth) */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currentUser.surname}
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
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{events.length}</div>
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

      {/* 歷次活動人脈空間清單 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>我的活動人脈庫 (歷次認識時空情境)</span>
          </h3>
          <button
            onClick={onOpenAdminModal}
            className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>發起新活動房</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {events.map((evt) => {
            const isCurrent = evt.id === currentEvent.id;

            return (
              <div
                key={evt.id}
                onClick={() => switchEvent(evt.id)}
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

                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span>{isCurrent ? "已在房內" : "進入名冊"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
