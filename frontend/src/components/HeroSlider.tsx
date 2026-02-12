import { useState, useEffect, useCallback } from "react";
import {
  BrainCircuit,
  FileSearch,
  BarChart3,
  Sparkles,
  Cpu,
  Network,
  ScanLine,
  Layers,
} from "lucide-react";

const slides = [
  {
    icon: BrainCircuit,
    title: "Neural Matching Engine",
    subtitle: "Deep learning algorithms analyze semantic patterns across resumes and job descriptions",
    gradient: "from-accent via-accent/50 to-info/30",
    iconColor: "text-accent",
    metric: "99.2%",
    metricLabel: "Accuracy",
  },
  {
    icon: Cpu,
    title: "Intelligent Parsing",
    subtitle: "Advanced NLP pipeline extracts skills, experience, and qualifications automatically",
    gradient: "from-info via-info/50 to-accent/30",
    iconColor: "text-info",
    metric: "0.3s",
    metricLabel: "Parse Time",
  },
  {
    icon: Network,
    title: "Skill Graph Analysis",
    subtitle: "Knowledge graph maps skill relationships and identifies hidden competency matches",
    gradient: "from-success via-success/50 to-accent/30",
    iconColor: "text-success",
    metric: "500+",
    metricLabel: "Skills Mapped",
  },
  {
    icon: ScanLine,
    title: "ATS Score Optimization",
    subtitle: "Real-time scoring against ATS algorithms used by Fortune 500 companies",
    gradient: "from-warning via-warning/50 to-info/30",
    iconColor: "text-warning",
    metric: "3x",
    metricLabel: "Better Results",
  },
  {
    icon: Layers,
    title: "Multi-Format Support",
    subtitle: "Process PDF, DOCX, and plain text resumes with intelligent format detection",
    gradient: "from-accent via-info/50 to-success/30",
    iconColor: "text-accent",
    metric: "15+",
    metricLabel: "Formats",
  },
];

const HeroSlider = () => {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return;
      setDirection(index > active ? "up" : "down");
      setIsTransitioning(true);
      setTimeout(() => {
        setActive(index);
        setIsTransitioning(false);
      }, 400);
    },
    [active]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((active + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [active, goTo]);

  const slide = slides[active];
  const Icon = slide.icon;

  return (
    <div className="relative w-full max-w-lg mx-auto perspective-1000">
      {/* Holographic glow */}
      <div className="absolute -inset-12 rounded-3xl bg-gradient-to-r from-accent/20 via-info/10 to-accent/20 blur-3xl animate-pulse-ring" />

      {/* Scanner line */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent animate-scanner" />
      </div>

      {/* Main card - glassmorphism */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20 transition-all duration-700`} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,212,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/40 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/40 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/40 rounded-br-2xl" />

        <div className="relative p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="text-[10px] font-mono text-accent/70 uppercase tracking-[0.2em]">
                Live Analysis
              </span>
            </div>
            <div className="text-[10px] font-mono text-primary-foreground/30">
              v3.7.1 · NEURAL_NET
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-400 ${
              isTransitioning
                ? direction === "up"
                  ? "opacity-0 -translate-y-6 scale-95"
                  : "opacity-0 translate-y-6 scale-95"
                : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            <div className="flex items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:border-accent/30 transition-colors">
                <Icon className={`w-8 h-8 ${slide.iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-primary-foreground mb-1.5">
                  {slide.title}
                </h3>
                <p className="text-primary-foreground/50 text-sm leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </div>

            {/* Metric display */}
            <div className="flex items-end gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                {slide.metric}
              </div>
              <div className="text-xs text-primary-foreground/40 font-mono uppercase tracking-wider pb-1.5">
                {slide.metricLabel}
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-accent/40"
                    style={{
                      height: `${12 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="flex gap-1.5 mt-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1 rounded-full overflow-hidden flex-1 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === active && (
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-info rounded-full"
                    style={{ animation: "progress-fill 4s linear forwards" }}
                  />
                )}
                {i < active && (
                  <div className="absolute inset-0 bg-accent/30 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating HUD elements */}
      <div className="absolute -top-6 -right-6 p-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] animate-float shadow-lg shadow-accent/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-success" />
          </div>
          <div>
            <div className="text-xs font-bold text-primary-foreground/80">98% Match</div>
            <div className="text-[9px] text-primary-foreground/40 font-mono">CONFIDENCE_HIGH</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 p-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] animate-float-delayed shadow-lg shadow-info/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-info/20 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-info" />
          </div>
          <div>
            <div className="text-xs font-bold text-primary-foreground/80">AI Ready</div>
            <div className="text-[9px] text-primary-foreground/40 font-mono">GPU_ACCELERATED</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -right-8 p-2 rounded-lg bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] animate-float">
        <div className="text-[9px] font-mono text-accent/60 writing-vertical">
          SYS_ONLINE
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
