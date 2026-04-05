"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email.";
      if (message.includes("user-not-found")) {
        setError("No account found with this email.");
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (message.includes("too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle size={64} className="mx-auto text-success" />
        <h1 className="text-2xl font-bold text-text">Check Your Email</h1>
        <p className="text-text-secondary">
          We&apos;ve sent a password reset link to{" "}
          <strong className="text-text">{email}</strong>. Check your inbox and
          follow the instructions to reset your password.
        </p>
        <p className="text-sm text-text-muted">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-primary hover:text-primary-dark"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="TH Hub"
          width={64}
          height={64}
          className="mx-auto mb-4 h-16 w-16 object-contain"
        />
        <h1 className="text-2xl font-bold text-text">Reset Password</h1>
        <p className="mt-1 text-text-secondary">
          Enter your email and we&apos;ll send you a reset link
        </p>
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
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          autoComplete="email"
        />
        <Button type="submit" loading={loading} className="w-full">
          Send Reset Link
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
