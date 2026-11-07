import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCheckout } from '../src/checkout.mjs';
import { verifyFinancialInvariants, INVARIANT_DEFINITIONS } from '../src/invariants.mjs';

test('valid checkout passes all 5 enterprise financial invariants', () => {
  const order = {
    items: [
      { unitPricePaise: 100000, quantity: 2 },
      { unitPricePaise: 50000, quantity: 1 }
    ],
    discountBps: 1500, // 15%
    taxBps: 1800,      // 18% GST
    shippingFeePaise: 5000,
    freeShippingAtPaise: 300000
  };

  const result = calculateCheckout(order);
  const report = verifyFinancialInvariants(order, result);

  assert.equal(report.valid, true);
  assert.equal(report.passedCount, 5);
  assert.equal(report.violations.length, 0);
  assert.equal(INVARIANT_DEFINITIONS.length, 5);
});

test('catches double discount regression violating monotonicity and single application', () => {
  const order = {
    items: [{ unitPricePaise: 100000, quantity: 1 }],
    discountBps: 1000 // 10%
  };

  // Simulate buggy double discount result: 100000 -> 90000 -> 81000
  const buggyResult = {
    currency: 'INR',
    subtotalPaise: 100000,
    discountPaise: 10000,
    taxPaise: 0,
    shippingPaise: 0,
    totalPaise: 81000 // Incorrect! Should be 90000
  };

  const report = verifyFinancialInvariants(order, buggyResult);
  assert.equal(report.valid, false);
  const ids = report.violations.map(v => v.id);
  assert.ok(ids.includes('INV-03-DISCOUNT-BOUND'));
});

test('catches negative balances and floating point non-safe integers', () => {
  const order = { items: [{ unitPricePaise: 100, quantity: 1 }] };
  const corruptResult = {
    subtotalPaise: 100,
    discountPaise: 200,
    taxPaise: 0,
    shippingPaise: 0,
    totalPaise: -100.55 // Violates both integer safety and non-negativity
  };

  const report = verifyFinancialInvariants(order, corruptResult);
  assert.equal(report.valid, false);
  const ids = report.violations.map(v => v.id);
  assert.ok(ids.includes('INV-05-INTEGER-ARITHMETIC-SAFETY'));
  assert.ok(ids.includes('INV-02-NON-NEGATIVE-LEDGER'));
});
