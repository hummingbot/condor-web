import { prisma } from "./prisma";

export async function validateToken(token: string): Promise<bigint | null> {
  if (!token) return null;
  const webToken = await prisma.webToken.findUnique({
    where: { token },
  });
  if (!webToken) return null;
  if (webToken.expiresAt < new Date()) return null;
  return webToken.userId;
}
