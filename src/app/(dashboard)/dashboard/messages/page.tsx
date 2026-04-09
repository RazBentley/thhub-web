"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  increment,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Chat, Message, UserProfile } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MessageCircle, Send, ArrowLeft, Plus, Search, X } from "lucide-react";
import clsx from "clsx";

export default function MessagesPage() {
  const { profile, isOwner } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New chat modal state
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", profile.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const chatList = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Chat))
        .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      setChats(chatList);
      setLoading(false);

      // For clients with no chats, auto-start chat with coach
      if (!isOwner && chatList.length === 0 && !creatingChat) {
        autoCreateClientChat();
      }
    });
    return unsub;
  }, [profile, isOwner]);

  useEffect(() => {
    if (!activeChat) return;

    // Clear unread count for this user when opening a chat
    if (profile?.uid) {
      updateDoc(doc(db, "chats", activeChat.id), { [`unreadBy.${profile.uid}`]: 0 }).catch(() => {});
    }

    // Mark messages as read
    const markRead = async () => {
      try {
        const msgsSnap = await getDocs(
          collection(db, "chats", activeChat.id, "messages")
        );
        msgsSnap.forEach((msgDoc) => {
          const msg = msgDoc.data();
          if (!msg.read && msg.senderId !== profile?.uid) {
            updateDoc(doc(db, "chats", activeChat.id, "messages", msgDoc.id), {
              read: true,
            }).catch(() => {});
          }
        });
      } catch {
        /* silent */
      }
    };
    markRead();

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message))
      );
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return unsub;
  }, [activeChat]);

  // Auto-create a chat between client and coach
  const autoCreateClientChat = async () => {
    if (!profile || isOwner || creatingChat) return;
    setCreatingChat(true);
    try {
      // Find the coach (owner)
      const ownersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "owner"))
      );
      if (ownersSnap.empty) return;
      const coach = ownersSnap.docs[0].data() as UserProfile;

      const chatDoc = await addDoc(collection(db, "chats"), {
        participants: [coach.uid, profile.uid],
        clientName: profile.name,
        lastMessage: "",
        lastMessageTime: Date.now(),
        unreadCount: 0,
      });
      // The onSnapshot listener will pick up the new chat
    } catch {
      /* silent */
    } finally {
      setCreatingChat(false);
    }
  };

  // Load users for new chat (coach only)
  const openNewChat = async () => {
    setShowNewChat(true);
    setLoadingUsers(true);
    setUserSearch("");
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "client"))
      );
      const allClients = snap.docs
        .map((d) => d.data() as UserProfile)
        .sort((a, b) => a.name.localeCompare(b.name));
      setAvailableUsers(allClients);
    } catch {
      /* silent */
    } finally {
      setLoadingUsers(false);
    }
  };

  const startChatWith = async (client: UserProfile) => {
    if (!profile) return;
    setCreatingChat(true);
    try {
      // Check if a chat already exists with this client
      const existingChat = chats.find((c) =>
        c.participants.includes(client.uid)
      );
      if (existingChat) {
        setShowNewChat(false);
        setActiveChat(existingChat);
        return;
      }

      // Create new chat
      const chatDoc = await addDoc(collection(db, "chats"), {
        participants: [profile.uid, client.uid],
        clientName: client.name,
        lastMessage: "",
        lastMessageTime: Date.now(),
        unreadCount: 0,
      });
      setShowNewChat(false);
      setActiveChat({
        id: chatDoc.id,
        participants: [profile.uid, client.uid],
        clientName: client.name,
        lastMessage: "",
        lastMessageTime: Date.now(),
        unreadCount: 0,
      });
    } catch {
      /* silent */
    } finally {
      setCreatingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!profile || !activeChat || !newMessage.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "chats", activeChat.id, "messages"), {
        senderId: profile.uid,
        text: newMessage.trim(),
        timestamp: Date.now(),
        read: false,
      });
      const otherUid = activeChat.participants.find((p: string) => p !== profile.uid);
      const chatUpdate: Record<string, any> = {
        lastMessage: newMessage.trim(),
        lastMessageTime: Date.now(),
      };
      if (otherUid) chatUpdate[`unreadBy.${otherUid}`] = increment(1);
      await updateDoc(doc(db, "chats", activeChat.id), chatUpdate);
      setNewMessage("");
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000)
      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff < 604800000)
      return d.toLocaleDateString("en-GB", { weekday: "short" });
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Chat view
  if (activeChat) {
    return (
      <div className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-4rem)]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <button
            onClick={() => setActiveChat(null)}
            className="text-text-secondary hover:text-text"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {isOwner
              ? activeChat.clientName?.charAt(0)?.toUpperCase() || "?"
              : "T"}
          </div>
          <h2 className="font-semibold text-text">
            {isOwner ? activeChat.clientName : "Coach Tom"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageCircle size={48} className="mb-4 text-primary/40" />
              {isOwner ? (
                <p className="text-text-muted">
                  No messages yet. Say hello!
                </p>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-text">
                    Your Journey Starts Here
                  </h3>
                  <p className="max-w-sm text-sm text-text-secondary">
                    Send Tom a message to get started. Together you&apos;ll
                    build a plan tailored to your goals — whether it&apos;s
                    losing weight, building muscle, or just feeling your best.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === profile?.uid;
                return (
                  <div
                    key={msg.id}
                    className={clsx(
                      "flex",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={clsx(
                        "max-w-[75%] rounded-2xl px-4 py-2.5",
                        isMe
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md bg-surface text-text"
                      )}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Shared image"
                          className="mb-2 max-w-full rounded-lg"
                          style={{ maxHeight: 300 }}
                        />
                      )}
                      {msg.audioUrl && (
                        <div className="mb-1">
                          <audio controls src={msg.audioUrl} className="max-w-full" style={{ height: 36 }} />
                        </div>
                      )}
                      {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
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
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage()
            }
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
    );
  }

  // Chat list
  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Messages</h1>
        {isOwner && (
          <button
            onClick={openNewChat}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={16} />
            New Chat
          </button>
        )}
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageCircle size={64} className="mb-4 text-text-muted" />
          <h2 className="text-xl font-bold text-text">No Messages Yet</h2>
          <p className="mt-1 text-text-secondary">
            {isOwner
              ? "Start a conversation with a client using the button above."
              : "Setting up your chat with your coach..."}
          </p>
          {!isOwner && <LoadingSpinner size="sm" />}
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left hover:border-primary/30 transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                {chat.clientName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text">{chat.clientName}</p>
                <p className="truncate text-sm text-text-secondary">
                  {chat.lastMessage || "Tap to start the conversation"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {chat.lastMessageTime && (
                  <p className="text-xs text-text-muted">
                    {formatTime(chat.lastMessageTime)}
                  </p>
                )}
                {((chat as any).unreadBy?.[profile?.uid || ""] || 0) > 0 && (
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {(chat as any).unreadBy[profile!.uid]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Chat Modal (Coach only) */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">New Conversation</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full rounded-lg border border-border bg-input-bg pl-9 pr-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Client list */}
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                {availableUsers.length === 0
                  ? "All clients already have a chat."
                  : "No clients match your search."}
              </p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => startChatWith(user)}
                    disabled={creatingChat}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-surface-light transition-colors disabled:opacity-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
