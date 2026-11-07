// Runs in a separate process so the module is reloaded after an agent edits it.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { calculateCheckout } = await import(pathToFileURL(resolve(process.argv[2])).href);
const cases = [
  { name: '10% coupon applied once', order: { items: [{ unitPricePaise: 100000, quantity: 1 }], discountBps: 1000 }, expected: 90000 },
  { name: 'No coupon leaves price unchanged', order: { items: [{ unitPricePaise: 100000, quantity: 1 }] }, expected: 100000 },
  { name: 'Discount precedes tax', order: { items: [{ unitPricePaise: 100000, quantity: 1 }], discountBps: 1000, taxBps: 1800 }, expected: 106200 },
  { name: 'Free shipping uses original subtotal', order: { items: [{ unitPricePaise: 100000, quantity: 1 }], discountBps: 1000, shippingFeePaise: 4900, freeShippingAtPaise: 100000 }, expected: 90000 },
  { name: 'Rounding occurs once', order: { items: [{ unitPricePaise: 101, quantity: 3 }], discountBps: 1000 }, expected: 273 },
  { name: '100% discount is zero', order: { items: [{ unitPricePaise: 100000, quantity: 1 }], discountBps: 10000 }, expected: 0 }
];
let failed = 0;
for (const c of cases) {
  const actual = calculateCheckout(c.order).totalPaise;
  const passed = actual === c.expected;
  if (!passed) failed++;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${c.name}: expected=${c.expected} actual=${actual} paise`);
}
console.log(`${cases.length - failed}/${cases.length} checks passed`);
process.exitCode = failed ? 1 : 0;
