# Backpack Prep Review Design

## Problem

The hub prep ladder already reaches portal focus, blacksmith crafting, and merchant buying, but it still goes silent at the last explicit pre-run verification surface: the backpack. If the player opens inventory to sanity-check consumables and quick slots, the prep problem becomes memory work again.

For this heartbeat, the higher-value move is not another run-phase cue. It is closing the hub-side ladder by making the backpack answer three concrete questions at once: what item the next boss posture wants, whether it is already owned, and whether it is actually ready on a quick slot.

## Approaches Considered

### 1. Leave the backpack unchanged

- Pros: zero new UI.
- Cons: the final consumable check stays disconnected from the rest of the hub prep ladder.

### 2. Only highlight the recommended consumable row

- Pros: minimal implementation.
- Cons: still hides whether the player owns enough stock or has the item ready on a quick slot.

### 3. Add a compact backpack `备战复查` block plus row highlight

- Pros: closes the hub ladder with one readable review surface, reuses the same boss-aware mapping, and stays deterministic enough for regression checks.
- Cons: requires one more shared helper and a small inventory layout shift.

## Recommendation

Use approach 3.

The backpack should render a compact `备战复查` block when there is a recent boss-aware portal target. That block should keep the same target framing, convert it into one consumable review line, and expose:

- recommended item
- owned count
- quick-slot readiness

The consumable grid should also highlight the matching row so the review changes the decision surface instead of becoming passive copy.

## Contract

- Reuse the same boss-aware consumable mapping as blacksmith and shop.
- Keep the review compact: title plus two short lines.
- Show `背包已有N` when stocked, otherwise `背包暂无`.
- Show `快捷栏N` only when the recommended item is both owned and already slotted; otherwise show `快捷栏待补`.
- Keep the inventory grid order unchanged.
- Only highlight the recommended consumable row; no new modal or tutorial flow.

## Testing

- Add shared helper assertions for stocked/slotted and missing/unslotted cases.
- Add InventoryScene source-hook assertions for helper wiring, layout shift, and row highlight.
- Add one README assertion so the backpack review contract stays documented.

This heartbeat is running in required automation, so the design is treated as self-approved for execution.
