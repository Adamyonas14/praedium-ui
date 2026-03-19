"use client";

import { useState } from "react";
import LoanForm, { LoanFormSnapshot } from "./LoanForm";

const tierColor: Record<string, { text: string; bg: string; border: string }> = {
  Low:      { text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  Moderate: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  Elevated: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  High:     { text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
};

function GaugeMini({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const color =
    pct < 25 ? "#22c55e" : pct < 50 ? "#eab308" : pct < 75 ? "#f97316" : "#ef4444";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const arcLen = (270 / 360) * circumference;
  const fill = (pct / 100) * arcLen;
  const offset = arcLen - fill;

  const cx = 48, cy = 54;
  const toCart = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };
  const arc = (startDeg: number, sweep: number) => {
    const s = toCart(startDeg);
    const e = toCart(startDeg + sweep);
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={96} height={72} viewBox="0 0 96 78" className="overflow-visible">
        <path d={arc(135, 270)} fill="none" stroke="#1e1b40" strokeWidth={8} strokeLinecap="round" />
        <path
          d={arc(135, 270)}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}
          filter="url(#mg)"
        />
        <defs>
          <filter id="mg">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-0 inset-x-0 text-center">
        <div className="text-xl font-bold font-mono" style={{ color }}>{pct}%</div>
      </div>
    </div>
  );
}

function CompareCard({ snap, onRemove }: { snap: LoanFormSnapshot; onRemove: () => void }) {
  const { result, label, values } = snap;
  const cfg = tierColor[result.risk_tier] ?? tierColor["Moderate"];
  const pct = (result.probability_of_default * 100).toFixed(2);

  const metrics = [
    { label: "Loan Amount",   value: values.loan_acquisition_upb },
    { label: "LTV",           value: `${values.loan_acquisition_ltv}%` },
    { label: "DSCR",          value: values.underwritten_dscr },
    { label: "Rate",          value: `${values.original_interest_rate}%` },
    { label: "Occupancy",     value: `${values.physical_occupancy}%` },
    { label: "Property Type", value: values.specific_property_type },
    { label: "State",         value: values.property_state },
    { label: "Lien",          value: values.lien_position },
  ];

  return (
    <div className="flex flex-col rounded-xl bg-[#0d0d1a] border border-purple-900/20 overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-purple-900/20 flex items-center justify-between bg-[#0a0a18]">
        <span className="text-sm font-semibold text-white truncate max-w-[160px]">{label}</span>
        <button
          onClick={onRemove}
          className="text-slate-600 hover:text-slate-400 transition-colors ml-2 shrink-0"
          aria-label="Remove"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Gauge */}
      <div className="py-6 flex flex-col items-center gap-2 border-b border-purple-900/20">
        <GaugeMini probability={result.probability_of_default} />
        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
          {result.risk_tier} Risk
        </div>
        <div className="text-[10px] text-slate-500 font-mono">PD: {pct}%</div>
        <div className={`text-[10px] font-mono font-semibold ${result.binary_prediction === 1 ? "text-red-400" : "text-purple-400"}`}>
          {result.binary_prediction === 1 ? "Predicted: Default" : "Predicted: Performing"}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-2 flex-1">
        {metrics.map(({ label: l, value }) => (
          <div key={l} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{l}</span>
            <span className="text-slate-300 font-mono text-right truncate max-w-[120px]">{value || "—"}</span>
          </div>
        ))}
      </div>

      {/* Tier description */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-slate-600 leading-relaxed">{result.tier_description}</p>
      </div>
    </div>
  );
}

export default function LoanCompare() {
  const [snapshots, setSnapshots] = useState<LoanFormSnapshot[]>([]);
  const [view, setView] = useState<"form" | "compare">("form");

  const handleSave = (snap: LoanFormSnapshot) => {
    setSnapshots((prev) => {
      // Deduplicate by checking same values — just append with incremented label
      const label = `Loan ${prev.length + 1} · ${snap.values.specific_property_type || "?"} · ${snap.values.property_state || "?"}`;
      return [...prev, { ...snap, label }];
    });
  };

  const remove = (idx: number) =>
    setSnapshots((prev) => prev.filter((_, i) => i !== idx));

  // Best loan = lowest PD
  const bestIdx =
    snapshots.length > 1
      ? snapshots.reduce(
          (bi, s, i) =>
            s.result.probability_of_default < snapshots[bi].result.probability_of_default ? i : bi,
          0
        )
      : -1;

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setView("form")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "form"
              ? "bg-purple-900/30 border border-purple-700/40 text-purple-300"
              : "text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          Analyze Loan
        </button>
        <button
          onClick={() => setView("compare")}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "compare"
              ? "bg-purple-900/30 border border-purple-700/40 text-purple-300"
              : "text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          Compare
          {snapshots.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
              {snapshots.length}
            </span>
          )}
        </button>
        {snapshots.length === 0 && view === "form" && (
          <span className="text-xs text-slate-600 ml-2">
            Run an analysis, then click &quot;Add to Compare&quot; to build a comparison
          </span>
        )}
      </div>

      {view === "form" && (
        <LoanForm onResultSaved={handleSave} savedCount={snapshots.length} />
      )}

      {view === "compare" && (
        <div>
          {snapshots.length === 0 ? (
            <div className="text-center py-20 border border-purple-900/20 rounded-xl bg-[#0d0d1a]">
              <div className="w-12 h-12 rounded-xl bg-purple-900/20 border border-purple-800/20 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-purple-500">
                  <rect x="2" y="4" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="11" y="4" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">No loans to compare yet</p>
              <p className="text-slate-600 text-xs">
                Run analyses and click &quot;Add to Compare&quot; to populate this view.
              </p>
              <button
                onClick={() => setView("form")}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-900/20 border border-purple-700/30 text-purple-400 text-xs font-medium hover:bg-purple-900/30 transition-colors"
              >
                Go to Analyze
              </button>
            </div>
          ) : (
            <div>
              {/* Summary bar */}
              {snapshots.length > 1 && (
                <div className="mb-6 p-4 rounded-xl bg-[#0d0d1a] border border-purple-900/20 flex flex-wrap gap-6 items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Loans Compared</div>
                    <div className="text-lg font-bold text-white font-mono">{snapshots.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Avg. PD</div>
                    <div className="text-lg font-bold text-white font-mono">
                      {(
                        (snapshots.reduce((s, snap) => s + snap.result.probability_of_default, 0) /
                          snapshots.length) *
                        100
                      ).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Best Loan</div>
                    <div className="text-sm font-semibold text-purple-300 max-w-[200px] truncate">
                      {snapshots[bestIdx]?.label}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => setSnapshots([])}
                      className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* PD bar chart comparison */}
              <div className="mb-5 p-5 rounded-xl bg-[#0d0d1a] border border-purple-900/20">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">
                  PD Score Comparison
                </h3>
                <div className="space-y-3">
                  {snapshots.map((snap, i) => {
                    const pct = snap.result.probability_of_default * 100;
                    const color =
                      pct < 25 ? "from-green-800/60 to-green-500/70"
                      : pct < 50 ? "from-yellow-800/60 to-yellow-500/70"
                      : pct < 75 ? "from-orange-800/60 to-orange-500/70"
                      : "from-red-800/60 to-red-500/70";
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`text-slate-300 ${i === bestIdx ? "font-semibold" : ""}`}>
                            {i === bestIdx && <span className="text-purple-400 mr-1">★</span>}
                            {snap.label}
                          </span>
                          <span className="text-slate-400 font-mono">{pct.toFixed(2)}%</span>
                        </div>
                        <div className="h-5 rounded-md bg-[#07070e] overflow-hidden">
                          <div
                            className={`h-full rounded-md bg-gradient-to-r ${color} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cards grid */}
              <div
                className={`grid gap-4 ${
                  snapshots.length === 1 ? "max-w-xs" :
                  snapshots.length === 2 ? "grid-cols-2" :
                  snapshots.length === 3 ? "grid-cols-3" :
                  "grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {snapshots.map((snap, i) => (
                  <CompareCard
                    key={i}
                    snap={snap}
                    onRemove={() => remove(i)}
                  />
                ))}
                {/* Add another slot */}
                <button
                  onClick={() => setView("form")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-purple-900/30 hover:border-purple-700/40 bg-[#0d0d1a] hover:bg-purple-900/5 transition-all min-h-[280px] p-6"
                >
                  <div className="w-9 h-9 rounded-full border border-purple-800/40 flex items-center justify-center text-purple-600">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600">Add loan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
