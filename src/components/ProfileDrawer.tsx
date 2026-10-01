"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNetwork } from "../context/NetworkContext";
import { 
  downloadImage, 
  generateDigitalBusinessCard, 
  shareOrForwardCard,
  compressImage
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
  Camera,
  Upload,
  Edit3,
  Sparkles 
} from "lucide-react";

interface ProfileDrawerProps {
  onOpenEditModal?: () => void;
}

export function ProfileDrawer({ onOpenEditModal }: ProfileDrawerProps) {
  const { 
    selectedMember, 
    closeDrawer, 
    privateNotes, 
    saveNote, 
    currentEvent, 
    showToast,
    currentUser,
    updateCurrentUserProfile 
  } = useNetwork();

  const [noteContent, setNoteContent] = useState("");
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; type: "card" | "avatar" } | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const cardInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedMember) {
      setNoteContent(privateNotes[selectedMember.id] || "");
      setShowSavedFeedback(false);
      setLightboxImage(null);
    }
  }, [selectedMember, privateNotes]);

  if (!selectedMember) return null;

  const isSelf = selectedMember.id === currentUser.id || selectedMember.isCurrentUser;
  // 若為自己，以最新的 currentUser 為準
  const displayMember = isSelf ? currentUser : selectedMember;

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    saveNote(displayMember.id, val);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 1500);
  };

  const handleLineClick = () => {
    showToast(`已複製 ${displayMember.name} 的 LINE ID (${displayMember.lineId})，準備開啟 LINE App！`);
  };

  const handleLinkedInClick = () => {
    showToast(`正在開啟 ${displayMember.name} 的 LinkedIn 檔案...`);
    window.open(displayMember.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  // 下載名片（實體名片圖檔 或 自動生成的數位名片圖檔）
  const handleDownloadCard = async () => {
    try {
      setIsGeneratingCard(true);
      showToast("正在準備名片圖檔...");

      let targetUrl = displayMember.businessCardUrl;
      if (!targetUrl) {
        targetUrl = await generateDigitalBusinessCard(
          displayMember,
          `${currentEvent.title} · ${currentEvent.cohort}`
        );
      }

      downloadImage(
        targetUrl,
        `${displayMember.name}_${displayMember.company}_名片.jpg`
      );
      showToast(`已成功下載 ${displayMember.name} 的名片圖檔！✓`);
    } catch (err) {
      console.error(err);
      showToast("名片下載失敗，請重試！");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // 下載個人形象照片
  const handleDownloadPhoto = () => {
    if (!displayMember.avatarUrl) return;
    downloadImage(
      displayMember.avatarUrl,
      `${displayMember.name}_個人照片.jpg`
    );
    showToast(`已成功下載 ${displayMember.name} 的個人照片！✓`);
  };

  // 轉發 / 分享名片（LINE 與原生分享）
  const handleShareCard = async () => {
    try {
      let targetUrl = displayMember.businessCardUrl;
      if (!targetUrl) {
        targetUrl = await generateDigitalBusinessCard(
          displayMember,
          `${currentEvent.title} · ${currentEvent.cohort}`
        );
      }

      const res = await shareOrForwardCard(
        displayMember,
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

  // 抽屜內直接快速上傳個人照片
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("正在壓縮並上傳個人照片...");
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      updateCurrentUserProfile({
        avatarUrl: compressed,
        mediaType: "avatar",
      });
      showToast("個人照片上傳成功，已全局即時同步！✓");
    } catch (err) {
      console.error(err);
      showToast("照片上傳失敗，請重試！");
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // 抽屜內直接快速上傳實體名片
  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      showToast("正在壓縮並上傳實體紙本名片...");
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      updateCurrentUserProfile({
        businessCardUrl: compressed,
        mediaType: "card",
      });
      showToast("實體名片上傳成功，全班同學現已可查看與下載！✓");
    } catch (err) {
      console.error(err);
      showToast("名片上傳失敗，請重試！");
    } finally {
      setIsUploading(false);
      if (cardInputRef.current) cardInputRef.current.value = "";
    }
  };

  const hasPhysicalCard = !!displayMember.businessCardUrl;

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

          {/* 若為自己檢視名片：顯示明確的「編輯與上傳」提醒橫幅 */}
          {isSelf && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    這是您的個人名片
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    可隨時上傳個人照、名片或修改現職資料
                  </div>
                </div>
              </div>
              {onOpenEditModal && (
                <button
                  onClick={onOpenEditModal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>編輯資料</span>
                </button>
              )}
            </div>
          )}

          {/* 實體名片展示區塊 */}
          {hasPhysicalCard ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>實體紙本名片</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  <span>點擊名片放大全螢幕</span>
                </span>
              </div>

              <div 
                onClick={() => setLightboxImage({ url: displayMember.businessCardUrl!, title: `${displayMember.name} 的實體名片`, type: "card" })}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer shadow-md group"
              >
                <img
                  src={displayMember.businessCardUrl}
                  alt={`${displayMember.name} 的實體名片`}
                  className="w-full h-44 object-contain transition group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-2xs">
                  <ZoomIn className="w-4 h-4" />
                  <span>點擊全螢幕放大名片</span>
                </div>
              </div>
            </div>
          ) : isSelf ? (
            /* 若自己尚未上傳名片：顯示直接拍照上傳的醒目引導卡片 */
            <div 
              onClick={() => cardInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/50 hover:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span>點此拍照或上傳您的實體紙本名片</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                支援手機拍照，上傳後全班同學可直接一鍵查看與下載
              </span>
            </div>
          ) : null}

          {/* 個人形象大照展示區塊 */}
          {displayMember.avatarUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>個人形象照片 / 生活照</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  <span>點擊照片放大全螢幕</span>
                </span>
              </div>

              <div 
                onClick={() => setLightboxImage({ url: displayMember.avatarUrl!, title: `${displayMember.name} 的個人照片`, type: "avatar" })}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer shadow-md group h-64 sm:h-72 flex items-center justify-center"
              >
                <img
                  src={displayMember.avatarUrl}
                  alt={`${displayMember.name} 的個人照片`}
                  className="w-full h-full object-contain transition group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-2xs">
                  <ZoomIn className="w-4 h-4" />
                  <span>點擊全螢幕放大照片</span>
                </div>
              </div>
            </div>
          ) : isSelf ? (
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/50 hover:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                點此拍照或上傳您的個人形象照
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                建議上傳清楚生活照或專業肖像，方便全班同學認得您！
              </span>
            </div>
          ) : null}

          {/* 基本身分與頭像照片 */}
          <div className="flex items-start gap-4">
            <div 
              onClick={() => {
                if (displayMember.avatarUrl) {
                  setLightboxImage({ url: displayMember.avatarUrl, title: `${displayMember.name} 的個人照片`, type: "avatar" });
                } else if (isSelf) {
                  avatarInputRef.current?.click();
                }
              }}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg shrink-0 border-2 border-emerald-400/40 relative cursor-pointer group"
              title={displayMember.avatarUrl ? "點擊放大查看大圖" : isSelf ? "點擊上傳個人形象照" : undefined}
            >
              {displayMember.avatarUrl ? (
                <img 
                  src={displayMember.avatarUrl} 
                  alt={displayMember.name} 
                  className="w-full h-full object-cover transition group-hover:scale-105" 
                />
              ) : (
                <span>{displayMember.surname}</span>
              )}

              {/* 放大鏡提示 */}
              {displayMember.avatarUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6 drop-shadow" />
                </div>
              )}

              {isSelf && !displayMember.avatarUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              )}

              {displayMember.avatarUrl && (
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs rounded-md p-0.5 text-white/90 shadow-xs">
                  <ZoomIn className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {displayMember.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                  第 {displayMember.group} 組 {displayMember.role && displayMember.role !== "學員" ? `· ${displayMember.role}` : ""}
                </span>
                {isSelf && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
                    我自己
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                {displayMember.company} · {displayMember.title}
              </p>
              <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {displayMember.industry}
              </span>
            </div>
          </div>

          {/* 核心動作按鈕列 */}
          {isSelf ? (
            /* 針對自己：明確提供「上傳/更換照片」與「上傳/更換名片」按鈕！ */
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>名片與照片管理 (二選一或同時維護)：</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 上傳/更換照片</span>
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => cardInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>📇 上傳/更換名片</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={handleDownloadCard}
                  disabled={isGeneratingCard}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>下載我的名片</span>
                </button>

                <button
                  onClick={handleShareCard}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>轉發名片至 LINE</span>
                </button>
              </div>
            </div>
          ) : (
            /* 針對同學：顯示下載與轉發名片 */
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
          )}

          {/* 資源合作 Offer & Seek */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                💎 能提供的資源 (Offer)：
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{displayMember.offer}</p>
            </div>
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-sky-600 dark:text-sky-400 font-semibold block mb-1">
                🎯 正在尋找的合作 (Seek)：
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{displayMember.seek}</p>
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

      {/* 隱藏的快速照片與名片上傳 input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />
      <input
        ref={cardInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCardUpload}
      />

      {/* 全螢幕大圖燈箱放大 Modal (名片或照片通用) */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between text-white pb-2 border-b border-slate-800">
              <span className="text-sm font-bold flex items-center gap-2">
                {lightboxImage.type === "card" ? (
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Camera className="w-4 h-4 text-emerald-400" />
                )}
                <span>{lightboxImage.title}</span>
              </span>
              <button 
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                title="關閉"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-700 bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              {lightboxImage.type === "card" ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    onClick={handleDownloadPhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>儲存原圖照片至相簿</span>
                  </button>
                  <button
                    onClick={handleShareCard}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>轉發名片資訊至 LINE</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
