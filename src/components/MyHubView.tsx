"use client";

import React from "react";
import { useNetwork } from "../context/NetworkContext";
import { User, Edit3, ArrowRight, PlusCircle, CheckCircle2, StickyNote, Users } from "lucide-react";

interface MyHubViewProps {
  onOpenEditModal: () => void;
}

export function MyHubView({ onOpenEditModal }: MyHubViewProps) {
  const { currentUser, events, currentEvent, switchEvent, privateNotes, showToast } = useNetwork();

  const totalNotesCount = Object.keys(privateNotes).length;

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* 個人主名片卡 (Single Source of Truth) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-bold text-emerald-400">
                {currentUser.surname}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>全局已同步</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
                {currentUser.company} · {currentUser.title}
              </p>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>🆔 LINE: {currentUser.lineId}</span>
                <span>•</span>
                <span className="text-emerald-400/90">{currentUser.industry}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>更新個人現職與名片</span>
          </button>
        </div>

        {/* 人脈存摺累計指標 */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xl font-bold text-white font-mono">{events.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">參加活動房</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xl font-bold text-emerald-400 font-mono">155</div>
            <div className="text-[11px] text-slate-400 mt-0.5">累計認識人脈</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xl font-bold text-sky-400 font-mono">{totalNotesCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">已寫私密筆記</div>
          </div>
        </div>
      </div>

      {/* 歷次活動人脈空間清單 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>我的活動人脈庫 (歷次認識時空情境)</span>
          </h3>
          <button
            onClick={() => showToast("已開啟新活動房建立精靈！支援一鍵產生專屬邀請海報與 QR Code")}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
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
                    ? "bg-slate-900/80 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrent ? "bg-emerald-400" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white">
                      {evt.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {evt.cohort}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                        檢視中
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    認識時間：{evt.date} • 我的身分：{evt.userRole} • 全場共 {evt.totalMembers} 人
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0">
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
