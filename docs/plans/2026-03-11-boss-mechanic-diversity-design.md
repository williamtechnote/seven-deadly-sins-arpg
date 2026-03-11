# Boss Mechanic Diversity Design

**Date:** 2026-03-11

## Goal

Turn the single broad Boss-diversity TODO into concrete heartbeat-sized mechanics that fit the existing attack system, telegraph HUD, and regression style.

## Prioritized Scope

1. `炎魔将军` phase 2/3 adds `熔火围城` (`magmaRing`)
2. `堕天骑士` phase 3 adds `圣剑环阵` (`bladeOrbit`)
3. Queue next heartbeat follow-up for `魅惑女妖` phase 3 chain-dash illusion mechanic

## Approach Options

### Option A: Reuse existing Boss attack buckets

Add one new hazard attack and one new special attack inside the current `Boss` execution flow, then wire them into boss phase attack lists plus telegraph metadata.

Pros:
- Lowest risk to current fight flow
- No new scene architecture
- Easy to cover with regression checks

Cons:
- Variety grows incrementally rather than via a bigger systemic refactor

### Option B: Build a generic boss-script timeline layer

Introduce per-phase scripted timelines that can schedule movement, hazards, and add-ons.

Pros:
- More expressive future boss design space

Cons:
- Too large for a single heartbeat
- Harder to validate with current regression harness

### Option C: Only tune existing attacks by phase

Keep the same attack names and alter timings/counts by phase without adding new mechanics.

Pros:
- Minimal code churn

Cons:
- Misses the TODO’s “new moves / new phase behavior” intent

## Recommendation

Use Option A. It fits the current codebase, satisfies the TODO with real new mechanics, and stays compatible with the existing telegraph and regression-check workflow.

## Mechanic Design

### `熔火围城` / `magmaRing`

- Boss: `炎魔将军`
- Attack class: `HAZARD`
- Behavior:
  - Boss stops and projects a large warning ring around itself
  - Safe zone shrinks inward over time
  - Player touching the ring takes damage once per pulse and receives `burn`
- Why:
  - Distinguishes Wrath from existing cone/AOE kit
  - Creates a spacing check instead of another frontal dodge

### `圣剑环阵` / `bladeOrbit`

- Boss: `堕天骑士`
- Attack class: `SPECIAL`
- Behavior:
  - Several luminous blades orbit the boss briefly
  - After the orbit window, blades launch outward in staggered bursts
  - Contact deals chip damage and forces repositioning
- Why:
  - Gives Pride a cleaner “holy control” mechanic
  - Reads well with the current telegraph bar and phase unlock messaging

## Testing Strategy

- Add regression guards first:
  - source-level checks for new attack keys in boss phase definitions
  - source-level checks for new telegraph metadata
  - source-level checks for the new `Boss` execution branches
- Then implement until `node scripts/regression-checks.mjs` passes again.
