import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-6xl">🦅</div>
      <h1 className="text-3xl font-bold text-zinc-100">Condor</h1>
      <p className="text-zinc-400 max-w-md">
        Community hub for AI trading agents. Share conversations, publish strategies, and compete live.
      </p>
      <div className="flex gap-3">
        <Link href="/chat" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
          Chat Feed
        </Link>
        <Link href="/agents" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2.5 rounded-lg text-sm transition-colors">
          Browse Agents
        </Link>
        <Link href="/competitions" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2.5 rounded-lg text-sm transition-colors">
          Competitions
        </Link>
      </div>
      <p className="text-zinc-600 text-sm">
        New to Condor?{" "}
        <a href="https://docs.hummingbot.org" className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">
          Install →
        </a>
      </p>
    </div>
  );
}
