# Lust Post-Mirage Spacing Design

**Date:** 2026-03-11

## Goal

Turn the remaining `魅惑女妖` phase 3 pacing follow-up into three concrete backlog items, then implement the first two in a narrow, regression-guarded way.

## Prioritized Scope

1. Add a post-`mirageDance` breather guard so phase 3 cannot immediately roll back into another major special when a lighter attack is available.
2. Lengthen the `mirageDance` finisher settle window so the third beat reads as a cue before the reverse wave starts.
3. Leave one remaining observation item for future live tuning if the second-round pressure is still too dense after these two changes.

## Approach Options

### Option A: Data-driven selector guard plus local settle tuning

Store a per-phase post-attack breather rule in `data.js`, consume it in the existing phase selector, and bump the `mirageDance` finisher delay slightly.

Pros:
- Reuses the current phase data and selector plumbing
- Keeps the tuning localized to Lust phase 3
- Fits the existing source-hook regression style

Cons:
- Adds one more piece of attack-selection metadata

### Option B: Hard-code Lust-specific selector logic in `game.js`

Add an explicit `if lastCompletedAttack === 'mirageDance'` branch in the selector.

Pros:
- Smallest line count

Cons:
- Bakes boss-specific pacing rules into generic runtime code
- Harder to extend if another boss needs the same pattern later

### Option C: Only lengthen `mirageDance`

Skip selector work and only increase the settle delay before the finisher.

Pros:
- Lowest runtime risk

Cons:
- Does not address the TODO's second-round special density concern

## Recommendation

Use Option A. It addresses both the immediate pacing issue and the follow-up TODO with the smallest reusable surface area.

## Design

### Selector Guard

- Add `postAttackBreatherGuards` to Lust phase 3 data.
- For `mirageDance`, block `reverseControl`, `illusion`, and `mirageDance` itself on the very next selection when at least one non-guarded attack exists.
- Keep the existing major-special breather and phase-local cooldown logic intact; this new rule only applies after the completed `mirageDance`.

### Mirage Settle Window

- Increase `mirageDance`'s `finisherDelayMs` from the current short settle to a slightly longer value.
- Keep beat count, beat ladder, and reverse-wave behavior unchanged so the cadence stays familiar while the read window improves.

## Testing Strategy

- Add failing regressions first for:
  - the new phase data contract
  - the selector hook that reads and applies post-attack breather guards
  - the longer `mirageDance` settle delay constant
- Then implement the minimal data/runtime/doc updates and rerun the required verification bundle.
