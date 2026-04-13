# ARPG Choice-Panel Target Footer

## Why This Exists

This repo already carries boss posture from hub portal focus into a one-shot run-start cue, then into the first unresolved shrine's approach prompt and world label. The remaining gap is the decision surface itself: if the player opens the shrine panel and there is no strong contextual recommendation yet, the footer can still fall back to a generic "press 1/2" instruction and drop the current goal at the exact moment the player must commit.

For a short-run ARPG, the first meaningful choice should preserve the current objective until a stronger system reason replaces it.

## Practical Rule

When a decision panel has no stronger contextual recommendation, use its quietest shared footer slot to restate the current target posture.

In this repo that means:

- recommendation footer wins when confidence is high
- otherwise the first shrine panel may fall back to a compact target line
- the fallback should stay shorter and more neutral than a true recommendation

## Contract For This Repo

- Reuse the same boss-posture vocabulary already established at portal focus, run start, and shrine approach.
- Keep the fallback neutral: `当前目标：稳拍反制`, not `建议`.
- Only show the target footer when `buildRunEventRoomChoiceRecommendation` returns no stronger result.
- Keep the logic in shared helpers so README, runtime, and regression checks stay aligned.
- Preserve the existing generic `按 1/2 选择，按 F 或 Esc 取消` footer when no boss-aware target exists.

## Recommended Copy Shape

- `当前目标：稳线读招`
- `当前目标：回体扛压`
- `当前目标：稳拍反制`

This line should answer "what am I preparing for?" rather than "which option should I pick?"

## Sources

- Game Accessibility Guidelines, "Indicate / allow reminder of controls during gameplay": https://gameaccessibilityguidelines.com/indicate-allow-reminder-of-controls-during-gameplay/
- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
