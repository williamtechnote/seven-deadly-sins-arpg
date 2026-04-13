# ARPG First-Combat Goal Refresh

## Why This Exists

This repo already carries boss posture from portal focus into a one-shot run-start cue and then into the first unresolved shrine surface. The remaining early-run gap appears on seeds that open with a normal combat room before the shrine: the run-start cue fades, the shrine reminder has not appeared yet, and the first pressure beat becomes memory work again.

For a short-run ARPG, the first combat wake-up is still a planning surface. It is the moment where portal framing should cash out into dodge, stamina, and spacing decisions without demanding a second always-on HUD block.

## Repo Rule

If a run can open on a combat beat before the first route decision, restate the current boss posture once when that first combat wakes up.

Keep the reminder:

- shorter than the run-start target cue
- tied to the first combat wake-up, not to every room clear or patrol trigger
- derived from the same shared boss-posture vocabulary already used by portal focus, run start, and shrine handoff

## Contract For This Repo

- Prefer one short floating cue such as `首战 稳拍反制` or `首战 回体扛压`.
- Fire it only once per run and only when room 1 combat actually wakes up.
- Keep shrine/world-label reminders unchanged; this cue only fills the gap before the first route choice.
- Do not add a persistent Boss panel, room banner, or extra always-on target label just to preserve the same posture.
- Keep the cue owned by shared helpers so runtime, README, help overlay, and regression checks stay aligned.

## References

- Game Accessibility Guidelines, Intermediate cognitive guidance: indicate or allow reminder of current objectives during gameplay. https://gameaccessibilityguidelines.com/intermediate/
- Thomas Grip, "Planning - The Core Reason Why Gameplay Feels Good": https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Using feedback as a teacher in video games": https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
