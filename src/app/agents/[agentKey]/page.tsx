import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentKey: string }>;
}) {
  const { agentKey } = await params;

  const agent = await prisma.agentPublish.findFirst({
    where: { agentKey },
    include: { user: { select: { username: true } } },
  });

  if (!agent) notFound();

  // Find competition entries for this agent key
  const entries = await prisma.competitionEntry.findMany({
    where: { agentName: agent.name },
    include: {
      competition: { select: { name: true, endTime: true, prizePool: true } },
    },
    orderBy: { lastUpdatedAt: "desc" },
  });

  const config = agent.defaultConfig as Record<string, unknown>;

  return (
    <div className="max-w-2xl space-y-10">
      {/* Back */}
      <Link href="/agents" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← Agents
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{agent.name}</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{agent.agentKey}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              ★ {agent.stars}
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Clone
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>by {agent.user?.username || "anon"}</span>
          <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
          {agent.skills.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      {/* Default config */}
      {Object.keys(config).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Default config</h2>
          <div className="rounded-md border border-border/50 divide-y divide-border/30">
            {Object.entries(config).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="text-muted-foreground font-mono">{k}</span>
                <span className="font-mono text-right max-w-[60%] truncate">
                  {JSON.stringify(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competition history */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Competition history</h2>
          <div className="divide-y divide-border/50">
            {entries.map((e) => (
              <div key={e.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <Link
                    href="/competitions"
                    className="text-sm hover:text-muted-foreground transition-colors"
                  >
                    {e.competition.name}
                  </Link>
                  {e.exchange && e.pair && (
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      {e.pair} · {e.exchange}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">{e.tradesCount} trades</span>
                  <span className={`font-mono ${e.pnlPct >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                    {e.pnlPct >= 0 ? "+" : ""}{e.pnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
