"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { WeeklyCheckIn } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ClipboardCheck, Send, Upload, Camera, X } from "lucide-react";

function getWeekId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week.toString().padStart(2, "0")}`;
}

const ANGLES = ["front", "side", "back"] as const;

export default function CheckInPage() {
  const { profile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    weightCurrent: "",
    weightPrevious: "",
    goal: "",
    sleep: "",
    appetite: "",
    energy: "",
    stress: "",
    gymPerformance: "",
    recovery: "",
    sessionsCompleted: true,
    cardio: "",
    steps: "",
    adherence: "",
    cheatMeal: "",
    questions: "",
    otherNotes: "",
    wins: "",
    goalsNextWeek: "",
  });

  // Photo state
  const [photos, setPhotos] = useState<Record<string, File | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoSelect = (angle: string, file: File | null) => {
    setPhotos((prev) => ({ ...prev, [angle]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreviews((prev) => ({ ...prev, [angle]: url }));
    } else {
      setPhotoPreviews((prev) => {
        const next = { ...prev };
        delete next[angle];
        return next;
      });
    }
  };

  const removePhoto = (angle: string) => {
    handlePhotoSelect(angle, null);
  };

  const uploadPhotos = async (): Promise<{
    frontPhotoUrl?: string;
    sidePhotoUrl?: string;
    backPhotoUrl?: string;
  }> => {
    if (!profile) return {};
    const urls: Record<string, string> = {};
    const weekId = getWeekId();

    for (const angle of ANGLES) {
      const file = photos[angle];
      if (!file) continue;
      const path = `check-in-photos/${profile.uid}/${weekId}/${angle}.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      urls[`${angle}PhotoUrl`] = await getDownloadURL(storageRef);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!profile || !form.weightCurrent) return;
    setSubmitting(true);
    try {
      // Upload photos if any selected
      let photoUrls = {};
      const hasPhotos = Object.values(photos).some(Boolean);
      if (hasPhotos) {
        setUploadingPhotos(true);
        photoUrls = await uploadPhotos();
        setUploadingPhotos(false);
      }

      const weekId = getWeekId();
      const checkIn: WeeklyCheckIn = {
        ...form,
        ...photoUrls,
        submittedAt: Date.now(),
        weekId,
      };
      await setDoc(
        doc(db, "users", profile.uid, "checkIns", weekId),
        checkIn
      );

      // Also save to progressPhotos collection for the photos page
      if (Object.keys(photoUrls).length > 0) {
        const today = new Date().toISOString().split("T")[0];
        await setDoc(
          doc(db, "users", profile.uid, "progressPhotos", today),
          { date: today, ...photoUrls }
        );
      }

      setSubmitted(true);
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
      setUploadingPhotos(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ClipboardCheck size={64} className="mb-4 text-success" />
        <h2 className="text-2xl font-bold text-text">Check-in Submitted!</h2>
        <p className="mt-2 text-text-secondary">
          Your coach will review your progress soon.
        </p>
      </div>
    );
  }

  const Field = ({
    label,
    field,
    placeholder,
    multiline,
  }: {
    label: string;
    field: string;
    placeholder: string;
    multiline?: boolean;
  }) =>
    multiline ? (
      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          {label}
        </label>
        <textarea
          value={(form as Record<string, string | boolean>)[field] as string}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
    ) : (
      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          {label}
        </label>
        <input
          value={(form as Record<string, string | boolean>)[field] as string}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Weekly Check-in</h1>
        <p className="mt-1 text-text-secondary">
          Week: {getWeekId()} | Check-in day: {profile?.checkInDay || "Monday"}
        </p>
      </div>

      {/* Body Metrics */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Body Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Current Weight"
            field="weightCurrent"
            placeholder="e.g. 13st 4lbs or 84.5kg"
          />
          <Field
            label="Previous Weight"
            field="weightPrevious"
            placeholder="Last week's weight"
          />
        </div>
      </section>

      {/* Recovery */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Recovery & Wellness</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sleep Quality" field="sleep" placeholder="e.g. Good, 7-8 hours" />
          <Field label="Appetite" field="appetite" placeholder="e.g. Normal, increased" />
          <Field label="Energy Levels" field="energy" placeholder="e.g. High, moderate, low" />
          <Field label="Stress Levels" field="stress" placeholder="e.g. Low, moderate, high" />
          <Field label="Recovery" field="recovery" placeholder="e.g. Feeling recovered" />
        </div>
      </section>

      {/* Training */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Training</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Gym Performance"
            field="gymPerformance"
            placeholder="e.g. Strength up, felt strong"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">
              All Sessions Completed?
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => update("sessionsCompleted", val)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    form.sessionsCompleted === val
                      ? "bg-primary text-white"
                      : "bg-surface-light text-text-secondary"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
          <Field label="Cardio" field="cardio" placeholder="e.g. 3x 30min walks" />
          <Field label="Steps" field="steps" placeholder="e.g. Avg 10,000/day" />
        </div>
      </section>

      {/* Nutrition */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Nutrition</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Adherence"
            field="adherence"
            placeholder="e.g. 90%, followed plan well"
          />
          <Field
            label="Cheat Meals"
            field="cheatMeal"
            placeholder="e.g. None, or Saturday pizza"
          />
        </div>
      </section>

      {/* Goals */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Goals & Reflection</h3>
        <div className="space-y-4">
          <Field label="Current Goal" field="goal" placeholder="What are you working towards?" />
          <Field label="Wins This Week" field="wins" placeholder="What went well?" multiline />
          <Field
            label="Goals for Next Week"
            field="goalsNextWeek"
            placeholder="What do you want to focus on?"
            multiline
          />
        </div>
      </section>

      {/* Coach */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Questions for Coach</h3>
        <div className="space-y-4">
          <Field
            label="Questions"
            field="questions"
            placeholder="Anything you'd like to ask?"
            multiline
          />
          <Field
            label="Other Notes"
            field="otherNotes"
            placeholder="Anything else to share?"
            multiline
          />
        </div>
      </section>

      {/* Progress Photos (Optional) */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-1 flex items-center gap-2">
          <Camera size={18} className="text-primary" />
          <h3 className="font-semibold text-text">Progress Photos</h3>
        </div>
        <p className="mb-4 text-sm text-text-muted">
          Optional — upload front, side, and back photos to track your
          transformation.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ANGLES.map((angle) => {
            const preview = photoPreviews[angle];
            return (
              <div key={angle} className="text-center">
                <p className="mb-2 text-sm font-medium capitalize text-text-secondary">
                  {angle}
                </p>
                {preview ? (
                  <div className="relative overflow-hidden rounded-lg border border-border aspect-[3/4]">
                    <img
                      src={preview}
                      alt={`${angle} preview`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(angle)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-light aspect-[3/4] hover:border-primary/30 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handlePhotoSelect(angle, file);
                      }}
                    />
                    <Upload size={24} className="mb-2 text-text-muted" />
                    <span className="text-xs text-text-muted">Upload</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={handleSubmit}
        disabled={submitting || !form.weightCurrent}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all"
      >
        <Send size={18} />
        {uploadingPhotos
          ? "Uploading photos..."
          : submitting
            ? "Submitting..."
            : "Submit Check-in"}
      </button>
    </div>
  );
}
