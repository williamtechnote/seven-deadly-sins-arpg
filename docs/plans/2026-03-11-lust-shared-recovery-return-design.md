# Lust Shared Recovery Return Design

Convert the single `魅惑女妖` phase-3 live observation into three concrete follow-ups, then implement the first two with the smallest pacing changes that still match the TODO wording.

## Options

### Option A: Shared recovery plus `reverseControl` recovery

Increase the phase-3 shared `majorSpecial` recovery guard, then lengthen the explicit `reverseControl` recovery window one more step.

Pros:
- Matches the TODO wording order exactly.
- Reuses existing selector and executor hooks without reshaping the full attack order again.
- Leaves `illusion` as a clean final observation item if pacing still feels dense.

Cons:
- Adds downtime in two places instead of one.

### Option B: Both single-attack recoveries

Extend `reverseControl` and `illusion` recovery again without touching shared recovery.

Pros:
- Very targeted executor-level tuning.

Cons:
- Skips the first pacing lever named in the active TODO.

### Option C: Shared recovery plus another bridge

Raise shared recovery again and add still more `charmBolt` / `dash` bridge padding.

Pros:
- Mostly data-driven.

Cons:
- Repeats the last loopback-style intervention before exhausting the remaining recovery knobs.

## Decision

Choose Option A. The active TODO explicitly prioritizes shared recovery first, then single-attack recovery. Splitting it into `二十六-一 / 二十六-二 / 二十六-三` keeps that order clear: shared recovery first, `reverseControl` recovery second, and `illusion` recovery as the remaining observation.

## Scope

- Split `TODO.md` so `二十六-一 / 二十六-二 / 二十六-三` become the active ordered backlog.
- Tighten `scripts/regression-checks.mjs` first for the shared recovery value, the `reverseControl` recovery constant, and the README wording.
- Update the phase-3 metadata in `data.js`.
- Update the `reverseControl` executor recovery in `game.js`.
- Sync `README.md`, then leave only `二十六-三` active.
