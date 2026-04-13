# ARPG Boss Posture Recommendation Contract

## Why This Exists

This repo already uses compact boss posture in portal focus and in a few event-room recommendation footers. Once that pattern proved readable, the next gap was consistency: the same target-Boss posture should also help break ties inside finer-grained action-route shrines, not only broad sustain / dodge / ranged lanes.

If boss posture only appears in hub copy, players lose that framing once the next shrine decision appears. If it overrides stronger live-state signals, the recommendation stops feeling honest.

## Practical Rule

Boss posture is allowed to act as a recommendation tiebreaker only when all three conditions hold:

1. the visible two-choice panel has no stronger HP / stamina / cooldown / loadout reason already
2. the posture can be expressed with the repo's existing short vocabulary
3. the same reason can cash out into the routed encounter ladder after the choice is made

## Vocabulary For This Repo

- `目标Boss更宜回体`
- `目标Boss更宜稳拍`
- `目标Boss更宜追后`
- `目标Boss更宜控场`
- `目标Boss更宜借势`
- `目标Boss更宜连段`
- `目标Boss更宜追猎`

These reasons should stay short enough for shrine footers, receipts, HUD summaries, and routed encounter cues.

## Implementation Contract

- Prefer shared helpers over scene-local Boss copy.
- Keep boss posture as a fallback, not a replacement for live-state weighting.
- Reuse existing routed encounter echoes whenever possible.
- Add new boss-aware routes only when the payoff can still be proven by deterministic regression checks.

## Recommended Ladder

For this repo, boss posture should read as one continuous ladder:

1. `选门参考` frames the upcoming fight
2. event-room footer uses the same posture as a tiebreaker when local state is otherwise quiet
3. resolved receipt preserves that reason
4. routed encounter entry / clear / source cue turns it into a short combat-facing echo
