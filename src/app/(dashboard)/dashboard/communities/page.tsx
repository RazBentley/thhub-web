"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Community, CommunityMessage } from "@/types";
import { RequireActive } from "@/components/ui/RequireActive";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Plus,
  Lock,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";

const COMMUNITY_ICONS = ["💪", "🏋️", "🔥", "👯‍♀️", "🏃", "🥗", "🧘", "⭐", "🎯", "💬", "🏆", "❤️"];

export default function CommunitiesPage() {
  const { profile, isOwner } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createIcon, setCreateIcon] = useState("💪");
  const [createRestriction, setCreateRestriction] = useState<"none" | "female-only" | "male-only">("none");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "communities"), orderBy("lastMessageTime", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Community));
        setCommunities(list);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeCommunity) return;
    const unsub = onSnapshot(
      query(
        collection(db, "communities", activeCommunity.id, "messages"),
        orderBy("timestamp", "asc")
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityMessage))
        );
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    );
    return unsub;
  }, [activeCommunity]);

  const canJoin = (community: Community) => {
    if (!community.restriction || community.restriction === "none") return true;
    if (community.restriction === "female-only" && profile?.gender === "female") return true;
    if (community.restriction === "male-only" && profile?.gender === "male") return true;
    if (isOwner) return true; // Coach can see all
    return false;
  };

  const sendMessage = async () => {
    if (!profile || !activeCommunity || !newMessage.trim()) return;
    setSending(true);
    try {
      await addDoc(
        collection(db, "communities", activeCommunity.id, "messages"),
        {
          senderId: profile.uid,
          senderName: profile.name,
          senderPhotoURL: profile.photoURL || "",
          text: newMessage.trim(),
          timestamp: Date.now(),
        }
      );
      await updateDoc(doc(db, "communities", activeCommunity.id), {
        lastMessage: newMessage.trim(),
        lastMessageTime: Date.now(),
      });
      setNewMessage("");
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const createCommunity = async () => {
    if (!profile || !createName.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, "communities"), {
        name: createName.trim(),
        description: createDesc.trim(),
        icon: createIcon,
        createdBy: profile.uid,
        createdAt: Date.now(),
        memberCount: 0,
        restriction: createRestriction,
        lastMessage: "",
        lastMessageTime: Date.now(),
      });
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreateIcon("💪");
      setCreateRestriction("none");
    } catch {
      /* silent */
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000)
      return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000)
      return d.toLocaleDateString("en-GB", { weekday: "short" });
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Community chat view
  if (activeCommunity) {
    return (
      <RequireActive>
        <div className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <button
              onClick={() => setActiveCommunity(null)}
              className="text-text-secondary hover:text-text"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-2xl">{activeCommunity.icon}</span>
            <div>
              <h2 className="font-semibold text-text">{activeCommunity.name}</h2>
              <p className="text-xs text-text-muted">{activeCommunity.description}</p>
            </div>
            {activeCommunity.restriction && activeCommunity.restriction !== "none" && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <Lock size={10} />
                {activeCommunity.restriction === "female-only" ? "Ladies Only" : "Men Only"}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4">
            {messages.length === 0 ? (
              <p className="py-12 text-center text-text-muted">
                No messages yet. Be the first to say something!
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === profile?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={clsx("flex gap-2", isMe ? "justify-end" : "justify-start")}
                    >
                      {!isMe && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {msg.senderName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div
                        className={clsx(
                          "max-w-[75%] rounded-2xl px-4 py-2.5",
                          isMe
                            ? "rounded-br-md bg-primary text-white"
                            : "rounded-bl-md bg-surface text-text"
                        )}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-xs font-semibold text-primary">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p
                          className={clsx(
                            "mt-1 text-xs",
                            isMe ? "text-white/60" : "text-text-muted"
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border pt-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-border bg-input-bg px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </RequireActive>
    );
  }

  // Community list
  return (
    <RequireActive>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Communities</h1>
            <p className="mt-1 text-text-secondary">
              Join conversations with other members.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={16} />
            New Group
          </button>
        </div>

        {/* Community list */}
        {communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={64} className="mb-4 text-text-muted" />
            <h2 className="text-xl font-bold text-text">No Communities Yet</h2>
            <p className="mt-1 text-text-secondary">
              Create the first community group to get the conversation started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {communities.map((community) => {
              const accessible = canJoin(community);
              return (
                <button
                  key={community.id}
                  onClick={() => accessible && setActiveCommunity(community)}
                  disabled={!accessible}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    accessible
                      ? "border-border bg-surface hover:border-primary/30"
                      : "border-border bg-surface opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-light text-2xl">
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text">{community.name}</p>
                      {community.restriction && community.restriction !== "none" && (
                        <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <Lock size={8} />
                          {community.restriction === "female-only" ? "Ladies" : "Men"}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      {community.lastMessage || community.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {community.lastMessageTime && community.lastMessage && (
                      <p className="text-xs text-text-muted">
                        {formatTime(community.lastMessageTime)}
                      </p>
                    )}
                    {!accessible && (
                      <p className="text-xs text-error">Restricted</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Create Community Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text">Create Community</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-text-muted hover:text-text"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {/* Icon picker */}
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">
                    Choose an Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNITY_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setCreateIcon(icon)}
                        className={clsx(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all",
                          createIcon === icon
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-surface hover:bg-surface-light"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-text-secondary">
                    Group Name *
                  </label>
                  <input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ladies Club, Leg Day Crew"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-text-secondary">
                    Description
                  </label>
                  <input
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="What's this group about?"
                    className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-text-secondary">
                    Access
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "none" as const, label: "Everyone" },
                      { value: "female-only" as const, label: "Ladies Only" },
                      { value: "male-only" as const, label: "Men Only" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCreateRestriction(opt.value)}
                        className={clsx(
                          "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                          createRestriction === opt.value
                            ? "bg-primary text-white"
                            : "bg-surface text-text-secondary hover:bg-surface-light"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createCommunity}
                  disabled={creating || !createName.trim()}
                  className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireActive>
  );
}
