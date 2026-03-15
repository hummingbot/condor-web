import { prisma } from "@/lib/prisma";
import { AgentList } from "@/components/AgentList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents" };

export default async function AgentsPage() {
  const raw = await prisma.agentPublish.findMany({
    orderBy: { stars: "desc" },
    include: { user: { select: { username: true } } },
  });

  // Serialize for client component (BigInt → string stripped)
  const agents = raw.map(({ userId: _userId, ...a }) => a);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Community-published strategies. Clone into your Condor instance.
        </p>
      </div>

      {agents.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center">
          No agents published yet.{" "}
          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">/publish</code>
          {" "}in Condor to be first.
        </p>
      ) : (
        <AgentList agents={agents} />
      )}
    </div>
  );
}
