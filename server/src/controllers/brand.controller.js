import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllBrands,
  getBrandById,
  getBrandByName,
  createBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
} from "../services/brand.service.js";

import {
  createBrandSchema,
  updateBrandSchema,
} from "../validations/brand.validation.js";

export const getBrands = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllBrands({
    page,
    limit,
    search,
  });

  return res.json(
    new ApiResponse(200, result, "Brands fetched successfully.")
  );
});

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await getBrandById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found.");
  }

  return res.json(
    new ApiResponse(200, brand, "Brand fetched successfully.")
  );
});

export const createNewBrand = asyncHandler(async (req, res) => {
  const validatedData = createBrandSchema.parse(req.body);

  const existingBrand = await getBrandByName(validatedData.name);

  if (existingBrand) {
    throw new ApiError(409, "Brand already exists.");
  }

  const brand = await createBrand(validatedData);

  return res
    .status(201)
    .json(
      new ApiResponse(201, brand, "Brand created successfully.")
    );
});

export const updateExistingBrand = asyncHandler(async (req, res) => {
  const validatedData = updateBrandSchema.parse(req.body);

  const brand = await getBrandById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found.");
  }

  if (
    validatedData.name &&
    validatedData.name !== brand.name
  ) {
    const existingBrand = await getBrandByName(
      validatedData.name
    );

    if (existingBrand) {
      throw new ApiError(409, "Brand already exists.");
    }
  }

  const updatedBrand = await updateBrand(
    req.params.id,
    validatedData
  );

  return res.json(
    new ApiResponse(
      200,
      updatedBrand,
      "Brand updated successfully."
    )
  );
});

export const removeBrand = asyncHandler(async (req, res) => {
  const brand = await getBrandById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found.");
  }

  await deleteBrand(req.params.id);

  return res.json(
    new ApiResponse(200, null, "Brand deleted successfully.")
  );
});

export const restoreExistingBrand = asyncHandler(
  async (req, res) => {
    const brand = await getBrandById(req.params.id);

    if (!brand) {
      throw new ApiError(404, "Brand not found.");
    }

    const restored = await restoreBrand(req.params.id);

    return res.json(
      new ApiResponse(
        200,
        restored,
        "Brand restored successfully."
      )
    );
  }
);