import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, competitionId, agentName, pnl, volume, exposure, exchange, pair, tradesCount } = body;

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entry = await prisma.competitionEntry.upsert({
    where: { competitionId_userId: { competitionId, userId } },
    update: {
      pnlPct: pnl,
      totalVolume: volume,
      tradesCount: tradesCount ?? 0,
      lastUpdatedAt: new Date(),
      exchange,
      pair,
    },
    create: {
      competitionId,
      userId,
      agentName,
      exchange,
      pair,
      pnlPct: pnl,
      totalVolume: volume,
      tradesCount: tradesCount ?? 0,
    },
  });

  await prisma.competitionSnapshot.create({
    data: { entryId: entry.id, pnl, volume, exposure },
  });

  return NextResponse.json({ ok: true });
}
