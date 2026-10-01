"use client";

import React, { useState } from "react";
import { useNetwork, ThemePreset } from "../context/NetworkContext";
import { Palette, Check, Sparkles, ChevronUp, ChevronDown, Sun } from "lucide-react";

interface ThemeOption {
  id: ThemePreset;
  name: string;
  sub: string;
  tag: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "blue",
    name: "方案一：高階商務藍",
    sub: "專業信任 • 經典商務科技",
    tag: "Tech Navy",
    primaryColor: "#2563eb",
    secondaryColor: "#38bdf8",
    bgColor: "#f8fafc",
    description: "如 LinkedIn / Stripe，沉穩幹練、高階經理人學院感",
  },
  {
    id: "green",
    name: "方案二：雅緻溫潤綠",
    sub: "親切溫潤 • 奶霜米白底色",
    tag: "Warm Sage",
    primaryColor: "#059669",
    secondaryColor: "#2dd4bf",
    bgColor: "#faf7f2",
    description: "如 Aesop，溫暖護眼不刺眼、精緻人脈交流溫度",
  },
  {
    id: "purple",
    name: "方案三：未來科技紫",
    sub: "AI 演算法 • 前衛新創科技",
    tag: "AI Violet",
    primaryColor: "#7c3aed",
    secondaryColor: "#06b6d4",
    bgColor: "#f8f9fe",
    description: "如 Linear / OpenAI，前瞻科技感與演算法星系視覺",
  },
  {
    id: "mono",
    name: "方案四：極簡瑞士黑白",
    sub: "Apple / Notion • 活力橘點綴",
    tag: "Minimalist",
    primaryColor: "#18181b",
    secondaryColor: "#f97316",
    bgColor: "#f4f4f5",
    description: "極簡俐落黑白灰，讓同學真實照片與彩色圖譜成為絕對焦點",
  },
];

export function ThemeTesterBar() {
  const { themePreset, setThemePreset, theme, setTheme } = useNetwork();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelectTheme = (id: ThemePreset) => {
    setThemePreset(id);
    // 若在深色模式，自動轉為淺色模式以檢視淺色風格效果
    if (theme === "dark") {
      setTheme("light");
    }
  };

  const currentOption = THEME_OPTIONS.find((t) => t.id === themePreset) || THEME_OPTIONS[0];

  return (
    <aside aria-label="淺色風格測試器" className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-b border-amber-500/40 shadow-xl relative z-30 transition-all">
      {/* 頂部收合切換標題列 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-md animate-pulse">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-extrabold text-amber-400 tracking-wide shrink-0">
              【臨時淺色風格測試器】
            </span>
            <span className="text-[11px] text-slate-300 hidden md:inline truncate">
              點擊任一方案全域即時切換預覽，選定後告訴我即可為您永久固定並移除此工具列！
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5 text-amber-300 font-semibold hidden sm:flex items-center gap-1.5">
            <span>目前已套用：</span>
            <span className="text-white font-bold">{currentOption.name.split("：")[1]}</span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
          >
            {isCollapsed ? (
              <>
                <span>展開切換面板</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              </>
            ) : (
              <>
                <span>收合</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 展開後的 4 大配色方案選擇卡 */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 bg-slate-950/80 px-3 sm:px-4 py-3 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = themePreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectTheme(opt.id)}
                    className={`relative p-3 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border ${
                      isSelected
                        ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.02]"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                    }`}
                  >
                    <div>
                      {/* 色彩預覽圓點與 Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-full bg-slate-950/80 border border-slate-800 shadow-inner">
                          {/* 主色點 */}
                          <span
                            className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white/20"
                            style={{ backgroundColor: opt.primaryColor }}
                            title="主題主色"
                          />
                          {/* 輔助/漸層色點 */}
                          <span
                            className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white/20"
                            style={{ backgroundColor: opt.secondaryColor }}
                            title="漸層點綴色"
                          />
                          {/* 底色點 */}
                          <span
                            className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/20"
                            style={{ backgroundColor: opt.bgColor }}
                            title="畫布淺色底色"
                          />
                        </div>

                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {opt.tag}
                        </span>
                      </div>

                      {/* 方案名稱與副標題 */}
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>{opt.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {opt.sub}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {/* 勾選狀態 */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      {isSelected ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>已套用中</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-white flex items-center gap-1">
                          <span>點此切換試看</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {opt.primaryColor}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 提示說帖 */}
            <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  切換後，下方所有<strong>按鈕、高亮標籤、分組膠囊、個人存摺、光暈與背景</strong>皆會即時變換！
                </span>
              </div>
              <div className="text-amber-300 font-medium shrink-0">
                💬 決定後只要說：「我決定要方案 X」，我將為您鎖定並移除此測試列！
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
