import { useCallback, useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";
import { getProfitLossReport } from "../../services/reports.service.js";
import {
  downloadExcel,
  printReport,
  formatCurrency,
} from "../../utils/exportUtils.js";

const ProfitLossReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfitLossReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch profit & loss report");
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
    if (!data) return;

    const rows = [
      {
        Description: "Revenue",
        Amount: formatCurrency(data.revenue),
      },
      {
        Description: "Cost of Goods Sold (COGS)",
        Amount: formatCurrency(data.costOfGoodsSold),
      },
      {
        Description: "Gross Profit",
        Amount: formatCurrency(data.grossProfit),
      },
      {
        Description: "Operating Expenses",
        Amount: formatCurrency(data.expenses),
      },
      {
        Description: "Net Profit/Loss",
        Amount: formatCurrency(data.netProfit),
      },
    ];

    const csv = "Description,Amount\n" + rows.map((r) => `"${r.Description}","${r.Amount}"`).join("\n");
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    element.setAttribute("download", "profit-loss-report.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportExcel = () => {
    if (!data) return;

    const rows = [
      {
        Description: "Revenue",
        Amount: formatCurrency(data.revenue),
      },
      {
        Description: "Cost of Goods Sold (COGS)",
        Amount: formatCurrency(data.costOfGoodsSold),
      },
      {
        Description: "Gross Profit",
        Amount: formatCurrency(data.grossProfit),
      },
      {
        Description: "Operating Expenses",
        Amount: formatCurrency(data.expenses),
      },
      {
        Description: "Net Profit/Loss",
        Amount: formatCurrency(data.netProfit),
      },
    ];

    downloadExcel(rows, ["Description", "Amount"], "profit-loss-report.xlsx");
  };

  const handlePrint = () => {
    if (!data) return;

    const rows = [
      {
        Description: "Revenue",
        Amount: formatCurrency(data.revenue),
      },
      {
        Description: "Cost of Goods Sold (COGS)",
        Amount: formatCurrency(data.costOfGoodsSold),
      },
      {
        Description: "Gross Profit",
        Amount: formatCurrency(data.grossProfit),
      },
      {
        Description: "Operating Expenses",
        Amount: formatCurrency(data.expenses),
      },
      {
        Description: "Net Profit/Loss",
        Amount: formatCurrency(data.netProfit),
      },
    ];

    printReport("Profit & Loss Report", rows, ["Description", "Amount"]);
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

  const profitMargin =
    data.revenue > 0
      ? ((data.netProfit / data.revenue) * 100).toFixed(2)
      : 0;

  return (
    <div className="space-y-6">
      <ReportFilters onFilter={handleFilter} showDateRange />

      {/* Key Metrics */}
      <div className="report-summary-grid report-summary-grid--compact">
        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Revenue</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            ৳{formatCurrency(data.revenue)}
          </div>
        </div>

        <div className="report-summary-card">
          <div className="text-[var(--text-secondary)] text-sm">Total Expenses</div>
          <div className="text-2xl font-bold text-[var(--danger)]">
            ৳{formatCurrency(data.expenses)}
          </div>
        </div>

        <div
          className={`bg-[var(--surface-muted)] rounded-lg p-4 ${
            data.netProfit >= 0 ? "border-2 border-[var(--success)]" : "border-2 border-[var(--danger)]"
          }`}
        >
          <div className="text-[var(--text-secondary)] text-sm">Net Profit/Loss</div>
          <div
            className={`text-2xl font-bold ${
              data.netProfit >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            ৳{formatCurrency(data.netProfit)}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Margin: {profitMargin}%
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="report-statement-panel">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
          Profit & Loss Statement
        </h3>

        <div className="space-y-4">
          {/* Revenue Section */}
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-strong)]">
              <div className="text-[var(--text-secondary)]">Revenue</div>
              <div className="text-[var(--text)] font-medium">
                ৳{formatCurrency(data.revenue)}
              </div>
            </div>
          </div>

          {/* COGS Section */}
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-strong)]">
              <div className="text-[var(--text-secondary)]">Cost of Goods Sold (COGS)</div>
              <div className="text-[var(--danger)]">
                -৳{formatCurrency(data.costOfGoodsSold)}
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div>
            <div className="flex justify-between items-center pb-3 bg-[var(--surface-light)] -mx-6 px-4 py-3 rounded">
              <div className="text-[var(--text-secondary)] font-medium">Gross Profit</div>
              <div className="text-[var(--success)] font-medium">
                ৳{formatCurrency(data.grossProfit)}
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="mt-6">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-strong)]">
              <div className="text-[var(--text-secondary)]">Operating Expenses</div>
              <div className="text-[var(--danger)]">
                -৳{formatCurrency(data.expenses)}
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="mt-6">
            <div
              className={`flex justify-between items-center pb-3 bg-gradient-to-r rounded p-4 ${
                data.netProfit >= 0
                  ? "from-[var(--success-gradient-start)] to-[var(--success-gradient-end)]"
                  : "from-[var(--danger-gradient-start)] to-[var(--danger-gradient-end)]"
              }`}
            >
              <div className="text-[var(--text)] font-bold text-lg">
                Net Profit/Loss
              </div>
              <div
                className={`font-bold text-lg ${
                  data.netProfit >= 0 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"
                }`}
              >
                ৳{formatCurrency(data.netProfit)}
              </div>
            </div>
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
    </div>
  );
};

export default ProfitLossReport;
