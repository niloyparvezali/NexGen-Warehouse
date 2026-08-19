import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  salesReport,
  purchaseReport,
  inventoryReport,
  customerLedgerReport,
  profitLossReport,
  supplierLedgerReport,
  supplierReport,
  customerReport,
  expenseReport,
  stockMovementReport,
  lowStockReport,
} from "../controllers/report.controller.js";

const router = Router();

router.get("/sales", authenticate, salesReport);

router.get("/purchases", authenticate, purchaseReport);

router.get("/inventory", authenticate, inventoryReport);

router.get("/profit-loss", authenticate, profitLossReport);

router.get("/customer-ledger/:customerId", authenticate, customerLedgerReport);

router.get("/supplier-ledger/:supplierId", authenticate, supplierLedgerReport);

router.get("/suppliers", authenticate, supplierReport);

router.get("/customers", authenticate, customerReport);

router.get("/expenses", authenticate, expenseReport);

router.get("/stock-movements", authenticate, stockMovementReport);

router.get("/low-stock", authenticate, lowStockReport);

export default router;
