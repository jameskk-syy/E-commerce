"use client";

import React, { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { SafeUser } from "@/types";

interface AdminClientShellProps {
  currentUser: SafeUser | null;
  children: React.ReactNode;
}

export default function AdminClientShell({
  currentUser,
  children,
}: AdminClientShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-50/70 antialiased">
      {/* Left Modern Sidebar */}
      <AdminSidebar
        currentUser={currentUser}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          currentUser={currentUser}
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

