import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../services/product.service.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";

import prisma from "../config/prisma.js";

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const category = req.query.category || "";

  const result = await getAllProducts({
    page,
    limit,
    search,
    category,
  });

  return res.json(
    new ApiResponse(200, result, "Products fetched successfully."),
  );
});
export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return res.json(
    new ApiResponse(200, product, "Product fetched successfully."),
  );
});
export const createNewProduct = asyncHandler(async (req, res) => {
  const validatedData = createProductSchema.parse(req.body);

  // Category exists
  const category = await prisma.category.findUnique({
    where: {
      id: validatedData.categoryId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  // Brand exists
  const brand = await prisma.brand.findUnique({
    where: {
      id: validatedData.brandId,
    },
  });

  if (!brand) {
    throw new ApiError(404, "Brand not found.");
  }

  // Unit exists
  const unit = await prisma.unit.findUnique({
    where: {
      id: validatedData.unitId,
    },
  });

  if (!unit) {
    throw new ApiError(404, "Unit not found.");
  }

  // Barcode uniqueness
  if (validatedData.barcode) {
    const barcode = await getProductByBarcode(validatedData.barcode);

    if (barcode) {
      throw new ApiError(409, "Barcode already exists.");
    }
  }

  // Business rule
  if (validatedData.sellingPrice < validatedData.purchasePrice) {
    throw new ApiError(
      400,
      "Selling price cannot be lower than purchase price.",
    );
  }

  const product = await createProduct(validatedData);

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully."));
});
export const updateExistingProduct = asyncHandler(async (req, res) => {
  const validatedData = updateProductSchema.parse(req.body);

  const product = await getProductById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (
    validatedData.purchasePrice !== undefined &&
    validatedData.sellingPrice !== undefined &&
    validatedData.sellingPrice < validatedData.purchasePrice
  ) {
    throw new ApiError(
      400,
      "Selling price cannot be lower than purchase price.",
    );
  }

  const updated = await updateProduct(req.params.id, validatedData);

  return res.json(
    new ApiResponse(200, updated, "Product updated successfully."),
  );
});
export const removeProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  await deleteProduct(req.params.id);

  return res.json(new ApiResponse(200, null, "Product deleted successfully."));
});
export const restoreExistingProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const restored = await restoreProduct(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Product restored successfully."),
  );
});
