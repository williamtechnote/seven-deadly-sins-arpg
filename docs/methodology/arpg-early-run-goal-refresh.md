# ARPG Early-Run Goal Refresh

## Why This Exists

This repo already carries boss posture from hub portal focus into a one-shot run-start cue. The next risk is memory decay: once that cue fades, the player can reach the first shrine with no lightweight reminder of what the upcoming boss is asking for.

For a short-run ARPG, the first interactive decision after a scene transition is the highest-value place to restate the current objective. That keeps planning alive without paying the cost of a new persistent HUD block.

## Practical Rule

When a run opens with a short target cue, restate that cue at the first actionable decision surface if it has not naturally paid off yet.

In this repo, the first unresolved event-room shrine is the best refresh surface because it is:

- already an interaction prompt the player must parse
- close to the run start, so the reminder is still relevant
- narrow enough to stay compact instead of turning into a second briefing screen

## Contract For This Repo

- Reuse the existing boss-posture vocabulary such as `稳线读招` / `回体扛压` / `稳拍反制`.
- Prefer one short reminder appended to the unresolved shrine approach surface.
- Keep the reminder out of resolved shrine labels so it does not linger after the first decision is complete.
- Avoid adding a permanent Boss HUD block just to preserve an early-run intention.
- Keep the reminder derived from shared helpers so runtime, README, and regression checks stay aligned.

## Recommended Copy Shape

- shrine prompt: `按F效果 · 稳拍反制`
- shrine world label: `祈愿圣坛 · 目标 稳拍反制`

The prompt stays action-first; the world label can afford the slightly more explicit `目标`.

## Sources

- Game Accessibility Guidelines, Intermediate cognitive guidance: indicate or allow reminder of current objectives during gameplay. https://gameaccessibilityguidelines.com/intermediate/
- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
