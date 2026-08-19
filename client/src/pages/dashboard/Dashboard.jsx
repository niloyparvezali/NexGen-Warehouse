import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Spinner from "../../components/ui/Spinner";
import { getDashboard } from "../../services/dashboard.service";
import { formatMoney } from "../../utils/formatters";

const formatCurrency = (value) => `৳${formatMoney(value)}`;

const MetricCard = ({ icon: Icon, label, value, helper, tone = "blue", trend, trendLabel }) => (
  <article className={`wc-metric-card wc-tone-${tone}`}>
    <div className="wc-metric-top">
      <div className="wc-metric-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </div>
      {trend !== undefined && (
        <span className={`wc-metric-trend ${trend >= 0 ? "is-up" : "is-down"}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="wc-metric-label">{label}</div>
    <div className="wc-metric-value">{value}</div>
    <div className="wc-metric-helper">{trendLabel || helper}</div>
  </article>
);

const SectionHeader = ({ icon: Icon, title, description, action, onAction }) => (
  <div className="wc-section-header">
    <div className="wc-section-heading">
      {Icon && (
        <div className="wc-section-icon" aria-hidden="true">
          <Icon size={17} />
        </div>
      )}
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
    {action && (onAction ? (
      <button type="button" className="wc-link-button" onClick={onAction}>
        {action} <ArrowUpRight size={15} />
      </button>
    ) : (
      <Link className="wc-link-button" to="#">
        {action} <ArrowUpRight size={15} />
      </Link>
    ))}
  </div>
);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDashboard();
        if (active) setDashboard(response.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "We could not load the dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const fiscalYear = today.getMonth() >= 6
    ? `FY ${today.getFullYear()}–${today.getFullYear() + 1}`
    : `FY ${today.getFullYear() - 1}–${today.getFullYear()}`;

  const salesTrend = dashboard?.charts?.trend14Days || dashboard?.sales?.trend14Days || [];
  const recentInvoices = dashboard?.sales?.recent || [];
  const recentPurchases = dashboard?.purchase?.recent || [];
  const lowStockItems = dashboard?.inventory?.lowStockItems || dashboard?.alerts?.lowStock || [];
  const topCustomers = dashboard?.topCustomers || [];
  const recentActivity = dashboard?.activity || [];
  const collections = dashboard?.finance?.collections || { collected: 0, stillDue: 0, fullyPaidCount: 0, withBalanceCount: 0 };
  const counters = dashboard?.counters || { customers: 0, activeInvoices: 0, products: 0, suppliers: 0 };

  const healthItems = useMemo(() => [
    {
      label: "Low stock",
      value: lowStockItems.length,
      state: lowStockItems.length ? "attention" : "healthy",
      description: lowStockItems.length ? "Products need replenishment" : "Stock levels are healthy",
      icon: Package,
      onClick: () => navigate("/inventory"),
    },
    {
      label: "Open invoices",
      value: dashboard?.finance?.openInvoicesCount ?? 0,
      state: (dashboard?.finance?.openInvoicesCount ?? 0) > 0 ? "attention" : "healthy",
      description: (dashboard?.finance?.openInvoicesCount ?? 0) > 0 ? "Receivables need follow-up" : "No open invoices",
      icon: Receipt,
      onClick: () => navigate("/sales"),
    },
    {
      label: "Collections",
      value: formatCurrency(collections.stillDue),
      state: collections.stillDue > 0 ? "attention" : "healthy",
      description: collections.stillDue > 0 ? "Customer balance still due" : "All current collections settled",
      icon: Wallet,
      onClick: () => navigate("/customer"),
    },
  ], [collections.stillDue, dashboard?.finance?.openInvoicesCount, lowStockItems.length, navigate]);

  if (loading) {
    return (
      <div className="wc-loading-screen" aria-label="Loading dashboard">
        <div className="wc-loading-card">
          <Spinner />
          <span>Loading your business overview…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wc-page wc-dashboard-page">
        <div className="wc-error-card">
          <div className="wc-error-icon"><AlertTriangle size={20} /></div>
          <div>
            <h2>Dashboard could not load</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="wc-primary-button">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wc-page wc-dashboard-page">
      <header className="wc-dashboard-hero">
        <div>
          <div className="wc-eyebrow"><Sparkles size={14} /> Business workspace</div>
          <h1>Good to see you. Here’s what needs attention.</h1>
          <p>{formattedDate} <span>•</span> {fiscalYear}</p>
        </div>
        <div className="wc-hero-actions">
          <button type="button" className="wc-secondary-button" onClick={() => navigate("/reports")}>
            <BarChart3 size={16} /> Reports
          </button>
          <button type="button" className="wc-primary-button" onClick={() => navigate("/sales")}>
            <Plus size={17} /> New sale
          </button>
        </div>
      </header>

      <section className="wc-metrics-grid" aria-label="Business summary">
        <MetricCard
          icon={CircleDollarSign}
          label="Sales today"
          value={formatCurrency(dashboard?.sales?.today)}
          helper={`${dashboard?.sales?.orders ?? 0} invoices this month`}
          tone="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label="Sales this month"
          value={formatCurrency(dashboard?.sales?.month)}
          helper="Compared with last month"
          trend={dashboard?.sales?.monthVsLastMonthPct ?? 0}
          trendLabel={`${dashboard?.sales?.monthVsLastMonthPct ?? 0}% vs last month`}
          tone="green"
        />
        <MetricCard
          icon={Wallet}
          label="Customer receivables"
          value={formatCurrency(dashboard?.finance?.customerDue)}
          helper={`${dashboard?.finance?.openInvoicesCount ?? 0} open invoices`}
          tone="amber"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Purchases this month"
          value={formatCurrency(dashboard?.purchase?.month)}
          helper="Supplier spend"
          tone="violet"
        />
      </section>

      <section className="wc-workbench-grid">
        <article className="wc-panel wc-chart-panel">
          <SectionHeader
            icon={TrendingUp}
            title="Sales performance"
            description="Daily revenue over the last 14 days"
          />
          <div className="wc-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend} margin={{ top: 12, right: 16, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--wc-border-soft)" strokeDasharray="4 5" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--wc-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={{ fill: "var(--wc-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `৳${Math.round(value / 1000)}k` : `৳${value}`} />
                <Tooltip
                  cursor={{ stroke: "var(--wc-primary-soft)" }}
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    background: "var(--wc-surface-strong)",
                    border: "1px solid var(--wc-border)",
                    borderRadius: 12,
                    color: "var(--wc-text)",
                    fontSize: 12,
                    boxShadow: "0 14px 40px rgba(16, 24, 40, .10)",
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--wc-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "var(--wc-primary)", strokeWidth: 3, stroke: "var(--wc-surface-strong)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="wc-panel wc-health-panel">
          <SectionHeader icon={CheckCircle2} title="Business health" description="The things worth checking now" />
          <div className="wc-health-list">
            {healthItems.map(({ label, value, description, state, icon: Icon, onClick }) => (
              <button type="button" key={label} onClick={onClick} className="wc-health-row">
                <div className={`wc-health-icon ${state === "attention" ? "is-attention" : "is-healthy"}`}>
                  <Icon size={16} />
                </div>
                <div className="wc-health-copy">
                  <strong>{label}</strong>
                  <span>{description}</span>
                </div>
                <div className="wc-health-value">{value}</div>
                <ChevronRight size={16} className="wc-row-chevron" />
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="wc-lower-grid">
        <article className="wc-panel">
          <SectionHeader icon={Package} title="Low-stock items" description="Products that may need replenishment" action="View inventory" onAction={() => navigate("/inventory")} />
          {lowStockItems.length ? (
            <div className="wc-list-table">
              {lowStockItems.slice(0, 6).map((item) => (
                <button type="button" className="wc-list-row" key={item.id} onClick={() => navigate("/inventory")}>
                  <div className="wc-product-avatar"><Package size={16} /></div>
                  <div className="wc-list-main"><strong>{item.name}</strong><span>{item.sku || "No SKU"}</span></div>
                  <span className="wc-stock-pill is-low">{item.stockQuantity} left</span>
                  <ChevronRight size={16} className="wc-row-chevron" />
                </button>
              ))}
            </div>
          ) : (
            <div className="wc-empty-inline"><CheckCircle2 size={18} /><span>Everything looks healthy. No low-stock items right now.</span></div>
          )}
        </article>

        <article className="wc-panel">
          <SectionHeader icon={ShoppingCart} title="Quick actions" description="Jump straight into common work" />
          <div className="wc-action-grid">
            <button type="button" onClick={() => navigate("/sales")}><Receipt size={18} /><span><strong>New sale</strong><small>Create an invoice</small></span><ArrowUpRight size={15} /></button>
            <button type="button" onClick={() => navigate("/purchase")}><ShoppingBag size={18} /><span><strong>New purchase</strong><small>Record supplier stock</small></span><ArrowUpRight size={15} /></button>
            <button type="button" onClick={() => navigate("/customer")}><Users size={18} /><span><strong>Add customer</strong><small>Save a new customer</small></span><ArrowUpRight size={15} /></button>
            <button type="button" onClick={() => navigate("/product")}><Boxes size={18} /><span><strong>Manage products</strong><small>Update catalog and price</small></span><ArrowUpRight size={15} /></button>
          </div>
        </article>
      </section>

      <section className="wc-lower-grid wc-lower-grid-wide">
        <article className="wc-panel">
          <SectionHeader icon={FileText} title="Recent invoices" description="Latest sales activity" action="Open sales" onAction={() => navigate("/sales")} />
          {recentInvoices.length ? (
            <div className="wc-data-table-wrap">
              <table className="wc-data-table">
                <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {recentInvoices.slice(0, 6).map((invoice) => (
                    <tr key={invoice.id} onClick={() => navigate("/sales")} tabIndex={0}>
                      <td><strong className="wc-linkish">{invoice.invoiceNumber}</strong></td>
                      <td>{invoice.customerName || "Walk-in customer"}</td>
                      <td><strong>{formatCurrency(invoice.total)}</strong></td>
                      <td>{invoice.dateFormatted || invoice.createdAt?.slice(0, 10) || "—"}</td>
                      <td><span className="wc-status-pill is-paid">Paid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="wc-empty-inline"><Receipt size={18} /><span>No invoices recorded yet.</span></div>}
        </article>

        <article className="wc-panel">
          <SectionHeader icon={ShoppingBag} title="Recent purchases" description="Latest supplier activity" />
          {recentPurchases.length ? (
            <div className="wc-list-table">
              {recentPurchases.slice(0, 6).map((purchase) => (
                <button type="button" className="wc-list-row" key={purchase.id} onClick={() => navigate("/purchase")}>
                  <div className="wc-product-avatar wc-product-avatar-green"><ShoppingBag size={16} /></div>
                  <div className="wc-list-main"><strong>{purchase.supplierName || "Supplier"}</strong><span>{purchase.dateFormatted || "Recent"} · #{purchase.purchaseNumber || "—"}</span></div>
                  <strong>{formatCurrency(purchase.total)}</strong>
                </button>
              ))}
            </div>
          ) : <div className="wc-empty-inline"><ShoppingBag size={18} /><span>No recent purchases yet.</span></div>}
        </article>
      </section>

      <section className="wc-panel">
        <SectionHeader icon={Users} title="Business snapshot" description="A few useful totals from your workspace" />
        <div className="wc-snapshot-grid">
          <div><span>Customers</span><strong>{counters.customers}</strong></div>
          <div><span>Active invoices</span><strong>{counters.activeInvoices}</strong></div>
          <div><span>Products</span><strong>{counters.products}</strong></div>
          <div><span>Suppliers</span><strong>{counters.suppliers}</strong></div>
          <div><span>Collected this month</span><strong>{formatCurrency(collections.collected)}</strong></div>
          <div><span>Still due</span><strong>{formatCurrency(collections.stillDue)}</strong></div>
        </div>
      </section>

      <section className="wc-panel">
        <SectionHeader icon={CheckCircle2} title="Recent activity" description="Latest changes across the workspace" />
        {recentActivity.length ? (
          <div className="wc-activity-list">
            {recentActivity.slice(0, 8).map((activity) => (
              <div className="wc-activity-row" key={activity.id}>
                <div className="wc-activity-dot" />
                <div><strong>{activity.user}</strong><span>{activity.record}</span></div>
                <time>{activity.timeFormatted}</time>
              </div>
            ))}
          </div>
        ) : <div className="wc-empty-inline"><CheckCircle2 size={18} /><span>No activity records yet.</span></div>}
      </section>
    </div>
  );
};

export default Dashboard;
