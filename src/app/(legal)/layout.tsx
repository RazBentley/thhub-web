import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft size={18} />
            <Image src="/logo.png" alt="TH Hub" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-text">TH Hub</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <article className="prose prose-invert max-w-none">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 px-4 py-6 text-sm text-text-secondary sm:px-6">
          <Link href="/privacy" className="hover:text-text transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-text transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/cookies" className="hover:text-text transition-colors">
            Cookie Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
