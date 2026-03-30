# Telegraph Head Alpha Trim Design

**Goal:** Reduce the false impression of a full countdown head marker during the final 5ms of an early-closing Boss telegraph tail.

## Context

The Boss telegraph already trims the tail head marker in stages at roughly 220ms, 120ms, 80ms, 40ms, 20ms, and 10ms. The remaining artifact is the final shell flash: even after the shell caps shorten, the outer shell still reads as a complete marker on the last blink before zero.

## Approaches

1. Lower only the shell alpha during the final 5ms.
Recommended because it preserves the existing silhouette, keeps the change minimal, and stacks cleanly with the existing 10ms shell-cap trim.

2. Shrink the shell width during the final 5ms.
This would reduce footprint, but it risks making the marker look like it jumped horizontally rather than faded naturally.

3. Fade both shell and inner core together during the final 5ms.
This would be stronger, but it reduces the countdown anchor too aggressively and overlaps with a plausible next follow-up item.

## Design

- Add one shared summary flag for the final 5ms shell-alpha state.
- Keep the threshold strictly below 5ms so the existing 10ms trim beat remains distinct.
- Use that flag in the renderer to lower only the shell alpha, leaving the focused inner core intact.
- Extend regression coverage for shared summary behavior, renderer source hooks, and README wording.

## Testing

- Add a failing regression for the new shared flag at `remainingMs: 4`.
- Keep `remainingMs: 5` asserting the flag is still off.
- Verify the renderer consumes the flag and lowers the shell alpha.
