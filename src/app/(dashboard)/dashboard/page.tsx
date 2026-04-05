"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MealPlan, DailyProgress, NutritionTargets, FoodEntry, UserProfile } from "@/types";
import {
  Users,
  UtensilsCrossed,
  Dumbbell,
  CalendarCheck,
  MessageCircle,
  Target,
  HeartPulse,
  Camera,
  Droplets,
  Apple,
  Flame,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const coachQuickActions = [
  { href: "/dashboard/clients", label: "Clients", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { href: "/dashboard/meal-plans", label: "Meal Plans", icon: UtensilsCrossed, color: "text-accent", bg: "bg-accent/10" },
  { href: "/dashboard/workouts/editor", label: "Workouts", icon: Dumbbell, color: "text-success", bg: "bg-success/10" },
  { href: "/dashboard/checkins", label: "Check-ins", icon: CalendarCheck, color: "text-warning", bg: "bg-warning/10" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
];

const clientQuickActions = [
  { href: "/dashboard/plan", label: "My Plan", icon: UtensilsCrossed, color: "text-primary", bg: "bg-primary/10" },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: Apple, color: "text-accent", bg: "bg-accent/10" },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell, color: "text-success", bg: "bg-success/10" },
  { href: "/dashboard/cardio", label: "Cardio", icon: HeartPulse, color: "text-warning", bg: "bg-warning/10" },
  { href: "/dashboard/checkin", label: "Check-in", icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
  { href: "/dashboard/goals", label: "Goals", icon: Target, color: "text-accent", bg: "bg-accent/10" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, color: "text-success", bg: "bg-success/10" },
  { href: "/dashboard/progress-photos", label: "Photos", icon: Camera, color: "text-warning", bg: "bg-warning/10" },
];

export default function DashboardPage() {
  const { profile, isOwner } = useAuth();
  const quickActions = isOwner ? coachQuickActions : clientQuickActions;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text sm:text-3xl">
          {isOwner ? "Coach Dashboard" : "My Dashboard"}
        </h1>
        <p className="mt-1 text-text-secondary">
          Welcome back, {profile?.name || "there"}.{" "}
          {isOwner
            ? "Manage your clients and their programmes."
            : "Here\u2019s your daily overview."}
        </p>
      </div>

      {/* Stats */}
      {isOwner ? <CoachStats /> : <ClientStats />}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:bg-surface-light"
            >
              <div
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  action.bg
                )}
              >
                <action.icon size={22} className={action.color} />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientStats() {
  const { profile } = useAuth();
  const [mealsCompleted, setMealsCompleted] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [waterL, setWaterL] = useState(0);
  const [waterTarget, setWaterTarget] = useState(3);
  const [calories, setCalories] = useState(0);
  const [calorieTarget, setCalorieTarget] = useState(0);
  const [protein, setProtein] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!profile) return;
    loadStats();
  }, [profile]);

  async function loadStats() {
    if (!profile) return;
    try {
      // Meal plan + progress
      const [planDoc, progressDoc, targetsDoc, entriesSnap] = await Promise.all([
        getDoc(doc(db, "users", profile.uid, "mealPlan", "current")),
        getDoc(doc(db, "users", profile.uid, "dailyProgress", today)),
        getDoc(doc(db, "users", profile.uid, "settings", "nutritionTargets")),
        getDocs(collection(db, "users", profile.uid, "foodLog", today, "entries")),
      ]);

      if (planDoc.exists()) {
        const plan = planDoc.data() as MealPlan;
        setTotalMeals(plan.meals.length);
        setWaterTarget(plan.waterTargetLitres || 3);
      }

      if (progressDoc.exists()) {
        const progress = progressDoc.data() as DailyProgress;
        setMealsCompleted((progress.mealsCompleted || []).filter(Boolean).length);
        setWaterL((progress.waterGlasses || 0) * 0.5);
      }

      if (targetsDoc.exists()) {
        const targets = targetsDoc.data() as NutritionTargets;
        setCalorieTarget(targets.calories || 0);
        setProteinTarget(targets.protein || 0);
      }

      const entries = entriesSnap.docs.map((d) => d.data() as FoodEntry);
      setCalories(entries.reduce((s, e) => s + (e.calories || 0), 0));
      setProtein(entries.reduce((s, e) => s + (e.protein || 0), 0));
    } catch {
      /* silent */
    }
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    target,
    color,
    iconColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    target?: string;
    color: string;
    iconColor: string;
  }) => (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={18} className={iconColor} />
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      {target && <p className="text-xs text-text-muted">of {target}</p>}
      {target && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={clsx("h-full rounded-full transition-all", color)}
            style={{
              width: `${Math.min(
                (parseFloat(value) / parseFloat(target)) * 100,
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={UtensilsCrossed}
        label="Meals"
        value={`${mealsCompleted}`}
        target={totalMeals > 0 ? `${totalMeals}` : undefined}
        color="bg-primary"
        iconColor="text-primary"
      />
      <StatCard
        icon={Droplets}
        label="Water"
        value={`${waterL.toFixed(1)}L`}
        target={`${waterTarget}L`}
        color="bg-success"
        iconColor="text-success"
      />
      <StatCard
        icon={Flame}
        label="Calories"
        value={`${calories}`}
        target={calorieTarget > 0 ? `${calorieTarget}` : undefined}
        color="bg-accent"
        iconColor="text-accent"
      />
      <StatCard
        icon={Dumbbell}
        label="Protein"
        value={`${Math.round(protein)}g`}
        target={proteinTarget > 0 ? `${proteinTarget}g` : undefined}
        color="bg-warning"
        iconColor="text-warning"
      />
    </div>
  );
}

function CoachStats() {
  const [clientCount, setClientCount] = useState(0);
  const [recentCheckIns, setRecentCheckIns] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const clientsSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      setClientCount(clientsSnap.size);

      // Count check-ins from this week
      const weekAgo = Date.now() - 7 * 86400000;
      let checkInCount = 0;
      for (const clientDoc of clientsSnap.docs) {
        const checkInsSnap = await getDocs(
          query(
            collection(db, "users", clientDoc.id, "checkIns"),
            orderBy("submittedAt", "desc"),
            limit(1)
          )
        );
        if (
          !checkInsSnap.empty &&
          checkInsSnap.docs[0].data().submittedAt > weekAgo
        ) {
          checkInCount++;
        }
      }
      setRecentCheckIns(checkInCount);
    } catch {
      /* silent */
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <span className="text-sm text-text-secondary">Total Clients</span>
        </div>
        <p className="text-2xl font-bold text-text">{clientCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <CalendarCheck size={18} className="text-success" />
          <span className="text-sm text-text-secondary">Check-ins This Week</span>
        </div>
        <p className="text-2xl font-bold text-text">{recentCheckIns}</p>
        <p className="text-xs text-text-muted">of {clientCount} clients</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 col-span-2 sm:col-span-1">
        <div className="mb-2 flex items-center gap-2">
          <MessageCircle size={18} className="text-accent" />
          <span className="text-sm text-text-secondary">Messages</span>
        </div>
        <Link
          href="/dashboard/messages"
          className="text-sm text-primary hover:text-primary-dark"
        >
          Open inbox →
        </Link>
      </div>
    </div>
  );
}
