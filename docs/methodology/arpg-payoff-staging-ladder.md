# ARPG Reward Payoff Staging Ladder

## Why This Exists

Players understand route identity best when the game confirms it across a short ladder instead of only at selection time or only inside the next fight.

For this repo, the common failure mode is a missing middle step: the player chooses a route, sees a settlement delta, and then must remember what `下间缓冲 / 下间高压 / 下间淘金` implied until room 3 actually starts.

## The Ladder

1. **Decision**
   The choice panel explains why a route is better now.

2. **Receipt**
   Settlement feedback confirms what was chosen and what changed numerically.

3. **Staging**
   Before the next fight begins, the HUD or resolved room summary should restate the tactical contract in a compact way.

4. **Trigger**
   The next combat room pays the route off at the exact authored moment: entry, pressure contact, stabilize beat, or bounty kill.

5. **Recap**
   Room clear closes the loop so the player can map the route to the full combat sequence they just played.

## Practical Rules

- The staging step should reuse the same vocabulary as entry/trigger/recap cues.
- Staging copy should be compact enough for HUD lines and settlement floaters.
- If a recommendation reason is still relevant, staging should carry it through the same encounter phrase rather than inventing a second explanation.
- Unknown or legacy room types should degrade gracefully and skip the staging line instead of emitting generic filler.

## Repo Guidance

When a route already has:

- a compact selected-route receipt,
- a shared encounter profile,
- and authored entry / source cue / clear recap helpers,

the next high-ROI improvement is usually a staging helper in `shared/game-core.js` that bridges the resolved event room to the next combat room without waiting for room entry.
