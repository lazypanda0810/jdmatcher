import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";

const RESUME_TIPS = [
  "Tailor your resume to each job description — generic resumes get filtered out quickly.",
  "Use action verbs like 'Led', 'Built', 'Optimized', 'Designed' to start bullet points.",
  "Quantify your achievements: '↑ 40% revenue' is stronger than 'increased revenue'.",
  "Keep your resume to 1–2 pages max. Recruiters spend ~7 seconds on the first scan.",
  "Put your most relevant experience first — don't bury the good stuff.",
  "Remove 'References available upon request' — it's assumed and wastes space.",
  "Use a clean, ATS-friendly format: avoid tables, columns, headers/footers, and images.",
  "Include a 'Skills' section with keywords that match the job description.",
  "Proofread! Even one typo can cost you an interview. Read it backwards to catch errors.",
  "Add a professional summary (2–3 lines) at the top highlighting your value proposition.",
  "Use consistent date formatting throughout (e.g., Jan 2023 – Present).",
  "Don't include your photo, age, or marital status — focus on qualifications.",
  "Include links to your portfolio, GitHub, or LinkedIn if they strengthen your application.",
  "Remove outdated skills (e.g., Internet Explorer, Flash) — they date your resume.",
  "Use keywords from the job posting naturally in your experience descriptions.",
  "List certifications relevant to your target role prominently.",
  "Focus on impact, not duties: what changed because of your work?",
  "Save and send your resume as a PDF to preserve formatting.",
  "Include volunteer work or side projects if they demonstrate relevant skills.",
  "Avoid buzzwords like 'synergy', 'guru', 'ninja' — use concrete descriptions instead.",
];

const ResumeTipsPopup = () => {
  const [visible, setVisible] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show a tip after 5 seconds
    const timer = setTimeout(() => {
      const lastDismissed = sessionStorage.getItem("tips_dismissed");
      if (!lastDismissed) {
        setTipIndex(Math.floor(Math.random() * RESUME_TIPS.length));
        setVisible(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle tip every 30 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % RESUME_TIPS.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [visible]);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % RESUME_TIPS.length);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("tips_dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up max-w-sm">
      <div className="bg-card border border-accent/30 rounded-2xl shadow-lg p-5 relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent/40" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss tips"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-heading font-bold text-foreground">Resume Tip</p>
            <p className="text-[10px] text-muted-foreground">
              Tip {tipIndex + 1} of {RESUME_TIPS.length}
            </p>
          </div>
        </div>

        {/* Tip body */}
        <p className="text-sm text-muted-foreground leading-relaxed pr-4">
          {RESUME_TIPS[tipIndex]}
        </p>

        {/* Footer */}
        <button
          onClick={nextTip}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Next Tip <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ResumeTipsPopup;
