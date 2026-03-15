import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, agentId, source, prompt, response, actionsJson, exchange, pair, pnlSnapshot, isPublic } = body;

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  const msg = await prisma.chatMessage.create({
    data: { userId, agentId, source, prompt, response, actionsJson, exchange, pair, pnlSnapshot, isPublic: isPublic ?? false },
  });

  return NextResponse.json({ id: msg.id });
}
