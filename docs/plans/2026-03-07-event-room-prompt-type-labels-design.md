# Event Room Prompt Type Labels Design

**Context**

`TODO.md` only had one remaining active event-room item: the shrine proximity hint still uses the generic `按F抉择` string even when the room type is already known. The HUD, choice panel, and resolved world label already expose compact room-type language (`交易 / 治疗 / 效果`), so the approach prompt is now the last inconsistent copy in that flow.

**Approaches**

1. Recommended: add a pure shared helper in `shared/game-core.js` that maps an event-room summary to the correct proximity hint (`按F交易` / `按F治疗` / `按F效果`) with `按F抉择` as the unknown fallback, then render that string from `game.js`. This keeps copy rules centralized and regression-testable.
2. Scene-only mapping: hard-code the prompt text inside `_updateRunEventEncounterHint()`. This is slightly faster, but it duplicates the room-type rules in UI code and makes future copy changes easy to miss.
3. Full prompt redesign: add a two-line prompt with room name, icon, and state. This would improve presentation, but it expands scope for a heartbeat that only needs to complete the missing short-tag consistency work.

**Chosen Design**

- Add a shared prompt-label helper that reuses the existing resolved-prefix mapping for `trade`, `healing`, `riskBuff`, and `blessing`.
- Keep unknown or future room types on the stable fallback `按F抉择`, so prompt copy stays safe when new event prototypes land before UI copy is updated.
- Update the in-scene proximity indicator to refresh from that helper whenever the player enters range.

**Testing**

- Extend `scripts/regression-checks.mjs` first with failing assertions for known-room prompt labels and the unknown-room fallback.
- Keep the required heartbeat verification command unchanged after implementation.
