import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireString(packet, key, errors) {
  if (!isNonEmptyString(packet[key])) {
    errors.push(`${key} must be a non-empty string`);
  }
}

function requireStringArray(packet, key, errors) {
  if (!Array.isArray(packet[key])) {
    errors.push(`${key} must be an array`);
    return;
  }
  packet[key].forEach((value, index) => {
    if (!isNonEmptyString(value)) {
      errors.push(`${key}[${index}] must be a non-empty string`);
    }
  });
}

function validateBlindSpots(value, errors) {
  if (!Array.isArray(value)) {
    errors.push("blind_spots must be an array");
    return;
  }
  value.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`blind_spots[${index}] must be an object`);
      return;
    }
    for (const key of ["claim", "challenge", "consequence", "test"]) {
      if (!isNonEmptyString(item[key])) {
        errors.push(`blind_spots[${index}].${key} must be a non-empty string`);
      }
    }
  });
}

function validatePriorities(value, errors) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 5) {
    errors.push("priorities must contain between 1 and 5 items");
    return;
  }
  value.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`priorities[${index}] must be an object`);
      return;
    }
    if (item.rank !== index + 1) {
      errors.push(`priorities[${index}].rank must be ${index + 1}`);
    }
    for (const key of ["change", "why", "next_action", "proof"]) {
      if (!isNonEmptyString(item[key])) {
        errors.push(`priorities[${index}].${key} must be a non-empty string`);
      }
    }
  });
}

export function validateReflectionPacket(packet) {
  const errors = [];
  if (!packet || typeof packet !== "object" || Array.isArray(packet)) {
    return { valid: false, errors: ["packet must be a JSON object"] };
  }
  if (packet.version !== "1.0") errors.push("version must be \"1.0\"");
  if (packet.mode !== "reflection") errors.push("mode must be \"reflection\"");
  for (const key of ["target", "direct_read", "opportunity_cost"]) {
    requireString(packet, key, errors);
  }
  for (const key of ["observed_facts", "assumptions", "uncertainty"]) {
    requireStringArray(packet, key, errors);
  }
  validateBlindSpots(packet.blind_spots, errors);
  validatePriorities(packet.priorities, errors);
  if (!(packet.next_question === null || isNonEmptyString(packet.next_question))) {
    errors.push("next_question must be null or a non-empty string");
  }
  return { valid: errors.length === 0, errors };
}

export function validateReflectionFile(filePath) {
  const absolute = path.resolve(filePath);
  let packet;
  try {
    packet = JSON.parse(fs.readFileSync(absolute, "utf8"));
  } catch (error) {
    return { valid: false, errors: [`cannot parse ${absolute}: ${error.message}`] };
  }
  return validateReflectionPacket(packet);
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node scripts/validate-reflection.mjs <packet.json>");
    process.exitCode = 2;
    return;
  }
  const result = validateReflectionFile(filePath);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main();
}
