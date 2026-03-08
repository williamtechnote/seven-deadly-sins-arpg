# HUD Measured Clamp Extension Design

## Background

`TODO.md` only left a broad evaluation item about extending the existing Phaser text measurement flow. The concrete gap is now clear in two places that still render longer copy without runtime width fitting:

- event-room shrine world labels can grow into `房名 · 已选: ...` summaries and drift out of the active camera view;
- Boss telegraph copy can combine type, attack name, counter-window text, and hint text that outgrows the fixed Boss HUD lane.

## Goal

- Keep event-room shrine world labels readable when the shrine sits near either viewport edge.
- Keep Boss telegraph copy inside the available HUD width without silently dropping all context.
- Reuse the existing “real Phaser measurement first, fallback helper second” direction instead of hard-coding new character limits.

## Options

### Option A: keep adding fixed character caps

- Pros: fastest patch.
- Cons: repeats the same mixed-width problem that the repo has been removing from quick-slot notices and shrine prompts.

### Option B: measured clamp helpers plus scene-level measurement caches (recommended)

- Add pure helpers for centered viewport placement and ellipsis fitting.
- Let `LevelScene` and `BossScene` provide Phaser-backed width measurement callbacks plus small caches keyed by text/style.
- Keep the rendering code thin and make the string fitting rules regression-testable from `shared/game-core.js`.

### Option C: redesign the HUD layouts

- Pros: more room for copy.
- Cons: too large for this heartbeat cycle and unnecessary while the current layouts can be stabilized with measured fitting.

## Selected Design

- Use option B.
- Subtask 1: add measured world-label fitting for event-room shrine labels, including centered viewport clamping for camera-relative world text.
- Subtask 2: add measured width fitting for Boss telegraph title/window/hint strings so long warnings stay inside the Boss HUD lanes.
- Leave the right-side side-panel summary evaluation as the only remaining Active TODO after this cycle.

## Testing

- Add regression coverage for the new shared helpers that clamp centered text anchors and ellipsize long strings against measured widths.
- Add source-hook checks that `LevelScene` and `BossScene` both route these surfaces through Phaser measurement helpers.
- Keep the required syntax checks plus `node scripts/regression-checks.mjs` as the final evidence gate.
