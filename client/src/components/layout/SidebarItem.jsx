import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const SidebarItem = ({ item, expanded, onToggle, collapsed = false }) => {
  const location = useLocation();
  const Icon = item.icon;
  const hasChildren =
    Array.isArray(item.children) && item.children.length > 0;

  const hasActiveChild = hasChildren
    ? item.children.some((child) => location.pathname === child.path)
    : false;

  const groupOpen = hasChildren && (expanded || hasActiveChild);

  const itemClass = (active = false) =>
    `sidebar-nav-item flex w-full items-center ${
      collapsed ? "justify-center px-2" : "gap-3 px-3"
    } py-2.5 text-sm font-semibold ${active ? "is-active" : ""}`;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        {/* Parent item */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={item.title}
          aria-expanded={groupOpen}
          className={itemClass(hasActiveChild)}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] ${
              item.color || "text-[var(--primary-lighter)]"
            }`}
          >
            <Icon size={18} strokeWidth={1.9} />
          </span>

          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-left">
              {item.title}
            </span>
          )}

          {!collapsed && (
            <ChevronDown
              size={17}
              className={`shrink-0 transition-transform duration-200 ${
                groupOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Child items */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            groupOpen
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {!collapsed && (
            <div className="ml-7 py-1 pl-3">
              <div className="space-y-0.5 border-l border-[var(--color-border)] pl-2">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;

                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors ${
                          isActive
                            ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary-lighter)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                        }`
                      }
                    >
                      <span
                        className={`flex w-4 shrink-0 items-center justify-center ${
                          child.color || "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <ChildIcon size={16} strokeWidth={1.9} />
                      </span>

                      <span className="min-w-0 truncate">
                        {child.title}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      aria-label={item.title}
      className={({ isActive }) => itemClass(isActive)}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] ${
          item.color || "text-[var(--primary-lighter)]"
        }`}
      >
        <Icon size={18} strokeWidth={1.9} />
      </span>

      {!collapsed && (
        <span className="min-w-0 truncate">{item.title}</span>
      )}
    </NavLink>
  );
};

export default SidebarItem;