"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  LineSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

interface SeriesPoint {
  time: number;
  value: number;
}

interface SeriesData {
  entryId: string;
  agentName: string;
  username: string;
  points: SeriesPoint[];
}

const PALETTE = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#a855f7", // purple
  "#ef4444", // red
  "#14b8a6", // teal
];

interface Props {
  series: SeriesData[];
  height?: number;
}

export function EquityCurveChart({ series, height = 260 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || series.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(148,163,184,0.8)",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(255,255,255,0.05)", style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: { color: "rgba(148,163,184,0.5)", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "rgba(148,163,184,0.5)", width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      height,
      width: containerRef.current.clientWidth,
    });

    chartRef.current = chart;

    series.forEach((s, i) => {
      if (s.points.length === 0) return;

      const color = PALETTE[i % PALETTE.length];

      const line = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        title: s.agentName,
        priceFormat: {
          type: "custom",
          minMove: 0.01,
          formatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
        },
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        lastValueVisible: true,
        priceLineVisible: false,
      });

      line.setData(
        s.points.map((p) => ({
          time: p.time as UTCTimestamp,
          value: p.value,
        }))
      );

      // Zero line on first series
      if (i === 0) {
        line.createPriceLine({
          price: 0,
          color: "rgba(255,255,255,0.15)",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
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
  }, [series, height]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
