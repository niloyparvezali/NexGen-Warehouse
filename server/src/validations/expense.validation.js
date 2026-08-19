import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.enum([
    "RENT",
    "SALARY",
    "ELECTRICITY",
    "INTERNET",
    "TRANSPORT",
    "OFFICE_SUPPLIES",
    "MAINTENANCE",
    "MARKETING",
    "MISCELLANEOUS",
  ]),

  description: z.string().trim().min(2, "Description is required.").max(255),

  amount: z.coerce.number().positive("Amount must be greater than 0."),

  expenseDate: z.coerce.date(),

  paymentMethod: z.enum([
    "CASH",
    "CARD",
    "BANK_TRANSFER",
    "MOBILE_BANKING",
    "BKASH",
    "NAGAD",
    "ROCKET",
    "UPAY",
  ]),

  referenceNumber: z.string().trim().max(100).optional().nullable(),

  attachment: z.string().trim().max(255).optional().nullable(),

  note: z.string().trim().max(500).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
