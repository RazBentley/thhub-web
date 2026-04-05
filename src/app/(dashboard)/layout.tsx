"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authenticated } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || !authenticated) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TH Hub" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="font-semibold text-text">TH Hub</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
