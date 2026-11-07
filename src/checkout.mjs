/** Prices use integer paise. Discounts use basis points: 1000 = 10%. */
const MAX_MONEY = 100_000_000;

function integer(value, name, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export function calculateCheckout(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    throw new TypeError('A checkout needs at least one item');
  }
  const discountBps = integer(order.discountBps ?? 0, 'discountBps', 0, 10_000);
  const taxBps = integer(order.taxBps ?? 0, 'taxBps', 0, 10_000);
  const shippingFeePaise = integer(order.shippingFeePaise ?? 0, 'shippingFeePaise', 0, MAX_MONEY);
  const freeShippingAtPaise = integer(order.freeShippingAtPaise ?? MAX_MONEY, 'freeShippingAtPaise', 0, MAX_MONEY);
  let subtotalPaise = 0;
  for (const item of order.items) {
    if (!item || typeof item !== 'object') throw new TypeError('Each item must be an object');
    const price = integer(item.unitPricePaise, 'unitPricePaise', 0, MAX_MONEY);
    const quantity = integer(item.quantity, 'quantity', 1, 10_000);
    subtotalPaise += price * quantity;
    integer(subtotalPaise, 'subtotalPaise', 0, MAX_MONEY);
  }
  // Business rule: round the order-level discount once, then tax discounted goods.
  const discountPaise = Math.round(subtotalPaise * discountBps / 10_000);
  const discountedSubtotal = subtotalPaise - discountPaise;
  const taxPaise = Math.round(discountedSubtotal * taxBps / 10_000);
  // Free shipping depends on the original subtotal, before the coupon.
  const shippingPaise = subtotalPaise >= freeShippingAtPaise ? 0 : shippingFeePaise;
  const totalPaise = discountedSubtotal + taxPaise + shippingPaise;
  integer(totalPaise, 'totalPaise', 0, MAX_MONEY);
  return Object.freeze({ currency: 'INR', subtotalPaise, discountPaise, taxPaise, shippingPaise, totalPaise });
}
