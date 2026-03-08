# Ultra-Compact Sidebar Overflow Fallback Design

**Context**

The fixed right sidebar already clamps widths, caps lines, and hides event-room plus run-modifier body text when the stack exceeds its safe bottom. The remaining open question is whether ultra-compact viewports should also hide the challenge summary, and whether there is any lower-risk layout reduction to try first.

**Approaches**

1. Tighten ultra-compact spacing first, then allow challenge hiding as a last resort.
   This reduces vertical waste before removing information. It preserves current regular/compact behavior and only changes the most constrained tier.

2. Hide the challenge summary immediately once ultra-compact mode is active.
   This is simpler but more aggressive. It removes challenge visibility even when spacing tweaks alone might have solved the overflow.

3. Add a replacement badge elsewhere in the HUD before allowing hide.
   This preserves access to the data but expands scope because it needs new HUD placement, copy, and regression coverage.

**Recommendation**

Take approach 1. In ultra-compact viewports, compress sidebar gaps and safe-bottom padding first. If the stack still does not fit, make `challengeText` droppable after `eventRoomText` and `runModifierText`. Leave any replacement badge as a follow-up evaluation item.

**Design**

- Keep regular and compact tiers unchanged.
- Add a shared helper for ultra-compact sidebar stack spacing so the collapse policy is data-driven rather than inlined in `UIScene`.
- Extend the priority layout inputs so `challengeText` becomes droppable only in ultra-compact mode, with lower collapse priority than event-room and run-modifier text.
- Update README/help text to document the new order: event room, then run modifiers, then challenge summary.
- Add regression coverage for both the shared spacing policy and the new hidden-key order.
