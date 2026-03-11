# Lust Phase Pacing Design

**Date:** 2026-03-11

## Goal

Split `魅惑女妖` phase 3 pressure into heartbeat-sized pacing tasks so `reverseControl` / `illusion` / `mirageDance` stop arriving as a dense special stack.

## Prioritized Scope

1. Reorder Lust phase 3's attack list so each major special has at least one readable breather.
2. Add a runtime selector guard so future phase-data edits cannot reintroduce consecutive major specials.
3. Leave a later follow-up open for per-attack cooldown or weighting if live pressure is still too high.

## Approach Options

### Option A: Data-only sequence split

Reorder the phase 3 attack array and stop there.

Pros:
- Smallest change
- Easy to explain in README and regressions

Cons:
- Future data edits could accidentally reintroduce dense major-special chains

### Option B: Data split plus selector guard

Reorder Lust's phase 3 list and add a generic breather rule when the selector sees two major specials back-to-back.

Pros:
- Fixes today's pacing issue and protects against drift
- Still stays local to boss sequencing logic

Cons:
- Slightly more moving pieces than a data-only tweak

### Option C: Full cooldown/weight system

Add per-attack cooldowns or weighted selection for phase 3 specials.

Pros:
- Strongest long-term control

Cons:
- Larger design change than this heartbeat needs
- Harder to verify with the current lightweight regression suite

## Recommendation

Use Option B. It keeps the heartbeat focused on pacing without turning the boss selector into a new subsystem.

## Design

### Phase 3 Sequence Split

- Change Lust phase 3 from a special-heavy tail into an interleaved ladder.
- Target sequence: `charmBolt -> reverseControl -> dash -> illusion -> charmBolt -> mirageDance -> dash`.
- This preserves all existing mechanics while adding breathing space between the three major specials.

### Selector Guard

- Track the last completed boss attack.
- When the selector is about to pick a major special immediately after another major special, scan forward for a non-major attack first.
- Fall back to the original candidate if the current phase has no non-major attacks, so other bosses are not soft-locked by the guard.

## Testing Strategy

- Add a failing regression check for Lust phase 3's exact attack order.
- Add a second failing regression check for the selector breather guard hooks.
- Rerun the full required syntax and regression bundle after the minimal implementation.
