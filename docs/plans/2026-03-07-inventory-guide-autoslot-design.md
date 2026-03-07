# Inventory Guide Autoslot Design

**Context**

Current gameplay already lets players click a consumable in the backpack to place it into the first empty quick slot, but that affordance is mostly implicit. The current heartbeat TODO asks to make the keyboard-friendly usage path easier to discover.

**Approaches**

1. Update only docs.
   Fastest, but the behavior remains unverified in code and can silently drift.
2. Add a small shared helper plus guide/docs/tests.
   Recommended. It keeps the existing behavior, makes the auto-fill rule explicit, and gives the regression script a stable hook.
3. Add a larger UI onboarding flow.
   Higher discoverability, but too large for a single heartbeat cycle.

**Recommended Design**

Keep the current backpack-click behavior, extract the "first empty quick slot or slot 1 fallback" rule into a shared helper, and use that helper from the inventory scene. Update the in-game help overlay to explain the rule, then sync README and regression coverage around the keyboard loop: `Tab -> click consumable -> 1-4 use`.

**Testing**

Add a regression test for the new helper and source-hook assertions for the updated guide/README copy so the onboarding text stays aligned with the implemented behavior.
