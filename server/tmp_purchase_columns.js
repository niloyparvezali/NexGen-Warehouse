import prisma from './src/config/prisma.js';

async function main() {
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'Purchase'
    ORDER BY ordinal_position;
  `;
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
