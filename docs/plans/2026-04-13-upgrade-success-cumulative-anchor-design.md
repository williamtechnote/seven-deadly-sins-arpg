# Upgrade Success Cumulative Anchor Design

## Context

The blacksmith upgrade success receipt now does the important wide-screen job: it can show `Lv.2→Lv.3`, the current-click payoff, and the weapon's cumulative post-upgrade state in one line. That closed the biggest readability gap, but it also exposed the next one. At medium widths, the helper currently drops straight from the full cumulative summary to a payoff-only receipt.

That jump is too steep for the repo's current information-hierarchy goals:

- reward feedback should answer both `what did this click do?` and `what does this weapon look like now?`
- width ladders should compact meaning before they delete meaning
- shared helper contracts should preserve the strongest player-facing anchor for as long as layout allows

For later upgrades, the missing middle step is a compact cumulative anchor.

## Options

1. Keep only the full cumulative summary and then drop straight to payoff-only.
Rejected: this preserves the widest case, but medium widths still lose the post-upgrade whole-state too early.

2. Replace the current-step payoff with a cumulative-only message at medium widths.
Rejected: the current-click payoff remains the sharpest success confirmation and should stay ahead of cumulative context.

3. Insert an intermediate cumulative-anchor fallback between the full cumulative summary and the existing payoff-only ladder.
Recommended: it keeps the success conclusion and `Lv.X→Lv.Y` anchors first, preserves at least one compact view of the weapon's new whole-state, and reuses existing shared benefit-summary segments instead of inventing new math.

## Chosen Direction

Extend `buildWeaponUpgradeSuccessMessage` with one or two medium-width variants for later upgrades, for example:

- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计+9 / 特攻-0.3s`
- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9`

The ladder should still prefer the full cumulative summary when it fits, but medium widths should now keep a compact cumulative anchor before falling back to payoff-only variants.

## Design Notes

- Build the new fallback from the existing cumulative benefit summary inside `shared/game-core.js`.
- Preserve ordering: `强化成功!` and `Lv.X→Lv.Y` stay first, then `本次...`, then the compact cumulative anchor.
- Keep first-upgrade receipts unchanged; the new branch is only useful when cumulative state adds information beyond the current click.
- README and help overlay should explain that later upgrade receipts now keep a compact cumulative anchor at medium widths before dropping to payoff-only copy.

## Success Criteria

- A later upgrade such as `Lv.2→Lv.3` still shows the full cumulative receipt on wide widths.
- A medium width returns a compact cumulative anchor instead of dropping straight to payoff-only.
- Narrow fallbacks still preserve `强化成功!`, `Lv.X→Lv.Y`, and the current-step payoff ladder.
- Regression coverage locks helper output plus README/help wording and the shared source structure.
