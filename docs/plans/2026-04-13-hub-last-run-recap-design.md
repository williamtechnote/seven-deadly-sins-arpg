# Hub Last-Run Recap Design

## Goal

Keep the last routed run segment readable after Boss victory by carrying a compact recap into the hub.

## Context

Current route identity already survives:

- choice preview
- resolve receipt
- room-3 entry
- first payoff beat
- clear recap
- Boss-door recap
- Boss-opening echo
- Boss-victory recap

But once the player returns to `HubScene`, the run segment goes silent. The player keeps seals, loot, and boss progress, yet loses the easiest comparison surface for "which route did I just take and what posture did it create?"

The existing docs now suggest a fresh, high-ROI extension:

- feedback should explain consequences, not make players remember them
- delayed consequences still need a signal after the action scene ends
- the hub is the natural planning surface for comparing the last route before choosing the next boss

## Options

1. Add a full run-end summary overlay before hub return.
Rejected: higher UI scope, more transition risk, and unnecessary for one compact comparison need.

2. Expand the victory stack with more route/source lines and leave the hub unchanged.
Rejected: still loses the memory bridge once the scene changes.

3. Persist one compact last-run recap payload and render it in the hub.
Recommended: minimal UI, uses existing route vocabulary, and directly fixes the planning-space gap.

## Chosen Direction

Add one shared helper in `shared/game-core.js` that converts a persisted last-run summary payload into a compact hub recap block. `BossScene` will assemble and save that payload at victory using:

- defeated boss label
- Boss-victory route recap
- selected event-room choice label
- stored recommendation reason

`HubScene` will read the saved payload and render a small fixed-position `上轮战报` panel. The panel should be lightweight, always readable, and not tied to a timer-only toast.

## Design Notes

- Keep summary normalization and formatting in shared logic so save/load, runtime, and regression checks align.
- Store only compact recap data; do not persist large combat history.
- Make the third line optional when no source choice exists.
- Keep the hub panel informational, not interactive.
- Preserve this recap until the next reset or next Boss victory overwrites it.

## Testing

- Save/load integrity should preserve the recap payload.
- Shared helper assertions should verify full, partial, and empty last-run summaries.
- Runtime-source assertions should verify `BossScene` persists the payload and `HubScene` renders the recap block.
- README should document the new hub-visible memory bridge.

## Assumption

This heartbeat is running in a required non-interactive automation flow, so the design is treated as self-approved for this cycle.
