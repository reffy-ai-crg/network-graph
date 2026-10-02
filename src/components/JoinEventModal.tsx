"use client";

import React, { useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { X, KeyRound, ArrowRight, Check, History, Shield, Lock } from "lucide-react";

interface JoinEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminModal?: () => void;
  onOpenApplyModal?: () => void;
  onJoinedSuccess?: () => void;
}

export function JoinEventModal({
  isOpen,
  onClose,
  onOpenAdminModal,
  onOpenApplyModal,
  onJoinedSuccess,
}: JoinEventModalProps) {
  const { 
    currentEvent, 
    myJoinedEvents, 
    switchEvent, 
    joinEventByCode, 
    showToast,
    isAdminUnlocked
  } = useNetwork();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg("請輸入活動代碼！");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await joinEventByCode(code.trim());
      if (res.success) {
        showToast(res.message);
        setCode("");
        onJoinedSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg("連線異常，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = (eventId: string, title: string) => {
    switchEvent(eventId);
    showToast(`已切換至「${title}」`);
    onJoinedSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* 頂部標題 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                切換或加入活動房間
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                持有專屬代碼即可快速通關，保障各活動商業隱私
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1 text-slate-800 dark:text-slate-200">
          {/* 第一區塊：輸入活動代碼通關 (Slido 模式) */}
          <div className="space-y-3">
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between">
              <span>🔑 輸入活動專屬代碼 (Event Code)</span>
              <span className="text-[10px] text-slate-400 font-normal">例如：the-rotary, aia-12</span>
            </label>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-bold">
                  #
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="輸入活動代碼 (如：the-rotary)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs sm:text-sm font-mono tracking-wide text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-2 rounded-xl">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? "驗證中..." : "立即進入此活動房"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* 第二區塊：我曾參加過的活動歷史 */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>我曾參與的活動空間 ({myJoinedEvents.length})</span>
              </div>
              <span className="text-[10px] text-slate-400">點擊直接切換</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {myJoinedEvents.map((evt) => {
                const isCurrent = evt.id === currentEvent.id || evt.slug === currentEvent.slug;

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (!isCurrent) handleQuickSwitch(evt.id, evt.title);
                    }}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500/40 shadow-2xs font-semibold"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-slate-900 dark:text-white font-medium">
                          {evt.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {evt.cohort}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        #{evt.slug}
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium shrink-0 flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        <span>目前在此</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0 hover:underline">
                        切換 ➔
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部說明與主辦入口 */}
          <div className="pt-2 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-start gap-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                每間活動皆為獨立封閉空間。如欲發起新活動，請聯絡活動管理員或輸入主辦密鑰進入後台。
              </span>
            </div>

            {onOpenAdminModal && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminModal();
                  }}
                  className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-medium transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>我是活動發起人？點此驗證並進入主辦後台</span>
                </button>
              </div>
            )}

            {onOpenApplyModal && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApplyModal();
                  }}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>🏢 想為自己的企業或社團開辦專屬房間？點此申請開通 ➔</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
