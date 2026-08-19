import { useCallback, useEffect, useState } from "react";
import { getInventoryReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
} from "../../utils/exportUtils.js";

const InventoryReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInventoryReport();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch inventory report");
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
      "Stock Qty",
      "Min Stock",
      "Unit",
      "Purchase Price",
      "Stock Value",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Stock Qty": product.stockQuantity,
      "Min Stock": product.minimumStock,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
      "Stock Value": formatCurrency(product.stockValue),
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "inventory-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.products) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Stock Qty",
      "Min Stock",
      "Unit",
      "Purchase Price",
      "Stock Value",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Stock Qty": product.stockQuantity,
      "Min Stock": product.minimumStock,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
      "Stock Value": formatCurrency(product.stockValue),
    }));

    downloadExcel(rows, headers, "inventory-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.products) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Stock Qty",
      "Min Stock",
      "Unit",
      "Purchase Price",
      "Stock Value",
    ];

    const rows = data.products.map((product) => ({
      "Product Name": product.name,
      SKU: product.sku,
      Category: product.category?.name || "N/A",
      Brand: product.brand?.name || "N/A",
      "Stock Qty": product.stockQuantity,
      "Min Stock": product.minimumStock,
      Unit: product.unit?.name || "N/A",
      "Purchase Price": formatCurrency(product.purchasePrice),
      "Stock Value": formatCurrency(product.stockValue),
    }));

    printReport("Inventory Report", rows, headers);
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
      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Products</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalProducts || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Stock</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalStock || 0} units
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Stock Value</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            ৳{formatCurrency(data.summary?.stockValue || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Low Stock Items</div>
          <div className="text-2xl font-bold text-[var(--warning)]">
            {data.summary?.lowStock || 0}
          </div>
        </div>

        <div className="report-summary-card md:col-span-2">
          <div className="text-[var(--text-secondary)] text-sm">Out of Stock</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            {data.summary?.outOfStock || 0}
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

      {/* Inventory Table */}
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
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Value</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.products && data.products.length > 0 ? (
              data.products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{product.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{product.sku}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {product.category?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {product.brand?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--text)] font-medium">
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                    {product.minimumStock}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text)] font-medium">
                    ৳{formatCurrency(product.stockValue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.stockQuantity === 0 ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--danger-dark)] text-[var(--danger-text)]">
                        Out of Stock
                      </span>
                    ) : product.stockQuantity <= product.minimumStock ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--warning-dark)] text-[var(--warning-text)]">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--success-dark)] text-[var(--success-text)]">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryReport;
