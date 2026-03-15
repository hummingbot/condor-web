import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, exchange, apiKey, apiSecret, label } = await req.json();

  if (!exchange?.trim() || !apiKey?.trim() || !apiSecret?.trim())
    return NextResponse.json({ error: "exchange, apiKey and apiSecret are required" }, { status: 400 });

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  try {
    const key = await prisma.exchangeKey.create({
      data: { userId, exchange: exchange.toLowerCase().trim(), apiKey: apiKey.trim(), apiSecret: apiSecret.trim(), label: label?.trim() || null },
    });
    return NextResponse.json({ id: key.id });
  } catch {
    return NextResponse.json({ error: "Key already exists for this exchange" }, { status: 409 });
  }
}
