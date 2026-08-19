import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import prisma from "../config/prisma.js";
import { stockAdjustmentSchema } from "../validations/stock.validation.js";
import {
  getInventoryItems,
  getInventoryMovements,
} from "../services/inventory.service.js";
import { adjustStock } from "../services/stock.service.js";

export const listInventory = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const lowStockOnly = req.query.lowStockOnly === "true";
  const category = req.query.category || "";

  const result = await getInventoryItems({
    page,
    limit,
    search,
    lowStockOnly,
    category,
  });

  return res.json(
    new ApiResponse(200, result, "Inventory fetched successfully."),
  );
});

export const listInventoryMovements = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const productId = req.query.productId || "";

  const result = await getInventoryMovements({
    page,
    limit,
    search,
    productId,
  });

  return res.json(
    new ApiResponse(200, result, "Inventory movements fetched successfully."),
  );
});

export const adjustInventory = asyncHandler(async (req, res) => {
  const validatedData = stockAdjustmentSchema.parse(req.body);

  const product = await prisma.product.findFirst({
    where: {
      id: validatedData.productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const result = await adjustStock({
    ...validatedData,
    createdById: req.user.id,
  });

  return res.json(
    new ApiResponse(200, result, "Inventory adjusted successfully."),
  );
});
