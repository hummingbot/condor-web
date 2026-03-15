import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Condor — AI Trading Agents",
  description: "Community hub for Condor trading agent users",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased`}>
        <nav className="border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
          <Link href="/" className="text-emerald-400 font-bold text-lg tracking-tight">
            🦅 Condor
          </Link>
          <div className="flex items-center gap-5 ml-4 text-sm text-zinc-400">
            <Link href="/chat" className="hover:text-zinc-100 transition-colors">Chat</Link>
            <Link href="/agents" className="hover:text-zinc-100 transition-colors">Agents</Link>
            <Link href="/competitions" className="hover:text-zinc-100 transition-colors">Competitions</Link>
            <a href="https://docs.hummingbot.org" target="_blank" rel="noopener noreferrer"
               className="hover:text-zinc-100 transition-colors">
              Install ↗
            </a>
            <a href="https://skills.hummingbot.org" target="_blank" rel="noopener noreferrer"
               className="hover:text-zinc-100 transition-colors">
              Skills ↗
            </a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
