import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const iconSizes = { sm: 20, md: 24, lg: 32 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="absolute inset-0 bg-accent/20 rounded-lg blur-md group-hover:blur-lg transition-all" />
        <div className="relative bg-accent/10 border border-accent/20 rounded-lg p-1.5">
          <BrainCircuit
            size={iconSizes[size]}
            className="text-accent"
          />
        </div>
      </div>
      {showText && (
        <span className={`font-heading font-bold ${textSizes[size]} text-foreground`}>
          Resume<span className="text-accent">AI</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
