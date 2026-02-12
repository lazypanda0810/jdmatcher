import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    text: "ResumeAI helped me tailor my resume perfectly. Landed 3 interviews in a week!",
    score: 96,
  },
  {
    name: "James Okonkwo",
    role: "Data Scientist",
    company: "Meta",
    text: "The skill gap analysis is incredibly accurate. It showed me exactly what I needed.",
    score: 94,
  },
  {
    name: "Priya Sharma",
    role: "Product Manager",
    company: "Amazon",
    text: "As a recruiter, this tool saves me 10+ hours weekly screening candidates.",
    score: 98,
  },
  {
    name: "Alex Rivera",
    role: "Full Stack Dev",
    company: "Microsoft",
    text: "Best resume tool I've used. The AI matching is on another level entirely.",
    score: 92,
  },
  {
    name: "Emily Zhang",
    role: "UX Designer",
    company: "Apple",
    text: "Transformed my job search. Match scores gave me confidence in my applications.",
    score: 97,
  },
  {
    name: "Marcus Johnson",
    role: "ML Engineer",
    company: "Tesla",
    text: "The NLP analysis caught skills I didn't even realize I was missing. Brilliant.",
    score: 95,
  },
];

const TestimonialsCarousel = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        className="flex gap-6 transition-none"
        style={{
          transform: `translateX(-${offset % (testimonials.length * 380)}px)`,
        }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[360px] group"
          >
            <div className="relative p-6 rounded-2xl bg-card/80 border border-border hover:border-accent/30 transition-all duration-500 backdrop-blur-sm h-full">
              {/* Neon top border */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-info/20 flex items-center justify-center border border-accent/10">
                    <span className="text-sm font-bold text-accent">{t.name[0]}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                    {t.score}%
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">Match</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
