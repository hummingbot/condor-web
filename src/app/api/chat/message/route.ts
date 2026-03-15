import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, message } = await req.json();
  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pending = await prisma.pendingMessage.create({
    data: { userId, message },
  });

  return NextResponse.json({ id: pending.id });
}
