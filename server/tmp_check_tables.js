import prisma from './src/config/prisma.js';

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe(
      'select table_name from information_schema.tables where table_schema = $1 order by table_name',
      'public',
    );
    console.log(tables.map((t) => t.table_name).join('\n'));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
