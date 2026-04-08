"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db, storage } from "@/lib/firebase";
import { OnboardingInfo } from "@/types";
import { Calendar, LogOut, Sun, Moon, Camera, User, Save, ChevronDown, ChevronUp, Trash2, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import clsx from "clsx";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ProfilePage() {
  const { profile, isOwner, signOut, deleteAccount } = useAuth();
  const [checkInDay, setCheckInDay] = useState(
    profile?.checkInDay || "Monday"
  );
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const updateCheckInDay = async (day: string) => {
    if (!profile) return;
    setCheckInDay(day);
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), { checkInDay: day });
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!profile) return;
    setUploadingPhoto(true);
    try {
      const path = `profile-photos/${profile.uid}/avatar.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", profile.uid), { photoURL: url });
      setPhotoURL(url);
    } catch {
      /* silent */
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword);
      window.location.href = "/";
    } catch (err: any) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setDeleteError("Incorrect password. Please try again.");
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Profile</h1>

      {/* User Info with Photo Upload */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          {/* Avatar with upload */}
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt={profile?.name || "Profile"}
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary">
                {profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
              />
              {uploadingPhoto ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Camera size={14} />
              )}
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">{profile?.name}</h2>
            <p className="text-sm text-text-secondary">{profile?.email}</p>
            <span
              className={clsx(
                "mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium",
                isOwner
                  ? "bg-accent/20 text-accent"
                  : "bg-primary/20 text-primary"
              )}
            >
              {isOwner ? "Coach" : "Client"}
            </span>
          </div>
        </div>
      </div>

      {/* Check-in Day */}
      {!isOwner && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h3 className="font-semibold text-text">Check-in Day</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => updateCheckInDay(day)}
                disabled={saving}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  checkInDay === day
                    ? "bg-primary text-white"
                    : "bg-surface-light text-text-secondary hover:bg-border"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* About Me */}
      {!isOwner && <AboutMeSection />}

      {/* Theme */}
      <ThemeToggle />

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-3.5 font-semibold text-error hover:bg-error/10 transition-all"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      {/* Delete Account */}
      <button
        onClick={() => { setDeletePassword(""); setDeleteError(""); setShowDeleteModal(true); }}
        className="flex w-full items-center justify-center gap-2 py-3 text-sm text-error/70 hover:text-error transition-colors"
      >
        <Trash2 size={14} />
        Delete Account
      </button>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 space-y-4">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/15">
                <AlertTriangle size={28} className="text-error" />
              </div>
            </div>
            <h3 className="text-center text-lg font-bold text-text">Delete Account</h3>
            <p className="text-center text-sm text-text-muted leading-relaxed">
              This will permanently delete your account and all associated data including meal plans, progress photos, check-ins, and workout history. This action cannot be undone.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
              disabled={deleting}
              className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            {deleteError && <p className="text-sm text-error">{deleteError}</p>}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full rounded-lg bg-error py-2.5 font-semibold text-white hover:bg-error/90 disabled:opacity-50 transition-all"
            >
              {deleting ? "Deleting..." : "Permanently Delete Account"}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="w-full py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AboutMeSection() {
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const existing = profile?.onboarding || {};
  const [mainGoal, setMainGoal] = useState(existing.mainGoal || "");
  const [motivation, setMotivation] = useState(existing.motivation || "");
  const [experience, setExperience] = useState(existing.experience || "");
  const [trainingDays, setTrainingDays] = useState(existing.trainingDays || "");
  const [healthConditions, setHealthConditions] = useState(existing.healthConditions || "");
  const [dietaryRequirements, setDietaryRequirements] = useState(existing.dietaryRequirements || "");
  const [additionalNotes, setAdditionalNotes] = useState(existing.additionalNotes || "");

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const onboarding: Record<string, any> = { completedAt: Date.now() };
      if (mainGoal) onboarding.mainGoal = mainGoal;
      if (motivation) onboarding.motivation = motivation;
      if (experience) onboarding.experience = experience;
      if (trainingDays) onboarding.trainingDays = trainingDays;
      if (healthConditions) onboarding.healthConditions = healthConditions;
      if (dietaryRequirements) onboarding.dietaryRequirements = dietaryRequirements;
      if (additionalNotes) onboarding.additionalNotes = additionalNotes;
      await updateDoc(doc(db, "users", profile.uid), { onboarding });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const hasInfo = existing.mainGoal || existing.motivation || existing.experience;

  const Field = ({ label, value, onChange, placeholder, multiline }: {
    label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
  }) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-text-secondary">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-surface-light/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <User size={18} className="text-primary" />
          <h3 className="font-semibold text-text">About Me</h3>
          {!hasInfo && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
              Not filled in yet
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-text-muted" />
        ) : (
          <ChevronDown size={18} className="text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-5 space-y-4">
          <p className="text-sm text-text-muted">
            This info helps your coach create the best plan for you. Update it
            anytime.
          </p>
          <Field label="Main Goal" value={mainGoal} onChange={setMainGoal} placeholder="e.g. Lose weight, build muscle" />
          <Field label="What's Driving You?" value={motivation} onChange={setMotivation} placeholder="e.g. Health, confidence, holiday coming up" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Training Experience" value={experience} onChange={setExperience} placeholder="e.g. Beginner, intermediate" />
            <Field label="Training Days per Week" value={trainingDays} onChange={setTrainingDays} placeholder="e.g. 4 days" />
          </div>
          <Field label="Injuries or Health Conditions" value={healthConditions} onChange={setHealthConditions} placeholder="e.g. Bad knee, asthma — or 'none'" multiline />
          <Field label="Dietary Requirements" value={dietaryRequirements} onChange={setDietaryRequirements} placeholder="e.g. Vegetarian, lactose intolerant — or 'none'" multiline />
          <Field label="Anything Else for Your Coach" value={additionalNotes} onChange={setAdditionalNotes} placeholder="Schedule, preferences, past experience..." multiline />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            {saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-semibold text-text">Appearance</h3>
      <div className="flex gap-2">
        <button
          onClick={theme === "dark" ? undefined : toggleTheme}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            theme === "dark"
              ? "bg-primary text-white"
              : "bg-surface-light text-text-secondary hover:bg-border"
          )}
        >
          <Moon size={14} />
          Dark
        </button>
        <button
          onClick={theme === "light" ? undefined : toggleTheme}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            theme === "light"
              ? "bg-primary text-white"
              : "bg-surface-light text-text-secondary hover:bg-border"
          )}
        >
          <Sun size={14} />
          Light
        </button>
      </div>
    </div>
  );
}
