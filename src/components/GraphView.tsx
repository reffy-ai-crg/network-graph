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
  "#f59e0b", "#06b6d4", "#f97316", "#84cc16"
];

const INDUSTRY_COLORS: Record<IndustryType, string> = {
  "半導體": "#f59e0b",
  "軟體與雲端": "#38bdf8",
  "金融科技": "#34d399",
  "生技醫療": "#f43f5e",
  "智慧製造": "#c084fc",
  "其他領域": "#94a3b8"
};

export function GraphView() {
  const { members, openDrawer, showToast, theme } = useNetwork();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [clusterMode, setClusterMode] = useState<"group" | "industry">("group");
  const [highlightedIndustry, setHighlightedIndustry] = useState<string>("all");

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

    nodesRef.current = members.map((m) => {
      const groupAngle = ((m.group - 1) / 8) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.32;
      const targetX = cx + Math.cos(groupAngle) * radius + (Math.random() - 0.5) * 60;
      const targetY = cy + Math.sin(groupAngle) * radius + (Math.random() - 0.5) * 60;

      return {
        id: m.id,
        member: m,
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        radius: m.isCurrentUser ? 18 : 14,
        groupColor: GROUP_COLORS[(m.group - 1) % GROUP_COLORS.length],
        industryColor: INDUSTRY_COLORS[m.industry] || "#94a3b8",
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

    // 組別中心聚類點
    const groupCenters: { x: number; y: number }[] = [];
    for (let g = 1; g <= 8; g++) {
      const ang = ((g - 1) / 8) * Math.PI * 2;
      const rad = Math.min(w, h) * 0.30;
      groupCenters[g] = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad };
    }

    // 產業中心聚類點
    const indCenters: Record<string, { x: number; y: number }> = {};
    INDUSTRIES.forEach((ind, i) => {
      const ang = (i / INDUSTRIES.length) * Math.PI * 2;
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
  }, [clusterMode]);

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

        ctx.beginPath();
        ctx.arc(avgX, avgY, 68, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(226, 232, 240, 0.7)" : "rgba(30, 41, 59, 0.4)";
        ctx.fill();
        ctx.strokeStyle = isLight ? "rgba(203, 213, 225, 0.8)" : "rgba(71, 85, 105, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isLight ? "rgba(71, 85, 105, 0.85)" : "rgba(148, 163, 184, 0.6)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`第 ${g} 組`, avgX, avgY - 50);
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

      ctx.save();
      ctx.globalAlpha = opacity;

      // 發光光圈
      if (highlightedIndustry !== "all" && isMatch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.25)";
        ctx.fill();
      }

      // 節點本體
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.member.isCurrentUser
        ? "#10b981"
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
      ctx.font = `bold ${node.member.isCurrentUser ? 11 : 9}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.member.surname, node.x, node.y);

      // 下方姓名文字
      if (opacity > 0.5) {
        ctx.fillStyle = isLight ? "#1e293b" : "#cbd5e1";
        ctx.font = isLight ? "bold 9px sans-serif" : "9px sans-serif";
        ctx.fillText(node.member.name, node.x, node.y + node.radius + 11);
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
    hoveredNodeRef.current = findNodeAt(pos);

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
          {INDUSTRIES.map((ind) => (
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

      {/* Canvas 主體 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
