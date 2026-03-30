# Action HUD Ready Flash Design

**Context**

The combat action HUD now predicts post-roll states with copy like `翻滚中 -> 就绪` and `翻滚中 -> 差15体/1.0s`, which fixes the biggest ambiguity during dodge lockout. The remaining gap is timing clarity at the exact recovery boundary: when an action transitions from `翻滚中 -> 就绪` into actual `就绪`, the player still has to notice a plain text swap in peripheral vision.

**Approaches**

1. Add a short HUD text flash when an action newly becomes `就绪`. Recommended.
   This keeps the existing copy, adds no extra HUD rows, and makes the recovery endpoint visible without requiring the player to reread the full line.
2. Add a persistent icon or badge beside ready actions.
   This could work, but it adds more UI surface and complicates layout for a problem that only matters at the transition moment.
3. Add a camera flash or character VFX when dodge lockout ends.
   The signal would be louder, but it stops being action-specific and risks feeling like combat noise instead of input affordance.

**Recommendation**

Use approach 1.

- Keep the current shared text summary as the source of truth for labels.
- Add a shared metadata helper that reports which actions are currently `就绪`.
- In `game.js`, compare the current ready map with the previous frame and trigger a brief highlight only for actions that just became ready after being blocked.
- Keep the effect short and additive so non-ready states still use the existing muted styling.

**Testing**

- Add a failing regression for the shared metadata helper to prove it marks `attack` / `special` / `dodge` readiness correctly for both plain and post-roll-ready states.
- Add a source-hook regression asserting `game.js` stores previous readiness and drives `actionText` highlight styling from the shared metadata.
- Sync README copy so the player-facing docs mention the short readiness flash after roll lockout ends.
