import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getCustomerLedger = async (customerId) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found.");
  }

  const sales = await prisma.sale.findMany({
    where: {
      customerId,
    },
    select: {
      id: true,
      invoiceNumber: true,
      total: true,
      createdAt: true,
    },
  });

  const payments = await prisma.customerPayment.findMany({
    where: {
      customerId,
    },
    select: {
      paymentNumber: true,
      saleId: true,
      amount: true,
      paymentMethod: true,
      reference: true,
      createdAt: true,
    },
  });

  const ledger = [];

  for (const sale of sales) {
    ledger.push({
      date: sale.createdAt,
      type: "SALE",
      invoiceNumber: sale.invoiceNumber,
      paymentNumber: null,
      reference: sale.invoiceNumber,
      debit: Number(sale.total),
      credit: 0,
      remarks: "Invoice",
    });
  }

  for (const payment of payments) {
    ledger.push({
      date: payment.createdAt,
      type: "PAYMENT",
      invoiceNumber: payment.saleId || null,
      paymentNumber: payment.paymentNumber,
      reference: payment.reference || payment.paymentNumber,
      debit: 0,
      credit: Number(payment.amount),
      remarks: "Payment received",
    });
  }

  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  let balance = 0;

  const result = ledger.map((entry) => {
    balance += entry.debit;
    balance -= entry.credit;

    return {
      ...entry,
      balance,
    };
  });

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
    },
    ledger: result,
    currentBalance: balance,
  };
};
