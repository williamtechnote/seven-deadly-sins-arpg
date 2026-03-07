# Inventory Autofill Feedback Design

**Context**

The backpack already auto-places clicked consumables into the first empty quick slot, but players still need to infer where the item landed. The remaining heartbeat work is to surface that result immediately inside the inventory flow without expanding the feature into a larger onboarding system.

**Approaches**

1. Add scene-local text only.
   Fastest, but the slot label copy would be duplicated and harder to keep aligned with regression coverage.
2. Add a shared quick-slot feedback helper plus a transient inventory message.
   Recommended. It keeps the wording stable, makes the target slot explicit, and gives the regression script a durable hook.
3. Add persistent tutorial chrome around the quick slots.
   Higher visibility, but too large for a single heartbeat and unnecessary for the current TODO.

**Recommended Design**

Add a shared helper that converts the resolved quick-slot index into a compact message such as `已自动装入快捷栏 2`. Use it from `InventoryScene` when a consumable is clicked, show the message briefly near the bottom of the overlay, and keep the existing auto-fill behavior unchanged. Sync README and regression checks so the prompt path and its wording remain documented.

**Testing**

Add a regression for the new helper output, source-hook assertions for the inventory scene message path, and README assertions for the new feedback copy.
