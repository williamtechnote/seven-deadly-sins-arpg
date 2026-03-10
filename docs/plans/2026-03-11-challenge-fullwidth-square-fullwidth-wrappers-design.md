# Full-Width Square Full-Width Wrapper Design

**Context**

The run challenge label normalizer already strips decorator pairs recursively across ASCII, full-width, and CJK wrappers. The current gap is audit coverage: several `［...］` combinations with other full-width wrappers are supported by the parser but not explicitly represented in the README/help contract or the active TODO queue.

**Approaches**

1. Extend the existing `［...］` family with the next missing full-width wrapper pairs.
   Recommended because it preserves the current heartbeat sequence and reuses the existing parser path without adding new parsing logic.
2. Jump to a different wrapper family.
   Lower value because it leaves the current `［...］` audit trail incomplete.
3. Leave support implicit in parser tests only.
   Fastest, but it weakens the doc-driven regression contract this repo is maintaining.

**Selected Scope**

- Implement `［｛挑战｝］` / `｛［本局挑战］｝`.
- Implement `［（挑战）］` / `（［本局挑战］）`.
- Queue `［〈挑战〉］` / `〈［本局挑战］〉` as the next active follow-up.
