"use client";

import { useState } from "react";
import { searchWorkouts, WORKOUT_CATEGORIES, LibraryWorkout } from "@/lib/workoutLibrary";
import { suggestWorkoutWithAI, AIWorkoutResult } from "@/lib/ai";
import { RequireActive } from "@/components/ui/RequireActive";
import { Search, Dumbbell, Home, Clock, Zap, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function WorkoutIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<"gym" | "home">("gym");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWorkout, setAiWorkout] = useState<AIWorkoutResult | null>(null);

  // Filter library
  const libraryResults = searchWorkouts(
    searchQuery || selectedCategory || "",
    location
  );

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiWorkout(null);
    try {
      const result = await suggestWorkoutWithAI(searchQuery, location);
      setAiWorkout(result);
    } catch {
      /* silent */
    } finally {
      setAiLoading(false);
    }
  };

  const WorkoutCard = ({ workout }: { workout: LibraryWorkout }) => {
    const isExpanded = expandedWorkout === workout.id;
    return (
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <button
          onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-light/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-text">{workout.name}</h3>
              <span className={clsx(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                workout.difficulty === "beginner" && "bg-success/20 text-success",
                workout.difficulty === "intermediate" && "bg-accent/20 text-accent",
                workout.difficulty === "advanced" && "bg-error/20 text-error"
              )}>
                {workout.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={10} /> ~{workout.duration}min
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{workout.description}</p>
          </div>
          {isExpanded ? (
            <ChevronUp size={18} className="shrink-0 text-text-muted ml-2" />
          ) : (
            <ChevronDown size={18} className="shrink-0 text-text-muted ml-2" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-border p-4 space-y-3">
            {workout.exercises.map((exercise, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{exercise.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.sets} sets</span>
                    <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.reps}</span>
                    <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.restSeconds}s rest</span>
                  </div>
                  {exercise.notes && (
                    <p className="mt-1 text-xs italic text-accent">{exercise.notes}</p>
                  )}
                </div>
              </div>
            ))}
            {workout.tips.length > 0 && (
              <div className="mt-2 rounded-lg bg-surface-light p-3">
                <p className="text-xs font-bold text-text-muted mb-1">TIPS</p>
                {workout.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-text-secondary">- {tip}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <RequireActive>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Workout Ideas</h1>
          <p className="mt-1 text-text-secondary">
            Browse workouts or search for something specific.
          </p>
        </div>

        {/* Location toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setLocation("gym"); setSelectedCategory(null); }}
            className={clsx(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              location === "gym"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border"
            )}
          >
            <Dumbbell size={16} /> Gym
          </button>
          <button
            onClick={() => { setLocation("home"); setSelectedCategory(null); }}
            className={clsx(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              location === "home"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border"
            )}
          >
            <Home size={16} /> Home
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              !selectedCategory
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary border border-border hover:border-accent/30"
            )}
          >
            All
          </button>
          {WORKOUT_CATEGORIES.filter((cat) => {
            // Only show categories that have workouts for the selected location
            return searchWorkouts(cat, location).length > 0;
          }).map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSearchQuery(""); }}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary border border-border hover:border-accent/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); setAiWorkout(null); }}
              placeholder="Search workouts..."
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Library results */}
        {libraryResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              {libraryResults.length} workout{libraryResults.length !== 1 ? "s" : ""} found
            </p>
            {libraryResults.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">
              No workouts found for &quot;{searchQuery}&quot; in the library.
            </p>
            <button
              onClick={handleAISearch}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-50 transition-all"
            >
              <Sparkles size={18} />
              {aiLoading ? "Generating..." : "Ask AI to create one"}
            </button>
          </div>
        ) : (
          <p className="py-8 text-center text-text-muted">
            No workouts in this category yet.
          </p>
        )}

        {/* AI Loading */}
        {aiLoading && (
          <div className="flex flex-col items-center py-8">
            <Zap size={32} className="mb-3 animate-pulse text-accent" />
            <p className="text-text-secondary">Generating your workout...</p>
          </div>
        )}

        {/* AI Result */}
        {aiWorkout && !aiLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <p className="text-sm font-semibold text-accent">AI Generated</p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-surface p-5">
              <h2 className="text-xl font-bold text-text">{aiWorkout.name}</h2>
              {aiWorkout.duration && (
                <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                  <Clock size={14} /> ~{aiWorkout.duration} min
                </p>
              )}
              <p className="mt-1 text-sm text-text-secondary">{aiWorkout.description}</p>
            </div>
            <div className="space-y-3">
              {aiWorkout.exercises.map((exercise, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text">{exercise.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.sets} sets</span>
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.reps}</span>
                      <span className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-text-muted">{exercise.restSeconds}s rest</span>
                    </div>
                    {exercise.notes && <p className="mt-1 text-xs italic text-accent">{exercise.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
            {aiWorkout.tips?.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-text-muted">TIPS</p>
                {aiWorkout.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-text-secondary">- {tip}</p>
                ))}
              </div>
            )}
            <p className="text-center text-xs text-text-muted">
              Generated by AI — your coach&apos;s programme takes priority.
            </p>
          </div>
        )}
      </div>
    </RequireActive>
  );
}
