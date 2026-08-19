import { useCallback, useEffect, useState } from "react";
import { getSupplierReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
} from "../../utils/exportUtils.js";

const SupplierReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSupplierReport();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch supplier report");
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
    if (!data || !data.suppliers) return;

    const headers = [
      "Supplier Name",
      "Phone",
      "Email",
      "Contact Person",
      "Total Purchases",
      "Paid",
      "Payable",
      "Status",
    ];

    const rows = data.suppliers.map((supplier) => ({
      "Supplier Name": supplier.supplierName,
      Phone: supplier.mobileNumber || "N/A",
      Email: supplier.email || "N/A",
      "Contact Person": supplier.contactPerson || "N/A",
      "Total Purchases": formatCurrency(supplier.totalPurchases),
      Paid: formatCurrency(supplier.totalPurchasePaid),
      Payable: formatCurrency(supplier.totalPurchaseDue),
      Status: supplier.status,
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "supplier-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.suppliers) return;

    const headers = [
      "Supplier Name",
      "Phone",
      "Email",
      "Contact Person",
      "Total Purchases",
      "Paid",
      "Payable",
      "Status",
    ];

    const rows = data.suppliers.map((supplier) => ({
      "Supplier Name": supplier.supplierName,
      Phone: supplier.mobileNumber || "N/A",
      Email: supplier.email || "N/A",
      "Contact Person": supplier.contactPerson || "N/A",
      "Total Purchases": formatCurrency(supplier.totalPurchases),
      Paid: formatCurrency(supplier.totalPurchasePaid),
      Payable: formatCurrency(supplier.totalPurchaseDue),
      Status: supplier.status,
    }));

    downloadExcel(rows, headers, "supplier-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.suppliers) return;

    const headers = [
      "Supplier Name",
      "Phone",
      "Email",
      "Contact Person",
      "Total Purchases",
      "Paid",
      "Payable",
      "Status",
    ];

    const rows = data.suppliers.map((supplier) => ({
      "Supplier Name": supplier.supplierName,
      Phone: supplier.mobileNumber || "N/A",
      Email: supplier.email || "N/A",
      "Contact Person": supplier.contactPerson || "N/A",
      "Total Purchases": formatCurrency(supplier.totalPurchases),
      Paid: formatCurrency(supplier.totalPurchasePaid),
      Payable: formatCurrency(supplier.totalPurchaseDue),
      Status: supplier.status,
    }));

    printReport("Supplier Report", rows, headers);
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
          <div className="text-[var(--text-secondary)] text-sm">Total Suppliers</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            {data.summary?.totalSuppliers || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Active Suppliers</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            {data.summary?.activeSuppliers || 0}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Payable</div>
          <div className="text-2xl font-bold text-[var(--text)]">
            ৳{formatCurrency(data.summary?.totalPayable || 0)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Pending</div>
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

      {/* Supplier Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">
                Supplier Name
              </th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Phone</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Email</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">
                Contact Person
              </th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">
                Total Purchases
              </th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Paid</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Payable</th>
              <th className="px-4 py-3 text-center text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.suppliers && data.suppliers.length > 0 ? (
              data.suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {supplier.supplierName}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {supplier.mobileNumber || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {supplier.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {supplier.contactPerson || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text)] font-medium">
                    ৳{formatCurrency(supplier.totalPurchases)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--success)]">
                    ৳{formatCurrency(supplier.totalPurchasePaid)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--danger)]">
                    ৳{formatCurrency(supplier.totalPurchaseDue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        supplier.status === "ACTIVE"
                          ? "bg-[var(--success-dark)] text-[var(--success-text)]"
                          : "bg-[var(--danger-dark)] text-[var(--danger-text)]"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No suppliers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierReport;
