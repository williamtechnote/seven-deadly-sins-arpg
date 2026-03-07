# Quick-Slot Overwrite Item Label Design

**Date:** 2026-03-07

**Problem**

The current full-quickbar toast already says slot 1 was overwritten, but it still forces the player to remember what used to be in that slot. The remaining Active TODO asks for the replaced item's short label so the overwrite result is explicit at a glance.

**Brainstormed options**

1. Recommended: keep the existing slot-1 fallback and append the replaced item's compact quick-slot label to the overwrite toast, README, and help copy.
2. Show both the new item and the replaced item in the toast. This is more explicit but increases toast length and competes with the quick keyboard loop.
3. Add an undo or confirmation affordance for slot-1 overwrites. This reduces risk further but is a broader UX change than the remaining TODO asks for.

**Chosen design**

Keep the current quick flow and only extend the overwrite message:

- The shared notice helper receives the replaced item key and resolves it through the existing quick-slot short-label table.
- Inventory auto-fill captures the slot-1 occupant before assignment so the toast can name the overwritten item.
- README/help copy explains that the full-quickbar toast now includes the replaced short label.
- Regression checks guard the shared string output, the runtime call site, and the updated docs/help text.

**This heartbeat's 3 sub-items**

1. Add the replaced-item short label to the full-quickbar overwrite toast.
2. Sync README/help/regression checks with the new overwrite-label wording.
3. Future follow-up: compress the overwrite toast when the new item and replaced item share the same short label.
