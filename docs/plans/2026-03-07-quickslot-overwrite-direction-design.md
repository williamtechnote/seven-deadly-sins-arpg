# Quick-Slot Overwrite Direction Marker Design

**Date:** 2026-03-07

**Problem**

The current full-quickbar overwrite toast names the replaced item, but when the old and new short labels differ it still makes the player infer the replacement direction. The remaining Active TODO asks for a clearer directional marker so the overwrite result can be read at a glance during the keyboard inventory loop.

**Brainstormed options**

1. Recommended: keep the existing toast shape and change the different-label overwrite copy to `旧短名 → 新短名`, while preserving the compressed same-label variant.
2. Use a longer sentence such as `HP 已替换为 ST`. This is explicit but heavier to scan in combat.
3. Add color or icon-only emphasis in the toast. This could be stronger visually, but it is harder to protect with CLI regression checks and broader than the current TODO.

**Chosen design**

Keep the current flow and only refine the copy for the different-label overwrite case:

- The shared quick-slot notice helper compares the replaced and assigned short labels.
- When the labels differ, the overwrite segment becomes `已覆盖 1 号槽位：旧短名 → 新短名`.
- When the labels match, the existing compressed `已覆盖同类 <短名>` copy stays unchanged.
- README, help overlay, TODO ordering, and regression checks all move to the new directional wording.

**This heartbeat's 3 sub-items**

1. Update the shared overwrite toast to show `旧短名 → 新短名` when full-quickbar replacement changes to a different short label.
2. Sync README, help overlay, and regression checks with the direction-marker wording.
3. Future follow-up: evaluate whether the overwrite segment should drop the redundant slot number once players are familiar with the rule.
