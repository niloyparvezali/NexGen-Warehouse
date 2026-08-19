import { useCallback, useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";
import { getPurchaseReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
  formatDate,
} from "../../utils/exportUtils.js";

const PurchaseReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPurchaseReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch purchase report");
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

  const handleExportCSV = () => {
    if (!data || !data.purchases) return;

    const headers = [
      "PO Number",
      "Date",
      "Supplier",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.purchases.map((purchase) => ({
      "PO Number": purchase.purchaseNumber,
      Date: formatDate(purchase.createdAt),
      Supplier: purchase.supplier?.name || "Unknown",
      Total: formatCurrency(purchase.total),
      Paid: formatCurrency(purchase.paidAmount),
      Due: formatCurrency(purchase.dueAmount),
      Status: purchase.paymentStatus,
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "purchase-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.purchases) return;

    const headers = [
      "PO Number",
      "Date",
      "Supplier",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.purchases.map((purchase) => ({
      "PO Number": purchase.purchaseNumber,
      Date: formatDate(purchase.createdAt),
      Supplier: purchase.supplier?.name || "Unknown",
      Total: formatCurrency(purchase.total),
      Paid: formatCurrency(purchase.paidAmount),
      Due: formatCurrency(purchase.dueAmount),
      Status: purchase.paymentStatus,
    }));

    downloadExcel(rows, headers, "purchase-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.purchases) return;

    const headers = [
      "PO Number",
      "Date",
      "Supplier",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.purchases.map((purchase) => ({
      "PO Number": purchase.purchaseNumber,
      Date: formatDate(purchase.createdAt),
      Supplier: purchase.supplier?.name || "Unknown",
      Total: formatCurrency(purchase.total),
      Paid: formatCurrency(purchase.paidAmount),
      Due: formatCurrency(purchase.dueAmount),
      Status: purchase.paymentStatus,
    }));

    printReport("Purchase Report", rows, headers);
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
      <ReportFilters onFilter={handleFilter} showDateRange showPaymentStatus />

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Purchases</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalPurchases || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Amount</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            ৳{formatCurrency(data.summary?.totalAmount || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Paid</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            ৳{formatCurrency(data.summary?.totalPaid || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Due</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            ৳{formatCurrency(data.summary?.totalDue || 0)}
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

      {/* Purchase Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">PO Number</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Date</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Supplier</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Total</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Paid</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Due</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.purchases && data.purchases.length > 0 ? (
              data.purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {purchase.purchaseNumber}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(purchase.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {purchase.supplier?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text)] font-medium">
                    ৳{formatCurrency(purchase.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--success)]">
                    ৳{formatCurrency(purchase.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--danger)]">
                    ৳{formatCurrency(purchase.dueAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        purchase.paymentStatus === "PAID"
                          ? "bg-[var(--success-dark)] text-[var(--success-text)]"
                          : purchase.paymentStatus === "PARTIAL"
                          ? "bg-[var(--warning-dark)] text-[var(--warning-text)]"
                          : "bg-[var(--danger-dark)] text-[var(--danger-text)]"
                      }`}
                    >
                      {purchase.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No purchases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseReport;
