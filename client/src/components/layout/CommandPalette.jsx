import { useEffect, useMemo, useRef, useState } from "react";
import { Command, Search, ArrowRight, Package, Receipt, Users, Truck, BarChart3, Settings, ShoppingCart, Wallet, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COMMANDS = [
  { label: "New Sale", description: "Open the sales workspace", path: "/sales", icon: Receipt, keywords: "sale invoice pos checkout" },
  { label: "Products", description: "Manage your product catalog", path: "/product", icon: Package, keywords: "product inventory sku" },
  { label: "Customers", description: "Customers, balances and history", path: "/customer", icon: Users, keywords: "customer client" },
  { label: "Suppliers", description: "Suppliers and purchase relationships", path: "/supplier", icon: Truck, keywords: "supplier vendor" },
  { label: "Purchases", description: "Create and manage purchases", path: "/purchase", icon: ShoppingCart, keywords: "purchase buying procurement" },
  { label: "Expenses", description: "Track business expenses", path: "/expense", icon: Wallet, keywords: "expense cost spending" },
  { label: "Returns", description: "Process customer returns", path: "/easy-return", icon: RotateCcw, keywords: "return refund exchange" },
  { label: "Reports", description: "Business reporting and analytics", path: "/reports", icon: BarChart3, keywords: "report analytics profit sales" },
  { label: "Settings", description: "Configure the workspace", path: "/settings", icon: Settings, keywords: "settings configuration" },
  { label: "Dashboard", description: "Business overview", path: "/dashboard", icon: Command, keywords: "home overview" },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(0, results.length - 1)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        navigate(results[activeIndex].path);
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, navigate, results, activeIndex]);

  if (!open) return null;

  return (
    <div className="wc-command-backdrop" onMouseDown={onClose}>
      <div className="wc-command" role="dialog" aria-modal="true" aria-label="Search and navigate" onMouseDown={(event) => event.stopPropagation()}>
        <div className="wc-command__search">
          <Search size={19} aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder="Search pages, actions and tools..." aria-label="Search pages, actions and tools" />
          <kbd>Esc</kbd>
        </div>

        <div className="wc-command__body">
          {results.length ? (
            results.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`wc-command__item ${index === activeIndex ? "is-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => { navigate(item.path); onClose(); }}
                >
                  <span className="wc-command__icon"><Icon size={17} /></span>
                  <span className="wc-command__copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowRight size={15} className="wc-command__arrow" />
                </button>
              );
            })
          ) : (
            <div className="wc-command__empty">
              <Search size={22} />
              <strong>No results</strong>
              <span>Try a page name, module, or action.</span>
            </div>
          )}
        </div>

        <div className="wc-command__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
