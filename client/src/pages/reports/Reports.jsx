import { useState } from "react";
import Button from "../../components/ui/Button";
import SalesReport from "../../components/reports/SalesReport";
import PurchaseReport from "../../components/reports/PurchaseReport";
import InventoryReport from "../../components/reports/InventoryReport";
import CustomerReport from "../../components/reports/CustomerReport";
import SupplierReport from "../../components/reports/SupplierReport";
import ExpenseReport from "../../components/reports/ExpenseReport";
import ProfitLossReport from "../../components/reports/ProfitLossReport";
import StockMovementReport from "../../components/reports/StockMovementReport";
import LowStockReport from "../../components/reports/LowStockReport";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");

  const tabs = [
    { id: "sales", label: "Sales Report" },
    { id: "purchases", label: "Purchase Report" },
    { id: "inventory", label: "Inventory Report" },
    { id: "customers", label: "Customer Report" },
    { id: "suppliers", label: "Supplier Report" },
    { id: "expenses", label: "Expense Report" },
    { id: "profit-loss", label: "Profit & Loss" },
    { id: "stock-movements", label: "Stock Movements" },
    { id: "low-stock", label: "Low Stock" },
  ];

  const renderReport = () => {
    switch (activeTab) {
      case "sales":
        return <SalesReport />;
      case "purchases":
        return <PurchaseReport />;
      case "inventory":
        return <InventoryReport />;
      case "customers":
        return <CustomerReport />;
      case "suppliers":
        return <SupplierReport />;
      case "expenses":
        return <ExpenseReport />;
      case "profit-loss":
        return <ProfitLossReport />;
      case "stock-movements":
        return <StockMovementReport />;
      case "low-stock":
        return <LowStockReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <div className="wc-page world-module world-reports space-y-5 page-container report-page">
      <div>
        <h1 className="page-title mb-4">Reports & Analytics</h1>

        {/* Tab Navigation */}
        <div className="report-tabs">
          {tabs.map((tab) => (
            <Button key={tab.id} size="sm" variant={activeTab === tab.id ? "secondary" : "ghost"} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="report-panel">
        {renderReport()}
      </div>
    </div>
  );
};

export default Reports;

