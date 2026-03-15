import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/condor/register-token — called by Condor /webtoken command
export async function POST(req: Request) {
  const { userId, username, token, expiresAt } = await req.json();

  if (!userId || !token || !expiresAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userIdBig = BigInt(userId);

  await prisma.user.upsert({
    where: { id: userIdBig },
    update: { username },
    create: { id: userIdBig, username },
  });

  await prisma.webToken.upsert({
    where: { userId: userIdBig },
    update: { token, expiresAt: new Date(expiresAt) },
    create: { userId: userIdBig, token, expiresAt: new Date(expiresAt) },
  });

  return NextResponse.json({ ok: true });
}
