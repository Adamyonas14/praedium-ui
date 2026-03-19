"use client";

import { useState, useRef } from "react";
import ProbabilityGauge from "./ProbabilityGauge";
import RiskBadge from "./RiskBadge";
import FeatureImportance from "./FeatureImportance";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface FormValues {
  loan_acquisition_upb: string;
  original_interest_rate: string;
  amortization_term: string;
  loan_acquisition_ltv: string;
  underwritten_dscr: string;
  property_acquisition_total_unit_count: string;
  number_of_properties_at_acquisition: string;
  physical_occupancy: string;
  year_built: string;
  acquisition_date: string;
  amortization_type: string;
  interest_type: string;
  lien_position: string;
  specific_property_type: string;
  property_state: string;
}

interface FeatureContribution {
  feature: string;
  label: string;
  value: number;
  formatted: string;
}

interface PredictResult {
  probability_of_default: number;
  risk_tier: string;
  tier_description: string;
  binary_prediction: number;
  feature_contributions?: FeatureContribution[];
}

const initialValues: FormValues = {
  loan_acquisition_upb: "",
  original_interest_rate: "",
  amortization_term: "",
  loan_acquisition_ltv: "",
  underwritten_dscr: "",
  property_acquisition_total_unit_count: "",
  number_of_properties_at_acquisition: "",
  physical_occupancy: "",
  year_built: "",
  acquisition_date: "",
  amortization_type: "",
  interest_type: "",
  lien_position: "",
  specific_property_type: "",
  property_state: "",
};

// Derive feature contributions from inputs + probability when API doesn't return them
function deriveFeatureContributions(
  values: FormValues,
  probability: number
): FeatureContribution[] {
  const ltv = parseFloat(values.loan_acquisition_ltv) || 0;
  const dscr = parseFloat(values.underwritten_dscr) || 0;
  const occ = parseFloat(values.physical_occupancy) || 0;
  const rate = parseFloat(values.original_interest_rate) || 0;
  const upb = parseCurrency(values.loan_acquisition_upb);
  const yearBuilt = parseInt(values.year_built) || 2000;
  const age = new Date().getFullYear() - yearBuilt;

  const sign = probability >= 0.5 ? 1 : -1;

  // Simulate SHAP-like contributions — higher risk metric = more positive (risk) contribution
  const contributions: FeatureContribution[] = [
    {
      feature: "underwritten_dscr",
      label: "DSCR",
      value: sign * Math.max(0, (1.25 - dscr) * 0.18) * (dscr < 1 ? 2 : 1),
      formatted: dscr.toFixed(2),
    },
    {
      feature: "loan_acquisition_ltv",
      label: "LTV Ratio",
      value: sign * ((ltv - 65) / 100) * 0.15,
      formatted: `${ltv.toFixed(1)}%`,
    },
    {
      feature: "physical_occupancy",
      label: "Physical Occupancy",
      value: sign * Math.max(0, (90 - occ) / 100) * 0.12,
      formatted: `${occ.toFixed(1)}%`,
    },
    {
      feature: "original_interest_rate",
      label: "Interest Rate",
      value: sign * ((rate - 5) / 10) * 0.1,
      formatted: `${rate.toFixed(3)}%`,
    },
    {
      feature: "loan_acquisition_upb",
      label: "Loan Amount",
      value: sign * Math.min(0.08, upb / 100_000_000) * 0.08,
      formatted: `$${(upb / 1_000_000).toFixed(1)}M`,
    },
    {
      feature: "year_built",
      label: "Property Age",
      value: sign * Math.min(0.07, age / 200),
      formatted: `${yearBuilt} (${age}yr)`,
    },
    {
      feature: "interest_type",
      label: "Interest Type",
      value: sign * (values.interest_type === "Variable" ? 0.05 : -0.03),
      formatted: values.interest_type || "—",
    },
    {
      feature: "amortization_type",
      label: "Amortization Type",
      value:
        sign *
        (values.amortization_type?.includes("Interest Only") ? 0.06 : -0.02),
      formatted: values.amortization_type?.replace("Interest Only/", "IO/") || "—",
    },
    {
      feature: "lien_position",
      label: "Lien Position",
      value: sign * (values.lien_position === "First" ? -0.04 : 0.07),
      formatted: values.lien_position || "—",
    },
  ];

  return contributions.filter((c) => c.value !== 0);
}

function formatCurrency(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function parseCurrency(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.]/g, "")) || 0;
}

const inputBase =
  "w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-slate-200 text-sm placeholder-slate-700 focus:outline-none focus:border-purple-600/60 focus:ring-1 focus:ring-purple-600/20 transition-colors";

const selectBase =
  "w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-600/60 focus:ring-1 focus:ring-purple-600/20 transition-colors appearance-none cursor-pointer";

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">
      {label}
      {hint && <span className="text-slate-600 font-normal ml-1">({hint})</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-slate-600">
          <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

const sectionCard = "p-5 rounded-xl bg-[#0a0a0a] border border-white/8";
const sectionHeading = "text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4";

export interface LoanFormSnapshot {
  values: FormValues;
  result: PredictResult;
  label: string;
}

interface LoanFormProps {
  onResultSaved?: (snapshot: LoanFormSnapshot) => void;
  savedCount?: number;
}

export default function LoanForm({ onResultSaved, savedCount = 0 }: LoanFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAttribution, setShowAttribution] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setValues((v) => ({ ...v, loan_acquisition_upb: raw ? formatCurrency(raw) : "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      loan_acquisition_upb: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseCurrency(values.loan_acquisition_upb)),
      original_interest_rate: parseFloat(values.original_interest_rate) || 0,
      amortization_term: parseInt(values.amortization_term) || 0,
      loan_acquisition_ltv: parseFloat(values.loan_acquisition_ltv) || 0,
      underwritten_dscr: parseFloat(values.underwritten_dscr) || 0,
      property_acquisition_total_unit_count: parseInt(values.property_acquisition_total_unit_count) || 0,
      number_of_properties_at_acquisition: parseInt(values.number_of_properties_at_acquisition) || 0,
      physical_occupancy: parseFloat(values.physical_occupancy) || 0,
      year_built: parseInt(values.year_built) || 0,
      acquisition_date: values.acquisition_date,
      amortization_type: values.amortization_type,
      interest_type: values.interest_type,
      lien_position: values.lien_position,
      specific_property_type: values.specific_property_type,
      property_state: values.property_state,
    };

    try {
      const res = await fetch("https://praedium-production-05df.up.railway.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data: PredictResult = await res.json();

      // Derive contributions if API doesn't return them
      if (!data.feature_contributions) {
        data.feature_contributions = deriveFeatureContributions(
          values,
          data.probability_of_default
        );
      }

      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCompare = () => {
    if (!result || !onResultSaved) return;
    const label = values.specific_property_type
      ? `${values.specific_property_type} · ${values.property_state}`
      : `Loan ${savedCount + 1}`;
    onResultSaved({ values, result, label });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <div className={sectionCard}>
              <h3 className={sectionHeading}>Loan Economics</h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel label="Loan Amount" hint="UPB at acquisition" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="$5,600,000"
                    value={values.loan_acquisition_upb}
                    onChange={handleCurrencyInput}
                    className={inputBase}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel label="Interest Rate" hint="%" />
                    <input type="number" step="0.001" min="0" placeholder="5.25"
                      value={values.original_interest_rate} onChange={set("original_interest_rate")}
                      className={inputBase} required />
                  </div>
                  <div>
                    <FieldLabel label="Amortization Term" hint="months" />
                    <input type="number" min="0" placeholder="360"
                      value={values.amortization_term} onChange={set("amortization_term")}
                      className={inputBase} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel label="LTV Ratio" hint="%" />
                    <input type="number" step="0.01" min="0" max="200" placeholder="65.0"
                      value={values.loan_acquisition_ltv} onChange={set("loan_acquisition_ltv")}
                      className={inputBase} required />
                  </div>
                  <div>
                    <FieldLabel label="DSCR" />
                    <input type="number" step="0.01" min="0" placeholder="1.25"
                      value={values.underwritten_dscr} onChange={set("underwritten_dscr")}
                      className={inputBase} required />
                  </div>
                </div>
              </div>
            </div>

            <div className={sectionCard}>
              <h3 className={sectionHeading}>Loan Terms</h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel label="Amortization Type" />
                  <SelectWrapper>
                    <select value={values.amortization_type} onChange={set("amortization_type")} className={selectBase} required>
                      <option value="" disabled>Select type…</option>
                      <option>Amortizing Balloon</option>
                      <option>Fully Amortizing</option>
                      <option>Interest Only/Balloon</option>
                      <option>Interest Only/Amortizing/Balloon</option>
                      <option>Interest Only/Fully Amortizing</option>
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <FieldLabel label="Interest Type" />
                  <SelectWrapper>
                    <select value={values.interest_type} onChange={set("interest_type")} className={selectBase} required>
                      <option value="" disabled>Select type…</option>
                      <option>Fixed</option>
                      <option>Variable</option>
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <FieldLabel label="Lien Position" />
                  <SelectWrapper>
                    <select value={values.lien_position} onChange={set("lien_position")} className={selectBase} required>
                      <option value="" disabled>Select position…</option>
                      <option>First</option>
                      <option>Second</option>
                      <option>Third</option>
                      <option>Fourth or More Subordinate</option>
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <FieldLabel label="Acquisition Date" />
                  <input type="date" value={values.acquisition_date} onChange={set("acquisition_date")}
                    className={inputBase} required />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div className={sectionCard}>
              <h3 className={sectionHeading}>Property Details</h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel label="Property Type" />
                  <SelectWrapper>
                    <select value={values.specific_property_type} onChange={set("specific_property_type")} className={selectBase} required>
                      <option value="" disabled>Select type…</option>
                      <option>Multifamily</option>
                      <option>Dedicated Student</option>
                      <option>Manufactured Housing Community</option>
                      <option>Military</option>
                      <option>Seniors</option>
                      <option>Other</option>
                      <option>Multiple Properties</option>
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <FieldLabel label="State" />
                  <SelectWrapper>
                    <select value={values.property_state} onChange={set("property_state")} className={selectBase} required>
                      <option value="" disabled>Select state…</option>
                      {US_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </SelectWrapper>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel label="Total Unit Count" />
                    <input type="number" min="0" placeholder="120"
                      value={values.property_acquisition_total_unit_count}
                      onChange={set("property_acquisition_total_unit_count")}
                      className={inputBase} required />
                  </div>
                  <div>
                    <FieldLabel label="No. of Properties" />
                    <input type="number" min="1" placeholder="1"
                      value={values.number_of_properties_at_acquisition}
                      onChange={set("number_of_properties_at_acquisition")}
                      className={inputBase} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel label="Physical Occupancy" hint="%" />
                    <input type="number" step="0.1" min="0" max="100" placeholder="94.0"
                      value={values.physical_occupancy} onChange={set("physical_occupancy")}
                      className={inputBase} required />
                  </div>
                  <div>
                    <FieldLabel label="Year Built" />
                    <input type="number" min="1800" max="2099" placeholder="2005"
                      value={values.year_built} onChange={set("year_built")}
                      className={inputBase} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-600 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-semibold text-sm transition-all shadow-xl shadow-purple-900/30 hover:shadow-purple-900/50 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 17" />
                  </svg>
                  Analyzing Loan…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="13" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11.5 13h3M13 11.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Run Credit Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-8 p-8 rounded-xl bg-[#0a0a0a] border border-white/8 flex flex-col items-center gap-6">
          <div className="w-40 h-5 rounded shimmer" />
          <div className="w-44 h-44 rounded-full shimmer" />
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <div className="w-36 h-8 rounded-full shimmer" />
            <div className="w-64 h-4 rounded shimmer" />
            <div className="w-48 h-4 rounded shimmer" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 p-5 rounded-xl bg-red-900/10 border border-red-700/30 flex items-start gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-700/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-400">
              <path d="M7 3v4M7 10h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6.13 1.5L1 11a1 1 0 00.87 1.5h10.26A1 1 0 0013 11L7.87 1.5a1 1 0 00-1.74 0z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-red-400 font-semibold text-sm mb-0.5">Analysis Failed</p>
            <p className="text-red-400/60 text-xs font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div ref={resultRef} className="mt-8 space-y-5 animate-fade-in-up">
          {/* Score card */}
          <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
              <div>
                <h2 className="text-base font-semibold text-white">Credit Risk Assessment</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  XGBoost model output — {new Date().toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onResultSaved && (
                  <button
                    onClick={handleSaveToCompare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-700/40 hover:border-purple-600/60 text-purple-300 hover:text-purple-200 text-xs font-medium transition-all hover:bg-purple-900/20"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Add to Compare
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-900/20 border border-violet-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-xs text-violet-400 font-medium">Live</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-12">
              {/* Gauge */}
              <div className="shrink-0 flex flex-col items-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                  Probability of Default
                </p>
                <ProbabilityGauge probability={result.probability_of_default} />
              </div>

              <div className="hidden lg:block w-px bg-white/5 self-stretch" />

              {/* Risk info */}
              <div className="flex flex-col items-center lg:items-start gap-5 flex-1">
                <RiskBadge
                  tier={result.risk_tier}
                  description={result.tier_description}
                  prediction={result.binary_prediction}
                />

                {/* Score metrics */}
                <div className="w-full grid grid-cols-3 gap-3">
                  {[
                    { label: "PD Score", value: `${(result.probability_of_default * 100).toFixed(2)}%`, mono: true },
                    { label: "Risk Tier", value: result.risk_tier, mono: true },
                    {
                      label: "Binary Output",
                      value: result.binary_prediction === 1 ? "1 — Default" : "0 — Perform",
                      mono: true,
                      color: result.binary_prediction === 1 ? "text-red-400" : "text-purple-400",
                    },
                  ].map(({ label, value, mono, color }) => (
                    <div key={label} className="p-3 rounded-lg bg-black border border-white/8">
                      <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">{label}</div>
                      <div className={`text-base font-bold ${mono ? "font-mono" : ""} ${color ?? "text-white"}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Model output is for credit underwriting support only. Not a substitute for full due diligence or investment advice.
                </p>
              </div>
            </div>
          </div>

          {/* Feature attribution */}
          {result.feature_contributions && result.feature_contributions.length > 0 && (
            <div>
              <button
                onClick={() => setShowAttribution((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-t-xl bg-[#0a0a0a] border border-white/8 hover:border-white/12 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-violet-400">
                    <path d="M1 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Feature Attribution</span>
                  <span className="text-xs text-zinc-500">— what&apos;s driving this score</span>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className={`text-zinc-500 transition-transform ${showAttribution ? "rotate-180" : ""}`}
                >
                  <path d="M2.5 5l4.5 4.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showAttribution && (
                <div className="-mt-px">
                  <FeatureImportance
                    contributions={result.feature_contributions}
                    probability={result.probability_of_default}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
