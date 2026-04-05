import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  Dumbbell,
  MessageCircle,
  Target,
  ArrowRight,
  UserPlus,
  FileText,
  TrendingUp,
  Check,
  Smartphone,
  Droplets,
  Camera,
  HeartPulse,
} from "lucide-react";

function InstagramIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: ClipboardList,
    title: "Personalised Meal Plans",
    description:
      "Custom nutrition plans tailored to your goals, with easy meal tracking and macro counting.",
  },
  {
    icon: Dumbbell,
    title: "Workout Programmes",
    description:
      "Structured training plans with exercise tracking, sets, reps, and rest periods.",
  },
  {
    icon: MessageCircle,
    title: "Direct Coach Messaging",
    description:
      "Stay connected with your coach through real-time messaging for guidance and support.",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description:
      "Weekly check-ins, progress photos, and goal tracking to keep you accountable.",
  },
  {
    icon: Droplets,
    title: "Water & Nutrition Tracking",
    description:
      "Track your daily water intake, log meals, and monitor your macros throughout the day.",
  },
  {
    icon: HeartPulse,
    title: "Cardio & Activity Logging",
    description:
      "Log your cardio sessions, track daily steps, and monitor your overall activity levels.",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up",
    description:
      "Create your account on the app or website and begin your journey with Tom.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Get Your Plan",
    description:
      "Receive a fully personalised meal plan and workout programme built around your goals and lifestyle.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Track & Progress",
    description:
      "Log your meals, complete workouts, submit weekly check-ins, and watch your transformation unfold.",
  },
];

const included = [
  "Personalised meal plan with macros",
  "Custom workout programme",
  "Weekly check-ins with your coach",
  "Direct messaging support",
  "Nutrition & food logging tools",
  "Cardio & activity tracking",
  "Progress photo tracking",
  "Goal setting & accountability",
  "Full access to web & mobile app",
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-text-secondary">
            1-to-1 Personal Training & Nutrition
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Transform Your Body,{" "}
            <span className="gradient-text">Transform Your Life</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary sm:text-xl">
            Get a personalised meal plan, custom workout programme, and
            dedicated coaching support — all in one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-8 py-4 text-lg font-semibold text-text transition-all hover:bg-surface-light"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Your Coach */}
      <section className="border-t border-border px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Meet Your <span className="text-primary">Coach</span>
            </h2>
          </div>

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
            {/* Coach avatar */}
            <div className="shrink-0">
              <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-surface">
                <Image
                  src="/logo.png"
                  alt="TH Hub Coach"
                  width={192}
                  height={192}
                  className="h-full w-full object-contain p-6"
                />
              </div>
              {/* Social */}
              <a
                href="https://www.instagram.com/t_h_training"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
              >
                <InstagramIcon size={16} />
                @t_h_training
              </a>
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-text-secondary">
                I&apos;m a dedicated personal trainer and nutrition coach with a
                passion for helping people transform their bodies and their
                confidence. I believe that fitness isn&apos;t one-size-fits-all
                — every client deserves a plan that fits their lifestyle, goals,
                and preferences.
              </p>
              <p className="text-lg leading-relaxed text-text-secondary">
                Whether you&apos;re looking to lose weight, build muscle, or
                simply feel better in your own skin, I&apos;ll work with you
                every step of the way. Through personalised meal plans,
                structured workout programmes, and weekly check-ins, I provide
                the guidance, structure, and accountability you need to see real
                results.
              </p>
              <p className="text-lg leading-relaxed text-text-secondary">
                My approach is straightforward, supportive, and tailored to you.
                No cookie-cutter plans, no guesswork — just a clear path to your
                goals with someone in your corner every day.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  "Personalised Coaching",
                  "Nutrition Expert",
                  "Body Transformations",
                  "Supportive & Honest",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included / Features */}
      <section className="border-t border-border bg-surface px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to{" "}
              <span className="text-primary">Succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-text-secondary">
              A complete coaching platform designed to help you achieve your
              fitness and nutrition goals.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-bg p-6 transition-all hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              How It <span className="text-accent">Works</span>
            </h2>
            <p className="mx-auto max-w-2xl text-text-secondary">
              Getting started is simple. Three steps to a better you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <step.icon size={28} className="text-accent" />
                </div>
                <div className="mb-2 text-sm font-bold text-accent">
                  STEP {step.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-surface px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Simple, <span className="text-primary">Transparent</span> Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-text-secondary">
              One plan. Everything included. No hidden fees.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-px">
            <div className="rounded-2xl bg-bg p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
                  Monthly Coaching
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-text">
                    &pound;50
                  </span>
                  <span className="text-lg text-text-secondary">/month</span>
                </div>
                <p className="mt-2 text-text-secondary">
                  Payment via bank transfer or cash
                </p>
              </div>

              <div className="mb-8 space-y-3">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <Check size={12} className="text-success" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Get Started Now
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Get the App */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Get the <span className="gradient-text">App</span>
            </h2>
            <p className="mx-auto max-w-2xl text-text-secondary">
              Take your coaching with you. Track meals, complete workouts, and
              message your coach — all from your phone.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            {/* App Store */}
            <a
              href="#"
              className="group flex w-64 items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-text/10">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-text" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-text-muted">Download on the</div>
                <div className="text-lg font-semibold text-text">
                  App Store
                </div>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="#"
              className="group flex w-64 items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-text/10">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-text" fill="currentColor">
                  <path d="M3.18 23.49c-.35-.17-.57-.52-.57-.95V1.46c0-.43.22-.78.57-.95L13.63 12 3.18 23.49zM14.63 13l2.48 2.48L5.72 21.6l8.91-8.6zM20.16 10.65c.38.22.61.63.61 1.1 0 .47-.23.87-.61 1.09l-2.63 1.53L14.97 12l2.56-2.37 2.63 1.02zM5.72 2.4l11.39 6.12L14.63 11 5.72 2.4z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-text-muted">Get it on</div>
                <div className="text-lg font-semibold text-text">
                  Google Play
                </div>
              </div>
            </a>
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            Coming soon to iOS and Android. Sign up on the web to get started
            today.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-px">
            <div className="rounded-2xl bg-bg/95 px-8 py-16 text-center backdrop-blur">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Start Your{" "}
                <span className="gradient-text">Transformation</span>?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-text-secondary">
                Join TH Hub today and get the personalised support you need to
                reach your fitness goals.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                >
                  Get Started Now
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="https://www.instagram.com/t_h_training"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-lg font-semibold text-text transition-all hover:bg-surface-light"
                >
                  <InstagramIcon size={20} />
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
