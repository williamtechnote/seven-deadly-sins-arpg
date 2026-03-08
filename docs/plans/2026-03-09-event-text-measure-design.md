# Event Prompt Text Measurement Design

**Context**

The current active TODO still describes text measurement as a broad evaluation. The existing rollout already covers quick-slot fallback labels and inventory tooltip placement, but the shared clamp helper is still inventory-named and the event-room encounter prompt remains a world-space text node that can extend past the current camera view.

**Approaches**

1. Keep the current inventory-only scope
   Lowest effort, but the active TODO stays vague and the next text-measure rollout remains underspecified.

2. Only rename the existing helper
   Improves reuse at the shared-module level, but leaves an obvious on-screen prompt path without runtime measurement or viewport clamping.

3. Generalize the helper and immediately apply it to the event-room encounter prompt
   Recommended. It turns the TODO into two concrete heartbeat-sized items, reuses the existing Phaser/runtime split, and leaves one narrower follow-up for other longer HUD summaries.

**Chosen Design**

- Add a generic shared viewport text clamp helper that supports both screen-space overlays and world-space labels by accepting an optional viewport-left offset.
- Keep `getInventoryTooltipClampX` as a compatibility wrapper so existing inventory behavior and tests remain stable while other call sites gain a neutral helper name.
- In `LevelScene`, add a small hidden Phaser text measurer plus a width cache keyed by text/style role for world-space prompt labels.
- Use the cached runtime width to clamp the run-event encounter prompt within the active camera viewport whenever the prompt text is refreshed.
- Leave the event-room world label and other longer HUD summaries as the remaining TODO item for a later cycle.

**Testing**

- Add regression checks for the new shared clamp helper, including viewport-left handling for world-space labels.
- Add a source assertion showing `LevelScene` routes event-room prompt placement through a Phaser-backed measurement helper and the shared clamp helper.
- Update README and help-overlay assertions to document that event-room prompts now stay inside the viewport based on actual rendered width.
