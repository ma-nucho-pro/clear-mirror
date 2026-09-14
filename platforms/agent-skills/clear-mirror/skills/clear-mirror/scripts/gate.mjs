import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Records-only advancement check. Refs are opaque: never fetched or executed.
// Hashes bind submitted records, not external bytes or reviewer authenticity.
export function validateGate(packet) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const object = (value, path, keys) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      fail(path, 'must be an object');
      return false;
    }
    for (const key of Object.keys(value)) {
      if (!keys.includes(key)) fail(`${path}.${key}`, 'unknown field');
    }
    for (const key of keys) {
      if (!Object.hasOwn(value, key)) fail(`${path}.${key}`, 'required');
    }
    return true;
  };
  const string = (value, path) => {
    if (typeof value !== 'string' || !value.trim() || value !== value.trim()) {
      fail(path, 'must be a nonempty string without surrounding whitespace');
      return false;
    }
    return true;
  };
  const identity = (value, path) => {
    if (string(value, path) && !/^(?:sha256:)?[a-f0-9]{7,64}$/.test(value)) {
      fail(path, 'must be 7–64 lowercase hex characters, optionally prefixed sha256:');
    }
  };
  const hash = (value, path) => {
    if (typeof value !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(value)) {
      fail(path, 'must be sha256: followed by 64 lowercase hex characters');
    }
  };
  const array = (value, path) => {
    if (!Array.isArray(value) || !value.length) {
      fail(path, 'must be a nonempty array');
      return [];
    }
    return value;
  };
  const unique = (values, path) => {
    const seen = new Set();
    values.forEach((value, i) => {
      if (string(value, `${path}[${i}]`)) {
        if (seen.has(value)) fail(path, `duplicate ${value}`);
        seen.add(value);
      }
    });
    return seen;
  };
  const ids = (value, path) => unique(array(value, path), path);
  const coverage = (actual, expected, path) => {
    for (const id of actual) if (!expected.has(id)) fail(path, `unknown ID ${id}`);
    for (const id of expected) if (!actual.has(id)) fail(path, `missing ID ${id}`);
  };
  const final = packet?.phase === 'final';
  if (!object(packet, 'packet', [
    'version', 'phase', 'revision', 'decision', 'integrator', 'authors',
    'requirements', 'evidence', 'reviews', ...(final ? ['artifactHash', 'answerHash'] : [])
  ])) return { valid: false, errors };
  if (packet.version !== '2.0') fail('version', 'must be 2.0');
  if (!['preflight', 'milestone', 'final'].includes(packet.phase)) fail('phase', 'invalid phase');
  identity(packet.revision, 'revision');
  if (packet.decision !== 'advance') fail('decision', 'only advance can pass; downgrade is never verified success');
  string(packet.integrator, 'integrator');
  const authors = ids(packet.authors, 'authors');
  if (!authors.has(packet.integrator)) fail('authors', 'must include integrator');
  if (final) {
    hash(packet.artifactHash, 'artifactHash');
    hash(packet.answerHash, 'answerHash');
  }
  const evidence = array(packet.evidence, 'evidence');
  const evidenceIds = unique(evidence.map(entry => entry?.id), 'evidence IDs');
  evidence.forEach((entry, i) => {
    const path = `evidence[${i}]`;
    if (!object(entry, path, ['id', 'revision', 'ref'])) return;
    string(entry.ref, `${path}.ref`);
    identity(entry.revision, `${path}.revision`);
    if (entry.revision !== packet.revision) fail(`${path}.revision`, 'stale revision');
  });
  const requirements = array(packet.requirements, 'requirements');
  const requirementIds = unique(requirements.map(entry => entry?.id), 'requirement IDs');
  const usedEvidence = new Set();
  requirements.forEach((entry, i) => {
    const path = `requirements[${i}]`;
    if (!object(entry, path, ['id', 'source', 'criterion', 'status', 'evidenceIds'])) return;
    string(entry.source, `${path}.source`);
    string(entry.criterion, `${path}.criterion`);
    if (entry.status !== 'pass') fail(`${path}.status`, 'must be pass for advancement');
    for (const id of ids(entry.evidenceIds, `${path}.evidenceIds`)) {
      if (!evidenceIds.has(id)) fail(`${path}.evidenceIds`, `unknown ID ${id}`);
      usedEvidence.add(id);
    }
  });
  coverage(usedEvidence, evidenceIds, 'requirement evidence coverage');
  const reviews = array(packet.reviews, 'reviews');
  if (reviews.length !== 2) fail('reviews', 'exactly two reviews required');
  const roles = unique(reviews.map(entry => entry?.role), 'review roles');
  coverage(roles, new Set(['correctness', 'coverage']), 'review roles');
  unique(reviews.map(entry => entry?.agentId), 'review agent IDs');
  reviews.forEach((entry, i) => {
    const path = `reviews[${i}]`;
    if (!object(entry, path, [
      'role', 'agentId', 'invocationRef', 'resultRef', 'reviewedRevision',
      'verdict', 'findings', 'requirementIds', 'evidenceIds',
      ...(final ? ['artifactHash', 'answerHash'] : [])
    ])) return;
    if (authors.has(entry.agentId)) fail(`${path}.agentId`, 'self-review: reviewer must not be an author');
    string(entry.invocationRef, `${path}.invocationRef`);
    string(entry.resultRef, `${path}.resultRef`);
    identity(entry.reviewedRevision, `${path}.reviewedRevision`);
    if (entry.reviewedRevision !== packet.revision) fail(`${path}.reviewedRevision`, 'stale revision');
    if (entry.verdict !== 'PASS') fail(`${path}.verdict`, 'must be PASS');
    if (!Array.isArray(entry.findings) || entry.findings.length !== 0) fail(`${path}.findings`, 'must be an empty array');
    coverage(ids(entry.requirementIds, `${path}.requirementIds`), requirementIds, `${path}.requirementIds`);
    coverage(ids(entry.evidenceIds, `${path}.evidenceIds`), evidenceIds, `${path}.evidenceIds`);
    if (final) {
      for (const key of ['artifactHash', 'answerHash']) {
        hash(entry[key], `${path}.${key}`);
        if (entry[key] !== packet[key]) fail(`${path}.${key}`, 'approval hash mismatch');
      }
    }
  });
  return { valid: errors.length === 0, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let result;
  try {
    if (process.argv.length !== 3) throw new Error('usage: node gate.mjs packet.json');
    result = validateGate(JSON.parse(readFileSync(process.argv[2], 'utf8')));
  } catch {
    result = { valid: false, errors: ['input: expected one readable JSON file; usage: node gate.mjs packet.json'] };
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.valid ? 0 : 1;
}
