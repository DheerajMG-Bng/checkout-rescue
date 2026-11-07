# Flip the Switch Hackathon — Official Submission Form Guide
**Team**: Hanuman  
**Members**: Dheeraj M G (`@dheerajmg` / [GitHub](https://github.com/DheerajMG-Bng)) & Charan Arangi (`@charantej` / [GitHub](https://github.com/ACT2039))  
**Primary Track**: Track 01: Best Business Workflow  
**Side Track**: Code with Wispr (with uploaded Wispr usage scorecard)

---

## Part 1 of 3: Project Details

### 1. Project title *(required)*
```text
Checkout Rescue — Enterprise Incident Auto-Remediation & Financial Invariants via Switch
```

### 2. Tracks you are submitting for *(required)*
* [x] **Track 01: Best Business Workflow**
* [x] **Code with Wispr** *(upload Wispr usage scorecard in Part 2)*

### 3. Project description *(required)*
*What problem does your project solve, and who is it for?*
```text
In e-commerce, checkout logic bugs cause catastrophic, silent financial leaks—such as promo codes compounding twice, undercharging customers by ₹90 per cart and draining ~₹9,00,000 per 10,000 orders. Solving these in chat is traditionally chaotic, unverified, and lacking formal compliance checks.

Checkout Rescue connects a triage agent, an investigation agent, and human engineers in a single Mattermost room powered by Switch. When an engineer reports a pricing defect, the triager validates order parameters and initiates a structured handoff. The investigator spins up an isolated sandbox, reproduces the failure with real CLI execution (exit code 1), proposes a one-line fix, and strictly halts for human authorization. 

Once lead engineer @dheerajmg approves in-thread, the investigator applies the patch, verifies all 6 regression checks, and proves compliance with 5 enterprise financial invariants (Monotonicity, Non-Negative Ledger, Single Promo Application, Net Tax Base, and Integer Sub-unit Safety). A permanent cryptographic audit chain records the before/after SHA-256 hashes, diffs, and review metadata, while an automated executive postmortem is compiled for stakeholders.
```

### 4. GitHub Repository or contribution *(required)*
```text
https://github.com/DheerajMG-Bng/checkout-rescue
```

### 5. Demo video *(required)*
*Keep it under 3 minutes. Host it on YouTube (public/unlisted) or Loom.*
```text
<Paste your YouTube unlisted or Loom video link here>
```

### 6. Live demo or deployment *(optional)*
```text
https://github.com/DheerajMG-Bng/checkout-rescue
```

---

## Part 2 of 3: Track Details (Optional)

### Blog post *(enters you in Best Blog / AirPods 5)*
```text
https://github.com/DheerajMG-Bng/checkout-rescue/blob/main/docs/BLOG.md
```

### Your Wispr usage card *(Code with Wispr / $500)*
*In Wispr Flow desktop app: Insights → Your usage → Share → upload image.*

### Your #HowISwitch post *(Logitech Mechanical Keyboard)*
```text
<Paste your X/Twitter or LinkedIn post link with #HowISwitch>
```

---

## Part 3 of 3: How You Used Switch

### How did you use Switch in your project? *(required)*
*- Which agent did you connect? Which platforms does it run on? What real work does it do, and how do your teammates work with it?*
```text
We deployed Switch Console on Windows with the native Codex CLI provider and Mattermost as our connected chat platform. Our Switch template orchestrates a multi-agent room containing checkout-triager, checkout-investigator, and human teammates Charan (@charantej) and Dheeraj (@dheerajmg). 

Switch serves as the real-time collaboration layer: it delivers incoming human bug reports via Server-Sent Events (SSE), routes named handoffs between autonomous agents, and brings human approval events directly into the thread. Agents run with isolated workspaces. Rather than simulating chat text, the investigator executes real Node.js child processes, captures exit codes, proposes minimal code diffs, halts for human sign-off, and validates 5 enterprise financial invariants. Switch closes the entire loop between human governance and autonomous agent remediation in one auditable room.
```

### What did you like about Switch, and what would you improve? *(required)*
*- What worked, what got in the way, and what you'd want Switch to do next.*
```text
What worked exceptionally well:
1. Unified Room Paradigm: Having human engineers and autonomous agents share the same Mattermost room eliminated context fragmentation and manual copy-pasting between chat and local terminals.
2. Declarative Template Orchestration: The YAML template system made configuring agent instructions, provider models, and room memberships clean and reproducible across our team.
3. Real CLI Interoperability: Switch's agent protocol allowed our agents to run actual command-line tools and inspect real exit codes, making genuine software engineering workflows possible.

What got in the way & What Switch should do next:
1. Native Interactive Approval Primitives: In our workflow, the agent halted for human review via natural language. Having native Switch UI buttons in chat (e.g., interactive [Approve Fix] [Reject] buttons with signed callback tokens) would make human-in-the-loop governance even more robust.
2. Windows PATH Discovery & Health Auto-Recovery: When installing CLI providers on Windows, Switch Console required an application restart to pick up new PATH variables. Clearer environment diagnostics in Console and an automatic one-click reconnect button when a local daemon disconnects would make onboarding effortless.
```
