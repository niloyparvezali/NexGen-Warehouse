import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID."),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
  purchasePrice: z.coerce.number().positive("Purchase price must be greater than 0."),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().cuid("Invalid supplier ID."),
  invoiceNumber: z.string().max(100).optional().nullable(),
  referenceNumber: z.string().max(100).optional().nullable(),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
  totalBill: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z
    .enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_BANKING"])
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
  attachment: z.string().trim().max(255).optional().nullable(),
  clientReferenceId: z.string().uuid().optional().nullable(),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]).optional(),
  items: z.array(purchaseItemSchema).optional().default([]),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();
