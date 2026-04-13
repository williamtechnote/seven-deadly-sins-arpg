# Shop Prep Recommendation Design

## Problem

The repo now carries boss posture from portal focus into blacksmith crafting, but the final hub purchase surface is still silent. Once the player opens the merchant, the same prep question becomes memory work again even though that surface already asks for a consumable-spend decision.

For this heartbeat, the higher-value move is not another reminder cue inside a run. It is extending the existing prep ladder into the last explicit buy/no-buy surface before the player leaves the hub.

## Approaches Considered

### 1. Stop at portal focus + blacksmith

- Pros: keeps the ladder very light.
- Cons: leaves the merchant as a disconnected gold-spend surface, so pre-run consumable buying still depends on recall instead of readable context.

### 2. Add a larger prep panel that summarizes every hub surface

- Pros: more complete overview.
- Cons: bloats the hub with a new explanatory surface and duplicates existing compact cues.

### 3. Reuse the same boss-aware consumable mapping inside the merchant

- Pros: extends the ladder into a meaningful decision surface, reuses existing prep vocabulary, and can be proven with deterministic helper/runtime checks.
- Cons: needs one more shared helper plus row/button highlighting in the shop.

## Recommendation

Use approach 3.

The merchant should show a compact `采购参考` block when the hub has a recent boss-aware portal target. That block should keep the target line, reuse the same consumable mapping as the blacksmith, and highlight the matching purchase row/button so the recommendation changes the decision surface instead of adding passive copy.

## Contract

- Shared mapping remains the source of truth in `shared/game-core.js`.
- Merchant copy stays compact: title plus two short lines.
- The helper stays silent when there is no boss-aware portal target.
- The merchant highlights the recommended consumable row and purchase button, but does not reorder the catalog.
- This heartbeat reuses the existing two consumables only: `净化药剂` and `狂战油`.
- Blacksmith behavior stays intact; the new merchant helper should align with it instead of forking vocabulary.

## Testing

- Add shared regression coverage for a new merchant prep recommendation helper.
- Add runtime regex checks for ShopScene rendering and highlight wiring.
- Keep the required final verification command unchanged.

This heartbeat is running in required non-interactive automation, so the design is treated as self-approved for execution.
