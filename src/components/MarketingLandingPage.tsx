"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Network,
  Users,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Building2,
  CreditCard,
  Layers,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Share2,
  UserCheck
} from "lucide-react";

interface MarketingLandingPageProps {
  onOpenJoinModal: () => void;
  onOpenApplyModal: () => void;
  onEnterDemoRoom: (slug: string) => void;
}

export function MarketingLandingPage({
  onOpenJoinModal,
  onOpenApplyModal,
  onEnterDemoRoom,
}: MarketingLandingPageProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("全部");

  const sampleNodes = [
    { name: "張董事長", company: "晶聯半導體", industry: "半導體與硬體", offer: "晶圓封裝測試代工", seek: "車用晶片設計夥伴", group: 1 },
    { name: "李副總裁", company: "富邦金控", industry: "金融科技與金控", offer: "高資產投資顧問與創投資金", seek: "ESG 綠能新創", group: 2 },
    { name: "王技術長", company: "智庫科技", industry: "人工智慧與數據", offer: "企業級 LLM 私有化落地", seek: "智慧製造 PoC 場域", group: 3 },
    { name: "林創辦人", company: "康健生醫", industry: "生技醫療與健康", offer: "外泌體再生醫學技術", seek: "東南亞海外代理商", group: 4 },
    { name: "陳總監", company: "雲聯智慧", industry: "軟體與雲端運算", offer: "AWS / GCP 雲端架構遷移", seek: "B2B SaaS 企業客戶", group: 1 },
  ];

  const filteredNodes = selectedIndustry === "全部" 
    ? sampleNodes 
    : sampleNodes.filter(n => n.industry === selectedIndustry);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* 頂部導航列 */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-sm text-slate-950 shadow-md shadow-emerald-500/20">
              NG
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                NetworkGraph
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                ENTERPRISE GRAPH
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenJoinModal}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 bg-slate-900/60 transition flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>輸入代碼進房</span>
            </button>

            <button
              onClick={onOpenApplyModal}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
            >
              <span>預約開辦 🏢</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 核心主視覺 (Hero Section) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* 背景炫光 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          {/* 上標標籤 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>專為高階商務社團、EMBA 論壇與企業年會打造</span>
          </div>

          {/* 大標題 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            讓每一次活動人脈，
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              都成為能長久發酵的商機星系
            </span>
          </h1>

          {/* 副標題 */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed">
            告別丟失紙本名片與 LINE 大群洗版。透過力導向星空網絡圖、一鍵加 LINE 聯繫與個人專屬數位存摺，
            為您的學員提供前所未見的尊榮社交互動體驗。
          </p>

          {/* 核心行動按鈕 (CTA) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onOpenApplyModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
            >
              <span>🏢 免費申請開辦專屬房間</span>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </button>

            <button
              onClick={onOpenJoinModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>輸入代碼進入活動</span>
            </button>
          </div>

          {/* 信任徽章小列 */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% 免下載 App
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              LINE LIFF 一秒無痛就位
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              多租戶嚴格隱私隔離
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              支援 1~50 組客製分組
            </span>
          </div>
        </div>
      </section>

      {/* 互動展示體驗區 (Interactive Preview Wall) */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <Network className="w-3.5 h-3.5" />
                <span>即時動態體驗</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                直觀看見跨界資源與人脈關係網
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                點選下方不同產業，體驗系統如何精準呈現同組同業與供需合作可能
              </p>
            </div>

            {/* 產業過濾 Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["全部", "半導體與硬體", "金融科技與金控", "人工智慧與數據", "生技醫療與健康"].map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    selectedIndustry === ind
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* 模擬卡片預覽網格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredNodes.map((n, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {n.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block group-hover:text-emerald-300 transition">
                        {n.name}
                      </span>
                      <span className="text-xs text-slate-400">{n.company}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    第 {n.group} 組
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">能提供：</span>
                    <span className="text-slate-300 truncate">{n.offer}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold shrink-0">想尋找：</span>
                    <span className="text-slate-300 truncate">{n.seek}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-800/60">
                  <span className="font-mono text-emerald-500/80">{n.industry}</span>
                  <span className="text-slate-400 flex items-center gap-1 group-hover:text-slate-200">
                    一鍵加 LINE <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 示範房間入口 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✨
              </div>
              <div>
                <span className="font-bold text-white block">
                  想看看真實活動房間運作效果？
                </span>
                <span className="text-slate-400">
                  提供「AIA 經理人班」與「扶輪社商務房」示範空間供立即體驗
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEnterDemoRoom("aia-12")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                進入 AIA 示範房
              </button>
              <button
                onClick={() => onEnterDemoRoom("the-rotary")}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700 transition cursor-pointer"
              >
                進入 扶輪社示範房
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 三大傳統痛點 vs NetworkGraph 解決方案 */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 tracking-wider font-mono">
            WHY NETWORKGRAPH
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            為高階社交活動徹底換代升級
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            不再忍受混亂的紙張、遺忘的名字與沉沒於聊天室的商機
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              告別散落一地的紙本名片
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              活動結束回到家，名片堆成山卻記不得誰是誰。NetworkGraph 為每位學員建立個人數位存摺，跨活動自動匯流，一鍵寫入私密備忘錄。
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              現場破冰不再尷尬摸索
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              力導向物理圖譜讓全場學員的人脈關係躍然眼前。誰有算力需求？誰在尋求海外通路？大螢幕即時投影讓彼此迅速找到對應夥伴。
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              嚴格的多租戶隱私守護
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              每場活動皆為獨立封閉房間，杜絕任何路人打擾或資料混淆。只有持有活動代碼與受邀社友才能進入，資料絕對安全可靠。
            </p>
          </div>
        </div>
      </section>

      {/* 四大多元應用場景 */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              深受多元高階場景青睞
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              無論是否需要分組，皆可一鍵設定符合活動調性的人脈空間
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-2xl">🤝</span>
              <h4 className="text-sm font-bold text-white">國際扶輪社例會</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                全場自由交流不分組，快速交換 LINE 聯繫，累積社友數位通訊錄。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-2xl">🎓</span>
              <h4 className="text-sm font-bold text-white">頂大 EMBA 班級通訊錄</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                支援 1~30 組專案分組，產業跨界聚類，方便課後深度探討商業合作。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-2xl">🏢</span>
              <h4 className="text-sm font-bold text-white">企業全員年會 / 內訓</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                跨部門快速認識破冰，打破組織穀倉效應，提升內部協作效率。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-2xl">🚀</span>
              <h4 className="text-sm font-bold text-white">創投高峰論壇 / Demo Day</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                投資人與新創創辦人供需精準匹配，活動結束持續長效追蹤。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部強效呼籲 (Bottom CTA) */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          準備好為您的活動升級數位人脈體驗了嗎？
        </h2>
        <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          立即填寫預約表單，專案特助將於 24 小時內與您聯繫，協助開通專屬活動房間。
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenApplyModal}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition cursor-pointer active:scale-98"
          >
            🏢 立即免費申請開通
          </button>
          <button
            onClick={onOpenJoinModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl font-bold text-sm sm:text-base transition cursor-pointer active:scale-98"
          >
            輸入活動代碼通關
          </button>
        </div>
      </section>

      {/* 頁腳 */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 NetworkGraph. All rights reserved. 專為高階商務社團與企業活動打造之關係圖譜系統。</p>
      </footer>
    </div>
  );
}
