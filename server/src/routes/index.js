import { Router } from "express";

import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import categoryRoutes from "./category.routes.js";
import brandRoutes from "./brand.routes.js";
import unitRoutes from "./unit.routes.js";
import productRoutes from "./product.routes.js";
import stockRoutes from "./stock.routes.js";
import supplierRoutes from "./supplier.routes.js";
import purchaseRoutes from "./purchase.routes.js";
import customerRoutes from "./customer.routes.js";
import saleRoutes from "./sale.routes.js";
import customerPaymentRoutes from "./customerPayment.routes.js";
import customerLedgerRoutes from "./customerLedger.routes.js";
import supplierPaymentRoutes from "./supplierPayment.routes.js";
import supplierLedgerRoutes from "./supplierLedger.routes.js";
import reportRoutes from "./report.routes.js";
import expenseRoutes from "./expense.routes.js";
import expenseCategoryRoutes from "./expenseCategory.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);

router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/units", unitRoutes);
router.use("/products", productRoutes);
router.use("/stock", stockRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/customers", customerRoutes);
router.use("/sales", saleRoutes);
router.use("/customer-payments", customerPaymentRoutes);
router.use("/customer-ledger", customerLedgerRoutes);
router.use("/supplier-payments", supplierPaymentRoutes);
router.use("/supplier-ledger", supplierLedgerRoutes);
router.use("/reports", reportRoutes);
router.use("/expense-categories", expenseCategoryRoutes);
router.use("/expenses", expenseRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/settings", settingsRoutes);

export default router;
