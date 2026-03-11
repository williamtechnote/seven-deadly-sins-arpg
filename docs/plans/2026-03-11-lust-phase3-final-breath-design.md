# Lust Phase 3 Final Breath Design

## Context

`TODO.md` only had one active live-observation item for `魅惑女妖` phase 3. The recent five-breather and weighting passes already widened the rotation, so the remaining risk is the next major special re-entering a little too soon after a full loop.

## Concrete Follow-Ups

1. Continue stretching the shared `majorSpecial` recovery guard.
2. Add one more directed `charmBolt` / `dash` bridge segment between `mirageDance` and the next `reverseControl`.
3. Leave one final observation item open in case live pacing still feels dense afterward.

## Options

### Option A: Shared recovery + loopback bridge

Raise the existing shared recovery timer and extend the existing `mirageDance -> reverseControl` bridge by one light-pressure beat.

Why recommend it:
- stays data-driven
- matches the active observation exactly
- avoids touching the boss selector/runtime again

### Option B: Shared recovery + single-attack recovery

Raise shared recovery and lengthen either `reverseControl` or `illusion` recovery one more time.

Trade-off:
- also likely works
- less targeted to the current loopback-density observation

### Option C: Weight-only tuning

Push `charmBolt` / `dash` frequency higher again without changing guards.

Trade-off:
- smallest diff
- weaker contract and less deterministic than the existing guard/bridge path

## Chosen Design

Use Option A. Split the single observation into the three backlog items above, implement the first two, and lock them through the existing attack-order and shared-recovery regression hooks. Sync `README.md` so the phase-3 pacing contract still matches the source.
