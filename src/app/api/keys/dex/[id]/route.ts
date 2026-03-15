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

  const wallet = await prisma.walletAddress.findUnique({ where: { id } });
  if (!wallet || wallet.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.walletAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
