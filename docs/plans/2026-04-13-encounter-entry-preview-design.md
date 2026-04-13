# Encounter Entry Preview Design

## Context

`缓冲战 / 高压战 / 淘金战` already influence room 3 through roster choice, formation spacing, engagement timing, and reward weighting. That means the route is legible when the player picks the shrine option and again once the fight unfolds. The missing link is the first second after crossing the room threshold: players still need to infer the route identity from enemy motion instead of receiving a short tactical cue immediately.

The methodology docs in this repo point toward a high-ROI fix:

- route choices should change the next 1-3 rooms in a felt way
- rewards and route identity should become readable within 30 seconds, ideally faster
- the HUD/world feedback hierarchy should answer "what changed because of my last choice?" without opening another menu

## Options

1. Expand shrine-choice or sidebar copy.
Rejected: this improves forecast at selection time, but it does not strengthen the room-entry moment itself.

2. Add a dedicated route banner UI panel.
Rejected: this would create another bespoke presentation layer for a problem the repo already solves well with short floating combat text. It is heavier than one heartbeat needs.

3. Reuse the existing room-entry floating text with a shared encounter-entry helper.
Recommended: it keeps the contract in `shared/game-core.js`, adds only one short subtitle per route, and makes the route identity visible exactly when the player crosses into room 3.

## Chosen Direction

Add a shared helper that converts the resolved encounter profile into a two-part room-entry cue:

- `缓冲战 · 双拍缓冲`
- `高压战 · 三向成压`
- `淘金战 · 后排赏金`

`LevelScene` should announce that cue once on first entry into room 3, using the already-existing route colors. The helper owns the subtitle copy so README, regression checks, and runtime stay aligned on one contract.

## Design Notes

- Keep the encounter profile as the source of truth. `shared/game-core.js` should export a helper that returns the composed room-entry label from the resolved run-event room or the profile itself.
- Keep the runtime insertion narrow. `game.js` already has `_maybeAnnounceRunEventEncounterProfile()` and should only switch from label-only text to helper-driven text.
- Do not add a new persistent HUD block. This is a momentary entry cue, not a second summary surface.
- Keep the subtitles tactical rather than descriptive. They should tell the player what posture to expect, not restate the full roster/formation details.

## Success Criteria

- Crossing into room 3 shows a single, route-colored entry cue that exposes both the route identity and a short tactical posture.
- The cue fires only once per room-entry route profile.
- Shared helper coverage proves the exact labels for `breather`, `pressure`, and `windfall`.
- Source-hook coverage proves the runtime consumes the shared helper instead of hardcoding only `profile.encounterLabel`.
- README remains readable while documenting that third-room routing is now visible at room entry, not just on shrine selection and during combat payoff.
