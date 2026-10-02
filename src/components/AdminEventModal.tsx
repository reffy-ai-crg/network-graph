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
  KeyRound, 
  Layers, 
  ShieldAlert, 
  Crown,
  Search
} from "lucide-react";
import { SCENARIO_TEMPLATES } from "../lib/mockData";

interface AdminEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminEventModal({ isOpen, onClose }: AdminEventModalProps) {
  const { 
    currentEvent, 
    events, 
    switchEvent,
    updateEventSettings, 
    createNewEvent, 
    toggleEventDemoMode, 
    members, 
    showToast,
    isAdminUnlocked,
    unlockAdmin,
    adminPin,
    updateAdminPin
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<"rooms" | "edit" | "create" | "share" | "pin">("rooms");
  const [copied, setCopied] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");

  const filteredEvents = React.useMemo(() => {
    if (!roomSearch.trim()) return events;
    const q = roomSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        (e.cohort && e.cohort.toLowerCase().includes(q))
    );
  }, [events, roomSearch]);

  // 密鑰解鎖表單
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // 變更管理密碼表單
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // 編輯當前活動表單狀態
  const [title, setTitle] = useState(currentEvent.title);
  const [cohort, setCohort] = useState(currentEvent.cohort);
  const [slug, setSlug] = useState(currentEvent.slug || "aia-12");
  const [totalGroups, setTotalGroups] = useState(currentEvent.totalGroups || 10);
  const [date, setDate] = useState(currentEvent.date || "2026/03");
  const [passcode, setPasscode] = useState(currentEvent.passcode || "");
  const [isDemo, setIsDemo] = useState(currentEvent.isDemoMode ?? true);
  const [customRoles, setCustomRoles] = useState<string[]>(
    currentEvent.customRoles || ["授課導師", "隨班助教", "組長幹部", "一般學員"]
  );
  const [roleInput, setRoleInput] = useState("");

  // 建立新活動表單狀態
  const [newTitle, setNewTitle] = useState("");
  const [newCohort, setNewCohort] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newGroups, setNewGroups] = useState(10);
  const [newPasscode, setNewPasscode] = useState("");
  const [newRoles, setNewRoles] = useState<string[]>([
    "授課導師", "隨班助教", "組長幹部", "一般學員"
  ]);
  const [newRoleInput, setNewRoleInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(currentEvent.title);
      setCohort(currentEvent.cohort);
      setSlug(currentEvent.slug || "aia-12");
      setTotalGroups(currentEvent.totalGroups || 10);
      setDate(currentEvent.date || "2026/03");
      setPasscode(currentEvent.passcode || "");
      setIsDemo(currentEvent.isDemoMode ?? true);
      setCustomRoles(currentEvent.customRoles || ["授課導師", "隨班助教", "組長幹部", "一般學員"]);
      setRoleInput("");
      setNewRoleInput("");
      setPinInput("");
      setPinError(false);
    }
  }, [isOpen, currentEvent]);

  if (!isOpen) return null;

  const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
  const inviteUrl = `${liffBaseUrl}?event=${currentEvent.slug}`;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput("");
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4) {
      showToast("管理密鑰長度至少需 4 碼！");
      return;
    }
    if (newPin !== confirmPin) {
      showToast("兩次輸入的密鑰不一致，請確認！");
      return;
    }
    updateAdminPin(newPin);
    setNewPin("");
    setConfirmPin("");
    setActiveTab("edit");
  };

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
      customRoles: customRoles,
    });
    showToast("活動設定與專屬身分角色已儲存！");
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      showToast("請填寫活動名稱與專屬代碼 (Slug)");
      return;
    }

    createNewEvent({
      title: newTitle.trim(),
      cohort: newCohort.trim() || "第一期",
      slug: newSlug.trim().toLowerCase(),
      totalGroups: Number(newGroups),
      date: new Date().toISOString().slice(0, 7).replace("-", "/"),
      passcode: newPasscode.trim(),
      isDemoMode: false,
      customRoles: newRoles,
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
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* 頂部標題與關閉按鈕 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              {isAdminUnlocked ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAdminUnlocked ? "活動主辦管理後台 (Admin Panel)" : "主辦人權限驗證"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAdminUnlocked ? "自訂活動名稱、組別數量、模式切換與專屬邀請碼" : "請輸入主辦密碼以啟用活動設定與開房功能"}
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

        {/* 尚未解鎖時：顯示主辦人密鑰驗證畫面 */}
        {!isAdminUnlocked ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                🔒 主辦人專屬管理密鑰 (Master Passcode)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                為防止一般參會學員誤改活動設定或隨意開房，主辦設定與開房權限受密鑰保護。
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3 max-w-xs mx-auto pt-2">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="輸入主辦密鑰 (預設: 888888)"
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                    pinError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 dark:border-slate-800"
                  } rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition`}
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-500 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>密鑰不正確，請重新輸入！</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>立即解鎖管理權限</span>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-400">
              💡 預設主辦密鑰為 <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">888888</span>，進入後可隨時更換。
            </div>
          </div>
        ) : (
          /* 已解鎖：顯示管理 Tabs 與內容 */
          <>
            {/* 分頁切換 Tab */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 px-4 text-xs font-medium overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("rooms")}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "rooms"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>房間總管 ({events.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("edit")}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "edit"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>目前活動設定</span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "create"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>開新活動房</span>
              </button>

              <button
                onClick={() => setActiveTab("share")}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "share"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>專屬邀請與連結</span>
              </button>

              <button
                onClick={() => setActiveTab("pin")}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "pin"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>變更密鑰</span>
              </button>
            </div>

            {/* 內容區塊 */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1 text-slate-800 dark:text-slate-200">
              {/* TAB 0: 房間總管 (搜尋、切換、管理全庫活動) */}
              {activeTab === "rooms" && (
                <div className="space-y-4">
                  {/* 搜尋與新增按鈕 */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="搜尋活動名稱、代碼 (Slug) 或期別..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1 shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ 開新房</span>
                    </button>
                  </div>

                  {/* 房間清單 */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredEvents.map((evt) => {
                      const isCurrent = evt.id === currentEvent.id || evt.slug === currentEvent.slug;
                      const roomInvite = `${liffBaseUrl}?event=${evt.slug}`;

                      return (
                        <div
                          key={evt.id}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                            isCurrent
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500/50 shadow-xs"
                              : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="truncate space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {evt.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {evt.cohort}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-medium">
                                  目前檢視
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                              <span>網址代碼: ?event={evt.slug}</span>
                              <span>•</span>
                              <span>{evt.totalGroups > 1 ? `${evt.totalGroups} 個組別` : "不分組交流"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(roomInvite);
                                showToast(`已複製「${evt.title}」專屬邀請網址！`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="複製專屬連結"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {!isCurrent ? (
                              <button
                                type="button"
                                onClick={() => {
                                  switchEvent(evt.id);
                                  showToast(`已切換至「${evt.title}」房間`);
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                              >
                                切換至此
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveTab("edit")}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-500 transition"
                              >
                                編輯設定
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredEvents.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        查無符合「{roomSearch}」的活動房間
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>💡 全系統目前共維護 {events.length} 間專屬活動房</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">每間房享有獨立專屬名冊與權限</span>
                  </div>
                </div>
              )}

              {/* TAB 1: 編輯當前活動 */}
              {activeTab === "edit" && (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  {/* 核心切換：展示模式 vs 真實學員模式 */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">名冊資料模式</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isDemo 
                          ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                      }`}>
                        {isDemo ? "55位示範人物 (Demo)" : "純淨真實模式 (0位虛擬人)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isDemo 
                        ? "目前載入全班 55 位示範企業主管（台積電、微軟、金控等），適合用於對外演講展示效果。"
                        : "目前已清空所有虛擬示範名單（0 位虛擬人），僅保留真實加入的學員與主辦，適合正式活動測試。"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = !isDemo;
                        setIsDemo(nextMode);
                        toggleEventDemoMode(currentEvent.id, nextMode);
                      }}
                      className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 font-medium transition"
                    >
                      {isDemo ? "👉 切換為【純淨真實模式】（清空虛擬名單）" : "👉 切換回【55人示範展示模式】"}
                    </button>
                  </div>

                  {/* 活動基本資料 */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">活動/課程全名</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">梯次 / 期別標籤</label>
                        <input
                          type="text"
                          value={cohort}
                          onChange={(e) => setCohort(e.target.value)}
                          placeholder="如: 經理人班第12期"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">分組數量 (組別總數)</label>
                        <select
                          value={totalGroups}
                          onChange={(e) => setTotalGroups(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value={0}>不需要分組（扶輪社 / 商會 / 年會 / 自由交流）</option>
                          <option value={1}>不需要分組（全體同一組）</option>
                          {Array.from({ length: 49 }, (_, i) => i + 2).map((num) => (
                            <option key={num} value={num}>
                              {num} 個組別
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">活動專屬代碼 (Slug)</label>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="如: aia-12, aws-2026"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">入房通行密碼 (選填)</label>
                        <input
                          type="text"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="留空表示免密碼"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>

                    {/* 活動專屬身分角色自訂與場景模板 */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                            活動專屬身分角色設定
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">共 {customRoles.length} 種身分</span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        自訂本活動房提供給學員選擇的身分角色。支援一鍵套用情境模板，亦可自行新增或刪減角色！
                      </p>

                      {/* 場景模板快捷按鈕 */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-medium">✨ 一鍵套用場合模板：</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {SCENARIO_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => {
                                setCustomRoles([...tmpl.defaultRoles]);
                                showToast(`已套用【${tmpl.name}】身分模板！`);
                              }}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="text-sm shrink-0">{tmpl.icon}</span>
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">{tmpl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 啟用的角色標籤膠囊清單 */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 block font-medium">🏷️ 本房間生效的身分角色（點擊 × 可移除）：</span>
                        <div className="flex flex-wrap gap-1.5">
                          {customRoles.map((roleName) => (
                            <span
                              key={roleName}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs"
                            >
                              <span>
                                {roleName.includes("導師") || roleName.includes("講師") || roleName.includes("講者") ? "👨‍🏫 " :
                                 roleName.includes("助教") ? "💼 " :
                                 roleName.includes("組長") || roleName.includes("隊長") || roleName.includes("會長") ? "🌟 " :
                                 roleName.includes("評審") || roleName.includes("貴賓") || roleName.includes("VIP") ? "👑 " : "👤 "}
                                {roleName}
                              </span>
                              {customRoles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setCustomRoles(customRoles.filter((r) => r !== roleName))}
                                  className="text-slate-400 hover:text-rose-500 ml-0.5 rounded-full"
                                  title="刪除此身分"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 新增自訂身分輸入 */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={roleInput}
                          onChange={(e) => setRoleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (roleInput.trim() && !customRoles.includes(roleInput.trim())) {
                                setCustomRoles([...customRoles, roleInput.trim()]);
                                setRoleInput("");
                              }
                            }
                          }}
                          placeholder="輸入自訂身分名稱（如：天使投資人、評審）"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (roleInput.trim() && !customRoles.includes(roleInput.trim())) {
                              setCustomRoles([...customRoles, roleInput.trim()]);
                              setRoleInput("");
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shrink-0 transition"
                        >
                          + 新增
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition"
                    >
                      儲存活動設定
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: 開新活動房 */}
              {activeTab === "create" && (
                <form onSubmit={handleCreateNew} className="space-y-3.5">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-3.5 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <span>建立新活動房後，系統會自動生成獨立的專屬連結與密碼，你可以將其作為讀書會、企業內訓或技術年會的人脈空間。</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">新活動名稱 *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="例如：2026 台大 EMBA 科技創新論壇"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">期別 / 梯次</label>
                      <input
                        type="text"
                        value={newCohort}
                        onChange={(e) => setNewCohort(e.target.value)}
                        placeholder="如: 秋季班、台北場"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">預計分組數量</label>
                      <select
                        value={newGroups}
                        onChange={(e) => setNewGroups(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      >
                        <option value={0}>不需要分組（扶輪社 / 商會 / 年會 / 自由交流）</option>
                        <option value={1}>不需要分組（全體同一組）</option>
                        {Array.from({ length: 49 }, (_, i) => i + 2).map((num) => (
                          <option key={num} value={num}>
                            {num} 個組別
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">專屬英文代碼 (Slug) *</label>
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="如: emba-2026, pycon"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">入房通行密碼 (選填)</label>
                      <input
                        type="text"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="留空表示免密碼"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* 活動專屬身分角色設定 */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <label className="text-slate-800 dark:text-slate-200 font-bold text-xs">活動專屬身分角色設定</label>
                      </div>
                      <span className="text-[10px] text-slate-400">自訂此房間開放的身分</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2.5">
                      {/* 場景模板快捷按鈕 */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-medium">✨ 一鍵套用場合模板：</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {SCENARIO_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => {
                                setNewRoles([...tmpl.defaultRoles]);
                                showToast(`已為新活動套用【${tmpl.name}】身分模板！`);
                              }}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="text-sm shrink-0">{tmpl.icon}</span>
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">{tmpl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 啟用的角色標籤膠囊清單 */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 block font-medium">🏷️ 新房間的身分角色（點擊 × 可移除）：</span>
                        <div className="flex flex-wrap gap-1.5">
                          {newRoles.map((roleName) => (
                            <span
                              key={roleName}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs"
                            >
                              <span>
                                {roleName.includes("導師") || roleName.includes("講師") || roleName.includes("講者") ? "👨‍🏫 " :
                                 roleName.includes("助教") ? "💼 " :
                                 roleName.includes("組長") || roleName.includes("隊長") || roleName.includes("會長") ? "🌟 " :
                                 roleName.includes("評審") || roleName.includes("貴賓") || roleName.includes("VIP") ? "👑 " : "👤 "}
                                {roleName}
                              </span>
                              {newRoles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setNewRoles(newRoles.filter((r) => r !== roleName))}
                                  className="text-slate-400 hover:text-rose-500 ml-0.5 rounded-full"
                                  title="刪除此身分"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 新增自訂身分輸入 */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newRoleInput}
                          onChange={(e) => setNewRoleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newRoleInput.trim() && !newRoles.includes(newRoleInput.trim())) {
                                setNewRoles([...newRoles, newRoleInput.trim()]);
                                setNewRoleInput("");
                              }
                            }
                          }}
                          placeholder="輸入自訂身分名稱（如：天使投資人、評審）"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newRoleInput.trim() && !newRoles.includes(newRoleInput.trim())) {
                              setNewRoles([...newRoles, newRoleInput.trim()]);
                              setNewRoleInput("");
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shrink-0 transition"
                        >
                          + 新增
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
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
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">當前活動：</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentEvent.title} · {currentEvent.cohort}
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">📲 官方 LINE 專屬邀請網址：</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteUrl}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none"
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
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">🌐 一般電腦瀏覽器網址：</label>
                      <input
                        type="text"
                        readOnly
                        value={`https://network-graph-reffy-ai-crg.vercel.app/?event=${currentEvent.slug}`}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">💬 LINE 班級發布專用文案：</span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
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

              {/* TAB 4: 變更管理密鑰 */}
              {activeTab === "pin" && (
                <form onSubmit={handleUpdatePin} className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        修改主辦人管理密鑰 (Master PIN)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      設定專屬的主辦密鑰後，只有持有此密碼的人員才能調整活動屬性或建立新的活動房間。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        輸入新密鑰 (至少 4 碼)
                      </label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="請輸入新密碼"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono tracking-wider focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        再次確認新密鑰
                      </label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="請再次輸入新密碼"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono tracking-wider focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>確認更新主辦密鑰</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
