# ARPG Hub Portal Target Framing

## Why This Exists

This repo already preserves the last route across room-3 payoff, Boss resolution, hub return, and portal focus. The next missing signal is forward-looking: once the player stands in front of a portal, the UI should help answer what kind of boss posture the next run demands, not only what the last run did.

In a short-run ARPG, hub planning is strongest when past outcome and next threat are visible in the same decision surface.

## Practical Rule

When the player focuses a portal, show one compact target cue that frames the upcoming boss in playable terms.

That cue should answer:

1. what boss segment the player is about to enter
2. what posture or pacing the fight is likely to reward
3. without replacing the last-run memory bridge that explains how the previous route ended

## Contract For This Repo

- Keep the cue inside the existing `选门参考` surface.
- Prefer one short line such as `门前 稳拍反制` over a larger boss summary card.
- Reuse stable wording per boss so repeat visits build memory.
- Allow the portal card to stay useful even when there is no `上轮战报` yet.
- Keep the helper shared so runtime, README, and regression checks stay aligned.

## Recommended Cue Shape

- `门前 稳线读招`
- `门前 追影拆位`
- `门前 回体扛压`
- `门前 稳拍反制`

These cues should frame the next planning problem, not describe the full boss moveset.

## Sources

- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
