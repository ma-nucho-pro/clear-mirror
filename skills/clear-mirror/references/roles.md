# Optional independent roles

The parent host owns orchestration. These roles are optional and should be used only when the host exposes real independent subagent calls and the task is important enough to justify the cost. The roles must not recursively invoke Clear Mirror or see one another's findings before returning.

## Reflection analyst

Extracts the target, separates observed facts from assumptions and unknowns, and lists the two or three assumptions with the greatest impact.

## Red-team challenger

Attempts to disprove the plan with a concrete counterexample, failure mode, or alternative explanation. It must explain what evidence would make the challenge fail.

## Execution strategist

Converts the surviving conclusion into a small prioritized plan with dependencies, next actions, checkpoints, and a stop/continue rule.

## Evidence auditor

Checks claims that require current or external facts, rates source quality, and marks unsupported claims `UNVERIFIED`. It does not turn a lack of search results into proof of absence.

## Final synthesizer

The parent agent synthesizes the original request and role outputs. It must resolve disagreements with evidence, preserve uncertainty, and never report that a role ran unless the host returned its result.

## Compact output contract

Each role returns:

```yaml
role: reflection-analyst | red-team-challenger | execution-strategist | evidence-auditor
verdict: PASS | CONCERN | UNVERIFIED
findings:
  - issue: "Specific observation"
    impact: "Why it matters"
    evidence: "Quote, tool result, or UNVERIFIED"
    next_check: "How to test it"
```
