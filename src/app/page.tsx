"use client";

import React, { useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { Header } from "../components/Header";
import { DirectoryView } from "../components/DirectoryView";
import { GraphView } from "../components/GraphView";
import { MyHubView } from "../components/MyHubView";
import { ProfileDrawer } from "../components/ProfileDrawer";
import { EditProfileModal } from "../components/EditProfileModal";
import { AdminEventModal } from "../components/AdminEventModal";

export default function Home() {
  const { activeTab } = useNetwork();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 頂部導航 */}
      <Header 
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* 核心視圖切換 */}
      <div className="flex-1 flex flex-col">
        {activeTab === "directory" && <DirectoryView />}
        {activeTab === "graph" && <GraphView />}
        {activeTab === "hub" && (
          <MyHubView 
            onOpenEditModal={() => setIsEditModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
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

      {/* 活動主辦管理後台 (Admin Panel) */}
      <AdminEventModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </main>
  );
}
