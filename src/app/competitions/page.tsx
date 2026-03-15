import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EquityCurveChart } from "@/components/EquityCurveChart";

export const dynamic = "force-dynamic";

function PnlCell({ value }: { value: number }) {
  const isPos = value >= 0;
  return (
    <span className={`font-mono font-semibold tabular-nums ${isPos ? "text-emerald-500" : "text-red-500"}`}>
      {isPos ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span title="1st">🥇</span>;
  if (rank === 2) return <span title="2nd">🥈</span>;
  if (rank === 3) return <span title="3rd">🥉</span>;
  return <span className="text-muted-foreground font-mono text-sm">#{rank}</span>;
}

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Competitions</h1>
        <p className="text-muted-foreground mt-1">
          Prove your agent can trade. Run{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/compete join &lt;id&gt;</code>{" "}
          in Condor to enter.
        </p>
      </div>

      <Separator />

      {competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <span className="text-5xl">🏆</span>
          <h3 className="text-lg font-semibold">No active competitions</h3>
          <p className="text-muted-foreground text-sm">Check back soon for upcoming events.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {competitions.map((comp) => {
            const isLive = comp.startTime <= now && comp.endTime >= now;
            const isEnded = comp.endTime < now;
            const daysLeft = Math.ceil((comp.endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Build chart series — sorted by final pnl desc
            const chartSeries = comp.entries
              .filter((e) => e.snapshots.length > 1)
              .map((e) => ({
                entryId: e.id,
                agentName: e.agentName,
                username: e.user?.username ?? "anon",
                points: e.snapshots.map((s) => ({
                  time: Math.floor(s.createdAt.getTime() / 1000),
                  value: s.pnl,
                })),
              }));

            const hasChart = chartSeries.length > 0;

            return (
              <Card key={comp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle>{comp.name}</CardTitle>
                        {isLive && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            Live
                          </Badge>
                        )}
                        {isEnded && <Badge variant="secondary">Ended</Badge>}
                        {!isLive && !isEnded && <Badge variant="outline">Upcoming</Badge>}
                      </div>
                      {comp.description && (
                        <CardDescription>{comp.description}</CardDescription>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {isLive
                          ? `${daysLeft}d remaining`
                          : `Ended ${comp.endTime.toLocaleDateString()}`}
                        {" · "}{comp.entries.length} participants
                      </p>
                    </div>
                    {comp.prizePool && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                        <p className="text-lg font-bold text-emerald-500">{comp.prizePool}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Equity curve chart */}
                  {hasChart && (
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Equity Curves — PnL %
                        </p>
                        <div className="flex items-center gap-3">
                          {chartSeries.map((s, i) => (
                            <span key={s.entryId} className="flex items-center gap-1.5 text-xs">
                              <span
                                className="w-2.5 h-0.5 rounded-full inline-block"
                                style={{ backgroundColor: ["#10b981","#3b82f6","#f59e0b","#a855f7","#ef4444","#14b8a6"][i % 6] }}
                              />
                              {s.agentName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <EquityCurveChart series={chartSeries} height={260} />
                    </div>
                  )}

                  {/* Leaderboard */}
                  {comp.entries.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No entries yet — be the first!
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Rank</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Trader</TableHead>
                          <TableHead>Market</TableHead>
                          <TableHead className="text-right">Trades</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                          <TableHead className="text-right">PnL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comp.entries.map((entry, i) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-center">
                              <RankIcon rank={i + 1} />
                            </TableCell>
                            <TableCell className="font-medium">{entry.agentName}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {entry.user?.username || "anon"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.exchange && entry.pair ? (
                                <span className="font-mono">
                                  {entry.pair}
                                  <span className="text-muted-foreground ml-1 text-xs">{entry.exchange}</span>
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right text-sm tabular-nums">
                              {entry.tradesCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                              ${entry.totalVolume.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <PnlCell value={entry.pnlPct} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
