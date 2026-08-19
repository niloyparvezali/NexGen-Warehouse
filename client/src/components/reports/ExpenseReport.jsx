import { useCallback, useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";
import { getExpenseReport } from "../../services/reports.service.js";
import {
  downloadCSV,
  downloadExcel,
  printReport,
  convertToCSV,
  formatCurrency,
  formatDate,
} from "../../utils/exportUtils.js";

const ExpenseReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getExpenseReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch expense report");
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
    if (!data || !data.expenses) return;

    const headers = [
      "Expense #",
      "Date",
      "Category",
      "Description",
      "Amount",
      "Payment Method",
    ];

    const rows = data.expenses.map((expense) => ({
      "Expense #": expense.expenseNumber,
      Date: formatDate(expense.expenseDate),
      Category: expense.category,
      Description: expense.description,
      Amount: formatCurrency(expense.amount),
      "Payment Method": expense.paymentMethod,
    }));

    const csv = convertToCSV(rows, headers);
    downloadCSV(csv, "expense-report.csv");
  };

  const handleExportExcel = () => {
    if (!data || !data.expenses) return;

    const headers = [
      "Expense #",
      "Date",
      "Category",
      "Description",
      "Amount",
      "Payment Method",
    ];

    const rows = data.expenses.map((expense) => ({
      "Expense #": expense.expenseNumber,
      Date: formatDate(expense.expenseDate),
      Category: expense.category,
      Description: expense.description,
      Amount: formatCurrency(expense.amount),
      "Payment Method": expense.paymentMethod,
    }));

    downloadExcel(rows, headers, "expense-report.xlsx");
  };

  const handlePrint = () => {
    if (!data || !data.expenses) return;

    const headers = [
      "Expense #",
      "Date",
      "Category",
      "Description",
      "Amount",
      "Payment Method",
    ];

    const rows = data.expenses.map((expense) => ({
      "Expense #": expense.expenseNumber,
      Date: formatDate(expense.expenseDate),
      Category: expense.category,
      Description: expense.description,
      Amount: formatCurrency(expense.amount),
      "Payment Method": expense.paymentMethod,
    }));

    printReport("Expense Report", rows, headers);
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

      {/* Summary Card */}
      <div className="report-summary-grid report-summary-grid--compact">
        <div className="report-summary-card">
          <div className="report-summary-card__label">Total Expenses</div>
          <div className="report-summary-card__value">{data.summary?.totalExpenses || 0}</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-card__label">Total Amount</div>
          <div className="report-summary-card__value text-[var(--danger)]">৳{formatCurrency(data.summary?.totalAmount || 0)}</div>
        </div>

        {/* Category Breakdown */}
        {data.summary?.byCategory && Object.keys(data.summary.byCategory).length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border-strong)]">
            <div className="text-[var(--text-secondary)] text-sm mb-3">By Category</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(data.summary.byCategory).map(
                ([category, { count, total }]) => (
                  <div key={category} className="bg-[var(--surface-light)] rounded p-3">
                    <div className="text-[var(--text-secondary)] text-xs">{category}</div>
                    <div className="text-[var(--text)] font-medium">
                      {count} expense{count !== 1 ? "s" : ""}
                    </div>
                    <div className="text-[var(--color-accent)] text-sm">
                      ৳{formatCurrency(total)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
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

      {/* Expense Table */}
      <div className="report-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-strong)]">
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">
                Expense #
              </th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Date</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Category</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Description</th>
              <th className="px-4 py-3 text-right text-[var(--text-secondary)]">Amount</th>
              <th className="px-4 py-3 text-left text-[var(--text-secondary)]">Method</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses && data.expenses.length > 0 ? (
              data.expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {expense.expenseNumber}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {expense.category}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {expense.description}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--danger)] font-medium">
                    ৳{formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {expense.paymentMethod}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseReport;
