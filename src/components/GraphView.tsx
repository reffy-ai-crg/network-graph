"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { RotateCcw, ZoomIn, ZoomOut, Layers, Sparkles, Orbit, Compass } from "lucide-react";

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

  // 版面風格模式：galaxy (自由動態星系) | orbit (太陽系同心圓軌道)
  const [layoutStyle, setLayoutStyle] = useState<"galaxy" | "orbit">("galaxy");
  // 聚類維度：group (組別) | industry (產業)
  const [clusterMode, setClusterMode] = useState<"group" | "industry">("group");
  const [highlightedIndustry, setHighlightedIndustry] = useState<string>("all");
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{ member: UserProfile; x: number; y: number } | null>(null);

  // 圖片快取，確保 Canvas 60fps 順暢渲染真實頭像
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // 預加載所有成員頭像照片
  useEffect(() => {
    let isMounted = true;
    members.forEach((m) => {
      if (m.avatarUrl && !imageCacheRef.current.has(m.avatarUrl)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = m.avatarUrl;
        img.onload = () => {
          if (isMounted) {
            imageCacheRef.current.set(m.avatarUrl!, img);
          }
        };
      }
    });
    return () => {
      isMounted = false;
    };
  }, [members]);

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
  const touchStartRef = useRef<{ x: number; y: number; dist: number } | null>(null);
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

      // 導師半徑 24px (直徑48px高清)、助教與幹部 20px、本人 22px、學員 18px (清晰露出臉孔)
      const isLeaderRole = m.role?.includes("導師") || m.role?.includes("講師") || m.role?.includes("評審") || m.role?.includes("VIP") || m.role?.includes("講者");
      const isSubLeaderRole = m.role?.includes("助教") || m.role?.includes("組長") || m.role?.includes("幹部") || m.role?.includes("會長");
      const radius = isLeaderRole ? 24 : isSubLeaderRole ? 20 : m.isCurrentUser ? 22 : 18;

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
    const nodes = nodesRef.current;

    if (layoutStyle === "orbit") {
      // 🪐 太陽系軌道排版演算法：零重疊、中央尊榮太陽位、衛星小組同心環
      const groupMap = new Map<number, GraphNode[]>();
      nodes.forEach((n) => {
        const g = n.member.group;
        if (!groupMap.has(g)) groupMap.set(g, []);
        groupMap.get(g)!.push(n);
      });

      // 核心導師組 (Group 0)
      const g0List = groupMap.get(0) || [];
      g0List.forEach((n, idx) => {
        if (n === draggedNodeRef.current) return;
        const ang = (idx / Math.max(g0List.length, 1)) * Math.PI * 2;
        const rad = g0List.length === 1 ? 0 : 42;
        const tx = cx + Math.cos(ang) * rad;
        const ty = cy + Math.sin(ang) * rad;
        n.vx += (tx - n.x) * 0.08;
        n.vy += (ty - n.y) * 0.08;
      });

      // 各學員組 (Group 1..N) 分佈在外圍環形軌道
      const orbitRadius = Math.min(w, h) * 0.35;
      for (let g = 1; g <= maxGroup; g++) {
        const list = groupMap.get(g) || [];
        if (list.length === 0) continue;
        const gAngle = ((g - 1) / maxGroup) * Math.PI * 2 - Math.PI / 2;
        const gcx = cx + Math.cos(gAngle) * orbitRadius;
        const gcy = cy + Math.sin(gAngle) * orbitRadius;

        list.forEach((n, idx) => {
          if (n === draggedNodeRef.current) return;
          const subAng = (idx / list.length) * Math.PI * 2;
          const subRad = list.length === 1 ? 0 : 38;
          const tx = gcx + Math.cos(subAng) * subRad;
          const ty = gcy + Math.sin(subAng) * subRad;
          n.vx += (tx - n.x) * 0.08;
          n.vy += (ty - n.y) * 0.08;
        });
      }

      // 微幅彈性阻尼避免手動拖動過速
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node === draggedNodeRef.current) continue;
        node.vx *= 0.78;
        node.vy *= 0.78;
        node.x += node.vx;
        node.y += node.vy;
      }
      return;
    }

    // 🌟 自由星系聚類模式 (Galaxy Force)
    const groupCenters: { x: number; y: number }[] = [];
    groupCenters[0] = { x: cx, y: cy };
    for (let g = 1; g <= maxGroup; g++) {
      const ang = ((g - 1) / maxGroup) * Math.PI * 2;
      const rad = Math.min(w, h) * 0.32;
      groupCenters[g] = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad };
    }

    // 產業中心聚類點
    const indCenters: Record<string, { x: number; y: number }> = {};
    allIndustries.forEach((ind, i) => {
      const ang = (i / allIndustries.length) * Math.PI * 2;
      const rad = Math.min(w, h) * 0.30;
      indCenters[ind] = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad };
    });

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node === draggedNodeRef.current) continue;

      // 向心引力
      const targetCenter =
        clusterMode === "group"
          ? groupCenters[node.member.group]
          : indCenters[node.member.industry];

      if (targetCenter) {
        node.vx += (targetCenter.x - node.x) * 0.014;
        node.vy += (targetCenter.y - node.y) * 0.014;
      }

      // 互斥力 (徹底加強防重疊緩衝區，給膠囊姓名標籤留足空間)
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = node.radius + other.radius + 28; // 加大安全距離

        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.3;
          node.vx -= dx * force;
          node.vy -= dy * force;
          other.vx += dx * force;
          other.vy += dy * force;
        }
      }

      // 阻尼摩擦力
      node.vx *= 0.82;
      node.vy *= 0.82;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, [layoutStyle, clusterMode, allIndustries, members]);

  // 繪製畫布
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(transformRef.current.x, transformRef.current.y);
    ctx.scale(transformRef.current.k, transformRef.current.k);

    const nodes = nodesRef.current;
    const hoveredNode = hoveredNodeRef.current;

    // 0. 太陽系軌道同心圓參考虛線
    if (layoutStyle === "orbit") {
      const orbitRadius = Math.min(w, h) * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 導師核心光環
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "rgba(254, 243, 199, 0.45)" : "rgba(120, 53, 15, 0.25)";
      ctx.fill();
      ctx.strokeStyle = isLight ? "rgba(245, 158, 11, 0.5)" : "rgba(245, 158, 11, 0.35)";
      ctx.stroke();
      ctx.fillStyle = isLight ? "#b45309" : "#fbbf24";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👑 導師核心樞紐", cx, cy - 56);
    }

    // 1. 同組聚類背景星團光暈 (星系模式)
    if (layoutStyle === "galaxy" && clusterMode === "group") {
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
        ctx.arc(avgX, avgY, isRoaming ? 85 : 72, 0, Math.PI * 2);
        ctx.fillStyle = isRoaming
          ? (isLight ? "rgba(254, 243, 199, 0.65)" : "rgba(120, 53, 15, 0.25)")
          : (isLight ? "rgba(226, 232, 240, 0.65)" : "rgba(30, 41, 59, 0.35)");
        ctx.fill();
        ctx.strokeStyle = isRoaming
          ? (isLight ? "rgba(245, 158, 11, 0.8)" : "rgba(245, 158, 11, 0.5)")
          : (isLight ? "rgba(203, 213, 225, 0.75)" : "rgba(71, 85, 105, 0.25)");
        ctx.lineWidth = isRoaming ? 1.8 : 1;
        ctx.stroke();

        ctx.fillStyle = isRoaming
          ? (isLight ? "#b45309" : "#fbbf24")
          : (isLight ? "rgba(71, 85, 105, 0.85)" : "rgba(148, 163, 184, 0.6)");
        ctx.font = isRoaming ? "bold 11px sans-serif" : "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(isRoaming ? "🎓 巡迴導師與助教群" : `第 ${g} 組`, avgX, avgY - (isRoaming ? 64 : 52));
      });
    }

    // 2. 當滑鼠懸停節點時：繪製動態發光人脈關係線 (同組實線、同產業金黃虛線)
    if (hoveredNode) {
      // 同組連線
      const sameGroupPeers = nodes.filter(
        (n) => n.id !== hoveredNode.id && n.member.group === hoveredNode.member.group
      );
      if (sameGroupPeers.length > 0) {
        ctx.beginPath();
        sameGroupPeers.forEach((p) => {
          ctx.moveTo(hoveredNode.x, hoveredNode.y);
          ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = isLight ? "rgba(16, 185, 129, 0.8)" : "rgba(52, 211, 153, 0.8)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // 同產業跨組連線
      const sameIndPeers = nodes.filter(
        (n) => n.id !== hoveredNode.id && n.member.industry === hoveredNode.member.industry
      );
      if (sameIndPeers.length > 0) {
        ctx.beginPath();
        sameIndPeers.forEach((p) => {
          ctx.moveTo(hoveredNode.x, hoveredNode.y);
          ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = isLight ? "rgba(245, 158, 11, 0.85)" : "rgba(251, 191, 36, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 3. 產業高亮連線 (點選上方標籤時)
    if (highlightedIndustry !== "all" && !hoveredNode) {
      const matchedNodes = nodes.filter((n) => n.member.industry === highlightedIndustry);
      ctx.beginPath();
      for (let i = 0; i < matchedNodes.length; i++) {
        for (let j = i + 1; j < matchedNodes.length; j++) {
          ctx.moveTo(matchedNodes[i].x, matchedNodes[i].y);
          ctx.lineTo(matchedNodes[j].x, matchedNodes[j].y);
        }
      }
      ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.65)" : "rgba(245, 158, 11, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. 繪製成員節點 (圓形真實照片頭像 + 尊榮角色外環 + 防穿透膠囊姓名標籤)
    nodes.forEach((node) => {
      const isTeacher = node.member.role?.includes("導師") || node.member.role?.includes("講師") || node.member.role?.includes("評審");
      const isTA = node.member.role?.includes("助教");
      const isMatch = highlightedIndustry === "all" || node.member.industry === highlightedIndustry;
      const isConnectedToHovered =
        !hoveredNode ||
        node === hoveredNode ||
        node.member.group === hoveredNode.member.group ||
        node.member.industry === hoveredNode.member.industry;

      const opacity = (!isMatch || !isConnectedToHovered) ? 0.2 : 1;

      ctx.save();
      ctx.globalAlpha = opacity;

      // (A) 高亮發光光圈
      if ((highlightedIndustry !== "all" && isMatch) || node === hoveredNode) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.35)";
        ctx.fill();
      }

      // (B) 節點頭像裁剪與繪製
      const img = node.member.avatarUrl ? imageCacheRef.current.get(node.member.avatarUrl) : null;
      const hasImage = img && img.complete && img.naturalWidth > 0;

      if (hasImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, node.x - node.radius, node.y - node.radius, node.radius * 2, node.radius * 2);
        ctx.restore();
      } else {
        // 優雅漸層底色與大字姓氏
        const grad = ctx.createLinearGradient(
          node.x - node.radius,
          node.y - node.radius,
          node.x + node.radius,
          node.y + node.radius
        );
        if (node.member.isCurrentUser) {
          grad.addColorStop(0, "#34d399");
          grad.addColorStop(1, "#059669");
        } else if (isTeacher) {
          grad.addColorStop(0, "#fbbf24");
          grad.addColorStop(1, "#d97706");
        } else if (isTA) {
          grad.addColorStop(0, "#38bdf8");
          grad.addColorStop(1, "#0284c7");
        } else {
          grad.addColorStop(0, node.groupColor);
          grad.addColorStop(1, "#334155");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(node.radius * 0.72)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.member.surname, node.x, node.y);
      }

      // (C) 外環邊框（導師金環、助教藍環、本人翡翠環、一般組員俐落細環）
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      if (node === hoveredNode) {
        ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
        ctx.lineWidth = 3.5;
      } else if (node.member.isCurrentUser) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
      } else if (isTeacher) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3.2;
      } else if (isTA) {
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // (D) 身份角標（👑 導師皇冠標誌、我 本人標誌）
      if (isTeacher) {
        ctx.beginPath();
        ctx.arc(node.x + node.radius * 0.72, node.y - node.radius * 0.72, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#f59e0b";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("👑", node.x + node.radius * 0.72, node.y - node.radius * 0.72);
      } else if (node.member.isCurrentUser) {
        ctx.beginPath();
        ctx.arc(node.x + node.radius * 0.72, node.y - node.radius * 0.72, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.font = "bold 8px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("你", node.x + node.radius * 0.72, node.y - node.radius * 0.72);
      }

      // (E) 防重疊防穿透的「毛玻璃膠囊姓名標籤 (Pill Badge)」
      if (opacity > 0.4) {
        const name = node.member.name;
        ctx.font = (isTeacher || isTA) ? "bold 10px sans-serif" : "10px sans-serif";
        const textWidth = ctx.measureText(name).width;
        const pillW = Math.max(textWidth + 12, 38);
        const pillH = 17;
        const pillX = node.x - pillW / 2;
        const pillY = node.y + node.radius + 3;

        // 膠囊底色背景 (阻擋下方球體與線條穿透)
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(pillX, pillY, pillW, pillH, 8);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(15, 23, 42, 0.92)";
        ctx.fill();

        // 膠囊細邊框
        ctx.strokeStyle = isTeacher
          ? (isLight ? "rgba(245, 158, 11, 0.8)" : "rgba(245, 158, 11, 0.6)")
          : isTA
          ? (isLight ? "rgba(2, 132, 199, 0.8)" : "rgba(56, 189, 248, 0.6)")
          : node.member.isCurrentUser
          ? (isLight ? "rgba(16, 185, 129, 0.85)" : "rgba(52, 211, 153, 0.7)")
          : (isLight ? "rgba(226, 232, 240, 0.95)" : "rgba(51, 65, 85, 0.7)");
        ctx.lineWidth = 1;
        ctx.stroke();

        // 姓名文字
        ctx.fillStyle = isTeacher
          ? (isLight ? "#b45309" : "#fbbf24")
          : isTA
          ? (isLight ? "#0369a1" : "#38bdf8")
          : node.member.isCurrentUser
          ? (isLight ? "#047857" : "#34d399")
          : (isLight ? "#1e293b" : "#e2e8f0");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, node.x, pillY + pillH / 2);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [layoutStyle, clusterMode, highlightedIndustry, theme]);

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

  // 座標換算
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
      if (dist <= n.radius + 6) return n;
    }
    return null;
  };

  // 滑鼠操作
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

  // 手機觸控支援 (Touch Gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      const node = findNodeAt(pos);
      if (node) {
        draggedNodeRef.current = node;
        hoveredNodeRef.current = node;
        setHoveredNodeInfo({ member: node.member, x: touch.clientX, y: touch.clientY });
      } else {
        isPanningRef.current = true;
        panStartRef.current = {
          x: touch.clientX - transformRef.current.x,
          y: touch.clientY - transformRef.current.y,
        };
        setHoveredNodeInfo(null);
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, dist: 0 };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2, dist };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      if (draggedNodeRef.current) {
        draggedNodeRef.current.x = pos.x;
        draggedNodeRef.current.y = pos.y;
        draggedNodeRef.current.vx = 0;
        draggedNodeRef.current.vy = 0;
        setHoveredNodeInfo({ member: draggedNodeRef.current.member, x: touch.clientX, y: touch.clientY });
      } else if (isPanningRef.current) {
        transformRef.current.x = touch.clientX - panStartRef.current.x;
        transformRef.current.y = touch.clientY - panStartRef.current.y;
      }
    } else if (e.touches.length === 2 && touchStartRef.current && touchStartRef.current.dist > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = dist / touchStartRef.current.dist;
      transformRef.current.k = Math.max(0.5, Math.min(3, transformRef.current.k * (factor > 1 ? 1.03 : 0.97)));
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggedNodeRef.current && touchStartRef.current) {
      const touch = e.changedTouches[0];
      const moveDist = Math.hypot(touch.clientX - touchStartRef.current.x, touch.clientY - touchStartRef.current.y);
      if (moveDist < 8) {
        openDrawer(draggedNodeRef.current.member);
      }
    }
    draggedNodeRef.current = null;
    isPanningRef.current = false;
    touchStartRef.current = null;
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
        
        {/* 左側：排版風格與聚類維度雙切換 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 版面風格：星系 vs 太陽系軌道 */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm dark:shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setLayoutStyle("galaxy");
                showToast("已切換為「🌟 動態自由星系」模式");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                layoutStyle === "galaxy"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>自由星系</span>
            </button>
            <button
              onClick={() => {
                setLayoutStyle("orbit");
                showToast("已切換為「🪐 太陽系小組軌道」模式（零重疊結構）");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                layoutStyle === "orbit"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>太陽系軌道</span>
            </button>
          </div>

          {/* 聚類維度（星系模式時顯示） */}
          {layoutStyle === "galaxy" && (
            <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 px-2 shadow-sm dark:shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1 text-xs animate-in fade-in duration-200">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setClusterMode("group");
                  showToast("已切換為「課程組別」向心聚類");
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                  clusterMode === "group"
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                依組別
              </button>
              <button
                onClick={() => {
                  setClusterMode("industry");
                  showToast("已切換為「產業領域」向心聚類");
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                  clusterMode === "industry"
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                依產業
              </button>
            </div>
          )}
        </div>

        {/* 右側：產業標籤高亮 */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 px-2 shadow-sm dark:shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1 overflow-x-auto max-w-full text-xs no-scrollbar transition-colors">
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
        💡 支援頭像照片 • 滑鼠懸停/點擊查看關係連線 • 點擊頭像滑出詳細名片
      </div>

      {/* 懸浮節點時放大的即時照片與資料浮動卡片 (Hover Magnified Photo Preview) */}
      {hoveredNodeInfo && (
        <div
          className="fixed pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: hoveredNodeInfo.x, top: hoveredNodeInfo.y - 14 }}
        >
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-2 border-emerald-500/30 shrink-0 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shadow-sm">
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
                {hoveredNodeInfo.member.group === 0 ? "巡迴導師" : `第 ${hoveredNodeInfo.member.group} 組`}
              </span>
              {hoveredNodeInfo.member.role && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/30">
                  {hoveredNodeInfo.member.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight">
              {hoveredNodeInfo.member.company}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {hoveredNodeInfo.member.title} • {hoveredNodeInfo.member.industry}
            </p>
          </div>
        </div>
      )}

      {/* Canvas 主體 (支援滑鼠與手機觸控手勢) */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          hoveredNodeRef.current = null;
          setHoveredNodeInfo(null);
        }}
        onClick={handleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
