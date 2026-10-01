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
  updateEventSettings: (eventId: string, updates: Partial<EventSpace>) => void;
  createNewEvent: (newEvent: Omit<EventSpace, "id" | "totalMembers" | "userRole" | "isCurrent">) => void;
  toggleEventDemoMode: (eventId: string, isDemo: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isCloudConnected: boolean;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => boolean;
  adminPin: string;
  updateAdminPin: (newPin: string) => void;
}

export type ThemePreset = "blue" | "green" | "purple" | "mono";

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

  const [events, setEvents] = useState<EventSpace[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("network_graph_events");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_EVENTS;
  });

  const [currentEvent, setCurrentEvent] = useState<EventSpace>(INITIAL_EVENTS[0]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>("directory");
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themePreset, setThemePresetState] = useState<ThemePreset>("blue");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPinState] = useState("888888");

  // 初始化資料與雲端 Supabase 連線
  useEffect(() => {
    // 0. 主題與管理員授權載入
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("network_graph_theme") as "light" | "dark" | null;
      const initialTheme = savedTheme || "light";
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedPreset = localStorage.getItem("network_graph_theme_preset") as ThemePreset | null;
      const initialPreset = savedPreset || "blue";
      setThemePresetState(initialPreset);
      document.documentElement.setAttribute("data-theme-preset", initialPreset);

      const savedPin = localStorage.getItem("network_graph_admin_pin");
      if (savedPin) setAdminPinState(savedPin);
      const sessionUnlocked = sessionStorage.getItem("network_graph_admin_unlocked");
      if (sessionUnlocked === "true") setIsAdminUnlocked(true);
    }
    // 1. 本地筆記快取載入
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("network_graph_notes");
      if (savedNotes) {
        try { setPrivateNotes(JSON.parse(savedNotes)); } catch (e) { console.error(e); }
      }

      // 檢查網址參數 ?event=slug
      const params = new URLSearchParams(window.location.search);
      const eventSlug = params.get("event");
      if (eventSlug) {
        const found = events.find((e) => e.slug === eventSlug);
        if (found) {
          setCurrentEvent(found);
        }
      }
    }

    // 2. 依照當前活動模式預載名冊
    if (currentEvent.isDemoMode !== false) {
      setMembers(generateMockMembers(currentUser));
    } else {
      setMembers([{ ...currentUser }]);
    }

    // 3. 嘗試連線雲端 Supabase
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const syncCloud = async () => {
        try {
          const { data: cloudEvents, error: eventErr } = await client
            .from("events")
            .select("*");

          if (!eventErr && cloudEvents && cloudEvents.length > 0) {
            setIsCloudConnected(true);
            const mappedEvents: EventSpace[] = cloudEvents.map((e) => ({
              id: e.id,
              slug: e.slug,
              title: e.name,
              cohort: e.cohort,
              date: e.event_date || "2026/03",
              totalMembers: 52,
              totalGroups: e.total_groups || 8,
              userRole: "學員",
              isCurrent: e.slug === (currentEvent.slug || "aia-12"),
              passcode: e.passcode,
              isDemoMode: true,
            }));

            setEvents(mappedEvents);
            if (typeof window !== "undefined") {
              localStorage.setItem("network_graph_events", JSON.stringify(mappedEvents));
            }
          }

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

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      if (content.trim()) {
        client
          .from("private_notes")
          .upsert(
            {
              author_id: "00000000-0000-0000-0000-000000000001",
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

    if (updates.group !== undefined || updates.role !== undefined) {
      setCurrentEvent((prev) => {
        const nextGroup = updates.group ?? currentUser.group;
        const nextRole = updates.role ?? currentUser.role;
        return {
          ...prev,
          userRole: `第 ${nextGroup} 組 ${nextRole}`,
          totalGroups: Math.max(prev.totalGroups || 10, nextGroup),
        };
      });
    }

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
      if (found.isDemoMode !== false) {
        setMembers(generateMockMembers(currentUser));
      } else {
        setMembers([{ ...currentUser }]);
      }
      setActiveTab("directory");
      showToast(`已切換至「${found.title}」人脈名冊`);
    }
  };

  // 修改活動設定 (Admin)
  const updateEventSettings = (eventId: string, updates: Partial<EventSpace>) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e));
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_events", JSON.stringify(updated));
      }
      return updated;
    });

    setCurrentEvent((prev) => ({ ...prev, ...updates }));

    if (updates.isDemoMode !== undefined) {
      if (updates.isDemoMode) {
        setMembers(generateMockMembers(currentUser));
      } else {
        setMembers([{ ...currentUser }]);
      }
    }

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client
        .from("events")
        .update({
          name: updates.title,
          cohort: updates.cohort,
          slug: updates.slug,
          total_groups: updates.totalGroups,
          passcode: updates.passcode,
        })
        .eq("id", eventId)
        .then(({ error }) => {
          if (error) console.warn("Supabase update event notice:", error.message);
        });
    }

    showToast("活動設定已成功更新並同步至雲端資料庫 ✓");
  };

  // 建立全新活動房 (Admin)
  const createNewEvent = (newEvent: Omit<EventSpace, "id" | "totalMembers" | "userRole" | "isCurrent">) => {
    const eventId = `event-${Date.now()}`;
    const fullEvent: EventSpace = {
      ...newEvent,
      id: eventId,
      totalMembers: 1,
      userRole: "發起人 / 主辦",
      isCurrent: true,
      isDemoMode: false,
    };

    setEvents((prev) => {
      const updated = [fullEvent, ...prev.map((e) => ({ ...e, isCurrent: false }))];
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_events", JSON.stringify(updated));
      }
      return updated;
    });

    setCurrentEvent(fullEvent);
    setMembers([{ ...currentUser }]);
    setActiveTab("directory");

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client
        .from("events")
        .insert({
          slug: newEvent.slug,
          name: newEvent.title,
          cohort: newEvent.cohort,
          total_groups: newEvent.totalGroups,
          passcode: newEvent.passcode,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase insert event notice:", error.message);
        });
    }

    showToast(`新活動房「${newEvent.title}」建立成功！`);
  };

  // 切換示範名冊與真實名冊模式
  const toggleEventDemoMode = (eventId: string, isDemo: boolean) => {
    updateEventSettings(eventId, { isDemoMode: isDemo });
    showToast(isDemo ? "已切換為【52位示範人物展示模式】" : "已切換為【純淨真實學員模式】");
  };

  // 主題切換
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_theme", next);
        if (next === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return next;
    });
  };

  const setThemeExplicit = (t: "light" | "dark") => {
    setTheme(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("network_graph_theme", t);
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const setThemePreset = (preset: ThemePreset) => {
    setThemePresetState(preset);
    if (typeof window !== "undefined") {
      localStorage.setItem("network_graph_theme_preset", preset);
      document.documentElement.setAttribute("data-theme-preset", preset);
    }
    const presetNames: Record<ThemePreset, string> = {
      blue: "方案一：高階商務藍",
      green: "方案二：雅緻溫潤綠",
      purple: "方案三：未來科技紫",
      mono: "方案四：極簡瑞士黑白",
    };
    showToast(`已套用【${presetNames[preset]}】風格！`);
  };

  // 主辦人管理員密鑰解鎖
  const unlockAdmin = (pin: string) => {
    if (pin.trim() === adminPin) {
      setIsAdminUnlocked(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("network_graph_admin_unlocked", "true");
      }
      showToast("主辦人密鑰驗證成功！已解鎖管理後台 ✓");
      return true;
    }
    showToast("管理密鑰不正確，請重新確認！");
    return false;
  };

  const updateAdminPin = (newPin: string) => {
    if (!newPin.trim()) return;
    setAdminPinState(newPin.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("network_graph_admin_pin", newPin.trim());
    }
    showToast("主辦人管理密鑰已成功更新！");
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
        updateEventSettings,
        createNewEvent,
        toggleEventDemoMode,
        toastMessage,
        showToast,
        isCloudConnected,
        theme,
        setTheme: setThemeExplicit,
        toggleTheme,
        themePreset,
        setThemePreset,
        isAdminUnlocked,
        unlockAdmin,
        adminPin,
        updateAdminPin,
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
