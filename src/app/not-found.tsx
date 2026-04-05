import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <Image
        src="/logo.png"
        alt="TH Hub"
        width={80}
        height={80}
        className="mb-6 h-20 w-20 object-contain"
      />
      <h1 className="mb-2 text-6xl font-extrabold text-text">404</h1>
      <p className="mb-6 text-xl text-text-secondary">
        Page not found
      </p>
      <p className="mb-8 max-w-md text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-6 py-3 font-semibold text-text hover:bg-surface-light transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
