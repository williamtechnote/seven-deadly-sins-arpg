# Challenge Large Reward Guards Design

**Goal:** Verify that ultra-compact visible run-challenge summaries keep the existing semantic fallback chain when reward text expands to values like `+999金`.

**Chosen approach:** Keep the current width-based variant picker and add regression coverage for the large-reward in-progress and completed states. Do not add a new intermediate copy rung unless the failing tests prove the current variants are insufficient.

**Alternatives considered:**
- Add a dedicated `+999金` middle variant. Rejected as premature because it complicates copy rules without evidence of a gap.
- Special-case large rewards with different width heuristics. Rejected because the current helper already delegates to measured-width fitting.

**Testing:** Add failing regression cases in `scripts/regression-checks.mjs`, update shared helper comments/docs only if needed, then run the mandated syntax and regression command.
