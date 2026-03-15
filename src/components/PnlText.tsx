import { cn } from "@/lib/utils";

interface PnlTextProps {
  value: number;
  /** Show % suffix (default true — for percentage PnL). Pass false for raw dollar values. */
  percent?: boolean;
  decimals?: number;
  className?: string;
}

/** Coloured PnL display. Use percent=false for raw dollar amounts. */
export function PnlText({ value, percent = true, decimals = 2, className }: PnlTextProps) {
  const formatted = `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}${percent ? "%" : ""}`;
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value >= 0 ? "text-emerald-500" : "text-red-400",
        className
      )}
    >
      {formatted}
    </span>
  );
}
