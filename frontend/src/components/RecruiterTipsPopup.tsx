import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";

const RECRUITER_TIPS = [
  "Write clear, specific job descriptions — vague postings get fewer qualified applicants.",
  "Include salary ranges in job postings. Listings with salary attract 30% more applicants.",
  "Respond to candidates within 48 hours — top talent gets snapped up quickly.",
  "Use structured interviews with consistent questions for fair, unbiased hiring.",
  "Don't over-require years of experience — focus on skills and demonstrated ability.",
  "Include 'nice-to-have' vs 'must-have' skills to widen your candidate pool.",
  "Review resumes for potential, not just exact keyword matches.",
  "Diversify your sourcing channels — don't rely on just one job board.",
  "Screen for culture add, not just culture fit — diversity drives innovation.",
  "Use data-driven hiring: track metrics like time-to-hire, offer acceptance rate.",
  "Give candidates a realistic job preview to reduce early turnover.",
  "Automate initial screening with AI tools, but always have human review.",
  "Follow up with rejected candidates — they may be right for a future role.",
  "Keep job descriptions under 700 words — shorter postings get 8.4% more applies.",
  "Test your application process yourself — if it takes > 5 min, simplify it.",
  "Build a talent pipeline before you have open roles.",
  "Remove degree requirements where practical experience suffices.",
  "Highlight growth opportunities and learning budgets in your postings.",
  "Share employer branding content regularly — candidates research companies before applying.",
  "Use skills-based assessments instead of relying solely on resume keywords.",
];

const RecruiterTipsPopup = () => {
  const [visible, setVisible] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const lastDismissed = sessionStorage.getItem("recruiter_tips_dismissed");
      if (!lastDismissed) {
        setTipIndex(Math.floor(Math.random() * RECRUITER_TIPS.length));
        setVisible(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % RECRUITER_TIPS.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [visible]);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % RECRUITER_TIPS.length);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("recruiter_tips_dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up max-w-sm">
      <div className="bg-card border border-info/30 rounded-2xl shadow-lg p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-info to-info/40" />
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss tips"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-info" />
          </div>
          <div>
            <p className="text-sm font-heading font-bold text-foreground">Recruiting Tip</p>
            <p className="text-[10px] text-muted-foreground">Tip {tipIndex + 1} of {RECRUITER_TIPS.length}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pr-4">
          {RECRUITER_TIPS[tipIndex]}
        </p>
        <button
          onClick={nextTip}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-info hover:text-info/80 transition-colors"
        >
          Next Tip <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default RecruiterTipsPopup;
