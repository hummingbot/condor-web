import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/condor/pending/done — mark message done and write response
export async function POST(req: Request) {
  const { token, id, response } = await req.json();

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.pendingMessage.update({
    where: { id },
    data: { status: "done" },
  });

  await prisma.chatMessage.create({
    data: {
      userId,
      source: "manual",
      response,
      isPublic: false,
    },
  });

  return NextResponse.json({ ok: true });
}
