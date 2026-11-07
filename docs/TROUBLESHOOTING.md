# Windows setup checks

## “Codex was installed, but this computer can't find it yet”

Open a new terminal and run `codex --version`. Fully quit and reopen Switch
Console, then select **Check again**. An app that was open during installation
may still be using its old PATH. Sign into the provider through Switch if asked.

## “Cannot reach the server”

Check the local server status in Switch Console and start it if stopped. Keep
Docker running for Mattermost. A healthy Mattermost container does not prove
that the separate native Switch core process is running. Use the Console's
local server logs to find the failed component. Preserve the existing server
and its data rather than resetting the stack to address a connection failure.

## Agent ignores another teammate

Use the template's `addressing: anyone` setting for both agents. The original
triage-pair example restricts its reproducer to the owner and other owner agents,
which can prevent a different human teammate from addressing it directly.

## Agent says the reproduction failed

`reproduce` returns code 1 when it finds the intentionally seeded regression.
That is expected. Read the actual output and look for the incorrect INR 810
total; do not treat the command's exit code alone as a broken setup.

## “An incident already exists”

The lab refuses to overwrite earlier evidence. Use `RESCUE_HOME` pointing to a
fresh folder to create an independent run. Both the CLI and viewer must use
the same value. Do not reset a run after the agent edits it before review;
keep that result and begin a new, clearly identified attempt.

## Viewer is empty

The viewer reads the lab inside the repository it runs from, unless RESCUE_HOME
is set. Agents each have their own working directory. Run the viewer against
the investigator's lab; the triager does not run its own reproduction.

## Approval command fails

First reproduce the failure. Record the actual human approval before changing
the implementation. Then edit only `lab/checkout.mjs`, not the expected values,
tests, state JSON, or the reference implementation.
