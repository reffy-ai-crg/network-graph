"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { compressImage } from "../lib/imageUtils";
import { 
  X, 
  CheckCircle2, 
  PenLine, 
  Camera, 
  CreditCard, 
  Upload, 
  User, 
  Trash2, 
  Sparkles,
  Image as ImageIcon 
} from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, updateCurrentUserProfile, showToast } = useNetwork();

  const [name, setName] = useState(currentUser.name);
  const [company, setCompany] = useState(currentUser.company);
  const [title, setTitle] = useState(currentUser.title);
  
  // 媒體展示二選一："avatar" (個人照) 或 "card" (實體名片圖檔)
  const [mediaType, setMediaType] = useState<"avatar" | "card">("avatar");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [businessCardUrl, setBusinessCardUrl] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 產業選單：選擇的標準類別或「其他多元領域」
  const [selectedCategory, setSelectedCategory] = useState<string>("其他多元領域");
  // 若為「其他多元領域」，學員自行輸入的具體產業名稱
  const [customIndustry, setCustomIndustry] = useState<string>("");

  // 所屬組別與班級身分
  const [group, setGroup] = useState<number>(currentUser.group || 9);
  const [role, setRole] = useState<string>(currentUser.role || "學員");

  const [offer, setOffer] = useState(currentUser.offer);
  const [seek, setSeek] = useState(currentUser.seek);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setCompany(currentUser.company);
      setTitle(currentUser.title);
      setGroup(currentUser.group || 9);
      setRole(currentUser.role || "學員");
      setOffer(currentUser.offer);
      setSeek(currentUser.seek);
      setAvatarUrl(currentUser.avatarUrl || "");
      setBusinessCardUrl(currentUser.businessCardUrl || "");
      setMediaType(currentUser.mediaType || (currentUser.businessCardUrl ? "card" : "avatar"));

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      showToast("正在智慧壓縮圖檔以維持最高清晰度...");
      const compressed = await compressImage(file, 1200, 1200, 0.85);

      if (mediaType === "avatar") {
        setAvatarUrl(compressed);
        showToast("個人照片上傳成功！");
      } else {
        setBusinessCardUrl(compressed);
        showToast("實體名片圖檔上傳成功！");
      }
    } catch (err) {
      console.error(err);
      showToast("圖片上傳處理失敗，請重試！");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      group: Number(group) || 1,
      role: (role.trim() || "學員") as UserProfile["role"],
      industry: finalIndustry,
      offer: offer.trim() || currentUser.offer,
      seek: seek.trim() || currentUser.seek,
      avatarUrl: avatarUrl || undefined,
      businessCardUrl: businessCardUrl || undefined,
      mediaType: mediaType,
    });
    showToast("名片與照片設定已成功更新！✓");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">✏️ 更新個人名片與照片</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 核心功能：名片 vs 照片 (二選一展示模式) */}
          <div className="space-y-2 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>名片展示模式 (二選一)</span>
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {mediaType === "avatar" ? "目前為個人照" : "目前為實體名片"}
              </span>
            </div>

            {/* 二選一 Tab 切換 */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMediaType("avatar")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  mediaType === "avatar"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 個人形象照</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType("card")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  mediaType === "card"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>📇 實體紙本名片</span>
              </button>
            </div>

            {/* 選項 A：個人照展示與上傳 */}
            {mediaType === "avatar" ? (
              <div className="flex items-center gap-3 pt-1">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="個人頭像" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUrl ? "更換形象照" : "拍照 / 上傳個人照"}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                      >
                        移除
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    支援手機拍照或相簿挑選，將展示於目錄與動態關係圖譜中
                  </p>
                </div>
              </div>
            ) : (
              /* 選項 B：實體名片展示與上傳 */
              <div className="space-y-2 pt-1">
                {businessCardUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 group bg-slate-900 shadow-sm">
                    <img 
                      src={businessCardUrl} 
                      alt="實體名片預覽" 
                      className="w-full h-36 object-contain bg-slate-950/80" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md"
                      >
                        更換名片圖
                      </button>
                      <button
                        type="button"
                        onClick={() => setBusinessCardUrl("")}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md"
                      >
                        移除名片
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 bg-white/60 dark:bg-slate-900/40"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      點擊拍照或上傳實體紙本名片
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      自動清晰壓縮，他人可一鍵放大查看、下載至手機或轉發到 LINE
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 隱藏的圖片選取器 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

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

          {/* 所屬組別與班級身分設定 */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                所屬組別
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500 transition"
              >
                {Array.from({ length: 50 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    第 {g} 組 {g === 9 ? "🌟" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                班級身分
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="學員">學員</option>
                <option value="組長">組長</option>
                <option value="副組長">副組長</option>
                <option value="助教">助教</option>
                <option value="講師">講師</option>
                <option value="活動籌備">活動籌備</option>
                <option value="貴賓">貴賓</option>
              </select>
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
              disabled={isCompressing}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md transition"
            >
              {isCompressing ? "處理圖片中..." : "儲存並全場同步"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
