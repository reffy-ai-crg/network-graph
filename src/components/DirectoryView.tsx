"use client";

import React, { useState, useMemo } from "react";
import { useNetwork } from "../context/NetworkContext";
import { INDUSTRIES } from "../lib/mockData";
import { IndustryType, UserProfile } from "../types/network";
import { Search, X, MessageSquare, ExternalLink, StickyNote, Award } from "lucide-react";

export function DirectoryView() {
  const { members, openDrawer, privateNotes, showToast } = useNetwork();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("全部");
  const [selectedGroup, setSelectedGroup] = useState<string>("全部");

  const groups = useMemo(() => ["全部", "第 1 組", "第 2 組", "第 3 組", "第 4 組", "第 5 組", "第 6 組", "第 7 組", "第 8 組"], []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchInd = selectedIndustry === "全部" || m.industry === selectedIndustry;
      const matchGrp = selectedGroup === "全部" || `第 ${m.group} 組` === selectedGroup;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.company.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query) ||
        m.offer.toLowerCase().includes(query) ||
        m.seek.toLowerCase().includes(query);
      return matchInd && matchGrp && matchQuery;
    });
  }, [members, selectedIndustry, selectedGroup, searchQuery]);

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
      {/* 搜尋與複合過濾器 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-4 space-y-3 shadow-md backdrop-blur-sm">
        {/* 關鍵字搜尋 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名、公司、職位或技術資源 (如: 台積電, LLM, 經理)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 產業標籤過濾 */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>🏢 產業分類：</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              共 {filteredMembers.length} 位成員
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {["全部", ...INDUSTRIES].map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition border ${
                  selectedIndustry === ind
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* 組別過濾 */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium">🧩 組別快速定位：</div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition border ${
                  selectedGroup === grp
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
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

            return (
              <div
                key={member.id}
                onClick={() => openDrawer(member)}
                className={`bg-slate-900/60 hover:bg-slate-900 border ${
                  isSelf
                    ? "border-emerald-500/70 ring-1 ring-emerald-500/50"
                    : "border-slate-800"
                } rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer group`}
              >
                <div>
                  {/* 頂部姓名與所屬企業 */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-base text-emerald-400 shrink-0 group-hover:scale-105 transition shadow-inner">
                        {member.surname}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">
                            {member.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                              我
                            </span>
                          )}
                          {member.role === "組長" && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" />
                              組長
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
                          {member.company}
                        </p>
                        <p className="text-[11px] text-slate-400">{member.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                        第 {member.group} 組
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {member.industry}
                      </span>
                    </div>
                  </div>

                  {/* Offer & Seek 資訊摘要 */}
                  <div className="space-y-1.5 text-[11px] bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80">
                    <div className="truncate text-slate-300">
                      <span className="text-emerald-400 font-semibold">能提供：</span>
                      {member.offer}
                    </div>
                    <div className="truncate text-slate-400">
                      <span className="text-sky-400 font-semibold">在尋找：</span>
                      {member.seek}
                    </div>
                  </div>
                </div>

                {/* 底部動作條 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-[11px]">
                    {hasNote ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <StickyNote className="w-3 h-3" />
                        <span>已記錄筆記</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 group-hover:text-slate-400">
                        <StickyNote className="w-3 h-3" />
                        <span>+ 私密筆記</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleLineClick(e, member)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-medium transition flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>加 LINE</span>
                    </button>
                    <button
                      onClick={(e) => handleLinkedInClick(e, member)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition flex items-center gap-1 border border-slate-700"
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-300">沒有找到符合條件的同學名片</p>
          <p className="text-xs text-slate-500 mt-1">
            請嘗試更換搜尋關鍵字，或重設產業與組別標籤
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedIndustry("全部");
              setSelectedGroup("全部");
            }}
            className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            重設所有篩選條件
          </button>
        </div>
      )}
    </div>
  );
}
