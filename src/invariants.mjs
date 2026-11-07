/**
 * Financial Invariant & Policy Verification Engine for E-Commerce Checkouts
 * Enforces strict financial accounting rules and bounds against exploits,
 * rounding drift, and double-discount regressions.
 */

export const INVARIANT_DEFINITIONS = [
  {
    id: 'INV-01-MONOTONICITY',
    name: 'Discount Monotonicity',
    description: 'When shipping and taxes are zero, total charge must not exceed subtotal.'
  },
  {
    id: 'INV-02-NON-NEGATIVE-LEDGER',
    name: 'Non-Negative Balance',
    description: 'Total charge and all line-item components must remain non-negative (anti-exploit).'
  },
  {
    id: 'INV-03-DISCOUNT-BOUND',
    name: 'Strict Coupon Single-Application',
    description: 'Discount must be applied exactly once and not compounded recursively on residual subtotal.'
  },
  {
    id: 'INV-04-TAX-ON-DISCOUNTED-BASE',
    name: 'Tax Invariant on Net Taxable Basis',
    description: 'Tax must be computed strictly on the discounted subtotal, not phantom pre-discounted amounts.'
  },
  {
    id: 'INV-05-INTEGER-ARITHMETIC-SAFETY',
    name: 'Sub-Unit Integer Precision',
    description: 'All monetary figures must be safe 64-bit integers in sub-units (paise) with zero floating-point drift.'
  }
];

export function verifyFinancialInvariants(order, result) {
  const violations = [];

  // Check INV-05: Integer Safety
  const fields = ['subtotalPaise', 'discountPaise', 'taxPaise', 'shippingPaise', 'totalPaise'];
  for (const field of fields) {
    if (!Number.isSafeInteger(result[field])) {
      violations.push({
        id: 'INV-05-INTEGER-ARITHMETIC-SAFETY',
        field,
        message: `${field} (${result[field]}) is not a safe integer.`
      });
    }
  }

  // Check INV-02: Non-negative balance
  for (const field of fields) {
    if (result[field] < 0) {
      violations.push({
        id: 'INV-02-NON-NEGATIVE-LEDGER',
        field,
        message: `${field} cannot be negative.`
      });
    }
  }

  // Check INV-01: Monotonicity
  if ((order.taxBps ?? 0) === 0 && (order.shippingFeePaise ?? 0) === 0) {
    if (result.totalPaise > result.subtotalPaise) {
      violations.push({
        id: 'INV-01-MONOTONICITY',
        message: `Total (${result.totalPaise}) exceeds subtotal (${result.subtotalPaise}) despite zero tax & shipping.`
      });
    }
  }

  // Check INV-03: Strict Coupon Single-Application
  const expectedDiscount = Math.round(result.subtotalPaise * (order.discountBps ?? 0) / 10000);
  if (result.discountPaise !== expectedDiscount) {
    violations.push({
      id: 'INV-03-DISCOUNT-BOUND',
      message: `Discount (${result.discountPaise}) does not match single-application basis (${expectedDiscount}).`
    });
  }

  // Check Double Discounting Bug: Total Países when discount applied
  const netSubtotal = result.subtotalPaise - result.discountPaise;
  const expectedTax = Math.round(netSubtotal * (order.taxBps ?? 0) / 10000);
  const expectedShipping = result.subtotalPaise >= (order.freeShippingAtPaise ?? Infinity) ? 0 : (order.shippingFeePaise ?? 0);
  const expectedTotal = netSubtotal + expectedTax + expectedShipping;

  if (result.totalPaise !== expectedTotal) {
    violations.push({
      id: 'INV-03-DISCOUNT-BOUND',
      message: `Total charge (${result.totalPaise}) deviates from expected single-discount total (${expectedTotal}). Undercharge/overcharge detected.`
    });
  }

  // Check INV-04: Tax Base
  if (result.taxPaise !== expectedTax) {
    violations.push({
      id: 'INV-04-TAX-ON-DISCOUNTED-BASE',
      message: `Tax (${result.taxPaise}) is not computed on net taxable subtotal (${expectedTax}).`
    });
  }

  return {
    valid: violations.length === 0,
    invariantsChecked: INVARIANT_DEFINITIONS.length,
    passedCount: INVARIANT_DEFINITIONS.length - (violations.length > 0 ? new Set(violations.map(v => v.id)).size : 0),
    violations
  };
}
