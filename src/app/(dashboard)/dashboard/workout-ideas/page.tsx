"use client";

import { useState, useEffect } from "react";
import { searchWorkouts, WORKOUT_CATEGORIES, LibraryWorkout } from "@/lib/workoutLibrary";
import { suggestWorkoutWithAI, AIWorkoutResult } from "@/lib/ai";
import { RequireActive } from "@/components/ui/RequireActive";
import { getExerciseInfo } from "@/lib/exerciseDatabase";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { UserProfile, WorkoutProgramme } from "@/types";
import { Search, Dumbbell, Home, Clock, Zap, Sparkles, ChevronDown, ChevronUp, HelpCircle, X, Send, Users } from "lucide-react";
import clsx from "clsx";

export default function WorkoutIdeasPage() {
  const { isOwner } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<"gym" | "home">("gym");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWorkout, setAiWorkout] = useState<AIWorkoutResult | null>(null);

  // Exercise info popup
  const [infoExercise, setInfoExercise] = useState<string | null>(null);
  const exerciseInfo = infoExercise ? getExerciseInfo(infoExercise) : null;

  // Coach: send to client
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendWorkout, setSendWorkout] = useState<{ name: string; exercises: { name: string; sets: number; reps: string; restSeconds: number; notes?: string }[] } | null>(null);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (isOwner && showSendModal && clients.length === 0) {
      getDocs(query(collection(db, "users"), where("role", "==", "client")))
        .then((snap) => setClients(snap.docs.map((d) => d.data() as UserProfile).sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => {});
    }
  }, [isOwner, showSendModal]);

  const openSendModal = (workout: { name: string; exercises: { name: string; sets: number; reps: string; restSeconds: number; notes?: string }[] }) => {
    setSendWorkout(workout);
    setSelectedClient("");
    setSentSuccess(false);
    setShowSendModal(true);
  };

  const sendToClient = async () => {
    if (!selectedClient || !sendWorkout) return;
    setSending(true);
    try {
      const programme: WorkoutProgramme = {
        name: sendWorkout.name,
        days: [{ label: sendWorkout.name, exercises: sendWorkout.exercises }],
        notes: ["Assigned from Workout Ideas library"],
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "users", selectedClient, "workoutProgramme", "current"), programme);
      setSentSuccess(true);
      setTimeout(() => setShowSendModal(false), 1500);
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text">{exercise.name}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setInfoExercise(exercise.name); }}
                      className="shrink-0 text-text-muted hover:text-primary transition-colors"
                      title="How to do this exercise"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </div>
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
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openSendModal({ name: workout.name, exercises: workout.exercises });
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Send size={14} />
                Assign to Client
              </button>
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
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-text">{exercise.name}</p>
                      <button
                        onClick={() => setInfoExercise(exercise.name)}
                        className="shrink-0 text-text-muted hover:text-accent transition-colors"
                        title="How to do this exercise"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
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
            {isOwner && (
              <button
                onClick={() => openSendModal({ name: aiWorkout.name, exercises: aiWorkout.exercises })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Send size={14} />
                Assign to Client
              </button>
            )}
            <p className="mt-2 text-center text-xs text-text-muted">
              Generated by AI — your coach&apos;s programme takes priority.
            </p>
          </div>
        )}
      </div>

      {/* Exercise Info Modal */}
      {infoExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">{infoExercise}</h3>
              <button
                onClick={() => setInfoExercise(null)}
                className="text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            {exerciseInfo ? (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-1 text-sm font-bold text-primary">How To</h4>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {exerciseInfo.howTo}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold text-accent">Muscles Worked</h4>
                  <div className="flex flex-wrap gap-2">
                    {exerciseInfo.muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                No information available for this exercise yet.
              </p>
            )}
          </div>
        </div>
      )}
      {/* Send to Client Modal */}
      {showSendModal && sendWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Assign to Client</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            {sentSuccess ? (
              <div className="py-8 text-center">
                <p className="text-lg font-bold text-success">Programme Sent!</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {sendWorkout.name} has been assigned.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Assign &quot;{sendWorkout.name}&quot; ({sendWorkout.exercises.length} exercises) as a client&apos;s workout programme.
                </p>
                <div>
                  <label className="mb-1 block text-sm text-text-secondary">
                    Select Client
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-text focus:border-primary focus:outline-none"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-warning">
                  This will replace the client&apos;s current workout programme.
                </p>
                <button
                  onClick={sendToClient}
                  disabled={sending || !selectedClient}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Assign Programme"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </RequireActive>
  );
}
