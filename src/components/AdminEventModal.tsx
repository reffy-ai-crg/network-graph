"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { EventSpace } from "../types/network";
import { 
  X, 
  Settings, 
  PlusCircle, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Lock,
  Layers
} from "lucide-react";

interface AdminEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminEventModal({ isOpen, onClose }: AdminEventModalProps) {
  const { 
    currentEvent, 
    events, 
    updateEventSettings, 
    createNewEvent, 
    toggleEventDemoMode, 
    members, 
    showToast 
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<"edit" | "create" | "share">("edit");
  const [copied, setCopied] = useState(false);

  // 編輯當前活動表單狀態
  const [title, setTitle] = useState(currentEvent.title);
  const [cohort, setCohort] = useState(currentEvent.cohort);
  const [slug, setSlug] = useState(currentEvent.slug || "aia-12");
  const [totalGroups, setTotalGroups] = useState(currentEvent.totalGroups || 8);
  const [date, setDate] = useState(currentEvent.date || "2026/03");
  const [passcode, setPasscode] = useState(currentEvent.passcode || "");
  const [isDemo, setIsDemo] = useState(currentEvent.isDemoMode ?? true);

  // 建立新活動表單狀態
  const [newTitle, setNewTitle] = useState("");
  const [newCohort, setNewCohort] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newGroups, setNewGroups] = useState(8);
  const [newPasscode, setNewPasscode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(currentEvent.title);
      setCohort(currentEvent.cohort);
      setSlug(currentEvent.slug || "aia-12");
      setTotalGroups(currentEvent.totalGroups || 8);
      setDate(currentEvent.date || "2026/03");
      setPasscode(currentEvent.passcode || "");
      setIsDemo(currentEvent.isDemoMode ?? true);
    }
  }, [isOpen, currentEvent]);

  if (!isOpen) return null;

  const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
  const inviteUrl = `${liffBaseUrl}?event=${currentEvent.slug}`;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventSettings(currentEvent.id, {
      title: title.trim(),
      cohort: cohort.trim(),
      slug: slug.trim().toLowerCase(),
      totalGroups: Number(totalGroups),
      date,
      passcode: passcode.trim(),
      isDemoMode: isDemo,
    });
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      showToast("請填寫活動名稱與專屬代碼 (Slug)");
      return;
    }

    const created = createNewEvent({
      title: newTitle.trim(),
      cohort: newCohort.trim() || "第一期",
      slug: newSlug.trim().toLowerCase(),
      totalGroups: Number(newGroups),
      date: new Date().toISOString().slice(0, 7).replace("-", "/"),
      passcode: newPasscode.trim(),
      isDemoMode: false, // 新開活動預設為乾淨的真實空房
    });

    setNewTitle("");
    setNewCohort("");
    setNewSlug("");
    setActiveTab("share");
  };

  const copyInviteText = () => {
    const text = `邀請你加入「${currentEvent.title} · ${currentEvent.cohort}」專屬人脈關係圖譜！\n點擊直接在 LINE 開啟並填寫名片：\n${inviteUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("已複製專屬 LINE 邀請文字！可直接貼到大群組中發布 ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 頂部標題與關閉按鈕 */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">活動主辦管理後台 (Admin Panel)</h3>
              <p className="text-[11px] text-slate-400">自訂活動名稱、組別數量、模式切換與專屬邀請碼</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 分頁切換 Tab */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "edit"
                ? "border-emerald-500 text-emerald-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>目前活動設定</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "create"
                ? "border-emerald-500 text-emerald-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>開新活動房</span>
          </button>

          <button
            onClick={() => setActiveTab("share")}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "share"
                ? "border-emerald-500 text-emerald-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>專屬邀請與連結</span>
          </button>
        </div>

        {/* 內容區塊 */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: 編輯當前活動 */}
          {activeTab === "edit" && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* 核心切換：展示模式 vs 真實學員模式 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">名冊資料模式</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isDemo ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {isDemo ? "52位示範人物 (Demo)" : "純淨真實模式 (Live)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isDemo 
                    ? "目前載入全班 52 位示範企業主管（台積電、微軟、金控等），適合用於對外演講展示效果。"
                    : "目前已清空虛擬示範名單，僅保留真實掃碼加入的學員（適合正式場合使用）。"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isDemo;
                    setIsDemo(nextMode);
                    toggleEventDemoMode(currentEvent.id, nextMode);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium transition"
                >
                  {isDemo ? "👉 切換為【純淨真實模式】（清空虛擬名單）" : "👉 切換回【52人示範展示模式】"}
                </button>
              </div>

              {/* 活動基本資料 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">活動/課程全名</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">梯次 / 期別標籤</label>
                    <input
                      type="text"
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      placeholder="如: 經理人班第12期"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">分組數量 (組別總數)</label>
                    <select
                      value={totalGroups}
                      onChange={(e) => setTotalGroups(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20].map((num) => (
                        <option key={num} value={num}>
                          {num} 個組別
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">活動專屬代碼 (Slug)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="如: aia-12, aws-2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">入房通行密碼 (選填)</label>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="留空表示免密碼"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition"
                >
                  儲存並更新雲端資料庫
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: 開新活動房 */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateNew} className="space-y-3.5">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3.5 text-emerald-300 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>建立新活動房後，系統會自動生成獨立的專屬連結與密碼，你可以將其作為讀書會、企業內訓或技術年會的人脈空間。</span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">新活動名稱 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：2026 台大 EMBA 科技創新論壇"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">期別 / 梯次</label>
                  <input
                    type="text"
                    value={newCohort}
                    onChange={(e) => setNewCohort(e.target.value)}
                    placeholder="如: 秋季班、台北場"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">預計分組數量</label>
                  <select
                    value={newGroups}
                    onChange={(e) => setNewGroups(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} 個組別
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">專屬英文代碼 (Slug) *</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="如: emba-2026, pycon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">入房通行密碼 (選填)</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="留空表示免密碼"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>立即建立新活動房</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: 專屬邀請與連結 */}
          {activeTab === "share" && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">當前活動：</span>
                  <span className="text-sm font-bold text-white">{currentEvent.title} · {currentEvent.cohort}</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">📲 官方 LINE 專屬邀請網址：</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[11px] font-mono text-emerald-400 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteUrl);
                        showToast("已複製專屬 LIFF 連結！");
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shrink-0 font-medium transition"
                    >
                      複製
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">🌐 一般電腦瀏覽器網址：</label>
                  <input
                    type="text"
                    readOnly
                    value={`https://network-graph-jomubd79u-reffy-ai-crg.vercel.app/?event=${currentEvent.slug}`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[11px] font-mono text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <span className="font-semibold text-slate-200 block">💬 LINE 班級發布專用文案：</span>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  {`各位同學好！為了方便散會後大家依然能保持聯繫、深入了解彼此在知名企業的背景與合作資源，我們啟用了專屬的「人脈關係圖」！\n點擊下方連結即可直接以 LINE 免密碼加入並建立名片：\n${inviteUrl}`}
                </p>
                <button
                  onClick={copyInviteText}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "已成功複製！" : "一鍵複製完整推薦文案"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
