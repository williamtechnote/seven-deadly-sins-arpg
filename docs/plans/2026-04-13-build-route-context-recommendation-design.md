# Build-Route Context Recommendation Design

## Context

`武备圣坛 / 烙痕圣坛` already do two useful things:

- they preview a routed room-3 profile (`下间高压 / 下间淘金 / 下间缓冲`)
- they can persist a simple high-confidence reason (`当前持近战 / 当前持远程 / 当前武器可触发`)

That still leaves a design gap. The current recommendation helper mostly answers "what weapon am I holding?" rather than "what problem does this route solve right now?". The methodology docs for this repo explicitly prefer context-weighted choices that change the next combat decision within one room, not static loadout reminders.

## Options

1. Keep the current loadout-only recommendation.
Rejected: deterministic, but too shallow. It does not meaningfully distinguish "right weapon, wrong moment" from "right weapon, right moment".

2. Add contextual build-route reasons that require both loadout fit and live combat state.
Recommended: this reuses the existing recommendation contract, improves decision quality, and gives routed room-3 feedback a stronger why-now bridge without adding new runtime systems.

3. Add deeper routed encounter mutations per build route.
Rejected for this heartbeat: interesting, but higher scope and harder to lock with the current shared helper/test structure.

## Chosen Direction

Upgrade build-facing recommendations from static loadout checks to loadout-plus-context heuristics:

- `压阵修习` should prefer melee loadouts when the current combat state clearly wants a front-loaded pressure room and faster melee cadence.
- `离弦修习` should prefer ranged loadouts when the current state clearly wants a safer bounty chase and ranged special payoff.
- `余烬修习` should prefer burn-capable loadouts when the current state wants a breather/stabilize room.
- `血痕修习` should prefer bleed-capable loadouts when the current state supports immediate pressure/aggressive follow-up.

Use compact why-now reasons that already speak the routed encounter language:

- `近战更宜压线`
- `远程更宜追赏`
- `灼烧更宜稳场`
- `挂血更宜抢势`

The existing routed encounter feedback should continue to translate those persisted reasons into the same room-3 entry / clear / source cues rather than invent a second ladder.

## Design Notes

- Keep the heuristics in `shared/game-core.js` inside the shared recommendation helper.
- Reuse the existing action-state metrics (`attack/special/dodge` recovery and stamina pressure) instead of adding new state fields.
- Keep the encounter-routing contract deterministic:
  - recommendation helper decides whether there is a high-confidence build route
  - resolution persists the compact reason
  - room-3 entry / clear / source cue reuse the shared mapping
- Keep backward compatibility for older persisted reasons so existing saves/docs do not become incoherent.

## Success Criteria

- Build-route recommendations stay silent when the equipped weapon fits but the live combat state does not.
- High-confidence build-route scenarios emit the new contextual reasons instead of the old loadout-only text.
- Resolved room-3 entry / clear / source cue strings continue to land the expected build-route echoes.
- README, TODO, and regression checks describe the same contract.
