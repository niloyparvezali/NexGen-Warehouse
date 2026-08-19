import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwt.js";

const defaultPermissions = {
  dashboard: ["view"],
  sales: ["view", "create", "edit", "delete", "restore", "export", "print"],
  products: ["view", "create", "edit", "delete", "restore", "export", "print"],
  customers: ["view", "create", "edit", "delete", "restore", "export", "print"],
  suppliers: ["view", "create", "edit", "delete", "restore", "export", "print"],
  purchases: ["view", "create", "edit", "delete", "restore", "export", "print"],
  expenses: ["view", "create", "edit", "delete", "restore", "export", "print"],
  inventory: ["view", "create", "edit", "delete", "export", "print"],
  returns: ["view", "create", "edit", "delete", "export", "print"],
  reports: ["view", "export", "print"],
  settings: ["view", "create", "edit", "delete", "export", "print"],
  users: ["view", "create", "edit", "delete", "export", "print"],
  roles: ["view", "create", "edit", "delete", "export", "print"],
  payments: ["view", "create", "edit", "delete", "export", "print"],
};

const getDefaultRoles = () => [
  { name: "Super Admin", description: "Full system access", permissions: defaultPermissions, is_active: true },
  { name: "Administrator", description: "Administrative access", permissions: defaultPermissions, is_active: true },
  { name: "Manager", description: "Operational oversight", permissions: { ...defaultPermissions, settings: ["view"], users: ["view"], roles: ["view"] }, is_active: true },
  { name: "Cashier", description: "Sales and payments", permissions: { dashboard: ["view"], sales: ["view", "create", "edit", "export", "print"], payments: ["view", "create", "edit", "export", "print"], customers: ["view", "create", "edit"], products: ["view"] }, is_active: true },
  { name: "Inventory Manager", description: "Stock and inventory", permissions: { dashboard: ["view"], inventory: ["view", "create", "edit", "export", "print"], products: ["view", "create", "edit", "export", "print"], suppliers: ["view"], purchases: ["view", "create", "edit"] }, is_active: true },
  { name: "Accountant", description: "Financial operations", permissions: { dashboard: ["view"], purchases: ["view", "create", "edit", "export", "print"], sales: ["view", "create", "edit", "export", "print"], payments: ["view", "create", "edit", "export", "print"], expenses: ["view", "create", "edit", "export", "print"], reports: ["view", "export", "print"], settings: ["view"] }, is_active: true },
];

export async function getSettings() {
  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        company_name: "NexGen Warehouse",
      },
    });
  }

  return settings;
}

export async function updateSettings(data) {
  const existing = await prisma.setting.findFirst();

  if (!existing) {
    return prisma.setting.create({ data });
  }

  return prisma.setting.update({
    where: { id: existing.id },
    data,
  });
}

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { id: "asc" },
  });
}

export async function ensureDefaultRoles() {
  const roles = getDefaultRoles();

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: role.permissions,
        is_active: role.is_active ?? true,
      },
      create: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        is_active: role.is_active ?? true,
      },
    });
  }

  return prisma.role.findMany({ orderBy: { id: "asc" } });
}

export async function createRole(data) {
  return prisma.role.create({
    data: {
      ...data,
      is_active: data.is_active ?? true,
    },
  });
}

export async function updateRole(id, data) {
  return prisma.role.update({
    where: { id: Number(id) },
    data: {
      ...data,
      is_active: data.is_active ?? true,
    },
  });
}

export async function deleteRole(id) {
  return prisma.role.delete({ where: { id: Number(id) } });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    include: { role: true },
    orderBy: { id: "asc" },
  });
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: { role: true },
  });
}

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role_id: Number(data.role_id),
    },
    include: { role: true },
  });
}

export async function updateUser(id, data) {
  const updateData = { ...data };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  if (updateData.role_id) {
    updateData.role_id = Number(updateData.role_id);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    include: { role: true },
  });
}

export async function toggleUserStatus(id, isActive) {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { is_active: isActive },
    include: { role: true },
  });
}

export async function resetUserPassword(id, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.update({
    where: { id: Number(id) },
    data: { password: hashedPassword },
    include: { role: true },
  });
}

export async function changePassword(id, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.update({
    where: { id: Number(id) },
    data: { password: hashedPassword },
  });
}

export async function assignUserRole(id, roleId) {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { role_id: Number(roleId) },
    include: { role: true },
  });
}

export async function resetStockData() {
  await prisma.$transaction([
    prisma.stockTransaction.deleteMany(),
    prisma.product.updateMany({
      data: {
        stockQuantity: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function resetSalesData() {
  await prisma.$transaction([
    prisma.saleReturnItem.deleteMany(),
    prisma.saleReturn.deleteMany(),
    prisma.customerPayment.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.customer.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
        openingDue: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function resetPurchasesData() {
  await prisma.$transaction([
    prisma.supplierPayment.deleteMany(),
    prisma.purchaseItem.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.supplier.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function resetExpensesData() {
  await prisma.expense.deleteMany();
  return { success: true };
}

export async function resetReturnData() {
  await prisma.$transaction([
    prisma.saleReturnItem.deleteMany(),
    prisma.saleReturn.deleteMany(),
  ]);

  return { success: true };
}

export async function resetReportsData() {
  await resetUserData();
  return { success: true };
}

export async function resetCustomerData() {
  await prisma.$transaction([
    prisma.saleReturnItem.deleteMany(),
    prisma.saleReturn.deleteMany(),
    prisma.customerPayment.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.customer.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
        openingDue: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function resetSupplierData() {
  await prisma.$transaction([
    prisma.purchaseItem.deleteMany(),
    prisma.supplierPayment.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.supplier.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function resetUserData() {
  await prisma.$transaction([
    prisma.saleReturnItem.deleteMany(),
    prisma.saleReturn.deleteMany(),
    prisma.purchaseItem.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.stockTransaction.deleteMany(),
    prisma.customerPayment.deleteMany(),
    prisma.supplierPayment.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.customer.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
        openingDue: 0,
      },
    }),
    prisma.supplier.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
      },
    }),
    prisma.product.updateMany({
      data: {
        stockQuantity: 0,
      },
    }),
  ]);

  return { success: true };
}

export async function backupDatabase() {
  const fs = await import("fs/promises");
  const path = await import("path");
  const { exec } = await import("child_process");
  const { promisify } = await import("util");

  const execAsync = promisify(exec);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.dump`;
  const filePath = path.join(process.cwd(), "tmp", fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const env = process.env.DATABASE_URL;
  if (!env) {
    throw new Error("Database URL is not configured.");
  }

  await execAsync(`pg_dump "${env}" > "${filePath}"`);

  return { fileName, filePath };
}

export async function restoreDatabase(filePath) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  const env = process.env.DATABASE_URL;

  if (!env) {
    throw new Error("Database URL is not configured.");
  }

  await execAsync(`pg_restore --clean --if-exists --no-owner --no-privileges --dbname "${env}" "${filePath}"`);

  return { success: true };
}

export async function getBackupHistory() {
  const fs = await import("fs/promises");
  const path = await import("path");
  const backupDir = path.join(process.cwd(), "tmp");

  try {
    const files = await fs.readdir(backupDir);
    return files.filter((file) => file.endsWith(".dump")).map((file) => ({
      fileName: file,
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (!user || !user.is_active) {
    throw new Error("Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateAccessToken({ id: user.id, email: user.email, role: user.role.name });

  return { token, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role.name } };
}
