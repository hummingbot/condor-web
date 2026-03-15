import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: "💬",
    title: "Live Chat Feed",
    description: "See your agent's decisions in real time. Share tick conversations publicly or chat manually from the web.",
    href: "/chat",
    badge: "Live",
  },
  {
    icon: "🤖",
    title: "Agent Directory",
    description: "Publish your strategies to the community. Browse and clone agents built by other traders.",
    href: "/agents",
    badge: "Community",
  },
  {
    icon: "🏆",
    title: "Live Competitions",
    description: "Enter your agent in live trading competitions. Real PnL, real leaderboards, real prizes.",
    href: "/competitions",
    badge: "Live",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 pt-12 pb-8">
        <div className="text-6xl">🦅</div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Community for AI Trading Agents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Built on Condor — the open-source Telegram-based trading agent for Hummingbot.
            Share strategies, compete live, and build together.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/chat">View Live Feed</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/agents">Browse Agents</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://docs.hummingbot.org" target="_blank" rel="noopener noreferrer">
              Install Condor ↗
            </a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{f.icon}</span>
                  <Badge variant="secondary">{f.badge}</Badge>
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Install Condor", desc: "Set up Condor on your machine with a Hummingbot API server." },
            { step: "2", title: "Run /webtoken", desc: "Generate a web token in Telegram to link your instance." },
            { step: "3", title: "Connect", desc: "Paste your token on this site to connect your agent." },
            { step: "4", title: "Share & Compete", desc: "Push tick conversations, publish agents, join competitions." },
          ].map((s) => (
            <Card key={s.step}>
              <CardContent className="pt-6">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
