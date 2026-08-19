import { useCallback, useEffect, useState } from "react";
import { getCustomerReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
} from "../../utils/exportUtils.js";

const CustomerReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCustomerReport();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch customer report");
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
    if (!data || !data.customers) return;

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Type",
      "Total Sales",
      "Paid",
      "Outstanding",
      "Status",
    ];

    const rows = data.customers.map((customer) => ({
      "Customer Name": customer.name,
      Phone: customer.phone || "N/A",
      Email: customer.email || "N/A",
      Type: customer.customerType,
      "Total Sales": formatCurrency(customer.totalSales),
      Paid: formatCurrency(customer.totalSalesPaid),
      Outstanding: formatCurrency(customer.totalSalesDue),
      Status: customer.status,
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "customer-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.customers) return;

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Type",
      "Total Sales",
      "Paid",
      "Outstanding",
      "Status",
    ];

    const rows = data.customers.map((customer) => ({
      "Customer Name": customer.name,
      Phone: customer.phone || "N/A",
      Email: customer.email || "N/A",
      Type: customer.customerType,
      "Total Sales": formatCurrency(customer.totalSales),
      Paid: formatCurrency(customer.totalSalesPaid),
      Outstanding: formatCurrency(customer.totalSalesDue),
      Status: customer.status,
    }));

    downloadExcel(rows, headers, "customer-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.customers) return;

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Type",
      "Total Sales",
      "Paid",
      "Outstanding",
      "Status",
    ];

    const rows = data.customers.map((customer) => ({
      "Customer Name": customer.name,
      Phone: customer.phone || "N/A",
      Email: customer.email || "N/A",
      Type: customer.customerType,
      "Total Sales": formatCurrency(customer.totalSales),
      Paid: formatCurrency(customer.totalSalesPaid),
      Outstanding: formatCurrency(customer.totalSalesDue),
      Status: customer.status,
    }));

    printReport("Customer Report", rows, headers);
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
          <div className="text-[var(--text-secondary)] text-sm">Total Customers</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalCustomers || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Active Customers</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            {data.summary?.activeCustomers || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Revenue</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            ৳{formatCurrency(data.summary?.totalRevenue || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Outstanding</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            ৳{formatCurrency(data.summary?.totalOutstanding || 0)}
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

      {/* Customer Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">
                Customer Name
              </th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Phone</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Email</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Type</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">
                Total Sales
              </th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Paid</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">
                Outstanding
              </th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.customers && data.customers.length > 0 ? (
              data.customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{customer.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {customer.phone || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {customer.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {customer.customerType}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text)] font-medium">
                    ৳{formatCurrency(customer.totalSales)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--success)]">
                    ৳{formatCurrency(customer.totalSalesPaid)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--danger)]">
                    ৳{formatCurrency(customer.totalSalesDue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.status === "ACTIVE"
                          ? "bg-[var(--success-dark)] text-[var(--success-text)]"
                          : "bg-[var(--danger-dark)] text-[var(--danger-text)]"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerReport;
