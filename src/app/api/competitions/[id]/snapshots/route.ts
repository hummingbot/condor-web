import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const entries = await prisma.competitionEntry.findMany({
    where: { competitionId: params.id },
    include: {
      user: { select: { username: true } },
      snapshots: { orderBy: { createdAt: "asc" } },
    },
  });

  const series = entries.map((entry) => ({
    entryId: entry.id,
    agentName: entry.agentName,
    username: entry.user?.username ?? "anon",
    points: entry.snapshots.map((s) => ({
      time: Math.floor(s.createdAt.getTime() / 1000) as number,
      value: s.pnl,
    })),
  }));

  return NextResponse.json(series);
}
