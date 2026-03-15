import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const userId = await validateToken(token ?? "");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cex, dex] = await Promise.all([
    prisma.exchangeKey.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        exchange: true,
        apiKey: true,
        // never return apiSecret in list — only masked hint
        label: true,
        createdAt: true,
      },
    }),
    prisma.walletAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, chain: true, address: true, label: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ cex, dex });
}
