"use client";

import { useEffect, useRef, useState } from "react";

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

export default function ChatPage() {
  const [feed, setFeed] = useState<ChatMessage[]>([]);
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load token from localStorage
  useEffect(() => {
    const t = localStorage.getItem("condor_token") || "";
    setSavedToken(t);
  }, []);

  // Fetch public feed
  useEffect(() => {
    fetch("/api/chat/feed")
      .then((r) => r.json())
      .then(setFeed)
      .catch(console.error);
  }, []);

  // SSE stream for manual chat responses
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

  const saveToken = () => {
    localStorage.setItem("condor_token", token);
    setSavedToken(token);
  };

  const send = async () => {
    if (!input.trim() || !savedToken) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setSending(true);
    setInput("");
    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: savedToken, message: input }),
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Public feed */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Live Feed</h2>
        {feed.map((msg) => (
          <div key={msg.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="text-emerald-400">{msg.user?.username || "anon"}</span>
              {msg.exchange && <span>· {msg.exchange}</span>}
              {msg.pair && <span>{msg.pair}</span>}
              {msg.pnlSnapshot !== undefined && (
                <span className={msg.pnlSnapshot >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {msg.pnlSnapshot >= 0 ? "+" : ""}{msg.pnlSnapshot.toFixed(2)}%
                </span>
              )}
              <span className="ml-auto">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
            {msg.prompt && (
              <p className="text-zinc-400 text-sm border-l-2 border-zinc-700 pl-3">{msg.prompt}</p>
            )}
            <p className="text-zinc-100 text-sm">{msg.response}</p>
          </div>
        ))}
        {feed.length === 0 && (
          <p className="text-zinc-600 text-sm">No public messages yet. Connect your Condor to start.</p>
        )}
      </div>

      {/* Manual chat */}
      <div className="w-96 flex flex-col border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-300">Chat with your agent</h2>
        </div>

        {!savedToken ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
            <p className="text-zinc-400 text-sm text-center">
              Run <code className="text-emerald-400">/webtoken</code> in Condor, then paste your token here
            </p>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500"
            />
            <button onClick={saveToken}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded px-3 py-2 transition-colors">
              Connect
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <span className={`inline-block max-w-[85%] rounded-lg px-3 py-2 ${
                    m.role === "user"
                      ? "bg-emerald-900 text-emerald-100"
                      : "bg-zinc-800 text-zinc-100"
                  }`}>
                    {m.text}
                  </span>
                </div>
              ))}
              {sending && (
                <div className="text-left text-sm">
                  <span className="inline-block bg-zinc-800 text-zinc-400 rounded-lg px-3 py-2">
                    thinking...
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-zinc-800 p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask your agent..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500"
              />
              <button onClick={send} disabled={sending}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm rounded px-3 py-2 transition-colors">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
