"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { Search, X, MessageSquare, ExternalLink, StickyNote, Award, CreditCard, ZoomIn, Crown, Briefcase, User, Users, Share2, RefreshCw, Sparkles, UserPlus } from "lucide-react";

interface DirectoryViewProps {
  onOpenEditModal?: () => void;
}

export function DirectoryView({ onOpenEditModal }: DirectoryViewProps = {}) {
  const { members, openDrawer, privateNotes, showToast, currentEvent, refreshMembers } = useNetwork();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("全部");
  const [selectedGroup, setSelectedGroup] = useState<string>("全部");
  const [selectedRole, setSelectedRole] = useState<string>("全部");
  const [previewMember, setPreviewMember] = useState<UserProfile | null>(null);

  const groups = useMemo(() => {
    const groupNums = new Set<number>();
    const total = currentEvent?.totalGroups || 10;
    for (let i = 1; i <= Math.max(total, 10); i++) {
      groupNums.add(i);
    }
    members.forEach((m) => {
      if (m.group) groupNums.add(m.group);
    });
    const sorted = Array.from(groupNums).sort((a, b) => a - b);
    return ["全部", "🎓 巡迴指導", ...sorted.map((g) => `第 ${g} 組`)];
  }, [members, currentEvent?.totalGroups]);

  const allIndustries = useMemo(() => {
    const customSet = new Set<string>();
    members.forEach((m) => {
      if (m.industry && !INDUSTRIES.includes(m.industry)) {
        customSet.add(m.industry);
      }
    });
    return [...INDUSTRIES, ...Array.from(customSet)];
  }, [members]);

  const roomRoles = useMemo(() => {
    if (currentEvent?.customRoles && currentEvent.customRoles.length > 0) {
      return currentEvent.customRoles;
    }
    return ["授課導師", "隨班助教", "組長幹部", "一般學員"];
  }, [currentEvent?.customRoles]);

  const matchesRole = useCallback((memberRole: string | undefined, filterRole: string) => {
    if (filterRole === "全部") return true;
    const mRole = (memberRole || "一般學員").trim();
    if (mRole === filterRole) return true;

    // 導師 / 講師 / 授課導師
    if (filterRole.includes("導師") || filterRole.includes("講師") || filterRole === "講師") {
      if (mRole.includes("導師") || mRole.includes("講師") || mRole === "講師") return true;
    }
    // 助教 / 隨班助教
    if (filterRole.includes("助教") || filterRole === "助教") {
      if (mRole.includes("助教") || mRole === "助教") return true;
    }
    // 組長 / 組長幹部 / 副組長 / 隊長
    if (filterRole.includes("組長") || filterRole.includes("幹部") || filterRole.includes("隊長") || filterRole === "組長") {
      if (mRole.includes("組長") || mRole.includes("幹部") || mRole.includes("隊長") || mRole === "副組長") return true;
    }
    // 學員 / 一般學員 / 會員 / 參賽者
    if (filterRole.includes("學員") || filterRole.includes("會員") || filterRole.includes("參賽") || filterRole === "學員") {
      if (mRole.includes("學員") || mRole.includes("會員") || mRole.includes("參賽") || !memberRole || memberRole === "學員") return true;
    }

    return mRole.toLowerCase() === filterRole.toLowerCase() || mRole.includes(filterRole) || filterRole.includes(mRole);
  }, []);

  const roleFilters = useMemo(() => {
    return [
      { id: "全部", label: "全部成員", count: members.length },
      ...roomRoles.map((role) => {
        let icon = "👤 ";
        if (role.includes("導師") || role.includes("講師") || role.includes("講者")) icon = "👨‍🏫 ";
        else if (role.includes("助教")) icon = "💼 ";
        else if (role.includes("組長") || role.includes("隊長") || role.includes("會長") || role.includes("幹部")) icon = "🌟 ";
        else if (role.includes("評審") || role.includes("貴賓") || role.includes("VIP") || role.includes("顧問")) icon = "👑 ";
        else if (role.includes("投資") || role.includes("創投") || role.includes("天使")) icon = "💎 ";
        else if (role.includes("參賽") || role.includes("黑客") || role.includes("選手")) icon = "🚀 ";

        const count = members.filter((m) => matchesRole(m.role, role)).length;
        return {
          id: role,
          label: `${icon}${role}`,
          count,
        };
      }),
    ];
  }, [members, roomRoles, matchesRole]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchInd = selectedIndustry === "全部" || m.industry === selectedIndustry;
      const matchGrp =
        selectedGroup === "全部" ||
        (selectedGroup === "🎓 巡迴指導" && m.group === 0) ||
        `第 ${m.group} 組` === selectedGroup;

      const matchRole = matchesRole(m.role, selectedRole);

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.company.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query) ||
        (m.role && m.role.toLowerCase().includes(query)) ||
        m.offer.toLowerCase().includes(query) ||
        m.seek.toLowerCase().includes(query);

      return matchInd && matchGrp && matchRole && matchQuery;
    });
  }, [members, selectedIndustry, selectedGroup, selectedRole, searchQuery, matchesRole]);

  const handleLineClick = (e: React.MouseEvent, member: UserProfile) => {
    e.stopPropagation();
    showToast(`已複製 ${member.name} 的 LINE ID (${member.lineId})，準備開啟 LINE App！`);
  };

  const handleLinkedInClick = (e: React.MouseEvent, member: UserProfile) => {
    e.stopPropagation();
    showToast(`正在開啟 ${member.name} 的 LinkedIn 檔案...`);
    window.open(member.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-6xl mx-auto w-full">
      {/* 純淨真實模式專屬提示橫幅 */}
      {currentEvent?.isDemoMode === false && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-2xl px-4 py-3 mb-3.5 text-emerald-900 dark:text-emerald-200 shadow-xs backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🌱</span>
            <span className="leading-snug">
              <strong>純淨真實模式已生效</strong>：本活動房不含任何 55 位虛擬示範名單，目前全體共 <strong>{members.length}</strong> 位真實成員。
            </span>
          </div>
          <button
            onClick={() => {
              const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
              const inviteUrl = `${liffBaseUrl}?event=${currentEvent?.slug || "aia"}`;
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(inviteUrl);
                showToast(`已複製專屬邀請連結！可直接貼給同學：\n${inviteUrl}`);
              }
            }}
            className="text-[11px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/80 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition shrink-0 shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3 h-3" />
            <span>複製專屬邀請連結</span>
          </button>
        </div>
      )}

      {/* 搜尋與複合過濾器 */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 mb-4 space-y-3 shadow-xs dark:shadow-md backdrop-blur-sm transition-colors">
        {/* 關鍵字搜尋 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名、公司、職位或技術資源 (如: 台積電, LLM, 經理)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 身分角色過濾 (導師、助教、組長、學員) */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>🎖️ 身分角色篩選：</span>
              <span className="text-[10px] text-slate-400">（快速查找老師、助教或組長）</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
              共 {filteredMembers.length} 位成員
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {roleFilters.map(({ id, label, count }) => {
              const isSelected = selectedRole === id;
              const isLead = id.includes("導師") || id.includes("講師") || id.includes("評審") || id.includes("VIP");
              const isTA = id.includes("助教") || id.includes("顧問");
              const isLeader = id.includes("組長") || id.includes("幹部") || id.includes("隊長") || id.includes("會長");

              return (
                <button
                  key={id}
                  onClick={() => setSelectedRole(id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition border flex items-center gap-1.5 ${
                    isSelected
                      ? isLead
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500 font-bold shadow-xs ring-1 ring-amber-400/50"
                        : isTA
                        ? "bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-500 font-bold shadow-xs ring-1 ring-sky-400/50"
                        : isLeader
                        ? "bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-500 font-bold shadow-xs ring-1 ring-indigo-400/50"
                        : "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500 font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 產業標籤過濾 */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>🏢 產業分類：</span>
            <span className="text-slate-400 text-[10px]">
              點選分類查看跨公司夥伴
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {["全部", ...allIndustries].map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition border ${
                  selectedIndustry === ind
                    ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500 font-semibold"
                    : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* 組別過濾 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">🧩 組別快速定位：</div>
            {/* 1~50 組快速下拉跳轉 */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">快速選組：</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 font-medium focus:outline-none focus:border-emerald-500"
              >
                {groups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition border ${
                  selectedGroup === grp
                    ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500 font-semibold"
                    : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 名片網格清單 */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMembers.map((member) => {
            const hasNote = !!privateNotes[member.id];
            const isSelf = member.isCurrentUser;
            const isLeaderRole = member.role?.includes("導師") || member.role?.includes("講師") || member.role?.includes("講者") || member.role?.includes("評審");
            const isSubRole = member.role?.includes("助教") || member.role?.includes("顧問");
            const isGroupLead = member.role?.includes("組長") || member.role?.includes("副組長") || member.role?.includes("隊長") || member.role?.includes("會長") || member.role?.includes("幹部");

            return (
              <div
                key={member.id}
                onClick={() => openDrawer(member)}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md ${
                  isLeaderRole
                    ? "bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-400/60 ring-1 ring-amber-400/30"
                    : isSubRole
                    ? "bg-gradient-to-br from-sky-500/10 via-white to-sky-500/5 dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-900 border-sky-400/60 ring-1 ring-sky-400/30"
                    : isSelf
                    ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/70 ring-1 ring-emerald-500/50"
                    : "bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* 頂部姓名與所屬企業 */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3.5">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewMember(member);
                        }}
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 group-hover:scale-102 transition shadow-md overflow-hidden relative cursor-zoom-in group/avatar ${
                          isLeaderRole
                            ? "bg-amber-100 text-amber-800 border-2 border-amber-400"
                            : isSubRole
                            ? "bg-sky-100 text-sky-800 border-2 border-sky-400"
                            : "bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400"
                        }`}
                        title="點擊放大查看大頭貼照片"
                      >
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{member.surname}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5 drop-shadow" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs rounded-md p-0.5 text-white/90 shadow-xs">
                          <ZoomIn className="w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {member.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                              我
                            </span>
                          )}
                          {member.role && member.role !== "學員" && member.role !== "一般學員" && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs border ${
                              isLeaderRole
                                ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/50"
                                : isSubRole
                                ? "bg-sky-500/20 text-sky-900 dark:text-sky-200 border-sky-500/40"
                                : isGroupLead
                                ? "bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border-indigo-500/40"
                                : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                            }`}>
                              <span>
                                {isLeaderRole ? "👨‍🏫" : isSubRole ? "💼" : isGroupLead ? "🌟" : "👤"}
                              </span>
                              <span>
                                {member.role === "講師" ? "授課導師" : member.role === "助教" ? "隨班助教" : member.role}
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight mt-0.5">
                          {member.company}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                        member.group === 0
                          ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 font-bold"
                          : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        {member.group === 0 ? "🎓 巡迴指導" : `第 ${member.group} 組`}
                      </span>
                      {member.businessCardUrl && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5 font-medium">
                          <CreditCard className="w-2.5 h-2.5" />
                          <span>含名片</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {member.industry}
                      </span>
                    </div>
                  </div>

                  {/* Offer & Seek 資訊摘要 */}
                  <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="truncate text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">能提供：</span>
                      {member.offer}
                    </div>
                    <div className="truncate text-slate-600 dark:text-slate-400">
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">在尋找：</span>
                      {member.seek}
                    </div>
                  </div>
                </div>

                {/* 底部動作條 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-[11px]">
                    {hasNote ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                        <StickyNote className="w-3 h-3" />
                        <span>已記錄筆記</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition">
                        <StickyNote className="w-3 h-3" />
                        <span>+ 私密筆記</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleLineClick(e, member)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>加 LINE</span>
                    </button>
                    <button
                      onClick={(e) => handleLinkedInClick(e, member)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-[11px] font-medium transition flex items-center gap-1 dark:border-slate-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : members.length === 0 ? (
        /* 全新活動房間專屬空狀態（純淨真實模式，0 位虛擬人） */
        <div className="flex flex-col items-center justify-center py-14 px-5 text-center bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm my-4 max-w-xl mx-auto w-full space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl shadow-inner">
            🌱
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                歡迎來到全新活動房間！
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700/50">
                純淨真實模式
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              「{currentEvent?.title}」目前尚未有成員進駐（無任何虛擬示範名單）。您可以建立第一張名片，或將專屬邀請發送給同學！
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
            {onOpenEditModal && (
              <button
                onClick={onOpenEditModal}
                className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>立即建立 / 填寫我的名片</span>
              </button>
            )}
            <button
              onClick={() => {
                const liffBaseUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "2011804167-FfkxQ4P2"}`;
                const inviteUrl = `${liffBaseUrl}?event=${currentEvent?.slug || "aia"}`;
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(inviteUrl);
                  showToast(`已複製專屬邀請連結！可直接貼至 LINE 班群邀請同學加入：\n${inviteUrl}`);
                }
              }}
              className="w-full sm:flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>複製 LINE 邀請連結</span>
            </button>
          </div>

          <button
            onClick={refreshMembers}
            className="text-[11px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition pt-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>重新整理雲端最新名單</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">沒有找到符合條件的同學名片</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            請嘗試更換搜尋關鍵字，或重設產業與組別標籤
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedIndustry("全部");
              setSelectedGroup("全部");
            }}
            className="mt-4 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition font-medium"
          >
            重設所有篩選條件
          </button>
        </div>
      )}

      {/* 外面直接點擊照片的大圖放大燈箱 (Photo Zoom Lightbox) */}
      {previewMember && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewMember(null)}
        >
          <div
            className="relative max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={() => setPreviewMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition z-10"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 大圖展示區域 */}
            <div className="w-full aspect-square max-h-[60vh] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
              {previewMember.avatarUrl ? (
                <img
                  src={previewMember.avatarUrl}
                  alt={previewMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-800 to-teal-700 text-white p-6 text-center">
                  <span className="text-7xl font-black mb-2">{previewMember.surname}</span>
                  <span className="text-xl font-bold">{previewMember.name}</span>
                  <span className="text-sm opacity-80 mt-1">{previewMember.company}</span>
                </div>
              )}
            </div>

            {/* 個人資訊與快速按鈕 */}
            <div className="w-full flex items-center justify-between text-left pt-1">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">{previewMember.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    previewMember.group === 0
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}>
                    {previewMember.group === 0 ? "🎓 巡迴指導" : `第 ${previewMember.group} 組`}
                  </span>
                  {previewMember.role === "講師" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      👨‍🏫 授課導師
                    </span>
                  )}
                  {previewMember.role === "助教" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                      💼 隨班助教
                    </span>
                  )}
                  {previewMember.role && previewMember.role !== "學員" && previewMember.role !== "講師" && previewMember.role !== "助教" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      {previewMember.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {previewMember.company} · {previewMember.title}
                </p>
              </div>

              <button
                onClick={() => {
                  const m = previewMember;
                  setPreviewMember(null);
                  openDrawer(m);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <span>查看完整名片</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
