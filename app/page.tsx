"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ModelAccuracyChart from "@/components/ModelAccuracyChart";
import FeatureExplorer from "@/components/FeatureExplorer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   NATIVE LOGO: rounded parallelogram mark
   Traced from the actual Praedium brand asset
───────────────────────────────────────────── */
function PraediumMark({
  width,
  height,
  strokeWidth = 2.2,
  gradient = "heroMark",
}: {
  width: number;
  height: number;
  strokeWidth?: number;
  gradient?: string;
}) {
  const gradId = gradient;
  return (
    <svg width={width} height={height} viewBox="0 0 36 46" fill="none" className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="46" x2="36" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="60%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
        <filter id={`${gradId}glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M17 4 L28 4 Q34 4 32 11 L23 40 Q21 46 14 46 L4 46 Q-2 46 0 39 L9 10 Q11 4 17 4 Z"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
        filter={`url(#${gradId}glow)`}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   HERO LOGO: wordmark + symbol inline
   Replicates the Praedium brand identity natively
───────────────────────────────────────────── */
function HeroLogo() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
      {/* Wordmark — font-normal matches the logo's medium-weight geometric sans */}
      <h1
        className="text-white leading-none select-none"
        style={{
          fontSize: "clamp(52px, 10vw, 108px)",
          fontWeight: 400,
          letterSpacing: "-0.015em",
        }}
      >
        Praedium
      </h1>

      {/* Brand mark — sized to match cap height (~70% of font-size) */}
      <div
        style={{
          width: "clamp(28px, 5vw, 58px)",
          height: "clamp(36px, 6.5vw, 74px)",
          marginBottom: "-0.04em", // optical baseline alignment
        }}
        className="shrink-0"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 36 46"
          fill="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="heroSymGrad" x1="0" y1="46" x2="36" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="55%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id="heroSymGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M17 4 L28 4 Q34 4 32 11 L23 40 Q21 46 14 46 L4 46 Q-2 46 0 39 L9 10 Q11 4 17 4 Z"
            fill="none"
            stroke="url(#heroSymGrad)"
            strokeWidth="2.5"
            filter="url(#heroSymGlow)"
          />
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED BACKGROUND BLOBS
───────────────────────────────────────────── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="blob-1 absolute w-[680px] h-[680px] rounded-full"
        style={{
          top: "-220px",
          left: "-180px",
          background: "radial-gradient(circle, rgba(76,29,149,0.35) 0%, rgba(46,16,101,0.15) 55%, transparent 72%)",
        }}
      />
      <div
        className="blob-2 absolute w-[520px] h-[520px] rounded-full"
        style={{
          top: "-120px",
          right: "-120px",
          background: "radial-gradient(circle, rgba(126,34,206,0.22) 0%, rgba(74,4,78,0.08) 55%, transparent 72%)",
        }}
      />
      <div
        className="blob-3 absolute w-[560px] h-[380px] rounded-full"
        style={{
          bottom: "-80px",
          left: "28%",
          background: "radial-gradient(circle, rgba(55,48,163,0.18) 0%, rgba(30,27,75,0.06) 55%, transparent 72%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL INDICATOR — smaller, thicker
───────────────────────────────────────────── */
function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center gap-1.5 animate-scroll-arrow">
      <div className="w-px h-6 bg-gradient-to-b from-transparent to-violet-500/40" />
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-violet-500/70">
        <path
          d="M1 1.5l5 4.5 5-4.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const scrollPills = [
  { label: "Model Performance", id: "model" },
  { label: "Feature Explorer",  id: "features" },
  { label: "Use Cases",         id: "usecases" },
];

const aboutStats = [
  { value: "~97%",  label: "Test Accuracy",      sub: "at 0.75 threshold" },
  { value: "15",    label: "Model Features",      sub: "loan-level inputs" },
  { value: "4",     label: "Risk Tiers",          sub: "Low → High" },
  { value: "<200ms",label: "Inference Time",      sub: "real-time API" },
];

const useCases = [
  { n: "01", title: "Loan Origination",    body: "Score every credit at underwriting. Flag elevated-risk loans before commitment, accelerate low-risk approvals, and standardize decisions across origination desks." },
  { n: "02", title: "Portfolio Monitoring", body: "Re-score existing loans on a scheduled basis to detect credit migration. Surface early warning signals before delinquency appears in servicer data." },
  { n: "03", title: "Stress Testing",      body: "Simulate rate shocks, occupancy drops, and LTV compression — then recompute PD across the book. Essential for DFAST and internal stress frameworks." },
  { n: "04", title: "CMBS Due Diligence",  body: "Rapidly score loan pools during securitization. Identify tail-risk collateral, support subordination sizing, and generate audit-ready model documentation." },
  { n: "05", title: "Acquisition Analysis", body: "Underwrite CRE acquisitions with a quantitative default probability layer alongside traditional underwriting metrics and sponsor analysis." },
  { n: "06", title: "Regulatory Capital",  body: "Integrate model-derived PD estimates into CECL reserve calculations, Basel III RWA frameworks, and internal RAROC or economic capital models." },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  useScrollReveal();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const fade = (delay: number) => ({
    opacity: heroVisible ? 1 : 0,
    transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5">
        <HeroBackground />

        {/* Content — shifted slightly below visual center */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 1.1s cubic-bezier(0.22,1,0.36,1), transform 1.1s cubic-bezier(0.22,1,0.36,1)",
            marginTop: "8vh", // push optical center lower
          }}
        >
          {/* Native logo */}
          <div className="animate-float-slow mb-7">
            <HeroLogo />
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-md leading-relaxed mb-2" style={fade(0.22)}>
            AI-powered{" "}
            <span className="grad-text-subtle font-medium">probability of default</span>{" "}
            scoring for commercial real estate loans.
          </p>

          <p className="text-sm text-zinc-600 mb-10" style={fade(0.38)}>
            Built for institutional credit teams · XGBoost · Real-time API
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12" style={fade(0.52)}>
            <Link
              href="/analyze"
              className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-2xl shadow-violet-900/50 hover:shadow-violet-900/70 hover:-translate-y-0.5"
            >
              Analyze a Loan →
            </Link>
            <Link
              href="/compare"
              className="px-8 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold text-sm transition-all hover:bg-white/5"
            >
              Compare Loans
            </Link>
          </div>

          {/* Section scroll pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-14" style={fade(0.66)}>
            {scrollPills.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="px-4 py-2 rounded-full text-xs font-medium text-zinc-500 border border-white/8 hover:border-violet-500/30 hover:text-violet-300 hover:bg-violet-500/5 transition-all"
              >
                ↓ {label}
              </button>
            ))}
          </div>

          <ScrollIndicator />
        </div>
      </section>

      {/* ════════════════════════════════════
          ABOUT — What is Praedium
      ════════════════════════════════════ */}
      <section className="py-32 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto">

          {/* Editorial headline */}
          <div className="reveal max-w-4xl mb-20">
            <div className="section-line" />
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.2em] mb-4">
              What is Praedium
            </p>
            <h2
              className="text-white leading-[1.08] mb-7"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              One number that tells you whether{" "}
              <span className="grad-text" style={{ fontWeight: 300 }}>
                to write the check.
              </span>
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              Praedium is a machine learning credit risk platform that outputs the probability
              a commercial real estate loan will default. It processes 15 loan-level parameters
              through a gradient-boosted XGBoost model and returns a calibrated probability of
              default score — in real time.
            </p>
          </div>

          {/* Two-column explanation + stats */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: how it works */}
            <div className="space-y-8">
              {[
                {
                  n: "—",
                  title: "Trained on historical performance",
                  body: "The model learns from thousands of CRE loans across property types, geographies, and market cycles — capturing non-linear feature interactions that linear scorecards miss.",
                },
                {
                  n: "—",
                  title: "Calibrated risk tiers",
                  body: "The raw PD score is mapped to four risk tiers — Low, Moderate, Elevated, High — calibrated to align with institutional credit policy thresholds and loss distributions.",
                },
                {
                  n: "—",
                  title: "Feature attribution included",
                  body: "Every score comes with feature-level attribution showing which loan characteristics are driving risk up or protecting credit quality — giving analysts a transparent, defensible model decision.",
                },
              ].map((item) => (
                <div key={item.title} className="reveal flex gap-5">
                  <div className="mt-1 w-5 shrink-0 h-px bg-violet-700/60 relative top-3" />
                  <div>
                    <h3
                      className="text-white mb-2"
                      style={{ fontWeight: 400, fontSize: "15px" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: stat grid */}
            <div className="reveal reveal-delay-2">
              <div className="grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden">
                {aboutStats.map((s) => (
                  <div
                    key={s.label}
                    className="group bg-black hover:bg-[#080808] transition-colors p-8"
                  >
                    <div
                      className="grad-text mb-1 leading-none"
                      style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, letterSpacing: "-0.02em" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-white text-sm font-medium mb-1">{s.label}</div>
                    <div className="text-zinc-600 text-xs">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Who it's for */}
              <div className="mt-6 p-6 rounded-2xl border border-white/6 bg-[#080808]">
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
                  Who it&apos;s for
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Credit analysts, portfolio managers, and risk officers at{" "}
                  <span className="text-zinc-300">banks</span>,{" "}
                  <span className="text-zinc-300">insurance companies</span>,{" "}
                  <span className="text-zinc-300">debt funds</span>, and{" "}
                  <span className="text-zinc-300">GSEs</span> — institutions that need a
                  consistent, auditable machine learning engine without building or maintaining
                  one in-house.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MODEL PERFORMANCE
      ════════════════════════════════════ */}
      <section id="model" className="py-32 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-20">
            <div className="section-line" />
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.2em] mb-4">
              Model Performance
            </p>
            <h2
              className="text-white leading-tight mb-5"
              style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              Validated on{" "}
              <span className="grad-text" style={{ fontWeight: 300 }}>real CRE data</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
              Evaluated on a held-out test set. Below: confusion matrix at the 0.75 classification
              threshold and predicted default probability distribution across performing and
              delinquent loans.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Confusion matrix */}
            <div className="reveal reveal-delay-1">
              <p className="text-xs text-zinc-700 uppercase tracking-widest mb-4">
                Confusion Matrix · 0.75 threshold
              </p>
              <ModelAccuracyChart />
            </div>

            {/* Strip plot */}
            <div className="reveal reveal-delay-2 flex flex-col gap-4">
              <p className="text-xs text-zinc-700 uppercase tracking-widest">
                Predicted Default Probability · Test Set
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/6 bg-black">
                <div className="px-5 py-3.5 border-b border-white/5 bg-[#080808] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Probability Distribution by Outcome
                  </span>
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
                <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                  <Image
                    src="/probability_predictions.png"
                    alt="Predicted Default Probability vs Actual Outcome"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="px-5 py-3 border-t border-white/5 bg-[#080808]">
                  <p className="text-[11px] text-zinc-700 leading-relaxed">
                    Blue: performing loans (n≈5,000) · Red: delinquent loans (n≈430) ·
                    Model concentrates delinquent predictions above 0.75.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURE EXPLORER
      ════════════════════════════════════ */}
      <section id="features" className="py-32 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-16">
            <div className="section-line" />
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.2em] mb-4">
              Explore Default Features
            </p>
            <h2
              className="text-white leading-tight mb-5"
              style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              What drives{" "}
              <span className="grad-text" style={{ fontWeight: 300 }}>default risk</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
              Explore how each loan feature correlates with default across the training dataset.
              Select any feature to see its distribution across performing and delinquent loans.
            </p>
          </div>

          <div className="reveal reveal-delay-1">
            <FeatureExplorer />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          USE CASES
      ════════════════════════════════════ */}
      <section id="usecases" className="py-32 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-20">
            <div className="section-line" />
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.2em] mb-4">
              Use Cases
            </p>
            <h2
              className="text-white leading-tight mb-5"
              style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              Built for institutional{" "}
              <span className="grad-text" style={{ fontWeight: 300 }}>credit teams</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
              Praedium integrates into every stage of the CRE credit lifecycle — from origination
              through exit — giving risk teams a consistent, model-driven view of default probability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden">
            {useCases.map((uc, i) => (
              <div
                key={uc.n}
                className={`reveal reveal-delay-${(i % 3) + 1} group p-8 bg-black hover:bg-[#080808] transition-colors`}
              >
                <div className="text-[10px] font-mono text-zinc-700 mb-5 group-hover:text-violet-500/50 transition-colors tracking-widest">
                  {uc.n}
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">{uc.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {uc.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA
      ════════════════════════════════════ */}
      <section className="py-32 px-5 border-t border-white/5">
        <div className="max-w-2xl mx-auto reveal text-center">
          <div className="flex justify-center mb-8">
            <PraediumMark width={36} height={46} strokeWidth={2.2} gradient="ctaMark" />
          </div>
          <h2
            className="text-white mb-5"
            style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 300, letterSpacing: "-0.02em" }}
          >
            Score your next loan
          </h2>
          <p className="text-zinc-400 text-base mb-10 leading-relaxed">
            Enter loan parameters and receive an instant probability of default score,
            risk tier classification, and feature attribution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/analyze"
              className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-2xl shadow-violet-900/50 hover:-translate-y-0.5"
            >
              Analyze a Loan →
            </Link>
            <Link
              href="/compare"
              className="px-8 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold text-sm transition-all hover:bg-white/5"
            >
              Compare Multiple Loans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PraediumMark width={18} height={23} strokeWidth={2} gradient="footerMark" />
            <span className="text-sm text-zinc-500" style={{ fontWeight: 400 }}>Praedium</span>
          </div>
          <p className="text-xs text-zinc-700">For institutional use only · Not investment advice</p>
        </div>
      </footer>
    </div>
  );
}
