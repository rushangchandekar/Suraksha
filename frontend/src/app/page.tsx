"use client";

import { useState, useEffect, useRef } from "react";
import { GlobeCdn } from "@/components/ui/cobe-globe-cdn";
import {
  AlertTriangle,
  Shield,
  Radio,
  Activity,
  ChevronRight,
  Menu,
  X,
  Globe,
  ArrowRight,
  Layers,
  Brain,
  Radar,
  GitMerge,
  Search,
  Clock,
  Zap,
  MapPin,
  BarChart3,
  Cpu,
  Database,
  Wifi,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Terminal,
  Eye,
  TrendingUp,
  Satellite,
  Siren,
  Timer,
  ShieldCheck,
  Target,
  Network,
  TriangleAlert,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   GLOBE DATA — Disaster monitoring network
   ═══════════════════════════════════════════════════════ */
const disasterMarkers = [
  { id: "hq-del", location: [28.61, 77.21] as [number, number], region: "HQ-DEL" },
  { id: "src-usgs", location: [38.95, -77.45] as [number, number], region: "USGS" },
  { id: "src-gdacs", location: [46.23, 6.14] as [number, number], region: "GDACS" },
  { id: "src-imd", location: [19.07, 72.87] as [number, number], region: "IMD" },
  { id: "src-meteo", location: [52.52, 13.41] as [number, number], region: "METEO" },
  { id: "src-reddit", location: [37.78, -122.42] as [number, number], region: "SOCIAL" },
  { id: "node-tky", location: [35.68, 139.69] as [number, number], region: "ADRC" },
  { id: "node-syd", location: [-33.87, 151.21] as [number, number], region: "SYD" },
  { id: "node-nbi", location: [-1.29, 36.82] as [number, number], region: "UNDRR" },
  { id: "node-sao", location: [-23.55, -46.63] as [number, number], region: "CEDEC" },
];

const disasterArcs = [
  { id: "arc-1", from: [28.61, 77.21] as [number, number], to: [38.95, -77.45] as [number, number] },
  { id: "arc-2", from: [28.61, 77.21] as [number, number], to: [46.23, 6.14] as [number, number] },
  { id: "arc-3", from: [28.61, 77.21] as [number, number], to: [19.07, 72.87] as [number, number] },
  { id: "arc-4", from: [28.61, 77.21] as [number, number], to: [52.52, 13.41] as [number, number] },
  { id: "arc-5", from: [28.61, 77.21] as [number, number], to: [37.78, -122.42] as [number, number] },
  { id: "arc-6", from: [46.23, 6.14] as [number, number], to: [35.68, 139.69] as [number, number] },
];

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════ */
function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2200;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   PIPELINE PHASE COMPONENT
   ═══════════════════════════════════════════════════════ */
function PipelinePhase({
  phase,
  title,
  desc,
  icon,
  isLast = false,
}: {
  phase: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gov-navy text-white flex items-center justify-center text-xs font-bold group-hover:bg-gov-saffron transition-colors duration-300 flex-shrink-0">
          {phase}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-gov-navy/30 to-transparent mt-2" />
        )}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gov-navy">{icon}</span>
          <h4 className="font-bold text-gov-navy text-sm">{title}</h4>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Top accent bar ─── */}
      <div className="h-1 w-full bg-gradient-to-r from-gov-saffron via-red-500 to-gov-navy" />

      {/* ─── Navigation ─── */}
      <nav
        className={`bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-200 shadow-lg shadow-black/5"
            : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gov-navy rounded-lg flex items-center justify-center group-hover:bg-gov-saffron transition-colors duration-300">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-gov-navy tracking-tight">
                  Suraksha<span className="text-gov-saffron"></span>
                </span>
                <span className="hidden sm:block text-[10px] text-gray-400 font-mono tracking-wider -mt-0.5">
                  DISASTER INTELLIGENCE FUSION ENGINE
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Features", href: "#features" },
                { label: "Architecture", href: "#architecture" },
                { label: "Sources", href: "#sources" },
                { label: "Stack", href: "#stack" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gov-navy rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <a
                href={backendUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gov-navy border border-gov-navy/20 rounded-lg hover:bg-gov-navy hover:text-white transition-all duration-300"
              >
                <Terminal className="w-4 h-4" />
                Dashboard
              </a>
              <a
                href={`${backendUrl}/docs`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gov-navy text-white rounded-lg hover:bg-gov-navy-light transition-colors"
              >
                API Docs
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gov-navy hover:bg-gray-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {["Features", "Architecture", "Sources", "Stack"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gov-navy hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                <a
                  href={backendUrl}
                  target="_blank"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold border border-gov-navy/20 text-gov-navy rounded-lg"
                >
                  Dashboard
                </a>
                <a
                  href={`${backendUrl}/docs`}
                  target="_blank"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-gov-navy text-white rounded-lg"
                >
                  API Docs
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-gov-dark via-gov-navy to-gov-navy-light overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gov-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gov-saffron text-xs font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Multi-Source Disaster Intelligence
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1]">
                Ingest. Verify.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-saffron to-yellow-300">
                  Respond.
                </span>
              </h1>

              <p className="text-blue-100/70 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                DisasterIntel fuses weather, seismic, social, and global alert
                signals into verified, prioritized incidents — giving responders
                a single pane of truth.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href={backendUrl}
                  target="_blank"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gov-saffron hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gov-saffron/25 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4" />
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href={`${backendUrl}/docs`}
                  target="_blank"
                  className="group inline-flex items-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/5"
                >
                  <Terminal className="w-4 h-4" />
                  API Reference
                </a>
              </div>

              {/* Source badges */}
              <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                {["Open-Meteo", "USGS", "GDACS", "IMD", "Reddit", "Firecrawl"].map(
                  (src) => (
                    <span
                      key={src}
                      className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-blue-200/60 text-[11px] font-mono tracking-wider"
                    >
                      {src}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Right: Globe */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80%] h-[80%] rounded-full bg-blue-400/10 blur-3xl" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[55%] h-[55%] rounded-full bg-gov-saffron/5 blur-2xl animate-pulse" />
              </div>

              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl animate-float">
                <GlobeCdn
                  markers={disasterMarkers}
                  arcs={disasterArcs}
                  speed={0.002}
                />
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-2 text-xs text-blue-200">
                <Globe className="w-3.5 h-3.5 text-gov-saffron" />
                <span className="font-mono tracking-wider">
                  LIVE SOURCE NETWORK
                </span>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════ */}
      <section className="relative bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Database className="w-6 h-6" />,
                value: 6,
                suffix: "",
                label: "Data Sources",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                value: 6,
                suffix: "",
                label: "Pipeline Phases",
                color: "text-gov-saffron",
                bg: "bg-orange-50",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                value: 4,
                suffix: "",
                label: "Verification Verdicts",
                color: "text-gov-green",
                bg: "bg-green-50",
              },
              {
                icon: <Activity className="w-6 h-6" />,
                value: 14,
                suffix: "",
                label: "API Endpoints",
                color: "text-red-600",
                bg: "bg-red-50",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 group">
                <div
                  className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CORE CAPABILITIES
          ═══════════════════════════════════════════════════ */}
      <section id="features" className="bg-gray-50/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-navy/5 text-gov-navy text-xs font-semibold tracking-wider uppercase mb-4">
              <Zap className="w-3.5 h-3.5" />
              Core Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gov-navy">
              Intelligence, Not Just Data
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Raw feeds become actionable intelligence through verification,
              anomaly detection, and incident fusion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                title: "Cross-Source Verification",
                desc: "Heuristic weighting, time-window correlation, and location overlap across all sources for confidence scoring.",
                color: "from-blue-500 to-blue-700",
                iconBg: "bg-blue-50 text-blue-600",
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                title: "Temporal Anomaly Detection",
                desc: "Spike detection across time-series data to catch emerging disaster signals before they trend.",
                color: "from-red-500 to-red-700",
                iconBg: "bg-red-50 text-red-600",
              },
              {
                icon: <GitMerge className="w-7 h-7" />,
                title: "Incident Fusion",
                desc: "Merges repeated events by disaster type, location key, and time window into single responder-facing incidents.",
                color: "from-purple-500 to-purple-700",
                iconBg: "bg-purple-50 text-purple-600",
              },
              {
                icon: <Brain className="w-7 h-7" />,
                title: "AI Relevance Index",
                desc: "Incident-level scoring with priority bucketing, impact radius estimation, and recommended responder actions.",
                color: "from-emerald-500 to-emerald-700",
                iconBg: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: <Timer className="w-7 h-7" />,
                title: "Freshness Decay Scoring",
                desc: "Time-weighted confidence decay so stale events lose priority and fresh signals surface first.",
                color: "from-amber-500 to-amber-700",
                iconBg: "bg-amber-50 text-amber-600",
              },
              {
                icon: <Search className="w-7 h-7" />,
                title: "External Verification",
                desc: "Firecrawl-powered search to corroborate or flag incidents with external evidence and stance inference.",
                color: "from-cyan-500 to-cyan-700",
                iconBg: "bg-cyan-50 text-cyan-600",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div
                  className={`${feat.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-gov-navy mb-2">
                  {feat.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PIPELINE ARCHITECTURE
          ═══════════════════════════════════════════════════ */}
      <section id="architecture" className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: pipeline phases */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-navy/5 text-gov-navy text-xs font-semibold tracking-wider uppercase mb-4">
                <Cpu className="w-3.5 h-3.5" />
                Pipeline
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gov-navy mb-3">
                Six-Phase Intelligence Pipeline
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-md">
                Entry point:{" "}
                <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gov-navy">
                  ingestion/pipeline.py
                </code>
              </p>

              <div>
                {[
                  {
                    phase: 1,
                    title: "Parallel Source Fetch",
                    desc: "Async ingestion from Open-Meteo, USGS, GDACS, IMD, Reddit, and Firecrawl/news simultaneously.",
                    icon: <Wifi className="w-4 h-4" />,
                  },
                  {
                    phase: 2,
                    title: "Cross-Source Verification",
                    desc: "Source trust weighting, time-window correlation, location overlap, and social credibility heuristics.",
                    icon: <ShieldCheck className="w-4 h-4" />,
                  },
                  {
                    phase: 3,
                    title: "Temporal Anomaly Detection",
                    desc: "Statistical spike detection across event time-series to surface emerging threats.",
                    icon: <Activity className="w-4 h-4" />,
                  },
                  {
                    phase: 4,
                    title: "Incident Fusion",
                    desc: "Merges correlated events into unified incidents based on type, location, and time window.",
                    icon: <GitMerge className="w-4 h-4" />,
                  },
                  {
                    phase: 5,
                    title: "Intelligence Enrichment",
                    desc: "Adds priority bucket, AI relevance index, impact radius, verification status, and responder actions.",
                    icon: <Brain className="w-4 h-4" />,
                  },
                  {
                    phase: 6,
                    title: "Persist & Serve",
                    desc: "Writes to latest_intelligence.json and timestamped snapshots. Backend API serves the dashboard.",
                    icon: <Database className="w-4 h-4" />,
                  },
                ].map((p, i) => (
                  <PipelinePhase
                    key={p.phase}
                    phase={p.phase}
                    title={p.title}
                    desc={p.desc}
                    icon={p.icon}
                    isLast={i === 5}
                  />
                ))}
              </div>
            </div>

            {/* Right: outputs & endpoints */}
            <div className="space-y-6">
              {/* Output card */}
              <div className="bg-gov-dark rounded-xl p-6 text-white">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gov-saffron mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Quick Start
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  {[
                    { cmd: "# Run the ingestion pipeline", isComment: true },
                    { cmd: "python -m ingestion.pipeline", isComment: false },
                    { cmd: "", isComment: true },
                    { cmd: "# Start the backend + dashboard", isComment: true },
                    {
                      cmd: "python -m uvicorn backend.app:app --reload",
                      isComment: false,
                    },
                    { cmd: "", isComment: true },
                    { cmd: "# Trigger ingestion via API", isComment: true },
                    {
                      cmd: `curl -X POST ${backendUrl}/api/ingestion/run`,
                      isComment: false,
                    },
                  ].map((line, i) =>
                    line.cmd === "" ? (
                      <div key={i} className="h-2" />
                    ) : (
                      <div
                        key={i}
                        className={
                          line.isComment ? "text-gray-500" : "text-green-400"
                        }
                      >
                        {line.isComment ? line.cmd : `$ ${line.cmd}`}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Key API endpoints */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gov-navy mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Key API Endpoints
                </h3>
                <div className="space-y-2">
                  {[
                    { method: "GET", path: "/api/intelligence/latest" },
                    { method: "GET", path: "/api/incidents/priority" },
                    { method: "GET", path: "/api/map/layers" },
                    { method: "GET", path: "/api/timeline" },
                    { method: "GET", path: "/api/incidents/{id}/verify" },
                    { method: "POST", path: "/api/ingestion/run" },
                  ].map((ep) => (
                    <div
                      key={ep.path}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white transition-colors group"
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ep.method === "POST"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-sm text-gray-600 font-mono group-hover:text-gov-navy transition-colors">
                        {ep.path}
                      </code>
                    </div>
                  ))}
                </div>
                <a
                  href={`${backendUrl}/docs`}
                  target="_blank"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-gov-blue-accent hover:text-gov-navy transition-colors"
                >
                  Full API Docs (Swagger)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Output files */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gov-navy mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Output
                </h3>
                <div className="space-y-2 font-mono text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-gov-saffron flex-shrink-0 mt-0.5" />
                    <span>
                      data/processed/<span className="text-gov-navy font-semibold">latest_intelligence.json</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-gov-saffron flex-shrink-0 mt-0.5" />
                    <span>data/processed/timestamped snapshots</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-gov-saffron flex-shrink-0 mt-0.5" />
                    <span>data/raw/per-source snapshots</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DATA SOURCES
          ═══════════════════════════════════════════════════ */}
      <section id="sources" className="bg-gray-50/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-navy/5 text-gov-navy text-xs font-semibold tracking-wider uppercase mb-4">
              <Satellite className="w-3.5 h-3.5" />
              Sources
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gov-navy">
              Multi-Source Ingestion
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Six source adapters feed the intelligence pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Open-Meteo",
                type: "Weather",
                icon: <Radar className="w-6 h-6" />,
                status: "Active",
              },
              {
                name: "USGS",
                type: "Seismic",
                icon: <Activity className="w-6 h-6" />,
                status: "Active",
              },
              {
                name: "GDACS",
                type: "Global Alerts",
                icon: <Globe className="w-6 h-6" />,
                status: "Active",
              },
              {
                name: "IMD",
                type: "Weather (India)",
                icon: <Satellite className="w-6 h-6" />,
                status: "Limited",
              },
              {
                name: "Reddit",
                type: "Social",
                icon: <Radio className="w-6 h-6" />,
                status: "Active",
              },
              {
                name: "Firecrawl",
                type: "News / Verify",
                icon: <Search className="w-6 h-6" />,
                status: "Active",
              },
            ].map((source) => (
              <div
                key={source.name}
                className="group bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gov-navy/5 text-gov-navy flex items-center justify-center mb-3 group-hover:bg-gov-navy group-hover:text-white transition-colors duration-300">
                  {source.icon}
                </div>
                <h4 className="font-bold text-gov-navy text-sm">{source.name}</h4>
                <p className="text-gray-400 text-xs mt-1">{source.type}</p>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    source.status === "Active"
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {source.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════════════ */}
      <section id="stack" className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-navy/5 text-gov-navy text-xs font-semibold tracking-wider uppercase mb-4">
              <Cpu className="w-3.5 h-3.5" />
              Built With
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gov-navy">
              Technology Stack
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Python", role: "Core Pipeline" },
              { name: "FastAPI", role: "Backend API" },
              { name: "Leaflet.js", role: "GIS Dashboard" },
              { name: "Transformers", role: "NLP / Classification" },
              { name: "Firecrawl", role: "External Verification" },
              { name: "Next.js", role: "Landing Page" },
              { name: "Tailwind CSS", role: "Styling" },
              { name: "COBE", role: "3D Globe" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gov-navy/20 hover:bg-gray-50/50 transition-all group"
              >
                <div className="w-2 h-2 rounded-full bg-gov-saffron group-hover:scale-150 transition-transform" />
                <div>
                  <div className="font-bold text-sm text-gov-navy">
                    {tech.name}
                  </div>
                  <div className="text-xs text-gray-400">{tech.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-gov-dark via-gov-navy to-gov-navy-light py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to explore the platform?
          </h2>
          <p className="text-blue-100/60 mb-8 max-w-lg mx-auto">
            Start the backend, trigger ingestion, and open the GIS dashboard to
            see live disaster intelligence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={backendUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gov-saffron hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-gov-saffron/25 hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              Open Dashboard
            </a>
            <a
              href={`${backendUrl}/docs`}
              target="_blank"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all hover:bg-white/5"
            >
              <Terminal className="w-4 h-4" />
              Swagger UI
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════ */}
      <footer className="bg-gov-dark text-gray-400">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gov-saffron/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gov-saffron rounded-lg flex items-center justify-center">
                <Radar className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">
                  Suraksha<span className="text-gov-saffron"></span>
                </span>
                <span className="block text-[10px] text-gray-500 font-mono">
                  DISASTER INTELLIGENCE FUSION ENGINE
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#architecture" className="hover:text-white transition-colors">
                Architecture
              </a>
              <a href="#sources" className="hover:text-white transition-colors">
                Sources
              </a>
              <a
                href={`${backendUrl}/docs`}
                target="_blank"
                className="hover:text-white transition-colors"
              >
                API Docs
              </a>
            </div>

            {/* GitHub placeholder */}
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-gov-saffron flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              title="GitHub Repository"
            >
              <GitBranch className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
            <p>
              DisasterIntel — Built as a multi-source disaster intelligence
              platform project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}