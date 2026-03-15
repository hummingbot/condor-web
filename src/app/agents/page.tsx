import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agentPublish.findMany({
    orderBy: { stars: "desc" },
    include: { user: { select: { username: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Directory</h1>
          <p className="text-muted-foreground mt-1">
            Community-published trading agents. Clone into your Condor instance.
          </p>
        </div>
        <Badge variant="secondary">{agents.length} agents</Badge>
      </div>

      <Separator />

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <span className="text-5xl">🤖</span>
          <h3 className="text-lg font-semibold">No agents published yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/publish</code> in
            your Condor Telegram bot to share your agent here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="flex flex-col hover:border-ring transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-lg bg-secondary">
                      {agent.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight">{agent.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {agent.user?.username || "anon"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                    ⭐ {agent.stars}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <CardDescription className="text-sm leading-relaxed">
                  {agent.description}
                </CardDescription>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    {agent.agentKey}
                  </Badge>
                  {agent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-2 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  ⭐ Star
                </Button>
                <Button size="sm" className="flex-1">
                  Clone →
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
