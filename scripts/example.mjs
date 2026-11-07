import { readFile } from 'node:fs/promises';
import { calculateCheckout } from '../src/checkout.mjs';
const incident = JSON.parse(await readFile(new URL('../fixtures/coupon-twice.json', import.meta.url), 'utf8'));
console.log(incident.report);
console.log('Correct checkout:', calculateCheckout(incident.order));
