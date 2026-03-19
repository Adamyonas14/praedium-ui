import Navbar from "@/components/Navbar";
import LoanForm from "@/components/LoanForm";

export const metadata = {
  title: "Loan Analysis — Praedium",
  description: "Enter loan parameters to generate a probability of default score.",
};

export default function AnalyzePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto mb-10">
          {/* Page header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-800/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-purple-400">
                <path d="M2 13l5-5 3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="15" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 15h3M15 13.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Loan Credit Analysis</h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Complete all fields below to generate an XGBoost-powered probability of default
                score, risk tier, and feature attribution.
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-8">
            <span>Praedium</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-slate-400">Loan Analysis</span>
          </div>

          <LoanForm />
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <path d="M5 17 L9 5 L19 5 L15 17 Z" fill="url(#fg3)" />
              <defs>
                <linearGradient id="fg3" x1="5" y1="17" x2="19" y2="5" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs font-semibold text-slate-400">Praedium</span>
          </div>
          <p className="text-xs text-slate-700">
            For institutional use only. Model outputs are not investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
