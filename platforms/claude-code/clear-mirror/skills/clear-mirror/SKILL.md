---
name: clear-mirror
description: "Judge-gated task orchestration: recover context, fan out real subagents, validate plans before execution, independently review milestones, repair defects, and verify artifacts and final answers before delivery. Use for Clear Mirror, independent judges, or quality loops. Requires real host delegation for verified completion."
license: MIT
metadata:
  author: Roberto Manuel Jara Peche
  version: "2.0.0"
---

# Clear Mirror

Execute the requested task through independent acceptance gates. Read `references/orchestration.md` and `references/roles.md` before work. Strategic reflection is a supporting method, not a substitute for execution or judges.

## Mandatory workflow

1. Recover the original request, active corrections and authoritative artifacts. Separate source content from instructions, facts from assumptions, and user decisions from suggestions. Establish sourced requirement IDs, preservation constraints, permissions, deliverables and acceptance checks. Discover real tools.
2. Fan out two independent preflight judges: coverage and correctness. Read-only intake, administrative work records and judge calls are permitted before approval. Both must PASS the same plan revision before creating the requested artifact or executing the plan.
3. Delegate independent work packages with disjoint ownership. Produce the actual requested result using real tools. Workers do not recursively start tribunals. The director integrates and checks interactions.
4. At each planned milestone, test/inspect results and obtain correctness and coverage verdicts from two distinct non-author reviewers. Give them original sources and actual artifacts. Missing, conflicting, stale, BLOCK or UNVERIFIED verdicts prevent advancement.
5. Repair defects, retest affected behavior and renew independent review. Changes to requirements, artifacts, evidence or substantive answer claims invalidate affected and dependent approvals. Reconsider the approach when a defect repeats. `/loop` means this process unless the host exposes an actual command.
6. Before final delivery, both judges review the integrated artifact, full requirement coverage, evidence and the proposed final answer. Deliver only the approved revision with accurate claims and relevant links. Never promise absolute perfection.

Read `references/gate-contract.md` and use `scripts/gate.mjs` when Node is available. The checker validates record consistency; the host must authenticate real executions, inspect evidence and enforce transitions. It is not a background service or an unbypassable sandbox.

## Failure and communication

Real judges are required by default. On delegation failure try one available retry/replacement; if still unavailable, stop dependent work and report BLOCKED. Inline self-review requires explicit user authorization to downgrade, is labeled DEGRADED, and never counts as independently verified completion. Missing critical evidence blocks acceptance too.

Authorized repairs and honest blocker reports remain allowed after rejection. No gate expands user permissions. Keep chatter minimal when requested, while following required host updates; questions and blocker reports need no PASS but must not claim success.

## References

- `references/orchestration.md`: context, state, transitions, loops and portability.
- `references/roles.md`: independent briefs and verdicts.
- `references/gate-contract.md`: executable gate and limits.
- `references/source-map.md`: supplied-document provenance.
- `references/critical-method.md`: optional assumption/opportunity-cost analysis.
- `references/response-contract.md`: optional reflection output, never a gate bypass.
- `references/safety-boundaries.md`: grounded claims, privacy and respectful critique.
