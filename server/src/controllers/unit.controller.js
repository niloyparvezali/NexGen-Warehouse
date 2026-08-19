import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllUnits,
  getUnitById,
  getUnitByName,
  getUnitBySymbol,
  createUnit,
  updateUnit,
  deleteUnit,
  restoreUnit,
} from "../services/unit.service.js";

import {
  createUnitSchema,
  updateUnitSchema,
} from "../validations/unit.validation.js";

export const getUnits = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllUnits({
    page,
    limit,
    search,
  });

  return res.json(new ApiResponse(200, result, "Units fetched successfully."));
});

export const getUnit = asyncHandler(async (req, res) => {
  const unit = await getUnitById(req.params.id);

  if (!unit) {
    throw new ApiError(404, "Unit not found.");
  }

  return res.json(new ApiResponse(200, unit, "Unit fetched successfully."));
});

export const createNewUnit = asyncHandler(async (req, res) => {
  const validatedData = createUnitSchema.parse(req.body);

  const existingName = await getUnitByName(validatedData.name);

  if (existingName) {
    throw new ApiError(409, "Unit name already exists.");
  }

  const existingSymbol = await getUnitBySymbol(validatedData.symbol);

  if (existingSymbol) {
    throw new ApiError(409, "Unit symbol already exists.");
  }

  const unit = await createUnit(validatedData);

  return res
    .status(201)
    .json(new ApiResponse(201, unit, "Unit created successfully."));
});

export const updateExistingUnit = asyncHandler(async (req, res) => {
  const validatedData = updateUnitSchema.parse(req.body);

  const unit = await getUnitById(req.params.id);

  if (!unit) {
    throw new ApiError(404, "Unit not found.");
  }

  if (validatedData.name) {
    const existingName = await getUnitByName(validatedData.name);

    if (existingName && existingName.id !== unit.id) {
      throw new ApiError(409, "Unit name already exists.");
    }
  }

  if (validatedData.symbol) {
    const existingSymbol = await getUnitBySymbol(validatedData.symbol);

    if (existingSymbol && existingSymbol.id !== unit.id) {
      throw new ApiError(409, "Unit symbol already exists.");
    }
  }

  const updatedUnit = await updateUnit(req.params.id, validatedData);

  return res.json(
    new ApiResponse(200, updatedUnit, "Unit updated successfully."),
  );
});

export const removeUnit = asyncHandler(async (req, res) => {
  const unit = await getUnitById(req.params.id);

  if (!unit) {
    throw new ApiError(404, "Unit not found.");
  }

  await deleteUnit(req.params.id);

  return res.json(new ApiResponse(200, null, "Unit deleted successfully."));
});

export const restoreExistingUnit = asyncHandler(async (req, res) => {
  const unit = await getUnitById(req.params.id);

  if (!unit) {
    throw new ApiError(404, "Unit not found.");
  }

  const restored = await restoreUnit(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Unit restored successfully."),
  );
});
