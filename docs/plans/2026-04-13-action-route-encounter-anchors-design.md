# Action-Route Encounter Anchors Design

## Context

`武备 / 命途 / 烙痕` now prove that shrine identity gets much stronger once the selected route also reshapes room 3. The remaining action-shaping shrines already read well in HUD rows and hit-confirm payoff cues, but they still stop at the current room: the next encounter does not acknowledge `连斩 / 游步 / 镇步 / 破势 / 回息 / 借势 / 催锋 / 回身 / 追猎 / 调息`.

The repo methodology points at the same gap:

- room-to-room rewards should change the next combat decision quickly
- route identity should be readable without inventing a new subsystem
- the shared contract should stay deterministic and regression-friendly

## Options

1. Keep extending only recommendation-specific echoes.
Rejected: most of the remaining action shrines do not yet have high-confidence preview heuristics, so the next room would still stay silent for many valid route choices.

2. Add explicit encounter mappings plus baseline route anchors for the remaining action shrines.
Recommended: it reuses the existing room-3 entry / clear / source-cue hooks, gives more shrine choices immediate room-to-room payoff, and preserves the stronger recommendation-specific cues when they exist.

3. Rebuild the choice panel recommendation engine first.
Rejected for this heartbeat: it would require new live-state inputs and more heuristic tuning before any of the new routes could change the next fight.

## Chosen Direction

Extend the remaining action-shaping blessings into the routed room-3 contract:

- `连斩修习` -> `下间高压` with `连斩抢拍`
- `游步修习` -> `下间缓冲` with `游步整拍`
- `镇步修习` -> `下间缓冲` with `镇步控场`
- `破势修习` -> `下间淘金` with `破势追杀`
- `回息修习` -> `下间缓冲` with `回息稳场`
- `借势修习` -> `下间高压` with `借势重击`
- `催锋修习` -> `下间高压` with `催锋连段`
- `回身修习` -> `下间缓冲` with `回身整拍`
- `追猎修习` -> `下间淘金` with `追猎追赏`
- `调息修习` -> `下间缓冲` with `调息回线`

These anchors should reuse the same tactical moments as the current shared contract:

- `breather` routes fire on `stabilize`
- `pressure` routes fire on `engage`
- `windfall` routes fire on `bounty`

## Design Notes

- `shared/game-core.js` stays the source of truth for:
  - choice-key to encounter-profile mapping
  - baseline route anchor text and cue moment
  - fallback order: recommendation-specific cue first, baseline route anchor second
- `game.js` should not need new combat hooks; existing room-3 entry / clear / source-cue moments already cover the needed beats.
- `scripts/regression-checks.mjs` should lock:
  - encounter previews for the ten newly routed blessing choices
  - entry / clear / source anchors for each route when no recommendation reason exists
  - unchanged recommendation precedence for the older high-confidence routes
  - README/help copy updates that describe the expanded contract

## Success Criteria

- The remaining action-shaping shrine choices now preview `下间缓冲 / 高压 / 淘金`.
- Resolved room-3 entry / clear / source helpers expose short route anchors even when no recommendation receipt was stored.
- Existing recommendation-specific echoes still win when they apply.
- README, help overlay, TODO, and regression checks all describe the same shared encounter-anchor contract.
