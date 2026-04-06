"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import { RequireActive } from "@/components/ui/RequireActive";

interface ProgressPhoto {
  date: string;
  frontUrl?: string;
  sideUrl?: string;
  backUrl?: string;
}

const ANGLES = ["front", "side", "back"] as const;

export default function ProgressPhotosPage() {
  const { profile } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadPhotos();
  }, [profile]);

  async function loadPhotos() {
    if (!profile) return;
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", profile.uid, "progressPhotos"),
          orderBy("date", "desc")
        )
      );
      setPhotos(snap.docs.map((d) => d.data() as ProgressPhoto));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (angle: string, file: File) => {
    if (!profile) return;
    setUploading(angle);
    try {
      const path = `progress-photos/${profile.uid}/${today}/${angle}.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const existing = photos.find((p) => p.date === today) || { date: today };
      const updated = { ...existing, [`${angle}Url`]: url };
      await setDoc(
        doc(db, "users", profile.uid, "progressPhotos", today),
        updated
      );
      await loadPhotos();
    } catch {
      /* silent */
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const todayPhotos = photos.find((p) => p.date === today);

  return (
    <RequireActive>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Progress Photos</h1>

      {/* Upload Today */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold text-text">Today&apos;s Photos</h3>
        <div className="grid grid-cols-3 gap-3">
          {ANGLES.map((angle) => {
            const url =
              todayPhotos?.[`${angle}Url` as keyof ProgressPhoto] as
                | string
                | undefined;
            return (
              <div key={angle} className="text-center">
                <p className="mb-2 text-sm font-medium capitalize text-text-secondary">
                  {angle}
                </p>
                {url ? (
                  <div className="relative overflow-hidden rounded-lg border border-border aspect-[3/4]">
                    <img
                      src={url}
                      alt={`${angle} photo`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-light aspect-[3/4] hover:border-primary/30 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(angle, file);
                      }}
                    />
                    {uploading === angle ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Upload size={24} className="mb-2 text-text-muted" />
                        <span className="text-xs text-text-muted">Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {photos.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-semibold text-text">History</h3>
          <div className="space-y-4">
            {photos
              .filter((p) => p.date !== today || (p.frontUrl || p.sideUrl || p.backUrl))
              .map((photo) => (
                <div key={photo.date}>
                  <p className="mb-2 text-sm font-medium text-text-secondary">
                    {new Date(photo.date + "T00:00:00").toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ANGLES.map((angle) => {
                      const url = photo[
                        `${angle}Url` as keyof ProgressPhoto
                      ] as string | undefined;
                      return url ? (
                        <div
                          key={angle}
                          className="overflow-hidden rounded-lg border border-border aspect-[3/4]"
                        >
                          <img
                            src={url}
                            alt={`${angle}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          key={angle}
                          className="flex items-center justify-center rounded-lg border border-border bg-surface-light aspect-[3/4]"
                        >
                          <ImageIcon
                            size={20}
                            className="text-text-muted"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
    </RequireActive>
  );
}
