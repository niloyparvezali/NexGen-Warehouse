import { z } from "zod";

const paymentMethodSchema = z.enum([
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "BKASH",
  "NAGAD",
  "ROCKET",
  "UPAY",
]);

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: paymentMethodSchema.optional(),
  notes: z.string().optional(),
  status: z.enum(["COMPLETED", "CANCELLED", "RETURNED"]).optional().default("COMPLETED"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().positive(),
        sellingPrice: z.coerce.number().positive(),
        warrantyDays: z.coerce.number().int().nonnegative().optional(),
        serialNumbers: z.array(z.string()).optional(),
      }),
    )
    .min(1, "At least one product is required."),
});

export const createSaleReturnSchema = z.object({
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        saleItemId: z.string(),
        productId: z.string(),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "At least one return item is required."),
});

export const updateSaleStatusSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED", "RETURNED"]),
});