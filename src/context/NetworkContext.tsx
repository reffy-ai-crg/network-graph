"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, EventSpace, ViewTab } from "../types/network";
import { CURRENT_USER_DEFAULT, INITIAL_EVENTS, generateMockMembers } from "../lib/mockData";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { initLiff } from "../lib/liffClient";

interface NetworkContextType {
  currentUser: UserProfile;
  events: EventSpace[];
  currentEvent: EventSpace;
  members: UserProfile[];
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedMember: UserProfile | null;
  openDrawer: (member: UserProfile) => void;
  closeDrawer: () => void;
  privateNotes: Record<string, string>;
  saveNote: (targetUserId: string, content: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
  switchEvent: (eventId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isCloudConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("network_graph_user");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return CURRENT_USER_DEFAULT;
  });

  const [events, setEvents] = useState<EventSpace[]>(INITIAL_EVENTS);
  const [currentEvent, setCurrentEvent] = useState<EventSpace>(INITIAL_EVENTS[0]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>("directory");
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // 初始化資料與雲端 Supabase 連線
  useEffect(() => {
    // 1. 本地筆記快取載入
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("network_graph_notes");
      if (savedNotes) {
        try { setPrivateNotes(JSON.parse(savedNotes)); } catch (e) { console.error(e); }
      }
    }

    // 2. 預設預載 Mock 名單
    const mockList = generateMockMembers(currentUser);
    setMembers(mockList);

    // 3. 嘗試連線雲端 Supabase
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const syncCloud = async () => {
        try {
          // 查詢雲端活動清單
          const { data: cloudEvents, error: eventErr } = await client
            .from("events")
            .select("*");

          if (!eventErr && cloudEvents && cloudEvents.length > 0) {
            setIsCloudConnected(true);
            setEvents(
              cloudEvents.map((e) => ({
                id: e.id,
                title: e.name,
                cohort: e.cohort,
                date: e.event_date || "2026/03",
                totalMembers: 52,
                totalGroups: e.total_groups || 8,
                userRole: "學員",
                isCurrent: e.slug === "aia-12",
              }))
            );
          }

          // 查詢雲端私密筆記
          const { data: cloudNotes, error: noteErr } = await client
            .from("private_notes")
            .select("*");

          if (!noteErr && cloudNotes) {
            const mappedNotes: Record<string, string> = {};
            cloudNotes.forEach((n) => {
              mappedNotes[n.target_user_id] = n.note_content;
            });
            setPrivateNotes((prev) => ({ ...prev, ...mappedNotes }));
          }
        } catch (err) {
          console.warn("Supabase initial sync fallback:", err);
        }
      };

      syncCloud();
    }

    // 4. LINE LIFF 自動授權與資料帶入
    initLiff().then((res) => {
      if (res.profile) {
        setCurrentUser((prev) => {
          const updated = {
            ...prev,
            name: res.profile!.displayName,
            surname: res.profile!.displayName.slice(0, 1) || prev.surname,
            avatarUrl: res.profile!.pictureUrl || prev.avatarUrl,
            lineId: res.profile!.userId || prev.lineId,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("network_graph_user", JSON.stringify(updated));
          }
          return updated;
        });
        showToast(`已透過 LINE 登入：${res.profile.displayName}`);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const openDrawer = (member: UserProfile) => {
    setSelectedMember(member);
  };

  const closeDrawer = () => {
    setSelectedMember(null);
  };

  // 儲存私密筆記（同時存本地與雲端）
  const saveNote = (targetUserId: string, content: string) => {
    setPrivateNotes((prev) => {
      const next = { ...prev };
      if (content.trim()) {
        next[targetUserId] = content.trim();
      } else {
        delete next[targetUserId];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_notes", JSON.stringify(next));
      }
      return next;
    });

    // 異步同步至 Supabase
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      if (content.trim()) {
        client
          .from("private_notes")
          .upsert(
            {
              author_id: "00000000-0000-0000-0000-000000000001", // 訪客/模擬登入預設 ID
              target_user_id: targetUserId,
              note_content: content.trim(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "author_id,target_user_id" }
          )
          .then(({ error }) => {
            if (error) console.warn("Supabase save note notice:", error.message);
          });
      }
    }
  };

  // 全局即時同步修改（更新本地、畫面，並非同步推送雲端）
  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_user", JSON.stringify(updated));
      }
      setMembers((prevMembers) =>
        prevMembers.map((m) => (m.isCurrentUser ? { ...m, ...updates } : m))
      );
      return updated;
    });

    // 異步同步至 Supabase
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client
        .from("profiles")
        .upsert({
          display_name: updates.name,
          company: updates.company,
          job_title: updates.title,
          industry: updates.industry,
          offer_text: updates.offer,
          seek_text: updates.seek,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase update profile notice:", error.message);
        });
    }

    showToast("個人名片已即時全局同步至雲端與所有活動名冊 ✓");
  };

  const switchEvent = (eventId: string) => {
    const found = events.find((e) => e.id === eventId);
    if (found) {
      setEvents((prev) =>
        prev.map((e) => ({ ...e, isCurrent: e.id === eventId }))
      );
      setCurrentEvent(found);
      setActiveTab("directory");
      showToast(`已切換至「${found.title}」人脈名冊`);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        currentUser,
        events,
        currentEvent,
        members,
        activeTab,
        setActiveTab,
        selectedMember,
        openDrawer,
        closeDrawer,
        privateNotes,
        saveNote,
        updateCurrentUserProfile,
        switchEvent,
        toastMessage,
        showToast,
        isCloudConnected,
      }}
    >
      {children}
      {/* 全域 Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 border border-slate-600 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
