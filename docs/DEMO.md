# Record a real demonstration (under 3 minutes)

## Before recording

1. Keep Docker, Switch Console, and the local server running.
2. Check both agents are online and both people can open `checkout-rescue` in
   Mattermost. Dheeraj is `@dheerajmg`; Charan is `@charantej`.
3. Each person uses their own signed-in browser profile on this laptop.
4. Use a new investigation lab for the recording. Do not clear an old run just
   to conceal a failed result. Set `RESCUE_HOME` to a new folder for another run.
5. Use Wispr to dictate the messages if entering Code with Wispr. Actual use is
   required; export its real usage card afterwards.

## Messages and timing

**0:00–0:15 — Introduction**

“We built Checkout Rescue. Two coding agents and two teammates investigate a
checkout regression in one Mattermost thread, connected through Switch. This is
a deliberately seeded demonstration.”

**0:15–0:40 — Charan reports the bug**

Send as Charan, not as the organizer or a bot:

> @checkout-triager Our checkout total looks wrong after SAVE10. Can you investigate?

The triager should ask for the missing inputs. Reply in that thread:

> One item is INR 1,000, quantity 1, with a 10% coupon, no tax and no shipping.
> Actual total is INR 810. Expected total is INR 900. Please investigate CR-001.

**0:40–1:30 — Agent handoff and reproduction**

Show the triager handing off to `@checkout-investigator` and the investigation
agent running the lab. Its output should include:

```text
FAIL 10% coupon applied once: expected=90000 actual=81000 paise
```

Wait for the actual proposed change and the request for human review.
Do not paste a prepared response pretending it came from an agent.

**1:30–1:50 — Dheeraj reviews**

Only after reading the proposed fix, send as Dheeraj in the same thread:

> @checkout-investigator I approve the proposed CR-001 fix: apply the coupon
> once in lab/checkout.mjs. Run the checks and show the result.

**1:50–2:35 — Verify the fix**

Show the actual code edit and the agent's result: `6/6 checks passed` plus the
project test result. Briefly open the read-only viewer or evidence JSON if time
permits. The before and after code hashes must differ.

**2:35–2:50 — Explain Switch and the result**

“Switch delivered the report, agent handoff, human review, and final result in
one room. Our CLI retained real command output; it did not simulate the chat.”

## If agents take longer

Record the complete real run, then trim waiting periods with clear cuts. Keep
the actual report, proposed fix, human review, and verified result visible. Do
not present edited timing as an uncut latency claim. Keep the final video under
three minutes. Upload to YouTube (unlisted or public) or Loom, as the form asks.
