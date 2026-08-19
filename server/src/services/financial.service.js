import prisma from "../config/prisma.js";

export const toNumber = (value) => Number(value ?? 0);

export const calculateStockAfterMovement = ({ opening = 0, stockIn = 0, stockOut = 0 }) => {
  return toNumber(opening) + toNumber(stockIn) - toNumber(stockOut);
};

export const calculateCustomerDue = ({ totalSales = 0, totalPayments = 0, creditAdjustments = 0, salesReturns = 0 }) => {
  return toNumber(totalSales) - toNumber(totalPayments) - toNumber(creditAdjustments) - toNumber(salesReturns);
};

export const calculateSupplierDue = ({ totalPurchases = 0, totalPayments = 0, creditAdjustments = 0, purchaseReturns = 0 }) => {
  return toNumber(totalPurchases) - toNumber(totalPayments) - toNumber(creditAdjustments) - toNumber(purchaseReturns);
};

export const calculateGrossProfit = ({ netSales = 0, cogs = 0 }) => {
  return toNumber(netSales) - toNumber(cogs);
};

export const calculateSaleTotals = ({ items, discount = 0, tax = 0 }) => {
  return computeSaleTotals({ items, discount, tax });
};

export const calculatePurchaseTotals = ({ items, discount = 0, tax = 0, shippingCost = 0 }) => {
  return computePurchaseTotals({ items, discount, tax, shippingCost });
};

export const calculateNetProfit = ({ grossProfit = 0, expenses = 0 }) => {
  return toNumber(grossProfit) - toNumber(expenses);
};

export const generateInvoiceNumber = async (tx = prisma) => {
  const count = await tx.sale.count();
  return `INV-${String(count + 1).padStart(6, "0")}`;
};

export const generateCustomerPaymentNumber = async (tx = prisma) => {
  const count = await tx.customerPayment.count();
  return `CUST-PAY-${String(count + 1).padStart(6, "0")}`;
};

export const generateSupplierPaymentNumber = async (tx = prisma) => {
  const count = await tx.supplierPayment.count();
  return `SUP-PAY-${String(count + 1).padStart(6, "0")}`;
};

export const computeSaleTotals = ({ items, discount = 0, tax = 0 }) => {
  const subtotal = (items ?? []).reduce(
    (sum, item) => sum + toNumber(item.sellingPrice) * toNumber(item.quantity),
    0,
  );

  const total = subtotal - toNumber(discount) + toNumber(tax);

  return {
    subtotal,
    discount: toNumber(discount),
    tax: toNumber(tax),
    total,
  };
};

export const computePurchaseTotals = ({ items, discount = 0, tax = 0, shippingCost = 0 }) => {
  const subtotal = (items ?? []).reduce(
    (sum, item) => sum + toNumber(item.purchasePrice) * toNumber(item.quantity),
    0,
  );

  const total = subtotal - toNumber(discount) + toNumber(tax) + toNumber(shippingCost);

  return {
    subtotal,
    discount: toNumber(discount),
    tax: toNumber(tax),
    shippingCost: toNumber(shippingCost),
    total,
  };
};

export const calculateWeightedAverageCost = (
  currentQuantity,
  currentCost,
  purchaseQuantity,
  purchaseUnitCost,
) => {
  const qty = toNumber(currentQuantity);
  const avgCost = toNumber(currentCost);
  const purchaseQty = toNumber(purchaseQuantity);
  const purchaseCost = toNumber(purchaseUnitCost);

  if (purchaseQty <= 0) {
    return avgCost;
  }

  const totalQty = qty + purchaseQty;
  if (totalQty <= 0) {
    return avgCost;
  }

  const totalCost = qty * avgCost + purchaseQty * purchaseCost;
  return totalCost / totalQty;
};

export const reverseWeightedAverageCost = (
  currentQuantity,
  currentCost,
  returnedQuantity,
  returnedUnitCost,
) => {
  const qty = toNumber(currentQuantity);
  const avgCost = toNumber(currentCost);
  const returnedQty = toNumber(returnedQuantity);
  const returnedCost = toNumber(returnedUnitCost);

  if (returnedQty <= 0 || qty <= 0) {
    return avgCost;
  }

  const currentTotalCost = qty * avgCost;
  const reversedTotalCost = currentTotalCost - returnedQty * returnedCost;
  const remainingQty = qty - returnedQty;

  if (remainingQty <= 0) {
    return avgCost;
  }

  return reversedTotalCost / remainingQty;
};

export const formatInventoryValues = (product, stockQuantity) => {
  const quantity = toNumber(stockQuantity ?? product.stockQuantity);
  const costValue = toNumber(product.purchasePrice) * quantity;
  const sellingValue = toNumber(product.sellingPrice) * quantity;

  return {
    stockQuantity: quantity,
    stockValue: costValue,
    sellingValue,
  };
};
