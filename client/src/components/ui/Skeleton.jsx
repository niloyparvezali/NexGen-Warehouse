import { cn } from "../../utils/cn";

const Skeleton = ({ className = "", children }) => {
  return (
    <div className={cn("animate-pulse rounded-xl bg-[var(--surface-muted)]/80", className)}>
      {children}
    </div>
  );
};

export default Skeleton;
