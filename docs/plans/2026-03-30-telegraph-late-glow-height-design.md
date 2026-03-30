# Telegraph Late Glow Height Trim Design

## Context

Boss telegraph tail handling already narrows the countdown head shell, inner core, and both inner/outer residual late glows during the final sub-millisecond beat. The remaining visual mismatch is vertical: the outer residual late glow still keeps its taller halo even when the rest of the countdown head has already collapsed.

## Goal

Trim the outer residual late-glow height during the same final sub-millisecond beat so the last visible aura no longer reads as a full-height capsule after the countdown head has already shrunk.

## Approach

Add one shared-summary flag that becomes true alongside the existing final-width trim beat. Consume that flag in the boss telegraph renderer to shorten the outer late glow vertically with a smaller rounded rect. Keep the change gated to the same final beat so earlier tail states stay untouched.

## Testing

- Extend the shared telegraph summary regression to expose the new boolean only during the final sub-millisecond beat.
- Extend the source-hook rendering regression to require the trimmed outer late-glow Y/height/radius branch.
- Update README/help copy so the documented tail-cue chain matches the runtime contract.
