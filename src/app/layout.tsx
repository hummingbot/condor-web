import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Condor — AI Trading Agents",
  description: "Community hub for Condor trading agent users",
};

const externalLinks = [
  { href: "https://docs.hummingbot.org", label: "Install" },
  { href: "https://skills.hummingbot.org", label: "Skills" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-screen antialiased`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto flex h-14 items-center gap-6 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">🦅</span>
              <span>Condor</span>
            </Link>

            <Separator orientation="vertical" className="h-5" />

            <NavLinks />

            <div className="ml-auto flex items-center gap-1">
              {externalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent inline-flex items-center gap-1"
                >
                  {link.label}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>

        <footer className="border-t mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>🦅 Condor by Hummingbot</span>
            <span>Built with open-source AI trading infrastructure</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
