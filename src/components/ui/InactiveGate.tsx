"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  UtensilsCrossed,
  Dumbbell,
  HeartPulse,
  ClipboardCheck,
  Target,
  Camera,
  Lock,
  MessageCircle,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

const lockedFeatures = [
  { icon: UtensilsCrossed, label: "Personalised Meal Plan", description: "Custom meals with macros tailored to your goals" },
  { icon: Dumbbell, label: "Workout Programme", description: "Structured training plan with sets, reps, and progression" },
  { icon: HeartPulse, label: "Cardio & Activity Tracking", description: "Log your cardio sessions and daily steps" },
  { icon: ClipboardCheck, label: "Weekly Check-ins", description: "Submit progress updates and get feedback from your coach" },
  { icon: Target, label: "Goal Tracking", description: "Set weight goals and track your progress over time" },
  { icon: Camera, label: "Progress Photos", description: "Upload transformation photos and compare over time" },
];

export function InactiveGate({ children }: { children: React.ReactNode }) {
  const { profile, isOwner } = useAuth();
  const { isActive, loading } = useSubscription();

  if (loading) return <LoadingSpinner fullPage />;

  // Coaches and active clients get full access
  if (isOwner || isActive) return <>{children}</>;

  // Inactive client - show welcome screen
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-px">
        <div className="rounded-2xl bg-bg p-8 text-center">
          <Image
            src="/logo.png"
            alt="TH Hub"
            width={80}
            height={80}
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />
          <h1 className="mb-2 text-2xl font-bold text-text">
            Welcome to TH Hub, {profile?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="mx-auto max-w-lg text-text-secondary">
            Thanks for signing up. Your coach will review your profile and set
            up your personalised plan. Once your coaching begins, you&apos;ll
            unlock full access to all features below.
          </p>
        </div>
      </div>

      {/* What's coming - locked feature preview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text">
          What You&apos;ll Get
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lockedFeatures.map((feature) => (
            <div
              key={feature.label}
              className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 opacity-75"
            >
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-border">
                  <Lock size={12} className="text-text-muted" />
                </div>
              </div>
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                <feature.icon size={20} className="text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text">
                {feature.label}
              </h3>
              <p className="text-xs text-text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Get in touch */}
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-text">
          Ready to Get Started?
        </h3>
        <p className="mb-5 text-sm text-text-secondary">
          Send your coach a message to arrange your coaching plan and get
          activated.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <MessageCircle size={18} />
            Message Your Coach
          </Link>
          <a
            href="https://www.instagram.com/t_h_training"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-text hover:bg-surface-light transition-colors"
          >
            <InstagramIcon size={18} />
            @t_h_training
          </a>
        </div>
      </div>
    </div>
  );
}
