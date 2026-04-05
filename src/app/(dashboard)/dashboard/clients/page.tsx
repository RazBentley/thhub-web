"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, Search } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const { isOwner } = useAuth();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
          .sort((a, b) => a.name.localeCompare(b.name))
      );
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

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Clients</h1>
        <span className="text-sm text-text-secondary">
          {clients.length} total
        </span>
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

      {/* Client List */}
      <div className="space-y-2">
        {filtered.map((client) => (
          <Link
            key={client.uid}
            href={`/dashboard/clients/${client.uid}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {client.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text">{client.name}</p>
              <p className="text-sm text-text-secondary">{client.email}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-text-muted">
                Check-in: {client.checkInDay || "Monday"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
