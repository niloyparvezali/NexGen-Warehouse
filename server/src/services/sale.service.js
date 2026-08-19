import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { computeSaleTotals } from "./financial.service.js";

const toNumber = (value) => Number(value ?? 0);

const parseWarrantyToDays = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  const digitMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  const quantity = digitMatch ? Number(digitMatch[1]) : null;
  if (quantity == null || Number.isNaN(quantity)) return null;

  if (/year|yr/.test(normalized)) {
    return Math.max(0, Math.round(quantity * 365));
  }

  if (/month|mo/.test(normalized)) {
    return Math.max(0, Math.round(quantity * 30));
  }

  if (/day|d/.test(normalized)) {
    return Math.max(0, Math.round(quantity));
  }

  return Math.max(0, Math.round(quantity));
};

const normalizeSerialNumbers = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(/[\r\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getAllSales = async ({ page = 1, limit = 10, search = "" }) => {
  const skip = (page - 1) * limit;
  const searchValue = search?.trim();
  const normalizedSearch = searchValue?.toUpperCase();
  const validSaleStatuses = ["COMPLETED", "CANCELLED", "RETURNED"];
  const validPaymentStatuses = ["PAID", "PARTIAL", "DUE"];
  const validPaymentMethods = ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_BANKING", "BKASH", "NAGAD", "ROCKET", "UPAY"];

  const where = {
    isActive: true,
    ...(searchValue
      ? {
          OR: [
            {
              invoiceNumber: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              notes: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            ...(validPaymentMethods.includes(normalizedSearch)
              ? [
                  {
                    paymentMethod: {
                      equals: normalizedSearch,
                    },
                  },
                ]
              : []),
            ...(validSaleStatuses.includes(normalizedSearch)
              ? [
                  {
                    status: {
                      equals: normalizedSearch,
                    },
                  },
                ]
              : []),
            ...(validPaymentStatuses.includes(normalizedSearch)
              ? [
                  {
                    paymentStatus: {
                      equals: normalizedSearch,
                    },
                  },
                ]
              : []),
            {
              customer: {
                is: {
                  name: {
                    contains: searchValue,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [sales, total] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        createdBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    sales,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getSaleById = async (id, includeInactive = false) => {
  return prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      createdBy: true,
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
      returns: {
        include: {
          items: true,
        },
      },
    },
  });
};

export const createSaleReturn = async (saleId, data, userId) => {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
            returnItems: true,
          },
        },
        returns: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!sale || !sale.isActive) {
      throw new ApiError(404, "Sale not found.");
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new ApiError(400, "At least one return item is required.");
    }

    const saleItemsById = new Map(sale.items.map((item) => [item.id, item]));
    const returnedQuantities = {};

    for (const existingReturn of sale.returns ?? []) {
      for (const returnItem of existingReturn.items ?? []) {
        returnedQuantities[returnItem.saleItemId] =
          (returnedQuantities[returnItem.saleItemId] || 0) + Number(returnItem.quantity);
      }
    }

    const returnLines = [];
    let returnSubtotal = 0;

    for (const item of data.items) {
      const saleItem = saleItemsById.get(item.saleItemId);
      const quantity = Number(item.quantity || 0);

      if (!saleItem) {
        throw new ApiError(400, `Invalid sale item: ${item.saleItemId}`);
      }

      if (saleItem.productId !== item.productId) {
        throw new ApiError(400, `Product mismatch for sale item ${saleItem.id}.`);
      }

      if (quantity <= 0) {
        throw new ApiError(400, `Return quantity must be greater than zero for ${saleItem.productName || saleItem.product?.name}.`);
      }

      const alreadyReturned = Number(returnedQuantities[saleItem.id] || 0);
      const remaining = saleItem.quantity - alreadyReturned;

      if (remaining <= 0) {
        throw new ApiError(400, `Sale item ${saleItem.productName || saleItem.product?.name} is already fully returned.`);
      }

      if (quantity > remaining) {
        throw new ApiError(
          400,
          `Return quantity for ${saleItem.productName || saleItem.product?.name} cannot exceed remaining quantity of ${remaining}.`,
        );
      }

      returnedQuantities[saleItem.id] = alreadyReturned + quantity;

      const lineTotal = Number(saleItem.sellingPrice) * quantity;
      returnSubtotal += lineTotal;

      returnLines.push({
        saleItemId: saleItem.id,
        productId: saleItem.productId,
        productName: saleItem.productName || saleItem.product?.name,
        productSku: saleItem.productSku || saleItem.product?.sku,
        quantity,
        sellingPrice: Number(saleItem.sellingPrice),
        total: lineTotal,
      });
    }

    if (returnSubtotal <= 0) {
      throw new ApiError(400, "Return subtotal must be greater than zero.");
    }

    const returnDiscount = sale.subtotal > 0 ? (Number(sale.discount) * returnSubtotal) / Number(sale.subtotal) : 0;
    const returnTax = sale.subtotal > 0 ? (Number(sale.tax) * returnSubtotal) / Number(sale.subtotal) : 0;
    const totals = computeSaleTotals({
      items: returnLines.map((item) => ({ sellingPrice: item.sellingPrice, quantity: item.quantity })),
      discount: returnDiscount,
      tax: returnTax,
    });

    const returnNumber = `RTN-${String(Date.now()).slice(-8)}`;

    const saleReturn = await tx.saleReturn.create({
      data: {
        saleId,
        returnNumber,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        notes: data.notes?.trim() || null,
        items: {
          create: returnLines.map((line) => ({
            saleItemId: line.saleItemId,
            productId: line.productId,
            productName: line.productName,
            productSku: line.productSku,
            quantity: line.quantity,
            sellingPrice: line.sellingPrice,
            total: line.total,
          })),
        },
      },
    });

    for (const line of returnLines) {
      await tx.product.update({
        where: { id: line.productId },
        data: {
          stockQuantity: {
            increment: line.quantity,
          },
        },
      });

      await tx.stockTransaction.create({
        data: {
          productId: line.productId,
          type: "STOCK_IN",
          quantity: line.quantity,
          reference: returnNumber,
          note: `Sale return ${returnNumber} - ${line.productName}`,
          createdById: userId,
        },
      });
    }

    const allReturned = sale.items.every((item) => {
      const returned = Number(returnedQuantities[item.id] || 0);
      return returned >= item.quantity;
    });

    if (allReturned) {
      await tx.sale.update({
        where: { id: saleId },
        data: { status: "RETURNED" },
      });
    }

    return saleReturn;
  });
};

export const createSale = async (data, userId) => {
  return prisma.$transaction(async (tx) => {
    const customer = data.customerId
      ? await tx.customer.findFirst({
          where: {
            id: data.customerId,
            isActive: true,
          },
        })
      : null;

    if (data.customerId && !customer) {
      throw new ApiError(404, "Customer not found.");
    }

    let subtotal = 0;
    const saleItems = [];

    for (const item of data.items ?? []) {
      const product = await tx.product.findFirst({
        where: {
          id: item.productId,
          isActive: true,
        },
      });

      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      const quantity = Number(item.quantity || 0);
      const sellingPrice = Number(item.sellingPrice ?? product.sellingPrice);
      const warrantyDays = item.warrantyDays != null ? Number(item.warrantyDays) : parseWarrantyToDays(product.warranty);

      if (quantity <= 0 || sellingPrice <= 0) {
        throw new ApiError(400, `Invalid sale item for ${product.name}.`);
      }

      // Validate sufficient stock
      if (product.stockQuantity < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Required: ${quantity}`);
      }

      const total = sellingPrice * quantity;
      subtotal += total;

      saleItems.push({
        product,
        quantity,
        sellingPrice,
        total,
        warrantyDays: Number.isFinite(warrantyDays) ? Math.max(0, Math.trunc(warrantyDays)) : null,
        serialNumbers: normalizeSerialNumbers(item.serialNumbers).length ? JSON.stringify(normalizeSerialNumbers(item.serialNumbers)) : null,
      });
    }

    const discount = toNumber(data.discount);
    const tax = toNumber(data.tax);
    const paidAmount = toNumber(data.paidAmount);
    const totals = computeSaleTotals({ items: saleItems.map((item) => ({ sellingPrice: item.sellingPrice, quantity: item.quantity })), discount, tax });
    const grandTotal = totals.total;
    const dueAmount = Math.max(0, grandTotal - paidAmount);
    const paymentStatus = dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE";

    const invoiceNumber = `INV-${String(Date.now()).slice(-8)}`;

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId: data.customerId || null,
        createdById: userId,
        subtotal,
        discount,
        tax,
        total: grandTotal,
        notes: data.notes?.trim() || null,
        status: data.status || "COMPLETED",
        dueAmount,
        paidAmount,
        paymentMethod: data.paymentMethod || null,
        paymentStatus,
        isActive: true,
      },
    });

    if (data.customerId && paidAmount > 0) {
      await tx.customerPayment.create({
        data: {
          paymentNumber: `CUST-PAY-${String(Date.now()).slice(-8)}`,
          saleId: sale.id,
          customerId: data.customerId,
          amount: paidAmount,
          paymentMethod: data.paymentMethod || "CASH",
          reference: invoiceNumber,
          note: data.notes?.trim() || "Initial payment",
          receivedById: userId,
        },
      });
    }

    for (const item of saleItems) {
      const costAtSale = Number(item.product.purchasePrice ?? 0);

      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          costAtSale,
          total: item.total,
          warrantyDays: item.warrantyDays,
          serialNumbers: item.serialNumbers,
        },
      });

      await tx.product.update({
        where: {
          id: item.product.id,
        },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      await tx.stockTransaction.create({
        data: {
          productId: item.product.id,
          type: "STOCK_OUT",
          quantity: item.quantity,
          reference: invoiceNumber,
          note: `Sale ${invoiceNumber} - ${item.product.name}`,
          createdById: userId,
        },
      });
    }

    // Update customer current balance when sale creates a due
    if (data.customerId && dueAmount > 0) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { currentBalance: { increment: dueAmount } },
      });
    }

    const result = await tx.sale.findUnique({
      where: { id: sale.id },
      include: {
        customer: true,
        createdBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    return result;
  });
};

export const deleteSale = async (id) => {
  return prisma.sale.update({
    where: { id },
    data: { isActive: false },
  });
};

export const restoreSale = async (id) => {
  return prisma.sale.update({
    where: { id },
    data: { isActive: true },
  });
};

export const updateSaleStatus = async (id, status) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
  });

  if (!sale) {
    throw new ApiError(404, "Sale not found.");
  }

  return prisma.sale.update({
    where: { id },
    data: { status },
  });
};
