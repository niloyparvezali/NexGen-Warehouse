import { useCallback, useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";
import { getStockMovementReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatDate,
} from "../../utils/exportUtils.js";

const StockMovementReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStockMovementReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch stock movement report");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadReport = async () => {
      await fetchReport();
    };

    void loadReport();
  }, [fetchReport]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "STOCK_IN":
        return "bg-[var(--success-dark)] text-[var(--success-text)]";
      case "STOCK_OUT":
        return "bg-[var(--danger-dark)] text-[var(--danger-text)]";
      case "ADJUSTMENT":
        return "bg-[var(--warning-dark)] text-[var(--warning-text)]";
      default:
        return "bg-[var(--surface-muted)] text-[var(--text-secondary)]";
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.movements) return;

    const headers = [
      "Date",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Reference",
    ];

    const rows = data.movements.map((movement) => ({
      Date: formatDate(movement.createdAt),
      Product: movement.product?.name || "Unknown",
      SKU: movement.product?.sku || "N/A",
      Type: movement.type,
      Quantity: movement.quantity,
      Reference: movement.reference || "N/A",
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "stock-movement-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.movements) return;

    const headers = [
      "Date",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Reference",
    ];

    const rows = data.movements.map((movement) => ({
      Date: formatDate(movement.createdAt),
      Product: movement.product?.name || "Unknown",
      SKU: movement.product?.sku || "N/A",
      Type: movement.type,
      Quantity: movement.quantity,
      Reference: movement.reference || "N/A",
    }));

    downloadExcel(rows, headers, "stock-movement-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.movements) return;

    const headers = [
      "Date",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Reference",
    ];

    const rows = data.movements.map((movement) => ({
      Date: formatDate(movement.createdAt),
      Product: movement.product?.name || "Unknown",
      SKU: movement.product?.sku || "N/A",
      Type: movement.type,
      Quantity: movement.quantity,
      Reference: movement.reference || "N/A",
    }));

    printReport("Stock Movement Report", rows, headers);
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
      <ReportFilters onFilter={handleFilter} showDateRange />

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Movements</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalMovements || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Stock In</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            +{data.summary?.stockIn || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Stock Out</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            -{data.summary?.stockOut || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Adjustments</div>
          <div className="text-2xl font-bold text-[var(--warning)]">
            ±{data.summary?.adjustments || 0}
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

      {/* Stock Movement Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Date</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Product</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">SKU</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Type</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Quantity</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Reference</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Note</th>
            </tr>
          </thead>
          <tbody>
            {data.movements && data.movements.length > 0 ? (
              data.movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(movement.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {movement.product?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {movement.product?.sku || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(movement.type)}`}>
                      {movement.type === "STOCK_IN"
                        ? "In"
                        : movement.type === "STOCK_OUT"
                        ? "Out"
                        : "Adj"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--text)]">
                    {movement.type === "STOCK_IN" ? "+" : "-"}
                    {movement.quantity}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {movement.reference || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {movement.note || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No stock movements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementReport;
