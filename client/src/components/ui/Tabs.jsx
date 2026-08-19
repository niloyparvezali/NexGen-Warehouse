import { useState } from "react";
import { cn } from "../../utils/cn";

const Tabs = ({ tabs = [], defaultValue, onChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue ?? tabs[0]?.value);

  const handleChange = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className={cn("ui-tabs flex flex-wrap gap-2", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleChange(tab.value)}
            className={cn(
              "ui-tab rounded-full border px-3.5 py-2 text-sm font-medium transition duration-200",
              isActive
                ? "is-active border-[var(--color-primary)]/40 bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
