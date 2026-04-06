"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Apple,
  Dumbbell,
  HeartPulse,
  MessageCircle,
  ClipboardCheck,
  Target,
  User,
  Users,
  CalendarCheck,
  Bell,
  CreditCard,
  Camera,
  LogOut,
  X,
  PenTool,
  Sparkles,
} from "lucide-react";

const clientLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/plan", label: "My Plan", icon: UtensilsCrossed },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: Apple },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/workout-ideas", label: "Workout Ideas", icon: Sparkles },
  { href: "/dashboard/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/communities", label: "Communities", icon: Users },
  { href: "/dashboard/checkin", label: "Check-in", icon: ClipboardCheck },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/progress-photos", label: "Photos", icon: Camera },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const coachLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/meal-plans", label: "Meal Plans", icon: UtensilsCrossed },
  { href: "/dashboard/workouts/editor", label: "Workouts", icon: PenTool },
  { href: "/dashboard/checkins", label: "Check-ins", icon: CalendarCheck },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/communities", label: "Communities", icon: Users },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile, isOwner, signOut } = useAuth();
  const pathname = usePathname();
  const links = isOwner ? coachLinks : clientLinks;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="TH Hub" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-text">TH Hub</span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* User info */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {profile?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {profile?.name || "Loading..."}
            </p>
            <span
              className={clsx(
                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                isOwner
                  ? "bg-accent/20 text-accent"
                  : "bg-primary/20 text-primary"
              )}
            >
              {isOwner ? "Coach" : "Client"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-light hover:text-text"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-light hover:text-error transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
