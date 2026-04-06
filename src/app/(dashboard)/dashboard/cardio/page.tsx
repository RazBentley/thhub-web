"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { DailyCardio } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HeartPulse, Footprints, Save } from "lucide-react";
import clsx from "clsx";
import { RequireActive } from "@/components/ui/RequireActive";

const CARDIO_TYPES = [
  "Walking",
  "Incline Walk",
  "Running",
  "Cycling",
  "Swimming",
  "HIIT",
  "Other",
];

export default function CardioPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cardioMinutes, setCardioMinutes] = useState(0);
  const [cardioType, setCardioType] = useState("Walking");
  const [steps, setSteps] = useState(0);
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<DailyCardio[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;
    try {
      const todayDoc = await getDoc(
        doc(db, "users", profile.uid, "cardioLog", today)
      );
      if (todayDoc.exists()) {
        const data = todayDoc.data() as DailyCardio;
        setCardioMinutes(data.cardioMinutes || 0);
        setCardioType(data.cardioType || "Walking");
        setSteps(data.steps || 0);
        setNotes(data.notes || "");
      }

      const historySnap = await getDocs(
        query(
          collection(db, "users", profile.uid, "cardioLog"),
          orderBy("date", "desc"),
          limit(7)
        )
      );
      setHistory(historySnap.docs.map((d) => d.data() as DailyCardio));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const saveCardio = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const data: DailyCardio = {
        date: today,
        cardioMinutes,
        cardioType,
        steps,
        notes,
      };
      await setDoc(doc(db, "users", profile.uid, "cardioLog", today), data);
      await loadData();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const avgMinutes =
    history.length > 0
      ? Math.round(
          history.reduce((s, h) => s + (h.cardioMinutes || 0), 0) /
            history.length
        )
      : 0;
  const avgSteps =
    history.length > 0
      ? Math.round(
          history.reduce((s, h) => s + (h.steps || 0), 0) / history.length
        )
      : 0;

  return (
    <RequireActive>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Cardio & Steps</h1>

      {/* Cardio Type */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-semibold text-text">Type of Cardio</h3>
        <div className="flex flex-wrap gap-2">
          {CARDIO_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCardioType(type)}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                cardioType === type
                  ? "bg-primary text-white"
                  : "bg-surface-light text-text-secondary hover:bg-border"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Duration & Steps */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse size={18} className="text-primary" />
            <h3 className="font-semibold text-text">Duration</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={cardioMinutes || ""}
              onChange={(e) => setCardioMinutes(parseInt(e.target.value) || 0)}
              className="w-24 rounded-lg border border-border bg-input-bg px-3 py-2 text-center text-lg font-bold text-text focus:border-primary focus:outline-none"
              min={0}
            />
            <span className="text-text-secondary">minutes</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <Footprints size={18} className="text-accent" />
            <h3 className="font-semibold text-text">Steps</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={steps || ""}
              onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
              className="w-28 rounded-lg border border-border bg-input-bg px-3 py-2 text-center text-lg font-bold text-text focus:border-primary focus:outline-none"
              min={0}
            />
            <span className="text-text-secondary">steps</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-2 font-semibold text-text">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about today's cardio..."
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>

      {/* Save */}
      <button
        onClick={saveCardio}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Today's Cardio"}
      </button>

      {/* Weekly History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-1 font-semibold text-text">This Week</h3>
          <p className="mb-4 text-xs text-text-muted">
            Avg: {avgMinutes} min | {avgSteps.toLocaleString()} steps
          </p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface-light px-3 py-2 text-sm"
              >
                <span className="text-text-secondary">
                  {new Date(h.date + "T00:00:00").toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <div className="flex gap-4 text-text-muted">
                  <span>{h.cardioType}</span>
                  <span>{h.cardioMinutes}m</span>
                  <span>{(h.steps || 0).toLocaleString()} steps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RequireActive>
  );
}
