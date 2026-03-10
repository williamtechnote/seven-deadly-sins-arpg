# Challenge Decorator Follow-up Design

**Scope:** Continue the run-challenge sidebar normalization thread for another narrow cleanup pass.

## Recommendation

Keep all behavior in the shared challenge label helper rather than adding special-case cleanup in each summary tier. The next useful gaps are:

1. Western smart-quote decorator wrappers such as `“挑战”` and `‘本局挑战’`.
2. Nested mixed decorator wrappers such as `【「挑战」】` and `《〔本局挑战〕》`.
3. Dirtier decorator payloads where the wrapper body still carries leading separators such as `【：挑战】`.

## Why

- The sidebar, compact summary, ultra-compact summary, badge, and completion feedback already depend on `shared/game-core.js`.
- Extending the existing decorator stripping path keeps new coverage aligned with the current `未知挑战` fallback ladder instead of introducing another normalization branch.
- The first two items are low-risk to implement with regression-first coverage because the current helper already loops until the label stops changing.
