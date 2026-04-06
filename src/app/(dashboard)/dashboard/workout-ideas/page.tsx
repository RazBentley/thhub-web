"use client";

import { useState } from "react";
import { suggestWorkoutWithAI, AIWorkoutResult } from "@/lib/ai";
import { RequireActive } from "@/components/ui/RequireActive";
import { Search, Dumbbell, Home, Clock, Zap } from "lucide-react";
import clsx from "clsx";

const QUICK_SEARCHES = [
  { label: "Home upper body", query: "upper body workout at home", location: "home" },
  { label: "Home lower body", query: "lower body workout at home", location: "home" },
  { label: "Home full body", query: "full body workout at home no equipment", location: "home" },
  { label: "Home HIIT", query: "HIIT cardio workout at home", location: "home" },
  { label: "Home core", query: "core and abs workout at home", location: "home" },
  { label: "Gym chest & triceps", query: "chest and triceps workout", location: "gym" },
  { label: "Gym back & biceps", query: "back and biceps workout", location: "gym" },
  { label: "Gym legs", query: "leg day workout with squats and deadlifts", location: "gym" },
  { label: "Gym shoulders", query: "shoulder workout with dumbbells and cables", location: "gym" },
  { label: "Gym full body", query: "full body gym workout compound movements", location: "gym" },
];

export default function WorkoutIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<"gym" | "home">("gym");
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<AIWorkoutResult | null>(null);

  const handleSearch = async (query?: string, loc?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    setWorkout(null);
    try {
      const result = await suggestWorkoutWithAI(q, loc || location);
      setWorkout(result);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireActive>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Workout Ideas</h1>
          <p className="mt-1 text-text-secondary">
            Search for workout suggestions or pick a quick option below.
          </p>
        </div>

        {/* Location toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setLocation("gym")}
            className={clsx(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              location === "gym"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border hover:border-primary/30"
            )}
          >
            <Dumbbell size={16} />
            Gym
          </button>
          <button
            onClick={() => setLocation("home")}
            className={clsx(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              location === "home"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border hover:border-primary/30"
            )}
          >
            <Home size={16} />
            Home
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. chest workout, beginner full body, quick HIIT..."
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !searchQuery.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Generating..." : "Search"}
          </button>
        </div>

        {/* Quick searches */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-muted">
            Quick Ideas — {location === "gym" ? "Gym" : "Home"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.filter((s) => s.location === location).map(
              (search) => (
                <button
                  key={search.label}
                  onClick={() => {
                    setSearchQuery(search.query);
                    handleSearch(search.query, search.location);
                  }}
                  disabled={loading}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:border-primary/30 hover:text-text disabled:opacity-50 transition-all"
                >
                  {search.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-12">
            <Zap size={32} className="mb-3 animate-pulse text-accent" />
            <p className="text-text-secondary">
              Generating your workout...
            </p>
          </div>
        )}

        {/* Result */}
        {workout && !loading && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">{workout.name}</h2>
                {workout.duration && (
                  <span className="flex items-center gap-1 text-sm text-text-muted">
                    <Clock size={14} />
                    ~{workout.duration} min
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                {workout.description}
              </p>
            </div>

            {/* Exercises */}
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text">{exercise.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                        {exercise.sets} sets
                      </span>
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                        {exercise.reps} reps
                      </span>
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs font-semibold text-text-muted">
                        {exercise.restSeconds}s rest
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="mt-1.5 text-xs italic text-accent">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {workout.tips && workout.tips.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-2 font-semibold text-text">Tips</h3>
                {workout.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-text-secondary">
                    - {tip}
                  </p>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-text-muted">
              Generated by AI — always check exercises are suitable for your
              ability level. Your coach&apos;s personalised programme takes
              priority.
            </p>
          </div>
        )}
      </div>
    </RequireActive>
  );
}
