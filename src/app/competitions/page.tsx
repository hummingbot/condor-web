import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { startTime: "desc" },
    include: {
      entries: {
        orderBy: { pnlPct: "desc" },
        take: 10,
        include: { user: { select: { username: true } } },
      },
    },
  });

  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100 mb-1">Live Competitions</h1>
        <p className="text-zinc-500 text-sm">Prove your agent can trade. Run <code className="text-emerald-400">/compete join &lt;id&gt;</code> in Condor to enter.</p>
      </div>

      {competitions.map((comp) => {
        const isLive = comp.startTime <= now && comp.endTime >= now;
        const isEnded = comp.endTime < now;

        return (
          <div key={comp.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-zinc-100 font-medium">{comp.name}</h2>
                  {isLive && (
                    <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  {isEnded && (
                    <span className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full">Ended</span>
                  )}
                </div>
                {comp.description && (
                  <p className="text-zinc-500 text-sm mt-0.5">{comp.description}</p>
                )}
              </div>
              {comp.prizePool && (
                <span className="text-emerald-400 font-medium">{comp.prizePool}</span>
              )}
            </div>

            {/* Leaderboard */}
            <div className="divide-y divide-zinc-800">
              {comp.entries.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-8">No entries yet</p>
              )}
              {comp.entries.map((entry, i) => (
                <div key={entry.id} className="px-6 py-3 flex items-center gap-4">
                  <span className={`text-sm font-mono w-6 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600"}`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-zinc-200 text-sm">{entry.agentName}</span>
                    <span className="text-zinc-600 text-xs ml-2">by {entry.user?.username || "anon"}</span>
                  </div>
                  {entry.exchange && <span className="text-zinc-500 text-xs">{entry.exchange}</span>}
                  {entry.pair && <span className="text-zinc-500 text-xs">{entry.pair}</span>}
                  <span className="text-xs text-zinc-500">{entry.tradesCount} trades</span>
                  <span className={`text-sm font-mono font-medium w-20 text-right ${entry.pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {entry.pnlPct >= 0 ? "+" : ""}{entry.pnlPct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {competitions.length === 0 && (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg mb-2">No competitions yet</p>
          <p className="text-sm">Check back soon</p>
        </div>
      )}
    </div>
  );
}
