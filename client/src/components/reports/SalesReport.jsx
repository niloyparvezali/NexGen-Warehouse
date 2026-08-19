import { useCallback, useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";
import { getSalesReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
  formatDate,
} from "../../utils/exportUtils.js";

const SalesReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSalesReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch sales report");
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
    if (!data || !data.sales) return;

    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.sales.map((sale) => ({
      "Invoice Number": sale.invoiceNumber,
      Date: formatDate(sale.createdAt),
      Customer: sale.customer?.name || "Walk-in Customer",
      Total: formatCurrency(sale.total),
      Paid: formatCurrency(sale.paidAmount),
      Due: formatCurrency(sale.dueAmount),
      Status: sale.paymentStatus,
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "sales-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.sales) return;

    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.sales.map((sale) => ({
      "Invoice Number": sale.invoiceNumber,
      Date: formatDate(sale.createdAt),
      Customer: sale.customer?.name || "Walk-in Customer",
      Total: formatCurrency(sale.total),
      Paid: formatCurrency(sale.paidAmount),
      Due: formatCurrency(sale.dueAmount),
      Status: sale.paymentStatus,
    }));

    downloadExcel(rows, headers, "sales-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.sales) return;

    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Total",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = data.sales.map((sale) => ({
      "Invoice Number": sale.invoiceNumber,
      Date: formatDate(sale.createdAt),
      Customer: sale.customer?.name || "Walk-in Customer",
      Total: formatCurrency(sale.total),
      Paid: formatCurrency(sale.paidAmount),
      Due: formatCurrency(sale.dueAmount),
      Status: sale.paymentStatus,
    }));

    printReport("Sales Report", rows, headers);
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
          <div className="report-summary-card__label">Total Invoices</div>
          <div className="report-summary-card__value text-[var(--text)]">
            {data.summary?.totalInvoices || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-card__label">Total Sales</div>
          <div className="report-summary-card__value text-[var(--text)]">
            ৳{formatCurrency(data.summary?.totalSales || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-card__label">Total Paid</div>
          <div className="report-summary-card__value text-[var(--success)]">
            ৳{formatCurrency(data.summary?.totalPaid || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-card__label">Total Due</div>
          <div className="report-summary-card__value text-[var(--danger)]">
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

      {/* Sales Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Invoice #</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Date</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Customer</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Total</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Paid</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Due</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.sales && data.sales.length > 0 ? (
              data.sales.map((sale) => (
                <tr key={sale.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {sale.customer?.name || "Walk-in Customer"}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text)] font-medium">
                    ৳{formatCurrency(sale.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--success)]">
                    ৳{formatCurrency(sale.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--danger)]">
                    ৳{formatCurrency(sale.dueAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        sale.paymentStatus === "PAID"
                          ? "bg-[var(--success-dark)] text-[var(--success-text)]"
                          : sale.paymentStatus === "PARTIAL"
                          ? "bg-[var(--warning-dark)] text-[var(--warning-text)]"
                          : "bg-[var(--danger-dark)] text-[var(--danger-text)]"
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No sales found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
