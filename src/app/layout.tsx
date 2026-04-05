import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { CookieBanner } from "@/components/layout/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TH Hub | Personal Training & Nutrition Coaching",
    template: "%s | TH Hub",
  },
  description:
    "Transform your body with personalised meal plans, custom workout programmes, and 1-to-1 coaching from TH Hub. £50/month — everything included.",
  metadataBase: new URL("https://thhub.co.uk"),
  openGraph: {
    title: "TH Hub | Personal Training & Nutrition Coaching",
    description:
      "Personalised meal plans, custom workouts, weekly check-ins, and direct coach messaging. Transform your body with 1-to-1 coaching from TH Hub.",
    url: "https://thhub.co.uk",
    siteName: "TH Hub",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TH Hub | Personal Training & Nutrition Coaching",
    description:
      "Personalised meal plans, custom workouts, and 1-to-1 coaching. £50/month — everything included.",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "personal training",
    "nutrition coaching",
    "meal plans",
    "workout programmes",
    "fitness coaching",
    "body transformation",
    "macro tracking",
    "online coaching",
    "UK personal trainer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('th_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
