"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── types ─────────────────────────────────────────────────────────────────────

interface CexKey {
  id: string;
  exchange: string;
  apiKey: string;
  label: string | null;
  createdAt: string;
}

interface DexWallet {
  id: string;
  chain: string;
  address: string;
  label: string | null;
  createdAt: string;
}

const CEX_OPTIONS = ["binance","kucoin","coinbase","kraken","bybit","okx","gate","htx","mexc","hyperliquid"];
const DEX_OPTIONS = ["solana","ethereum","arbitrum","base","optimism","polygon","avalanche","bsc"];

// ── helpers ───────────────────────────────────────────────────────────────────

function truncate(s: string, front = 6, back = 4) {
  if (s.length <= front + back + 3) return s;
  return `${s.slice(0, front)}...${s.slice(-back)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

// ── connect panel ─────────────────────────────────────────────────────────────

function ConnectPanel({ onConnect }: { onConnect: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="max-w-sm space-y-4 pt-12">
      <div>
        <h1 className="text-xl font-semibold">Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your Condor instance to manage exchange keys and wallets.
        </p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Run{" "}
        <code className="bg-secondary px-1 py-0.5 rounded">/webtoken</code>
        {" "}in your Condor bot to get a token.
      </p>
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && val && onConnect(val)}
          placeholder="Paste your token..."
          className="h-8 text-xs"
        />
        <Button onClick={() => onConnect(val)} disabled={!val} size="sm" className="h-8 text-xs shrink-0">
          Connect
        </Button>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function KeysPage() {
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cex, setCex]       = useState<CexKey[]>([]);
  const [dex, setDex]       = useState<DexWallet[]>([]);
  const [error, setError]   = useState("");

  // CEX form
  const [cexExchange, setCexExchange] = useState(CEX_OPTIONS[0]);
  const [cexKey,      setCexKey]      = useState("");
  const [cexSecret,   setCexSecret]   = useState("");
  const [cexLabel,    setCexLabel]    = useState("");
  const [cexSecret_visible, setCexSecretVisible] = useState(false);
  const [cexAdding,   setCexAdding]   = useState(false);

  // DEX form
  const [dexChain,    setDexChain]    = useState(DEX_OPTIONS[0]);
  const [dexAddress,  setDexAddress]  = useState("");
  const [dexLabel,    setDexLabel]    = useState("");
  const [dexAdding,   setDexAdding]   = useState(false);

  // Load token from localStorage
  useEffect(() => {
    const t = localStorage.getItem("condor_token");
    if (t) setToken(t);
    setLoading(false);
  }, []);

  // Fetch keys when token is set
  useEffect(() => {
    if (!token) return;
    fetch(`/api/keys?token=${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then(({ cex, dex }) => { setCex(cex); setDex(dex); })
      .catch(() => setError("Invalid token. Please reconnect."));
  }, [token]);

  const connect = (t: string) => {
    localStorage.setItem("condor_token", t);
    setToken(t);
  };

  const disconnect = () => {
    localStorage.removeItem("condor_token");
    setToken(null);
    setCex([]); setDex([]);
  };

  // ── CEX actions ──

  const addCex = async () => {
    if (!cexKey.trim() || !cexSecret.trim()) return;
    setCexAdding(true);
    const r = await fetch("/api/keys/cex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, exchange: cexExchange, apiKey: cexKey, apiSecret: cexSecret, label: cexLabel }),
    });
    if (r.ok) {
      const { id } = await r.json();
      setCex((p) => [...p, { id, exchange: cexExchange, apiKey: cexKey, label: cexLabel || null, createdAt: new Date().toISOString() }]);
      setCexKey(""); setCexSecret(""); setCexLabel("");
    } else {
      const { error } = await r.json();
      setError(error ?? "Failed to add key");
    }
    setCexAdding(false);
  };

  const deleteCex = async (id: string) => {
    await fetch(`/api/keys/cex/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setCex((p) => p.filter((k) => k.id !== id));
  };

  // ── DEX actions ──

  const addDex = async () => {
    if (!dexAddress.trim()) return;
    setDexAdding(true);
    const r = await fetch("/api/keys/dex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, chain: dexChain, address: dexAddress, label: dexLabel }),
    });
    if (r.ok) {
      const { id } = await r.json();
      setDex((p) => [...p, { id, chain: dexChain, address: dexAddress, label: dexLabel || null, createdAt: new Date().toISOString() }]);
      setDexAddress(""); setDexLabel("");
    } else {
      const { error } = await r.json();
      setError(error ?? "Failed to add wallet");
    }
    setDexAdding(false);
  };

  const deleteDex = async (id: string) => {
    await fetch(`/api/keys/dex/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setDex((p) => p.filter((w) => w.id !== id));
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) return null;
  if (!token) return <ConnectPanel onConnect={connect} />;

  return (
    <div className="max-w-2xl space-y-10">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold">Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read-only CEX keys and DEX wallet addresses for trade verification.
          </p>
        </div>
        <button onClick={disconnect} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Disconnect
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}
          <button onClick={() => setError("")} className="ml-2 underline">dismiss</button>
        </p>
      )}

      {/* ── CEX ────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">CEX keys</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read-only API keys only — no withdrawal permissions required or stored.
          </p>
        </div>

        {/* Existing keys */}
        {cex.length > 0 && (
          <div className="rounded-lg border border-border/50 divide-y divide-border/30">
            {cex.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xs font-medium w-24 shrink-0 capitalize">{k.exchange}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    {truncate(k.apiKey, 8, 4)}
                  </span>
                  <CopyButton text={k.apiKey} />
                </div>
                {k.label && (
                  <span className="text-xs text-muted-foreground shrink-0">{k.label}</span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(k.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteCex(k.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        <div className="rounded-lg border border-border/50 border-dashed p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Add exchange key</p>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={cexExchange}
              onChange={(e) => setCexExchange(e.target.value)}
              className="h-8 text-xs rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CEX_OPTIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <Input
              value={cexLabel}
              onChange={(e) => setCexLabel(e.target.value)}
              placeholder="Label (optional)"
              className="h-8 text-xs"
            />
          </div>
          <Input
            value={cexKey}
            onChange={(e) => setCexKey(e.target.value)}
            placeholder="API key"
            className="h-8 text-xs font-mono"
          />
          <div className="relative">
            <Input
              type={cexSecret_visible ? "text" : "password"}
              value={cexSecret}
              onChange={(e) => setCexSecret(e.target.value)}
              placeholder="API secret (read-only)"
              className="h-8 text-xs font-mono pr-9"
            />
            <button
              onClick={() => setCexSecretVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {cexSecret_visible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <Button
            onClick={addCex}
            disabled={cexAdding || !cexKey.trim() || !cexSecret.trim()}
            size="sm"
            className="h-7 text-xs gap-1.5"
          >
            <Plus size={12} /> Add key
          </Button>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* ── DEX ────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">DEX wallets</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Public addresses only — used to verify on-chain activity.
          </p>
        </div>

        {/* Existing wallets */}
        {dex.length > 0 && (
          <div className="rounded-lg border border-border/50 divide-y divide-border/30">
            {dex.map((w) => (
              <div key={w.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xs font-medium w-20 shrink-0 capitalize">{w.chain}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    {truncate(w.address, 8, 6)}
                  </span>
                  <CopyButton text={w.address} />
                </div>
                {w.label && (
                  <span className="text-xs text-muted-foreground shrink-0">{w.label}</span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(w.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteDex(w.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        <div className="rounded-lg border border-border/50 border-dashed p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Add wallet address</p>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={dexChain}
              onChange={(e) => setDexChain(e.target.value)}
              className="h-8 text-xs rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DEX_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Input
              value={dexLabel}
              onChange={(e) => setDexLabel(e.target.value)}
              placeholder="Label (optional)"
              className="h-8 text-xs"
            />
          </div>
          <Input
            value={dexAddress}
            onChange={(e) => setDexAddress(e.target.value)}
            placeholder="Public address"
            className="h-8 text-xs font-mono"
          />
          <Button
            onClick={addDex}
            disabled={dexAdding || !dexAddress.trim()}
            size="sm"
            className="h-7 text-xs gap-1.5"
          >
            <Plus size={12} /> Add wallet
          </Button>
        </div>
      </section>
    </div>
  );
}
