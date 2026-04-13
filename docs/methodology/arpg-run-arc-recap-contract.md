# ARPG Run-Arc Recap Contract

## Why This Exists

This repo already makes shrine routes readable at choice time, settlement, room-3 entry, and room-3 payoff. The remaining gap is the handoff into the Boss door. If the route stops talking the moment room 3 is over, players can misread the whole system as a one-room gimmick instead of a short run segment they just shaped.

Game feedback guidance is consistent here: quick feedback is critical, but delayed consequences still need a clear signal so players know their earlier choice mattered and will keep mattering. For this project, the Boss-door moment is the cleanest place to deliver that signal because it is the transition from routed encounter into the next major skill check.

## Practical Rule

When a route changes the next combat segment, it should ideally land across these six beats:

1. choice preview
2. resolve receipt
3. room entry
4. first payoff beat
5. room clear recap
6. next-gate recap

The Boss door is that sixth beat in this repo.

## Contract For This Repo

- Reuse the resolved encounter profile as the source of truth.
- Prefer one short Boss-door label over another floating burst.
- Summarize the segment, not the room-only tactic.
- Keep the copy short enough to live beside the existing `Boss: <name>` label.
- Derive the Boss-door line from shared helpers so README, runtime, and regression checks stay aligned.

## Recommended Copy Shape

Use a compact two-part segment line:

- `缓冲路线 · 稳线迎战`
- `高压路线 · 顶压迎战`
- `淘金路线 · 带赏迎战`

This tells the player what kind of segment just happened and what posture it leaves them in before the boss.

## Sources

- Game Developer, "Feedback in games - how to design rewards and punishments?" (2022): https://www.gamedeveloper.com/game-platforms/feedback-in-games-how-to-design-rewards-and-punishments
- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
