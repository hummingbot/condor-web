import { validateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";

  const userId = await validateToken(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let lastSeenId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const poll = async () => {
        try {
          const where = lastSeenId
            ? { userId, id: { gt: lastSeenId } }
            : { userId };

          const messages = await prisma.chatMessage.findMany({
            where,
            orderBy: { createdAt: "asc" },
            take: 10,
          });

          for (const msg of messages) {
            lastSeenId = msg.id;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
          }
        } catch {
          controller.close();
          return;
        }

        setTimeout(poll, 2000);
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
