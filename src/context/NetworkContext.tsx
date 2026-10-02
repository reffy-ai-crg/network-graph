"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { UserProfile, EventSpace, ViewTab } from "../types/network";
import { CURRENT_USER_DEFAULT, INITIAL_EVENTS, generateMockMembers } from "../lib/mockData";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { initLiff } from "../lib/liffClient";

export function getOrCreateUserUuid(): string {
  if (typeof window === "undefined") return "00000000-0000-0000-0000-000000000001";
  let uuid = localStorage.getItem("network_graph_user_uuid");
  if (!uuid) {
    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem("network_graph_user_uuid", uuid);
  }
  return uuid;
}

interface NetworkContextType {
  currentUser: UserProfile;
  events: EventSpace[];
  myJoinedEvents: EventSpace[];
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
  refreshMembers: () => void;
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
  joinEventByCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export type ThemePreset = "blue" | "green" | "purple" | "mono";

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("network_graph_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return CURRENT_USER_DEFAULT;
  });

  const [events, setEvents] = useState<EventSpace[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("network_graph_events");
      if (saved) {
        try {
          const parsed: EventSpace[] = JSON.parse(saved);
          return parsed.map((e) => ({
            ...e,
            isDemoMode: e.slug === "aia-12" ? (e.isDemoMode ?? true) : false,
          }));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_EVENTS;
  });

  const [currentEvent, setCurrentEvent] = useState<EventSpace>(() => {
    if (typeof window !== "undefined") {
      const activeId = localStorage.getItem("network_graph_active_event_id");
      const saved = localStorage.getItem("network_graph_events");
      if (saved) {
        try {
          const parsed: EventSpace[] = JSON.parse(saved);
          const sanitized = parsed.map((e) => ({
            ...e,
            isDemoMode: e.slug === "aia-12" ? (e.isDemoMode ?? true) : false,
          }));
          if (activeId) {
            const found = sanitized.find((e) => e.id === activeId || e.slug === activeId);
            if (found) return found;
          }
          if (sanitized.length > 0) return sanitized[0];
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_EVENTS[0];
  });

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "directory" || tabParam === "graph" || tabParam === "hub") {
        return tabParam;
      }
    }
    return "landing";
  });
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themePreset, setThemePresetState] = useState<ThemePreset>("blue");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPinState] = useState("888888");

  // 使用者參與過的活動 ID 清單（保障多租戶隔離，不展示全庫幾百個無關活動）
  const [myJoinedEventIds, setMyJoinedEventIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("network_graph_my_joined_events");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // 自動將目前活動加入已參與清單
  useEffect(() => {
    if (currentEvent?.id || currentEvent?.slug) {
      setMyJoinedEventIds((prev) => {
        const identifiers = [currentEvent.id, currentEvent.slug].filter(Boolean);
        const missing = identifiers.filter((id) => !prev.includes(id));
        if (missing.length === 0) return prev;
        const next = [...prev, ...missing];
        if (typeof window !== "undefined") {
          localStorage.setItem("network_graph_my_joined_events", JSON.stringify(next));
        }
        return next;
      });
    }
  }, [currentEvent]);

  // 我參加過的活動（人脈存摺專用，嚴格隔離全庫幾百個未參加的活動）
  const myJoinedEvents = useMemo(() => {
    const list = events.filter(
      (e) => myJoinedEventIds.includes(e.id) || myJoinedEventIds.includes(e.slug) || e.id === currentEvent.id || e.slug === currentEvent.slug
    );
    return list.length > 0 ? list : [currentEvent];
  }, [events, myJoinedEventIds, currentEvent]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // 核心名冊載入函式：徹底分離「55位虛擬示範」與「純淨真實模式」
  const loadMembersForEvent = useCallback(async (targetEvent: EventSpace, user: UserProfile) => {
    // 1. 若為示範模式（僅限 aia-12 經理人班第12期），載入 55 位 mock 企業主管
    const isActuallyDemo = targetEvent.slug === "aia-12" && targetEvent.isDemoMode !== false;
    if (isActuallyDemo) {
      setMembers(generateMockMembers(user));
      return;
    }

    // 2. 若為純淨真實模式（例如 AIPM 第二期），100% 杜絕虛擬人
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("event_members")
          .select("*, profiles(*)")
          .eq("event_id", targetEvent.id);

        if (!error && data) {
          const userUuid = getOrCreateUserUuid();
          const realMembers: UserProfile[] = data
            .filter((row: any) => row.profiles)
            .map((row: any) => {
              const p = row.profiles;
              const isSelf =
                p.id === userUuid ||
                p.id === user.id ||
                (user.lineId && (p.line_id === user.lineId || p.line_user_id === user.lineId)) ||
                (p.display_name === user.name && user.name !== "陳志豪 (Kevin)");

              return {
                id: p.id,
                name: p.display_name,
                surname: p.display_name.slice(0, 1),
                company: p.company || "",
                title: p.job_title || "",
                industry: p.industry || "其他多元領域",
                group: typeof row.group_number === "number" ? row.group_number : 0,
                role: row.role || "一般學員",
                avatarUrl: p.avatar_url || undefined,
                lineId: p.line_id || "",
                linkedinUrl: p.linkedin_url || "",
                offer: p.offer_text || "",
                seek: p.seek_text || "",
                isCurrentUser: Boolean(isSelf),
              };
            });

          // 自動去重機制：以姓名或 lineId 為鍵值，確保每人僅佔有一張名片，優先保留有大頭貼或本人的紀錄
          const deduplicatedMap = new Map<string, UserProfile>();
          realMembers.forEach((member) => {
            const key = member.lineId || member.name;
            const existing = deduplicatedMap.get(key);
            if (!existing) {
              deduplicatedMap.set(key, member);
            } else {
              if ((!existing.avatarUrl && member.avatarUrl) || member.isCurrentUser) {
                deduplicatedMap.set(key, member);
              }
            }
          });

          setMembers(Array.from(deduplicatedMap.values()));
          return;
        }
      } catch (err) {
        console.warn("Supabase query event_members error:", err);
      }
    }

    // 本地降級模式：若有自訂真實名片（非預設陳志豪），顯示自己；若無則為純淨空房間 []
    const hasCustomUser =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("network_graph_user")) &&
      user.name !== "陳志豪 (Kevin)";

    if (hasCustomUser) {
      setMembers([{ ...user, isCurrentUser: true }]);
    } else {
      setMembers([]); // 完全零虛擬人
    }
  }, []);

  // 手動刷新名冊
  const refreshMembers = useCallback(() => {
    loadMembersForEvent(currentEvent, currentUser);
    showToast("名冊已同步更新最新雲端名單 ✓");
  }, [currentEvent, currentUser, loadMembersForEvent, showToast]);

  // 初始化資料與雲端 Supabase 連線
  useEffect(() => {
    // 0. 主題與管理員授權載入
    if (typeof window !== "undefined") {
      let activeTheme = localStorage.getItem("network_graph_theme_v2") as "light" | "dark" | null;
      if (!activeTheme) {
        localStorage.removeItem("network_graph_theme");
        activeTheme = "light";
        localStorage.setItem("network_graph_theme_v2", "light");
      }
      setTheme(activeTheme);
      if (activeTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      const initialPreset: ThemePreset = "blue";
      setThemePresetState(initialPreset);
      document.documentElement.setAttribute("data-theme-preset", initialPreset);
      localStorage.setItem("network_graph_theme_preset", "blue");

      const savedPin = localStorage.getItem("network_graph_admin_pin");
      if (savedPin) setAdminPinState(savedPin);
      const sessionUnlocked = sessionStorage.getItem("network_graph_admin_unlocked");
      if (sessionUnlocked === "true") setIsAdminUnlocked(true);
    }

    // 1. 本地筆記快取載入
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("network_graph_notes");
      if (savedNotes) {
        try {
          setPrivateNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error(e);
        }
      }

      // 檢查網址參數 ?event=slug 或 LINE LIFF 的 ?liff.state=%3Fevent%3Dslug
      const params = new URLSearchParams(window.location.search);
      let eventSlug = params.get("event");
      if (!eventSlug) {
        const liffState = params.get("liff.state");
        if (liffState) {
          const decoded = decodeURIComponent(liffState);
          const liffParams = new URLSearchParams(decoded.startsWith("?") ? decoded : `?${decoded}`);
          eventSlug = liffParams.get("event");
        }
      }

      if (eventSlug) {
        const found = events.find((e) => e.slug === eventSlug || e.id === eventSlug);
        if (found) {
          setCurrentEvent(found);
          loadMembersForEvent(found, currentUser);
        }
      } else {
        loadMembersForEvent(currentEvent, currentUser);
      }
    }

    // 2. 嘗試連線雲端 Supabase 並同步活動房
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const syncCloud = async () => {
        try {
          const { data: cloudEvents, error: eventErr } = await client
            .from("events")
            .select("*");

          if (!eventErr && cloudEvents && cloudEvents.length > 0) {
            setIsCloudConnected(true);
            const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            let targetSlug = params?.get("event");
            if (!targetSlug && params) {
              const liffState = params.get("liff.state");
              if (liffState) {
                const decoded = decodeURIComponent(liffState);
                const liffParams = new URLSearchParams(decoded.startsWith("?") ? decoded : `?${decoded}`);
                targetSlug = liffParams.get("event");
              }
            }

            const savedLocal = typeof window !== "undefined" ? localStorage.getItem("network_graph_events") : null;
            let localEvents: EventSpace[] = [];
            if (savedLocal) {
              try {
                localEvents = JSON.parse(savedLocal);
              } catch (e) {
                console.error(e);
              }
            }

            const mappedEvents: EventSpace[] = cloudEvents.map((e) => {
              const existingLocal = localEvents.find((l) => l.slug === e.slug || l.id === e.id);
              const isMatch = targetSlug ? e.slug === targetSlug : e.slug === (currentEvent.slug || "aia-12");
              const isDemo = e.slug === "aia-12" ? (existingLocal?.isDemoMode ?? true) : false;

              return {
                id: e.id,
                slug: e.slug,
                title: e.name,
                cohort: e.cohort,
                date: e.event_date || "2026/03",
                totalMembers: existingLocal?.totalMembers || (isDemo ? 55 : 1),
                totalGroups: typeof e.total_groups === "number" ? e.total_groups : 10,
                userRole: existingLocal?.userRole || (e.slug === "aia" ? "發起人 / 主辦" : "學員"),
                isCurrent: isMatch,
                passcode: e.passcode || "",
                isDemoMode: isDemo,
                customRoles: existingLocal?.customRoles || ["授課導師", "隨班助教", "組長幹部", "一般學員"],
              };
            });

            setEvents(mappedEvents);
            if (typeof window !== "undefined") {
              localStorage.setItem("network_graph_events", JSON.stringify(mappedEvents));
            }

            const active = targetSlug
              ? mappedEvents.find((e) => e.slug === targetSlug)
              : mappedEvents.find((e) => e.id === currentEvent.id || e.slug === currentEvent.slug) || mappedEvents[0];

            if (active) {
              setCurrentEvent(active);
              loadMembersForEvent(active, currentUser);
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

    // 3. LINE LIFF 自動授權與資料帶入
    initLiff().then((res) => {
      if (res.profile) {
        const userUuid = getOrCreateUserUuid();
        setCurrentUser((prev) => {
          const updated = {
            ...prev,
            id: userUuid,
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
  }, [loadMembersForEvent, showToast]);

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
        const userUuid = getOrCreateUserUuid();
        client
          .from("private_notes")
          .upsert(
            {
              author_id: userUuid,
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

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>) => {
    const userUuid = getOrCreateUserUuid();
    const updated: UserProfile = { ...currentUser, ...updates, id: userUuid };
    setCurrentUser(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("network_graph_user", JSON.stringify(updated));
    }

    if (updates.group !== undefined || updates.role !== undefined) {
      setCurrentEvent((prev) => {
        const nextGroup = typeof updates.group === "number" ? updates.group : (currentUser.group ?? 0);
        const nextRole = updates.role ?? currentUser.role;
        const hasGrouping = (prev.totalGroups ?? 10) > 1;
        const roleLabel = hasGrouping && nextGroup > 0 ? `第 ${nextGroup} 組 ${nextRole}` : nextRole;
        return {
          ...prev,
          userRole: roleLabel,
          totalGroups: hasGrouping ? Math.max(prev.totalGroups || 10, nextGroup) : prev.totalGroups,
        };
      });
    }

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        await client.from("profiles").upsert(
          {
            id: userUuid,
            line_user_id: updated.lineId || null,
            display_name: updated.name,
            company: updated.company,
            job_title: updated.title,
            industry: updated.industry,
            line_id: updated.lineId || null,
            linkedin_url: updated.linkedinUrl || null,
            offer_text: updated.offer,
            seek_text: updated.seek,
            avatar_url: updated.avatarUrl || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (currentEvent.id && currentEvent.isDemoMode === false) {
          // 先刪除再插入，徹底解決 Supabase RLS 對 event_members 缺少 UPDATE 政策導致 401 的問題
          await client.from("event_members").delete().match({
            event_id: currentEvent.id,
            user_id: userUuid,
          });
          await client.from("event_members").insert({
            event_id: currentEvent.id,
            user_id: userUuid,
            group_number: typeof updated.group === "number" ? updated.group : 0,
            role: updated.role || "一般學員",
          });
        }

        await loadMembersForEvent(currentEvent, updated);
      } catch (err) {
        console.warn("Supabase upsert error:", err);
      }
    } else {
      setMembers((prevMembers) =>
        prevMembers.map((m) => (m.isCurrentUser ? { ...m, ...updates } : m))
      );
    }

    showToast("個人名片已即時全局同步至雲端與活動名冊 ✓");
  };

  const switchEvent = (eventId: string) => {
    const found = events.find((e) => e.id === eventId || e.slug === eventId);
    if (found) {
      setEvents((prev) =>
        prev.map((e) => ({ ...e, isCurrent: e.id === found.id }))
      );
      setCurrentEvent(found);
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_active_event_id", found.id);
      }
      loadMembersForEvent(found, currentUser);
      setActiveTab("directory");
      showToast(`已切換至「${found.title}」人脈名冊`);
    }
  };

  // 透過活動代碼通關換房 (Slido / Kahoot 模式)
  const joinEventByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      return { success: false, message: "請輸入活動代碼" };
    }

    // 1. 先查記憶體/本地快取中是否有此活動
    let found = events.find(
      (e) => e.slug.toLowerCase() === cleanCode || e.id.toLowerCase() === cleanCode
    );

    // 2. 若沒找到且已連線 Supabase，嘗試從雲端資料庫精準檢索
    if (!found && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .or(`slug.ilike.${cleanCode},id.eq.${cleanCode}`)
          .maybeSingle();

        if (!error && data) {
          found = {
            id: data.id,
            slug: data.slug,
            title: data.name,
            cohort: data.cohort,
            date: data.event_date || "2026/03",
            totalMembers: 1,
            totalGroups: typeof data.total_groups === "number" ? data.total_groups : 10,
            userRole: "學員",
            isCurrent: true,
            passcode: data.passcode || "",
            isDemoMode: false,
            customRoles: ["授課導師", "隨班助教", "組長幹部", "一般學員"],
          };
          setEvents((prev) => [...prev.filter((e) => e.id !== found!.id), found!]);
        }
      } catch (err) {
        console.warn("Query event by code error:", err);
      }
    }

    if (found) {
      switchEvent(found.id);
      // 確保將此活動加入本地已參與清單
      setMyJoinedEventIds((prev) => {
        const ids = [found!.id, found!.slug];
        const next = Array.from(new Set([...prev, ...ids]));
        if (typeof window !== "undefined") {
          localStorage.setItem("network_graph_my_joined_events", JSON.stringify(next));
        }
        return next;
      });
      return { success: true, message: `成功進入「${found.title}」！` };
    }

    return {
      success: false,
      message: `找不到代碼為「${cleanCode}」的活動房，請確認代碼是否輸入正確。`,
    };
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

    const nextEvent = { ...currentEvent, ...updates };
    setCurrentEvent(nextEvent);

    if (updates.isDemoMode !== undefined) {
      loadMembersForEvent(nextEvent, currentUser);
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

  // 建立全新活動房 (Admin) - 預設為純淨真實模式
  const createNewEvent = async (newEvent: Omit<EventSpace, "id" | "totalMembers" | "userRole" | "isCurrent">) => {
    let eventId = `event-${Date.now()}`;
    const userUuid = getOrCreateUserUuid();
    const hasCustomUser = currentUser.name !== "陳志豪 (Kevin)";

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("events")
          .insert({
            slug: newEvent.slug,
            name: newEvent.title,
            cohort: newEvent.cohort,
            total_groups: newEvent.totalGroups,
            passcode: newEvent.passcode,
          })
          .select()
          .single();

        if (!error && data) {
          eventId = data.id;
        }

        if (hasCustomUser && eventId) {
          await supabase.from("event_members").upsert(
            {
              event_id: eventId,
              user_id: userUuid,
              group_number: 1,
              role: "發起人 / 主辦",
            },
            { onConflict: "event_id,user_id" }
          );
        }
      } catch (err) {
        console.warn("Supabase insert event error:", err);
      }
    }

    const fullEvent: EventSpace = {
      ...newEvent,
      id: eventId,
      totalMembers: hasCustomUser ? 1 : 0,
      userRole: hasCustomUser ? "發起人 / 主辦" : "學員",
      isCurrent: true,
      isDemoMode: false, // 永遠預設為純淨真實模式
    };

    setEvents((prev) => {
      const updated = [fullEvent, ...prev.map((e) => ({ ...e, isCurrent: false }))];
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_events", JSON.stringify(updated));
        localStorage.setItem("network_graph_active_event_id", eventId);
      }
      return updated;
    });

    setCurrentEvent(fullEvent);
    if (typeof window !== "undefined") {
      localStorage.setItem("network_graph_active_event_id", eventId);
    }

    if (hasCustomUser) {
      setMembers([{ ...currentUser, id: userUuid, isCurrentUser: true, role: "發起人 / 主辦", group: 1 }]);
    } else {
      setMembers([]); // 完全零人空房
    }

    setActiveTab("directory");
    showToast(`新活動房「${newEvent.title}」建立成功！已啟用純淨真實模式。`);
  };

  // 切換示範名冊與真實名冊模式
  const toggleEventDemoMode = (eventId: string, isDemo: boolean) => {
    updateEventSettings(eventId, { isDemoMode: isDemo });
    showToast(isDemo ? "已切換為【55位示範人物展示模式】" : "已切換為【純淨真實模式（清空虛擬名單）】");
  };

  // 主題切換
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("network_graph_theme_v2", next);
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
      localStorage.setItem("network_graph_theme_v2", t);
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
        myJoinedEvents,
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
        refreshMembers,
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
        joinEventByCode,
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
