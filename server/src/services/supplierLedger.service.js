import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getSupplierLedger = async (supplierId) => {
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  });

  if (!supplier) {
    throw new ApiError(404, "Supplier not found.");
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      supplierId,
    },
    select: {
      id: true,
      purchaseNumber: true,
      total: true,
      createdAt: true,
    },
  });

  const payments = await prisma.supplierPayment.findMany({
    where: {
      supplierId,
    },
    select: {
      paymentNumber: true,
      purchaseId: true,
      amount: true,
      paymentMethod: true,
      reference: true,
      createdAt: true,
    },
  });

  const ledger = [];

  for (const purchase of purchases) {
    ledger.push({
      date: purchase.createdAt,
      type: "PURCHASE",
      purchaseNumber: purchase.purchaseNumber,
      paymentNumber: null,
      reference: purchase.purchaseNumber,
      debit: Number(purchase.total),
      credit: 0,
      remarks: "Purchase",
    });
  }

  for (const payment of payments) {
    ledger.push({
      date: payment.createdAt,
      type: "PAYMENT",
      purchaseNumber: payment.purchaseId || null,
      paymentNumber: payment.paymentNumber,
      reference: payment.reference || payment.paymentNumber,
      debit: 0,
      credit: Number(payment.amount),
      remarks: "Payment made",
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
    supplier: {
      id: supplier.id,
      name: supplier.supplierName,
      companyName: supplier.companyName,
      phone: supplier.mobileNumber || supplier.phone,
    },
    ledger: result,
    currentBalance: balance,
  };
};
