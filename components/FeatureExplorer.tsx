"use client";

import { useState } from "react";
import Image from "next/image";

const features = [
  { label: "Log Loan UPB",         file: "log_loan_acquisition_upb.png",              desc: "Distribution of loan size (log scale) by default outcome. Larger loans skew toward non-default due to institutional underwriting standards." },
  { label: "Interest Rate",        file: "original_interest_rate.png",                 desc: "Original note rate at origination. Higher rates often correlate with elevated default risk." },
  { label: "Amortization Term",    file: "amortization_term.png",                      desc: "Loan amortization length in months. Shorter terms indicate balloon structures with higher refinancing risk." },
  { label: "Acquisition LTV",      file: "loan_acquisition_ltv.png",                   desc: "Loan-to-value ratio at acquisition. Higher LTV signals less equity cushion and increased default probability." },
  { label: "Underwritten DSCR",    file: "underwritten_dscr.png",                      desc: "Debt service coverage ratio at underwriting. DSCR below 1.0x means income cannot cover debt payments — a strong default predictor." },
  { label: "Units at Acquisition", file: "property_acquisition_total_unit_count.png",  desc: "Total unit count at time of acquisition. Larger properties benefit from diversified income streams." },
  { label: "Number of Properties", file: "number_of_properties_at_acquisition.png",    desc: "Portfolio count at acquisition. Multi-property portfolios show different default dynamics than single-asset loans." },
  { label: "Occupancy",            file: "physical_occupancy.png",                     desc: "Physical occupancy rate at underwriting. Low occupancy is a leading indicator of income shortfalls and default." },
  { label: "Note Rate",            file: "note_rate.png",                              desc: "Effective note rate on the loan. Captures rate structure including modifications and adjustments." },
  { label: "Property Age",         file: "property_age.png",                           desc: "Age of property at acquisition in years. Older properties may carry higher capex risk and deferred maintenance." },
  { label: "Amortization Type",    file: "amortization_type.png",                      desc: "Amortization structure — balloon, fully amortizing, or interest-only variants. Balloon loans show the highest historical default rates." },
  { label: "Interest Type",        file: "interest_type.png",                          desc: "Fixed vs. variable rate structure. Variable rate loans carry repricing risk in rising rate environments." },
  { label: "Lien Position",        file: "lien_position.png",                          desc: "Lien seniority at origination. Junior lien positions absorb losses first, driving materially higher default rates." },
  { label: "Property Type",        file: "specific_property_type.png",                 desc: "Property sub-type classification. Specialized property types (military, seniors, student) show distinct default patterns." },
];

// Default to Underwritten DSCR
const defaultFeature = features.find((f) => f.file === "underwritten_dscr.png")!;

export default function FeatureExplorer() {
  const [selected, setSelected] = useState<(typeof features)[0]>(defaultFeature);
  const [imgKey, setImgKey] = useState(0);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const feat = features.find((f) => f.file === e.target.value);
    if (!feat || feat.file === selected.file) return;
    // Increment key triggers remount → CSS animation fires fresh each time
    setSelected(feat);
    setImgKey((k) => k + 1);
  };

  return (
    <div className="w-full">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-start mb-8">
        {/* Dropdown */}
        <div className="relative shrink-0 w-full sm:w-72">
          <select
            value={selected.file}
            onChange={handleSelect}
            className="w-full appearance-none bg-[#0c0c0c] border border-white/12 hover:border-violet-500/50 text-white text-sm font-medium rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
          >
            {features.map((f) => (
              <option key={f.file} value={f.file}>{f.label}</option>
            ))}
          </select>
          {/* Visible chevron with violet accent */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-600/20 border border-violet-500/30">
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none" className="text-violet-400">
                <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Feature description */}
        <div className="flex-1 pt-0.5">
          <p className="text-sm text-zinc-400 leading-relaxed">{selected.desc}</p>
        </div>
      </div>

      {/* Plot — key forces full remount so CSS animation re-fires on every change */}
      <div
        key={imgKey}
        className="w-full rounded-2xl overflow-hidden border border-white/6 bg-black animate-image-reveal"
      >
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-white">{selected.label}</span>
            <span className="text-[10px] text-zinc-600 px-2 py-0.5 rounded-full border border-white/8 tracking-wide">
              Feature Analysis
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-[#1f77ff] shadow-[0_0_4px_#1f77ff]" />
              Non-Delinquent
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-[#ff3b3b] shadow-[0_0_4px_#ff3b3b]" />
              Delinquent
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <Image
            src={`/feature_plots/${selected.file}`}
            alt={selected.label}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-[#080808]">
          <p className="text-[11px] text-zinc-700 leading-relaxed">
            Distribution across held-out test set · Blue = performing · Red = delinquent
          </p>
        </div>
      </div>
    </div>
  );
}
