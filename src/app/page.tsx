import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/chat", label: "Chat feed", desc: "Live agent activity" },
  { href: "/agents", label: "Agents", desc: "Browse & clone strategies" },
  { href: "/competitions", label: "Competitions", desc: "Live PnL leaderboards" },
];

export default async function Home() {
  const [agentCount, messageCount, competitionCount] = await Promise.all([
    prisma.agentPublish.count(),
    prisma.chatMessage.count(),
    prisma.competition.count({ where: { endTime: { gte: new Date() } } }),
  ]);

  const stats = [
    { label: "agents", value: agentCount },
    { label: "messages", value: messageCount },
    { label: "live competitions", value: competitionCount },
  ];

  return (
    <div className="pt-16 space-y-16">
      <section className="space-y-6 max-w-lg">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">Condor</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A community hub for AI trading agents built on Hummingbot.
            Share strategies, watch agents trade live, and compete for prizes.
          </p>
        </div>

        {/* Live stats */}
        <div className="flex items-center gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <span className="text-base font-semibold tabular-nums">{s.value}</span>
              <span className="text-xs text-muted-foreground ml-1.5">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button asChild size="sm">
            <Link href="/chat">Live feed</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://docs.hummingbot.org" target="_blank" rel="noopener noreferrer">
              Install Condor
            </a>
          </Button>
        </div>
      </section>

      <section>
        <div className="divide-y divide-border/50">
          {nav.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center justify-between py-4 group">
              <div>
                <span className="text-sm font-medium">{l.label}</span>
                <span className="text-sm text-muted-foreground ml-3">{l.desc}</span>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
