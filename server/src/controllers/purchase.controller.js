import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  restorePurchase,
  updatePurchaseStatus,
} from "../services/purchase.service.js";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "../validations/purchase.validation.js";

export const getPurchases = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllPurchases({
    page,
    limit,
    search,
  });

  return res.json(
    new ApiResponse(200, result, "Purchases fetched successfully."),
  );
});

export const getPurchase = asyncHandler(async (req, res) => {
  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found.");
  }

  return res.json(
    new ApiResponse(200, purchase, "Purchase fetched successfully."),
  );
});

export const createNewPurchase = asyncHandler(async (req, res) => {
  const body = {
    ...req.body,
    items: typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items,
    attachment: req.file ? `/uploads/${req.file.filename}` : req.body.attachment || null,
  };

  const validatedData = createPurchaseSchema.parse(body);

  const purchase = await createPurchase(validatedData, req.user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, purchase, "Purchase created successfully."));
});

export const updateExistingPurchase = asyncHandler(async (req, res) => {
  const body = {
    ...req.body,
    items: typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items,
    attachment: req.file ? `/uploads/${req.file.filename}` : req.body.attachment || null,
  };

  const validatedData = updatePurchaseSchema.parse(body);

  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found.");
  }

  const updated = await updatePurchase(req.params.id, validatedData, req.user.id);

  return res.json(
    new ApiResponse(200, updated, "Purchase updated successfully."),
  );
});

export const removePurchase = asyncHandler(async (req, res) => {
  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found.");
  }

  await deletePurchase(req.params.id);

  return res.json(new ApiResponse(200, null, "Purchase deleted successfully."));
});

export const restoreExistingPurchase = asyncHandler(async (req, res) => {
  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found.");
  }

  const restored = await restorePurchase(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Purchase restored successfully."),
  );
});

export const changePurchaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found.");
  }

  const updated = await updatePurchaseStatus(req.params.id, status);

  return res.json(
    new ApiResponse(200, updated, "Purchase status updated successfully."),
  );
});