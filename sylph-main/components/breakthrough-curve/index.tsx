"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  className?: string;
  caption?: string;
}

const W = 640;
const H = 320;
const PAD_L = 56;
const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 44;

const tMin = 0;
const tMax = 60;
const yMin = 0;
const yMax = 1;

const xScale = (t: number) => PAD_L + ((t - tMin) / (tMax - tMin)) * (W - PAD_L - PAD_R);
const yScale = (y: number) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

function sigmoid(t: number, t50: number, k: number) {
  return 1 / (1 + Math.exp(-k * (t - t50)));
}

function noisy(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return (x - Math.floor(x) - 0.5) * 0.04;
}

export const BreakthroughCurve = ({ className, caption }: Props) => {
  const [hover, setHover] = useState<{ t: number; y: number } | null>(null);
  const id = useId();
  const t50 = 32;
  const k = 0.18;

  const points = useMemo(() => {
    const arr: Array<{ t: number; y: number }> = [];
    for (let i = 0; i <= 30; i++) {
      const t = (i / 30) * tMax;
      const y = Math.max(0, Math.min(1, sigmoid(t, t50, k) + noisy(i + 1)));
      arr.push({ t, y });
    }
    return arr;
  }, []);

  const fitPath = useMemo(() => {
    const segs: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tMax;
      const y = sigmoid(t, t50, k);
      segs.push(`${i === 0 ? "M" : "L"}${xScale(t).toFixed(2)} ${yScale(y).toFixed(2)}`);
    }
    return segs.join(" ");
  }, []);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [0, 15, 30, 45, 60];
  const t05 = -Math.log(1 / 0.05 - 1) / k + t50;
  const t95 = -Math.log(1 / 0.95 - 1) / k + t50;

  return (
    <figure className={cn("not-prose !my-8 !border-0", className)}>
      <div className="overflow-x-auto rounded-base border border-border bg-background p-3">
        <svg
          role="img"
          aria-labelledby={`${id}-title`}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full text-foreground"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const px = ((e.clientX - rect.left) / rect.width) * W;
            const t = Math.max(tMin, Math.min(tMax, ((px - PAD_L) / (W - PAD_L - PAD_R)) * tMax));
            const y = sigmoid(t, t50, k);
            setHover({ t, y });
          }}
        >
          <title id={`${id}-title`}>CO₂ breakthrough curve with LDF model fit</title>

          {yTicks.map((v) => (
            <g key={`y-${v}`}>
              <line x1={PAD_L} y1={yScale(v)} x2={W - PAD_R} y2={yScale(v)} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
              <text x={PAD_L - 8} y={yScale(v) + 3} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.55">
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {xTicks.map((v) => (
            <g key={`x-${v}`}>
              <line x1={xScale(v)} y1={H - PAD_B} x2={xScale(v)} y2={H - PAD_B + 4} stroke="currentColor" strokeOpacity="0.4" />
              <text x={xScale(v)} y={H - PAD_B + 16} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.55">
                {v}
              </text>
            </g>
          ))}

          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.55">
            time (min)
          </text>
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="currentColor"
            fillOpacity="0.55"
            transform={`rotate(-90 14 ${H / 2})`}
          >
            C / C₀
          </text>

          <line x1={xScale(t05)} y1={PAD_T} x2={xScale(t05)} y2={H - PAD_B} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="3 3" />
          <line x1={xScale(t95)} y1={PAD_T} x2={xScale(t95)} y2={H - PAD_B} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="3 3" />
          <text x={xScale(t05) + 4} y={PAD_T + 12} fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.6">
            t₅
          </text>
          <text x={xScale(t95) + 4} y={PAD_T + 12} fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.6">
            t₉₅
          </text>

          <path d={fitPath} fill="none" stroke="var(--accent)" strokeWidth="1.75" />

          {points.map((p) => (
            <circle key={`pt-${p.t.toFixed(3)}`} cx={xScale(p.t)} cy={yScale(p.y)} r="2.5" fill="var(--bg)" stroke="currentColor" strokeWidth="1.25" />
          ))}

          {hover && (
            <g>
              <line x1={xScale(hover.t)} y1={PAD_T} x2={xScale(hover.t)} y2={H - PAD_B} stroke="var(--accent)" strokeOpacity="0.4" />
              <circle cx={xScale(hover.t)} cy={yScale(hover.y)} r="4" fill="var(--accent)" />
              <g transform={`translate(${Math.min(W - PAD_R - 110, xScale(hover.t) + 8)}, ${Math.max(PAD_T + 4, yScale(hover.y) - 28)})`}>
                <rect width="106" height="34" rx="4" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.2" />
                <text x="8" y="14" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" fillOpacity="0.6">
                  t = {hover.t.toFixed(1)} min
                </text>
                <text x="8" y="27" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor">
                  C/C₀ = {hover.y.toFixed(3)}
                </text>
              </g>
            </g>
          )}

          <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="currentColor" strokeOpacity="0.4" />
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="currentColor" strokeOpacity="0.4" />
        </svg>
      </div>
      <figcaption className="mt-2 px-1 text-muted text-small">
        {caption ?? "Simulated breakthrough curve. Open circles: experimental points. Solid line: LDF model fit. Dashed lines mark t₅ and t₉₅."}
      </figcaption>
    </figure>
  );
};
