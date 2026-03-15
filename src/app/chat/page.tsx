"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessage {
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

interface Message {
  role: "user" | "agent";
  text: string;
}

function FeedCard({ msg }: { msg: ChatMessage }) {
  const isPositive = msg.pnlSnapshot !== undefined && msg.pnlSnapshot >= 0;

  return (
    <Card className="hover:border-ring/50 transition-colors">
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">
              {(msg.user?.username || "A")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{msg.user?.username || "anon"}</span>
          {msg.exchange && <Badge variant="outline" className="text-xs h-4 px-1.5">{msg.exchange}</Badge>}
          {msg.pair && <Badge variant="outline" className="text-xs h-4 px-1.5 font-mono">{msg.pair}</Badge>}
          {msg.pnlSnapshot !== undefined && (
            <Badge
              variant="outline"
              className={`text-xs h-4 px-1.5 font-mono ml-auto ${isPositive ? "text-emerald-500 border-emerald-500/30" : "text-red-500 border-red-500/30"}`}
            >
              {isPositive ? "+" : ""}{msg.pnlSnapshot.toFixed(2)}%
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {msg.prompt && (
          <p className="text-xs text-muted-foreground border-l-2 border-muted pl-3 leading-relaxed">
            {msg.prompt}
          </p>
        )}
        <p className="text-sm leading-relaxed">{msg.response}</p>

        <div className="flex items-center gap-1.5 pt-1">
          <Badge variant="secondary" className="text-xs h-4 px-1.5">
            {msg.source === "tick" ? "⚡ tick" : "💬 manual"}
          </Badge>
          {msg.agentId && (
            <span className="text-xs text-muted-foreground">{msg.agentId}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChatPage() {
  const [feed, setFeed] = useState<ChatMessage[]>([]);
  const [tokenInput, setTokenInput] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("condor_token") || "";
    setSavedToken(t);
  }, []);

  useEffect(() => {
    fetch("/api/chat/feed")
      .then((r) => r.json())
      .then(setFeed)
      .catch(console.error);
    const interval = setInterval(() => {
      fetch("/api/chat/feed").then((r) => r.json()).then(setFeed).catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!savedToken) return;
    const es = new EventSource(`/api/chat/stream?token=${savedToken}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, { role: "agent", text: data.response }]);
      setSending(false);
    };
    return () => es.close();
  }, [savedToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    localStorage.setItem("condor_token", tokenInput);
    setSavedToken(tokenInput);
  };

  const disconnect = () => {
    localStorage.removeItem("condor_token");
    setSavedToken("");
    setMessages([]);
  };

  const send = async () => {
    if (!input.trim() || !savedToken || sending) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setSending(true);
    setInput("");
    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: savedToken, message: msg }),
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      {/* Public feed */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Feed</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Real-time agent activity from connected Condor instances</p>
          </div>
          <Badge variant="secondary">{feed.length} messages</Badge>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-2">
            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <span className="text-4xl">📡</span>
                <h3 className="font-semibold">No public messages yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Connect your Condor instance and enable{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">/webchat on</code>
                </p>
              </div>
            ) : (
              feed.map((msg) => <FeedCard key={msg.id} msg={msg} />)
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Manual chat panel */}
      <div className="w-[360px] shrink-0 flex flex-col">
        <Card className="flex flex-col flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Chat with your agent</CardTitle>
              {savedToken && (
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={disconnect}>
                  Disconnect
                </Button>
              )}
            </div>
            {savedToken && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Connected
              </div>
            )}
          </CardHeader>

          <Separator />

          {!savedToken ? (
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
              <span className="text-3xl">🔑</span>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Connect your Condor</p>
                <p className="text-xs text-muted-foreground">
                  Run <code className="bg-muted px-1 py-0.5 rounded">/webtoken</code> in your Condor bot
                </p>
              </div>
              <div className="w-full space-y-2">
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && connect()}
                  placeholder="Paste your token..."
                  className="text-sm"
                />
                <Button onClick={connect} className="w-full" disabled={!tokenInput}>
                  Connect
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Send a message to your agent
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">·</span>
                          <span className="animate-bounce [animation-delay:100ms]">·</span>
                          <span className="animate-bounce [animation-delay:200ms]">·</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <Separator />
              <div className="p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask your agent..."
                  className="text-sm"
                  disabled={sending}
                />
                <Button onClick={send} disabled={sending || !input.trim()} size="sm">
                  Send
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
