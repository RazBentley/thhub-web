"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { FoodEntry, NutritionTargets, DailyProgress, MealPlan } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChevronLeft, ChevronRight, Apple, Flame, Beef, Wheat, Droplet } from "lucide-react";
import clsx from "clsx";
import { RequireActive } from "@/components/ui/RequireActive";
import Link from "next/link";

export default function NutritionPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [selectedDate, profile]);

  async function loadData() {
    if (!profile) return;
    setLoading(true);
    try {
      const [targetsDoc, entriesSnap, planDoc, progressDoc] = await Promise.all([
        getDoc(doc(db, "users", profile.uid, "settings", "nutritionTargets")),
        getDocs(collection(db, "users", profile.uid, "foodLog", dateStr, "entries")),
        getDoc(doc(db, "users", profile.uid, "mealPlan", "current")),
        getDoc(doc(db, "users", profile.uid, "dailyProgress", dateStr)),
      ]);

      if (targetsDoc.exists()) setTargets(targetsDoc.data() as NutritionTargets);
      if (planDoc.exists()) setMealPlan(planDoc.data() as MealPlan);
      if (progressDoc.exists()) setProgress(progressDoc.data() as DailyProgress);

      const loaded = entriesSnap.docs.map((d) => d.data() as FoodEntry);
      loaded.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setEntries(loaded);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  // Calculate totals from food log entries
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Also add extras from daily progress
  const extras = progress?.extras || [];
  const extraTotals = extras.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const combined = {
    calories: totals.calories + extraTotals.calories,
    protein: totals.protein + extraTotals.protein,
    carbs: totals.carbs + extraTotals.carbs,
    fat: totals.fat + extraTotals.fat,
  };

  const mealsCompleted = (progress?.mealsCompleted || []).filter(Boolean).length;
  const totalMeals = mealPlan?.meals?.length || 0;

  const MacroRing = ({
    label,
    current,
    target,
    color,
    icon: Icon,
    unit,
  }: {
    label: string;
    current: number;
    target: number;
    color: string;
    icon: React.ElementType;
    unit: string;
  }) => {
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const over = target > 0 && current > target;
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon size={16} className={color} />
          <span className="text-sm font-medium text-text-secondary">{label}</span>
        </div>
        <p className={clsx("text-2xl font-bold", over ? "text-error" : "text-text")}>
          {Math.round(current)}
          <span className="text-sm font-normal text-text-muted">{unit}</span>
        </p>
        {target > 0 && (
          <>
            <p className="text-xs text-text-muted">of {target}{unit}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  over ? "bg-error" : color.replace("text-", "bg-")
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <RequireActive>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Nutrition</h1>
          <p className="mt-1 text-text-secondary">
            Your daily nutritional overview.
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
          <button
            onClick={() =>
              setSelectedDate(new Date(selectedDate.getTime() - 86400000))
            }
            className="rounded-lg p-2 hover:bg-surface-light"
          >
            <ChevronLeft size={20} className="text-text" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-center"
          >
            <p className="font-semibold text-text">
              {isToday
                ? "Today"
                : selectedDate.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
            </p>
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date(selectedDate.getTime() + 86400000);
              if (tomorrow <= new Date()) setSelectedDate(tomorrow);
            }}
            disabled={isToday}
            className="rounded-lg p-2 hover:bg-surface-light disabled:opacity-30"
          >
            <ChevronRight size={20} className="text-text" />
          </button>
        </div>

        {/* Macro Overview */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MacroRing
            label="Calories"
            current={combined.calories}
            target={targets?.calories || 0}
            color="text-accent"
            icon={Flame}
            unit="kcal"
          />
          <MacroRing
            label="Protein"
            current={combined.protein}
            target={targets?.protein || 0}
            color="text-primary"
            icon={Beef}
            unit="g"
          />
          <MacroRing
            label="Carbs"
            current={combined.carbs}
            target={targets?.carbs || 0}
            color="text-warning"
            icon={Wheat}
            unit="g"
          />
          <MacroRing
            label="Fat"
            current={combined.fat}
            target={targets?.fat || 0}
            color="text-success"
            icon={Droplet}
            unit="g"
          />
        </div>

        {/* Meal breakdown */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-text">
              Meals ({mealsCompleted}/{totalMeals} completed)
            </h3>
            <Link
              href="/dashboard/plan"
              className="text-sm text-primary hover:text-primary-dark"
            >
              Go to My Plan →
            </Link>
          </div>
          {entries.length === 0 && extras.length === 0 ? (
            <p className="py-6 text-center text-text-muted">
              No food logged yet today. Complete meals from{" "}
              <Link href="/dashboard/plan" className="text-primary hover:underline">
                My Plan
              </Link>{" "}
              to see your nutrition breakdown.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg bg-surface-light p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">
                      {entry.foodName}
                    </p>
                    {entry.brand && (
                      <p className="text-xs text-text-muted">{entry.brand}</p>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-text-secondary">
                    <span className="text-accent">{entry.calories}kcal</span>
                    <span>P:{entry.protein}g</span>
                    <span>C:{entry.carbs}g</span>
                    <span>F:{entry.fat}g</span>
                  </div>
                </div>
              ))}
              {extras.map((extra, i) => (
                <div
                  key={`extra-${i}`}
                  className="flex items-start justify-between rounded-lg bg-accent/5 border border-accent/10 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">
                      {extra.name}
                      <span className="ml-2 text-xs text-accent">extra</span>
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-text-secondary">
                    <span className="text-accent">{extra.calories}kcal</span>
                    <span>P:{extra.protein}g</span>
                    <span>C:{extra.carbs}g</span>
                    <span>F:{extra.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No targets set */}
        {!targets && (
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <p className="text-text-muted">
              Your coach hasn&apos;t set your nutrition targets yet. Once they
              do, you&apos;ll see progress bars for each macro.
            </p>
          </div>
        )}
      </div>
    </RequireActive>
  );
}
