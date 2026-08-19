import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const generateCustomerPaymentNumber = async (tx) => {
  const count = await tx.customerPayment.count();

  return `CUST-PAY-${String(count + 1).padStart(6, "0")}`;
};

export const createCustomerPayment = async (data, userId) => {
  return prisma.$transaction(async (tx) => {
    // Accept either the internal sale `id` or the user-facing `invoiceNumber`.
    // First try to find by primary `id`, then fall back to `invoiceNumber`.
    let sale = await tx.sale.findUnique({
      where: { id: data.saleId },
      include: { customer: true },
    });

    if (!sale) {
      sale = await tx.sale.findUnique({
        where: { invoiceNumber: data.saleId },
        include: { customer: true },
      });
    }

    if (!sale) {
      throw new ApiError(404, "Sale not found.");
    }

    if (!sale.customerId) {
      throw new ApiError(400, "This sale has no customer.");
    }

    const dueAmount = Number(sale.dueAmount);

    if (dueAmount <= 0) {
      throw new ApiError(400, "This invoice is already fully paid.");
    }

    if (Number(data.amount) > dueAmount) {
      throw new ApiError(400, "Payment exceeds due amount.");
    }

    const newPaidAmount = Number(sale.paidAmount) + Number(data.amount);
    const newDueAmount = Number(sale.total) - newPaidAmount;

    let paymentStatus = "PARTIAL";

    if (newDueAmount <= 0) {
      paymentStatus = "PAID";
    }

    const paymentNumber = await generateCustomerPaymentNumber(tx);

    const payment = await tx.customerPayment.create({
      data: {
        paymentNumber,
        saleId: sale.id,
        customerId: sale.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        note: data.note,
        receivedById: userId,
      },
    });

    await tx.sale.update({
      where: {
        id: sale.id,
      },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paymentStatus,
      },
    });

    await tx.customer.update({
      where: {
        id: sale.customerId,
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

export const getAllCustomerPayments = async ({ page = 1, limit = 10, search = "" } = {}) => {
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
            sale: {
              is: {
                invoiceNumber: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            },
          },
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
          {
            receivedBy: {
              is: {
                first_name: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            receivedBy: {
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
    prisma.customerPayment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sale: true,
        customer: true,
        receivedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    }),
    prisma.customerPayment.count({ where }),
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

export const getCustomerDue = async (customerId) => {
  const sales = await prisma.sale.findMany({
    where: {
      customerId,
    },
    select: {
      total: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  const totalPaid = sales.reduce(
    (sum, sale) => sum + Number(sale.paidAmount),
    0,
  );

  const totalDue = sales.reduce((sum, sale) => sum + Number(sale.dueAmount), 0);

  return {
    totalSales,
    totalPaid,
    totalDue,
  };
};
