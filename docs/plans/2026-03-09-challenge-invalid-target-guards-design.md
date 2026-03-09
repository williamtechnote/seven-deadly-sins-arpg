# Challenge Invalid Target Guards Design

**Context**

The run-challenge sidebar and hidden ultra-compact badge helpers currently derive progress text from `target` directly. If future content or malformed save data supplies `target <= 0` for an in-progress challenge, the fallback ladders can surface misleading strings such as `0/0`, `挑战 0/0`, or `进0`.

**Approach Options**

1. Hide all invalid-target challenge UI.
   Trade-off: safest for broken data, but removes useful objective labels and completion state.

2. Keep label/completion copy, suppress invalid progress copy.
   Trade-off: preserves readable UI without inventing fake progress. Recommended.

3. Auto-coerce invalid targets to `1`.
   Trade-off: keeps ratio formatting, but manufactures incorrect progress semantics.

**Selected Design**

Use option 2. Treat `target <= 0` as an invalid in-progress progress source.

- Regular and compact summaries keep their title plus normalized label, but the progress/detail line falls back to empty instead of `0/0`.
- Ultra-compact visible summaries fall back to label-agnostic `挑战进行中`, then `进行中`, instead of numeric ratios.
- Hidden ultra-compact in-progress badges stay silent for invalid targets rather than emitting `进0/0`, `0/0`, or `进0`.
- Completed challenges keep the existing completion and reward ladders because they do not depend on ratio semantics.

**Testing**

- Add regression checks for invalid-target visible summaries in regular, compact, and ultra-compact tiers.
- Add regression checks for invalid-target hidden badge behavior.
- Sync README and help overlay copy so the documented fallback ladders match the runtime behavior.
