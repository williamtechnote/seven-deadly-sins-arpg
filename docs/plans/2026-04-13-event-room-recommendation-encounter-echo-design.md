# Event Room Recommendation Encounter Echo Design

## Context

The repo now preserves a compact high-confidence recommendation receipt after event-room resolution, so post-choice surfaces can keep messages like `治疗: 净泉啜饮 · 可净化2层`. That closes the gap between the choice panel and shrine settlement, but the routed room-3 combat beats still stop one step short: entry preview and clear recap only show the encounter profile label.

That leaves a remaining break in the information chain:

- the panel can say why a route fits the current run
- the resolved shrine can confirm the same reason after commitment
- but the next encounter still only says what kind of room it is, not why this route is being cashed in now

The methodology docs point toward the next gain: let rewards stay meaningful through the next combat decision, not only at selection time.

## Options

1. Recompute recommendation context from the live room-3 state.
Rejected: many reasons are supposed to have already changed the state by the time the player enters room 3. `净化` reasons disappear after resolution, and HP-threshold advice may drift after incidental damage or healing.

2. Paste the stored recommendation receipt directly onto every encounter preview / recap.
Rejected: some receipts are panel/HUD oriented rather than encounter oriented, so blindly appending them would create noisy or misleading combat copy.

3. Build a shared encounter-echo helper that only translates strong route+reason pairings into short entry / clear suffixes.
Recommended: it keeps the copy compact, lets the room-3 feedback stay tactical, and preserves the repo's shared-logic-first rule.

## Chosen Direction

Add a small shared helper that inspects the resolved event room, its routed encounter profile, and the persisted recommendation receipt, then returns a short encounter-specific echo only when the linkage is still strong.

Initial mappings should stay intentionally narrow:

- `净泉啜饮` / `战地净化包` with `可净化N层` and a `缓冲战` route can echo a stabilization reason such as `净化后稳场`
- `活泉灌注` with `缺口更大` and a `缓冲战` route can echo a recovery reason such as `回线稳场`
- `豪赌` with `当前血线更能承受` and a `淘金战` route can echo a chase reason such as `血线够追赏`
- `命途圣坛` should gain encounter routing so `绝境修习` / `守心修习` can resolve to `高压战` / `缓冲战`, enabling echoes like `压线抢势` / `守心稳场`

Entry and clear builders should keep the existing route/tactical copy first, then append the short echo:

- `缓冲战 · 双拍缓冲 · 净化后稳场`
- `高压战 · 三向成压 · 压线抢势`
- `淘金战 · 后排赏金 · 血线够追赏`

If a route has no persisted recommendation or the recommendation is not meaningfully encounter-specific, entry / clear feedback should remain unchanged.

## Design Notes

- Keep the new logic in `shared/game-core.js`; `game.js` should only consume the shared entry / clear strings.
- Extend `getRunEventRoomChoiceIntentTags(...)` just enough for `命途圣坛` to map into the existing encounter profile system.
- Avoid storing another persisted field. The existing `selectedChoiceRecommendationReason` is enough if the shared helper interprets it carefully.
- Prefer explicit per-choice matching over clever text heuristics. The allowed echoes should be deterministic and auditable.

## Success Criteria

- Resolved event rooms with strong recommendation-to-encounter linkage show a compact reason echo in room-3 entry and/or clear feedback.
- Non-recommended or weakly related routes keep the current plain route feedback.
- `命途圣坛` now participates in encounter routing so its threshold recommendations can be cashed into room-3 feedback.
- Regression checks prove the shared helper output, runtime hooks, and README/help wording.
