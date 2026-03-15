import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agentPublish.findMany({
    orderBy: { stars: "desc" },
    include: { user: { select: { username: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-100 mb-1">Agent Directory</h1>
      <p className="text-zinc-500 text-sm mb-6">Community-published agents. Clone into your Condor instance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3 hover:border-zinc-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-zinc-100 font-medium">{agent.name}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">by {agent.user?.username || "anon"}</p>
              </div>
              <span className="text-zinc-400 text-xs">⭐ {agent.stars}</span>
            </div>

            <p className="text-zinc-400 text-sm">{agent.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <span key={skill} className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                {agent.agentKey}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded px-3 py-1.5 transition-colors">
                ⭐ Star
              </button>
              <button className="flex-1 text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-300 rounded px-3 py-1.5 transition-colors">
                Clone
              </button>
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="col-span-3 text-center py-16 text-zinc-600">
            <p className="text-lg mb-2">No agents published yet</p>
            <p className="text-sm">Run <code className="text-emerald-400">/publish</code> in Condor to share yours</p>
          </div>
        )}
      </div>
    </div>
  );
}
