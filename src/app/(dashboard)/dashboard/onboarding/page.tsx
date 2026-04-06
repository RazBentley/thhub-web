"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { OnboardingInfo } from "@/types";
import Image from "next/image";
import {
  Target,
  Heart,
  Dumbbell,
  Calendar,
  Shield,
  UtensilsCrossed,
  ArrowRight,
  SkipForward,
} from "lucide-react";
import clsx from "clsx";

const GOALS = [
  "Lose weight",
  "Build muscle",
  "Get fitter & healthier",
  "Improve nutrition",
  "Body recomposition",
  "Other",
];

const MOTIVATIONS = [
  "Improve my health",
  "Feel more confident",
  "Get in shape for an event",
  "Holiday coming up",
  "Mental wellbeing",
  "Sports performance",
  "Just want to look & feel better",
  "Other",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to training or coming back after a long break" },
  { value: "intermediate", label: "Intermediate", description: "Been training for a while, know the basics" },
  { value: "advanced", label: "Advanced", description: "Experienced lifter looking to level up" },
];

const TRAINING_DAYS = ["2 days", "3 days", "4 days", "5 days", "6+ days"];

export default function OnboardingPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [mainGoal, setMainGoal] = useState("");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [trainingDays, setTrainingDays] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const onboarding: OnboardingInfo = {
        mainGoal: mainGoal || undefined,
        motivation: motivation || undefined,
        experience: experience || undefined,
        trainingDays: trainingDays || undefined,
        healthConditions: healthConditions || undefined,
        dietaryRequirements: dietaryRequirements || undefined,
        additionalNotes: additionalNotes || undefined,
        completedAt: Date.now(),
      };
      await updateDoc(doc(db, "users", profile.uid), { onboarding });
      router.push("/dashboard");
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!profile) return;
    // Mark as skipped so we don't show again
    await updateDoc(doc(db, "users", profile.uid), {
      onboarding: { completedAt: Date.now() },
    });
    router.push("/dashboard");
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-6">
      <Image
        src="/logo.png"
        alt="TH Hub"
        width={80}
        height={80}
        className="mx-auto h-20 w-20 object-contain"
      />
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome to TH Hub, {profile?.name?.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-text-secondary">
          Let&apos;s get to know you a bit better so Tom can create the
          perfect plan for you. This only takes a minute.
        </p>
      </div>
      <p className="text-sm text-text-muted">
        All questions are optional — skip anything you&apos;re not sure about.
      </p>
    </div>,

    // Step 1: Main goal
    <div key="goal" className="space-y-4">
      <div className="flex items-center gap-2">
        <Target size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-text">
          What&apos;s your main goal?
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => setMainGoal(g)}
            className={clsx(
              "rounded-lg border p-3 text-sm font-medium text-left transition-all",
              mainGoal === g
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-text-secondary hover:border-primary/30"
            )}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Motivation
    <div key="motivation" className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-text">
          What&apos;s driving you to make a change?
        </h2>
      </div>
      <p className="text-sm text-text-muted">
        Understanding your &quot;why&quot; helps Tom keep you motivated and
        focused on what matters most to you.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MOTIVATIONS.map((m) => (
          <button
            key={m}
            onClick={() => setMotivation(m)}
            className={clsx(
              "rounded-lg border p-3 text-sm font-medium text-left transition-all",
              motivation === m
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-text-secondary hover:border-primary/30"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Experience
    <div key="experience" className="space-y-4">
      <div className="flex items-center gap-2">
        <Dumbbell size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-text">
          What&apos;s your training experience?
        </h2>
      </div>
      <div className="space-y-2">
        {EXPERIENCE_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => setExperience(level.value)}
            className={clsx(
              "w-full rounded-lg border p-4 text-left transition-all",
              experience === level.value
                ? "border-primary bg-primary/10"
                : "border-border bg-surface hover:border-primary/30"
            )}
          >
            <p
              className={clsx(
                "font-semibold",
                experience === level.value
                  ? "text-primary"
                  : "text-text"
              )}
            >
              {level.label}
            </p>
            <p className="text-sm text-text-muted">{level.description}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Training days
    <div key="days" className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-text">
          How many days a week can you train?
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRAINING_DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setTrainingDays(d)}
            className={clsx(
              "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              trainingDays === d
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border hover:border-primary/30"
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </div>,

    // Step 5: Health & diet
    <div key="health" className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-text">
            Any injuries or health conditions?
          </h2>
        </div>
        <p className="mb-2 text-sm text-text-muted">
          This helps Tom programme safely around any limitations.
        </p>
        <textarea
          value={healthConditions}
          onChange={(e) => setHealthConditions(e.target.value)}
          placeholder="e.g. Bad knee, asthma, lower back issues — or 'none'"
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-text">
            Any dietary requirements?
          </h2>
        </div>
        <textarea
          value={dietaryRequirements}
          onChange={(e) => setDietaryRequirements(e.target.value)}
          placeholder="e.g. Vegetarian, lactose intolerant, no shellfish — or 'none'"
          className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
    </div>,

    // Step 6: Anything else
    <div key="notes" className="space-y-4">
      <h2 className="text-lg font-bold text-text">
        Anything else you&apos;d like Tom to know?
      </h2>
      <p className="text-sm text-text-muted">
        Your schedule, preferences, past experience with coaching — anything
        that helps Tom understand you better.
      </p>
      <textarea
        value={additionalNotes}
        onChange={(e) => setAdditionalNotes(e.target.value)}
        placeholder="Tell Tom anything that might help..."
        className="w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        rows={5}
      />
    </div>,
  ];

  const isLastStep = step === steps.length - 1;
  const totalSteps = steps.length;

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      {/* Progress bar */}
      {step > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs text-text-muted">
            {step}/{totalSteps - 1}
          </span>
        </div>
      )}

      {/* Current step */}
      {steps[step]}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step === 0 ? (
          <>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-secondary"
            >
              <SkipForward size={16} />
              Skip for now
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              Let&apos;s Go
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm font-medium text-text-secondary hover:text-text"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isLastStep) handleSave();
                  else setStep(step + 1);
                }}
                className="text-sm font-medium text-text-muted hover:text-text-secondary"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  if (isLastStep) handleSave();
                  else setStep(step + 1);
                }}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {isLastStep
                  ? saving
                    ? "Saving..."
                    : "Finish"
                  : "Next"}
                {!isLastStep && <ArrowRight size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
