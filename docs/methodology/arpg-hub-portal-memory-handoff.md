# ARPG Hub Portal Memory Handoff

## Why This Exists

`上轮战报` keeps the previous route readable after a Boss victory, but it still lives in a static corner of the hub. The next decision happens at a portal. If the player has to look away from the portal to reconnect the last route with the next door choice, the memory bridge is present but not fully handed off.

## Practical Rule

When a hub already preserves one compact last-run recap, the next decision surface should be allowed to resurface that same recap in a smaller, more local form at portal hover.

The hover prompt should not replace the persistent summary. It should restate the part of the recap that matters at the choice point.

## Contract For This Repo

- Reuse `lastRunSummary` as the source of truth.
- Keep the portal-hover card compact and temporary.
- Include the next target first, then the last route recap, then the source choice.
- Hide the card when there is no meaningful prior run summary.
- Keep the wording shared so runtime, README, and regression checks stay aligned.

## Why It Matters

Planning works better when the player can connect past outcome and next commitment in the same glance. Feedback also teaches best when it reappears at the moment of the next decision, not only in a separate review area.

## Sources

- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
