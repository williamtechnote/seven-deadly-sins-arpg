# Lust Illusion + Shared Recovery Design

## Context

The current active TODO is a single observation item for `魅惑女妖` phase 3 pacing. The working tree already contains the prior uncommitted pass that extended shared recovery and `reverseControl` recovery. This cycle continues from that state without reverting it.

## Options

### Option A: `illusion` recovery first, then shared `majorSpecial` recovery

Increase the explicit `illusion` recovery window one more step, then extend the shared phase-3 `majorSpecial` recovery guard again.

Pros:
- Matches the heartbeat instruction ordering exactly.
- Uses the remaining single-attack recovery knob before revisiting the shared guard.
- Keeps `reverseControl` stable so this pass isolates whether `illusion` was still the main dense re-entry point.

Cons:
- Adds more recovery to two different pacing layers in one cycle.

### Option B: `illusion` recovery only

Only lengthen `illusion` recovery and leave shared recovery unchanged.

Pros:
- Smallest runtime change.

Cons:
- Ignores the required default ordering for the second implementation item.

### Option C: Shared `majorSpecial` recovery first

Raise shared recovery again before touching `illusion`.

Pros:
- Broadly delays all three phase-3 major specials.

Cons:
- Conflicts with the requested `illusion`-first default.

## Decision

Choose Option A. Split the single observation into three concrete items:

1. `二十七-一` `illusion` recovery tuning
2. `二十七-二` shared `majorSpecial` recovery tuning
3. `二十七-三` observation for whether `reverseControl` needs another recovery revisit

## Design

- Raise `illusion` recovery in `game.js` from `920` to `1040`.
- Raise Lust phase-3 `sharedAttackRecoveryMs.majorSpecial` in `data.js` from `3600` to `3900`.
- Tighten `scripts/regression-checks.mjs` first so the new values and README wording fail before implementation.
- Update `README.md` to describe the new `illusion`-first pass and the follow-up shared recovery pass.
- Update `TODO.md` so `二十六-三` is recorded as split into `二十七-一 / 二十七-二 / 二十七-三`, with `二十七-三` left active.
