"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { 
  X, 
  Sparkles, 
  User, 
  Building2, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Edit2
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { currentUser, updateCurrentUserProfile, showToast, currentEvent } = useNetwork();

  const isDefaultKevin = currentUser.name === "陳志豪 (Kevin)";

  const [name, setName] = useState(isDefaultKevin ? "" : currentUser.name);
  const [company, setCompany] = useState(isDefaultKevin ? "" : currentUser.company);
  const [title, setTitle] = useState(isDefaultKevin ? "" : currentUser.title);
  const hasGrouping = (currentEvent?.totalGroups ?? 10) > 1;
  const [group, setGroup] = useState<number>(hasGrouping ? 1 : 0);
  const [role, setRole] = useState<string>("一般學員");
  const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
  const [customRoleText, setCustomRoleText] = useState<string>("");
  const [industry, setIndustry] = useState<IndustryType>("數位行銷與媒體");
  const [offer, setOffer] = useState("");
  const [seek, setSeek] = useState("");

  // 可用身分角色清單：優先使用房間設定的 customRoles，若無則提供常見預設
  const availableRoomRoles = useMemo(() => {
    if (currentEvent?.customRoles && currentEvent.customRoles.length > 0) {
      return currentEvent.customRoles;
    }
    return ["一般學員", "組長幹部", "隨班助教", "授課導師"];
  }, [currentEvent?.customRoles]);

  const getRoleOptionIcon = (roleName: string) => {
    if (roleName.includes("導師") || roleName.includes("講師") || roleName.includes("講者")) return "👨‍🏫 ";
    if (roleName.includes("助教")) return "💼 ";
    if (roleName.includes("社長") || roleName.includes("組長") || roleName.includes("隊長") || roleName.includes("會長") || roleName.includes("幹部") || roleName.includes("召集人")) return "🌟 ";
    if (roleName.includes("評審") || roleName.includes("貴賓") || roleName.includes("VIP") || roleName.includes("顧問")) return "👑 ";
    if (roleName.includes("投資") || roleName.includes("創投") || roleName.includes("天使") || roleName.includes("財務")) return "💎 ";
    if (roleName.includes("秘書")) return "📝 ";
    if (roleName.includes("社友") || roleName.includes("會員")) return "🤝 ";
    if (roleName.includes("參賽") || roleName.includes("黑客") || roleName.includes("選手")) return "🚀 ";
    return "👤 ";
  };

  useEffect(() => {
    if (isOpen) {
      const isKevin = currentUser.name === "陳志豪 (Kevin)";
      setName(isKevin ? "" : currentUser.name);
      setCompany(isKevin ? "" : currentUser.company);
      setTitle(isKevin ? "" : currentUser.title);
      setGroup(hasGrouping ? (currentUser.group || 1) : 0);

      const initialRole = currentUser.role || availableRoomRoles[0] || "一般學員";
      if (availableRoomRoles.includes(initialRole)) {
        setRole(initialRole);
        setIsCustomRole(false);
        setCustomRoleText("");
      } else {
        setRole("__CUSTOM__");
        setIsCustomRole(true);
        setCustomRoleText(initialRole);
      }

      if (currentUser.industry && INDUSTRIES.includes(currentUser.industry)) {
        setIndustry(currentUser.industry);
      }
    }
  }, [isOpen, currentUser, availableRoomRoles, hasGrouping]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("請輸入您的姓名或暱稱！");
      return;
    }

    const finalRole = isCustomRole
      ? (customRoleText.trim() || "正式成員")
      : (role.trim() || availableRoomRoles[0] || "一般學員");

    const finalGroup = hasGrouping ? (typeof group === "number" ? group : 1) : 0;

    updateCurrentUserProfile({
      name: name.trim(),
      surname: name.trim().slice(0, 1),
      company: company.trim() || "自由專業人士",
      title: title.trim() || "學員",
      group: finalGroup,
      role: finalRole as UserProfile["role"],
      industry: industry,
      offer: offer.trim() || "期待在此場合交流與認識跨界夥伴！",
      seek: seek.trim() || "尋找各產業合作與資源交流機會",
      avatarUrl: currentUser.avatarUrl,
      mediaType: "avatar",
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("network_graph_onboarding_done", "true");
    }

    if (hasGrouping && finalGroup > 0) {
      showToast(`歡迎加入！您已成功就位【第 ${finalGroup} 組 · ${finalRole}】🎉`);
    } else {
      showToast(`歡迎加入！您已成功就位【${finalRole}】🎉`);
    }
    onClose();
  };

  const totalGroupsCount = Math.max(currentEvent?.totalGroups || 30, 30);

  return (
    <div className="fixed inset-0 bg-black/75 z-50 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-7 space-y-4 shadow-2xl transition-colors max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部歡迎標題 */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="space-y-1 pr-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>新夥伴報到就位</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              歡迎加入 {currentEvent?.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              只要 10 秒鐘填妥您的組別與身分，即可在全體關係圖譜中就位！
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl transition"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LINE 身分連動提示 */}
        {currentUser.avatarUrl && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-emerald-500 shrink-0 shadow-xs">
              <img src={currentUser.avatarUrl} alt="LINE 頭像" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>LINE 帳號已就緒</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                已自動連動您的頭像照片，填寫下方資料即可完成報到
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 姓名欄位 */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>您的姓名 / 暱稱</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：林小華 (David)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              required
            />
          </div>

          {/* 核心醒目選擇：所屬組別 */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 dark:border-emerald-800/80 rounded-2xl space-y-1.5">
            <label className="block text-emerald-950 dark:text-emerald-200 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>請選擇您的所屬組別</span>
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">
                （預選為第 9 組 🌟）
              </span>
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-500/80 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition"
            >
              <option value={9}>🌟 第 9 組（熱門同組同行）</option>
              {Array.from({ length: totalGroupsCount }, (_, i) => i + 1).map((g) => {
                if (g === 9) return null;
                return (
                  <option key={g} value={g}>
                    第 {g} 組
                  </option>
                );
              })}
              <option value={0}>🎓 巡迴指導 / 全體幹部（不限單一組別）</option>
            </select>
          </div>

          {/* 公司與職稱 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>現職公司 / 單位</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="例如：台積電、富邦金控..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>職位 / 頭銜</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：經理、架構師..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* 產業與身分角色 */}
          <div className="space-y-3 pt-0.5">
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                產業領域分類
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryType)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* 活動 / 社團身分角色（支援自訂輸入與常見社團熱門快捷） */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>活動 / 社團身分角色</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomRole(!isCustomRole);
                    if (!isCustomRole && !customRoleText) {
                      setCustomRoleText(role !== "__CUSTOM__" ? role : "");
                    }
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isCustomRole ? "📋 從推薦名單選" : "✏️ 自行手動輸入角色"}</span>
                </button>
              </div>

              {!isCustomRole ? (
                <div className="space-y-1">
                  <select
                    value={role}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomRole(true);
                        setCustomRoleText("");
                      } else {
                        setRole(e.target.value);
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500 transition"
                  >
                    {availableRoomRoles.map((r) => (
                      <option key={r} value={r}>
                        {getRoleOptionIcon(r)}{r}
                      </option>
                    ))}
                    <option value="__CUSTOM__">✏️ 自行手動輸入（如：扶輪社社長、秘書、社友...）</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    💡 若為扶輪社、BNI、商會或自訂活動，可點選上方「✏️ 自行手動輸入角色」輸入專屬職稱
                  </p>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="請輸入身分（例如：扶輪社社長、秘書長、財務幹部、受邀貴賓...）"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition text-xs"
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">常見身分快捷鍵：</span>
                    {["社長", "副社長", "秘書長", "財務幹部", "正式社友", "受邀貴賓", "組長幹部", "一般學員"].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setCustomRoleText(example)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition font-medium cursor-pointer ${
                          customRoleText === example
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-400"
                        }`}
                      >
                        + {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 滿版超顯眼確認按鈕 */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <span>🚀 立即登記名片，進駐班級名冊</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center mt-2.5">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                先不登記，隨意逛逛 ➔
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
