# Event Room Intent Tags Design

## Context

The run-event system already shows compact route copy in the choice panel and sidebar HUD, but the player still has to parse raw numbers before understanding whether a route is primarily sustain, economy, tempo, or burst. That comparison cost is unnecessary friction between fights.

## Approaches

1. Add small tactical tags directly to the existing compact route preview strings.
2. Add a new dedicated "route role" line under every option.
3. Keep the UI unchanged and document the roles in README only.

## Recommendation

Use approach 1. It preserves the current layout, reuses existing preview builders, and improves both the panel and HUD with one shared formatter.

## Design

Add a pure helper in `shared/game-core.js` that derives up to two short tags from each route effect. Reuse that helper inside `buildRunEventRoomChoicePreview`, then route unresolved HUD summaries through the same preview builder so the tag language stays consistent.

Keep resolved summaries unchanged. The decision aid matters most before the player commits.
