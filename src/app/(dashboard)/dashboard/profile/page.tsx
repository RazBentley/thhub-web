"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db, storage } from "@/lib/firebase";
import { Calendar, LogOut, Sun, Moon, Camera } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
  const { profile, isOwner, signOut } = useAuth();
  const [checkInDay, setCheckInDay] = useState(
    profile?.checkInDay || "Monday"
  );
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");

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
