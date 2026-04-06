"use client";

import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingSpinner } from "./LoadingSpinner";
import { Lock, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export function RequireActive({ children }: { children: React.ReactNode }) {
  const { isOwner } = useAuth();
  const { isActive, loading } = useSubscription();

  if (loading) return <LoadingSpinner fullPage />;
  if (isOwner || isActive) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-border">
        <Lock size={28} className="text-text-muted" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-text">Feature Locked</h2>
      <p className="mb-6 max-w-sm text-text-secondary">
        This feature is available once your coaching plan is active. Get in
        touch with your coach to get started.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <MessageCircle size={16} />
          Message Coach
        </Link>
        <a
          href="https://www.instagram.com/t_h_training"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-semibold text-text hover:bg-surface-light transition-colors"
        >
          <InstagramIcon size={16} />
          Instagram
        </a>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-semibold text-text-secondary hover:bg-surface-light transition-colors"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
