import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  index?: number;
}

const StatCard = ({ icon: Icon, label, value, trend, index = 0 }: StatCardProps) => {
  return (
    <div
      className="p-5 rounded-xl bg-card border border-border shadow-card animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-heading font-bold text-foreground mt-1">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-success font-medium mt-1">{trend}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
