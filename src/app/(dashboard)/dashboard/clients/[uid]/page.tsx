"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { UserProfile, DailyProgress, WeeklyCheckIn, WeightGoal, MealPlan } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import {
  ArrowLeft,
  UtensilsCrossed,
  Dumbbell,
  ClipboardCheck,
  Target,
  MessageCircle,
  Droplets,
} from "lucide-react";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const { isOwner } = useAuth();
  const [client, setClient] = useState<UserProfile | null>(null);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<WeeklyCheckIn | null>(null);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadClient();
  }, [uid]);

  async function loadClient() {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) setClient(userDoc.data() as UserProfile);

      const progressDoc = await getDoc(
        doc(db, "users", uid, "dailyProgress", today)
      );
      if (progressDoc.exists())
        setTodayProgress(progressDoc.data() as DailyProgress);

      const checkInSnap = await getDocs(
        query(
          collection(db, "users", uid, "checkIns"),
          orderBy("submittedAt", "desc"),
          limit(1)
        )
      );
      if (!checkInSnap.empty)
        setLatestCheckIn(checkInSnap.docs[0].data() as WeeklyCheckIn);

      const goalDoc = await getDoc(doc(db, "users", uid, "goals", "current"));
      if (goalDoc.exists()) setGoal(goalDoc.data() as WeightGoal);

      const planDoc = await getDoc(
        doc(db, "users", uid, "mealPlan", "current")
      );
      if (planDoc.exists()) setMealPlan(planDoc.data() as MealPlan);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  if (!isOwner)
    return (
      <div className="py-24 text-center text-text-muted">
        Coach access only.
      </div>
    );
  if (loading) return <LoadingSpinner fullPage />;
  if (!client)
    return (
      <div className="py-24 text-center text-text-muted">
        Client not found.
      </div>
    );

  const mealsCompleted = (todayProgress?.mealsCompleted || []).filter(Boolean).length;
  const totalMeals = mealPlan?.meals?.length || 0;
  const waterL =
    ((todayProgress?.waterGlasses || 0) * 0.5).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-text-secondary hover:text-text"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
          {client.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{client.name}</h1>
          <p className="text-sm text-text-secondary">{client.email}</p>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-semibold text-text">Today&apos;s Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-surface-light p-3 text-center">
            <UtensilsCrossed size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-text">
              {mealsCompleted}/{totalMeals}
            </p>
            <p className="text-xs text-text-muted">Meals</p>
          </div>
          <div className="rounded-lg bg-surface-light p-3 text-center">
            <Droplets size={20} className="mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-text">{waterL}L</p>
            <p className="text-xs text-text-muted">Water</p>
          </div>
        </div>
      </div>

      {/* Latest Check-in */}
      {latestCheckIn && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-semibold text-text">
            Latest Check-in ({latestCheckIn.weekId})
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-text-muted">Weight:</span>{" "}
              <span className="text-text">{latestCheckIn.weightCurrent}</span>
            </div>
            <div>
              <span className="text-text-muted">Sleep:</span>{" "}
              <span className="text-text">{latestCheckIn.sleep}</span>
            </div>
            <div>
              <span className="text-text-muted">Energy:</span>{" "}
              <span className="text-text">{latestCheckIn.energy}</span>
            </div>
            <div>
              <span className="text-text-muted">Adherence:</span>{" "}
              <span className="text-text">{latestCheckIn.adherence}</span>
            </div>
            {latestCheckIn.wins && (
              <div className="col-span-2">
                <span className="text-text-muted">Wins:</span>{" "}
                <span className="text-text">{latestCheckIn.wins}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal */}
      {goal && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 font-semibold text-text">Goal</h3>
          <p className="text-sm text-text-secondary">
            {goal.startWeight} → {goal.targetWeight} by{" "}
            {goal.targetDate
              ? new Date(goal.targetDate).toLocaleDateString("en-GB")
              : "No date set"}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            href: `/dashboard/meal-plans?client=${uid}`,
            icon: UtensilsCrossed,
            label: "Meal Plan",
            color: "text-primary",
          },
          {
            href: `/dashboard/workouts?client=${uid}`,
            icon: Dumbbell,
            label: "Workouts",
            color: "text-success",
          },
          {
            href: `/dashboard/checkins?client=${uid}`,
            icon: ClipboardCheck,
            label: "Check-ins",
            color: "text-warning",
          },
          {
            href: `/dashboard/messages`,
            icon: MessageCircle,
            label: "Message",
            color: "text-accent",
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all"
          >
            <action.icon size={22} className={action.color} />
            <span className="text-sm font-medium text-text-secondary">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
