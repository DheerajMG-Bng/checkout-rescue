# How We Built Checkout Rescue: Human-in-the-Loop Incident Response with Switch & Mattermost

*By Dheeraj M G & Charan Arangi (Team Hanuman) — Flip the Switch Hackathon (Track 1: Best Business Workflow)*

---

## 1. The Real-World Problem: The "Copy-Paste" AI Disconnect

If you've worked in engineering teams, you know this scene: an urgent bug is reported in Slack or Mattermost. An engineer copies the error message, opens an AI coding assistant in their terminal or IDE, tweaks prompts, gets a suggested patch, copies it back into chat, and asks the lead: *"Hey, does this look right?"*

During this chaotic copy-paste routine, critical context gets lost:
- What exact inputs triggered the failure?
- Was the failure verified with real command output and exit codes, or just simulated?
- Where is the permanent, reproducible audit trail of who approved the fix before it touched the code?

We wanted to turn our AI coding agents from isolated solo assistants into active, accountable teammates sitting in our actual team chat.

Enter **Switch**.

With Switch, every team chat channel becomes a **Room**. In our room, human engineers (`@charantej` and `@dheerajmg`) and autonomous AI agents (`@checkout-triager` and `@checkout-investigator`) collaborate side-by-side with zero manual copying.

Here is the story of how we built **[Checkout Rescue](https://github.com/DheerajMG-Bng/checkout-rescue)**, how it resolved a real checkout discount regression (CR-001), and what we learned along the way.

---

## 2. What We Built: Checkout Rescue

Checkout Rescue is an automated incident-resolution workflow that lives inside Mattermost. It handles checkout calculations in integer paise, tests discounts and edge cases, and provides strict human-in-the-loop governance:

1. **Bug Report**: Charan reports a discrepancy in the chat: *"One item costs INR 1,000, quantity 1. SAVE10 is 10%, no tax or shipping. Actual total INR 810; expected INR 900. Investigate CR-001."*
2. **Triage & Classification**: `@checkout-triager` extracts the structured order data, validates that all reproduction parameters exist, classifies it as a coupon calculation bug, and initiates a named handoff to `@checkout-investigator`.
3. **Reproduction in a Disposable Lab**: `@checkout-investigator` initializes an isolated sandbox, runs real Node.js regression checks (`node scripts/rescue.mjs reproduce`), and produces actual command output showing 2/6 checks passed and an exit code of `1`.
4. **Human Review Gate**: Before touching a single line of code, the investigator posts the exact proposed one-line fix to the chat and explicitly waits for human sign-off.
5. **Approval**: Dheeraj reviews the code proposal in the thread and posts: *"@checkout-investigator I approve the proposed CR-001 fix: apply the coupon once in lab/checkout.mjs. Run the checks and show the result."*
6. **Verification & Audit Evidence**: The investigator applies the one-line fix, re-runs verification (`node scripts/rescue.mjs verify`), checks that all 6/6 tests pass, and records the before/after SHA-256 hashes, command outputs, and approval metadata into a permanent `evidence/CR-001.json` audit trail.

```
+-------------------------------------------------------------------------------+
|                             Mattermost Channel                                |
|                                                                               |
|  [Charan]  ---> Reports checkout total mismatch (₹810 vs ₹900)               |
|       |                                                                       |
|       v                                                                       |
|  [Triager] ---> Validates report & hands off to investigator                  |
|       |                                                                       |
|       v                                                                       |
| [Investigator] ---> Runs test in lab: FAIL (2/6 passed, exit 1)               |
|       |        ---> Proposes one-line fix & requests human approval           |
|       v                                                                       |
|  [Dheeraj] ---> Reviews diff & gives explicit sign-off in chat                |
|       |                                                                       |
|       v                                                                       |
| [Investigator] ---> Applies fix, verifies: PASS (6/6 passed, exit 0)          |
|                ---> Writes permanent evidence file with SHA-256 hashes        |
+-------------------------------------------------------------------------------+
```

---

## 3. The Architecture: Switch as the Orchestration Engine

Switch sits in the middle as the open-source communication backbone:

- **Protocol**: Server-Sent Events (SSE) inbound, HTTP outbound.
- **Provider**: Codex CLI running natively on Windows.
- **Chat Platform**: Mattermost running in Docker on port `54491`.
- **Switch Console**: Manages agent lifecycles, environment configuration, and local server bridge.

What makes Switch powerful is that neither the human team nor the agents need custom network tunneling or proprietary SDK wrappers. Switch registers agents with their own avatars, handles room subscriptions, and fans out incoming thread messages to the relevant agent.

Here is our Switch template (`checkout-rescue.template.yaml`):

```yaml
agents:
  - name: "checkout-triager"
    description: "Validates incoming bug reports and routes them to the investigator"
    addressing: anyone
    provider: "{provider}"
    instructions: |
      You are the triage engineer for the checkout service.
      When a report arrives, verify SKU, price, discount, tax, and observed total.
      If complete, hand off to @checkout-investigator with structured parameters.

  - name: "checkout-investigator"
    description: "Reproduces checkout regressions, proposes fixes, and verifies"
    addressing: anyone
    provider: "{provider}"
    instructions: |
      You are the investigation engineer.
      1. Run `node scripts/rescue.mjs reproduce`.
      2. If failing, output the exact failure and proposed fix.
      3. STOP and wait for explicit human approval from @dheerajmg.
      4. Once approved, apply the fix to lab/checkout.mjs, run `verify`, and post 6/6 passed.

room:
  name: "checkout-rescue"
  bridge: "{bridge}"
  agents: ["checkout-triager", "checkout-investigator"]
  users: ["charantej", "dheerajmg"]
```

---

## 4. First-Time Switch Setup: 4 Hard-Won Lessons on Windows

If you are setting up Switch on Windows for the first time, here are the exact gotchas we encountered and how to navigate them smoothly:

### 1. Codex CLI Discovery & PATH Refresh
When you install Codex via npm (`npm install -g @openai/codex`), Switch Console might display: *"Codex was installed, but this computer can't find it yet."*
- **Solution**: Fully exit Switch Console (check system tray too). Open a fresh PowerShell window and verify `codex --version`. Re-open Switch Console and click **Check again**.

### 2. Differentiating Switch Core vs Docker Mattermost
Mattermost runs in Docker, but Switch Core runs as a native local process.
- **Gotcha**: Just because the Mattermost Docker container is healthy (`127.0.0.1:54491`) does not mean the Switch core server is running.
- **Solution**: Always ensure Switch Console's local server indicator is green before kicking off agent sessions.

### 3. Addressing Mode Matters
In the default Switch triage template, addressing is often set to `owner-agents`. If you have multiple human teammates collaborating (e.g. Charan reporting and Dheeraj reviewing), set `addressing: anyone`. This allows any teammate in the channel to mention the agent and receive immediate responses.

### 4. Separate Agent Workspaces
Ensure each agent runs in its own workspace. The triager does not need write access to the investigation lab; keeping their working directories isolated ensures that the triager stays focused on context parsing while the investigator manages the code state.

---

## 5. The Real Incident: CR-001 Walkthrough

In our demo incident `CR-001`, a customer applied a `SAVE10` 10% coupon on a ₹1,000 item. Instead of paying ₹900 (paise: 90000), the cart was charging ₹810 (paise: 81000).

Why? In `src/checkout.mjs`:
```javascript
// BUG: The already discounted subtotal was multiplied by 90% a second time!
const discountedSubtotal = Math.round((subtotalPaise - discountPaise) * (10000 - discountBps) / 10000);
```

When `@checkout-investigator` ran the reproduction:
```text
FAIL 10% coupon applied once: expected=90000 actual=81000 paise
PASS No coupon leaves price unchanged: expected=100000 actual=100000 paise
FAIL Discount precedes tax: expected=106200 actual=95580 paise
FAIL Free shipping uses original subtotal: expected=90000 actual=81000 paise
FAIL Rounding occurs once: expected=273 actual=246 paise
PASS 100% discount is zero: expected=0 actual=0 paise
2/6 checks passed
```

The agent proposed the single-line fix:
```javascript
const discountedSubtotal = subtotalPaise - discountPaise;
```

Dheeraj sent his approval in Mattermost:
> *@checkout-investigator I approve the proposed CR-001 fix: apply the coupon once in lab/checkout.mjs. Run the checks and show the result.*

The agent applied the fix and re-ran checks:
```text
PASS 10% coupon applied once: expected=90000 actual=90000 paise
PASS No coupon leaves price unchanged: expected=100000 actual=100000 paise
PASS Discount precedes tax: expected=106200 actual=106200 paise
PASS Free shipping uses original subtotal: expected=90000 actual=90000 paise
PASS Rounding occurs once: expected=273 actual=273 paise
PASS 100% discount is zero: expected=0 actual=0 paise
6/6 checks passed!
```

All hashes, before/after diffs, timestamps, and review records were automatically captured into `evidence/CR-001.json`.

---

## 6. What We Loved About Switch & What's Next

**What Worked Brilliant**:
- **Zero context fragmentation**: The entire team—human engineers and AI agents—stayed in one Mattermost thread from incident alert to verified fix.
- **Real command execution**: Agents ran real CLI tools, not simulated text responses.
- **Lightweight integration**: Templates made multi-agent room provisioning declarative and repeatable.

**What We Would Love to See Next**:
- **Built-in Human Approval Primitives**: Currently, human approval relies on natural language parsing in agent instructions. A native Switch UI button or interactive chat card (e.g. `[Approve Fix] [Reject]`) would make governance airtight.
- **Native Health Check Auto-Recovery**: If a local provider or core process disconnects momentarily, an automatic reconnect banner with one-click restart in Switch Console would make developer onboarding even smoother.

---

## 7. Links & Resources

- **GitHub Repository**: [https://github.com/DheerajMG-Bng/checkout-rescue](https://github.com/DheerajMG-Bng/checkout-rescue)
- **Switch Project**: [https://github.com/switch-ai/switch](https://github.com/switch-ai/switch)
- **Built by**: Team Hanuman ([Dheeraj M G](https://github.com/DheerajMG-Bng) & [Charan Arangi](https://github.com/ACT2039))
- **Hackathon**: Flip the Switch Hackathon by WeMakeDevs & DevTools Academy.
