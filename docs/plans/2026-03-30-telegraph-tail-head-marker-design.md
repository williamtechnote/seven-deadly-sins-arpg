# Telegraph Tail Head Marker Design

**Context**

The Boss telegraph already dims the surviving progress fill once the counter window has closed and the warning has entered the `尾段残影` phase. That solved the false-positive readability problem, but it also made the live countdown head less obvious in peripheral vision.

**Problem**

When the telegraph is already inside the settled tail segment, the player can still need the remaining read-timing countdown. With the whole surviving fill muted, the current progress edge no longer stands out enough.

**Approaches**

1. Add a thin warm head marker at the live progress edge during the settled tail phase.
   Recommendation: smallest surface area, keeps the existing dimmed-fill intent, and adds a precise countdown cue without re-brightening the whole bar.
2. Raise the whole surviving fill alpha again during tail-afterglow.
   Rejected: reintroduces the original ambiguity between live counter-window time and leftover read-time.
3. Animate the window-row text harder once settled.
   Rejected: helps text scanning, but not peripheral bar timing.

**Design**

- Extend `buildBossTelegraphHudSummary` with a dedicated `currentCountdownHeadMarker` contract.
- Only expose the marker when all of these are true:
  - the telegraph is visible,
  - the live warning is already in `counterWindowTailAfterglowActive`,
  - the main progress fill has been dimmed,
  - the remaining progress ratio is still above zero.
- Place the marker at the current `progressRatio` edge so it tracks the live countdown instead of the counter-window closure point.
- Render it as a thinner, warm-colored in-bar marker distinct from the existing start/closure/tail markers.

**Testing**

- Shared regression: assert the summary exposes visibility and ratio only in the active tail-afterglow case.
- Render regression: assert `BossScene` clears and draws the new marker from the shared summary fields.
- Docs regression: README/help copy mention the new `当前倒计时头标`.
