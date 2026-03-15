import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, name, description, agentId, skills, defaultConfig } = body;

  const userId = await validateToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  const agent = await prisma.agentPublish.create({
    data: { userId, name, description, agentId, skills: skills ?? [], defaultConfig: defaultConfig ?? {} },
  });

  return NextResponse.json({ id: agent.id });
}
