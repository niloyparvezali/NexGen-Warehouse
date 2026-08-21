import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  getSettings,
  updateSettings,
  ensureDefaultRoles,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  changePassword,
  assignUserRole,
  resetUserData,
  resetStockData,
  resetSalesData,
  resetPurchasesData,
  resetExpensesData,
  resetReturnData,
  resetReportsData,
  resetCustomerData,
  resetSupplierData,
  backupDatabase,
  restoreDatabase,
  getBackupHistory,
} from "../services/settings.service.js";
import {
  settingsSchema,
  roleSchema,
  userSchema,
  passwordSchema,
  backupSchema,
} from "../validations/settings.validation.js";

export const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  return ApiResponse.success(res, settings, "Settings fetched successfully.");
});

export const updateSystemSettings = asyncHandler(async (req, res) => {
  const validatedData = settingsSchema.parse(req.body);
  const settings = await updateSettings(validatedData);
  return ApiResponse.success(res, settings, "Settings updated successfully.");
});

export const getRoles = asyncHandler(async (req, res) => {
  await ensureDefaultRoles();
  const roles = await getAllRoles();
  return ApiResponse.success(res, roles, "Roles fetched successfully.");
});

export const createNewRole = asyncHandler(async (req, res) => {
  const validatedData = roleSchema.parse(req.body);
  const role = await createRole(validatedData);
  return ApiResponse.success(res, role, "Role created successfully.", 201);
});

export const updateExistingRole = asyncHandler(async (req, res) => {
  const validatedData = roleSchema.parse(req.body);
  const role = await updateRole(req.params.id, validatedData);
  return ApiResponse.success(res, role, "Role updated successfully.");
});

export const removeRole = asyncHandler(async (req, res) => {
  await deleteRole(req.params.id);
  return ApiResponse.success(res, null, "Role deleted successfully.");
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  return ApiResponse.success(res, users, "Users fetched successfully.");
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  return ApiResponse.success(res, user, "User fetched successfully.");
});

export const createNewUser = asyncHandler(async (req, res) => {
  const validatedData = userSchema.parse(req.body);
  const user = await createUser(validatedData);
  return ApiResponse.success(res, user, "User created successfully.", 201);
});

export const updateExistingUser = asyncHandler(async (req, res) => {
  const validatedData = userSchema.parse(req.body);
  const user = await updateUser(req.params.id, validatedData);
  return ApiResponse.success(res, user, "User updated successfully.");
});

export const toggleUserActivation = asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  const user = await toggleUserStatus(req.params.id, is_active);
  return ApiResponse.success(res, user, "User status updated successfully.");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const validatedData = passwordSchema.parse(req.body);
  await resetUserPassword(req.params.id, validatedData.password);
  return ApiResponse.success(res, null, "Password reset successfully.");
});

export const changeOwnPassword = asyncHandler(async (req, res) => {
  const validatedData = passwordSchema.parse(req.body);
  await changePassword(req.user.id, validatedData.password);
  return ApiResponse.success(res, null, "Password changed successfully.");
});

export const assignRoleToUser = asyncHandler(async (req, res) => {
  const { role_id } = req.body;
  const user = await assignUserRole(req.params.id, role_id);
  return ApiResponse.success(res, user, "Role assigned successfully.");
});

export const resetUserDataSystem = asyncHandler(async (req, res) => {
  await resetUserData();
  return ApiResponse.success(res, null, "All user-created business data reset successfully.");
});

export const resetStockSystem = asyncHandler(async (req, res) => {
  await resetStockData();
  return ApiResponse.success(res, null, "Stock data reset successfully.");
});

export const resetSalesSystem = asyncHandler(async (req, res) => {
  await resetSalesData();
  return ApiResponse.success(res, null, "Sales data reset successfully.");
});

export const resetPurchasesSystem = asyncHandler(async (req, res) => {
  await resetPurchasesData();
  return ApiResponse.success(res, null, "Purchases data reset successfully.");
});

export const resetExpensesSystem = asyncHandler(async (req, res) => {
  await resetExpensesData();
  return ApiResponse.success(res, null, "Expense data reset successfully.");
});

export const resetReturnsSystem = asyncHandler(async (req, res) => {
  await resetReturnData();
  return ApiResponse.success(res, null, "Easy return data reset successfully.");
});

export const resetReportsSystem = asyncHandler(async (req, res) => {
  await resetReportsData();
  return ApiResponse.success(res, null, "Reports and analytics data reset successfully.");
});

export const resetCustomerSystem = asyncHandler(async (req, res) => {
  await resetCustomerData();
  return ApiResponse.success(res, null, "Customer data reset successfully.");
});

export const resetSupplierSystem = asyncHandler(async (req, res) => {
  await resetSupplierData();
  return ApiResponse.success(res, null, "Supplier data reset successfully.");
});

export const backupSystem = asyncHandler(async (req, res) => {
  const result = await backupDatabase();
  return ApiResponse.success(res, result, "Backup created successfully.");
});

export const restoreSystem = asyncHandler(async (req, res) => {
  const validatedData = backupSchema.parse(req.body);
  const result = await restoreDatabase(validatedData.filePath);
  return ApiResponse.success(res, result, "Restore completed successfully.");
});

export const getBackupList = asyncHandler(async (req, res) => {
  const backups = await getBackupHistory();
  return ApiResponse.success(res, backups, "Backup history fetched successfully.");
});
