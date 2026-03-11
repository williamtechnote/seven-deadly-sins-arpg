# Lust Six-Breather Bridge Design

Turn the lone `魅惑女妖` phase-3 live observation into three concrete backlog items, then implement the first two with the narrowest data-driven pacing changes.

## Options

### Option A: Raise the breather chain to six and extend the loopback bridge

Increase `postMajorBreatherChain.requiredCount` from five to six, then add one more `dash` -> `charmBolt` handoff between `mirageDance` and the next `reverseControl`.

Pros:
- Reuses existing phase metadata and selector hooks.
- Targets the exact follow-up points named in the active observation.
- Keeps the change in `data.js`, `README.md`, `TODO.md`, and regression coverage.

Cons:
- Makes the late-phase rotation visibly longer before the next major special.

### Option B: Stretch shared recovery again

Only increase `sharedAttackRecoveryMs.majorSpecial`.

Pros:
- Smallest implementation delta.

Cons:
- Repeats the last selector-level timing pass instead of progressing the new observation branch.
- Less explicit than a visible extra breather chain and bridge segment.

### Option C: Extend `reverseControl` / `illusion` recovery again

Increase the explicit executor recovery windows one more time.

Pros:
- Preserves the current attack order.

Cons:
- Duplicates the most recent executor-level pass.
- Moves away from the two concrete options already identified in TODO.

## Decision

Choose Option A. The current codebase already has stable regressions around the phase-3 breather chain and exact loopback bridge, so the safest next heartbeat is to keep the change fully data-driven: split the observation into `二十五-一 / 二十五-二 / 二十五-三`, implement the six-breather guard first, implement the longer `mirageDance -> reverseControl` bridge second, and leave a single follow-up observation if live pacing still feels dense.

## Scope

- Update `TODO.md` active ordering and split note.
- Lock the six-breather contract in `scripts/regression-checks.mjs` first.
- Lock the longer `mirageDance -> reverseControl` loopback bridge in `scripts/regression-checks.mjs` first.
- Update Lust phase-3 metadata in `data.js`.
- Sync the player-facing explanation in `README.md`.
