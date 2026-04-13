# Threshold/Status Boss Posture Design

## Context

Boss posture already survives from portal focus into prayer, weapon-routing, and finer-grained action-route shrine footers. `命途圣坛 / 烙痕圣坛` are the obvious remaining gap: when HP is between thresholds or the current combat state is not strongly directional, these shrine pairs still stop at threshold/loadout notes instead of reusing the same target-boss framing.

That weakens the repo's current direction. The methodology docs keep pushing for one compact planning ladder rather than more isolated local copy.

## Options

1. Add brand-new `命途 / 烙痕` boss-specific copy.
Rejected: it would fragment the vocabulary and create another contract to maintain.

2. Let threshold/status routes reuse the existing boss-posture reasons only as a tiebreaker.
Recommended: it keeps the language stable, stays conservative, and lets the routed encounter echoes continue to answer the same "why now?" question.

3. Add no new recommendation logic and rely on the routed encounter profile alone.
Rejected: that keeps room-3 readable, but the shrine-choice moment still loses one of the repo's strongest planning aids.

## Chosen Direction

Extend boss-posture tiebreakers into `命途 / 烙痕` with conservative rules:

- `守心修习` may reuse `目标Boss更宜回体` for sustain-heavy bosses when HP is between threshold states.
- `绝境修习` may reuse `目标Boss更宜压线` for pressure-heavy bosses when HP is between threshold states.
- `余烬修习` may reuse `目标Boss更宜控场` when the equipped weapon can apply burn but the live state does not already force the stabilize recommendation.
- `血痕修习` may reuse `目标Boss更宜压线` when the equipped weapon can apply bleed but the live state does not already force the aggressive recommendation.

The existing routed encounter ladder should continue to translate those reasons into:

- `守心稳场`
- `压线抢势`
- `灼烧稳场`
- `挂血抢势`

## Design Notes

- Shared logic stays in `shared/game-core.js`.
- TDD-first: add failing recommendation and routed-echo cases before implementation.
- Keep older threshold/loadout reasons ahead of boss posture; the new branch only fills the quiet middle.

## Success Criteria

- `命途 / 烙痕` can surface boss-posture tie-breakers only in high-confidence quiet states.
- Existing stronger threshold/status reasons still win.
- Entry / clear / source cues accept the new persisted reasons without inventing a new echo ladder.
- README, help overlay, TODO, and regression checks describe the same contract.
