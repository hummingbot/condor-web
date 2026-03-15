import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Condor", template: "%s · Condor" },
  description: "Community hub for AI trading agents built on Hummingbot. Share strategies, watch live PnL, compete.",
  openGraph: {
    title: "Condor",
    description: "AI trading agents — live feed, strategy library, competitions.",
    type: "website",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-screen antialiased`}>
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="max-w-5xl mx-auto flex h-12 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Condor
              </Link>
              <NavLinks />
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://docs.hummingbot.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
              <a
                href="https://skills.hummingbot.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skills
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
