"use client";

import React, { useState, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { Header } from "../components/Header";
import { EventLandingView } from "../components/EventLandingView";
import { DirectoryView } from "../components/DirectoryView";
import { GraphView } from "../components/GraphView";
import { MyHubView } from "../components/MyHubView";
import { ProfileDrawer } from "../components/ProfileDrawer";
import { EditProfileModal } from "../components/EditProfileModal";
import { AdminEventModal } from "../components/AdminEventModal";
import { OnboardingModal } from "../components/OnboardingModal";
import { JoinEventModal } from "../components/JoinEventModal";
import { ApplyEventModal } from "../components/ApplyEventModal";
import { MarketingLandingPage } from "../components/MarketingLandingPage";

export default function Home() {
  const { activeTab, currentEvent, members, switchEvent } = useNetwork();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // 判斷當前是「官網產品首頁」還是「活動房間內部」
  // 若網址帶有 ?event=xxx 或 ?room=xxx，代表使用者透過專屬邀請連結直接入房
  const [isInEventRoom, setIsInEventRoom] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("event=") || search.includes("room=")) {
        return true;
      }
      if (sessionStorage.getItem("network_graph_active_room_view") === "true") {
        return true;
      }
    }
    return false;
  });

  // 監聽網址變化，支援向後相容的專屬邀請連結
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("event=") || search.includes("room=")) {
        setIsInEventRoom(true);
        sessionStorage.setItem("network_graph_active_room_view", "true");
      }
    }
  }, []);

  // 針對進入「純淨真實模式」房間的訪客：若尚未在名冊中就位且在目錄頁，自動平滑彈出新人迎賓就位卡
  useEffect(() => {
    if (isInEventRoom && currentEvent.isDemoMode === false && activeTab === "directory") {
      const isUserJoined = members.some((m) => m.isCurrentUser);
      const isDismissed = typeof window !== "undefined" && sessionStorage.getItem("network_graph_onboarding_dismissed");
      
      // 若尚未進駐且本次會話尚未關閉過，延遲 500ms 滑出迎賓卡
      if (!isUserJoined && !isDismissed) {
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentEvent.isDemoMode, currentEvent.id, members, activeTab]);

  return (
    <main className="min-h-screen flex flex-col bg-[var(--theme-page-bg,#f8fafc)] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {!isInEventRoom ? (
        /* 模式 A：官方產品形象首頁 (Marketing Landing Page) */
        <MarketingLandingPage
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          onOpenApplyModal={() => setIsApplyModalOpen(true)}
          onEnterDemoRoom={(slug) => {
            switchEvent(slug);
            setIsInEventRoom(true);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("network_graph_active_room_view", "true");
            }
          }}
        />
      ) : (
        /* 模式 B：專屬活動空間內部 (Event Space: Header + Views) */
        <>
          {/* 頂部導航 */}
          <Header 
            onOpenEditModal={() => setIsEditModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
            onOpenApplyModal={() => setIsApplyModalOpen(true)}
            onReturnToPortal={() => {
              setIsInEventRoom(false);
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("network_graph_active_room_view");
              }
            }}
          />

          {/* 核心視圖切換 */}
          <div className="flex-1 flex flex-col">
            {activeTab === "landing" && (
              <EventLandingView 
                onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
                onOpenEditModal={() => setIsEditModalOpen(true)}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
              />
            )}
            {activeTab === "directory" && (
              <DirectoryView 
                onOpenEditModal={() => setIsEditModalOpen(true)}
                onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
              />
            )}
            {activeTab === "graph" && <GraphView />}
            {activeTab === "hub" && (
              <MyHubView 
                onOpenEditModal={() => setIsEditModalOpen(true)}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
              />
            )}
          </div>
        </>
      )}

      {/* 詳細名片抽屜 (Bottom Sheet) */}
      <ProfileDrawer onOpenEditModal={() => setIsEditModalOpen(true)} />

      {/* 編輯個人名片彈窗 */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* 新人智能迎賓報到彈窗 */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("network_graph_onboarding_dismissed", "true");
          }
        }}
      />

      {/* 輸入代碼加入/切換活動彈窗 (Slido / Kahoot 模式) */}
      <JoinEventModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
        onJoinedSuccess={() => {
          setIsInEventRoom(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("network_graph_active_room_view", "true");
          }
        }}
      />

      {/* 企業/社團試辦開房預約申請彈窗 */}
      <ApplyEventModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* 活動主辦管理後台 (Admin Panel) */}
      <AdminEventModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </main>
  );
}
