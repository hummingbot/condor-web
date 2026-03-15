"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

interface ChatMsg { role: "user" | "agent"; text: string }

function timeAgo(iso: string) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

export default function ChatPage() {
  const [feed, setFeed] = useState<FeedMessage[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);

  const feedBottomRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  // Load token
  useEffect(() => {
    setToken(localStorage.getItem("condor_token") || "");
  }, []);

  // Initial feed load
  useEffect(() => {
    fetch("/api/chat/feed").then((r) => r.json()).then(setFeed).catch(console.error);
  }, []);

  // Poll feed every 8s; if new messages and not at bottom, show count
  useEffect(() => {
    const id = setInterval(async () => {
      const data: FeedMessage[] = await fetch("/api/chat/feed").then((r) => r.json()).catch(() => []);
      setFeed((prev) => {
        if (data.length > prev.length) {
          const diff = data.length - prev.length;
          if (!atBottom) setNewCount((c) => c + diff);
        }
        return data;
      });
    }, 8000);
    return () => clearInterval(id);
  }, [atBottom]);

  // SSE for personal chat
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll feed when at bottom
  useEffect(() => {
    if (atBottom) feedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed, atBottom]);

  const scrollToBottom = () => {
    feedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewCount(0);
    setAtBottom(true);
  };

  const connect = () => { localStorage.setItem("condor_token", tokenInput); setToken(tokenInput); };
  const disconnect = () => { localStorage.removeItem("condor_token"); setToken(""); setMessages([]); };

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
        <div className="flex items-baseline justify-between shrink-0">
          <h1 className="text-xl font-semibold tracking-tight">Live Feed</h1>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="text-xs text-muted-foreground">{feed.length} messages</span>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={feedScrollRef as React.RefObject<HTMLDivElement>}>
            {feed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                No messages yet. Enable{" "}
                <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">/webchat on</code>
                {" "}in Condor.
              </p>
            ) : (
              <div className="space-y-px pr-2">
                {feed.map((msg) => (
                  <div key={msg.id} className="py-4 border-b border-border/20 group">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-medium">{msg.user?.username || "anon"}</span>
                      {msg.exchange && (
                        <span className="text-xs text-muted-foreground">{msg.exchange}</span>
                      )}
                      {msg.pair && (
                        <span className="text-xs text-muted-foreground font-mono">{msg.pair}</span>
                      )}
                      <div className="ml-auto flex items-center gap-3">
                        {msg.pnlSnapshot !== undefined && (
                          <span className={cn(
                            "text-xs font-mono",
                            msg.pnlSnapshot >= 0 ? "text-emerald-500" : "text-red-400"
                          )}>
                            {msg.pnlSnapshot >= 0 ? "+" : ""}{msg.pnlSnapshot.toFixed(2)}%
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                      </div>
                    </div>
                    {msg.prompt && (
                      <p className="text-xs text-muted-foreground border-l border-border/50 pl-3 mb-1.5 leading-relaxed">
                        {msg.prompt}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.response}</p>
                  </div>
                ))}
                <div ref={feedBottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* New messages banner */}
          {newCount > 0 && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs bg-secondary border border-border/50 rounded-full px-3 py-1.5 shadow-lg hover:bg-accent transition-colors"
            >
              {newCount} new message{newCount > 1 ? "s" : ""} ↓
            </button>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-64 shrink-0 flex flex-col border-l border-border/50 pl-8">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <span className="text-sm font-medium">Your agent</span>
          {token && (
            <button onClick={disconnect} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Disconnect
            </button>
          )}
        </div>

        {!token ? (
          <div className="flex flex-col gap-3">
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
            <div className="flex items-center gap-1.5 mb-4 text-xs text-emerald-500 shrink-0">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Connected
            </div>

            <ScrollArea className="flex-1 -mx-1 px-1">
              <div className="space-y-2.5">
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground">Send a message to your agent.</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={cn(
                      "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground">…</div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t border-border/50 mt-4 shrink-0">
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
