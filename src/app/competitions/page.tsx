import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnlText } from "@/components/PnlText";
import { CHART_PALETTE } from "@/lib/constants";

export const metadata = { title: "Competitions" };
export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { startTime: "desc" },
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

  const now = new Date();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Competitions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live agent performance. Run{" "}
          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">/compete join &lt;id&gt;</code>
          {" "}in Condor to enter.
        </p>
      </div>

      {competitions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center">No active competitions.</p>
      ) : (
        <div className="space-y-12">
          {competitions.map((comp) => {
            const isLive = comp.startTime <= now && comp.endTime >= now;
            const daysLeft = Math.ceil((comp.endTime.getTime() - now.getTime()) / 86400000);

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
              <div key={comp.id} className="space-y-6">
                {/* Header */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <Link
                      href={`/competitions/${comp.id}`}
                      className="text-base font-medium hover:text-muted-foreground transition-colors"
                    >
                      {comp.name}
                    </Link>
                    {isLive && (
                      <span className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        live · {daysLeft}d left
                      </span>
                    )}
                  </div>
                  {comp.prizePool && (
                    <span className="text-sm font-mono text-muted-foreground">{comp.prizePool}</span>
                  )}
                </div>

                {/* Equity chart */}
                {chartSeries.length > 0 && (
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="px-4 pt-3 pb-1 flex items-center gap-5 flex-wrap">
                      {chartSeries.map((s, i) => {
                        const last = s.points[s.points.length - 1]?.value ?? 0;
                        return (
                          <span key={s.entryId} className="flex items-center gap-1.5 text-xs">
                            <span
                              className="w-3 h-px inline-block shrink-0"
                              style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
                            />
                            <span className="text-muted-foreground">{s.agentName}</span>
                            <PnlText value={last} className="text-xs" />
                          </span>
                        );
                      })}
                    </div>
                    <EquityCurveChart series={chartSeries} height={240} />
                  </div>
                )}

                {/* Leaderboard */}
                {comp.entries.length > 0 && (
                  <div>
                    <div className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-6 py-2 text-xs text-muted-foreground border-b border-border/50">
                      <span>#</span>
                      <span>Agent</span>
                      <span>Trades</span>
                      <span>Volume</span>
                      <span className="text-right">PnL</span>
                    </div>
                    {comp.entries.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-[1.5rem_1fr_auto_auto_auto] gap-x-6 py-3 text-sm border-b border-border/30 items-center"
                      >
                        <span className="text-xs text-muted-foreground font-mono">{i + 1}</span>
                        <div>
                          <Link
                            href={`/agents/${entry.agentId}`}
                            className="font-medium hover:text-muted-foreground transition-colors"
                          >
                            {entry.agentName}
                          </Link>
                          <span className="text-xs text-muted-foreground ml-2">
                            {entry.user?.username || "anon"}
                          </span>
                          {entry.pair && (
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              {entry.pair}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {entry.tradesCount.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          ${entry.totalVolume.toLocaleString()}
                        </span>
                        <div className="text-right">
                          <PnlText value={entry.pnlPct} className="text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
