import { z } from "zod";

export const createCustomerPaymentSchema = z.object({
  saleId: z.string(),

  amount: z
    .number({
      required_error: "Payment amount is required.",
    })
    .positive("Payment amount must be greater than 0."),

  paymentMethod: z.enum([
    "CASH",
    "CARD",
    "BANK_TRANSFER",
    "MOBILE_BANKING",
  ]),

  reference: z.string().optional(),

  note: z.string().optional(),
});