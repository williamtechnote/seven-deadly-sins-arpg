# Upgrade Material Anchor Design

## Context

The blacksmith success toast already does the most important new job: it confirms `Lv.1→Lv.2` and the current-step payoff in the same bottom-lane receipt. That closed the "what did I gain?" gap, but the purchase loop still has one missing axis: once the payoff text fits, the player no longer sees what this upgrade actually spent.

That matters because this repo's methodology docs keep pushing cost and reward to stay readable together. The upgrade action is a tiny economy decision, not just a stat popup. If the player buys a stronger hit but immediately forgets it cost `2 暴怒之精华`, the receipt still forces a glance back to the button lane or inventory to reconstruct the trade.

## Options

1. Leave the current payoff-first toast unchanged.
Rejected: preserves the recent gain, but still hides the resource trade on the successful path.

2. Replace payoff copy with spend copy once width allows.
Rejected: solves the cost question by re-opening the more important "what changed?" question.

3. Add a wider-width material anchor after the payoff anchor, then preserve the existing fallback ladder under tighter widths.
Recommended: keeps the receipt payoff-first, exposes the material trade when space exists, and avoids destabilizing the narrow-width contract that already protects `强化成功! Lv.1→Lv.2`.

## Chosen Direction

Extend `buildWeaponUpgradeSuccessMessage` so the widest success variant becomes `强化成功! Lv.1→Lv.2 · 本次伤害+4 / 特攻-0.2s / 体耗-2 · 消耗2暴怒之精华` (with the existing compact-material fallback available when needed). The fallback order should remain stable:

1. level transition + full payoff + material anchor
2. level transition + full payoff
3. narrower payoff-first variants
4. level transition only
5. spend-only fallbacks

This keeps information hierarchy aligned with the repo methodology:
- success outcome first
- reward/payoff second
- spend/cost third

`shared/game-core.js` should own the new variant ordering. `game.js` should keep consuming the helper through the existing measured-width message path. README and the in-game help copy should explain that wide success toasts now include the material anchor, while narrow widths still keep the level/payoff anchor ahead of the cost detail.

## Success Criteria

- Wide success toasts include both the payoff and the spent material anchor.
- Narrower widths still preserve the existing `Lv.1→Lv.2 · 本次伤害+4` and `Lv.1→Lv.2` fallbacks.
- Compact-material fallback (`暴怒`) remains available before the helper drops to spend-only copy.
- Regression checks cover the helper output plus README/help copy wording.
