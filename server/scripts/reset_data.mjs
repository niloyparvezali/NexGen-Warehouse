import prisma from '../src/config/prisma.js';

async function resetData() {
  try {
    console.log('🗑️  Starting selective business data reset...\n');

    console.log('📋 Step 1: Deleting transactional child records...');
    await prisma.saleReturnItem.deleteMany();
    console.log('   ✓ SaleReturnItems deleted');

    await prisma.saleReturn.deleteMany();
    console.log('   ✓ SaleReturns deleted');

    await prisma.purchaseItem.deleteMany();
    console.log('   ✓ PurchaseItems deleted');

    await prisma.saleItem.deleteMany();
    console.log('   ✓ SaleItems deleted');

    await prisma.stockTransaction.deleteMany();
    console.log('   ✓ StockTransactions deleted');

    await prisma.customerPayment.deleteMany();
    console.log('   ✓ CustomerPayments deleted');

    await prisma.supplierPayment.deleteMany();
    console.log('   ✓ SupplierPayments deleted');

    console.log('\n📋 Step 2: Deleting transactional parent records...');
    await prisma.expense.deleteMany();
    console.log('   ✓ Expenses deleted');

    await prisma.purchase.deleteMany();
    console.log('   ✓ Purchases deleted');

    await prisma.sale.deleteMany();
    console.log('   ✓ Sales deleted');

    console.log('\n📋 Step 3: Resetting customer and supplier balances...');
    await prisma.customer.updateMany({
      data: {
        openingDue: 0,
        currentBalance: 0,
        previousDue: 0,
      },
    });
    console.log('   ✓ Customer balances reset');

    await prisma.supplier.updateMany({
      data: {
        currentBalance: 0,
        previousDue: 0,
      },
    });
    console.log('   ✓ Supplier balances reset');

    console.log('\n✅ Verifying retained master data and cleared transactional data...');
    const counts = {
      Category: await prisma.category.count(),
      Brand: await prisma.brand.count(),
      Unit: await prisma.unit.count(),
      Product: await prisma.product.count(),
      Supplier: await prisma.supplier.count(),
      Customer: await prisma.customer.count(),
      Purchase: await prisma.purchase.count(),
      Sale: await prisma.sale.count(),
      PurchaseItem: await prisma.purchaseItem.count(),
      SaleItem: await prisma.saleItem.count(),
      SaleReturn: await prisma.saleReturn.count(),
      SaleReturnItem: await prisma.saleReturnItem.count(),
      StockTransaction: await prisma.stockTransaction.count(),
      CustomerPayment: await prisma.customerPayment.count(),
      SupplierPayment: await prisma.supplierPayment.count(),
      Expense: await prisma.expense.count(),
    };

    console.log('\n📊 Final Record Counts:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count}`);
    });

    console.log('\nℹ️  Note: Categories, Brands, Units, Products, Users, Roles, and Settings were left unchanged.');

    const transactionalClean =
      counts.Purchase === 0 &&
      counts.Sale === 0 &&
      counts.PurchaseItem === 0 &&
      counts.SaleItem === 0 &&
      counts.SaleReturn === 0 &&
      counts.SaleReturnItem === 0 &&
      counts.StockTransaction === 0 &&
      counts.CustomerPayment === 0 &&
      counts.SupplierPayment === 0 &&
      counts.Expense === 0;

    if (transactionalClean) {
      console.log('\n✨ Business activity reset complete. Inventory master data is preserved.\n');
    } else {
      console.warn('\n⚠️  Warning: Some transactional data still remains in the database.\n');
    }

    console.log(JSON.stringify({ ok: true, counts, transactionalClean }, null, 2));
  } catch (e) {
    console.error('❌ ERROR', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

resetData();
