"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { WorkoutProgramme, WorkoutProgress, ExerciseLog } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Dumbbell, Play, Check, Clock, CheckCircle, Weight } from "lucide-react";
import clsx from "clsx";

export default function WorkoutsPage() {
  const { profile } = useAuth();
  const [programme, setProgramme] = useState<WorkoutProgramme | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;
    try {
      const progDoc = await getDoc(
        doc(db, "users", profile.uid, "workoutProgramme", "current")
      );
      if (progDoc.exists()) {
        const prog = progDoc.data() as WorkoutProgramme;
        setProgramme(prog);

        const progressDoc = await getDoc(
          doc(db, "users", profile.uid, "workoutProgress", today)
        );
        if (progressDoc.exists()) {
          const data = progressDoc.data() as WorkoutProgress;
          setProgress(data);
          const dayIdx = prog.days.findIndex((d) => d.label === data.dayLabel);
          if (dayIdx >= 0) setSelectedDay(dayIdx);
        }
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const startWorkout = async (dayIndex: number) => {
    if (!profile || !programme) return;
    const day = programme.days[dayIndex];
    const newProgress: WorkoutProgress = {
      date: today,
      dayLabel: day.label,
      exercisesCompleted: new Array(day.exercises.length).fill(false),
      exerciseLogs: new Array(day.exercises.length).fill({ weight: "", notes: "" }),
    };
    setProgress(newProgress);
    setSelectedDay(dayIndex);
    await setDoc(
      doc(db, "users", profile.uid, "workoutProgress", today),
      newProgress
    );
  };

  const saveProgress = async (newProgress: WorkoutProgress) => {
    setProgress(newProgress);
    if (profile) {
      await setDoc(
        doc(db, "users", profile.uid, "workoutProgress", today),
        newProgress
      );
    }
  };

  const toggleExercise = async (exerciseIndex: number) => {
    if (!profile || !progress) return;
    const newCompleted = [...progress.exercisesCompleted];
    newCompleted[exerciseIndex] = !newCompleted[exerciseIndex];
    const allDone = newCompleted.every(Boolean);
    saveProgress({
      ...progress,
      exercisesCompleted: newCompleted,
      completedAt: allDone ? Date.now() : undefined,
    });
  };

  const updateExerciseLog = (index: number, field: keyof ExerciseLog, value: string) => {
    if (!progress) return;
    const logs = [...(progress.exerciseLogs || [])];
    while (logs.length <= index) logs.push({ weight: "", notes: "" });
    logs[index] = { ...logs[index], [field]: value };
    saveProgress({ ...progress, exerciseLogs: logs });
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (!programme) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Dumbbell size={64} className="mb-4 text-text-muted" />
        <h2 className="text-xl font-bold text-text">No Programme Yet</h2>
        <p className="mt-1 text-text-secondary">
          Your coach will set your workout programme soon
        </p>
      </div>
    );
  }

  const currentDay = programme.days[selectedDay];
  const isActiveWorkout = progress?.dayLabel === currentDay?.label;
  const completedCount = isActiveWorkout
    ? (progress.exercisesCompleted || []).filter(Boolean).length
    : 0;
  const totalExercises = currentDay?.exercises.length || 0;
  const progressPct =
    totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">{programme.name}</h1>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {programme.days.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={clsx(
              "whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all",
              selectedDay === index
                ? "bg-primary text-white"
                : "bg-surface text-text-muted hover:bg-surface-light"
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {isActiveWorkout && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-bold text-text">
            {completedCount}/{totalExercises} exercises done
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {progress.completedAt && (
            <div className="mt-2 flex items-center gap-1.5 text-success">
              <CheckCircle size={16} />
              <span className="text-sm font-bold">Workout Complete!</span>
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      {!isActiveWorkout && (
        <button
          onClick={() => startWorkout(selectedDay)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-4 font-bold text-white hover:opacity-90 transition-opacity"
        >
          <Play size={20} />
          Start {currentDay?.label} Workout
        </button>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        {currentDay?.exercises.map((exercise, index) => {
          const completed =
            isActiveWorkout && progress.exercisesCompleted?.[index];
          const log = progress?.exerciseLogs?.[index];
          return (
            <div
              key={index}
              className={clsx(
                "rounded-xl border transition-all",
                completed
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-surface"
              )}
            >
              {/* Exercise header — clickable to toggle */}
              <button
                onClick={() => isActiveWorkout && toggleExercise(index)}
                disabled={!isActiveWorkout}
                className={clsx(
                  "flex w-full items-start gap-4 p-4 text-left",
                  isActiveWorkout && !completed && "hover:bg-surface-light/50",
                  completed && "opacity-70"
                )}
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    completed
                      ? "bg-success text-white"
                      : "bg-surface-light text-text-muted"
                  )}
                >
                  {completed ? <Check size={16} /> : index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={clsx(
                      "font-bold",
                      completed ? "text-text-muted line-through" : "text-text"
                    )}
                  >
                    {exercise.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                      {exercise.sets} sets
                    </span>
                    <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                      {exercise.reps} reps
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                      <Clock size={10} />
                      {exercise.restSeconds}s rest
                    </span>
                  </div>
                  {exercise.notes && (
                    <p className="mt-1.5 text-xs italic text-accent">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              </button>

              {/* Weight & notes input — shown when workout is active */}
              {isActiveWorkout && (
                <div className="border-t border-border/50 px-4 pb-4 pt-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <Weight size={12} />
                        Weight used
                      </label>
                      <input
                        type="text"
                        value={log?.weight || ""}
                        onChange={(e) =>
                          updateExerciseLog(index, "weight", e.target.value)
                        }
                        placeholder="e.g. 40kg, 20kg DBs"
                        className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-text-muted">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={log?.notes || ""}
                        onChange={(e) =>
                          updateExerciseLog(index, "notes", e.target.value)
                        }
                        placeholder="e.g. felt easy, up next time"
                        className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {log?.weight && (
                    <p className="mt-2 text-xs text-success">
                      Logged: {log.weight}
                      {log.notes ? ` — ${log.notes}` : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Programme Notes */}
      {programme.notes.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 font-semibold text-text">Coach Notes</h3>
          {programme.notes.map((note, i) => (
            <p key={i} className="text-sm text-text-secondary">
              - {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
