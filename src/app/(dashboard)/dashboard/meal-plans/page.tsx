"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile, MealPlan, MealItem } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { Save, Plus, Trash2, Users } from "lucide-react";

export default function MealPlansPage() {
  const { isOwner } = useAuth();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client");

  const [clients, setClients] = useState<UserProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState(preselectedClient || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Meal plan fields
  const [freeCalories, setFreeCalories] = useState(0);
  const [waterTargetLitres, setWaterTargetLitres] = useState(3);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [optionalSnack, setOptionalSnack] = useState("");
  const [notes, setNotes] = useState<string[]>([""]);
  const [supplements, setSupplements] = useState<string[]>([""]);

  // Nutrition targets
  const [targetCalories, setTargetCalories] = useState(0);
  const [targetProtein, setTargetProtein] = useState(0);
  const [targetCarbs, setTargetCarbs] = useState(0);
  const [targetFat, setTargetFat] = useState(0);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) loadPlan();
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

  async function loadPlan() {
    if (!selectedClient) return;
    try {
      const planDoc = await getDoc(
        doc(db, "users", selectedClient, "mealPlan", "current")
      );
      if (planDoc.exists()) {
        const plan = planDoc.data() as MealPlan;
        setFreeCalories(plan.freeCalories || 0);
        setWaterTargetLitres(plan.waterTargetLitres || 3);
        setMeals(plan.meals || []);
        setOptionalSnack(plan.optionalSnack || "");
        setNotes(plan.notes?.length ? plan.notes : [""]);
        setSupplements(plan.supplements?.length ? plan.supplements : [""]);
      } else {
        setFreeCalories(0);
        setWaterTargetLitres(3);
        setMeals([]);
        setOptionalSnack("");
        setNotes([""]);
        setSupplements([""]);
      }

      // Load nutrition targets
      const targetsDoc = await getDoc(
        doc(db, "users", selectedClient, "settings", "nutritionTargets")
      );
      if (targetsDoc.exists()) {
        const t = targetsDoc.data();
        setTargetCalories(t.calories || 0);
        setTargetProtein(t.protein || 0);
        setTargetCarbs(t.carbs || 0);
        setTargetFat(t.fat || 0);
      } else {
        setTargetCalories(0);
        setTargetProtein(0);
        setTargetCarbs(0);
        setTargetFat(0);
      }
    } catch {
      /* silent */
    }
  }

  const savePlan = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const plan: MealPlan = {
        freeCalories,
        waterTargetLitres,
        meals,
        optionalSnack: optionalSnack || undefined,
        notes: notes.filter((n) => n.trim()),
        supplements: supplements.filter((s) => s.trim()),
        updatedAt: Date.now(),
      };
      await setDoc(
        doc(db, "users", selectedClient, "mealPlan", "current"),
        plan
      );

      // Save nutrition targets
      if (targetCalories || targetProtein || targetCarbs || targetFat) {
        await setDoc(
          doc(db, "users", selectedClient, "settings", "nutritionTargets"),
          {
            calories: targetCalories,
            protein: targetProtein,
            carbs: targetCarbs,
            fat: targetFat,
          }
        );
      }
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      { label: `M${meals.length + 1}`, items: [""], estimatedCalories: 0, estimatedProtein: 0, estimatedCarbs: 0, estimatedFat: 0 },
    ]);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const updateMeal = (index: number, updates: Partial<MealItem>) => {
    setMeals(meals.map((m, i) => (i === index ? { ...m, ...updates } : m)));
  };

  const addMealItem = (mealIndex: number) => {
    const meal = meals[mealIndex];
    updateMeal(mealIndex, { items: [...meal.items, ""] });
  };

  const updateMealItem = (mealIndex: number, itemIndex: number, value: string) => {
    const meal = meals[mealIndex];
    const newItems = [...meal.items];
    newItems[itemIndex] = value;
    updateMeal(mealIndex, { items: newItems });
  };

  const removeMealItem = (mealIndex: number, itemIndex: number) => {
    const meal = meals[mealIndex];
    updateMeal(mealIndex, {
      items: meal.items.filter((_, i) => i !== itemIndex),
    });
  };

  if (!isOwner)
    return (
      <div className="py-24 text-center text-text-muted">
        Coach access only.
      </div>
    );
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Meal Plans</h1>
        {selectedClient && (
          <button
            onClick={savePlan}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Plan"}
          </button>
        )}
      </div>

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
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Free Calories
              </label>
              <input
                type="number"
                value={freeCalories || ""}
                onChange={(e) => setFreeCalories(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Water Target (Litres)
              </label>
              <input
                type="number"
                value={waterTargetLitres}
                onChange={(e) =>
                  setWaterTargetLitres(parseFloat(e.target.value) || 3)
                }
                className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text focus:border-primary focus:outline-none"
                step="0.5"
              />
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-semibold text-text">Daily Nutrition Targets</h3>
            <p className="mb-3 text-xs text-text-muted">
              Set the client&apos;s daily macro targets. These show on their Nutrition page as progress bars.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Calories</label>
                <input
                  type="number"
                  value={targetCalories || ""}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 2200"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Protein (g)</label>
                <input
                  type="number"
                  value={targetProtein || ""}
                  onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 180"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Carbs (g)</label>
                <input
                  type="number"
                  value={targetCarbs || ""}
                  onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 200"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Fat (g)</label>
                <input
                  type="number"
                  value={targetFat || ""}
                  onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 60"
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Meals */}
          {meals.map((meal, mealIdx) => (
            <div
              key={mealIdx}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <input
                  value={meal.label}
                  onChange={(e) =>
                    updateMeal(mealIdx, { label: e.target.value })
                  }
                  className="w-20 rounded-lg border border-border bg-input-bg px-2 py-1 text-center text-sm font-bold text-text focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => removeMeal(mealIdx)}
                  className="text-error/60 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Meal items */}
              <div className="mb-3 space-y-2">
                {meal.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) =>
                        updateMealItem(mealIdx, itemIdx, e.target.value)
                      }
                      placeholder="e.g. 50g porridge oats"
                      className="flex-1 rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={() => removeMealItem(mealIdx, itemIdx)}
                      className="text-text-muted hover:text-error"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addMealItem(mealIdx)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
                >
                  <Plus size={12} /> Add item
                </button>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="mb-0.5 block text-xs text-text-muted">
                    Cals
                  </label>
                  <input
                    type="number"
                    value={meal.estimatedCalories || ""}
                    onChange={(e) =>
                      updateMeal(mealIdx, {
                        estimatedCalories: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-text-muted">
                    Protein
                  </label>
                  <input
                    type="number"
                    value={meal.estimatedProtein || ""}
                    onChange={(e) =>
                      updateMeal(mealIdx, {
                        estimatedProtein: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-text-muted">
                    Carbs
                  </label>
                  <input
                    type="number"
                    value={meal.estimatedCarbs || ""}
                    onChange={(e) =>
                      updateMeal(mealIdx, {
                        estimatedCarbs: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-text-muted">
                    Fat
                  </label>
                  <input
                    type="number"
                    value={meal.estimatedFat || ""}
                    onChange={(e) =>
                      updateMeal(mealIdx, {
                        estimatedFat: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Note */}
              <input
                value={meal.note || ""}
                onChange={(e) =>
                  updateMeal(mealIdx, { note: e.target.value })
                }
                placeholder="Note (optional)"
                className="mt-2 w-full rounded-lg border border-border bg-input-bg px-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          ))}

          <button
            onClick={addMeal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
          >
            <Plus size={18} />
            Add Meal
          </button>

          {/* Optional Snack */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Optional Snack
            </label>
            <input
              value={optionalSnack}
              onChange={(e) => setOptionalSnack(e.target.value)}
              placeholder="e.g. Low cal jelly or yoghurt"
              className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Supplements */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-semibold text-text">Supplements</h3>
            {supplements.map((s, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  value={s}
                  onChange={(e) => {
                    const newArr = [...supplements];
                    newArr[i] = e.target.value;
                    setSupplements(newArr);
                  }}
                  placeholder="e.g. Creatine 5g"
                  className="flex-1 rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
            ))}
            <button
              onClick={() => setSupplements([...supplements, ""])}
              className="text-xs text-primary hover:text-primary-dark"
            >
              + Add supplement
            </button>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-semibold text-text">Coach Notes</h3>
            {notes.map((n, i) => (
              <div key={i} className="mb-2">
                <textarea
                  value={n}
                  onChange={(e) => {
                    const newArr = [...notes];
                    newArr[i] = e.target.value;
                    setNotes(newArr);
                  }}
                  placeholder="Add a note..."
                  className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  rows={2}
                />
              </div>
            ))}
            <button
              onClick={() => setNotes([...notes, ""])}
              className="text-xs text-primary hover:text-primary-dark"
            >
              + Add note
            </button>
          </div>
        </>
      )}
    </div>
  );
}
