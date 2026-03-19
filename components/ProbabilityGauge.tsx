"use client";

import { useEffect, useRef } from "react";

interface ProbabilityGaugeProps {
  probability: number; // 0-1
}

export default function ProbabilityGauge({ probability }: ProbabilityGaugeProps) {
  const pct = Math.round(probability * 100);
  const animRef = useRef<SVGCircleElement>(null);

  // SVG arc parameters
  const size = 200;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const radius = 80;
  const strokeWidth = 13;

  // We use a 3/4 arc (270 degrees), starting at 135deg, ending at 45deg
  const arcAngleDeg = 270;
  const startAngleDeg = 135;
  const endAngleDeg = startAngleDeg + arcAngleDeg;

  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcAngleDeg / 360) * circumference;
  const fillLength = (pct / 100) * arcLength;
  const dashOffset = arcLength - fillLength;

  // Color gradient based on probability
  const getColor = (p: number) => {
    if (p < 25) return "#22c55e"; // green
    if (p < 50) return "#eab308"; // yellow
    if (p < 75) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const color = getColor(pct);

  // Convert polar angle to cartesian
  const polarToCart = (angleDeg: number, r: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Build the arc path
  const buildArc = (r: number, startDeg: number, sweepDeg: number) => {
    const start = polarToCart(startDeg, r);
    const end = polarToCart(startDeg + sweepDeg, r);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const trackPath = buildArc(radius, startAngleDeg, arcAngleDeg);

  // For filled arc we use strokeDasharray
  const needleAngle = startAngleDeg + (pct / 100) * arcAngleDeg;
  const needleTip = polarToCart(needleAngle, radius - 4);
  const needleBase1 = polarToCart(needleAngle - 90, 6);
  const needleBase2 = polarToCart(needleAngle + 90, 6);

  useEffect(() => {
    const el = animRef.current;
    if (!el) return;
    el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={size}
          height={size * 0.75}
          viewBox={`0 0 ${size} ${size * 0.8}`}
          className="overflow-visible"
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#1a1140"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <path
            ref={animRef}
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={`${dashOffset}`}
            filter="url(#gaugeGlow)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease",
            }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = startAngleDeg + (tick / 100) * arcAngleDeg;
            const outer = polarToCart(angle, radius + strokeWidth / 2 + 4);
            const inner = polarToCart(angle, radius - strokeWidth / 2 - 4);
            return (
              <line
                key={tick}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="#2d1b69"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Tick labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = startAngleDeg + (tick / 100) * arcAngleDeg;
            const pos = polarToCart(angle, radius + strokeWidth / 2 + 18);
            return (
              <text
                key={tick}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fill="#4c1d95"
                fontFamily="monospace"
              >
                {tick}
              </text>
            );
          })}

          {/* Needle */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={color}
            filter="url(#glow)"
            style={{
              transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Center hub */}
          <circle cx={cx} cy={cy} r="5" fill="#12102a" stroke={color} strokeWidth="2" />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div
            className="text-4xl font-bold font-mono tabular-nums leading-none"
            style={{ color }}
          >
            {pct}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tracking-widest uppercase">
            Prob. of Default
          </div>
        </div>
      </div>
    </div>
  );
}
