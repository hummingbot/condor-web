import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { token } = await req.json();
  const { id } = await context.params;

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = await prisma.exchangeKey.findUnique({ where: { id } });
  if (!key || key.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.exchangeKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
