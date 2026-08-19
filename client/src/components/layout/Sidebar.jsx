import { useMemo, useState } from "react";
import navigation from "../../constants/navigation";
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../context/auth/useAuth";
import { useLayout } from "../../context/layout/useLayout";
import { hasModulePermission } from "../../utils/permissions";
import { Menu } from "lucide-react";

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState({});

  const visibleNavigation = useMemo(() => {
    const moduleMap = {
      Dashboard: "dashboard", Store: "inventory", Sales: "sales", "POS / Sales": "sales",
      Inventory: "inventory", Categories: "products",
      Brands: "products", Units: "products", Products: "products", Category: "products",
      Brand: "products", Unit: "products", Product: "products", Customers: "customers",
      "Customer Payments": "customers", "Customer Ledger": "customers", Suppliers: "suppliers",
      "Supplier Payments": "suppliers", "Supplier Ledger": "suppliers", Purchase: "purchases",
      Expenses: "expenses", "Easy Return": "returns", Reports: "reports",
      "User Management": "users", Users: "users", "Roles & Permissions": "roles", Settings: "settings",
    };

    return navigation.map((group) => {
      const items = group.items
        .filter((item) => {
          if (item.children) {
            return item.children.some((child) => hasModulePermission(
              user, moduleMap[child.title] || moduleMap[item.title] || child.title.toLowerCase(), "view"
            ));
          }
          return hasModulePermission(user, moduleMap[item.title] || item.title.toLowerCase(), "view");
        })
        .map((item) => {
          if (!item.children) return item;
          return {
            ...item,
            children: item.children.filter((child) =>
              hasModulePermission(user, moduleMap[child.title] || moduleMap[item.title] || child.title.toLowerCase(), "view")
            ),
          };
        });
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [user]);

  const handleToggleGroup = (title) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-[var(--overlay)] backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={`sidebar-shell fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-200 ease-out md:static md:h-screen md:translate-x-0 ${
          sidebarOpen
            ? "w-[252px] translate-x-0"
            : "-translate-x-full w-[252px] md:w-16 md:translate-x-0"
        } overflow-hidden`}
      >
        <div className={`flex shrink-0 items-center border-b border-[var(--color-border)] ${
          sidebarOpen ? "h-[82px] justify-between px-4" : "h-16 justify-center px-2"
        }`}>
          {sidebarOpen && (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--primary-soft)]">
                <img src="/logo/ng-icon-black.png" alt="NexGen" className="h-8 w-8 object-contain" />
              </div>
              <img src="/logo/ng-text-black.png" alt="NexGen Store" className="brand-logo-text h-6 w-24 object-contain object-left" />
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] md:inline-flex"
          >
            <Menu size={18} strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`py-5 ${sidebarOpen ? "px-3" : "px-2"}`}>
            {visibleNavigation.map((group) => (
              <section key={group.section} className="mb-6 last:mb-0">
                {sidebarOpen && (
                  <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    {group.section}
                  </h2>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.title}
                      item={item}
                      expanded={!!expandedGroups[item.title]}
                      onToggle={() => handleToggleGroup(item.title)}
                      collapsed={!sidebarOpen}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] p-3">
          <div className={`flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 ${
            sidebarOpen ? "" : "justify-start"
          }`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              AD
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">Admin User</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
