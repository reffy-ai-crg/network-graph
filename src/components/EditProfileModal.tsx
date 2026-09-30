"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType } from "../types/network";
import { X, CheckCircle2, Sparkles, PenLine } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, updateCurrentUserProfile } = useNetwork();

  const [name, setName] = useState(currentUser.name);
  const [company, setCompany] = useState(currentUser.company);
  const [title, setTitle] = useState(currentUser.title);
  
  // 產業選單：選擇的標準類別或「其他多元領域」
  const [selectedCategory, setSelectedCategory] = useState<string>("其他多元領域");
  // 若為「其他多元領域」，學員自行輸入的具體產業名稱
  const [customIndustry, setCustomIndustry] = useState<string>("");

  const [offer, setOffer] = useState(currentUser.offer);
  const [seek, setSeek] = useState(currentUser.seek);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setCompany(currentUser.company);
      setTitle(currentUser.title);
      setOffer(currentUser.offer);
      setSeek(currentUser.seek);

      const isStandard = INDUSTRIES.includes(currentUser.industry) && currentUser.industry !== "其他多元領域";
      if (isStandard) {
        setSelectedCategory(currentUser.industry);
        setCustomIndustry("");
      } else {
        setSelectedCategory("其他多元領域");
        setCustomIndustry(currentUser.industry === "其他多元領域" ? "" : currentUser.industry);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 計算最終產業字串：若是「其他多元領域」，優先取學員自行輸入的文字
    const finalIndustry = 
      selectedCategory === "其他多元領域"
        ? (customIndustry.trim() || "其他多元領域")
        : selectedCategory;

    updateCurrentUserProfile({
      name: name.trim() || currentUser.name,
      surname: name.trim().slice(0, 1) || currentUser.surname,
      company: company.trim() || currentUser.company,
      title: title.trim() || currentUser.title,
      industry: finalIndustry,
      offer: offer.trim() || currentUser.offer,
      seek: seek.trim() || currentUser.seek,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">✏️ 更新個人主名片</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/30 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>全局即時同步</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">真實姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">現職公司</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">職位職稱</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          {/* 產業類別選單 + 自行輸入欄位 */}
          <div className="space-y-2">
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              產業類別
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* 當選擇「其他多元領域」時，顯示自行輸入框 */}
            {selectedCategory === "其他多元領域" && (
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/40 rounded-xl space-y-1.5 transition-all">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
                  <PenLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>自行輸入您的具體產業或專業領域：</span>
                </div>
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="例如：影視動漫、智慧農業、文化創意、無人機科技、航太..."
                  className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-600/50 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  💡 儲存後，此自訂產業將自動出現在全班目錄篩選器與動態圖譜聚類中！
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              能提供的資源 (Offer)
            </label>
            <textarea
              rows={2}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              placeholder="例如：半導體製程瑕疵檢測經驗、工業 AI 落地指引..."
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              正在尋找的合作 (Seek)
            </label>
            <textarea
              rows={2}
              value={seek}
              onChange={(e) => setSeek(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              placeholder="例如：尋找 LLM 企業內部私有化微調專家..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              儲存並全場同步
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
