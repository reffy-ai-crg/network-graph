"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { RotateCcw, ZoomIn, ZoomOut, Layers, Sparkles } from "lucide-react";

interface GraphNode {
  id: string;
  member: UserProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  groupColor: string;
  industryColor: string;
}

const GROUP_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#06b6d4", "#f97316", "#84cc16",
  "#6366f1", "#14b8a6", "#d946ef", "#e11d48",
  "#0284c7", "#ca8a04", "#9333ea", "#475569"
];

function getGroupColor(group: number): string {
  if (group === 0) return "#f59e0b"; // 巡迴指導 (導師與助教) 尊榮琥珀金
  if (group >= 1 && group <= GROUP_COLORS.length) {
    return GROUP_COLORS[group - 1];
  }
  // 為第 17~50+ 組計算黃金角均勻色相分佈，確保每一組均具備高飽和與辨識度色彩
  const hue = ((group - 1) * 137.5) % 360;
  return `hsl(${Math.round(hue)}, 75%, 48%)`;
}

const INDUSTRY_COLORS: Record<IndustryType, string> = {
  "半導體與硬體": "#f59e0b",
  "軟體與雲端運算": "#0ea5e9",
  "人工智慧與數據": "#6366f1",
  "金融科技與金控": "#10b981",
  "生技醫療與健康": "#f43f5e",
  "智慧製造與工業": "#8b5cf6",
  "電商零售與消費品": "#ec4899",
  "綠能永續與 ESG": "#14b8a6",
  "數位行銷與媒體": "#f97316",
  "專業顧問與創投": "#3b82f6",
  "教育科研與公部門": "#84cc16",
  "其他多元領域": "#64748b",
  // 歷史相容
  "半導體": "#f59e0b",
  "軟體與雲端": "#0ea5e9",
  "金融科技": "#10b981",
  "生技醫療": "#f43f5e",
  "智慧製造": "#8b5cf6",
  "其他領域": "#64748b"
};

function getIndustryColor(ind: string): string {
  if (INDUSTRY_COLORS[ind as IndustryType]) return INDUSTRY_COLORS[ind as IndustryType];
  let hash = 0;
  for (let i = 0; i < ind.length; i++) {
    hash = ind.charCodeAt(i) + ((hash << 5) - hash);
  }
  const customPalette = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#f97316", "#14b8a6", "#e11d48", "#a855f7"];
  return customPalette[Math.abs(hash) % customPalette.length];
}

export function GraphView() {
  const { members, openDrawer, showToast, theme } = useNetwork();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [clusterMode, setClusterMode] = useState<"group" | "industry">("group");
  const [highlightedIndustry, setHighlightedIndustry] = useState<string>("all");
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{ member: UserProfile; x: number; y: number } | null>(null);

  const allIndustries = React.useMemo(() => {
    const customSet = new Set<string>();
    members.forEach((m) => {
      if (m.industry && !INDUSTRIES.includes(m.industry)) {
        customSet.add(m.industry);
      }
    });
    return [...INDUSTRIES, ...Array.from(customSet)];
  }, [members]);

  const nodesRef = useRef<GraphNode[]>([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // 初始化節點
  const initNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxGroup = Math.max(...members.map((m) => m.group || 1), 10);

    nodesRef.current = members.map((m) => {
      let targetX: number;
      let targetY: number;

      if (m.group === 0) {
        // 巡迴導師與助教：初始分佈在星系的核心中央區域
        targetX = cx + (Math.random() - 0.5) * 80;
        targetY = cy + (Math.random() - 0.5) * 80;
      } else {
        const groupAngle = ((m.group - 1) / maxGroup) * Math.PI * 2;
        const radius = Math.min(w, h) * 0.32;
        targetX = cx + Math.cos(groupAngle) * radius + (Math.random() - 0.5) * 60;
        targetY = cy + Math.sin(groupAngle) * radius + (Math.random() - 0.5) * 60;
      }

      // 導師、評審、助教與幹部節點半徑適應度與尊榮感
      const isLeaderRole = m.role?.includes("導師") || m.role?.includes("講師") || m.role?.includes("評審") || m.role?.includes("VIP") || m.role?.includes("講者");
      const isSubLeaderRole = m.role?.includes("助教") || m.role?.includes("組長") || m.role?.includes("幹部") || m.role?.includes("會長");
      const radius = isLeaderRole ? 19 : isSubLeaderRole ? 16 : m.isCurrentUser ? 18 : 14;

      return {
        id: m.id,
        member: m,
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        radius,
        groupColor: getGroupColor(m.group),
        industryColor: getIndustryColor(m.industry),
      };
    });
  }, [members]);

  // 力導向物理模擬迭代
  const updatePhysics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxGroup = Math.max(...members.map((m) => m.group || 1), 10);

    // 組別中心聚類點 (第 0 組設在星系正中心)
    const groupCenters: { x: number; y: number }[] = [];
    groupCenters[0] = { x: cx, y: cy };
    for (let g = 1; g <= maxGroup; g++) {
      const ang = ((g - 1) / maxGroup) * Math.PI * 2;
      const rad = Math.min(w, h) * 0.30;
      groupCenters[g] = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad };
    }

    // 產業中心聚類點
    const indCenters: Record<string, { x: number; y: number }> = {};
    allIndustries.forEach((ind, i) => {
      const ang = (i / allIndustries.length) * Math.PI * 2;
      const rad = Math.min(w, h) * 0.28;
      indCenters[ind] = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad };
    });

    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node === draggedNodeRef.current) continue;

      // 向心引力
      const targetCenter =
        clusterMode === "group"
          ? groupCenters[node.member.group]
          : indCenters[node.member.industry];

      if (targetCenter) {
        node.vx += (targetCenter.x - node.x) * 0.015;
        node.vy += (targetCenter.y - node.y) * 0.015;
      }

      // 互斥力 (防重疊)
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = node.radius + other.radius + 12;

        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.25;
          node.vx -= dx * force;
          node.vy -= dy * force;
          other.vx += dx * force;
          other.vy += dy * force;
        }
      }

      // 阻尼摩擦力
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, [clusterMode, allIndustries]);

  // 繪製畫布
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transformRef.current.x, transformRef.current.y);
    ctx.scale(transformRef.current.k, transformRef.current.k);

    const nodes = nodesRef.current;

    // 1. 同組聚類背景星團光暈
    if (clusterMode === "group") {
      const groups: Record<number, GraphNode[]> = {};
      nodes.forEach((n) => {
        if (!groups[n.member.group]) groups[n.member.group] = [];
        groups[n.member.group].push(n);
      });

      Object.entries(groups).forEach(([g, list]) => {
        if (list.length === 0) return;
        let avgX = 0, avgY = 0;
        list.forEach((n) => { avgX += n.x; avgY += n.y; });
        avgX /= list.length;
        avgY /= list.length;

        const isRoaming = Number(g) === 0;
        ctx.beginPath();
        ctx.arc(avgX, avgY, isRoaming ? 80 : 68, 0, Math.PI * 2);
        ctx.fillStyle = isRoaming
          ? (isLight ? "rgba(254, 243, 199, 0.65)" : "rgba(120, 53, 15, 0.3)")
          : (isLight ? "rgba(226, 232, 240, 0.7)" : "rgba(30, 41, 59, 0.4)");
        ctx.fill();
        ctx.strokeStyle = isRoaming
          ? (isLight ? "rgba(245, 158, 11, 0.8)" : "rgba(245, 158, 11, 0.5)")
          : (isLight ? "rgba(203, 213, 225, 0.8)" : "rgba(71, 85, 105, 0.25)");
        ctx.lineWidth = isRoaming ? 1.8 : 1;
        ctx.stroke();

        ctx.fillStyle = isRoaming
          ? (isLight ? "#b45309" : "#fbbf24")
          : (isLight ? "rgba(71, 85, 105, 0.85)" : "rgba(148, 163, 184, 0.6)");
        ctx.font = isRoaming ? "bold 11px sans-serif" : "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(isRoaming ? "🎓 巡迴導師與助教群" : `第 ${g} 組`, avgX, avgY - (isRoaming ? 60 : 50));
      });
    }

    // 2. 高亮同產業的動態連結線
    if (highlightedIndustry !== "all") {
      const matchedNodes = nodes.filter((n) => n.member.industry === highlightedIndustry);
      ctx.beginPath();
      for (let i = 0; i < matchedNodes.length; i++) {
        for (let j = i + 1; j < matchedNodes.length; j++) {
          ctx.moveTo(matchedNodes[i].x, matchedNodes[i].y);
          ctx.lineTo(matchedNodes[j].x, matchedNodes[j].y);
        }
      }
      ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.6)" : "rgba(245, 158, 11, 0.45)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. 繪製節點
    nodes.forEach((node) => {
      const isMatch = highlightedIndustry === "all" || node.member.industry === highlightedIndustry;
      const opacity = isMatch ? 1 : 0.2;
      const isTeacher = node.member.role === "講師";
      const isTA = node.member.role === "助教";

      ctx.save();
      ctx.globalAlpha = opacity;

      // 發光光圈
      if (highlightedIndustry !== "all" && isMatch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.25)";
        ctx.fill();
      }

      // 導師與助教外環光暈
      if (isTeacher) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "#d97706" : "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isTA) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? "#0284c7" : "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 節點本體
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.member.isCurrentUser
        ? "#10b981"
        : isTeacher
        ? "#f59e0b"
        : isTA
        ? "#0284c7"
        : clusterMode === "group"
        ? node.groupColor
        : node.industryColor;
      ctx.fill();
      ctx.strokeStyle = node === hoveredNodeRef.current 
        ? (isLight ? "#0f172a" : "#ffffff") 
        : (isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.35)");
      ctx.lineWidth = node === hoveredNodeRef.current ? 2.5 : 1.2;
      ctx.stroke();

      // 姓氏文字
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${isTeacher ? 12 : isTA ? 10 : node.member.isCurrentUser ? 11 : 9}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.member.surname, node.x, node.y);

      // 下方姓名文字
      if (opacity > 0.5) {
        ctx.fillStyle = isTeacher
          ? (isLight ? "#b45309" : "#fbbf24")
          : isTA
          ? (isLight ? "#0369a1" : "#38bdf8")
          : (isLight ? "#1e293b" : "#cbd5e1");
        ctx.font = (isTeacher || isTA) ? "bold 10px sans-serif" : (isLight ? "bold 9px sans-serif" : "9px sans-serif");
        const rolePrefix = isTeacher ? "👑 " : isTA ? "💼 " : "";
        ctx.fillText(`${rolePrefix}${node.member.name}`, node.x, node.y + node.radius + 12);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [clusterMode, highlightedIndustry, theme]);

  // 動畫循環
  useEffect(() => {
    const loop = () => {
      updatePhysics();
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updatePhysics, draw]);

  // 畫布尺寸與事件綁定
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      if (nodesRef.current.length === 0) {
        initNodes();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initNodes]);

  // 手勢與互動操作
  const getCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - transformRef.current.x) / transformRef.current.k,
      y: (clientY - rect.top - transformRef.current.y) / transformRef.current.k,
    };
  };

  const findNodeAt = (pos: { x: number; y: number }) => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dist = Math.hypot(n.x - pos.x, n.y - pos.y);
      if (dist <= n.radius + 4) return n;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    const node = findNodeAt(pos);
    if (node) {
      draggedNodeRef.current = node;
    } else {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    const node = findNodeAt(pos);
    hoveredNodeRef.current = node;

    if (node && !isPanningRef.current && !draggedNodeRef.current) {
      setHoveredNodeInfo({ member: node.member, x: e.clientX, y: e.clientY });
    } else {
      setHoveredNodeInfo(null);
    }

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = pos.x;
      draggedNodeRef.current.y = pos.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isPanningRef.current) {
      transformRef.current.x = e.clientX - panStartRef.current.x;
      transformRef.current.y = e.clientY - panStartRef.current.y;
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    const clicked = findNodeAt(pos);
    if (clicked) {
      openDrawer(clicked.member);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    transformRef.current.k = Math.max(0.5, Math.min(3, transformRef.current.k * factor));
  };

  const zoom = (factor: number) => {
    transformRef.current.k = Math.max(0.5, Math.min(3, transformRef.current.k * factor));
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    initNodes();
    setHighlightedIndustry("all");
    showToast("已重置圖譜視角與物理聚類");
  };

  return (
    <div className="flex-1 relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-100/90 dark:bg-slate-950 transition-colors">
      {/* 頂部操作控制列 */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* 聚類切換 */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 px-2.5 shadow-sm dark:shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1.5 text-xs transition-colors">
          <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">聚類維度：</span>
          <button
            onClick={() => {
              setClusterMode("group");
              showToast("已切換為「課程組別」向心聚類");
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              clusterMode === "group"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            }`}
          >
            依組別聚類
          </button>
          <button
            onClick={() => {
              setClusterMode("industry");
              showToast("已切換為「產業領域」向心聚類");
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              clusterMode === "industry"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            }`}
          >
            依產業聚類
          </button>
        </div>

        {/* 產業標籤高亮 */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 px-2.5 shadow-sm dark:shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full text-xs no-scrollbar transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] hidden sm:inline">
            產業高亮連線：
          </span>
          <button
            onClick={() => setHighlightedIndustry("all")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              highlightedIndustry === "all"
                ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white ring-1 ring-slate-400 dark:ring-white"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            全部
          </button>
          {allIndustries.map((ind) => (
            <button
              key={ind}
              onClick={() => {
                setHighlightedIndustry(ind);
                showToast(`已高亮全班「${ind}」節點並繪製關聯線！`);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition whitespace-nowrap ${
                highlightedIndustry === ind
                  ? "bg-amber-100 text-amber-900 border border-amber-400 ring-1 ring-amber-400 font-semibold dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60 dark:hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* 畫布縮放控制懸浮鈕 */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={resetView}
          className="w-9 h-9 rounded-xl bg-white/90 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-white flex items-center justify-center text-xs shadow-md backdrop-blur-sm transition"
          title="重置畫面"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoom(1.2)}
          className="w-9 h-9 rounded-xl bg-white/90 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-white flex items-center justify-center text-sm shadow-md backdrop-blur-sm transition"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoom(0.8)}
          className="w-9 h-9 rounded-xl bg-white/90 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-white flex items-center justify-center text-sm shadow-md backdrop-blur-sm transition"
          title="縮小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* 操作指引小浮水印 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none text-[11px] text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs backdrop-blur-sm transition-colors">
        💡 滑鼠/手指拖曳節點可互動 • 點擊同學頭像滑出詳細名片卡
      </div>

      {/* 懸浮節點時放大的即時照片與資料浮動卡片 (Hover Magnified Photo Preview) */}
      {hoveredNodeInfo && (
        <div
          className="fixed pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: hoveredNodeInfo.x, top: hoveredNodeInfo.y - 12 }}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shadow-xs">
            {hoveredNodeInfo.member.avatarUrl ? (
              <img src={hoveredNodeInfo.member.avatarUrl} alt={hoveredNodeInfo.member.name} className="w-full h-full object-cover" />
            ) : (
              <span>{hoveredNodeInfo.member.surname}</span>
            )}
          </div>
          <div className="space-y-0.5 pr-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{hoveredNodeInfo.member.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">
                第 {hoveredNodeInfo.member.group} 組
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight">
              {hoveredNodeInfo.member.company}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {hoveredNodeInfo.member.title}
            </p>
          </div>
        </div>
      )}

      {/* Canvas 主體 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setHoveredNodeInfo(null)}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
