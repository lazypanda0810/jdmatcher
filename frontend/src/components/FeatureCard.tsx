import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  return (
    <div
      className="group relative p-7 rounded-2xl bg-card/80 border border-border hover:border-accent/30 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up overflow-hidden backdrop-blur-sm"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
    >
      {/* Neon top border */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent/0 to-transparent group-hover:via-accent/50 transition-all duration-700" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-transparent group-hover:border-accent/30 rounded-tl-2xl transition-all duration-500" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-transparent group-hover:border-accent/30 rounded-br-2xl transition-all duration-500" />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      {/* Gradient hover bg */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-info/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-5 group-hover:from-accent/20 group-hover:to-info/10 group-hover:scale-110 transition-all duration-500 border border-accent/10 group-hover:border-accent/20">
          <Icon className="w-7 h-7 text-accent" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {/* Decorative code tag */}
        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-accent/20 to-transparent" />
          <span className="text-[9px] font-mono text-accent/40 uppercase tracking-wider">module.active</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
