import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCheckout } from '../src/checkout.mjs';

const order = (extra = {}) => ({ items: [{ unitPricePaise: 100000, quantity: 1 }], ...extra });

test('a ten percent coupon is applied exactly once', () => {
  const bill = calculateCheckout(order({ discountBps: 1000 }));
  assert.equal(bill.totalPaise, 90000);
  assert.equal(bill.discountPaise, 10000);
});
test('quantities and mixed item prices contribute to the subtotal', () => {
  assert.equal(calculateCheckout({ items: [{ unitPricePaise: 25000, quantity: 2 }, { unitPricePaise: 9999, quantity: 3 }] }).totalPaise, 79997);
});
test('tax is calculated on discounted goods', () => {
  const bill = calculateCheckout(order({ discountBps: 1000, taxBps: 1800 }));
  assert.equal(bill.taxPaise, 16200);
  assert.equal(bill.totalPaise, 106200);
});
test('the shipping threshold uses the subtotal before discount', () => {
  assert.equal(calculateCheckout(order({ discountBps: 1000, freeShippingAtPaise: 100000, shippingFeePaise: 4900 })).shippingPaise, 0);
});
test('shipping is charged below the threshold', () => {
  assert.equal(calculateCheckout(order({ freeShippingAtPaise: 100001, shippingFeePaise: 4900 })).totalPaise, 104900);
});
test('a full discount never makes goods negative', () => {
  assert.equal(calculateCheckout(order({ discountBps: 10000, taxBps: 1800 })).totalPaise, 0);
});
test('fractional discounts round once at order level', () => {
  const bill = calculateCheckout({ items: [{ unitPricePaise: 101, quantity: 3 }], discountBps: 1000 });
  assert.equal(bill.discountPaise, 30);
  assert.equal(bill.totalPaise, 273);
});
test('no coupon preserves the original total', () => assert.equal(calculateCheckout(order()).totalPaise, 100000));
test('an empty cart and malformed items are rejected', () => {
  for (const items of [[], null, [null], [{ unitPricePaise: 100, quantity: 0 }]]) {
    assert.throws(() => calculateCheckout({ items }));
  }
});
test('negative, fractional and nonfinite money is rejected', () => {
  for (const unitPricePaise of [-1, 1.5, NaN, Infinity, '100']) {
    assert.throws(() => calculateCheckout({ items: [{ unitPricePaise, quantity: 1 }] }));
  }
});
test('invalid discounts and taxes are rejected', () => {
  for (const value of [-1, 10001, 1.5, '1000']) {
    assert.throws(() => calculateCheckout(order({ discountBps: value })));
    assert.throws(() => calculateCheckout(order({ taxBps: value })));
  }
});
test('oversized totals are rejected rather than silently overflowing', () => {
  assert.throws(() => calculateCheckout({ items: [{ unitPricePaise: 100_000_000, quantity: 2 }] }));
});
