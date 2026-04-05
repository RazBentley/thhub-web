"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile, Subscription } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CreditCard, Save } from "lucide-react";
import clsx from "clsx";

interface ClientSub {
  client: UserProfile;
  subscription: Subscription | null;
}

export default function SubscriptionsPage() {
  const { isOwner } = useAuth();
  const [clientSubs, setClientSubs] = useState<ClientSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Subscription["status"]>("inactive");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const clientsSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      const clients = clientsSnap.docs
        .map((d) => d.data() as UserProfile)
        .sort((a, b) => a.name.localeCompare(b.name));

      const subs: ClientSub[] = await Promise.all(
        clients.map(async (client) => {
          const subDoc = await getDoc(
            doc(db, "users", client.uid, "subscription", "current")
          );
          return {
            client,
            subscription: subDoc.exists()
              ? (subDoc.data() as Subscription)
              : null,
          };
        })
      );
      setClientSubs(subs);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (uid: string, currentStatus: Subscription["status"]) => {
    setEditingUid(uid);
    setEditStatus(currentStatus);
  };

  const saveSubscription = async (uid: string) => {
    setSaving(true);
    try {
      const sub: Subscription = {
        status: editStatus,
        plan: "monthly",
        amount: 5000,
        currentPeriodEnd:
          editStatus === "active"
            ? Date.now() + 30 * 86400000
            : undefined,
      };
      await setDoc(doc(db, "users", uid, "subscription", "current"), sub);
      setEditingUid(null);
      await loadData();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner)
    return <div className="py-24 text-center text-text-muted">Coach access only.</div>;
  if (loading) return <LoadingSpinner fullPage />;

  const statusColors: Record<string, string> = {
    active: "bg-success/20 text-success",
    inactive: "bg-text-muted/20 text-text-muted",
    past_due: "bg-warning/20 text-warning",
    cancelled: "bg-error/20 text-error",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Subscriptions</h1>

      <div className="space-y-3">
        {clientSubs.map(({ client, subscription }) => (
          <div
            key={client.uid}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {client.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-text">{client.name}</p>
                  <p className="text-sm text-text-secondary">{client.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={clsx(
                    "inline-block rounded-full px-3 py-0.5 text-xs font-medium",
                    statusColors[subscription?.status || "inactive"]
                  )}
                >
                  {subscription?.status || "inactive"}
                </span>
                {subscription?.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-text-muted">
                    Renews:{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                )}
              </div>
            </div>

            {editingUid === client.uid ? (
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as Subscription["status"])
                  }
                  className="rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => saveSubscription(client.uid)}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={() => setEditingUid(null)}
                  className="text-sm text-text-muted hover:text-text"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  startEdit(
                    client.uid,
                    subscription?.status || "inactive"
                  )
                }
                className="mt-3 text-sm text-primary hover:text-primary-dark"
              >
                Edit status
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
