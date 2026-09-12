import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");

const requiredReferences = [
  "critical-method.md",
  "response-contract.md",
  "safety-boundaries.md",
  "roles.md"
];

const adapters = [
  {
    id: "agent-skills",
    skill: "platforms/agent-skills/clear-mirror/skills/clear-mirror/SKILL.md",
    manifest: null
  },
  {
    id: "claude-code",
    skill: "platforms/claude-code/clear-mirror/skills/clear-mirror/SKILL.md",
    manifest: "platforms/claude-code/clear-mirror/.claude-plugin/plugin.json"
  },
  {
    id: "cursor",
    skill: "platforms/cursor/clear-mirror/skills/clear-mirror/SKILL.md",
    manifest: "platforms/cursor/clear-mirror/.cursor-plugin/plugin.json"
  },
  {
    id: "gemini-cli",
    skill: "platforms/gemini-cli/clear-mirror/skills/clear-mirror/SKILL.md",
    manifest: "platforms/gemini-cli/clear-mirror/gemini-extension.json"
  },
  {
    id: "codex",
    skill: "platforms/codex/clear-mirror/skills/clear-mirror/SKILL.md",
    manifest: "platforms/codex/clear-mirror/.codex-plugin/plugin.json"
  }
];

function absolute(relativePath) {
  return path.join(repoRoot, relativePath.split("/").join(path.sep));
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function parseFrontmatter(text) {
  const errors = [];
  if (!text.startsWith("---\n")) {
    return { values: {}, errors: ["SKILL.md must start with YAML frontmatter"] };
  }
  const end = text.indexOf("\n---", 4);
  if (end < 0) {
    return { values: {}, errors: ["SKILL.md frontmatter is not closed"] };
  }
  const values = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) values[match[1]] = match[2].replace(/^['\"]|['\"]$/g, "");
  }
  if (!values.name) errors.push("frontmatter name is missing");
  if (!values.description) errors.push("frontmatter description is missing");
  return { values, errors };
}

function readJson(relativePath, errors, root = repoRoot) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath.split("/").join(path.sep)), "utf8"));
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function checkManifest(manifestPath, errors) {
  const data = readJson(manifestPath, errors);
  if (!data) return;
  for (const key of ["name", "version", "description"]) {
    if (typeof data[key] !== "string" || data[key].trim() === "") {
      errors.push(`${manifestPath} is missing ${key}`);
    }
  }
  if (data.name !== "clear-mirror") {
    errors.push(`${manifestPath} must identify clear-mirror`);
  }
}

export function validatePackage(root = repoRoot) {
  const errors = [];
  const warnings = [];
  const canonicalRelative = "skills/clear-mirror/SKILL.md";
  const canonicalPath = root === repoRoot
    ? absolute(canonicalRelative)
    : path.join(root, canonicalRelative.split("/").join(path.sep));

  if (!fs.existsSync(canonicalPath)) {
    errors.push(`${canonicalRelative} is missing`);
  }

  let canonicalText = "";
  if (fs.existsSync(canonicalPath)) {
    canonicalText = fs.readFileSync(canonicalPath, "utf8");
    const frontmatter = parseFrontmatter(canonicalText);
    errors.push(...frontmatter.errors.map((item) => `${canonicalRelative}: ${item}`));
    if (frontmatter.values.name !== "clear-mirror") errors.push(`${canonicalRelative}: name must be clear-mirror`);
    if (frontmatter.values.description?.includes("TODO")) errors.push(`${canonicalRelative}: description is unfinished`);
    if (/\[TODO|<TODO/i.test(canonicalText)) errors.push(`${canonicalRelative}: unfinished TODO placeholder`);
  }

  for (const reference of requiredReferences) {
    const relative = `skills/clear-mirror/references/${reference}`;
    if (!fs.existsSync(path.join(root, relative.split("/").join(path.sep)))) errors.push(`${relative} is missing`);
  }

  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(packagePath)) {
    errors.push("package.json is missing");
  } else {
    const packageData = readJson("package.json", errors, root);
    if (packageData) {
      if (packageData.name !== "clear-mirror") errors.push("package.json name must be clear-mirror");
      if (!packageData.engines?.node || !/^>=18\.17(?:\.\d+)?$/.test(packageData.engines.node)) {
        errors.push("package.json must require Node.js >=18.17");
      }
      for (const key of ["dependencies", "devDependencies", "optionalDependencies"]) {
        if (packageData[key] && Object.keys(packageData[key]).length > 0) errors.push(`runtime dependency list ${key} must be empty`);
      }
    }
  }

  for (const asset of [
    "assets/clear-mirror-logo.svg",
    "assets/clear-mirror-social.svg",
    "assets/clear-mirror-social.png"
  ]) {
    if (!fs.existsSync(path.join(root, asset.split("/").join(path.sep)))) errors.push(`${asset} is missing`);
  }

  const copies = [];
  for (const adapter of adapters) {
    const skillPath = path.join(root, adapter.skill.split("/").join(path.sep));
    if (!fs.existsSync(skillPath)) {
      errors.push(`${adapter.id} skill copy is missing: ${adapter.skill}`);
    } else {
      copies.push({ id: adapter.id, path: skillPath, text: fs.readFileSync(skillPath, "utf8") });
    }
    if (adapter.manifest) {
      const manifestPath = path.join(root, adapter.manifest.split("/").join(path.sep));
      if (!fs.existsSync(manifestPath)) errors.push(`${adapter.id} manifest is missing: ${adapter.manifest}`);
      else checkManifestFromRoot(root, adapter.manifest, errors);
    }
  }

  for (const copy of copies) {
    if (canonicalText && copy.text !== canonicalText) errors.push(`${copy.id} SKILL.md is not byte-identical to the canonical skill`);
    if (/\[TODO|<TODO/i.test(copy.text)) errors.push(`${copy.id} SKILL.md contains an unfinished TODO placeholder`);
  }

  const scanFiles = [];
  function collect(directory) {
    const dir = path.join(root, directory.split("/").join(path.sep));
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const item = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== ".git" && entry.name !== "node_modules") collect(path.relative(root, item));
      else if (entry.isFile() && /\.(md|mjs|json|yaml|yml|txt)$/.test(entry.name)) scanFiles.push(item);
    }
  }
  collect(".");
  const secretPattern = /\b(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[A-Za-z0-9_-]{20,})\b/;
  for (const file of scanFiles) {
    const text = fs.readFileSync(file, "utf8");
    if (secretPattern.test(text)) errors.push(`possible credential pattern in ${path.relative(root, file)}`);
  }

  if (!fs.existsSync(path.join(root, "README.md"))) warnings.push("README.md is missing");
  return { valid: errors.length === 0, errors, warnings };
}

function checkManifestFromRoot(root, manifestPath, errors) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(path.join(root, manifestPath.split("/").join(path.sep)), "utf8"));
  } catch (error) {
    errors.push(`${manifestPath} is not valid JSON: ${error.message}`);
    return;
  }
  for (const key of ["name", "version", "description"]) {
    if (typeof data[key] !== "string" || data[key].trim() === "") errors.push(`${manifestPath} is missing ${key}`);
  }
  if (data.name !== "clear-mirror") errors.push(`${manifestPath} must identify clear-mirror`);
}

function main() {
  const result = validatePackage();
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(result.valid ? "VALID clear-mirror package" : "INVALID clear-mirror package");
    for (const error of result.errors) console.log(`ERROR: ${error}`);
    for (const warning of result.warnings) console.log(`WARN: ${warning}`);
  }
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) main();
