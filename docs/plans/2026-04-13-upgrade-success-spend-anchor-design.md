# Upgrade Success Spend Anchor Design

## Context

The current forge success ladder already preserves:

- success conclusion
- level transition
- current-step payoff
- cumulative anchor for later upgrades

The remaining readability gap is that later-upgrade receipts can drop the material-spend anchor too early once the cumulative summary starts to compress.

## Problem

For `Lv.2→Lv.3` style upgrades, a player often needs two confirmations at once:

1. what the whole weapon now looks like
2. what this click consumed

Today, medium-width later-upgrade toasts can preserve `累计+9 / 特攻-0.3s` but lose `消耗2个暴怒...`, which weakens the post-click contract.

## Approaches

### 1. Keep only the current ladder

- Pros: no extra complexity
- Cons: medium widths still lose the spend anchor too early

### 2. Add compact cumulative+spend variants before payoff-only fallback

- Pros: preserves both post-upgrade state and cost in one line
- Pros: minimal change to existing helper and tests
- Cons: adds a few more variant ordering branches

Recommended.

### 3. Prioritize spend over cumulative

- Pros: cost stays visible longer
- Cons: loses the "whole weapon now" confirmation too early

Rejected because the repo has already invested in cumulative anchors for later upgrades.

## Chosen design

Extend `buildWeaponUpgradeSuccessMessage` so later-upgrade receipts try these variants in order:

1. full payoff + full cumulative + full spend
2. full payoff + full cumulative + compact spend
3. full payoff + full cumulative
4. full payoff + compact cumulative + compact spend
5. full payoff + cumulative primary + compact spend
6. full payoff + compact cumulative
7. full payoff + cumulative primary
8. existing payoff-only ladder

## Testing

- Add a failing regression for a medium-width later-upgrade toast that should now keep `累计+9 / 特攻-0.3s · 消耗2个暴怒`
- Add a failing regression for a tighter later-upgrade toast that should still keep `累计伤害+9 · 消耗2个暴怒`
- Update README/help-overlay assertions to document the new ladder

## Implementation note

This is a shared-helper-first change in `shared/game-core.js`. `game.js` should continue consuming the helper unchanged unless the regression script proves a missing contract description in the help overlay or README text.
