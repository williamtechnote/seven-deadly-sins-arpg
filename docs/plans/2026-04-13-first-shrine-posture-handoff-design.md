# First Shrine Posture Handoff Design

## Goal

Keep the portal's target-Boss posture alive until the first actionable shrine decision by extending it into the first event-room approach prompt.

## Problem

The repo now carries boss posture through portal focus and a one-shot run-start cue, but that framing goes quiet again before the player reaches the first event room. That creates a short memory gap right before the first meaningful choice.

## Chosen Approach

Reuse the existing event-room prompt surface and append the same short boss cue there:

- `按F治疗 · 回体扛压`
- `按F效果 · 稳拍反制`
- `按F交易 · 追影拆位`

This keeps the ladder compact, actionable, and consistent with the portal card vocabulary.

## Rejected Alternatives

1. Add the cue to the first room title.
It lands earlier, but not at the moment of choice.

2. Add a persistent Boss HUD block.
It keeps the info visible, but adds UI weight that the current methodology explicitly tries to avoid.

## Implementation Notes

- Keep the copy generation in `shared/game-core.js`.
- Let `game.js` pass `bossKey` into the shared prompt helper wherever the shrine prompt is refreshed.
- Cover both helper output and runtime wiring in `scripts/regression-checks.mjs`.
- Update `README.md` to describe the new handoff without bloating the overview.
