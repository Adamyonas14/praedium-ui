interface RiskBadgeProps {
  tier: string;
  description: string;
  prediction: number;
}

const tierConfig: Record<
  string,
  { color: string; bg: string; border: string; ring: string; dot: string }
> = {
  Low: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    ring: "ring-green-500/20",
    dot: "bg-green-400",
  },
  Moderate: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    ring: "ring-yellow-500/20",
    dot: "bg-yellow-400",
  },
  Elevated: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    ring: "ring-orange-500/20",
    dot: "bg-orange-400",
  },
  High: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    ring: "ring-red-500/20",
    dot: "bg-red-400",
  },
};

export default function RiskBadge({ tier, description, prediction }: RiskBadgeProps) {
  const cfg = tierConfig[tier] ?? tierConfig["Moderate"];

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in-up">
      {/* Main tier badge */}
      <div
        className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border ${cfg.bg} ${cfg.border} ring-2 ${cfg.ring}`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
        <span className={`text-base font-bold tracking-wide uppercase ${cfg.color}`}>
          {tier} Risk
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Binary prediction */}
      <div className="flex items-center gap-3 mt-1">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${
            prediction === 1
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-green-500/10 border-green-500/30 text-green-400"
          }`}
        >
          {prediction === 1 ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2v5M7 10h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              Predicted: Default
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              Predicted: Performing
            </>
          )}
        </div>
      </div>
    </div>
  );
}
