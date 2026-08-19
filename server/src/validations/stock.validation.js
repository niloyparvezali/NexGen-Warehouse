import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.string().min(1, "Product is required."),

  quantity: z.number().int().positive("Quantity must be greater than 0."),

  reference: z.string().optional(),

  note: z.string().optional(),
});
export const stockOutSchema = z.object({
  productId: z.string().min(1, "Product is required."),

  quantity: z.number().int().positive("Quantity must be greater than 0."),

  reference: z.string().optional(),

  note: z.string().optional(),
});
export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required."),

  quantity: z
    .number()
    .int()
    .refine((value) => value !== 0, {
      message: "Adjustment quantity cannot be zero.",
    }),

  reference: z.string().optional(),

  note: z.string().optional(),
});
