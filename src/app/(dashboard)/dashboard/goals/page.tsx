"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { WeightGoal } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Target, Save, TrendingDown } from "lucide-react";
import clsx from "clsx";

export default function GoalsPage() {
  const { profile } = useAuth();
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weightHistory, setWeightHistory] = useState<{ week: string; weight: string }[]>([]);

  // Form fields
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [unit, setUnit] = useState<"st" | "kg">("st");

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;
    try {
      const goalDoc = await getDoc(
        doc(db, "users", profile.uid, "goals", "current")
      );
      if (goalDoc.exists()) {
        const data = goalDoc.data() as WeightGoal;
        setGoal(data);
        setTargetWeight(data.targetWeight);
        setTargetDate(data.targetDate);
        setStartWeight(data.startWeight);
        setUnit(data.unit);
      } else {
        setEditing(true);
      }

      // Get weight history from check-ins
      const checkInsSnap = await getDocs(
        query(
          collection(db, "users", profile.uid, "checkIns"),
          orderBy("submittedAt", "desc"),
          limit(12)
        )
      );
      const history = checkInsSnap.docs
        .map((d) => ({
          week: d.data().weekId,
          weight: d.data().weightCurrent,
        }))
        .filter((h) => h.weight)
        .reverse();
      setWeightHistory(history);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const saveGoal = async () => {
    if (!profile || !targetWeight || !startWeight) return;
    setSaving(true);
    try {
      const newGoal: WeightGoal = {
        targetWeight,
        targetDate,
        startWeight,
        startDate: goal?.startDate || new Date().toISOString().split("T")[0],
        unit,
      };
      await setDoc(doc(db, "users", profile.uid, "goals", "current"), newGoal);
      setGoal(newGoal);
      setEditing(false);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const daysLeft = goal?.targetDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(goal.targetDate).getTime() - Date.now()) / 86400000
        )
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Goals</h1>
        {goal && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Edit Goal
          </button>
        )}
      </div>

      {editing ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-semibold text-text">
            {goal ? "Update Goal" : "Set Your Goal"}
          </h3>
          <div className="space-y-4">
            {/* Unit toggle */}
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Unit
              </label>
              <div className="flex gap-2">
                {(["st", "kg"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={clsx(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                      unit === u
                        ? "bg-primary text-white"
                        : "bg-surface-light text-text-secondary"
                    )}
                  >
                    {u === "st" ? "Stone" : "Kilograms"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Start Weight
                </label>
                <input
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  placeholder={unit === "st" ? "e.g. 14st 2lbs" : "e.g. 90kg"}
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Target Weight
                </label>
                <input
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder={unit === "st" ? "e.g. 12st 0lbs" : "e.g. 76kg"}
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveGoal}
                disabled={saving || !targetWeight || !startWeight}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Goal"}
              </button>
              {goal && (
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-border px-4 py-2.5 text-text-secondary hover:bg-surface-light"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ) : goal ? (
        <>
          {/* Goal Summary */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary" />
              <h3 className="font-semibold text-text">Current Goal</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-text-secondary">Start</p>
                <p className="text-lg font-bold text-text">{goal.startWeight}</p>
              </div>
              <div>
                <TrendingDown size={24} className="mx-auto text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Target</p>
                <p className="text-lg font-bold text-primary">
                  {goal.targetWeight}
                </p>
              </div>
            </div>
            {goal.targetDate && (
              <div className="mt-4 rounded-lg bg-surface-light p-3 text-center">
                <p className="text-sm text-text-secondary">
                  Target date:{" "}
                  {new Date(goal.targetDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-text-muted">
                  {daysLeft} days remaining
                </p>
              </div>
            )}
          </div>

          {/* Weight History */}
          {weightHistory.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 font-semibold text-text">Weight History</h3>
              <div className="space-y-2">
                {weightHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-surface-light px-3 py-2 text-sm"
                  >
                    <span className="text-text-secondary">{h.week}</span>
                    <span className="font-medium text-text">{h.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
