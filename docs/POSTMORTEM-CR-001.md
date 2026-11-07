# Executive Incident Postmortem: CR-001
**Title**: SAVE10 is applied twice  
**Severity**: P1 — Revenue & Billing Discrepancy  
**Status**: RESOLVED  
**MTTR (Mean Time to Remediation)**: 19 minutes  
**Platform**: Switch Room (Mattermost × Codex Autonomous Agent Pair)

---

## 1. Executive Summary

On November 7, 2026, an urgent pricing calculation regression in the checkout microservice was reported in team chat by Charan Arangi (`@charantej`). Customers utilizing the `SAVE10` promotional code were charged ₹810 instead of the expected ₹900 on ₹1,000 carts, causing a silent **₹90 undercharge per transaction**.

Within minutes, the team utilized **Switch** to coordinate two specialized AI agents directly in Mattermost:
1. **`checkout-triager`** validated the report parameters and initiated a structured handoff.
2. **`checkout-investigator`** spun up an isolated sandbox, reproduced the bug with real CLI execution (2/6 checks passed), and submitted a one-line fix for human authorization.
3. Lead Engineer Dheeraj M G (`@dheerajmg`) reviewed and approved the fix in-thread.
4. The investigator applied the fix and verified all 6 regression checks and financial invariants.

**Financial Loss Prevented**: ₹90.00 per transaction (~₹9,00,000 per 10,000 transactions).

---

## 2. Impact & Incident Metrics

| Metric | Measured Value | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Incident Severity** | P1 (Revenue Impacting) | P1 | Identified |
| **Customer Overcharge** | ₹0.00 (Safe) | ₹0.00 | Passed |
| **Merchant Undercharge Leak** | ₹90.00 per cart | ₹0.00 | Averted |
| **Total Test Suite Checks** | 6 / 6 Passed | 100% | Verified |
| **Enterprise Financial Invariants** | 5 / 5 Invariants Satisfied | 100% | Compliant |
| **Human Review Gate** | Authenticated in Chat | Required | Enforced |

---

## 3. Cryptographic Code Provenance

To guarantee complete audit integrity and prevent unauthorized code drift, all execution stages were cryptographically hashed:

- **Seeded Vulnerable Code SHA-256**:  
  `9674f4fc7bf1b6be90889d3dc795d51b994746f3cded7abc67eed5c12b54ee52`
- **Verified Remediated Code SHA-256**:  
  `6468aaea59a80028b75d0eda34a0408c240e0997bd1887456762185185cd8ca3`
- **Human Review Sign-off**:  
  - **Reviewer**: `@dheerajmg`  
  - **Timestamp**: `2026-11-07T18:19:00.257Z`  
  - **Approval Message**: *"@checkout-investigator I approve the proposed CR-001 fix: apply the coupon once in lab/checkout.mjs. Run the checks and show the result."*

---

## 4. Root Cause Analysis (RCA)

In `src/checkout.mjs`, the discounted subtotal calculation suffered from a recursive discount compounding error:

```javascript
// VULNERABLE CODE:
const discountedSubtotal = Math.round((subtotalPaise - discountPaise) * (10000 - discountBps) / 10000);
```

The algorithm subtracted the discount from the subtotal, but then multiplied the remainder by 90% a second time (`100000 -> 90000 -> 81000 paise`).

**The Approved Remediation**:
```javascript
// REMEDIATED CODE:
const discountedSubtotal = subtotalPaise - discountPaise;
```

---

## 5. Preventative Safeguards Implemented

1. **Enterprise Invariant Suite**: Added `src/invariants.mjs` with 5 automated financial invariants (Monotonicity, Non-Negative Ledger, Single Coupon Application, Tax Base Compliance, Integer Sub-unit Safety).
2. **Switch Human-in-the-Loop Gate**: Autonomous agents are structurally blocked by policy from committing code changes until explicit in-thread review is logged.
3. **Continuous Audit Chain**: Every incident run generates a permanent evidence file containing exit codes, diffs, and timestamps.
