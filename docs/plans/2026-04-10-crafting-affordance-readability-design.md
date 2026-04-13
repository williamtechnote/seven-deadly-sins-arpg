# Crafting Affordance Readability Design

## Context

The blacksmith already resolves recipes deterministically in shared code, but the player still learns affordability only after pressing `[制作]` and reading an error toast. That creates the same decision-readability problem the methodology docs already call out for blocked event-room routes: the choice becomes legible too late.

## Options

1. Add better failure copy after clicking craft.
Rejected: the core problem is pre-click readability, not the wording of the failure toast.

2. Add a blacksmith-only tooltip panel with full recipe diagnostics.
Viable, but heavier UI work and lower ROI for a repo that already prefers compact, in-line decision labels.

3. Route crafting affordability through a shared helper and surface it inline on each row.
Recommended: it keeps the decision contract deterministic, exposes exact blockers before click, and can be locked with helper tests plus a narrow `BlacksmithScene` source hook.

## Chosen Direction

Add a shared crafting affordance helper that inspects player gold, recipe costs, and inventory, then returns a compact row-state contract:

- `可做xN` when the recipe is craftable, based on the tightest gold/material bottleneck
- `差15金` when gold is the first blocker
- `差1个嫉妒精华` style labels when a material is missing

`BlacksmithScene` should use that contract to:

- append the affordance label to each recipe row
- tint blocked `[制作]` buttons into a disabled color
- stop pointer clicks from attempting a blocked craft

The existing failure message remains as a fallback, but the primary decision signal moves before the click.

## Design Notes

- Shared logic in `shared/game-core.js` should own the affordance contract so it stays deterministic and regression-friendly.
- `game.js` should consume the helper for label text, button color, and click gating.
- README should mention that blacksmith recipes now show pre-click affordability and batch potential.

## Success Criteria

- Craftable recipes show `可做xN` from current gold/material limits.
- Blocked recipes expose whether gold or a specific material is missing before click.
- Disabled craft buttons no longer attempt blocked recipes.
- README documents the new blacksmith affordability/readability behavior.
