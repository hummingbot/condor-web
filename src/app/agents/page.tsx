import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agentPublish.findMany({
    orderBy: { stars: "desc" },
    include: { user: { select: { username: true } } },
  });

  return (
    <div className="space-y-8">
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
        <div className="divide-y divide-border/50">
          {agents.map((agent) => (
            <div key={agent.id} className="py-5 flex items-start justify-between gap-6">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/agents/${agent.agentKey}`}
                    className="text-sm font-medium hover:text-muted-foreground transition-colors"
                  >
                    {agent.name}
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">{agent.agentKey}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
                <div className="flex items-center gap-3 pt-0.5">
                  {agent.skills.map((skill) => (
                    <span key={skill} className="text-xs text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">
                    by {agent.user?.username || "anon"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ★ {agent.stars}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                  Star
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Clone
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
