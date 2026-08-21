import prisma from "../config/prisma.js";
import {
  getCustomerReport,
  getExpenseReport,
  getInventoryReport,
  getLowStockReport,
  getProfitReport,
  getPurchaseReport,
  getSalesReport,
  getSupplierReport,
} from "./report.service.js";

const formatMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildMonthlyTrend = (items, keyField = "createdAt") => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const trend = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthKey = formatMonthKey(date);
    const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const total = items.reduce((sum, entry) => {
      const entryDate = entry[keyField];
      const entryKey = entryDate ? formatMonthKey(new Date(entryDate)) : null;

      return entryKey === monthKey ? sum + Number(entry.total || 0) : sum;
    }, 0);

    trend.push({
      month: monthLabel,
      total,
    });
  }

  return trend;
};

const buildExpenseTrend = (items) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const trend = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthKey = formatMonthKey(date);
    const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const total = items.reduce((sum, entry) => {
      const entryKey = entry.expenseDate ? formatMonthKey(new Date(entry.expenseDate)) : null;

      return entryKey === monthKey ? sum + Number(entry.amount || 0) : sum;
    }, 0);

    trend.push({
      month: monthLabel,
      total,
    });
  }

  return trend;
};

export const getDashboardSummary = async () => {
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Previous month same date range for MTD comparison
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthEnd = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate(), 23, 59, 59, 999);

  // 14 days ago start
  const start14DaysAgo = new Date(today);
  start14DaysAgo.setDate(today.getDate() - 13);
  start14DaysAgo.setHours(0, 0, 0, 0);

  const [
    inventoryReport,
    lowStockReport,
    customerReport,
    supplierReport,
    todaySalesReport,
    monthSalesReport,
    prevMonthSalesReport,
    todayPurchaseReport,
    monthPurchaseReport,
    todayExpenseReport,
    monthExpenseReport,
    todayProfitReport,
    monthProfitReport,
  ] = await Promise.all([
    getInventoryReport(),
    getLowStockReport(),
    getCustomerReport(),
    getSupplierReport(),
    getSalesReport({
      startDate: startOfToday.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getSalesReport({
      startDate: startOfMonth.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getSalesReport({
      startDate: prevMonthStart.toISOString(),
      endDate: prevMonthEnd.toISOString(),
    }),
    getPurchaseReport({
      startDate: startOfToday.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getPurchaseReport({
      startDate: startOfMonth.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getExpenseReport({
      startDate: startOfToday.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getExpenseReport({
      startDate: startOfMonth.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getProfitReport({
      startDate: startOfToday.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
    getProfitReport({
      startDate: startOfMonth.toISOString(),
      endDate: endOfToday.toISOString(),
    }),
  ]);

  // Fetch 14-day sales records
  const sales14Days = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: start14DaysAgo,
        lte: endOfToday,
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Build 14-day daily revenue array
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const trend14Days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start14DaysAgo);
    d.setDate(start14DaysAgo.getDate() + i);
    const dayStr = `${String(d.getDate()).padStart(2, "0")} ${monthShort[d.getMonth()]}`;

    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const total = sales14Days.reduce((sum, sale) => {
      const sDate = new Date(sale.createdAt);
      if (sDate >= dayStart && sDate <= dayEnd) {
        return sum + Number(sale.total || 0);
      }
      return sum;
    }, 0);

    trend14Days.push({
      date: dayStr,
      fullDate: d.toISOString().split("T")[0],
      sales: total,
    });
  }

  // Calculate MTD vs Last Month Sales Pct
  const currMonthTotalSales = Number(monthSalesReport.summary.totalSales || 0);
  const prevMonthTotalSales = Number(prevMonthSalesReport.summary.totalSales || 0);
  let monthVsLastMonthPct = 0;
  if (prevMonthTotalSales > 0) {
    monthVsLastMonthPct = Math.round(((currMonthTotalSales - prevMonthTotalSales) / prevMonthTotalSales) * 100);
  } else if (currMonthTotalSales > 0) {
    monthVsLastMonthPct = 100;
  }

  // Collections (MTD) metrics
  const mtdSales = monthSalesReport.sales || [];
  const mtdCollected = mtdSales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
  const mtdStillDue = mtdSales.reduce((sum, s) => sum + Number(s.dueAmount || 0), 0);
  const mtdFullyPaid = mtdSales.filter((s) => s.paymentStatus === "PAID").length;
  const mtdWithBalance = mtdSales.filter((s) => Number(s.dueAmount || 0) > 0).length;

  // Top Customers (MTD)
  const topCustomerMap = {};
  mtdSales.forEach((sale) => {
    const cName = sale.customer?.name || "Walk-in Customer";
    const cId = sale.customer?.id || "walk-in";
    if (!topCustomerMap[cId]) {
      topCustomerMap[cId] = { id: cId, name: cName, amount: 0 };
    }
    topCustomerMap[cId].amount += Number(sale.total || 0);
  });
  const topCustomersMTD = Object.values(topCustomerMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Additional database queries for monthly trend chart, low stock, recent sales/purchases/activities
  const [salesTrendItems, purchaseTrendItems, expenseTrendItems, topSellingItems, pendingCustomerDueItems, pendingSupplierDueItems, recentSales, recentPurchases, recentExpenses, recentStockTx] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth() - 5, 1),
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth() - 5, 1),
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.expense.findMany({
      where: {
        isActive: true,
        expenseDate: {
          gte: new Date(today.getFullYear(), today.getMonth() - 5, 1),
        },
      },
      select: {
        expenseDate: true,
        amount: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    }),
    prisma.saleItem.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.sale.findMany({
      where: {
        dueAmount: {
          gt: 0,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: {
        dueAmount: {
          gt: 0,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            supplierName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    // Recent Sales
    prisma.sale.findMany({
      include: {
        customer: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { first_name: true, last_name: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Recent Purchases
    prisma.purchase.findMany({
      include: {
        supplier: {
          select: { id: true, supplierName: true },
        },
        createdBy: {
          select: { first_name: true, last_name: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // Recent Expenses
    prisma.expense.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { first_name: true, last_name: true, username: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent Stock Transactions
    prisma.stockTransaction.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        createdBy: { select: { first_name: true, last_name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const salesTrend = buildMonthlyTrend(salesTrendItems);
  const purchaseTrend = buildMonthlyTrend(purchaseTrendItems);
  const expenseTrend = buildExpenseTrend(expenseTrendItems);

  const revenueVsExpense = salesTrend.map((entry, index) => ({
    month: entry.month,
    sales: entry.total,
    expenses: expenseTrend[index]?.total || 0,
  }));

  const topSellingProducts = Object.values(
    topSellingItems.reduce((products, item) => {
      const productName = item.product?.name || "Unknown Product";
      const current = products[productName] || {
        id: productName,
        name: productName,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += item.quantity;
      current.revenue += Number(item.total || 0);
      products[productName] = current;

      return products;
    }, {}),
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Format Helper for Date Display
  const formatDateNice = (dInput) => {
    if (!dInput) return "";
    const d = new Date(dInput);
    const day = String(d.getDate()).padStart(2, "0");
    const m = monthShort[d.getMonth()];
    const y = d.getFullYear();
    return `${day} ${m} ${y}`;
  };

  const formatTimeNice = (dInput) => {
    if (!dInput) return "";
    const d = new Date(dInput);
    const day = String(d.getDate()).padStart(2, "0");
    const m = monthShort[d.getMonth()];
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${m}, ${hh}:${mm}`;
  };

  // Build Recent Activity Stream from real records
  const activityEvents = [
    ...recentSales.map((s) => ({
      id: `sale-${s.id}`,
      user: s.createdBy ? `${s.createdBy.first_name} ${s.createdBy.last_name}`.trim() || s.createdBy.username : "Administrator",
      action: "create",
      module: "sales",
      record: `Created Invoice ${s.invoiceNumber} — ${s.customer?.name || "Walk-in Customer"}`,
      createdAt: s.createdAt,
      timeFormatted: formatTimeNice(s.createdAt),
    })),
    ...recentPurchases.map((p) => ({
      id: `purchase-${p.id}`,
      user: p.createdBy ? `${p.createdBy.first_name} ${p.createdBy.last_name}`.trim() || p.createdBy.username : "Administrator",
      action: "create",
      module: "purchasing",
      record: `Created Purchase ${p.purchaseNumber} — ${p.supplier?.supplierName || "Supplier"}`,
      createdAt: p.createdAt,
      timeFormatted: formatTimeNice(p.createdAt),
    })),
    ...recentExpenses.map((e) => ({
      id: `expense-${e.id}`,
      user: e.createdBy ? `${e.createdBy.first_name} ${e.createdBy.last_name}`.trim() || e.createdBy.username : "Administrator",
      action: "create",
      module: "accounting",
      record: `Recorded Expense ${e.expenseNumber} (${e.category})`,
      createdAt: e.createdAt,
      timeFormatted: formatTimeNice(e.createdAt),
    })),
    ...recentStockTx.map((st) => ({
      id: `stock-${st.id}`,
      user: st.createdBy ? `${st.createdBy.first_name} ${st.createdBy.last_name}`.trim() || st.createdBy.username : "Administrator",
      action: "update",
      module: "inventory",
      record: `${st.type} ${st.quantity} units for ${st.product?.name || "Product"}`,
      createdAt: st.createdAt,
      timeFormatted: formatTimeNice(st.createdAt),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 7);

  // Count active open invoices (dueAmount > 0)
  const openInvoicesCount = await prisma.sale.count({
    where: { dueAmount: { gt: 0 } },
  });

  return {
    sales: {
      today: Number(todaySalesReport.summary.totalSales || 0),
      month: Number(monthSalesReport.summary.totalSales || 0),
      total: Number(todaySalesReport.summary.totalSales || 0) + Number(monthSalesReport.summary.totalSales || 0),
      orders: todaySalesReport.summary.totalInvoices,
      monthOrders: monthSalesReport.summary.totalInvoices,
      monthVsLastMonthPct,
      trend14Days,
      trend: salesTrend,
      recent: recentSales.map((sale) => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customer?.name || "Walk-in Customer",
        total: Number(sale.total || 0),
        createdAt: sale.createdAt,
        dateFormatted: formatDateNice(sale.createdAt),
        paymentStatus: sale.paymentStatus,
      })),
    },
    purchase: {
      today: Number(todayPurchaseReport.summary.totalAmount || 0),
      month: Number(monthPurchaseReport.summary.totalAmount || 0),
      total: Number(todayPurchaseReport.summary.totalAmount || 0) + Number(monthPurchaseReport.summary.totalAmount || 0),
      trend: purchaseTrend,
      recent: recentPurchases.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        supplierName: purchase.supplier?.supplierName || "Unknown Supplier",
        total: Number(purchase.total || 0),
        createdAt: purchase.createdAt,
        dateFormatted: formatDateNice(purchase.createdAt),
        paymentStatus: purchase.paymentStatus,
      })),
    },
    expenses: {
      today: Number(todayExpenseReport.summary.totalAmount || 0),
      month: Number(monthExpenseReport.summary.totalAmount || 0),
      total: Number(todayExpenseReport.summary.totalAmount || 0) + Number(monthExpenseReport.summary.totalAmount || 0),
      trend: expenseTrend,
      recent: todayExpenseReport.expenses.slice(0, 5).map((expense) => ({
        id: expense.id,
        expenseNumber: expense.expenseNumber,
        category: expense.category?.name || expense.category,
        amount: Number(expense.amount || 0),
        expenseDate: expense.expenseDate,
      })),
    },
    profit: {
      today: Number(todayProfitReport.netProfit || 0),
      month: Number(monthProfitReport.netProfit || 0),
      total: Number(monthProfitReport.netProfit || 0),
    },
    finance: {
      customerDue: Number(customerReport.summary.totalOutstanding || 0),
      supplierDue: Number(supplierReport.summary.totalDue || 0),
      openInvoicesCount,
      pendingCustomerDue: pendingCustomerDueItems.length,
      pendingSupplierDue: pendingSupplierDueItems.length,
      collections: {
        collected: mtdCollected,
        stillDue: mtdStillDue,
        fullyPaidCount: mtdFullyPaid,
        withBalanceCount: mtdWithBalance,
      },
    },
    inventory: {
      totalProducts: inventoryReport.summary.totalProducts,
      lowStockProducts: lowStockReport.summary.totalLowStock,
      outOfStockProducts: lowStockReport.summary.outOfStock,
      stockValue: inventoryReport.summary.stockValue,
      topSellingProducts,
      lowStockItems: lowStockReport.products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || `PRD-${product.id.slice(-4).toUpperCase()}`,
        stockQuantity: product.stockQuantity,
        minimumStock: product.minimumStock,
      })),
      outOfStockItems: lowStockReport.products.filter((product) => product.stockQuantity === 0).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || `PRD-${product.id.slice(-4).toUpperCase()}`,
        stockQuantity: product.stockQuantity,
      })),
    },
    topCustomers: topCustomersMTD,
    counters: {
      customers: customerReport.summary.totalCustomers,
      activeInvoices: monthSalesReport.summary.totalInvoices || openInvoicesCount,
      products: inventoryReport.summary.totalProducts,
      suppliers: supplierReport.summary.totalSuppliers,
    },
    customers: {
      total: customerReport.summary.totalCustomers,
    },
    suppliers: {
      total: supplierReport.summary.totalSuppliers,
    },
    charts: {
      revenueVsExpense,
      trend14Days,
    },
    activity: activityEvents,
    alerts: {
      lowStock: lowStockReport.products.slice(0, 10).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || `PRD-${product.id.slice(-4).toUpperCase()}`,
        stockQuantity: product.stockQuantity,
        minimumStock: product.minimumStock,
      })),
      outOfStock: lowStockReport.products.filter((product) => product.stockQuantity === 0).slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
      })),
      pendingCustomerDue: pendingCustomerDueItems.map((sale) => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customer?.name || "Walk-in Customer",
        dueAmount: Number(sale.dueAmount || 0),
      })),
      pendingSupplierDue: pendingSupplierDueItems.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        supplierName: purchase.supplier?.supplierName || "Unknown Supplier",
        dueAmount: Number(purchase.dueAmount || 0),
      })),
    },
  };
};

