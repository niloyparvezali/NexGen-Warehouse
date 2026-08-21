import { useEffect, useMemo, useState } from "react";
import navigation from "../../constants/navigation";
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../context/auth/useAuth";
import { useLayout } from "../../context/layout/useLayout";
import { hasModulePermission } from "../../utils/permissions";

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useLayout();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState({});

  const visibleNavigation = useMemo(() => {
    const moduleMap = {
      Dashboard: "dashboard",
      Store: "inventory",
      Sales: "sales",
      "POS / Sales": "sales",
      Inventory: "inventory",
      Categories: "products",
      Brands: "products",
      Units: "products",
      Products: "products",
      Customers: "customers",
      "Customer Payments": "customers",
      "Customer Ledger": "customers",
      Suppliers: "suppliers",
      "Supplier Payments": "suppliers",
      "Supplier Ledger": "suppliers",
      Purchase: "purchases",
      Expenses: "expenses",
      "Easy Return": "returns",
      Reports: "reports",
      "User Management": "users",
      Users: "users",
      "Roles & Permissions": "roles",
      Settings: "settings",
    };

    return navigation
      .map((group) => {
        const items = group.items
          .filter((item) => {
            const module = moduleMap[item.title] || item.title.toLowerCase();
            return item.children
              ? item.children.some((child) =>
                  hasModulePermission(
                    user,
                    moduleMap[child.title] || module,
                    "view",
                  ),
                )
              : hasModulePermission(user, module, "view");
          })
          .map((item) =>
            item.children
              ? {
                  ...item,
                  children: item.children.filter((child) =>
                    hasModulePermission(
                      user,
                      moduleMap[child.title] ||
                        moduleMap[item.title] ||
                        child.title.toLowerCase(),
                      "view",
                    ),
                  ),
                }
              : item,
          );

        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [user]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  const handleToggleGroup = (title, nextOpen) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: Boolean(nextOpen),
    }));
  };

  const handleNavigate = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${sidebarOpen ? "is-visible" : ""}`}
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`sidebar-shell ${sidebarOpen ? "is-open" : "is-collapsed"}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar-brand-row">
          <div className="sidebar-brand">
            <div className="sidebar-brand__mark">
              <img src="/logo/ng-icon.png" alt="" />
            </div>
            {sidebarOpen && (
              <div className="sidebar-brand__copy">
                <strong>NEXGEN</strong>
                <span>Warehouse OS</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-toggle"
            aria-label={
              sidebarOpen ? "Collapse navigation" : "Expand navigation"
            }
            title={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
          >
            <span aria-hidden="true">{sidebarOpen ? "←" : "→"}</span>
          </button>
        </div>

        <nav className="sidebar-nav custom-scrollbar" aria-label="Primary">
          {visibleNavigation.map((group) => (
            <section key={group.section} className="sidebar-section">
              {sidebarOpen && <h2>{group.section}</h2>}
              <div className="sidebar-items">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.title}
                    item={item}
                    expanded={expandedGroups[item.title]}
                    onToggle={(nextOpen) => handleToggleGroup(item.title, nextOpen)}
                    onNavigate={handleNavigate}
                    collapsed={!sidebarOpen}
                  />
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="sidebar-status__dot" />
            {sidebarOpen && <span>System operational</span>}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
