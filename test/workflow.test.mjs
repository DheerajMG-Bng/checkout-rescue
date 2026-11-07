import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, copyFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
const cli = resolve('scripts/rescue.mjs');
const cleanup = async (home) => {
  if (dirname(resolve(home)) !== resolve(tmpdir()) || !basename(home).startsWith('checkout-rescue-')) throw new Error('Unexpected test cleanup path');
  await rm(home, { recursive: true, force: true });
};
const run = (home, ...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...process.env, RESCUE_HOME: home } });

test('a real failure, human review, changed code and passing checks are required for resolution', async () => {
  const home = await mkdtemp(join(tmpdir(), 'checkout-rescue-'));
  try {
    assert.equal(run(home, 'start').status, 0);
    assert.equal(run(home, 'verify').status, 2);
    assert.equal(run(home, 'approve', '--by', '@reviewer', '--message', 'approved').status, 2);
    assert.equal(run(home, 'reproduce').status, 1);
    let state = JSON.parse(await readFile(join(home, 'lab/incident.json')));
    assert.match(state.before.stdout, /expected=90000 actual=81000/);
    assert.equal(state.status, 'awaiting-review');
    assert.equal(run(home, 'approve').status, 2);
    assert.equal(run(home, 'approve', '--by', '@reviewer', '--message', 'I approve the proposed fix').status, 0);
    assert.equal(run(home, 'verify').status, 2);
    await copyFile(resolve('src/checkout.mjs'), join(home, 'lab/checkout.mjs'));
    assert.equal(run(home, 'verify').status, 0);
    state = JSON.parse(await readFile(join(home, 'evidence/latest.json')));
    assert.equal(state.status, 'resolved');
    assert.match(state.after.stdout, /6\/6 checks passed/);
    assert.notEqual(state.before.codeSha256, state.after.codeSha256);
    assert.deepEqual(state.events.map(x => x.type), ['reported', 'reproduced', 'approved', 'verified']);
    assert.equal(run(home, 'start').status, 2, 'Existing evidence is not overwritten');
  } finally { await cleanup(home); }
});
test('a code change before approval is detected and refused', async () => {
  const home = await mkdtemp(join(tmpdir(), 'checkout-rescue-'));
  try {
    run(home, 'start'); run(home, 'reproduce');
    const file = join(home, 'lab/checkout.mjs');
    await writeFile(file, (await readFile(file, 'utf8')) + '\n// changed\n');
    assert.equal(run(home, 'approve', '--by', '@reviewer', '--message', 'approved').status, 2);
  } finally { await cleanup(home); }
});
