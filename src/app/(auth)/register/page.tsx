"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserRole } from "@/types";
import clsx from "clsx";

const OWNER_SECRET = "TH2024OWNER";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [coachCode, setCoachCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (role === "owner" && coachCode !== OWNER_SECRET) {
      setError("Invalid coach access code.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account.";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (message.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Image src="/logo.png" alt="TH Hub" width={64} height={64} className="mx-auto mb-4 h-16 w-16 object-contain" />
        <h1 className="text-2xl font-bold text-text">Create Account</h1>
        <p className="mt-1 text-text-secondary">
          Join TH Hub and start your journey
        </p>
      </div>

      {/* Role selector */}
      <div className="flex rounded-lg border border-border bg-surface p-1">
        {(["client", "owner"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={clsx(
              "flex-1 rounded-md py-2.5 text-sm font-medium transition-all",
              role === r
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text"
            )}
          >
            {r === "client" ? "Client" : "Coach"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border-l-4 border-error bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={18} />}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={18} />}
          autoComplete="new-password"
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock size={18} />}
          autoComplete="new-password"
        />

        {role === "owner" && (
          <Input
            label="Coach Access Code"
            type="password"
            placeholder="Enter coach access code"
            value={coachCode}
            onChange={(e) => setCoachCode(e.target.value)}
            icon={<KeyRound size={18} />}
          />
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
