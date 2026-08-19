import prisma from "../config/prisma.js";
import { calculateGrossProfit, calculateNetProfit, formatInventoryValues } from "./financial.service.js";
import { getCustomerLedger } from "./customerLedger.service.js";
import { getSupplierLedger } from "./supplierLedger.service.js";

export const getCustomerLedgerReport = async (customerId) => {
  return await getCustomerLedger(customerId);
};

export const getSalesReport = async (filters) => {
  const where = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};

    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  const sales = await prisma.sale.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const summary = await prisma.sale.aggregate({
    where,
    _count: true,
    _sum: {
      total: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  return {
    summary: {
      totalInvoices: summary._count,
      totalSales: Number(summary._sum.total || 0),
      totalPaid: Number(summary._sum.paidAmount || 0),
      totalDue: Number(summary._sum.dueAmount || 0),
    },
    sales,
  };
};
export const getPurchaseReport = async (filters) => {
  const where = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};

    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.supplierId) {
    where.supplierId = filters.supplierId;
  }

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          supplierName: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const summary = await prisma.purchase.aggregate({
    where,
    _count: true,
    _sum: {
      total: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  return {
    summary: {
      totalPurchases: summary._count,
      totalAmount: Number(summary._sum.total || 0),
      totalPaid: Number(summary._sum.paidAmount || 0),
      totalDue: Number(summary._sum.dueAmount || 0),
    },
    purchases,
  };
};
export const getInventoryReport = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
      unit: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  let totalStock = 0;
  let stockValue = 0;
  let lowStock = 0;
  let outOfStock = 0;

  const inventory = products.map((product) => {
    totalStock += product.stockQuantity;

    const { stockValue: value, sellingValue } = formatInventoryValues(product, product.stockQuantity);

    stockValue += value;

    if (product.stockQuantity === 0) {
      outOfStock++;
    }

    if (product.stockQuantity <= product.minimumStock) {
      lowStock++;
    }

    return {
      ...product,
      stockValue: value,
      sellingValue,
    };
  });

  return {
    summary: {
      totalProducts: products.length,
      totalStock,
      stockValue,
      lowStock,
      outOfStock,
    },
    products: inventory,
  };
};
export const getProfitReport = async (query) => {
  const where = {};

  if (query.startDate || query.endDate) {
    where.createdAt = {};

    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }

    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

  const sales = await prisma.sale.findMany({
    where,
    include: {
      items: {
        select: {
          quantity: true,
          sellingPrice: true,
          costAtSale: true,
        },
      },
    },
  });

  const expenses = await prisma.expense.aggregate({
    where: {
      isActive: true,
      ...(where.createdAt
        ? {
            expenseDate: where.createdAt,
          }
        : {}),
    },
    _sum: {
      amount: true,
    },
  });

  let revenue = 0;
  let cogs = 0;

  for (const sale of sales) {
    revenue += Number(sale.total);

    for (const item of sale.items) {
      cogs += Number(item.costAtSale || 0) * Number(item.quantity || 0);
    }
  }

  const grossProfit = calculateGrossProfit({ netSales: revenue, cogs });
  const totalExpenses = Number(expenses._sum.amount || 0);
  const netProfit = calculateNetProfit({ grossProfit, expenses: totalExpenses });

  return {
    revenue,
    costOfGoodsSold: cogs,
    grossProfit,
    expenses: totalExpenses,
    netProfit,
  };
};

export const getSupplierReport = async () => {
  const suppliers = await prisma.supplier.findMany({
    where: {
      isActive: true,
    },
    include: {
      purchases: {
        select: {
          id: true,
          total: true,
          paidAmount: true,
          dueAmount: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: {
      supplierName: "asc",
    },
  });

  let totalSuppliers = 0;
  let totalPayable = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let activeSuppliers = 0;

  const data = suppliers.map((supplier) => {
    totalSuppliers++;
    if (supplier.status === "ACTIVE") {
      activeSuppliers++;
    }

    const totalPurchases = supplier.purchases.reduce(
      (sum, p) => sum + Number(p.total || 0),
      0
    );
    const totalPurchasePaid = supplier.purchases.reduce(
      (sum, p) => sum + Number(p.paidAmount || 0),
      0
    );
    const totalPurchaseDue = supplier.purchases.reduce(
      (sum, p) => sum + Number(p.dueAmount || 0),
      0
    );

    totalPayable += totalPurchases;
    totalPaid += totalPurchasePaid;
    totalDue += totalPurchaseDue;

    return {
      ...supplier,
      totalPurchases,
      totalPurchasePaid,
      totalPurchaseDue,
    };
  });

  return {
    summary: {
      totalSuppliers,
      activeSuppliers,
      totalPayable,
      totalPaid,
      totalDue,
    },
    suppliers: data,
  };
};

export const getCustomerReport = async () => {
  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
    },
    include: {
      sales: {
        select: {
          id: true,
          total: true,
          paidAmount: true,
          dueAmount: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  let totalCustomers = 0;
  let totalRevenue = 0;
  let totalReceived = 0;
  let totalOutstanding = 0;
  let activeCustomers = 0;

  const data = customers.map((customer) => {
    totalCustomers++;
    if (customer.status === "ACTIVE") {
      activeCustomers++;
    }

    const totalSales = customer.sales.reduce(
      (sum, s) => sum + Number(s.total || 0),
      0
    );
    const totalSalesPaid = customer.sales.reduce(
      (sum, s) => sum + Number(s.paidAmount || 0),
      0
    );
    const totalSalesDue = customer.sales.reduce(
      (sum, s) => sum + Number(s.dueAmount || 0),
      0
    );

    totalRevenue += totalSales;
    totalReceived += totalSalesPaid;
    totalOutstanding += totalSalesDue;

    return {
      ...customer,
      totalSales,
      totalSalesPaid,
      totalSalesDue,
    };
  });

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      totalReceived,
      totalOutstanding,
    },
    customers: data,
  };
};

export const getSupplierLedgerReport = async (supplierId) => {
  return await getSupplierLedger(supplierId);
};

export const getExpenseReport = async (filters) => {
  const where = {};

  if (filters.startDate || filters.endDate) {
    where.expenseDate = {};

    if (filters.startDate) {
      where.expenseDate.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.expenseDate.lte = new Date(filters.endDate);
    }
  }

  if (filters.category) {
    where.category = filters.category;
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  const summary = await prisma.expense.aggregate({
    where,
    _count: true,
    _sum: {
      amount: true,
    },
  });

  // Group expenses by category
  const byCategory = {};
  expenses.forEach((expense) => {
    const categoryName = expense.category || "Uncategorized";

    if (!byCategory[categoryName]) {
      byCategory[categoryName] = {
        count: 0,
        total: 0,
      };
    }
    byCategory[categoryName].count++;
    byCategory[categoryName].total += Number(expense.amount || 0);
  });

  return {
    summary: {
      totalExpenses: summary._count,
      totalAmount: Number(summary._sum.amount || 0),
      byCategory,
    },
    expenses,
  };
};

export const getStockMovementReport = async (filters) => {
  const where = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};

    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const movements = await prisma.stockTransaction.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: {
            select: {
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const summary = {
    totalMovements: movements.length,
    stockIn: movements
      .filter((m) => m.type === "STOCK_IN")
      .reduce((sum, m) => sum + m.quantity, 0),
    stockOut: movements
      .filter((m) => m.type === "STOCK_OUT")
      .reduce((sum, m) => sum + m.quantity, 0),
    adjustments: movements
      .filter((m) => m.type === "ADJUSTMENT")
      .reduce((sum, m) => sum + m.quantity, 0),
  };

  return {
    summary,
    movements,
  };
};

export const getLowStockReport = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
      unit: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  const lowStockProducts = products.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= product.minimumStock,
  );

  let totalLowStock = 0;
  let outOfStock = 0;
  let potentialLoss = 0;

  const data = lowStockProducts.map((product) => {
    totalLowStock++;
    if (product.stockQuantity === 0) {
      outOfStock++;
    }
    const stockGap = product.minimumStock - product.stockQuantity;
    potentialLoss += Number(product.purchasePrice) * stockGap;

    return {
      ...product,
      stockGap,
    };
  });

  return {
    summary: {
      totalLowStock,
      outOfStock,
      potentialLoss,
    },
    products: data,
  };
};
