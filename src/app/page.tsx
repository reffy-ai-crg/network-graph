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

export default function Home() {
  const { activeTab, currentEvent, members } = useNetwork();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // 針對進入「純淨真實模式」房間的訪客：若尚未在名冊中就位且在目錄頁，自動平滑彈出新人迎賓就位卡
  useEffect(() => {
    if (currentEvent.isDemoMode === false && activeTab === "directory") {
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
      {/* 頂部導航 */}
      <Header 
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      {/* 核心視圖切換 */}
      <div className="flex-1 flex flex-col">
        {activeTab === "landing" && (
          <EventLandingView 
            onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
            onOpenEditModal={() => setIsEditModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
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
          />
        )}
      </div>

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
      />

      {/* 活動主辦管理後台 (Admin Panel) */}
      <AdminEventModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </main>
  );
}
