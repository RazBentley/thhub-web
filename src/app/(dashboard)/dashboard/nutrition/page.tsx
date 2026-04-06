"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { FoodEntry, NutritionTargets } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Search,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { RequireActive } from "@/components/ui/RequireActive";

export default function NutritionPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<(FoodEntry & { docId: string })[]>([]);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);

  // Manual entry form
  const [foodName, setFoodName] = useState("");
  const [brand, setBrand] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servingSize, setServingSize] = useState("100g");
  const [quantity, setQuantity] = useState("1");

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [selectedDate, profile]);

  async function loadData() {
    if (!profile) return;
    setLoading(true);
    try {
      // Get targets
      const targetsDoc = await getDoc(
        doc(db, "users", profile.uid, "settings", "nutritionTargets")
      );
      if (targetsDoc.exists())
        setTargets(targetsDoc.data() as NutritionTargets);

      // Get food log entries
      const entriesSnap = await getDocs(
        collection(db, "users", profile.uid, "foodLog", dateStr, "entries")
      );
      const loaded = entriesSnap.docs.map((d) => ({
        ...(d.data() as FoodEntry),
        docId: d.id,
      }));
      loaded.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setEntries(loaded);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const addEntry = async () => {
    if (!profile || !foodName.trim()) return;
    const qty = parseFloat(quantity) || 1;
    const entry = {
      foodName: foodName.trim(),
      brand: brand.trim(),
      calories: Math.round((parseFloat(calories) || 0) * qty),
      protein: Math.round((parseFloat(protein) || 0) * qty * 10) / 10,
      carbs: Math.round((parseFloat(carbs) || 0) * qty * 10) / 10,
      fat: Math.round((parseFloat(fat) || 0) * qty * 10) / 10,
      servingSize,
      quantity: qty,
      timestamp: Date.now(),
    };
    try {
      await addDoc(
        collection(db, "users", profile.uid, "foodLog", dateStr, "entries"),
        entry
      );
      setShowAdd(false);
      setFoodName("");
      setBrand("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setServingSize("100g");
      setQuantity("1");
      await loadData();
    } catch {
      /* silent */
    }
  };

  const removeEntry = async (docId: string) => {
    if (!profile) return;
    try {
      await deleteDoc(
        doc(db, "users", profile.uid, "foodLog", dateStr, "entries", docId)
      );
      setEntries((prev) => prev.filter((e) => e.docId !== docId));
    } catch {
      /* silent */
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macroBar = (
    label: string,
    current: number,
    target: number,
    color: string
  ) => {
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="font-medium text-text">
            {Math.round(current)}
            {target > 0 && (
              <span className="text-text-muted"> / {target}</span>
            )}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={clsx("h-full rounded-full transition-all", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <RequireActive>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Nutrition</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Plus size={16} />
          Add Food
        </button>
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

      {/* Macro Summary */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Daily Totals</h3>
        <div className="space-y-3">
          {macroBar(
            "Calories",
            totals.calories,
            targets?.calories || 0,
            "bg-accent"
          )}
          {macroBar(
            "Protein",
            totals.protein,
            targets?.protein || 0,
            "bg-primary"
          )}
          {macroBar(
            "Carbs",
            totals.carbs,
            targets?.carbs || 0,
            "bg-warning"
          )}
          {macroBar("Fat", totals.fat, targets?.fat || 0, "bg-success")}
        </div>
      </div>

      {/* Food Log */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-semibold text-text">
          Food Log ({entries.length} items)
        </h3>
        {entries.length === 0 ? (
          <p className="py-8 text-center text-text-muted">
            No food logged yet today. Tap &quot;Add Food&quot; to start.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.docId}
                className="flex items-start justify-between rounded-lg bg-surface-light p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">
                    {entry.foodName}
                  </p>
                  {entry.brand && (
                    <p className="text-xs text-text-muted">{entry.brand}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-secondary">
                    <span className="text-accent">{entry.calories} kcal</span>
                    <span>P: {entry.protein}g</span>
                    <span>C: {entry.carbs}g</span>
                    <span>F: {entry.fat}g</span>
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(entry.docId)}
                  className="ml-2 text-text-muted hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Log Food</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Food Name *
                </label>
                <input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Chicken breast"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  Brand (optional)
                </label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Tesco"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Serving Size
                  </label>
                  <input
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={addEntry}
                disabled={!foodName.trim()}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequireActive>
  );
}
