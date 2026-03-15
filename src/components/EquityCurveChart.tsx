"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  AreaSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import { CHART_PALETTE } from "@/lib/constants";

interface Point { time: number; value: number }
interface SeriesData {
  entryId: string;
  agentName: string;
  username: string;
  points: Point[];
}
const RANGES = ["1D","7D","All"] as const;
type Range = typeof RANGES[number];

function filterByRange(points: Point[], range: Range): Point[] {
  if (range === "All") return points;
  const now = Date.now() / 1000;
  const cutoff = range === "1D" ? now - 86400 : now - 7 * 86400;
  return points.filter((p) => p.time >= cutoff);
}

interface Props {
  series: SeriesData[];
  height?: number;
}

export function EquityCurveChart({ series, height = 260 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [range, setRange] = useState<Range>("7D");

  useEffect(() => {
    if (!containerRef.current || series.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(148,163,184,0.7)",
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "rgba(148,163,184,0.3)", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "rgba(148,163,184,0.3)", width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
      height,
      width: containerRef.current.clientWidth,
    });

    chartRef.current = chart;

    series.forEach((s, i) => {
      const filtered = filterByRange(s.points, range);
      if (filtered.length === 0) return;

      const color = CHART_PALETTE[i % CHART_PALETTE.length];
      const isPositiveFinal = filtered[filtered.length - 1].value >= 0;

      const area = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: `${color}28`,
        bottomColor: `${color}04`,
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          minMove: 0.01,
          formatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
        },
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 3,
        lastValueVisible: true,
        priceLineVisible: false,
        title: "",
      });

      area.setData(filtered.map((p) => ({
        time: p.time as UTCTimestamp,
        value: p.value,
      })));

      if (i === 0) {
        area.createPriceLine({
          price: 0,
          color: "rgba(255,255,255,0.1)",
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: false,
          title: "",
        });
      }
    });

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (!chartRef.current || !containerRef.current) return;
      chartRef.current.resize(containerRef.current.clientWidth, height);
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [series, height, range]);

  return (
    <div>
      {/* Range selector */}
      <div className="flex items-center justify-end gap-1 px-4 pb-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded transition-colors",
              range === r
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
}
