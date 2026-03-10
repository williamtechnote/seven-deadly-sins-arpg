# Challenge Ornamental Quote Design

**Context**

The shared run-challenge label sanitizer already strips multiple wrapper families before repeated `本局` / `挑战` prefix dedupe. The current Active queue still misses several CJK punctuation families that behave like pure decorator wrappers upstream.

**Approaches**

1. Extend the existing shared decorator-pair table.
Recommended because the sanitizer already treats wrapper support as data, so adding quote pairs keeps every sidebar/help/regression path aligned with minimal risk.

2. Add special-case regex handling per new wrapper family.
This works, but it duplicates logic already centralized in the decorator-pair loop and makes future quote-family additions harder to audit.

3. Stop at docs/tests and leave runtime behavior implicit.
This is the weakest option because unsupported wrappers would still leak into sidebar copy even if documented.

**Design**

- Promote three adjacent TODOs in priority order:
  `〝…〞`, `〝…〟`, `〘…〙`.
- Implement the earliest two this cycle by extending `RUN_CHALLENGE_DECORATOR_PAIRS`.
- Add explicit regression assertions for both the direct-strip and `未知挑战` fallback paths.
- Sync README and help-overlay copy so the supported wrapper-family list stays authoritative.

**Testing**

Run the required syntax checks plus `node scripts/regression-checks.mjs` after adding failing tests and again after implementation.
