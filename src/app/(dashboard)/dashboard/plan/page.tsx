"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { MealPlan, DailyProgress, ExtraFoodItem } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Minus,
  Plus,
  Check,
  UtensilsCrossed,
  Star,
  X,
  Moon,
  PlusCircle,
} from "lucide-react";
import clsx from "clsx";
import { RequireActive } from "@/components/ui/RequireActive";

const WATER_INCREMENT = 0.5;

export default function MyPlanPage() {
  const { profile } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [progress, setProgress] = useState<DailyProgress>({
    mealsCompleted: [],
    waterGlasses: 0,
    extras: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Manual entry
  const [showManual, setShowManual] = useState(false);
  const [manualMeal, setManualMeal] = useState("extra");
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualGrams, setManualGrams] = useState("100");

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [selectedDate, profile]);

  async function loadData() {
    if (!profile) return;
    setLoading(true);
    try {
      const planDoc = await getDoc(
        doc(db, "users", profile.uid, "mealPlan", "current")
      );
      if (planDoc.exists()) setMealPlan(planDoc.data() as MealPlan);

      const progressDoc = await getDoc(
        doc(db, "users", profile.uid, "dailyProgress", dateStr)
      );
      if (progressDoc.exists()) {
        const data = progressDoc.data() as DailyProgress;
        setProgress({ ...data, extras: data.extras || [] });
      } else {
        setProgress({ mealsCompleted: [], waterGlasses: 0, extras: [] });
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function saveProgress(newProgress: DailyProgress) {
    setProgress(newProgress);
    if (profile)
      await setDoc(
        doc(db, "users", profile.uid, "dailyProgress", dateStr),
        newProgress
      );
  }

  const toggleMeal = async (index: number) => {
    if (!mealPlan || !profile) return;
    const newCompleted = [...(progress.mealsCompleted || [])];
    while (newCompleted.length < mealPlan.meals.length) newCompleted.push(false);
    const wasCompleted = newCompleted[index];
    newCompleted[index] = !wasCompleted;
    saveProgress({ ...progress, mealsCompleted: newCompleted });

    const meal = mealPlan.meals[index];
    if (meal.estimatedCalories && meal.estimatedCalories > 0) {
      const logRef = collection(
        db,
        "users",
        profile.uid,
        "foodLog",
        dateStr,
        "entries"
      );
      if (!wasCompleted) {
        await addDoc(logRef, {
          foodName: `${meal.label}: ${meal.items.join(", ")}`,
          brand: "Meal Plan",
          calories: meal.estimatedCalories || 0,
          protein: meal.estimatedProtein || 0,
          carbs: meal.estimatedCarbs || 0,
          fat: meal.estimatedFat || 0,
          servingSize: "As per plan",
          quantity: 1,
          timestamp: Date.now(),
          mealPlanLabel: meal.label,
        }).catch(() => {});
      } else {
        try {
          const snap = await getDocs(logRef);
          snap.forEach((d) => {
            if (d.data().mealPlanLabel === meal.label) {
              deleteDoc(d.ref).catch(() => {});
            }
          });
        } catch {
          /* silent */
        }
      }
    }
  };

  const addWater = () =>
    saveProgress({
      ...progress,
      waterGlasses: (progress.waterGlasses || 0) + 1,
    });
  const removeWater = () => {
    if ((progress.waterGlasses || 0) > 0)
      saveProgress({
        ...progress,
        waterGlasses: (progress.waterGlasses || 0) - 1,
      });
  };

  const openManual = (mealLabel: string) => {
    setManualMeal(mealLabel);
    setManualName("");
    setManualCal("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
    setManualGrams("100");
    setShowManual(true);
  };

  const addManualExtra = () => {
    if (!manualName.trim()) return;
    const grams = parseFloat(manualGrams) || 100;
    const multiplier = grams / 100;
    const extra: ExtraFoodItem = {
      id: `extra-${Date.now()}`,
      name: manualName.trim(),
      calories: Math.round((parseFloat(manualCal) || 0) * multiplier),
      protein:
        Math.round((parseFloat(manualProtein) || 0) * multiplier * 10) / 10,
      carbs:
        Math.round((parseFloat(manualCarbs) || 0) * multiplier * 10) / 10,
      fat: Math.round((parseFloat(manualFat) || 0) * multiplier * 10) / 10,
      servingSize: `${grams}g`,
      mealLabel: manualMeal,
    };
    saveProgress({
      ...progress,
      extras: [...(progress.extras || []), extra],
    });
    setShowManual(false);
  };

  const removeExtra = (id: string) => {
    saveProgress({
      ...progress,
      extras: (progress.extras || []).filter((e) => e.id !== id),
    });
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (!mealPlan) {
    return (
      <RequireActive>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <UtensilsCrossed size={64} className="mb-4 text-text-muted" />
          <h2 className="text-xl font-bold text-text">No Meal Plan Yet</h2>
          <p className="mt-1 text-text-secondary">
            Your coach will set your personalised plan soon
          </p>
        </div>
      </RequireActive>
    );
  }

  const completedCount = (progress.mealsCompleted || []).filter(Boolean).length;
  const totalMeals = mealPlan.meals.length;
  const mealProgress = totalMeals > 0 ? (completedCount / totalMeals) * 100 : 0;
  const waterTargetL = mealPlan.waterTargetLitres || 3;
  const waterTaps = Math.round(waterTargetL / WATER_INCREMENT);
  const waterProgress = Math.min(
    ((progress.waterGlasses || 0) / waterTaps) * 100,
    100
  );

  const extras = progress.extras || [];
  const extrasTotals = extras.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const getExtrasForMeal = (label: string) =>
    extras.filter((e) => e.mealLabel === label);
  const standaloneExtras = extras.filter((e) => e.mealLabel === "extra");

  return (
    <RequireActive>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">My Plan</h1>

      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
        <button
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.getTime() - 86400000)
            )
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
          {!isToday && (
            <p className="text-xs text-text-muted">Tap to go to today</p>
          )}
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

      {/* Progress Header */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-semibold text-text">Today&apos;s Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary">Meals</p>
            <p className="text-lg font-bold text-primary">
              {completedCount}/{totalMeals}
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${mealProgress}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Water</p>
            <p className="text-lg font-bold text-success">
              {((progress.waterGlasses || 0) * WATER_INCREMENT).toFixed(1)}L /{" "}
              {waterTargetL}L
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        </div>
        {extrasTotals.calories > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm">
            <PlusCircle size={14} className="text-accent" />
            <span className="text-accent">
              Off-plan extras: {extrasTotals.calories} kcal | P:{" "}
              {extrasTotals.protein.toFixed(0)}g | C:{" "}
              {extrasTotals.carbs.toFixed(0)}g | F:{" "}
              {extrasTotals.fat.toFixed(0)}g
            </span>
          </div>
        )}
      </div>

      {/* Free Calories */}
      {mealPlan.freeCalories > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2.5 text-sm">
          <Star size={16} className="text-warning" />
          <span className="text-warning">
            {mealPlan.freeCalories - extrasTotals.calories > 0
              ? `${mealPlan.freeCalories - extrasTotals.calories} free calories remaining`
              : `${extrasTotals.calories - mealPlan.freeCalories} calories over free allowance`}
          </span>
        </div>
      )}

      {/* Water Tracker */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Droplets size={20} className="text-success" />
          <h3 className="font-semibold text-text">Water Intake</h3>
        </div>
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={removeWater}
            className="text-text-muted hover:text-error transition-colors"
          >
            <Minus size={28} />
          </button>
          <div className="text-center">
            <p className="text-3xl font-bold text-text">
              {((progress.waterGlasses || 0) * WATER_INCREMENT).toFixed(1)}L
            </p>
            <p className="text-sm text-text-secondary">of {waterTargetL}L</p>
          </div>
          <button
            onClick={addWater}
            className="text-success hover:text-success/80 transition-colors"
          >
            <Plus size={28} />
          </button>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${waterProgress}%` }}
          />
        </div>
      </div>

      {/* Meal Cards */}
      {mealPlan.meals.map((meal, index) => {
        const completed = progress.mealsCompleted?.[index] || false;
        const mealExtras = getExtrasForMeal(meal.label);
        return (
          <div key={index}>
            <button
              onClick={() => toggleMeal(index)}
              className={clsx(
                "w-full rounded-xl border p-5 text-left transition-all",
                completed
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-surface hover:border-primary/20"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "rounded-lg px-3 py-1 text-sm font-bold",
                    completed
                      ? "bg-primary text-white"
                      : "bg-surface-light text-text-secondary"
                  )}
                >
                  {meal.label}
                </span>
                <div
                  className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
                    completed
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {completed && <Check size={14} className="text-white" />}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {meal.items.map((item, i) => (
                  <p
                    key={i}
                    className={clsx(
                      "text-sm",
                      completed
                        ? "text-text-muted line-through"
                        : "text-text-secondary"
                    )}
                  >
                    - {item}
                  </p>
                ))}
              </div>
              {meal.note && (
                <p className="mt-2 text-xs italic text-text-muted">
                  {meal.note}
                </p>
              )}
              {meal.estimatedCalories ? (
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                  <span className="text-accent">
                    {meal.estimatedCalories} kcal
                  </span>
                  {meal.estimatedProtein ? (
                    <span className="text-primary">
                      P: {meal.estimatedProtein}g
                    </span>
                  ) : null}
                  {meal.estimatedCarbs ? (
                    <span className="text-warning">
                      C: {meal.estimatedCarbs}g
                    </span>
                  ) : null}
                  {meal.estimatedFat ? (
                    <span className="text-success">
                      F: {meal.estimatedFat}g
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* Meal extras */}
              {mealExtras.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-border pt-2">
                  {mealExtras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <PlusCircle size={12} className="text-accent" />
                      <span className="flex-1 text-text-secondary">
                        {extra.name} ({extra.servingSize})
                      </span>
                      <span className="text-accent">
                        {extra.calories} kcal
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExtra(extra.id);
                        }}
                        className="text-error/60 hover:text-error"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </button>
            <button
              onClick={() => openManual(meal.label)}
              className="mt-1 flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-accent hover:text-accent-dark"
            >
              <Plus size={14} />
              Had something extra with {meal.label}?
            </button>
          </div>
        );
      })}

      {/* Optional Snack */}
      {mealPlan.optionalSnack && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <Moon size={18} className="text-accent" />
            <h3 className="font-semibold text-text">Optional Evening Snack</h3>
          </div>
          <p className="text-sm text-text-secondary">
            {mealPlan.optionalSnack}
          </p>
        </div>
      )}

      {/* Add standalone extra */}
      <button
        onClick={() => openManual("extra")}
        className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-5 text-left hover:border-accent/30"
      >
        <UtensilsCrossed size={22} className="text-accent" />
        <div className="flex-1">
          <p className="font-medium text-text">Had something off-plan?</p>
          <p className="text-sm text-text-secondary">
            Log it here so your coach can see
          </p>
        </div>
        <PlusCircle size={22} className="text-accent" />
      </button>

      {/* Standalone extras list */}
      {standaloneExtras.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-semibold text-text">Off-Plan Extras</h3>
          <div className="space-y-2">
            {standaloneExtras.map((extra) => (
              <div
                key={extra.id}
                className="flex items-center justify-between rounded-lg bg-surface-light p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text">{extra.name}</p>
                  <p className="text-xs text-text-secondary">
                    {extra.calories} kcal | P: {extra.protein}g | C:{" "}
                    {extra.carbs}g | F: {extra.fat}g
                  </p>
                </div>
                <button
                  onClick={() => removeExtra(extra.id)}
                  className="text-error/60 hover:text-error"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplements & Notes */}
      {mealPlan.supplements?.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 font-semibold text-text">Supplements</h3>
          {mealPlan.supplements.map((s, i) => (
            <p key={i} className="text-sm text-text-secondary">
              - {s}
            </p>
          ))}
        </div>
      )}
      {mealPlan.notes?.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 font-semibold text-text">Coach Notes</h3>
          {mealPlan.notes.map((n, i) => (
            <p key={i} className="text-sm text-text-secondary">
              {n}
            </p>
          ))}
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Add Extra Food</h3>
              <button
                onClick={() => setShowManual(false)}
                className="text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Food Name
                </label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  placeholder="e.g. Protein bar"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Amount (grams)
                </label>
                <input
                  type="number"
                  value={manualGrams}
                  onChange={(e) => setManualGrams(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <p className="text-xs text-text-muted">
                Enter macros per 100g — they&apos;ll be scaled to your amount
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Calories (per 100g)
                  </label>
                  <input
                    type="number"
                    value={manualCal}
                    onChange={(e) => setManualCal(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Protein (per 100g)
                  </label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Carbs (per 100g)
                  </label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Fat (per 100g)
                  </label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                onClick={addManualExtra}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequireActive>
  );
}
