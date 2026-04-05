"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile, WeeklyCheckIn } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, ChevronDown, ChevronUp, Users } from "lucide-react";

export default function CheckInsPage() {
  const { isOwner } = useAuth();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client");

  const [clients, setClients] = useState<UserProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState(preselectedClient || "");
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) loadCheckIns();
  }, [selectedClient]);

  async function loadClients() {
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      setClients(
        snap.docs
          .map((d) => d.data() as UserProfile)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function loadCheckIns() {
    if (!selectedClient) return;
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", selectedClient, "checkIns"),
          orderBy("submittedAt", "desc"),
          limit(20)
        )
      );
      setCheckIns(snap.docs.map((d) => d.data() as WeeklyCheckIn));
    } catch {
      /* silent */
    }
  }

  if (!isOwner)
    return <div className="py-24 text-center text-text-muted">Coach access only.</div>;
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Check-in Review</h1>

      {/* Client Selector */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h3 className="font-semibold text-text">Select Client</h3>
        </div>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-text focus:border-primary focus:outline-none"
        >
          <option value="">Choose a client...</option>
          {clients.map((c) => (
            <option key={c.uid} value={c.uid}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Check-ins */}
      {selectedClient && checkIns.length === 0 && (
        <div className="py-12 text-center text-text-muted">
          No check-ins submitted yet.
        </div>
      )}

      {checkIns.map((ci) => (
        <div
          key={ci.weekId}
          className="rounded-xl border border-border bg-surface overflow-hidden"
        >
          <button
            onClick={() =>
              setExpanded(expanded === ci.weekId ? null : ci.weekId)
            }
            className="flex w-full items-center justify-between p-5 text-left hover:bg-surface-light transition-colors"
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
            <div className="border-t border-border p-5 space-y-4">
              <Section title="Body Metrics">
                <Row label="Current Weight" value={ci.weightCurrent} />
                <Row label="Previous Weight" value={ci.weightPrevious} />
              </Section>
              <Section title="Recovery & Wellness">
                <Row label="Sleep" value={ci.sleep} />
                <Row label="Appetite" value={ci.appetite} />
                <Row label="Energy" value={ci.energy} />
                <Row label="Stress" value={ci.stress} />
                <Row label="Recovery" value={ci.recovery} />
              </Section>
              <Section title="Training">
                <Row label="Gym Performance" value={ci.gymPerformance} />
                <Row label="Sessions Completed" value={ci.sessionsCompleted ? "Yes" : "No"} />
                <Row label="Cardio" value={ci.cardio} />
                <Row label="Steps" value={ci.steps} />
              </Section>
              <Section title="Nutrition">
                <Row label="Adherence" value={ci.adherence} />
                <Row label="Cheat Meals" value={ci.cheatMeal} />
              </Section>
              <Section title="Goals & Reflection">
                <Row label="Goal" value={ci.goal} />
                <Row label="Wins" value={ci.wins} />
                <Row label="Goals Next Week" value={ci.goalsNextWeek} />
              </Section>
              {(ci.questions || ci.otherNotes) && (
                <Section title="Questions & Notes">
                  <Row label="Questions" value={ci.questions} />
                  <Row label="Other" value={ci.otherNotes} />
                </Section>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-text-muted uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | boolean }) {
  if (!value && value !== false) return null;
  return (
    <div className="text-sm">
      <span className="text-text-muted">{label}: </span>
      <span className="text-text">{String(value)}</span>
    </div>
  );
}
