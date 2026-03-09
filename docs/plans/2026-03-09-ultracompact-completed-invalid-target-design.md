# Ultra-Compact Completed Invalid Target Design

**Context**

The shared ultra-compact completed summary helper already stays label-agnostic, so even when regular and compact tiers dedupe an upstream label down to `未知挑战`, the visible one-line summary should still stay on the completion-first ladder. The remaining gap in this repo is explicit regression coverage plus matching README and in-game help wording for the invalid `target<=0` completed path.

**Approaches**

1. Add regression coverage and doc sync around the existing helper behavior.
Recommended because the runtime behavior already matches the intended fallback chain and the missing risk is silent drift in tests or docs.

2. Refactor the ultra-compact completed helper into a new invalid-target-specific branch.
Rejected because it would duplicate logic that already works and increase the chance of future divergence.

3. Leave the current behavior undocumented.
Rejected because `TODO.md` explicitly calls out this edge case and the heartbeat flow requires README/help parity.

**Design**

- Keep `shared/game-core.js` on the same completion-first ladder for ultra-compact completed summaries:
  - `挑战完成 · +90金`
  - `挑战完成`
  - `完成`
- Add a dedicated regression proving the ladder still applies when `completed === true`, `target <= 0`, and the upstream label would collapse to `未知挑战` in wider tiers.
- Update `README.md` to state that the invalid-target completed ultra-compact path stays on the same ladder and does not inject `未知挑战`.
- Update the in-game help copy in `game.js` to mirror the same wording so the overlay and README stay aligned.

**Testing**

- Write failing regression checks first for the missing README/help wording.
- Keep a helper-level regression for the ultra-compact completed invalid-target output so future refactors do not regress to in-progress copy or `未知挑战`.
- Run the exact heartbeat verification command after the edits.
