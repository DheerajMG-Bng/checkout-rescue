# Submission text

Complete the real chat demonstration before submitting. These descriptions
explain the implementation; do not claim a recorded result that did not happen.

## Project title

Checkout Rescue — human-reviewed bug fixes through Switch

## Track

Best Business Workflow. Add Code with Wispr only after actual voice usage and a
real usage-card upload. This project is not a Switch core-contribution entry.

## Project description

Checkout Rescue helps a small engineering team turn a vague checkout bug report
into a reproduced failure, a human-reviewed fix, and a verified result inside
Mattermost. Switch connects a triage agent, an investigation agent, and the human
teammates in one shared room. The triager requests missing reproduction details;
the investigator runs regression checks, proposes a minimal code change, waits
for human review, then verifies the fix. A local incident file retains actual
process output, exit codes, review metadata, timestamps, and before/after code
hashes. The reproducible demonstration uses an intentionally seeded double-coupon
regression with synthetic order data.

## Public repository

https://github.com/DheerajMG-Bng/checkout-rescue

## Demo video

REQUIRED BEFORE SUBMISSION: upload the real under-three-minute demonstration to
YouTube (public/unlisted) or Loom and paste its link into the form.

## How did you use Switch?

We use Switch Console on Windows with Codex as the agent provider and Mattermost
as the connected chat app. Our template creates a triager, an investigator, and a
shared incident room containing Charan and Dheeraj. Switch delivers incoming
human reports, named agent handoffs, human review messages, and verification
results. The agents share the room's conversation while using independent
working directories. The investigation agent executes the checkout lab, retains
the actual failing output, waits for Dheeraj's review, edits disposable code, and
runs the checks again. The local scripts support reproducibility; Switch carries
the collaboration between people and agents.

## Switch feedback — review and personalize

The template structure provides a useful starting point for creating agents and
a shared room. Mattermost lets us run the demonstration locally with both
teammates. On Windows, provider discovery needed the application environment to
refresh after installation, and a stopped local server made the Console show
“Cannot reach the server.” Clearer provider-path diagnostics and a direct
local-server recovery action would improve onboarding. Add your own observations
from the completed workflow before submitting this feedback.

## Team

- Dheeraj M G: https://github.com/DheerajMG-Bng — Mattermost `dheerajmg`.
- Charan Arangi: https://github.com/ACT2039 — Mattermost `charantej`.
- Team name: Hanuman.

## Final checklist

- [ ] Both humans participated in the actual Mattermost workflow.
- [ ] Actual agent handoff, failed check, proposed fix, human review, and passing
      verification appear in the video.
- [ ] Public repository opens when signed out.
- [ ] README setup was tested from a clean clone.
- [ ] Video is under three minutes and opens for someone else.
- [ ] Seven required form fields are completed.
- [ ] Wispr card exported from Insights → Your usage → Share, if entering Wispr.
- [ ] No voice-usage claim is made without real usage.
- [ ] Submit before November 7, 2026, 11:59 PM IST, per the event page.

Blog, social post, and live deployment are optional. A Google Drive folder can
hold supporting files; use the video hosts specifically requested by the form.
