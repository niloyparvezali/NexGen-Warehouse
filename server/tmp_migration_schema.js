import prisma from './src/config/prisma.js';

async function main() {
  try {
    const cols = await prisma.$queryRawUnsafe(
      'select column_name from information_schema.columns where table_name = $1 order by ordinal_position',
      '_prisma_migrations',
    );
    console.log('COLUMNS', cols.map((c) => c.column_name).join(','));
    const rows = await prisma.$queryRawUnsafe('select * from _prisma_migrations limit 1');
    console.log('ROW', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
