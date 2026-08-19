import { Router } from "express";
import {
  getSystemSettings,
  updateSystemSettings,
  getRoles,
  createNewRole,
  updateExistingRole,
  removeRole,
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  toggleUserActivation,
  resetPassword,
  changeOwnPassword,
  assignRoleToUser,
  resetUserDataSystem,
  resetStockSystem,
  resetSalesSystem,
  resetPurchasesSystem,
  resetExpensesSystem,
  resetReturnsSystem,
  resetReportsSystem,
  resetCustomerSystem,
  resetSupplierSystem,
  backupSystem,
  restoreSystem,
  getBackupList,
} from "../controllers/settings.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();
router.use(authenticate);

router.get("/company", getSystemSettings);
router.put("/company", authorize("Administrator", "Manager", "Super Admin"), updateSystemSettings);

router.get("/roles", getRoles);
router.post("/roles", authorize("Administrator", "Super Admin"), createNewRole);
router.put("/roles/:id", authorize("Administrator", "Super Admin"), updateExistingRole);
router.delete("/roles/:id", authorize("Administrator", "Super Admin"), removeRole);

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", authorize("Administrator", "Super Admin"), createNewUser);
router.put("/users/:id", authorize("Administrator", "Super Admin"), updateExistingUser);
router.patch("/users/:id/status", authorize("Administrator", "Super Admin"), toggleUserActivation);
router.post("/users/:id/reset-password", authorize("Administrator", "Super Admin"), resetPassword);
router.post("/change-password", changeOwnPassword);
router.post("/users/:id/assign-role", authorize("Administrator", "Super Admin"), assignRoleToUser);
router.post("/reset-user-data", authorize("Administrator", "Super Admin"), resetUserDataSystem);
router.post("/reset-stock-data", authorize("Administrator", "Super Admin"), resetStockSystem);
router.post("/reset-sales-data", authorize("Administrator", "Super Admin"), resetSalesSystem);
router.post("/reset-purchases-data", authorize("Administrator", "Super Admin"), resetPurchasesSystem);
router.post("/reset-expenses-data", authorize("Administrator", "Super Admin"), resetExpensesSystem);
router.post("/reset-returns-data", authorize("Administrator", "Super Admin"), resetReturnsSystem);
router.post("/reset-reports-data", authorize("Administrator", "Super Admin"), resetReportsSystem);
router.post("/reset-customer-data", authorize("Administrator", "Super Admin"), resetCustomerSystem);
router.post("/reset-supplier-data", authorize("Administrator", "Super Admin"), resetSupplierSystem);

router.post("/backup", authorize("Administrator", "Super Admin"), backupSystem);
router.post("/restore", authorize("Administrator", "Super Admin"), restoreSystem);
router.get("/backups", getBackupList);

export default router;
