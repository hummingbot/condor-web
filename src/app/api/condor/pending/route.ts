import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/condor/pending?token=xxx — fetch pending messages for this user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.pendingMessage.findMany({
    where: { userId, status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // Mark as processing
  if (messages.length > 0) {
    await prisma.pendingMessage.updateMany({
      where: { id: { in: messages.map((m) => m.id) } },
      data: { status: "processing" },
    });
  }

  return NextResponse.json({ messages });
}
