"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { WeeklyCheckIn } from "@/types";
import { RequireActive } from "@/components/ui/RequireActive";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function CheckInHistoryPage() {
  const { profile } = useAuth();
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadCheckIns();
  }, [profile]);

  async function loadCheckIns() {
    if (!profile) return;
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", profile.uid, "checkIns"),
          orderBy("submittedAt", "desc")
        )
      );
      setCheckIns(snap.docs.map((d) => d.data() as WeeklyCheckIn));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <RequireActive>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Check-in History</h1>
            <p className="mt-1 text-text-secondary">
              Review your past weekly check-ins.
            </p>
          </div>
          <Link
            href="/dashboard/checkin"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            New Check-in
          </Link>
        </div>

        {checkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ClipboardCheck size={64} className="mb-4 text-text-muted" />
            <h2 className="text-xl font-bold text-text">No Check-ins Yet</h2>
            <p className="mt-1 text-text-secondary">
              Submit your first weekly check-in to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkIns.map((ci) => (
              <div
                key={ci.weekId}
                className="rounded-xl border border-border bg-surface overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === ci.weekId ? null : ci.weekId)
                  }
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-light/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-text">{ci.weekId}</p>
                    <p className="text-sm text-text-secondary">
                      Weight: {ci.weightCurrent} | Submitted:{" "}
                      {new Date(ci.submittedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  {expanded === ci.weekId ? (
                    <ChevronUp size={18} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-text-muted" />
                  )}
                </button>

                {expanded === ci.weekId && (
                  <div className="border-t border-border p-4 space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <Row label="Weight" value={ci.weightCurrent} />
                      <Row label="Previous" value={ci.weightPrevious} />
                      <Row label="Goal" value={ci.goal} />
                      <Row label="Sleep" value={ci.sleep} />
                      <Row label="Energy" value={ci.energy} />
                      <Row label="Appetite" value={ci.appetite} />
                      <Row label="Stress" value={ci.stress} />
                      <Row label="Recovery" value={ci.recovery} />
                      <Row label="Gym Performance" value={ci.gymPerformance} />
                      <Row label="Sessions Completed" value={ci.sessionsCompleted ? "Yes" : "No"} />
                      <Row label="Cardio" value={ci.cardio} />
                      <Row label="Steps" value={ci.steps} />
                      <Row label="Adherence" value={ci.adherence} />
                      <Row label="Cheat Meals" value={ci.cheatMeal} />
                    </div>
                    {ci.wins && (
                      <div className="text-sm">
                        <span className="text-text-muted">Wins: </span>
                        <span className="text-text">{ci.wins}</span>
                      </div>
                    )}
                    {ci.goalsNextWeek && (
                      <div className="text-sm">
                        <span className="text-text-muted">Goals Next Week: </span>
                        <span className="text-text">{ci.goalsNextWeek}</span>
                      </div>
                    )}
                    {/* Photos */}
                    {(ci.frontPhotoUrl || ci.sidePhotoUrl || ci.backPhotoUrl) && (
                      <div>
                        <p className="mb-2 text-xs font-bold text-text-muted uppercase">
                          Progress Photos
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["front", "side", "back"] as const).map((angle) => {
                            const url = ci[`${angle}PhotoUrl` as keyof typeof ci] as string | undefined;
                            return url ? (
                              <div key={angle} className="overflow-hidden rounded-lg border border-border aspect-[3/4]">
                                <img src={url} alt={angle} className="h-full w-full object-cover" />
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireActive>
  );
}

function Row({ label, value }: { label: string; value?: string | boolean }) {
  if (!value && value !== false) return null;
  return (
    <div>
      <span className="text-text-muted">{label}: </span>
      <span className="text-text">{String(value)}</span>
    </div>
  );
}
