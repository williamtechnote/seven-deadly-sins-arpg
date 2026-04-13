# Upgrade Success Cumulative Receipt Design

## Context

The blacksmith upgrade receipt already answers two important questions on success: which level transition just happened, and what this single click gained. That solved the immediate `升了什么` gap. The remaining weakness shows up on later upgrades, especially `Lv.2→Lv.3`: the player still needs to scan back to the left-side weapon row to confirm the weapon's new whole-state after the purchase.

The repo's methodology docs push against that extra scan:

- reward legibility should be visible in the next combat decision, not hidden behind another UI pass
- HUD/message hierarchy should answer what changed because of the last action
- strong run/shop feedback should reuse shared helpers and deterministic contracts

For the blacksmith, the missing question is no longer just `what did this click add?`; it is `what does this weapon look like now?`

## Options

1. Keep the current success toast payoff-first and leave cumulative state to the row summary.
Rejected: preserves the single-step payoff, but still forces a second scan right after the purchase.

2. Replace the current-step payoff with only the cumulative total.
Rejected: the click-level gain is still the sharpest success anchor and should not be sacrificed for total-state copy.

3. Extend the success-helper ladder so wider widths can append a cumulative post-upgrade summary after the current-step payoff.
Recommended: it keeps the receipt outcome-first, reuses the existing shared benefit-summary helper, and makes the final weapon state readable without inventing another panel.

## Chosen Direction

Extend `buildWeaponUpgradeSuccessMessage` so later upgrades can build a wider ladder like:

- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 / 特攻-0.3s / 体耗-3 · 消耗2个暴怒之精华`
- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 / 特攻-0.3s / 体耗-3`
- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 消耗2个暴怒之精华`
- existing narrower payoff-first fallbacks

Key rules:

- only append the cumulative tail when it adds new information beyond the current-step payoff
- keep `强化成功!` and `Lv.X→Lv.Y` ahead of the wider summary tail
- preserve the current narrow-width ladder so the success conclusion does not regress on tight layouts

## Design Notes

- The cumulative tail should come from `buildWeaponUpgradeBenefitSummary(weaponKey, 1, toLevel, ...)` with `labelPrefix: '累计'`.
- The helper remains the source of truth; `game.js` should keep consuming the same shared message builder through the existing measured-width path.
- README and help-overlay copy should explain that wider success toasts can now confirm the weapon's new whole-state, while narrow widths still keep the transition/payoff ladder first.
- The TODO follow-up should broaden back toward encounter readability rather than staying indefinitely inside the blacksmith lane.

## Success Criteria

- A later upgrade such as `Lv.2→Lv.3` can show both `本次` payoff and `累计` post-upgrade total on wider widths.
- First upgrades do not gain redundant cumulative copy when the total equals the current-step payoff.
- Existing narrow success fallbacks still preserve `强化成功! Lv.X→Lv.Y` ahead of longer details.
- Regression coverage locks the helper output, README wording, help-overlay wording, and shared source structure.
