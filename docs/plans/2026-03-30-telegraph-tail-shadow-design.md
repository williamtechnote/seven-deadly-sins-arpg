# Telegraph Tail Shadow Design

**Problem**

Boss telegraph bars already expose an in-bar `收束刻度` when a counter window opens on frame one and closes before the telegraph bar ends. The remaining bar body to the right still keeps the same bright fill color, so the player can still read that tail as "counterable" at a glance.

**Approaches**

1. Dim the remaining tail segment in the telegraph bar after the closure marker.
   This keeps the existing countdown bar intact while making the non-counterable part visibly distinct.
2. Replace the counter-window text with an immediate `已收束`.
   This helps text readers, but does not solve the peripheral-reading problem inside the bar itself.
3. Remove the bar fill entirely after the closure point.
   This is the strongest cue, but it risks obscuring the fact that the telegraph cast itself is still counting down.

**Recommendation**

Use approach 1 now. It preserves the telegraph timing bar, reuses the existing closure-marker contract, and adds a low-risk readability cue that works in peripheral vision.

**Design**

- Extend `buildBossTelegraphHudSummary` so early-closing frame-one counter windows expose a dedicated tail-afterglow segment.
- Render that segment as a darker overlay from the closure point to the bar end in `BossScene`.
- Document the behavior in `README.md` and the in-game help overlay.
- Keep the next follow-up in `TODO.md`: once the tail is visually dimmed, the counter-window text can also downgrade to an `已收束` state when the fight actually enters that tail.

**Testing**

- Red: regression checks assert the new summary ratios and require a dedicated Boss HUD render path.
- Green: the shared summary and HUD source satisfy the new checks.
