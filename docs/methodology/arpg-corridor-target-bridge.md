# ARPG Corridor Target Bridge

## Why This Exists

This repo already carries boss posture from portal focus into a run-start cue, a first-combat wake-up cue, and the first unresolved shrine prompt. The remaining early-run gap is the quiet transition after a combat-opening room is cleared but before the player reaches the first shrine surface.

For a short-run ARPG, that corridor is still part of the planning loop: the player has survived the first pressure beat, but the next actionable decision has not arrived yet. A lightweight bridge keeps the chosen posture alive without escalating into persistent HUD.

## Practical Rule

If a run opens with combat before the first shrine, restate the current target posture once at the first calm transition after that combat, not as another permanent overlay.

In this repo, the first corridor after room 1 is the right surface because it is:

- later than the combat wake-up cue, so it does not duplicate the same pressure beat
- earlier than shrine proximity, so it still bridges the silent gap before the first route decision
- low-noise compared with room-clear drops and hit feedback

## Contract For This Repo

- Prefer one short floating cue such as `过门 稳拍反制` or `过门 回体扛压`.
- Fire it only once per run, only on seeds that opened with combat, and only after room 1 is fully cleared.
- Trigger it on first entry into the room-1 -> room-2 corridor rather than on enemy death bursts.
- Reuse the same shared boss-posture vocabulary already used by portal focus, run start, first combat, and shrine reminders.
- Do not add a persistent Boss panel, permanent area subtitle, or redundant room-clear banner just to preserve the same posture.

## Sources

- Game Accessibility Guidelines, Intermediate cognitive guidance: indicate or allow reminder of current objectives during gameplay. https://gameaccessibilityguidelines.com/intermediate/
- Game Developer, "Planning - The Core Reason Why Gameplay Feels Good" (2017): https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
