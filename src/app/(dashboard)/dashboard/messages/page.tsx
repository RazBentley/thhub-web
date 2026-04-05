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
  setDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Chat, Message } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
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
    });
    return unsub;
  }, [profile]);

  useEffect(() => {
    if (!activeChat) return;
    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return unsub;
  }, [activeChat]);

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
      await updateDoc(doc(db, "chats", activeChat.id), {
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

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString("en-GB", { weekday: "short" });
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
            {activeChat.clientName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <h2 className="font-semibold text-text">{activeChat.clientName}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-text-muted">
              No messages yet. Say hello!
            </p>
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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Messages</h1>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageCircle size={64} className="mb-4 text-text-muted" />
          <h2 className="text-xl font-bold text-text">No Messages Yet</h2>
          <p className="mt-1 text-text-secondary">
            {isOwner
              ? "Start a conversation with a client"
              : "Your coach will message you here"}
          </p>
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
                  {chat.lastMessage || "No messages"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {chat.lastMessageTime && (
                  <p className="text-xs text-text-muted">
                    {formatTime(chat.lastMessageTime)}
                  </p>
                )}
                {chat.unreadCount > 0 && (
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
