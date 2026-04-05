"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile, WorkoutProgramme, WorkoutDay, WorkoutExercise } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { Save, Plus, Trash2, Users } from "lucide-react";

export default function WorkoutEditorPage() {
  const { isOwner } = useAuth();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client");

  const [clients, setClients] = useState<UserProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState(preselectedClient || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [notes, setNotes] = useState<string[]>([""]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) loadProgramme();
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

  async function loadProgramme() {
    if (!selectedClient) return;
    try {
      const progDoc = await getDoc(
        doc(db, "users", selectedClient, "workoutProgramme", "current")
      );
      if (progDoc.exists()) {
        const prog = progDoc.data() as WorkoutProgramme;
        setName(prog.name || "");
        setDays(prog.days || []);
        setNotes(prog.notes?.length ? prog.notes : [""]);
      } else {
        setName("");
        setDays([]);
        setNotes([""]);
      }
    } catch {
      /* silent */
    }
  }

  const saveProgramme = async () => {
    if (!selectedClient || !name) return;
    setSaving(true);
    try {
      const prog: WorkoutProgramme = {
        name,
        days,
        notes: notes.filter((n) => n.trim()),
        updatedAt: Date.now(),
      };
      await setDoc(
        doc(db, "users", selectedClient, "workoutProgramme", "current"),
        prog
      );
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const addDay = () => {
    setDays([...days, { label: `Day ${days.length + 1}`, exercises: [] }]);
  };

  const removeDay = (idx: number) => {
    setDays(days.filter((_, i) => i !== idx));
  };

  const updateDay = (idx: number, updates: Partial<WorkoutDay>) => {
    setDays(days.map((d, i) => (i === idx ? { ...d, ...updates } : d)));
  };

  const addExercise = (dayIdx: number) => {
    const day = days[dayIdx];
    updateDay(dayIdx, {
      exercises: [
        ...day.exercises,
        { name: "", sets: 3, reps: "10", restSeconds: 60 },
      ],
    });
  };

  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    updates: Partial<WorkoutExercise>
  ) => {
    const day = days[dayIdx];
    const newExercises = day.exercises.map((e, i) =>
      i === exIdx ? { ...e, ...updates } : e
    );
    updateDay(dayIdx, { exercises: newExercises });
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const day = days[dayIdx];
    updateDay(dayIdx, {
      exercises: day.exercises.filter((_, i) => i !== exIdx),
    });
  };

  if (!isOwner)
    return <div className="py-24 text-center text-text-muted">Coach access only.</div>;
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Workout Editor</h1>
        {selectedClient && (
          <button
            onClick={saveProgramme}
            disabled={saving || !name}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Programme"}
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
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Programme Name */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Programme Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4-Day Push Pull Legs"
              className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Days */}
          {days.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <input
                  value={day.label}
                  onChange={(e) =>
                    updateDay(dayIdx, { label: e.target.value })
                  }
                  className="rounded-lg border border-border bg-input-bg px-3 py-1 text-sm font-bold text-text focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => removeDay(dayIdx)}
                  className="text-error/60 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-lg border border-border bg-bg p-3"
                  >
                    <div className="mb-2 flex gap-2">
                      <input
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(dayIdx, exIdx, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Exercise name"
                        className="flex-1 rounded border border-border bg-input-bg px-2 py-1 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={() => removeExercise(dayIdx, exIdx)}
                        className="text-text-muted hover:text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-text-muted">
                          Sets
                        </label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(dayIdx, exIdx, {
                              sets: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted">
                          Reps
                        </label>
                        <input
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(dayIdx, exIdx, {
                              reps: e.target.value,
                            })
                          }
                          className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted">
                          Rest (s)
                        </label>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) =>
                            updateExercise(dayIdx, exIdx, {
                              restSeconds: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <input
                      value={ex.notes || ""}
                      onChange={(e) =>
                        updateExercise(dayIdx, exIdx, {
                          notes: e.target.value,
                        })
                      }
                      placeholder="Notes (optional)"
                      className="mt-2 w-full rounded border border-border bg-input-bg px-2 py-1 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => addExercise(dayIdx)}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
              >
                <Plus size={12} /> Add exercise
              </button>
            </div>
          ))}

          <button
            onClick={addDay}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
          >
            <Plus size={18} />
            Add Day
          </button>

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
