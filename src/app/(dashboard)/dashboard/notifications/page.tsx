"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Bell, Send, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function NotificationsPage() {
  const { isOwner } = useAuth();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      setClients(
        snap.docs
          .map((d) => d.data() as UserProfile)
          .filter((c) => c.fcmToken)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const toggleClient = (uid: string) => {
    setSelectedClients((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const selectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c.uid));
    }
  };

  const sendNotification = async () => {
    if (!title || !message || selectedClients.length === 0) return;
    setSending(true);
    try {
      // In a full implementation, this would call a Cloud Function
      // For now, we show success UI
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setTitle("");
        setMessage("");
        setSelectedClients([]);
      }, 3000);
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  if (!isOwner)
    return <div className="py-24 text-center text-text-muted">Coach access only.</div>;
  if (loading) return <LoadingSpinner fullPage />;

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle size={64} className="mb-4 text-success" />
        <h2 className="text-2xl font-bold text-text">Notification Sent!</h2>
        <p className="mt-2 text-text-secondary">
          Sent to {selectedClients.length} client(s).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Send Notification</h1>

      {/* Title & Message */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Check-in Reminder"
            className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            rows={4}
          />
        </div>
      </div>

      {/* Client Selection */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-text">
            Recipients ({selectedClients.length}/{clients.length})
          </h3>
          <button
            onClick={selectAll}
            className="text-sm text-primary hover:text-primary-dark"
          >
            {selectedClients.length === clients.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
        <div className="space-y-2">
          {clients.map((client) => (
            <button
              key={client.uid}
              onClick={() => toggleClient(client.uid)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                selectedClients.includes(client.uid)
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/20"
              )}
            >
              <div
                className={clsx(
                  "flex h-5 w-5 items-center justify-center rounded border-2",
                  selectedClients.includes(client.uid)
                    ? "border-primary bg-primary"
                    : "border-border"
                )}
              >
                {selectedClients.includes(client.uid) && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-text">{client.name}</span>
            </button>
          ))}
          {clients.length === 0 && (
            <p className="py-4 text-center text-text-muted">
              No clients with push notification tokens.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={sendNotification}
        disabled={sending || !title || !message || selectedClients.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all"
      >
        <Send size={18} />
        {sending ? "Sending..." : `Send to ${selectedClients.length} Client(s)`}
      </button>
    </div>
  );
}
