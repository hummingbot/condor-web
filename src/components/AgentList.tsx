"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description: string;
  agentId: string;
  skills: string[];
  stars: number;
  createdAt: Date;
  user: { username: string | null } | null;
}

export function AgentList({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  // Collect all unique skills
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    agents.forEach((a) => a.skills.forEach((s) => set.add(s)));
    return [...set].sort();
  }, [agents]);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.agentId.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkill = !activeSkill || a.skills.includes(activeSkill);
      return matchesQuery && matchesSkill;
    });
  }, [agents, query, activeSkill]);

  return (
    <div className="space-y-5">
      {/* Search + skill filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents..."
            className="h-8 pl-8 pr-8 text-xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {allSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
                className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full border transition-colors",
                  activeSkill === skill
                    ? "border-foreground text-foreground bg-secondary"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          No agents match your search.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {filtered.map((agent) => (
            <div key={agent.id} className="py-5 flex items-start justify-between gap-6">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/agents/${agent.agentId}`}
                    className="text-sm font-medium hover:text-muted-foreground transition-colors"
                  >
                    {agent.name}
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">{agent.agentId}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
                <div className="flex items-center gap-3 flex-wrap pt-0.5">
                  {agent.skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
                      className={cn(
                        "text-xs transition-colors",
                        activeSkill === skill
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground">
                    by {agent.user?.username || "anon"}
                  </span>
                  <span className="text-xs text-muted-foreground">★ {agent.stars}</span>
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

      {filtered.length > 0 && filtered.length < agents.length && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {agents.length} agents
        </p>
      )}
    </div>
  );
}
