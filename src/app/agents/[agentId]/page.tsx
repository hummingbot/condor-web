import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnlText } from "@/components/PnlText";
import { CHART_PALETTE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agent = await prisma.agentPublish.findFirst({ where: { agentId }, select: { name: true } });
  return { title: agent?.name ?? agentId };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const agent = await prisma.agentPublish.findFirst({
    where: { agentId },
    include: { user: { select: { username: true } } },
  });

  if (!agent) notFound();

  // All competition entries for this agent (any exchange/pair)
  const entries = await prisma.competitionEntry.findMany({
    where: { agentId },
    include: {
      competition: { select: { id: true, name: true } },
      snapshots: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { lastUpdatedAt: "desc" },
  });

  // Recent trades across all exchanges/pairs
  const trades = await prisma.trade.findMany({
    where: { agentId },
    orderBy: { ts: "desc" },
    take: 100,
  });

  // Build chart series: one per entry (labeled exchange+pair)
  const chartSeries = entries
    .filter((e) => e.snapshots.length > 1)
    .map((e) => ({
      entryId: e.id,
      agentName: e.exchange && e.pair ? `${e.pair} · ${e.exchange}` : e.competition.name,
      username: "",
      points: e.snapshots.map((s) => ({
        time: Math.floor(s.createdAt.getTime() / 1000),
        value: s.pnl,
      })),
    }));

  // Summary stats
  const totalPnl = trades.reduce((s, t) => s + t.realizedPnl, 0);
  const totalVolume = trades.reduce((s, t) => s + t.cost, 0);
  const winRate = trades.filter((t) => t.realizedPnl > 0).length / (trades.filter(t => t.realizedPnl !== 0).length || 1);

  // Unique markets traded
  const markets = [...new Map(
    trades.map((t) => [`${t.exchange}:${t.pair}`, { exchange: t.exchange, pair: t.pair }])
  ).values()];

  

  return (
    <div className="max-w-3xl space-y-10">
      <Link href="/agents" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← Agents
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold">{agent.name}</h1>
            <span className="text-xs text-muted-foreground font-mono">{agent.agentId}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>by {agent.user?.username || "anon"}</span>
            {agent.skills.map((s) => <span key={s}>{s}</span>)}
          </div>
          {markets.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {markets.map((m) => (
                <span key={`${m.exchange}:${m.pair}`} className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">
                  {m.pair} · {m.exchange}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            ★ {agent.stars}
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">Clone</Button>
        </div>
      </div>

      {/* Stats */}
      {trades.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Trades", value: trades.length.toLocaleString() },
            { label: "Volume", value: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            {
              label: "Realized PnL",
              value: `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`,
              color: totalPnl >= 0 ? "text-emerald-500" : "text-red-400",
            },
            {
              label: "Win rate",
              value: `${(winRate * 100).toFixed(0)}%`,
              color: winRate >= 0.5 ? "text-emerald-500" : "text-muted-foreground",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/50 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-sm font-semibold tabular-nums mt-0.5 font-mono", s.color)}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Equity curves */}
      {chartSeries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-medium">Equity</h2>
            <div className="flex items-center gap-5">
              {chartSeries.map((s, i) => (
                <span key={s.entryId} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-px inline-block shrink-0" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  {s.agentName}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <EquityCurveChart series={chartSeries} height={240} />
          </div>
        </div>
      )}

      {/* Trade history */}
      {trades.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Trades</h2>
            <span className="text-xs text-muted-foreground">{trades.length} most recent</span>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-5 px-4 py-2 text-xs text-muted-foreground border-b border-border/50 bg-secondary/30">
              <span>Time</span>
              <span>Pair</span>
              <span>Exchange</span>
              <span>Side</span>
              <span className="text-right">Price</span>
              <span className="text-right">Amount</span>
              <span className="text-right">PnL</span>
            </div>
            {/* Rows */}
            <div className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
              {trades.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-5 px-4 py-2.5 text-xs items-center hover:bg-secondary/20 transition-colors"
                >
                  <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                    {new Date(t.ts).toLocaleString([], {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <span className="font-mono">{t.pair}</span>
                  <span className="text-muted-foreground">{t.exchange}</span>
                  <span className={t.side === "BUY" ? "text-emerald-500" : "text-red-400"}>
                    {t.side}
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    {t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-right font-mono tabular-nums text-muted-foreground">
                    {t.amount}
                  </span>
                  <div className="text-right">
                    {t.realizedPnl !== 0 ? (
                      <PnlText value={t.realizedPnl} percent={false} decimals={4} className="text-xs" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competition links */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Competitions</h2>
          <div className="divide-y divide-border/50">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <Link href={`/competitions/${e.competition.id}`} className="hover:text-muted-foreground transition-colors">
                    {e.competition.name}
                  </Link>
                  {e.exchange && e.pair && (
                    <span className="text-muted-foreground font-mono">{e.pair} · {e.exchange}</span>
                  )}
                </div>
                <PnlText value={e.pnlPct} className="text-xs" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
