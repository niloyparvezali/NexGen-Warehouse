import { useCallback, useEffect, useState } from "react";
import { getLowStockReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
} from "../../utils/exportUtils.js";

const LowStockReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLowStockReport();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch low stock report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      await fetchReport();
    };

    void loadReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    if (!data || !data.products) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Current Stock",
      "Min Required",
      "Gap",
      "Unit",
      "Purchase Price",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Current Stock": product.stockQuantity,
      "Min Required": product.minimumStock,
      Gap: product.stockGap,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "low-stock-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.products) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Current Stock",
      "Min Required",
      "Gap",
      "Unit",
      "Purchase Price",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Current Stock": product.stockQuantity,
      "Min Required": product.minimumStock,
      Gap: product.stockGap,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
    }));

    downloadExcel(rows, headers, "low-stock-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.products) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Current Stock",
      "Min Required",
      "Gap",
      "Unit",
      "Purchase Price",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Current Stock": product.stockQuantity,
      "Min Required": product.minimumStock,
      Gap: product.stockGap,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
    }));

    printReport("Low Stock Report", rows, headers);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-[var(--text-secondary)]">Loading report...</div>
      </div>
    );

  if (error)
    return (
      <div className="bg-[var(--danger-dark)] text-[var(--danger-text)] p-4 rounded mb-4">{error}</div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-[var(--text-secondary)]">No data available</div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-[var(--danger-dark)] border-l-4 border-[var(--danger)] p-4 rounded">
        <h3 className="text-[var(--danger-text)] font-semibold mb-1">⚠️ Action Required</h3>
        <p className="text-[var(--danger-text)]">
          {data.summary?.outOfStock > 0 && (
            <span>
              {data.summary.outOfStock} product{data.summary.outOfStock !== 1 ? "s" : ""} out of stock.{" "}
            </span>
          )}
          {data.summary?.totalLowStock > 0 && (
            <span>
              {data.summary.totalLowStock} product{data.summary.totalLowStock !== 1 ? "s" : ""} running low.
            </span>
          )}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Low Stock Items</div>
          <div className="text-2xl font-bold text-[var(--warning)]">
            {data.summary?.totalLowStock || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Out of Stock</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            {data.summary?.outOfStock || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Potential Loss</div>
          <div className="text-2xl font-bold text-[var(--warning)]">
            ৳{formatCurrency(data.summary?.potentialLoss || 0)}
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="report-export-bar">
        <button
          onClick={handleExportCSV}
          className="report-action bg-[var(--success)] hover:bg-[var(--success-dark)] text-[var(--text)]"
        >
          <span>📥</span> Export CSV
        </button>
        <button
          onClick={handleExportExcel}
          className="report-action bg-[var(--success)] hover:bg-[var(--success-dark)] text-[var(--text)]"
        >
          <span>📊</span> Export Excel
        </button>
        <button
          onClick={handlePrint}
          className="report-action bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text)]"
        >
          <span>🖨️</span> Print
        </button>
      </div>

      {/* Low Stock Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Product</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">SKU</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Category</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Brand</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Stock</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Min</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Gap</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Loss Value</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.products && data.products.length > 0 ? (
              data.products.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-[var(--border)] ${
                    product.stockQuantity === 0
                      ? "bg-[var(--danger-dark)] bg-opacity-20"
                      : "hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{product.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{product.sku}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {product.category?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {product.brand?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--text)]">
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                    {product.minimumStock}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--danger)]">
                    -{product.stockGap}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--color-accent)] font-medium">
                    ৳{formatCurrency(Number(product.purchasePrice) * product.stockGap)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.stockQuantity === 0 ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--danger-dark)] text-[var(--danger-text)]">
                        Out
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--warning-dark)] text-[var(--warning-text)]">
                        Low
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  ✓ All products are in stock with adequate levels!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockReport;
