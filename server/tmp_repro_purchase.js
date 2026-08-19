import prisma from './src/config/prisma.js';
import { createPurchase } from './src/services/purchase.service.js';

async function main() {
  const supplier = await prisma.supplier.findFirst({ where: { isActive: true } });
  const product = await prisma.product.findFirst({ where: { isActive: true } });
  const user = await prisma.user.findFirst();

  if (!supplier || !product || !user) {
    throw new Error('Missing test supplier/product/user');
  }

  const data = {
    supplierId: supplier.id,
    invoiceNumber: null,
    referenceNumber: null,
    discount: 0,
    tax: 0,
    shippingCost: 300,
    totalBill: 10000,
    paidAmount: 10000,
    paymentMethod: 'CASH',
    notes: null,
    attachment: null,
    clientReferenceId: 'bef454a1-8775-4881-b411-d283b2af7735',
    status: 'COMPLETED',
    items: [{
      productId: product.id,
      quantity: 1,
      purchasePrice: 10000,
    }],
  };

  try {
    const result = await createPurchase(data, user.id);
    console.log('Purchase created:', result);
  } catch (err) {
    console.error('CREATE PURCHASE ERROR', err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
