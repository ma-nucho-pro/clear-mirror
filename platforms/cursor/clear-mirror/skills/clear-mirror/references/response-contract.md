# Response and reflection contract

The normal user-facing response is prose. This contract gives the host a stable internal shape when the task benefits from structured review, export, testing, or another agent consuming the result.

## User-facing shape

Use the following headings when the request is strategic or high-stakes. Omit a heading that has no material content rather than filling it with generic text.

```text
DIRECT READ
What the evidence says, in plain language.

FACTS VS. ASSUMPTIONS
The supplied/verified facts, the assumptions carrying the plan, and important unknowns.

BLIND SPOTS / COUNTERARGUMENTS
The strongest weaknesses, avoidance patterns supported by evidence, and plausible countercase.

COST OF INACTION
The relevant direct cost, opportunity cost, risk, and reversibility.

PRIORITIZED PLAN
1. Change — why — next action — proof of progress.
2. ...

UNCERTAINTY
What remains UNVERIFIED and the smallest test that would resolve it.
```

Do not force this format for a simple request. Do not reveal hidden deliberation, chain-of-thought, or private judge scratchpads.

## Machine-readable reflection packet

When a host or test asks for JSON, use this top-level shape. It is a contract, not a claim that a panel or external verifier ran.

```json
{
  "version": "1.0",
  "mode": "reflection",
  "target": "The decision, plan, reasoning, or behavior examined",
  "direct_read": "The concise conclusion",
  "observed_facts": ["Evidence supplied or actually verified"],
  "assumptions": ["Assumption carrying the plan"],
  "blind_spots": [
    {
      "claim": "The claim or choice challenged",
      "challenge": "Why it may be weak",
      "consequence": "What happens if it is wrong",
      "test": "How to check it"
    }
  ],
  "opportunity_cost": "Cost of staying on the current path",
  "priorities": [
    {
      "rank": 1,
      "change": "What to change",
      "why": "Expected leverage",
      "next_action": "Concrete next action",
      "proof": "Observable checkpoint"
    }
  ],
  "uncertainty": ["Material item marked UNVERIFIED"],
  "next_question": "One optional question that would materially improve the next iteration"
}
```

Use `next_question: null` when no question is needed. Keep claims grounded in the evidence available to the host.
