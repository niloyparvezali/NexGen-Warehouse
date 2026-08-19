import prisma from './src/config/prisma.js';

async function main() {
  try {
    const rows = await prisma.$queryRawUnsafe('select migration_name from _prisma_migrations order by started_at');
    console.log(rows.map((row) => row.migration_name).join('\n'));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
