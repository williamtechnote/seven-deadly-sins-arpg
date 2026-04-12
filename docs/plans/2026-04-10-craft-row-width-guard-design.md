# Craft Row Width Guard Design

## Context

The blacksmith recipe row now exposes four useful pre-click signals at once: recipe cost, `拥有`, affordability (`可做xN` / `差15金`), and quick-slot preview (`入1` / `覆盖1：狂战→净化`). On narrower windows, the new copy can extend into the `[制作]` lane or hide the most important decision cues at the tail of the string.

## Options

1. Clamp the whole row as one string.
Rejected: this protects width, but it truncates the right edge first and therefore tends to hide the new affordance and quick-slot preview that the recent heartbeat work just added.

2. Move recipe details into a second tooltip or panel.
Rejected: it solves width pressure by adding more UI, which is too heavy for a single heartbeat and fights the repo’s preference for compact inline readability.

3. Add a shared row-label helper with a fallback ladder.
Recommended: it keeps the behavior deterministic, lets `BlacksmithScene` pass actual Phaser-measured width, and can explicitly preserve the highest-value pre-click cues while collapsing lower-priority copy first.

## Chosen Direction

Add a shared `buildCraftRecipeRowLabel` helper in `shared/game-core.js` that:

- builds the row from existing shared affordance and quick-slot-preview helpers
- measures candidate strings against a caller-provided width budget
- drops `拥有` before it drops the affordance/preview cues
- compacts long material names before it gives up on the pre-click status labels
- drops the quick-slot preview only after the affordability cue no longer fits alongside the base recipe identity

`BlacksmithScene` should own only the Phaser measurement hook and the row-width budget. README should document the new fallback behavior so the contract stays discoverable.

## Success Criteria

- Craft rows stop extending into the `[制作]` lane at the current blacksmith layout width.
- `可做xN` / `差15金` remains visible longer than `拥有`.
- Long material names compact before the row loses the pre-click readability contract entirely.
- Regression coverage locks both the shared helper output and the runtime hook that passes actual measured width.
