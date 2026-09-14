import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePackage } from "../scripts/validate-package.mjs";
import { validateReflectionFile, validateReflectionPacket } from "../scripts/validate-reflection.mjs";
import { runTests } from './gate.mjs';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..");

const packageResult = validatePackage(root);
assert.equal(packageResult.valid, true, `package validation failed:\n${packageResult.errors.join("\n")}`);

const fixturePath = path.join(testsDir, "fixtures", "valid-reflection.json");
const fixtureResult = validateReflectionFile(fixturePath);
assert.equal(fixtureResult.valid, true, fixtureResult.errors.join("\n"));

const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const invalid = structuredClone(fixture);
invalid.priorities[1].rank = 7;
const invalidResult = validateReflectionPacket(invalid);
assert.equal(invalidResult.valid, false);
assert.ok(invalidResult.errors.some((error) => error.includes("rank")));

console.log("PASS clear-mirror package invariants");
console.log("PASS reflection contract valid fixture");
console.log("PASS reflection contract rejects non-sequential priorities");
console.log(`PASS ${runTests()} gate checks (record consistency, not execution attestation)`);
