import prisma from './src/config/prisma.js';

async function main() {
  const purchaseId = 'cmsq0r3ux0001vdaw4z2yd4wn';
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      supplier: true,
      createdBy: true,
      payments: true,
    },
  });

  const productId = purchase?.items?.[0]?.productId;
  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId } })
    : null;

  const stockTransactions = productId
    ? await prisma.stockTransaction.findMany({ where: { productId }, orderBy: { createdAt: 'desc' }, take: 5 })
    : [];

  console.log(JSON.stringify({ purchase, product, stockTransactions }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
