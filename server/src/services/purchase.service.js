import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { calculateWeightedAverageCost, computePurchaseTotals } from "./financial.service.js";

const toNumber = (value) => Number(value ?? 0);

// Generate Purchase Number
export const generatePurchaseNumber = async () => {
  const count = await prisma.purchase.count({
    where: {
      isActive: true,
    },
  });

  return `PO-${String(count + 1).padStart(6, "0")}`;
};

// Get All Purchases
export const getAllPurchases = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const skip = (page - 1) * limit;
  const searchValue = search?.trim();

  const where = {
    isActive: true,
    ...(searchValue
      ? {
          OR: [
            {
              purchaseNumber: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              invoiceNumber: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              referenceNumber: {
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
            {
              supplier: {
                is: {
                  supplierName: {
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

  const [purchases, total] = await prisma.$transaction([
    prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: true,
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

    prisma.purchase.count({
      where,
    }),
  ]);

  return {
    purchases,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

// Get Purchase By ID
export const getPurchaseById = async (id) => {
  return prisma.purchase.findUnique({
    where: {
      id,
    },
    include: {
      supplier: true,
      createdBy: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Create Purchase
export const createPurchase = async (data, userId) => {
  return prisma.$transaction(async (tx) => {
    const purchaseNumber = await generatePurchaseNumber();

    const supplier = await tx.supplier.findFirst({
      where: {
        id: data.supplierId,
        isActive: true,
      },
    });

    if (!supplier) {
      throw new ApiError(404, "Supplier not found.");
    }

    let itemSubtotal = 0;
    const purchaseItems = [];

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
      const purchasePrice = Number(item.purchasePrice ?? product.purchasePrice ?? 0);

      if (quantity <= 0 || purchasePrice <= 0) {
        throw new ApiError(400, `Invalid purchase item for ${product.name}.`);
      }

      const lineTotal = purchasePrice * quantity;

      itemSubtotal += lineTotal;

      purchaseItems.push({
        product,
        quantity,
        purchasePrice,
        total: lineTotal,
      });
    }

    const subtotal = toNumber(data.totalBill ?? itemSubtotal);
    const discount = toNumber(data.discount);
    const tax = toNumber(data.tax);
    const shippingCost = toNumber(data.shippingCost);
    const paidAmount = toNumber(data.paidAmount);
    const grandTotal = subtotal - discount + tax + shippingCost;
    const supplierAmount = Math.max(0, grandTotal - paidAmount - shippingCost);

    if (paidAmount > grandTotal - shippingCost) {
      throw new ApiError(400, "Paid amount cannot exceed supplier amount due.");
    }

    const dueAmount = supplierAmount;
    const paymentStatus = dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE";

    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        invoiceNumber: data.invoiceNumber?.trim() || null,
        referenceNumber: data.referenceNumber?.trim() || null,
        supplierId: data.supplierId,
        createdById: userId,
        subtotal,
        discount,
        tax,
        shippingCost,
        total: grandTotal,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes?.trim() || null,
        attachment: data.attachment?.trim() || null,
        clientReferenceId: data.clientReferenceId || undefined,
        status: data.status || "COMPLETED",
        isActive: true,
      },
    });

    if (paidAmount > 0) {
      await tx.supplierPayment.create({
        data: {
          paymentNumber: `SUP-PAY-${String(Date.now()).slice(-8)}`,
          purchaseId: purchase.id,
          supplierId: data.supplierId,
          amount: paidAmount,
          paymentMethod: data.paymentMethod || "CASH",
          reference: purchase.purchaseNumber,
          note: data.notes?.trim() || "Initial payment",
          paidById: userId,
        },
      });
    }

    for (const item of purchaseItems) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.product.id,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          total: item.total,
        },
      });

      const newQuantity = Number(item.product.stockQuantity) + Number(item.quantity);
      const newAverageCost = calculateWeightedAverageCost(
        item.product.stockQuantity,
        Number(item.product.purchasePrice ?? 0),
        item.quantity,
        item.purchasePrice,
      );

      await tx.product.update({
        where: {
          id: item.product.id,
        },
        data: {
          stockQuantity: newQuantity,
          purchasePrice: newAverageCost,
        },
      });

      await tx.stockTransaction.create({
        data: {
          productId: item.product.id,
          type: "STOCK_IN",
          quantity: item.quantity,
          reference: purchase.purchaseNumber,
          note: `Purchase from ${supplier.companyName || supplier.supplierName}`,
          createdById: userId,
        },
      });
    }

    await tx.supplier.update({
      where: {
        id: supplier.id,
      },
      data: {
        currentBalance: {
          increment: dueAmount,
        },
      },
    });

    return tx.purchase.findUnique({
      where: {
        id: purchase.id,
      },
      include: {
        supplier: true,
        createdBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });
};

// Update Purchase
export const updatePurchase = async (id, data, userId) => {
  return prisma.$transaction(async (tx) => {
    const existingPurchase = await tx.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingPurchase) {
      throw new ApiError(404, "Purchase not found.");
    }

    const supplier = await tx.supplier.findFirst({
      where: {
        id: data.supplierId,
        isActive: true,
      },
    });

    if (!supplier) {
      throw new ApiError(404, "Supplier not found.");
    }

    for (const item of existingPurchase.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.purchaseItem.deleteMany({
      where: { purchaseId: id },
    });

    let itemSubtotal = 0;
    const purchaseItems = [];

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
      const purchasePrice = Number(item.purchasePrice ?? product.purchasePrice ?? 0);

      if (quantity <= 0 || purchasePrice <= 0) {
        throw new ApiError(400, `Invalid purchase item for ${product.name}.`);
      }

      const lineTotal = purchasePrice * quantity;

      itemSubtotal += lineTotal;

      purchaseItems.push({
        product,
        quantity,
        purchasePrice,
        total: lineTotal,
      });
    }

    const subtotal = toNumber(data.totalBill ?? itemSubtotal);
    const discount = toNumber(data.discount);
    const tax = toNumber(data.tax);
    const shippingCost = toNumber(data.shippingCost);
    const paidAmount = toNumber(data.paidAmount);
    const grandTotal = subtotal - discount + tax + shippingCost;
    const supplierAmount = Math.max(0, grandTotal - paidAmount - shippingCost);

    if (paidAmount > grandTotal - shippingCost) {
      throw new ApiError(400, "Paid amount cannot exceed supplier amount due.");
    }

    const dueAmount = supplierAmount;
    const paymentStatus = dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE";

    const updatedPurchase = await tx.purchase.update({
      where: { id },
      data: {
        invoiceNumber: data.invoiceNumber?.trim() || null,
        referenceNumber: data.referenceNumber?.trim() || null,
        supplierId: data.supplierId,
        subtotal,
        discount,
        tax,
        shippingCost,
        total: grandTotal,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes?.trim() || null,
        attachment: data.attachment?.trim() || null,
        status: data.status || existingPurchase.status,
        updatedAt: new Date(),
      },
    });

    for (const item of purchaseItems) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: updatedPurchase.id,
          productId: item.product.id,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          total: item.total,
        },
      });

      const newQuantity = Number(item.product.stockQuantity) + Number(item.quantity);
      const newAverageCost = calculateWeightedAverageCost(
        item.product.stockQuantity,
        Number(item.product.purchasePrice ?? 0),
        item.quantity,
        item.purchasePrice,
      );

      await tx.product.update({
        where: { id: item.product.id },
        data: {
          stockQuantity: newQuantity,
          purchasePrice: newAverageCost,
        },
      });

      await tx.stockTransaction.create({
        data: {
          productId: item.product.id,
          type: "STOCK_IN",
          quantity: item.quantity,
          reference: updatedPurchase.purchaseNumber,
          note: `Purchase updated from ${supplier.companyName || supplier.supplierName}`,
          createdById: userId,
        },
      });
    }

    const balanceDelta = dueAmount - Number(existingPurchase.dueAmount || 0);
    await tx.supplier.update({
      where: { id: supplier.id },
      data: {
        currentBalance: {
          increment: balanceDelta,
        },
      },
    });

    return tx.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });
};

// Delete Purchase (Soft Delete)
export const deletePurchase = async (id) => {
  return prisma.purchase.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

// Restore Purchase
export const restorePurchase = async (id) => {
  return prisma.purchase.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
};

// Update Purchase Status
export const updatePurchaseStatus = async (id, status) => {
  return prisma.purchase.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};
