import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  stockIn,
  stockOut,
  adjustStock,
  getStockTransactions,
} from "../services/stock.service.js";

import {
  stockInSchema,
  stockOutSchema,
  stockAdjustmentSchema,
} from "../validations/stock.validation.js";
export const addStock = asyncHandler(async (req, res) => {
  const validatedData = stockInSchema.parse(req.body);

  const result = await stockIn({
    ...validatedData,
    createdById: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Stock added successfully."));
});
export const removeStock = asyncHandler(async (req, res) => {
  const validatedData = stockOutSchema.parse(req.body);

  const result = await stockOut({
    ...validatedData,
    createdById: req.user.id,
  });

  return res.json(new ApiResponse(200, result, "Stock removed successfully."));
});
export const adjustProductStock = asyncHandler(async (req, res) => {
  const validatedData = stockAdjustmentSchema.parse(req.body);

  const result = await adjustStock({
    ...validatedData,
    createdById: req.user.id,
  });

  return res.json(new ApiResponse(200, result, "Stock adjusted successfully."));
});
export const getTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await getStockTransactions({
    page,
    limit,
  });

  return res.json(
    new ApiResponse(200, result, "Stock transactions fetched successfully."),
  );
});
