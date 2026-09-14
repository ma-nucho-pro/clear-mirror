# Context, execution and acceptance

Recover the task from the conversation, named files and actual workspace. Retrieve relevant memory/history only through available tools. Current corrections supersede old assumptions. Preserve all original requirements unless the user changes them. Read enough source material for coverage and disclose partial reads.

Maintain an administrative ledger in the authorized workspace or conversation state: task/source references, stable sourced requirement IDs and criteria, preservation constraints, authors, milestones, revisions, tool evidence, judge verdicts and open defects. Exclude secrets and private deliberation. Required partial/blocked/unverified items cannot be relabeled N/A.

## Transitions

`intake → preflight → execution → milestone review → repair/review → final review → delivery`

Read-only intake, work records and judge calls bootstrap the process. Creating the requested artifact or executing the plan requires both preflight PASS verdicts. Define meaningful milestones before implementation: e.g. implementation before deployment, generated document before publication, evidence collection before factual answer. A milestone is not every keystroke. Check the next stage's plan before consequential actions; unchanged approved scope need not be reapproved by the user.

BLOCK permits authorized repairs and tests needed to resolve the defect, not advancement, publication or verified completion. Changed plan/scope requires renewed preflight. Do independent unblocked work where it does not bypass a failed gate. Missing infrastructure allows an honest blocker report.

## Binding and invalidation

Fingerprint requirements, plan, artifact contents and evidence using hashes or immutable revisions. Final approval additionally binds substantive answer content. Changes invalidate the affected pair and downstream dependent gates; if impact is unknown invalidate all downstream gates. Reject stale workers. Recheck live state where freshness matters.

Evidence must point to actual tool results, source passages, tests, renders or inspected files. The director inspects it; a record checker cannot authenticate agents or prove semantic correctness. Coverage judges reconstruct requirements from original sources to detect ledger omissions.

## Loop

Record defect → requirement → repair → retest → independent review. Preserve passing work. If the same defect repeats twice, reconsider architecture/interpretation. Continue useful authorized correction until required acceptance criteria pass or a specific external dependency blocks progress. Do not shrink requirements to fit tests or polish indefinitely.

## Final and publication

The final pair checks the integrated artifact and proposed answer including evidence claims. Answer-only tasks still have an artifact: the draft and its sources. Necessary progress/blocker messages are exempt but cannot claim success. For publication, review exact content and authorization, publish, inspect remote state, then review publication evidence and the final response. Changed published content invalidates affected approval. Formatting a reviewed response cannot add substantive unreviewed claims.

## Portability

Use actual host delegation, files, web, shell and media tools. No bundled hidden model APIs, persistent loops or implied powers. `/loop` is a behavior unless genuinely exposed as a command. Serialize distinct reviewers when concurrency is limited. Missing judges blocks strict mode; only explicit user downgrade permits qualified single-agent work, never independent acceptance. Follow host instruction priority for communications and safety.
