# Full-Width Square Mixed Wrapper Design

**Context**

The run challenge label normalizer already strips decorator pairs recursively. The remaining gap in this heartbeat cycle is auditability: full-width-square mixed permutations need explicit TODO ordering, regression coverage, and user-facing contract text so future edits do not silently drop them.

**Approaches**

1. Extend the current full-width-square family first.
   Recommended because the active TODO already started this family and the existing recursive decorator stripper makes these variants low-risk.
2. Jump to a different wrapper family.
   Lower value because it leaves the current full-width-square sequence half-documented.
3. Skip docs and rely on generic code support.
   Fastest, but it weakens the regression contract that this repo has been maintaining for challenge label cleanup.

**Selected Scope**

- Implement the active `［[挑战]］` / `[［本局挑战］]` contract.
- Implement the next follow-up `［〔挑战〕］` / `〔［本局挑战］〕` contract.
- Queue lenticular and curly double-quote full-width-square variants as the next active items.
