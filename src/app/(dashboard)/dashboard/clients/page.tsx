"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile, Subscription } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, Search, UserPlus, Crown, Clock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface ClientWithStatus extends UserProfile {
  subscriptionStatus: string;
  daysSinceSignup: number;
}

export default function ClientsPage() {
  const { isOwner } = useAuth();
  const [clients, setClients] = useState<ClientWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "new" | "inactive">("all");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      const clientsWithStatus: ClientWithStatus[] = await Promise.all(
        snap.docs.map(async (d) => {
          const client = d.data() as UserProfile;
          let subscriptionStatus = "none";
          try {
            const subDoc = await getDoc(
              doc(db, "users", client.uid, "subscription", "current")
            );
            if (subDoc.exists()) {
              subscriptionStatus = (subDoc.data() as Subscription).status;
            }
          } catch {
            /* silent */
          }
          const daysSinceSignup = Math.floor(
            (Date.now() - (client.createdAt || Date.now())) / 86400000
          );
          return { ...client, subscriptionStatus, daysSinceSignup };
        })
      );
      clientsWithStatus.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setClients(clientsWithStatus);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="py-24 text-center text-text-muted">
        Coach access only.
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "active") return c.subscriptionStatus === "active";
    if (filter === "new") return c.subscriptionStatus === "none" || c.subscriptionStatus === "inactive";
    if (filter === "inactive") return c.subscriptionStatus === "past_due" || c.subscriptionStatus === "cancelled";
    return true;
  });

  const activeCount = clients.filter((c) => c.subscriptionStatus === "active").length;
  const newCount = clients.filter(
    (c) => c.subscriptionStatus === "none" || c.subscriptionStatus === "inactive"
  ).length;
  const inactiveCount = clients.filter(
    (c) => c.subscriptionStatus === "past_due" || c.subscriptionStatus === "cancelled"
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-medium text-success">
            Active
          </span>
        );
      case "past_due":
        return (
          <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning">
            Past Due
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-error/20 px-2.5 py-0.5 text-xs font-medium text-error">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
            New Signup
          </span>
        );
    }
  };

  const formatSignupDate = (ts: number) => {
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(ts).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Clients</h1>
        <span className="text-sm text-text-secondary">
          {clients.length} total
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <Crown size={18} className="mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold text-text">{activeCount}</p>
          <p className="text-xs text-text-muted">Active</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <UserPlus size={18} className="mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold text-text">{newCount}</p>
          <p className="text-xs text-text-muted">New Signups</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <Clock size={18} className="mx-auto mb-1 text-text-muted" />
          <p className="text-2xl font-bold text-text">{inactiveCount}</p>
          <p className="text-xs text-text-muted">Inactive</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(
          [
            { key: "all", label: `All (${clients.length})` },
            { key: "active", label: `Active (${activeCount})` },
            { key: "new", label: `New Signups (${newCount})` },
            { key: "inactive", label: `Inactive (${inactiveCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={clsx(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-light"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-text-muted">
          No clients match this filter.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <Link
              key={client.uid}
              href={`/dashboard/clients/${client.uid}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all"
            >
              {client.photoURL ? (
                <img
                  src={client.photoURL}
                  alt={client.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {client.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text">{client.name}</p>
                  {getStatusBadge(client.subscriptionStatus)}
                </div>
                <p className="text-sm text-text-secondary">{client.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-text-muted">
                  Joined {formatSignupDate(client.createdAt || Date.now())}
                </p>
                <p className="text-xs text-text-muted">
                  Check-in: {client.checkInDay || "Monday"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
