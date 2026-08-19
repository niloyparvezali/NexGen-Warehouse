import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getDashboardSummary } from "../services/dashboard.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary();

  return ApiResponse.success(res, data, "Dashboard data fetched successfully.");
});
