"use client";

import React, { useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { X, Building2, CheckCircle2, Sparkles, Send, Users, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

interface ApplyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyEventModal({ isOpen, onClose }: ApplyEventModalProps) {
  const { submitEventApplication, showToast } = useNetwork();

  const [orgName, setOrgName] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [cohort, setCohort] = useState("");
  const [scale, setScale] = useState("30~80人");
  const [eventDate, setEventDate] = useState("2026/04");
  const [needGrouping, setNeedGrouping] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantRole, setApplicantRole] = useState("");
  const [contactLine, setContactLine] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !eventTitle.trim() || !applicantName.trim() || !contactLine.trim()) {
      showToast("請填妥必填欄位（組織名稱、活動主題、申請人姓名與 LINE ID）！");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEventApplication({
        orgName: orgName.trim(),
        eventTitle: eventTitle.trim(),
        cohort: cohort.trim() || orgName.trim(),
        scale,
        eventDate,
        needGrouping,
        applicantName: applicantName.trim(),
        applicantRole: applicantRole.trim() || "主辦幹部",
        contactLine: contactLine.trim(),
        contactPhone: contactPhone.trim(),
        notes: notes.trim(),
      });
      setIsSubmitted(true);
    } catch (err) {
      showToast("送出失敗，請稍候重試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* 頂部標題 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                申請開辦專屬活動房 (旗艦試辦專案)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                為您的扶輪社、EMBA 班級、商會或企業年會打造專屬人脈星系圖
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 內容區塊 */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1 text-slate-800 dark:text-slate-200">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 專案試辦橫幅說明 */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/30 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    ✨ 尊榮社團免費試辦專案支援
                  </span>
                  包含：獨立專屬活動代碼、LINE 免密碼登入名冊、會場大螢幕動態圖譜投放、專案顧問 1 對 1 快速建置！
                </div>
              </div>

              {/* 活動基本資料 */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      申請組織 / 社團全名 *
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="例：台北大安扶輪社、台大 EMBA"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      活動 / 論壇主題全名 *
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="例：2026 春季經理人論壇、例會"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      期別 / 梯次標籤
                    </label>
                    <input
                      type="text"
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      placeholder="例：114級、第38屆"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      預估人數規模
                    </label>
                    <select
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="30人以下">30人以下 (小型交流)</option>
                      <option value="30~80人">30 ~ 80人 (社團例會/班級)</option>
                      <option value="80~200人">80 ~ 200人 (中型年會)</option>
                      <option value="200人以上">200人以上 (大型高峰論壇)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      預計活動月份/日期
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="例：2026/04 或 2026/05/15"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* 是否分組交流 */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    分組交流設定
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNeedGrouping(false)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        !needGrouping
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-base">🤝</span>
                      <div>
                        <div className="text-xs">自由交流（無需分組）</div>
                        <div className="text-[10px] text-slate-400">扶輪社 / 商會 / 自由聯誼</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNeedGrouping(true)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        needGrouping
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-base">🧩</span>
                      <div>
                        <div className="text-xs">組別分桌（分組競賽/研討）</div>
                        <div className="text-[10px] text-slate-400">課程 / 工作坊 / 梯隊</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 申請人與主辦聯絡資訊 */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  👤 申請代表與專屬聯絡資訊
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      您的姓名 *
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="例：陳志豪"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      在組織擔任職務 *
                    </label>
                    <input
                      type="text"
                      value={applicantRole}
                      onChange={(e) => setApplicantRole(e.target.value)}
                      placeholder="例：秘書長、會長、班代、總召"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      聯絡 LINE ID *
                    </label>
                    <input
                      type="text"
                      value={contactLine}
                      onChange={(e) => setContactLine(e.target.value)}
                      placeholder="例：kevin_chen888"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      💡 專屬顧問將以 LINE 與您聯繫交付房間代碼與主辦密碼
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      聯絡手機 / 電話 (選填)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="例：0912-345-678"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    特殊需求備註 (選填)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="例：希望現場能配合大螢幕投影動態關係圖，需要先行測試..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "送出中..." : "送出開房申請 (專人審核開通)"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* 送出成功畫面 */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  🎉 專屬活動房申請已成功送出！
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  感謝您申請試辦！我們的數位專案顧問將於 <span className="font-bold text-emerald-600 dark:text-emerald-400">24 小時內</span> 透過 LINE 與您聯繫，並交付您的專屬房間連結與主辦管理密鑰。
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-1.5 max-w-sm mx-auto text-[11px]">
                <div className="text-slate-400 font-semibold mb-1">📋 申請資料確認：</div>
                <div><span className="text-slate-500">組織名稱：</span><span className="font-semibold text-slate-800 dark:text-slate-200">{orgName}</span></div>
                <div><span className="text-slate-500">活動主題：</span><span className="font-semibold text-slate-800 dark:text-slate-200">{eventTitle}</span></div>
                <div><span className="text-slate-500">申請代表：</span><span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName} ({applicantRole})</span></div>
                <div><span className="text-slate-500">聯絡 LINE：</span><span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{contactLine}</span></div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                >
                  確認並關閉
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
