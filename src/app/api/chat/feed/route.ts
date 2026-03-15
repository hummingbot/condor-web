import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const messages = await prisma.chatMessage.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { username: true } } },
  });
  return NextResponse.json(messages);
}
