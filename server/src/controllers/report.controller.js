import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getCustomerLedgerReport,
  getProfitReport,
  getSupplierLedgerReport,
  getSupplierReport,
  getCustomerReport,
  getExpenseReport,
  getStockMovementReport,
  getLowStockReport,
} from "../services/report.service.js";

export const customerLedgerReport = asyncHandler(async (req, res) => {
  const data = await getCustomerLedgerReport(Number(req.params.customerId));

  return res.json(
    new ApiResponse(200, data, "Customer ledger report fetched successfully."),
  );
});

export const inventoryReport = asyncHandler(async (req, res) => {
  const data = await getInventoryReport();

  return res.json(
    new ApiResponse(200, data, "Inventory report fetched successfully."),
  );
});

export const purchaseReport = asyncHandler(async (req, res) => {
  const data = await getPurchaseReport(req.query);

  return res.json(
    new ApiResponse(200, data, "Purchase report fetched successfully."),
  );
});

export const salesReport = asyncHandler(async (req, res) => {
  const data = await getSalesReport(req.query);

  return res.json(
    new ApiResponse(200, data, "Sales report fetched successfully."),
  );
});

export const profitLossReport = asyncHandler(async (req, res) => {
  const data = await getProfitReport(req.query);

  return res.json(
    new ApiResponse(200, data, "Profit & loss report fetched successfully."),
  );
});

export const supplierLedgerReport = asyncHandler(async (req, res) => {
  const data = await getSupplierLedgerReport(Number(req.params.supplierId));

  return res.json(
    new ApiResponse(200, data, "Supplier ledger report fetched successfully."),
  );
});

export const supplierReport = asyncHandler(async (req, res) => {
  const data = await getSupplierReport();

  return res.json(
    new ApiResponse(200, data, "Supplier report fetched successfully."),
  );
});

export const customerReport = asyncHandler(async (req, res) => {
  const data = await getCustomerReport();

  return res.json(
    new ApiResponse(200, data, "Customer report fetched successfully."),
  );
});

export const expenseReport = asyncHandler(async (req, res) => {
  const data = await getExpenseReport(req.query);

  return res.json(
    new ApiResponse(200, data, "Expense report fetched successfully."),
  );
});

export const stockMovementReport = asyncHandler(async (req, res) => {
  const data = await getStockMovementReport(req.query);

  return res.json(
    new ApiResponse(200, data, "Stock movement report fetched successfully."),
  );
});

export const lowStockReport = asyncHandler(async (req, res) => {
  const data = await getLowStockReport();

  return res.json(
    new ApiResponse(200, data, "Low stock report fetched successfully."),
  );
});
