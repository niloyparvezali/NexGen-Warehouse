import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(150, "Product name cannot exceed 150 characters."),

  sku: z
    .string()
    .trim()
    .max(100, "SKU cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  barcode: z
    .string()
    .trim()
    .max(100, "Barcode cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),

  warranty: z
    .string()
    .trim()
    .max(100, "Warranty cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  purchasePrice: z.coerce
    .number()
    .min(0, "Purchase price cannot be negative."),

  sellingPrice: z.coerce
    .number()
    .min(0, "Selling price cannot be negative."),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative."),

  categoryId: z.string().min(1, "Category is required."),

  brandId: z.string().min(1, "Brand is required."),

  unitId: z.string().min(1, "Unit is required."),

  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateProductSchema = createProductSchema.partial();