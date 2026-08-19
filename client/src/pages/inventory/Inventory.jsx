import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import InventoryAdjustmentModal from "../../components/inventory/InventoryAdjustmentModal";
import StockMovementTable from "../../components/inventory/StockMovementTable";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { getInventory, getInventoryMovements, adjustInventory } from "../../services/inventory.service";
import { formatMoney } from "../../utils/formatters";

const formatCurrency = (value) => `৳ ${formatMoney(value)}`;

const SectionHeader = ({ icon: Icon, title, description }) => (
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
  </div>
);

const Inventory = () => {
  const [allItems, setAllItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getInventory(1, 10000, search, lowStockOnly, selectedCategory);
      setAllItems(response.products ?? []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoadingMovements(true);
      const response = await getInventoryMovements(1, 8, search);
      setMovements(response.transactions ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getInventory(1, 10000, search, lowStockOnly, selectedCategory);
        if (!ignore) setAllItems(response.products ?? []);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Failed to load inventory.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadInventory();
    return () => { ignore = true; };
  }, [search, selectedCategory, lowStockOnly]);

  useEffect(() => {
    let active = true;
    const loadMovements = async () => {
      try {
        setLoadingMovements(true);
        const response = await getInventoryMovements(1, 8, search);
        if (active) setMovements(response.transactions ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingMovements(false);
      }
    };
    void loadMovements();
    return () => { active = false; };
  }, [search]);

  const visibleItems = useMemo(() => allItems.filter((item) => {
    if (selectedBrand && item.brand?.name !== selectedBrand) return false;
    if (stockStatus === "low-stock" && !item.isLowStock) return false;
    if (stockStatus === "out-of-stock" && item.stockQuantity !== 0) return false;
    if (stockStatus === "in-stock" && (item.stockQuantity === 0 || item.isLowStock)) return false;
    return true;
  }).sort((a, b) => {
    const statusRank = (item) => item.stockQuantity === 0 ? 0 : item.isLowStock ? 1 : 2;
    const statusDiff = statusRank(a) - statusRank(b);
    if (statusDiff !== 0) return statusDiff;
    return a.name.localeCompare(b.name);
  }), [allItems, selectedBrand, stockStatus]);

  const summary = useMemo(() => ({
    totalProducts: visibleItems.length,
    totalStockQuantity: visibleItems.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0),
    totalStockValue: visibleItems.reduce((sum, item) => sum + Number(item.stockValue || 0), 0),
    inStockItems: visibleItems.filter((item) => item.stockQuantity > 0 && !item.isLowStock).length,
    lowStockItems: visibleItems.filter((item) => item.stockQuantity > 0 && item.isLowStock).length,
    outOfStockItems: visibleItems.filter((item) => item.stockQuantity === 0).length,
  }), [visibleItems]);

  const categoryOptions = useMemo(() => [...new Set(allItems.map((item) => item.category?.name).filter(Boolean))].sort(), [allItems]);
  const brandOptions = useMemo(() => [...new Set(allItems.map((item) => item.brand?.name).filter(Boolean))].sort(), [allItems]);

  const activeFilterCount = [selectedCategory, selectedBrand, stockStatus !== "all" ? stockStatus : "", lowStockOnly ? "low" : ""].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setStockStatus("all");
    setLowStockOnly(false);
    setSearch("");
  };

  const handleAdjust = (product) => {
    setSelectedProduct(product);
    setShowAdjustment(true);
  };

  const handleAdjustmentSubmit = async (data) => {
    try {
      setSaving(true);
      await adjustInventory(data);
      setShowAdjustment(false);
      setSelectedProduct(null);
      await fetchInventory();
      await fetchMovements();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to adjust inventory.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-loading-screen" aria-label="Loading store">
        <div className="wc-loading-card"><Spinner /><span>Loading your store inventory…</span></div>
      </div>
    );
  }

  return (
    <div className="wc-page wc-store-page">
      <header className="wc-store-hero">
        <div>
          <div className="wc-eyebrow"><Boxes size={14} /> Store / Stock control</div>
          <h1>Inventory control center.</h1>
          <p>See stock health, locate products, and adjust quantities from one clean workspace.</p>
        </div>
        <div className="wc-hero-summary">
          <div><span>Inventory value</span><strong>{formatCurrency(summary.totalStockValue)}</strong></div>
          <div><span>Total units</span><strong>{summary.totalStockQuantity}</strong></div>
        </div>
      </header>

      {error && (
        <div className="wc-error-card wc-error-inline">
          <div className="wc-error-icon"><AlertTriangle size={20} /></div>
          <div><h2>Inventory data needs attention</h2><p>{error}</p></div>
          <button type="button" className="wc-secondary-button" onClick={fetchInventory}>Retry</button>
        </div>
      )}

      <section className="wc-store-metrics wc-store-metrics--six">
        <article><div className="wc-store-metric-icon is-blue"><Package size={18} /></div><div><span>Total products</span><strong>{summary.totalProducts}</strong><small>Catalog items tracked</small></div></article>
        <article><div className="wc-store-metric-icon is-green"><CheckCircle2 size={18} /></div><div><span>In stock</span><strong>{summary.inStockItems}</strong><small>Healthy stock level</small></div></article>
        <article><div className="wc-store-metric-icon is-amber"><AlertTriangle size={18} /></div><div><span>Low stock</span><strong>{summary.lowStockItems}</strong><small>Needs replenishment</small></div></article>
        <article><div className="wc-store-metric-icon is-red"><X size={18} /></div><div><span>Out of stock</span><strong>{summary.outOfStockItems}</strong><small>Unavailable now</small></div></article>
        <article><div className="wc-store-metric-icon is-blue"><Boxes size={18} /></div><div><span>Total units</span><strong>{summary.totalStockQuantity}</strong><small>Physical quantity</small></div></article>
        <article><div className="wc-store-metric-icon is-purple"><ArrowDownToLine size={18} /></div><div><span>Stock value</span><strong>{formatCurrency(summary.totalStockValue)}</strong><small>At purchase cost</small></div></article>
      </section>

      <section className="wc-store-section wc-store-inventory-section">
        <div className="wc-inventory-toolbar-head">
          <div>
            <span className="wc-kicker">Stock ledger</span>
            <h2>All inventory</h2>
            <p>{visibleItems.length} products in the current view</p>
          </div>
          <div className="wc-stock-status-tabs" role="tablist" aria-label="Stock status filter">
            {[
              ["all", "All", allItems.length],
              ["in-stock", "In stock", summary.inStockItems],
              ["low-stock", "Low stock", summary.lowStockItems],
              ["out-of-stock", "Out of stock", summary.outOfStockItems],
            ].map(([value, label, count]) => (
              <button key={value} type="button" className={stockStatus === value ? "is-active" : ""} onClick={() => setStockStatus(value)}>
                <span>{label}</span><strong>{count}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="wc-store-toolbar wc-store-toolbar--table">
          <div className="wc-store-search-wrap">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, SKU, or barcode…" aria-label="Search inventory" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}
          </div>
          <button type="button" className={`wc-secondary-button ${showFilters ? "is-active" : ""}`} onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal size={16} /> Filters {activeFilterCount ? <span className="wc-filter-count">{activeFilterCount}</span> : null}
          </button>
          {activeFilterCount > 0 && <button type="button" className="wc-quiet-button" onClick={clearFilters}>Clear</button>}
        </div>

        {showFilters && (
          <section className="wc-filter-drawer wc-filter-drawer--table">
            <div className="wc-filter-field"><label>Category</label><select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option value="">All categories</option>{categoryOptions.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
            <div className="wc-filter-field"><label>Brand</label><select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}><option value="">All brands</option>{brandOptions.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
            <label className="wc-switch-field"><input type="checkbox" checked={lowStockOnly} onChange={(event) => setLowStockOnly(event.target.checked)} /><span className="wc-switch" /><span><strong>Reorder attention only</strong><small>Show products that need replenishment</small></span></label>
          </section>
        )}

        <div className="wc-data-table-wrap wc-stock-table-wrap">
          {visibleItems.length === 0 ? (
            <div className="wc-empty-state">
              <div className="wc-empty-state-icon"><Search size={20} /></div>
              <h2>No inventory matches this view</h2>
              <p>Try another search or clear the active filters.</p>
              <button type="button" className="wc-secondary-button" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <table className="wc-data-table wc-inventory-table wc-inventory-table--flat">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>Brand</th><th>Unit cost</th><th>Sell price</th><th>Stock</th><th>Status</th><th>Value</th><th>Action</th></tr>
              </thead>
              <tbody>
                {visibleItems.map((product) => {
                  const quantity = Number(product.stockQuantity || 0);
                  const statusClass = quantity === 0 ? "is-out" : product.isLowStock ? "is-low" : "is-stock";
                  const statusLabel = quantity === 0 ? "Out of stock" : product.isLowStock ? "Low stock" : "In stock";
                  return (
                    <tr key={product.id}>
                      <td><div className="wc-product-cell"><div className="wc-product-avatar"><Package size={15} /></div><div><strong>{product.name}</strong><span>{product.barcode ? product.barcode : "No barcode"}</span></div></div></td>
                      <td className="wc-mono-cell">{product.sku || "—"}</td>
                      <td>{product.category?.name || "Uncategorized"}</td>
                      <td>{product.brand?.name || "—"}</td>
                      <td>{formatCurrency(product.purchasePrice)}</td>
                      <td><strong>{formatCurrency(product.sellingPrice)}</strong></td>
                      <td><strong>{quantity}</strong> <span className="wc-unit-note">{product.unit?.name || "units"}</span></td>
                      <td><span className={`wc-status-pill ${statusClass}`}>{statusLabel}</span></td>
                      <td><strong>{formatCurrency(product.stockValue)}</strong></td>
                      <td><Button size="sm" variant="secondary" onClick={() => handleAdjust(product)}>Adjust</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="wc-store-section">
        <SectionHeader icon={ArrowUpRight} title="Recent stock movements" description="Sales, purchases, and manual adjustments recorded in one activity feed" />
        {loadingMovements ? <div className="wc-loading-inline"><Spinner /><span>Loading movements…</span></div> : <StockMovementTable movements={movements} />}
      </section>

      <InventoryAdjustmentModal
        isOpen={showAdjustment}
        onClose={() => { setShowAdjustment(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onSubmit={handleAdjustmentSubmit}
        loading={saving}
      />
    </div>
  );
};

export default Inventory;
