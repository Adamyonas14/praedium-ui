import Navbar from "@/components/Navbar";
import LoanCompare from "@/components/LoanCompare";

export const metadata = {
  title: "Compare Loans — Praedium",
  description: "Run multiple loan analyses and compare probability of default scores side by side.",
};

export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-800/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-purple-400">
                <rect x="1" y="3" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="3" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Loan Comparison</h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Analyze multiple loans and compare their probability of default scores, risk tiers,
                and credit metrics side by side.
              </p>
            </div>
          </div>

          <LoanCompare />
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <path d="M5 17 L9 5 L19 5 L15 17 Z" fill="url(#fg2)" />
              <defs>
                <linearGradient id="fg2" x1="5" y1="17" x2="19" y2="5" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs font-semibold text-slate-500">Praedium</span>
          </div>
          <p className="text-xs text-slate-700">For institutional use only. Not investment advice.</p>
        </div>
      </footer>
    </div>
  );
}
