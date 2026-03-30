# Action HUD Stamina ETA Design

**Context**

The bottom-left combat action HUD already tells the player whether normal attack, special attack, and dodge are on cooldown or blocked by stamina. When stamina is the only blocker, it currently stops at `差X体`, which still forces the player to guess whether the wait is effectively immediate or long enough to reposition first.

**Approaches**

1. Inline ETA on the existing readiness line. Recommended.
   Add a short recovery estimate next to the stamina gap, such as `差2体/0.1s`, using the current stamina regeneration rate after run modifiers.
2. Push the ETA into the low-stamina warning banner.
   This keeps the action row shorter, but the banner is global and does not answer which action becomes available first.
3. Add a separate stamina-tick forecast widget near the stamina bar.
   This is richer, but it costs more HUD space and is harder to cover with the existing lightweight regression suite.

**Recommendation**

Use approach 1. It extends an already trusted HUD line, keeps the answer next to the blocked action, and can be verified with deterministic helper tests plus a source-hook check in `game.js`.

**Design**

- Extend the shared combat-action HUD helper so stamina-gated actions can optionally receive a `staminaRegenPerSecond` input.
- When cooldown is still active, keep the current cooldown label priority.
- When stamina is insufficient and regen is positive, format the label as `差X体/0.1s`.
- When stamina regen is zero or invalid, keep the existing `差X体` fallback.
- In `UIScene.updateHUD`, pass the effective regen rate derived from `GAME_CONFIG.PLAYER.staminaRegen` and the current run-effect multiplier.

**Testing**

- Add failing regression assertions for the new helper output.
- Add a fallback assertion for zero-regen scenarios.
- Add a source-hook assertion proving `game.js` passes the live regen rate into `buildCombatActionHudSummary`.
