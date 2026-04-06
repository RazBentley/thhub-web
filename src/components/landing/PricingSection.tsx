"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

const onlineIncludes = [
  "Personalised meal plan with macros",
  "Custom workout programme",
  "Weekly check-ins with your coach",
  "Direct messaging support",
  "Nutrition & food logging tools",
  "Cardio & activity tracking",
  "Progress photo tracking",
  "Goal setting & accountability",
  "Full access to web & mobile app",
];

const ptIncludes = [
  "1-to-1 sessions tailored to your goals",
  "Technique coaching & form correction",
  "Personalised programming",
  "Motivation & accountability in person",
  "Flexible scheduling",
];

export function PricingSection() {
  const [tab, setTab] = useState<"online" | "pt">("online");

  return (
    <section className="border-t border-border bg-surface px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-text-secondary">
            Choose the plan that works for you.
          </p>
        </div>

        {/* Tabs */}
        <div className="mx-auto mb-8 flex max-w-md rounded-xl border border-border bg-bg p-1">
          <button
            onClick={() => setTab("online")}
            className={clsx(
              "flex-1 rounded-lg py-3 text-sm font-semibold transition-all",
              tab === "online"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text"
            )}
          >
            Online Coaching
          </button>
          <button
            onClick={() => setTab("pt")}
            className={clsx(
              "flex-1 rounded-lg py-3 text-sm font-semibold transition-all",
              tab === "pt"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text"
            )}
          >
            In-Person PT
          </button>
        </div>

        {/* Online Coaching Card */}
        {tab === "online" && (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-px">
            <div className="rounded-2xl bg-bg p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
                  Monthly Coaching
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-text">
                    &pound;50
                  </span>
                  <span className="text-lg text-text-secondary">/month</span>
                </div>
                <p className="mt-2 text-text-secondary">
                  Cancel anytime. No contracts.
                </p>
              </div>

              <div className="mb-8 space-y-3">
                {onlineIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <Check size={12} className="text-success" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Get Started Now
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}

        {/* In-Person PT Card */}
        {tab === "pt" && (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-warning p-px">
            <div className="rounded-2xl bg-bg p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
                  In-Person Personal Training
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-text">
                    Personal Quote
                  </span>
                </div>
                <p className="mt-2 text-text-secondary">
                  Tailored pricing based on your goals and schedule.
                </p>
              </div>

              <div className="mb-8 space-y-3">
                {ptIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <Check size={12} className="text-accent" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://www.instagram.com/t_h_training"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-4 text-lg font-semibold text-white transition-all hover:bg-accent-dark active:scale-[0.98]"
              >
                <InstagramIcon size={20} />
                Enquire on Instagram
              </a>
              <p className="mt-3 text-center text-sm text-text-muted">
                Send a DM to @t_h_training to discuss your goals and get a
                personalised quote.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
