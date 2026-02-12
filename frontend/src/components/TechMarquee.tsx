import { useEffect, useState } from "react";

const logos = [
  "TensorFlow",
  "PyTorch",
  "spaCy",
  "BERT",
  "GPT-4",
  "LangChain",
  "Hugging Face",
  "OpenAI",
  "Scikit-Learn",
  "FastAPI",
  "Redis",
  "PostgreSQL",
];

const TechMarquee = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev + 0.5);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const tripled = [...logos, ...logos, ...logos];

  return (
    <div className="relative overflow-hidden py-6">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card/50 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card/50 to-transparent z-10" />

      <div
        className="flex gap-8 items-center transition-none"
        style={{
          transform: `translateX(-${offset % (logos.length * 140)}px)`,
        }}
      >
        {tripled.map((name, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent/20 transition-colors duration-300 group"
          >
            <span className="text-sm font-mono text-muted-foreground/60 group-hover:text-accent/80 transition-colors whitespace-nowrap">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechMarquee;
