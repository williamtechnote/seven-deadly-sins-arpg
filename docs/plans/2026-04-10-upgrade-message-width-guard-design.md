# Upgrade Message Width Guard Design

## Context

The blacksmith upgrade path still emits raw bottom-lane strings such as `强化成功! 消耗2个暴怒之精华` and `材料不足! 需要2个暴怒之精华`. That matches the upgrade contract, but once the required essence name gets long, the toast can overflow horizontally and push the actual success/blocker conclusion out of the readable center lane.

## Options

1. Clamp the whole message as one string.
Rejected: right-edge truncation would hide the material cost/blocker detail first, which is the main information the toast needs to preserve.

2. Split upgrade feedback into two lines or a dedicated panel.
Rejected: too heavy for one heartbeat and inconsistent with the repo's compact blacksmith feedback pattern.

3. Add shared upgrade-message helpers with ordered fallback variants.
Recommended: it matches the existing craft-message strategy, lets `BlacksmithScene` pass real Phaser text measurement, and keeps the message contract deterministic under narrow widths.

## Chosen Direction

Add shared `buildWeaponUpgradeFailureMessage` and `buildWeaponUpgradeSuccessMessage` helpers in `shared/game-core.js`. They should:

- derive the full message from the existing upgrade result/check data
- compact long essence names before removing the consume/blocker count
- keep `强化成功!` / `材料不足!` at the front when width gets tighter again
- accept the same `maxWidth` plus `measureTextWidth` contract already used by blacksmith crafting feedback

`BlacksmithScene` should only route upgrade success/material-failure to those helpers with the existing `craftMessage` measurement path. README and the in-game help copy should describe the new narrow-width fallback so the contract stays visible.

## Success Criteria

- Upgrade success toasts keep `强化成功!` and the essence spend readable under narrow widths.
- Upgrade material blockers keep `材料不足!` and the required count readable under narrow widths.
- The width-fitting logic lives in shared helpers, not ad-hoc scene string slicing.
- Regression coverage locks both the helper variants and the scene hooks that pass Phaser-backed measurement into them.
