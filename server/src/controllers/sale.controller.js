import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllSales,
  getSaleById,
  createSale,
  createSaleReturn,
  deleteSale,
  restoreSale,
  updateSaleStatus,
} from "../services/sale.service.js";

import {
  createSaleSchema,
  createSaleReturnSchema,
  updateSaleStatusSchema,
} from "../validations/sale.validation.js";

// Get All Sales
export const getSales = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllSales({
    page,
    limit,
    search,
  });

  return res.json(new ApiResponse(200, result, "Sales fetched successfully."));
});

// Get Sale By ID
export const getSale = asyncHandler(async (req, res) => {
  const sale = await getSaleById(req.params.id);

  if (!sale) {
    throw new ApiError(404, "Sale not found.");
  }

  return res.json(new ApiResponse(200, sale, "Sale fetched successfully."));
});

// Create Sale
export const createNewSale = asyncHandler(async (req, res) => {
  const validatedData = createSaleSchema.parse(req.body);

  const sale = await createSale(validatedData, req.user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, sale, "Sale created successfully."));
});

// Delete Sale
export const removeSale = asyncHandler(async (req, res) => {
  const sale = await getSaleById(req.params.id);

  if (!sale) {
    throw new ApiError(404, "Sale not found.");
  }

  await deleteSale(req.params.id);

  return res.json(new ApiResponse(200, null, "Sale deleted successfully."));
});

// Restore Sale
export const restoreExistingSale = asyncHandler(async (req, res) => {
  const sale = await getSaleById(req.params.id, true);

  if (!sale) {
    throw new ApiError(404, "Sale not found.");
  }

  const restored = await restoreSale(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Sale restored successfully."),
  );
});

// Create Sale Return
export const createSaleReturnController = asyncHandler(async (req, res) => {
  const validatedData = createSaleReturnSchema.parse(req.body);

  const saleReturn = await createSaleReturn(req.params.id, validatedData, req.user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, saleReturn, "Sale return created successfully."));
});

// Update Sale Status
export const updateExistingSaleStatus = asyncHandler(async (req, res) => {
  const { status } = updateSaleStatusSchema.parse(req.body);

  const sale = await getSaleById(req.params.id);

  if (!sale) {
    throw new ApiError(404, "Sale not found.");
  }

  const updated = await updateSaleStatus(req.params.id, status);

  return res.json(
    new ApiResponse(200, updated, "Sale status updated successfully."),
  );
});
