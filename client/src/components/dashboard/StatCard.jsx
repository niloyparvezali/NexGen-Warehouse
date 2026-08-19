import { cn } from "../../utils/cn";

const StatCard = ({ title, value, icon, color = "bg-[var(--surface-muted)]", className = "" }) => {
  return (
    <div className={cn("min-h-[110px] rounded-[16px] border border-[var(--border)]/90 bg-[var(--surface)] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg stat-card", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="stat-card-label">{title}</p>
          <div className="mt-3">
            <div className="stat-card-number">{value}</div>
          </div>
        </div>

        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", color)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
