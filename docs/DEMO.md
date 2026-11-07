# 🎬 Demo Video Guide (Under 3 Minutes)

The submission form requires a short demo video (<3 mins) showing the agents collaborating with teammates in real chat, hosted on YouTube (unlisted or public) or Loom.

---

## ⚡ Option A: 2-Minute Guided Walkthrough (Recommended)

Since the full incident `CR-001` has already been executed, reproduced, reviewed by Dheeraj, and verified in your Mattermost room and local Command Center, you can record a flawless 2-minute walkthrough right now!

### Video Script & Screen Flow:

* **0:00 – 0:20 — Introduction & Problem Statement**  
  * *On Screen*: Show your face or start on the GitHub repository [`checkout-rescue`](https://github.com/DheerajMG-Bng/checkout-rescue).  
  * *Say*: *"Hi everyone! We are Team Hanuman—Dheeraj and Charan. For the Flip the Switch Hackathon, we built **Checkout Rescue** for the Best Business Workflow track. In e-commerce, promo-code compounding bugs can silently drain millions of rupees. Today we're showing how two autonomous agents and two human engineers resolve an active checkout defect inside Mattermost via Switch."*

* **0:20 – 0:50 — Bug Report & Triage Handoff**  
  * *On Screen*: Switch to Mattermost channel ([http://localhost:54491/switch/channels/checkout-rescue](http://localhost:54491/switch/channels/checkout-rescue)).  
  * *Highlight*: Charan (`@charantej`) reporting the ₹810 charge on a ₹1,000 order with `SAVE10`.  
  * *Say*: *"Charan reports that a 10% coupon is undercharging customers. `@checkout-triager` immediately steps in, parses the structured order schema, validates reproduction criteria, and hands off incident CR-001 to our investigation agent."*

* **0:50 – 1:20 — Autonomous Sandbox Reproduction & Human Review Gate**  
  * *On Screen*: Scroll to `@checkout-investigator`'s response.  
  * *Highlight*: Real CLI output: `FAIL 10% coupon applied once: expected=90000 actual=81000 paise` (2/6 checks passed).  
  * *Highlight*: The agent proposes the one-line fix in `lab/checkout.mjs` and explicitly halts for human authorization.  
  * *Say*: *"The investigator spins up an isolated sandbox and runs real Node.js CLI checks, catching the failure. Notice that it does NOT modify code yet—it halts and requests explicit human review."*

* **1:20 – 1:45 — Lead Engineer Sign-off & Verification**  
  * *On Screen*: Show Dheeraj (`@dheerajmg`) approving the fix in-thread, followed by `@checkout-investigator` applying the patch and confirming `6/6 checks passed`.  
  * *Say*: *"As lead engineer, Dheeraj reviews the diff in-thread and gives formal approval. The agent applies the patch, re-runs checks, and confirms 100% test pass rate with cryptographic code hashes."*

* **1:45 – 2:20 — Enterprise Command Dashboard & Invariants**  
  * *On Screen*: Switch browser tab to [http://127.0.0.1:4173](http://127.0.0.1:4173).  
  * *Highlight*: The KPI metrics (₹90 undercharge averted / cart, ₹9,00,000 / 10k orders saved), the code diff tab, and the **Financial Invariants Matrix** (5/5 Compliant).  
  * *Say*: *"Here is our live Incident Command Center, showing ₹90 per cart in revenue loss prevented. All 5 enterprise financial invariants are satisfied, and an executive postmortem is compiled automatically."*

* **2:20 – 2:40 — Conclusion & Switch Value**  
  * *Say*: *"Switch made this possible by turning AI coding assistants into accountable teammates directly inside our team chat. Thanks for watching!"*

---

## 🛠️ Recording Tools on Windows

- **Windows Snipping Tool (Built-in)**: Press `Win + Shift + R` → Select fullscreen → Click Start.
- **Xbox Game Bar (Built-in)**: Press `Win + Alt + R` to instantly record screen and audio.
- **Loom**: Instant link generation at [loom.com](https://www.loom.com).
