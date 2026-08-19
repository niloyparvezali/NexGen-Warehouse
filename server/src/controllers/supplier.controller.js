import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllSuppliers,
  getSupplierById,
  getSupplierByCompany,
  getSupplierByEmail,
  getSupplierByPhone,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from "../services/supplier.service.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validations/supplier.validation.js";

const normalizeSupplierPayload = (data) => ({
  ...data,
  supplierName: data.supplierName?.trim(),
  companyName: data.companyName?.trim() || null,
  contactPerson: data.contactPerson?.trim() || null,
  mobileNumber: data.mobileNumber?.trim() || data.phone?.trim() || null,
  phone: data.mobileNumber?.trim() || data.phone?.trim() || null,
  email: data.email?.trim() || null,
  address: data.address?.trim() || null,
  city: data.city?.trim() || null,
  country: data.country?.trim() || null,
  taxNumber: data.taxNumber?.trim() || null,
  previousDue: Number(data.previousDue ?? 0),
  currentBalance: Number(data.currentBalance ?? 0),
  status: data.status ?? "ACTIVE",
});

export const getSuppliers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllSuppliers({
    page,
    limit,
    search,
  });

  return res.json(
    new ApiResponse(200, result, "Suppliers fetched successfully."),
  );
});

export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found.");
  }

  return res.json(
    new ApiResponse(200, supplier, "Supplier fetched successfully."),
  );
});

export const createNewSupplier = asyncHandler(async (req, res) => {
  const validatedData = createSupplierSchema.parse(req.body);
  const normalizedData = normalizeSupplierPayload(validatedData);

  if (normalizedData.companyName) {
    const existingCompany = await getSupplierByCompany(normalizedData.companyName);

    if (existingCompany) {
      throw new ApiError(409, "Company name already exists.");
    }
  }

  if (normalizedData.email) {
    const existingEmail = await getSupplierByEmail(normalizedData.email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists.");
    }
  }

  if (normalizedData.mobileNumber) {
    const existingPhone = await getSupplierByPhone(normalizedData.mobileNumber);

    if (existingPhone) {
      throw new ApiError(409, "Mobile number already exists.");
    }
  }

  const supplier = await createSupplier(normalizedData);

  return res
    .status(201)
    .json(new ApiResponse(201, supplier, "Supplier created successfully."));
});

export const updateExistingSupplier = asyncHandler(async (req, res) => {
  const validatedData = updateSupplierSchema.parse(req.body);
  const normalizedData = normalizeSupplierPayload(validatedData);

  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found.");
  }

  if (normalizedData.companyName && normalizedData.companyName !== supplier.companyName) {
    const existingCompany = await getSupplierByCompany(normalizedData.companyName);

    if (existingCompany) {
      throw new ApiError(409, "Company name already exists.");
    }
  }

  if (normalizedData.email && normalizedData.email !== supplier.email) {
    const existingEmail = await getSupplierByEmail(normalizedData.email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists.");
    }
  }

  if (normalizedData.mobileNumber && normalizedData.mobileNumber !== supplier.mobileNumber) {
    const existingPhone = await getSupplierByPhone(normalizedData.mobileNumber);

    if (existingPhone) {
      throw new ApiError(409, "Mobile number already exists.");
    }
  }

  const updated = await updateSupplier(req.params.id, normalizedData);

  return res.json(
    new ApiResponse(200, updated, "Supplier updated successfully."),
  );
});

export const removeSupplier = asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found.");
  }

  await deleteSupplier(req.params.id);

  return res.json(new ApiResponse(200, null, "Supplier deleted successfully."));
});

export const restoreExistingSupplier = asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found.");
  }

  const restored = await restoreSupplier(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Supplier restored successfully."),
  );
});
