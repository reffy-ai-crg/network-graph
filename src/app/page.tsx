"use client";

import React, { useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { Header } from "../components/Header";
import { DirectoryView } from "../components/DirectoryView";
import { GraphView } from "../components/GraphView";
import { MyHubView } from "../components/MyHubView";
import { ProfileDrawer } from "../components/ProfileDrawer";
import { EditProfileModal } from "../components/EditProfileModal";

export default function Home() {
  const { activeTab } = useNetwork();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* 頂部導航 */}
      <Header onOpenEditModal={() => setIsEditModalOpen(true)} />

      {/* 核心視圖切換 */}
      <div className="flex-1 flex flex-col">
        {activeTab === "directory" && <DirectoryView />}
        {activeTab === "graph" && <GraphView />}
        {activeTab === "hub" && (
          <MyHubView onOpenEditModal={() => setIsEditModalOpen(true)} />
        )}
      </div>

      {/* 詳細名片抽屜 (Bottom Sheet) */}
      <ProfileDrawer />

      {/* 編輯個人名片彈窗 */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </main>
  );
}
