# Clear Mirror repository instructions

The canonical distributable skill lives in `skills/clear-mirror/`.

When changing behavior:

1. Keep `SKILL.md` concise and put detailed guidance in `references/`.
2. Keep every platform adapter's copied `SKILL.md` byte-identical to the canonical file.
3. Keep runtime scripts dependency-free and compatible with Node.js 18.17+.
4. Run `npm test` and `node scripts/validate-package.mjs` before claiming success.
5. Never add credentials, private data, or hardcode provider tokens.
6. Do not claim independent agents, judges, research, or tests ran without observable evidence.
