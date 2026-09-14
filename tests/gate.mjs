import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGate } from '../skills/clear-mirror/scripts/gate.mjs';

// Exported canonical v2 examples for documentation. All fields are required;
// unknown fields are rejected. Final adds both hashes to packet AND each review.
// IDs/refs/source/criterion are opaque, nonempty, trimmed strings. Revision is
// 7–64 lowercase hex digits (optional sha256: prefix); final hashes are SHA-256.
// Each review covers ALL requirement and evidence IDs; each requirement cites
// >=1 evidence ID and every evidence record is used. Arrays of IDs are unique.
// decision=advance alone can pass; downgrade always fails closed. A valid result
// is record consistency only, never execution, identity, or content attestation.
export const preflightFixture = {
  version: '2.0', phase: 'preflight', revision: 'abcdef0123456789',
  decision: 'advance', integrator: 'author-1', authors: ['author-1'],
  requirements: [
    { id: 'r1', source: 'user:request', criterion: 'Contract is specified', status: 'pass', evidenceIds: ['e1'] },
    { id: 'r2', source: 'repo:instructions', criterion: 'Scope is bounded', status: 'pass', evidenceIds: ['e2'] }
  ],
  evidence: [
    { id: 'e1', revision: 'abcdef0123456789', ref: 'record:contract' },
    { id: 'e2', revision: 'abcdef0123456789', ref: 'record:scope' }
  ],
  reviews: ['correctness', 'coverage'].map((role, i) => ({
    role, agentId: `reviewer-${i + 1}`, invocationRef: `invocation:${i + 1}`,
    resultRef: `result:${i + 1}`, reviewedRevision: 'abcdef0123456789',
    verdict: 'PASS', findings: [], requirementIds: ['r1', 'r2'], evidenceIds: ['e1', 'e2']
  }))
};
export const finalFixture = structuredClone(preflightFixture);
finalFixture.phase = 'final';
finalFixture.artifactHash = `sha256:${'a'.repeat(64)}`;
finalFixture.answerHash = `sha256:${'b'.repeat(64)}`;
for (const review of finalFixture.reviews) {
  review.artifactHash = finalFixture.artifactHash;
  review.answerHash = finalFixture.answerHash;
}

export function runTests() {
  let count = 0;
  const good = packet => {
    assert.deepEqual(validateGate(packet), { valid: true, errors: [] });
    count++;
  };
  const bad = (name, mutate, pattern, base = preflightFixture) => {
    const packet = structuredClone(base);
    mutate(packet);
    const result = validateGate(packet);
    assert.equal(result.valid, false, name);
    assert.ok(result.errors.some(error => pattern.test(error)), `${name}: ${result.errors.join('; ')}`);
    assert.deepEqual(validateGate(packet), result, `${name}: deterministic errors`);
    count++;
  };
  good(preflightFixture);
  good({ ...preflightFixture, phase: 'milestone' });
  good(finalFixture);
  bad('missing reviews', p => delete p.reviews, /reviews/);
  bad('missing field', p => delete p.requirements[0].source, /source/);
  bad('stale review', p => p.reviews[1].reviewedRevision = '1234567', /stale/);
  bad('stale evidence', p => p.evidence[1].revision = '1234567', /stale/);
  bad('missing evidence ref', p => p.evidence[0].ref = ' ', /ref/);
  bad('unknown evidence', p => p.requirements[0].evidenceIds = ['missing'], /unknown ID/);
  bad('uncovered evidence', p => p.reviews[0].evidenceIds.pop(), /missing ID e2/);
  bad('unused evidence', p => p.requirements[1].evidenceIds = ['e1'], /missing ID e2/);
  bad('self review', p => p.reviews[0].agentId = p.integrator, /self-review/);
  bad('other author', p => p.authors.push(p.reviews[1].agentId), /self-review/);
  bad('duplicate reviewer', p => p.reviews[1].agentId = p.reviews[0].agentId, /duplicate/);
  bad('duplicate role', p => p.reviews[1].role = 'correctness', /duplicate/);
  bad('unknown role', p => p.reviews[1].role = 'security', /unknown ID/);
  bad('missing integrator author', p => p.authors = ['other'], /include integrator/);
  bad('empty requirements', p => p.requirements = [], /nonempty array/);
  bad('unreviewed requirement', p => p.reviews[1].requirementIds.pop(), /missing ID r2/);
  bad('unknown requirement', p => p.reviews[0].requirementIds.push('r3'), /unknown ID r3/);
  bad('duplicate requirement', p => p.requirements.push(p.requirements[0]), /duplicate/);
  bad('duplicate evidence', p => p.evidence.push(p.evidence[0]), /duplicate/);
  bad('duplicate coverage', p => p.reviews[0].evidenceIds.push('e1'), /duplicate/);
  bad('failed requirement', p => p.requirements[0].status = 'pending', /status/);
  bad('failed review', p => p.reviews[0].verdict = 'FAIL', /verdict/);
  bad('findings block', p => p.reviews[0].findings = ['bug'], /findings/);
  bad('malformed findings', p => p.reviews[0].findings = {}, /findings/);
  bad('missing invocation', p => delete p.reviews[0].invocationRef, /invocationRef/);
  bad('empty result', p => p.reviews[0].resultRef = '', /resultRef/);
  bad('downgrade', p => p.decision = 'downgrade', /never verified success/);
  bad('unknown decision', p => p.decision = 'verified', /decision/);
  bad('wrong version', p => p.version = 2, /version/);
  bad('wrong phase', p => p.phase = 'draft', /phase/);
  bad('bad revision', p => p.revision = 'latest', /revision/);
  bad('extra field', p => p.verified = true, /unknown field/);
  bad('null entry', p => p.reviews[0] = null, /object/);
  bad('non-array authors', p => p.authors = 'author-1', /array/);
  bad('third review', p => p.reviews.push(p.reviews[0]), /exactly two/);
  bad('changed answer', p => p.answerHash = `sha256:${'c'.repeat(64)}`, /answerHash.*mismatch/, finalFixture);
  bad('changed artifact', p => p.artifactHash = `sha256:${'d'.repeat(64)}`, /artifactHash.*mismatch/, finalFixture);
  bad('missing final approval', p => delete p.reviews[1].answerHash, /answerHash/, finalFixture);
  bad('malformed hash', p => p.artifactHash = 'abcdef0', /artifactHash/, finalFixture);
  for (const value of [null, undefined, true, 1, 'packet', [], {}]) {
    assert.equal(validateGate(value).valid, false);
    count++;
  }
  const before = JSON.stringify(finalFixture);
  validateGate(finalFixture);
  assert.equal(JSON.stringify(finalFixture), before, 'validator must not mutate input');
  count++;
  return count;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`PASS ${runTests()} gate checks (records only)`);
}
