import prisma from './src/config/prisma.js';

async function main() {
  const suppliers = await prisma.supplier.findMany({ take: 1 });
  const products = await prisma.product.findMany({ take: 1 });
  const users = await prisma.user.findMany({ take: 1 });
  console.log(JSON.stringify({ suppliers, products, users }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
