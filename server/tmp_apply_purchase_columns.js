import prisma from './src/config/prisma.js';

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Purchase"
      ADD COLUMN IF NOT EXISTS "attachment" TEXT,
      ADD COLUMN IF NOT EXISTS "clientReferenceId" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_clientReferenceId_key" ON "Purchase"("clientReferenceId");
  `);
  const columns = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Purchase' ORDER BY ordinal_position;`,
  );
  console.log(JSON.stringify(columns, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
