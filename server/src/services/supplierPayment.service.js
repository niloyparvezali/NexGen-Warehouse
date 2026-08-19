import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const generateSupplierPaymentNumber = async (tx) => {
  const count = await tx.supplierPayment.count();

  return `SUP-PAY-${String(count + 1).padStart(6, "0")}`;
};

export const createSupplierPayment = async (data, userId) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: {
        id: data.purchaseId,
      },
      include: {
        supplier: true,
      },
    });

    if (!purchase) {
      throw new ApiError(404, "Purchase not found.");
    }

    const dueAmount = Number(purchase.dueAmount);

    if (dueAmount <= 0) {
      throw new ApiError(400, "This purchase is already fully paid.");
    }

    if (Number(data.amount) > dueAmount) {
      throw new ApiError(400, "Payment exceeds due amount.");
    }

    const newPaidAmount = Number(purchase.paidAmount) + Number(data.amount);

    const newDueAmount = Number(purchase.total) - newPaidAmount;

    let paymentStatus = "PARTIAL";

    if (newDueAmount <= 0) {
      paymentStatus = "PAID";
    }

    const paymentNumber = await generateSupplierPaymentNumber(tx);

    const payment = await tx.supplierPayment.create({
      data: {
        paymentNumber,
        purchaseId: purchase.id,
        supplierId: purchase.supplierId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        note: data.note,
        paidById: userId,
      },
    });

    await tx.purchase.update({
      where: {
        id: purchase.id,
      },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paymentStatus,
      },
    });

    await tx.supplier.update({
      where: {
        id: purchase.supplierId,
      },
      data: {
        currentBalance: {
          decrement: Number(data.amount),
        },
      },
    });

    return payment;
  });
};

export const getAllSupplierPayments = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const searchValue = search?.trim();

  const where = searchValue
    ? {
        OR: [
          {
            paymentNumber: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
          {
            reference: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
          {
            purchase: {
              is: {
                purchaseNumber: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
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
          {
            paidBy: {
              is: {
                first_name: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            paidBy: {
              is: {
                last_name: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }
    : {};

  const [payments, total] = await prisma.$transaction([
    prisma.supplierPayment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: true,
        purchase: true,
        paidBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    }),
    prisma.supplierPayment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getSupplierDue = async (supplierId) => {
  const purchases = await prisma.purchase.findMany({
    where: {
      supplierId,
    },
    select: {
      total: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  const totalPurchase = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total),
    0,
  );

  const totalPaid = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.paidAmount),
    0,
  );

  const totalDue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.dueAmount),
    0,
  );

  return {
    totalPurchase,
    totalPaid,
    totalDue,
  };
};
