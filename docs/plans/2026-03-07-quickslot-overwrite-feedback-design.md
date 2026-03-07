# Quick-Slot Overwrite Feedback Design

**Date:** 2026-03-07

**Problem**

The inventory auto-fill flow already tells the player which quick slot received a consumable, but when all four quick slots are occupied the fallback silently overwrites slot 1. The current toast `已自动装入快捷栏 1` does not explain that replacement happened, which makes the action feel risky.

**Brainstormed options**

1. Recommended: keep the current fallback behavior and extend the toast/help copy to explicitly say `已覆盖 1 号槽位` when no empty slot exists.
2. Add a confirmation modal before overwriting slot 1. This removes ambiguity but interrupts the `Tab -> 点击 -> 1-4` combat loop.
3. Auto-select a replacement candidate based on item type or last-used time. This is harder to predict and would need broader UX rework.

**Chosen design**

Keep the existing overwrite rule for speed and muscle memory, but surface it clearly:

- Shared helper builds overwrite-aware quick-slot notices.
- Inventory click path detects the "all slots occupied" case and requests the overwrite-aware notice.
- README/help text documents that a full quick bar overwrites slot 1 and shows the explicit toast wording.
- Regression checks guard the helper output, the runtime hook, and the updated docs/help copy.

**This heartbeat's 3 sub-items**

1. Add overwrite-specific quick-slot notice copy.
2. Sync README/help/regression checks with the full-quickbar overwrite rule.
3. Future follow-up: include the replaced item's short label in the overwrite toast.
