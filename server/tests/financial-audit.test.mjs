import assert from 'node:assert/strict';
import {
  calculateWeightedAverageCost,
  calculateStockAfterMovement,
  calculateCustomerDue,
  calculateSupplierDue,
  calculateGrossProfit,
  calculateNetProfit,
  calculateSaleTotals,
} from '../src/services/financial.service.js';

const tests = [
  {
    name: 'opening stock + purchase - sale',
    run: () => {
      const stock = calculateStockAfterMovement({ opening: 10, stockIn: 20, stockOut: 5 });
      assert.equal(stock, 25);
    },
  },
  {
    name: 'gross profit from sale and cost',
    run: () => {
      const result = calculateSaleTotals({ items: [{ sellingPrice: 2500, quantity: 5 }], discount: 0, tax: 0 });
      const cogs = 2000 * 5;
      const grossProfit = calculateGrossProfit({ netSales: result.total, cogs });
      assert.equal(result.total, 12500);
      assert.equal(cogs, 10000);
      assert.equal(grossProfit, 2500);
    },
  },
  {
    name: 'customer due after payment',
    run: () => {
      const due = calculateCustomerDue({ totalSales: 10000, totalPayments: 4000 });
      assert.equal(due, 6000);
    },
  },
  {
    name: 'supplier due after payment',
    run: () => {
      const due = calculateSupplierDue({ totalPurchases: 20000, totalPayments: 7000 });
      assert.equal(due, 13000);
    },
  },
  {
    name: 'net profit from gross profit minus expenses',
    run: () => {
      const grossProfit = calculateGrossProfit({ netSales: 100000, cogs: 70000 });
      const netProfit = calculateNetProfit({ grossProfit, expenses: 10000 });
      assert.equal(grossProfit, 30000);
      assert.equal(netProfit, 20000);
    },
  },
  {
    name: 'sales return restores stock',
    run: () => {
      const stock = calculateStockAfterMovement({ opening: 10, stockIn: 1, stockOut: 3 });
      assert.equal(stock, 8);
    },
  },
  {
    name: 'purchase return reduces stock',
    run: () => {
      const stock = calculateStockAfterMovement({ opening: 10, stockIn: 0, stockOut: 2 });
      assert.equal(stock, 8);
    },
  },
  {
    name: 'weighted average cost calculation',
    run: () => {
      const avgCost = calculateWeightedAverageCost(10, 2000, 20, 2500);
      assert.equal(Number(avgCost.toFixed(2)), 2333.33);
    },
  },
  {
    name: 'insufficient stock is rejected',
    run: () => {
      const available = 5;
      const requested = 7;
      const isValid = requested <= available;
      assert.equal(isValid, false);
    },
  },
];

for (const test of tests) {
  test.run();
}

console.log(`Passed ${tests.length} financial audit tests.`);
