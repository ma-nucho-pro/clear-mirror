# Executable gate records v2

Run `node <skill-root>/scripts/gate.mjs packet.json`. Exit 0 means the submitted records consistently allow advancement; exit 1 blocks advancement. This command neither launches judges nor authenticates references nor verifies artifact bytes. The host must inspect actual invocation/results and enforce workflow order. Fabricated but consistent input cannot be detected by this offline checker.

All fields below are required; unknown fields are rejected:

```json
{
  "version": "2.0",
  "phase": "preflight",
  "revision": "abcdef0123456789",
  "decision": "advance",
  "integrator": "host-director-id",
  "authors": ["host-director-id"],
  "requirements": [{"id":"R1","source":"user:request","criterion":"Plan covers requested output","status":"pass","evidenceIds":["E1"]}],
  "evidence": [{"id":"E1","revision":"abcdef0123456789","ref":"actual-host-output-reference"}],
  "reviews": [
    {"role":"correctness","agentId":"real-judge-a","invocationRef":"actual-call-a","resultRef":"actual-result-a","reviewedRevision":"abcdef0123456789","verdict":"PASS","findings":[],"requirementIds":["R1"],"evidenceIds":["E1"]},
    {"role":"coverage","agentId":"real-judge-b","invocationRef":"actual-call-b","resultRef":"actual-result-b","reviewedRevision":"abcdef0123456789","verdict":"PASS","findings":[],"requirementIds":["R1"],"evidenceIds":["E1"]}
  ]
}
```

The sample IDs are illustrative, never proof of executed judges. Phase is preflight/milestone/final. Revision is 7–64 lowercase hex characters, optionally prefixed `sha256:`; use an actual fingerprint of the reviewed plan/requirements/artifacts/evidence. Strings must be nonempty and trimmed. IDs and coverage lists must be unique. Include every author of reviewed work, including its integrator. Exactly two distinct non-author judges must cover every requirement and evidence ID, with current revision, PASS and no findings. Every requirement cites evidence and all evidence is used.

For final packets add `artifactHash` and `answerHash` to the top level AND each review, each `sha256:` followed by 64 lowercase hex digits. Compute these from the actual artifact bundle and final draft; both reviews must bind identical hashes. The host checks actual bytes against hashes again before delivery. Changed content requires renewed review.

Preflight pass means the requirement is addressed by a feasible plan and test, not that the deliverable already exists. Milestone criteria refer to that stage; final criteria cover the whole original request, including publication if requested. Maintain the full source requirement ledger outside phase packets so pending later work is never lost. The checker is stateless: prior gate order, source completeness and actual evidence truth are enforced by the host, not certified by this command.

Rejection allows authorized repair and truthful blocker reporting, not advancing or claiming success. A downgrade never passes this strict gate. Keep failed verdicts and iteration history outside the advancement packet; do not erase unresolved findings to obtain PASS.
