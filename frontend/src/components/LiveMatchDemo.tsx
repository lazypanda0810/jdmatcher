import { useState, useEffect } from "react";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const mockResumes = [
  {
    name: "Sarah_Chen_Resume.pdf",
    role: "Frontend Developer",
    score: 96,
    skills: ["React", "TypeScript", "CSS", "Node.js"],
    missing: ["GraphQL"],
    status: "excellent",
  },
  {
    name: "Alex_Rivera_CV.docx",
    role: "Full Stack Engineer",
    score: 87,
    skills: ["Python", "Django", "React", "AWS"],
    missing: ["Docker", "K8s"],
    status: "good",
  },
  {
    name: "Priya_ML_Resume.pdf",
    role: "ML Engineer",
    score: 72,
    skills: ["Python", "TensorFlow", "SQL"],
    missing: ["PyTorch", "MLOps", "Spark"],
    status: "fair",
  },
];

const LiveMatchDemo = () => {
  const [activeResume, setActiveResume] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowScore(false);
      setAnalysisStep(0);

      // Animate steps
      setTimeout(() => setAnalysisStep(1), 400);
      setTimeout(() => setAnalysisStep(2), 800);
      setTimeout(() => setAnalysisStep(3), 1200);
      setTimeout(() => {
        setShowScore(true);
      }, 1600);

      setTimeout(() => {
        setActiveResume((prev) => (prev + 1) % mockResumes.length);
      }, 4500);
    }, 5000);

    // Initial animation
    setTimeout(() => setAnalysisStep(1), 400);
    setTimeout(() => setAnalysisStep(2), 800);
    setTimeout(() => setAnalysisStep(3), 1200);
    setTimeout(() => setShowScore(true), 1600);

    return () => clearInterval(timer);
  }, []);

  const resume = mockResumes[activeResume];

  return (
    <div className="relative">
      {/* Holographic frame */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-accent/30 via-info/20 to-accent/30 animate-gradient-shift bg-[length:200%_auto]" />

      <div className="relative rounded-2xl bg-card border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              resume_analyzer.ai
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-success/80">PROCESSING</span>
          </div>
        </div>

        <div className="p-6">
          {/* File info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {resume.name}
              </div>
              <div className="text-xs text-muted-foreground">{resume.role}</div>
            </div>
          </div>

          {/* Analysis steps */}
          <div className="space-y-3 mb-6">
            {["Parsing document...", "Extracting skills...", "Computing match..."].map(
              (step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    analysisStep > i
                      ? "opacity-100"
                      : "opacity-30"
                  }`}
                >
                  <CheckCircle
                    className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                      analysisStep > i ? "text-success" : "text-muted-foreground/30"
                    }`}
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {step}
                  </span>
                  {analysisStep === i + 1 && (
                    <div className="w-3 h-3 border-2 border-accent/40 border-t-accent rounded-full animate-spin ml-auto" />
                  )}
                </div>
              )
            )}
          </div>

          {/* Score display */}
          <div
            className={`transition-all duration-500 ${
              showScore ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground uppercase">Match Score</span>
                <span
                  className={`text-2xl font-heading font-black ${
                    resume.score >= 90
                      ? "text-success"
                      : resume.score >= 80
                      ? "text-accent"
                      : "text-warning"
                  }`}
                >
                  {resume.score}%
                </span>
              </div>

              {/* Score bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    resume.score >= 90
                      ? "bg-gradient-to-r from-success to-accent"
                      : resume.score >= 80
                      ? "bg-gradient-to-r from-accent to-info"
                      : "bg-gradient-to-r from-warning to-accent"
                  }`}
                  style={{ width: showScore ? `${resume.score}%` : "0%" }}
                />
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {resume.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-mono border border-success/20"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resume.missing.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-mono border border-warning/20"
                  >
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resume dots navigation */}
        <div className="px-6 pb-4 flex justify-center gap-2">
          {mockResumes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveResume(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeResume ? "bg-accent w-6" : "bg-muted-foreground/20"
              }`}
              aria-label={`Resume ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveMatchDemo;
