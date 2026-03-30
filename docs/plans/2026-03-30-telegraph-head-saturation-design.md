# Telegraph Head Saturation Design

## Context

The active heartbeat TODO targets the final sub-millisecond beat of the Boss telegraph tail countdown head marker. Brightness contrast and color-temperature contrast between the shell and inner core already converge at that endpoint, but saturation still reads as a layered split.

## Options

1. Lower alpha only.
This is cheap, but it does not actually reduce shell/core color separation.

2. Add one shared saturation-convergence flag for the final width-trim beat and let rendering pick more desaturated endpoint colors.
This matches the existing brightness/warmth convergence model and is easy to regression-test.

3. Collapse the marker into a single shell pixel.
This removes the split completely, but it risks losing the countdown focal point.

## Decision

Choose option 2. It stays inside the current telegraph state machine, preserves readability, and gives a visible polish improvement with minimal behavioral risk.

## Testing

- Extend the telegraph summary regression to require the new saturation-muted flag during the final sub-millisecond trim beat.
- Extend the source-hook regression to require the Boss telegraph renderer to consume that flag for both shell and inner-core colors.
