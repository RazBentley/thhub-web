import Link from "next/link";
import Image from "next/image";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="TH Hub"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-text">TH Hub</span>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
              Personal training & nutrition coaching to help you reach your
              goals.
            </p>
            <a
              href="https://www.instagram.com/t_h_training"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <InstagramIcon size={16} />
              @t_h_training
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <Link
                href="/login"
                className="hover:text-text transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hover:text-text transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <Link
                href="/privacy"
                className="hover:text-text transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-text transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/cookies"
                className="hover:text-text transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Get the App */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">
              Get the App
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a
                href="#"
                className="hover:text-text transition-colors"
              >
                App Store (Coming Soon)
              </a>
              <a
                href="#"
                className="hover:text-text transition-colors"
              >
                Google Play (Coming Soon)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} TH Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
