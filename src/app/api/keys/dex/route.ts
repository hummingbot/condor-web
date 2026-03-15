import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, chain, address, label } = await req.json();

  if (!chain?.trim() || !address?.trim())
    return NextResponse.json({ error: "chain and address are required" }, { status: 400 });

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  try {
    const wallet = await prisma.walletAddress.create({
      data: { userId, chain: chain.toLowerCase().trim(), address: address.trim(), label: label?.trim() || null },
    });
    return NextResponse.json({ id: wallet.id });
  } catch {
    return NextResponse.json({ error: "Address already registered for this chain" }, { status: 409 });
  }
}
