# ARPG Hub-Return Memory Bridge

## Why This Exists

This repo now carries route identity from shrine choice through room-3 payoff, room clear, Boss door, Boss opener, and Boss victory. The remaining gap is the return to the hub. Once combat ends and the player is back in a neutral planning space, the route can become memory work again instead of readable game state.

In a short-run ARPG, the hub is where players decide whether the last route was worth repeating, avoiding, or adapting. That means the hub needs one compact reminder of what just happened, not only the combat scene that already ended.

## Practical Rule

If a run-shaping choice survives into Boss victory, preserve one compact recap when the player returns to the hub.

That recap should answer:

1. what segment just ended
2. what route identity it produced
3. what choice started it

## Contract For This Repo

- Prefer one small `上轮战报` block over another full-screen summary.
- Reuse the shared route recap language already established at Boss victory.
- Include the source choice label so the player can connect outcome back to decision.
- Keep the block readable in the hub without competing with urgent combat HUD.
- Persist the recap through save/load so a hub return after transition or reload still preserves the memory bridge.

## Recommended Copy Shape

- `已讨伐 色欲 · 色欲魔窟`
- `淘金路线 · 带赏收官`
- `源于 豪赌 · 当前更宜稳押`

If no recommendation reason exists, keep the third line to the choice label only:

- `源于 豪赌`

## Sources

- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
- Game Developer, "Feedback in games - how to design rewards and punishments?" (2022): https://www.gamedeveloper.com/game-platforms/feedback-in-games-how-to-design-rewards-and-punishments
- Grid Sage Games, "Message Log" (2014): https://www.gridsagegames.com/blog/2014/02/message-log/
