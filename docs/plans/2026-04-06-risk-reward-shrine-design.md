# 命途圣坛 Design

## Context

The event-room roster now covers weapon routing, dodge follow-ups, combo refunds, stamina sustain, and cadence shaping. `TODO.md` still calls out an uncovered risk/reward branch, and `docs/gameplay-run-variety-principles.md` explicitly prefers readable combat routes over opaque subsystems.

## Problem

The repo has `血契祭坛` as a generic always-on risk buff, but it does not yet offer a room where the player reads an actual combat-state threshold and chooses whether to play around danger or stability during the run.

## Options

1. Add another always-on damage/taken-damage shrine.
Rejected: overlaps `血契祭坛` and does not create a new combat-state verb.

2. Add an HP-cost skill route.
Rejected: introduces a new spend pattern and extra tuning risk in one heartbeat.

3. Add a threshold-based risk/reward shrine.
Recommended: reuses the existing HP bar, damage hooks, and action HUD while giving the run a clear “fight low” vs “stay healthy” identity.

## Chosen Direction

Add `命途圣坛` with two routes:

- `绝境修习`: while HP is at or below 45%, player damage gains a large burst bonus
- `守心修习`: while HP is at or above 70%, incoming damage is reduced

## Design Notes

- Shared logic owns the new room definition plus four neutral run-effect keys:
  - `playerLowHpDamageMultiplier`
  - `playerLowHpThresholdRatio`
  - `playerHighHpDamageTakenMultiplier`
  - `playerHighHpThresholdRatio`
- The threshold ratios are additive/shared-config style keys so event-room resolution can persist them without special-case scene code.
- Runtime applies the low-HP route inside player outgoing damage calculation and the high-HP route inside incoming damage calculation.
- The combat HUD keeps both branches readable without new UI:
  - attack row shows `绝境<45%` when inactive and `绝境+40%` when active
  - dodge row shows `守心>70%` when inactive and `守心-18%` when active
- Trigger feedback should not stop at the HUD:
  - low-HP empowered hits show a distinct `绝境` hit cue
  - high-HP mitigated hits show a short `守心` defense cue when the reduction actually applies

## Success Criteria

- `RUN_EVENT_ROOM_POOL` exposes `命途圣坛` with both threshold routes.
- Choosing `绝境修习` only buffs damage while HP is at or below the configured threshold.
- Choosing `守心修习` only reduces incoming damage while HP is at or above the configured threshold.
- Regression coverage locks the shared contract, HUD labels, damage hooks, and payoff cues.
