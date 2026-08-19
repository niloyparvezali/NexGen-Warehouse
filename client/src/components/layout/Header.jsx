import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, Menu, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLayout } from "../../context/layout/useLayout";
import { getDashboard } from "../../services/dashboard.service";
import pageTitles from "../../utils/pageTitle";

const Header = () => {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const previousNotificationCount = useRef(undefined);
  const isDarkMode = theme === "dark";

  const title = pageTitles[location.pathname] || "NexGen Store";
  const isDashboardRoute = location.pathname === "/dashboard";
  const segments = useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await getDashboard();
        const items = response?.inventory?.lowStockItems || response?.alerts?.lowStock || [];

        if (!active) return;

        setNotifications(items);
      } catch (error) {
        console.error("Failed to load inventory notifications", error);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!notifications.length) {
      previousNotificationCount.current = 0;
      return;
    }

    const currentCount = notifications.length;
    if (previousNotificationCount.current !== undefined && currentCount > previousNotificationCount.current) {
      toast("Low-stock alert: " + notifications[0].name + " needs replenishment.", {
        icon: "⚠️",
        duration: 4000,
      });
    }

    previousNotificationCount.current = currentCount;
  }, [notifications]);

  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 backdrop-blur-xl shadow-[var(--shadow-xs)] sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
          className="md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
          aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
        >
          <Menu size={19} strokeWidth={1.9} />
        </button>

        <div className="min-w-0">
          <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] sm:flex">
            <span>Workspace</span>
            {segments.length > 0 ? <span className="text-[var(--color-border-strong)]">/</span> : null}
            {segments.length > 0 ? (
              <span className="max-w-[280px] truncate">
                {segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" / ")}
              </span>
            ) : null}
          </div>
          <h1 className={`${isDashboardRoute ? "text-base sm:text-lg" : "text-lg sm:text-xl"} truncate font-semibold tracking-tight text-[var(--color-text-primary)]`}>
            {isDashboardRoute ? "Business overview" : title}
          </h1>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
        <div className="flex h-10 w-full max-w-[440px] items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] px-3 shadow-[var(--shadow-xs)] transition focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--primary-soft)]">
          <Search size={17} className="mr-2.5 shrink-0 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <span className="hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-muted)] lg:inline-flex">
            Search
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            aria-label="Notifications"
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-light)] ${notifications.length > 0 ? "border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_8%,var(--color-surface-muted))] text-[var(--color-danger)] animate-pulse" : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[9px] font-bold text-white shadow-lg">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[330px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                  <Bell size={15} /> Notifications
                </div>
                <span className="rounded-full bg-[var(--color-danger)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-danger)]">
                  {notifications.length} active
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-[var(--color-text-secondary)]">
                    No low-stock alerts right now.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/inventory");
                      }}
                      className="flex w-full items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition hover:bg-[var(--color-surface-muted)] last:border-b-0"
                    >
                      <div className="mt-0.5 rounded-full bg-[var(--color-warning)]/15 p-1.5 text-[var(--color-warning)]">
                        <AlertTriangle size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{item.name}</div>
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
                          {item.sku || "SKU not set"} · {item.stockQuantity} left
                        </div>
                      </div>

                      <div className="rounded-full bg-[var(--color-warning)]/15 px-2 py-1 text-[10px] font-semibold text-[var(--color-warning)]">
                        Min {item.minimumStock}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]"
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
          title={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 text-left transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-light)] sm:px-3"
          aria-label="Open user menu"
        >
          <UserCircle2 size={20} className="shrink-0 text-[var(--color-text-primary)]" />
          <div className="hidden min-w-0 md:block">
            <p className="max-w-[120px] truncate text-xs font-semibold text-[var(--color-text-primary)]">Admin</p>
            <p className="max-w-[120px] truncate text-[11px] text-[var(--color-text-secondary)]">Administrator</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
