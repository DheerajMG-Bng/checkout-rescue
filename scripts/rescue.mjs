import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(process.env.RESCUE_HOME || projectRoot);
const lab = join(root, 'lab');
const statePath = join(lab, 'incident.json');
const sourcePath = join(lab, 'checkout.mjs');
const hash = (text) => createHash('sha256').update(text).digest('hex');
const readState = async () => JSON.parse(await readFile(statePath, 'utf8'));
const save = async (state) => writeFile(statePath, JSON.stringify(state, null, 2) + '\n');
const now = () => new Date().toISOString();
const command = process.argv[2] || 'help';
const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? undefined : process.argv[i + 1];
};

try {
  if (command === 'start') {
    try { await access(statePath); throw new Error('An incident already exists. Preserve it or use a new RESCUE_HOME folder.'); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    await mkdir(lab, { recursive: true });
    const original = await readFile(join(projectRoot, 'src', 'checkout.mjs'), 'utf8');
    const line = 'const discountedSubtotal = subtotalPaise - discountPaise;';
    if (original.split(line).length !== 2) throw new Error('Demo seed no longer matches checkout source');
    const seeded = original.replace(line, 'const discountedSubtotal = Math.round((subtotalPaise - discountPaise) * (10000 - discountBps) / 10000);');
    await writeFile(sourcePath, seeded);
    const fixture = JSON.parse(await readFile(join(projectRoot, 'fixtures', 'coupon-twice.json'), 'utf8'));
    const state = { id: 'CR-001', runId: randomUUID(), title: fixture.title, demo: true, status: 'reported', createdAt: now(), fixture, seedSha256: hash(seeded), events: [{ type: 'reported', at: now() }] };
    await save(state);
    console.log(`CR-001 created in ${lab}\nThis is an intentionally seeded demonstration.\n${fixture.report}\nNext: npm run incident -- reproduce`);
  } else if (command === 'reproduce' || command === 'verify') {
    const state = await readState();
    if (command === 'reproduce' && state.status !== 'reported') throw new Error('Reproduction can only be recorded once, before review');
    if (command === 'verify' && state.status !== 'approved') throw new Error('Record human review before verifying a fix');
    const code = await readFile(sourcePath, 'utf8');
    if (command === 'reproduce' && hash(code) !== state.seedSha256) throw new Error('The seeded code changed before reproduction; use a new lab');
    const run = spawnSync(process.execPath, [join(projectRoot, 'scripts', 'lab-check.mjs'), sourcePath], { encoding: 'utf8', timeout: 20000 });
    if (run.error || run.signal || run.status === null) throw new Error(`Checks could not complete: ${run.error?.message || run.signal}`);
    const result = { at: now(), codeSha256: hash(code), exitCode: run.status, stdout: run.stdout, stderr: run.stderr };
    if (command === 'reproduce') {
      if (run.status === 0) throw new Error('No failure reproduced; incident remains open');
      state.before = result;
      state.status = 'awaiting-review';
      state.events.push({ type: 'reproduced', at: result.at, codeSha256: result.codeSha256 });
    } else {
      if (hash(code) === state.before.codeSha256) throw new Error('No code change was detected');
      state.after = result;
      state.status = run.status === 0 ? 'resolved' : 'approved';
      state.events.push({ type: run.status === 0 ? 'verified' : 'verification-failed', at: result.at, codeSha256: result.codeSha256 });
    }
    await save(state);
    await mkdir(join(root, 'evidence'), { recursive: true });
    await writeFile(join(root, 'evidence', 'latest.json'), JSON.stringify(state, null, 2) + '\n');
    console.log(run.stdout);
    if (run.stderr) console.error(run.stderr);
    console.log(`Incident: ${state.status}\nEvidence: ${join(root, 'evidence', 'latest.json')}`);
    process.exitCode = run.status;
  } else if (command === 'approve') {
    const state = await readState();
    if (state.status !== 'awaiting-review') throw new Error('A reproduced incident must be awaiting review');
    const by = flag('by');
    const message = flag('message');
    if (!by || !/^@[a-z0-9._-]+$/i.test(by) || !message?.trim()) throw new Error('Use approve --by @username --message "actual approval message or link"');
    if (hash(await readFile(sourcePath, 'utf8')) !== state.before.codeSha256) throw new Error('Code changed before approval; review the change and start a new lab');
    state.approval = { by, message: message.trim(), at: now(), mode: 'operator-recorded-chat-review' };
    state.status = 'approved';
    state.events.push({ type: 'approved', ...state.approval });
    await save(state);
    console.log(`Review recorded for ${by}. The investigation agent may now edit lab/checkout.mjs and run verify.`);
  } else if (command === 'status') {
    const state = await readState();
    console.log(JSON.stringify(state, null, 2));
  } else if (command === 'help') {
    console.log('Checkout Rescue\n  start       Create a seeded demo incident\n  reproduce   Run regression checks and retain real output (exit 1 is expected)\n  approve --by @user --message "approval message/link"\n  verify      Verify the agent-edited checkout after review\n  status      Print the recorded incident\nSet RESCUE_HOME for an independent lab. Approval is operator-recorded, not identity authentication.');
  } else throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(`Checkout Rescue: ${error.code === 'ENOENT' ? 'No incident found. Run npm run incident -- start first.' : error.message}`);
  process.exitCode = 2;
}
