"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedMessage {
  id: string;
  agentId?: string;
  source: string;
  prompt?: string;
  response: string;
  exchange?: string;
  pair?: string;
  pnlSnapshot?: number;
  createdAt: string;
  user: { username?: string };
}

interface ChatMsg {
  role: "user" | "agent";
  text: string;
}

export default function ChatPage() {
  const [feed, setFeed] = useState<FeedMessage[]>([]);
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("condor_token") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    const load = () =>
      fetch("/api/chat/feed").then((r) => r.json()).then(setFeed).catch(console.error);
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`/api/chat/stream?token=${token}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((p) => [...p, { role: "agent", text: data.response }]);
      setSending(false);
    };
    return () => es.close();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    localStorage.setItem("condor_token", tokenInput);
    setToken(tokenInput);
  };

  const disconnect = () => {
    localStorage.removeItem("condor_token");
    setToken("");
    setMessages([]);
  };

  const send = async () => {
    if (!input.trim() || !token || sending) return;
    const msg = input.trim();
    setMessages((p) => [...p, { role: "user", text: msg }]);
    setSending(true);
    setInput("");
    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, message: msg }),
    });
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-88px)]">
      {/* Feed */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Live Feed</h1>
          <span className="text-xs text-muted-foreground">{feed.length} messages</span>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No public messages yet. Enable{" "}
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">/webchat on</code>
              {" "}in your Condor bot.
            </p>
          ) : (
            <div className="space-y-px">
              {feed.map((msg) => (
                <div key={msg.id} className="py-4 border-b border-border/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium">{msg.user?.username || "anon"}</span>
                    {msg.exchange && (
                      <span className="text-xs text-muted-foreground">{msg.exchange}</span>
                    )}
                    {msg.pair && (
                      <span className="text-xs text-muted-foreground font-mono">{msg.pair}</span>
                    )}
                    {msg.pnlSnapshot !== undefined && (
                      <span className={`text-xs font-mono ml-auto ${msg.pnlSnapshot >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                        {msg.pnlSnapshot >= 0 ? "+" : ""}{msg.pnlSnapshot.toFixed(2)}%
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {msg.prompt && (
                    <p className="text-xs text-muted-foreground border-l border-border pl-3 mb-1.5 leading-relaxed">
                      {msg.prompt}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.response}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat panel */}
      <div className="w-72 shrink-0 flex flex-col border-l border-border/50 pl-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Your agent</span>
          {token && (
            <button
              onClick={disconnect}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {!token ? (
          <div className="flex flex-col gap-3 pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Run{" "}
              <code className="bg-secondary px-1 py-0.5 rounded">/webtoken</code>
              {" "}in your Condor bot, then paste the token below.
            </p>
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              placeholder="Paste your token..."
              className="h-8 text-xs"
            />
            <Button onClick={connect} disabled={!tokenInput} size="sm" className="h-8 text-xs">
              Connect
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-4 text-xs text-emerald-500">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Connected
            </div>

            <ScrollArea className="flex-1 -mx-1 px-1">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground">Send a message to your agent.</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground">…</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t border-border/50 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Message..."
                className="h-8 text-xs"
                disabled={sending}
              />
              <Button onClick={send} disabled={sending || !input.trim()} size="sm" className="h-8 text-xs shrink-0">
                Send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
