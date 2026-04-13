# Portal Choice Summary Design

## Context

The committed repo already preserves short run-arc memory through Boss victory and back into the Hub via `上轮战报`. The remaining planning gap is portal focus: when the player actually walks up to a portal, the Hub still shows only the portal label plus the separate recap block. That makes the next selection moment feel like memory work again instead of a compact decision surface.

## Approaches Considered

1. Keep only the fixed `上轮战报` block.
   Simple, but it forces the player to look away from the active portal and reconstruct the next target in their head.

2. Add a focus-only `选门参考` card near the bottom-left of the Hub.
   Recommended. It keeps the established compact style, appears only when the player is near a portal, and can combine forward-looking target framing with the previous run recap in one place.

3. Add a larger run-history or boss-summary panel.
   Rejected. It adds new HUD weight and duplicates information the repo already expresses with short route/posture language.

## Recommended Design

When the player is within a short radius of the nearest portal, HubScene should show a compact `选门参考` card built by a shared helper in `shared/game-core.js`.

The card should follow this line order:

1. `目标 <sin + area>`
2. `门前 <boss posture cue>`
3. `上轮 <route recap or boss label>`
4. `源于 <choice label> · <recommendation reason>`

The helper should stay useful across three states:

- target + recap + source reason available: show the full ladder
- target + recap only: omit the missing source detail
- target only: still show `目标` and `门前`, so first-run portal focus is informative

If no portal is in focus, the card should hide entirely.

## Runtime Notes

- HubScene should keep the existing fixed `上轮战报` block.
- Portal overlap behavior should remain unchanged; the new card is read-only decision support.
- Portal focus should pick the nearest portal within a bounded radius, so multiple portals do not compete.

## Testing

- Add shared-helper coverage for full, partial, target-only, and hidden states.
- Add runtime regex coverage that HubScene creates a dedicated panel, rebuilds it from the shared helper, and only shows it for the nearest in-range portal.
