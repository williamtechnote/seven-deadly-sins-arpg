# ARPG Threshold/Status Boss Posture Tiebreaker

## Why This Exists

This repo already lets boss posture break ties for prayer, weapon-routing, and action-routing shrines. The remaining gap is `命途圣坛 / 烙痕圣坛`: when HP is between thresholds or the live combat state is not strongly directional, those pairs can still fall back to generic threshold/loadout notes even if the target boss clearly favors a steadier or more aggressive posture.

In a short-run ARPG, that makes the planning ladder feel inconsistent. The player can read boss posture in portal focus and in several shrine footers, but the ladder goes quiet again on threshold/status routes right when it should help close a decision.

## Practical Rule

Boss posture may act as a tiebreaker for threshold/status shrines only when the route already has a credible systemic fit:

1. `命途圣坛` has no stronger current-HP threshold signal yet.
2. `烙痕圣坛` still matches the currently equipped status-capable weapon.
3. The chosen reason can cash out into the existing routed-encounter echo ladder.

If any of those fail, stay silent.

## Contract For This Repo

- `守心修习` may reuse `目标Boss更宜回体` when the target boss rewards steadier sustain.
- `绝境修习` may reuse `目标Boss更宜压线` when the target boss rewards committed pressure.
- `余烬修习` may reuse `目标Boss更宜控场` when the target boss rewards a calmer stabilize-first room.
- `血痕修习` may reuse `目标Boss更宜压线` when the target boss rewards immediate pressure follow-up.

These reasons should not create a second vocabulary. They should reuse the same boss-posture contract already visible in portal focus and other shrine footers.

## Implementation Rule

- Keep the posture tiebreaker in `shared/game-core.js`.
- Let the recommendation helper stay conservative: threshold, status-fit, and live-state reasons still outrank boss posture.
- Reuse the existing routed encounter echoes:
  - `守心稳场`
  - `压线抢势`
  - `灼烧稳场`
  - `挂血抢势`

## Sources

- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Feedback in games - how to design rewards and punishments?" (2022): https://www.gamedeveloper.com/game-platforms/feedback-in-games-how-to-design-rewards-and-punishments
