# Build-Route Encounter Mapping Design

## Context

`治疗 / 命途 / 赌博` recommendations already survive across choice, settlement, routed room-3 entry/clear, and one-shot source cues. `武备圣坛 / 烙痕圣坛` now have equally readable build reasons in the choice panel and combat HUD, but the next room still ignores those reasons, so the recommendation stops at copy instead of reshaping the fight.

The methodology docs for this repo point at the same gap:

- route decisions should change the next 1-3 rooms in a felt way
- the next combat decision should change within roughly 30 seconds
- shared encounter logic should stay deterministic and testable

## Options

1. Infer encounter routing from existing intent tags only.
Rejected: current tags are too coarse for `压阵 / 离弦 / 余烬 / 血痕`, especially when one route wants a bounty chase and another wants a stabilize beat.

2. Add explicit choice-key encounter mapping and recommendation feedback for `武备圣坛 / 烙痕圣坛`.
Recommended: it keeps the contract deterministic, fits the existing shared helper structure, and expands room-3 identity without inventing new runtime systems.

3. Fold `战技圣坛` into the same pass.
Rejected for this heartbeat: it needs extra recommendation heuristics beyond the current preview state, so it is a better follow-up once the build-route mapping pattern is locked.

## Chosen Direction

Extend the shared encounter-routing contract for four build-facing routes:

- `压阵修习` -> `下间高压` so melee cadence cashes into a front-loaded pressure room
- `离弦修习` -> `下间淘金` so ranged specials cash into a delayed backline chase target
- `余烬修习` -> `下间缓冲` so burn-focused loadouts get a stabilize-first room where the route can read early
- `血痕修习` -> `下间高压` so bleed-focused loadouts cash into immediate pressure and aggressive follow-up

When the selected route also matched the high-confidence recommendation reason, the routed room should reuse the existing entry/clear/source-cue contract:

- `压阵修习` + `当前持近战` -> `贴身压阵` on pressure entry/clear/engage
- `离弦修习` + `当前持远程` -> `远程追赏` on windfall entry/clear/bounty
- `余烬修习` + `当前武器可触发` -> `灼烧稳场` on breather entry/clear/stabilize
- `血痕修习` + `当前武器可触发` -> `挂血抢势` on pressure entry/clear/engage

## Design Notes

- `shared/game-core.js` remains the source of truth for:
  - route-to-profile mapping
  - recommendation echo/source-cue text
  - deterministic helper output for previews and summaries
- `game.js` should not need new encounter hooks; existing room-3 entry/clear/source-cue moments are already sufficient.
- `scripts/regression-checks.mjs` should lock:
  - preview/profile routing for the four routes
  - recommendation echo/source-cue output for the four route/reason pairings
  - README/help copy updates that describe the expanded mapping

## Success Criteria

- `武备圣坛 / 烙痕圣坛` choices now preview routed encounters instead of stopping at HUD-only buffs.
- Resolved `压阵 / 离弦 / 余烬 / 血痕` routes expose the expected `缓冲 / 高压 / 淘金` room-3 profile.
- Matching recommendation reasons append the correct entry/clear/source cue for the routed room.
- Regression checks and README/help text describe the same shared contract.
