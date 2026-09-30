"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { 
  downloadImage, 
  generateDigitalBusinessCard, 
  shareOrForwardCard 
} from "../lib/imageUtils";
import { 
  X, 
  MessageSquare, 
  ExternalLink, 
  Lock, 
  Check, 
  Download, 
  Share2, 
  CreditCard, 
  ZoomIn, 
  User,
  Sparkles 
} from "lucide-react";

export function ProfileDrawer() {
  const { selectedMember, closeDrawer, privateNotes, saveNote, currentEvent, showToast } = useNetwork();
  const [noteContent, setNoteContent] = useState("");
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  
  // 名片燈箱放大檢視狀態
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      setNoteContent(privateNotes[selectedMember.id] || "");
      setShowSavedFeedback(false);
      setIsLightboxOpen(false);
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

  // 下載名片（實體名片圖檔 或 自動生成的數位名片圖檔）
  const handleDownloadCard = async () => {
    try {
      setIsGeneratingCard(true);
      showToast("正在準備名片圖檔...");

      let targetUrl = selectedMember.businessCardUrl;
      if (!targetUrl) {
        // 自動以 Canvas 繪製專屬認證電子名片
        targetUrl = await generateDigitalBusinessCard(
          selectedMember,
          `${currentEvent.title} · ${currentEvent.cohort}`
        );
      }

      downloadImage(
        targetUrl,
        `${selectedMember.name}_${selectedMember.company}_名片.jpg`
      );
      showToast(`已成功下載 ${selectedMember.name} 的名片圖檔！✓`);
    } catch (err) {
      console.error(err);
      showToast("名片下載失敗，請重試！");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // 轉發 / 分享名片（LINE 與原生分享）
  const handleShareCard = async () => {
    try {
      let targetUrl = selectedMember.businessCardUrl;
      if (!targetUrl) {
        targetUrl = await generateDigitalBusinessCard(
          selectedMember,
          `${currentEvent.title} · ${currentEvent.cohort}`
        );
      }

      const res = await shareOrForwardCard(
        selectedMember,
        targetUrl,
        `${currentEvent.title} · ${currentEvent.cohort}`
      );

      if (res.method === "line_url") {
        showToast("已為您開啟 LINE 轉發分享窗口！");
      } else {
        showToast("已成功喚起名片分享！");
      }
    } catch (err) {
      console.error(err);
      showToast("轉發處理失敗，請重試！");
    }
  };

  const hasPhysicalCard = !!selectedMember.businessCardUrl;
  const isCardMode = selectedMember.mediaType === "card" || hasPhysicalCard;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity"
      />

      {/* 抽屜主體 */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[460px] bg-white dark:bg-slate-900 border-t sm:border-l border-slate-200 dark:border-slate-800 z-50 rounded-t-3xl sm:rounded-none p-5 flex flex-col justify-between shadow-2xl transition-all duration-300 max-h-[90vh] sm:max-h-full overflow-y-auto">
        <div className="space-y-4">
          {/* 頂部時空標籤與關閉按鈕 */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>認識場合：</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700/60">
                {currentEvent.title} · {currentEvent.cohort}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 實體名片展示區塊（若有上傳實體名片或選取名片模式） */}
          {hasPhysicalCard ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>實體名片掃描檔</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  <span>點擊圖片可放大檢視</span>
                </span>
              </div>

              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer shadow-md group"
              >
                <img
                  src={selectedMember.businessCardUrl}
                  alt={`${selectedMember.name} 的實體名片`}
                  className="w-full h-44 object-contain transition group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-2xs">
                  <ZoomIn className="w-4 h-4" />
                  <span>點擊全螢幕放大</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* 基本身分與頭像照片 */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0 border border-emerald-400/30">
              {selectedMember.avatarUrl ? (
                <img 
                  src={selectedMember.avatarUrl} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{selectedMember.surname}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedMember.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                  第 {selectedMember.group} 組 {selectedMember.role === "組長" ? "· 組長" : ""}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                {selectedMember.company} · {selectedMember.title}
              </p>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {selectedMember.industry}
              </span>
            </div>
          </div>

          {/* 核心新功能：名片下載與轉發動作快捷條 */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              onClick={handleDownloadCard}
              disabled={isGeneratingCard}
              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{hasPhysicalCard ? "下載實體名片" : "下載數位名片"}</span>
            </button>

            <button
              onClick={handleShareCard}
              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>轉發名片至 LINE</span>
            </button>
          </div>

          {/* 資源合作 Offer & Seek */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                💎 能提供的資源 (Offer)：
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedMember.offer}</p>
            </div>
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-sky-600 dark:text-sky-400 font-semibold block mb-1">
                🎯 正在尋找的合作 (Seek)：
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedMember.seek}</p>
            </div>
          </div>

          {/* 私密備忘錄 (僅自己可見) */}
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>我的專屬私密備忘錄</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-normal">(僅自己可見)</span>
              </span>
              {showSavedFeedback && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
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
              className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* 底部聯繫按鈕 */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-4">
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
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>查看 LinkedIn</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            點擊將直接開啟外部通訊工具，維護隱私與高效連結
          </p>
        </div>
      </div>

      {/* 名片全螢幕燈箱放大 Modal */}
      {isLightboxOpen && selectedMember.businessCardUrl && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between text-white pb-2">
              <span className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{selectedMember.name} 的實體名片全圖</span>
              </span>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <img
              src={selectedMember.businessCardUrl}
              alt="名片放大"
              className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-700 bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDownloadCard}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>儲存名片至相簿</span>
              </button>
              <button
                onClick={handleShareCard}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>轉發至 LINE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
