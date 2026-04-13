# Portal Hover Route Memory Design

## Goal

Carry the new hub-level last-run recap into the exact portal-selection moment so route memory stays visible where the next run decision happens.

## Context

The repo's route-identity chain now reaches:

- event-room choice preview
- resolve receipt
- room-3 entry
- first payoff beat
- room-3 clear recap
- Boss-door recap
- Boss-opening echo
- Boss-victory recap
- hub `上轮战报`

That solves the scene-transition memory loss, but the decision surface is still split. When the player actually approaches a portal, the target Boss label lives in world space while the last-run reminder stays in a separate fixed hub panel. The player can still reconstruct the comparison, but only by scanning between two distant UI surfaces.

The methodology docs point to a narrow next step:

- hub-return memory should survive into planning space
- route reminders should help the next 30-second decision, not become a full report
- high-ROI TODOs should improve decision readability with deterministic checks

## Options

1. Add a full run-history log to the hub.
Rejected: too much UI scope, too much persistence surface, and it answers a broader question than this heartbeat needs.

2. Keep only the existing `上轮战报`.
Rejected: preserves memory, but not at the exact point where the player commits to the next portal.

3. Add a portal-focus `选门参考` card that reuses the persisted last-run summary when the player moves near a portal.
Recommended: small scope, decision-oriented, and reuses shared route vocabulary without inventing another recap system.

## Chosen Direction

Add one shared helper in `shared/game-core.js` that converts:

- the persisted `lastRunSummary`
- the currently focused portal label

into a compact `选门参考` card.

`HubScene` will track the nearest portal within a short focus radius and show a bottom-left fixed-position panel only while a portal is in focus. The card will prefer:

1. `目标 <Boss>`
2. `上轮 <route recap>` when available, else `上轮 <boss recap>`
3. `源于 <choice> · <reason>` when available

This keeps the persistent `上轮战报` as the broad memory bridge while adding a contextual portal-decision echo instead of a full history system.

## Design Notes

- Keep formatting in shared logic so runtime, README, and regression checks stay aligned.
- Hide the portal-focus card when there is no meaningful last-run summary or no portal in focus.
- Reuse existing persisted summary fields; do not add a larger save payload.
- Prefer a fixed-position panel over per-portal floating text so copy stays readable and testable.
- Keep the panel lightweight enough to coexist with the minimap and hub panel.

## Testing

- Shared helper assertions should lock full, partial, and hidden portal-focus states.
- Runtime-source assertions should verify `HubScene` tracks a focused portal and updates a dedicated `选门参考` text block from shared logic.
- README should document that portal approach now echoes last-run route memory at decision time.

## Assumption

This heartbeat is running in a required non-interactive automation flow, so the design is treated as self-approved for this cycle.
