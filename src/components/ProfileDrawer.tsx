"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { X, MessageSquare, ExternalLink, Lock, Check } from "lucide-react";

export function ProfileDrawer() {
  const { selectedMember, closeDrawer, privateNotes, saveNote, currentEvent, showToast } = useNetwork();
  const [noteContent, setNoteContent] = useState("");
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      setNoteContent(privateNotes[selectedMember.id] || "");
      setShowSavedFeedback(false);
    }
  }, [selectedMember, privateNotes]);

  if (!selectedMember) return null;

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    saveNote(selectedMember.id, val);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 1500);
  };

  const handleLineClick = () => {
    showToast(`已複製 ${selectedMember.name} 的 LINE ID (${selectedMember.lineId})，準備開啟 LINE App！`);
  };

  const handleLinkedInClick = () => {
    showToast(`正在開啟 ${selectedMember.name} 的 LinkedIn 檔案...`);
    window.open(selectedMember.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity"
      />

      {/* 抽屜主體 */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] bg-slate-900 border-t sm:border-l border-slate-800 z-50 rounded-t-3xl sm:rounded-none p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 max-h-[88vh] sm:max-h-full overflow-y-auto">
        <div className="space-y-4">
          {/* 頂部時空標籤與關閉按鈕 */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>認識場合：</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/60">
                {currentEvent.title} · {currentEvent.cohort}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 頭像與基本身分職位 */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
              {selectedMember.surname}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedMember.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  第 {selectedMember.group} 組 {selectedMember.role === "組長" ? "· 組長" : ""}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {selectedMember.company} · {selectedMember.title}
              </p>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedMember.industry}
              </span>
            </div>
          </div>

          {/* 資源合作 Offer & Seek */}
          <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-emerald-400 font-semibold block mb-1">
                💎 能提供的資源 (Offer)：
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedMember.offer}</p>
            </div>
            <div className="pt-2.5 border-t border-slate-800/80">
              <span className="text-sky-400 font-semibold block mb-1">
                🎯 正在尋找的合作 (Seek)：
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedMember.seek}</p>
            </div>
          </div>

          {/* 私密備忘錄 (僅自己可見) */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>我的專屬私密備忘錄</span>
                <span className="text-[10px] text-amber-400/80 font-normal">(僅自己可見)</span>
              </span>
              {showSavedFeedback && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>已自動儲存</span>
                </span>
              )}
            </div>
            <textarea
              value={noteContent}
              onChange={handleNoteChange}
              rows={3}
              placeholder="例如：課堂散會聊過，他想替公司做瑕疵檢測 POC，約好下週三下午線上討論..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* 底部聯繫按鈕 */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleLineClick}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>加 LINE 好友</span>
            </button>
            <button
              onClick={handleLinkedInClick}
              className="w-full py-2.5 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>查看 LinkedIn</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500">
            點擊將直接開啟外部通訊工具，維護隱私與高效連結
          </p>
        </div>
      </div>
    </>
  );
}
