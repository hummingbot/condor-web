import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnlText } from "@/components/PnlText";
import { CHART_PALETTE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const comp = await prisma.competition.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { pnlPct: "desc" },
        include: {
          user: { select: { username: true } },
          snapshots: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!comp) notFound();

  const now = new Date();
  const isLive = comp.startTime <= now && comp.endTime >= now;
  const isEnded = comp.endTime < now;
  const daysLeft = Math.ceil((comp.endTime.getTime() - now.getTime()) / 86400000);
  const duration = Math.round((comp.endTime.getTime() - comp.startTime.getTime()) / 86400000);

  const chartSeries = comp.entries
    .filter((e) => e.snapshots.length > 1)
    .map((e) => ({
      entryId: e.id,
      agentName: e.agentName,
      agentId: e.agentId,
      username: e.user?.username ?? "anon",
      points: e.snapshots.map((s) => ({
        time: Math.floor(s.createdAt.getTime() / 1000),
        value: s.pnl,
      })),
    }));



  return (
    <div className="max-w-3xl space-y-10">
      {/* Back */}
      <Link href="/competitions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← Competitions
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold">{comp.name}</h1>
              {isLive && (
                <span className="text-xs text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Live · {daysLeft}d left
                </span>
              )}
              {isEnded && <span className="text-xs text-muted-foreground">Ended</span>}
            </div>
            {comp.description && (
              <p className="text-sm text-muted-foreground">{comp.description}</p>
            )}
          </div>
          {comp.prizePool && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Prize pool</p>
              <p className="text-lg font-semibold tabular-nums">{comp.prizePool}</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <span>{comp.entries.length} participants</span>
          <span>{duration}d duration</span>
          <span>
            {comp.startTime.toLocaleDateString()} – {comp.endTime.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartSeries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-medium">Equity curves</h2>
            <div className="flex items-center gap-5">
              {chartSeries.map((s, i) => {
                const last = s.points[s.points.length - 1]?.value ?? 0;
                return (
                  <span key={s.entryId} className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-px inline-block shrink-0" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                    <span className="text-muted-foreground">{s.agentName}</span>
                    <PnlText value={last} />
                  </span>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <EquityCurveChart series={chartSeries} height={280} />
          </div>
        </div>
      )}

      {/* Stats summary */}
      {comp.entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total volume", value: `$${comp.entries.reduce((s, e) => s + e.totalVolume, 0).toLocaleString()}` },
            { label: "Total trades", value: comp.entries.reduce((s, e) => s + e.tradesCount, 0).toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-base font-semibold tabular-nums mt-0.5 font-mono">{stat.value}</p>
            </div>
          ))}
          <div className="rounded-lg border border-border/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Best PnL</p>
            {comp.entries[0] ? (
              <PnlText value={comp.entries[0].pnlPct} className="text-base font-semibold mt-0.5 block" />
            ) : (
              <p className="text-base font-semibold mt-0.5 text-muted-foreground">—</p>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Leaderboard</h2>
        <div className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-6 py-2 text-xs text-muted-foreground border-b border-border/50">
          <span>#</span><span>Agent</span><span>Trades</span><span>Volume</span><span className="text-right">PnL</span>
        </div>
        {comp.entries.map((entry, i) => (
          <div
            key={entry.id}
            className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-6 py-3 text-sm border-b border-border/20 items-center"
          >
            <span className="text-xs text-muted-foreground font-mono">{i + 1}</span>
            <div className="min-w-0">
              <Link href={`/agents/${entry.agentId}`} className="font-medium hover:text-muted-foreground transition-colors truncate">
                {entry.agentName}
              </Link>
              <span className="text-xs text-muted-foreground ml-2">{entry.user?.username || "anon"}</span>
              {entry.pair && (
                <span className="text-xs text-muted-foreground ml-2 font-mono">{entry.pair}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{entry.tradesCount.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground tabular-nums">${entry.totalVolume.toLocaleString()}</span>
            <div className="text-right">
              <PnlText value={entry.pnlPct} />
            </div>
          </div>
        ))}
      </div>

      {/* Per-agent breakdown */}
      {comp.entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Agent breakdown</h2>
          <div className="space-y-3">
            {comp.entries.map((entry, i) => (
              <div key={entry.id} className="rounded-lg border border-border/50 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
                    />
                    <Link href={`/agents/${entry.agentId}`} className="text-sm font-medium hover:text-muted-foreground transition-colors">
                      {entry.agentName}
                    </Link>
                    <span className="text-xs text-muted-foreground">{entry.user?.username || "anon"}</span>
                  </div>
                  <PnlText value={entry.pnlPct} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  {entry.exchange && <span>Exchange: {entry.exchange}</span>}
                  {entry.pair && <span className="font-mono">Pair: {entry.pair}</span>}
                  <span>Trades: {entry.tradesCount.toLocaleString()}</span>
                  <span>Volume: ${entry.totalVolume.toLocaleString()}</span>
                  <span>Updated: {new Date(entry.lastUpdatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
