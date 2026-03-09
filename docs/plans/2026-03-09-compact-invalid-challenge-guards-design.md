# Compact Invalid Challenge Guards Design

**Context**

The active heartbeat placeholder points to follow-up guard work around run-challenge/sidebar responsive copy. The nearby implemented behavior already normalizes repeated challenge prefixes and preserves readable fallback copy when `target <= 0`, but the compact invalid-target + `未知挑战` combinations are not explicitly called out in the docs/help text and do not have focused regression coverage.

**Brainstormed Options**

1. Extend the next heartbeat with compact invalid-target guards for `未知挑战` in both in-progress and completed states.
   This is the smallest adjacent unit because the runtime helper already routes through the compact label fallback and only needs regression and documentation lock-in.
2. Skip compact and move to ultra-compact completed invalid-target follow-ups.
   This is adjacent, but it leaves the compact tier with an implicit contract that is easier to regress silently.
3. Refactor compact/regular invalid-target formatting into new shared helpers.
   This is heavier than needed for the current heartbeat and adds churn without evidence of duplicate logic causing bugs.

**Decision**

Take option 1 now. Implement these two items:

- Compact in-progress challenge summaries should keep `本局挑战：进行中` plus `未知挑战 · +90金` / `未知挑战` when repeated prefix stripping exhausts the label and invalid data removes ratio semantics.
- Compact completed challenge summaries should keep `本局挑战：已完成` plus `未知挑战 · +90金` / `未知挑战` under the same exhausted-label + invalid-target conditions.

Leave this next item queued:

- Ultra-compact completed invalid-target summaries should keep the existing completion-first fallback ladder when the upstream label collapses to `未知挑战`.

**Testing**

- Add focused regression assertions in `scripts/regression-checks.mjs` for the two compact invalid-target cases.
- Add README/help-overlay source checks so the docs contract fails before the text is updated.
- Run the required syntax and regression commands from the heartbeat instructions.
