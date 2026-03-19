"use client";

interface FeatureContribution {
  feature: string;
  label: string;
  value: number; // positive = drives default, negative = drives health
  formatted: string;
}

interface FeatureImportanceProps {
  contributions: FeatureContribution[];
  probability: number;
}

export default function FeatureImportance({ contributions, probability }: FeatureImportanceProps) {
  const sorted = [...contributions].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const maxAbs = Math.max(...sorted.map((c) => Math.abs(c.value)));

  return (
    <div className="rounded-xl bg-[#0a0a0a] border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Feature Attribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            What&apos;s driving this score
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/70" />
            Risk factor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/70" />
            Protective factor
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {sorted.map((feat) => {
          const pct = (Math.abs(feat.value) / maxAbs) * 100;
          const isRisk = feat.value > 0;

          return (
            <div key={feat.feature} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 font-medium">{feat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{feat.formatted}</span>
                  <span
                    className={`text-[10px] font-semibold font-mono ${
                      isRisk ? "text-red-400" : "text-purple-400"
                    }`}
                  >
                    {isRisk ? "+" : ""}{feat.value.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="relative h-5 rounded-md overflow-hidden bg-black">
                {/* Bar */}
                <div
                  className={`absolute top-0 h-full rounded-md transition-all duration-700 ${
                    isRisk
                      ? "bg-gradient-to-r from-red-800/60 to-red-500/70"
                      : "bg-gradient-to-r from-violet-900/60 to-purple-500/70"
                  }`}
                  style={{ width: `${pct}%` }}
                />
                {/* Direction arrow */}
                <div
                  className={`absolute inset-y-0 right-2 flex items-center text-[9px] font-mono ${
                    isRisk ? "text-red-300/60" : "text-purple-300/60"
                  }`}
                >
                  {isRisk ? "▲ Risk" : "▼ Safe"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="px-5 pb-4">
        <div className="p-3 rounded-lg bg-black border border-white/8 text-xs text-zinc-400 leading-relaxed">
          {probability >= 0.5 ? (
            <>
              <span className="text-red-400 font-semibold">Primary risk drivers: </span>
              {sorted
                .filter((f) => f.value > 0)
                .slice(0, 2)
                .map((f) => f.label)
                .join(" and ")}{" "}
              are the dominant factors pushing this loan&apos;s default probability above the threshold.
            </>
          ) : (
            <>
              <span className="text-purple-400 font-semibold">Credit strengths: </span>
              {sorted
                .filter((f) => f.value < 0)
                .slice(0, 2)
                .map((f) => f.label)
                .join(" and ")}{" "}
              are the primary factors supporting this loan&apos;s credit quality.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
