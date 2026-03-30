# Telegraph Head Edge Soften Design

## Context

The active heartbeat TODO targets the last sub-millisecond beat of the Boss telegraph tail countdown head marker. Brightness, color temperature, and saturation between the shell and inner core already converge there, but the seam between the two shapes still reads like a crisp double outline just before the countdown reaches zero.

## Options

1. Lower alpha again.
This is cheap, but it overlaps with the existing alpha/contrast trims and does not directly target edge clarity.

2. Add one shared edge-soften flag for the final width-trim beat and let the renderer switch the shell/core seam to slightly softer subpixel geometry.
This fits the current flag-driven telegraph contract and gives the renderer a focused way to reduce the last hard outline cue without changing timing.

3. Remove the inner core entirely at the endpoint.
This would eliminate the seam, but it would also reduce the countdown focal point too aggressively.

## Decision

Choose option 2. It stays consistent with the existing telegraph-summary model, preserves the countdown head marker, and targets the remaining visual issue directly.

## Testing

- Extend the telegraph summary regression to require a new `currentCountdownHeadMarkerShellCoreEdgeSoftened` flag during the final sub-millisecond trim beat.
- Extend the renderer source-hook regression to require the Boss telegraph shell/core geometry to consume that flag.
- Extend README/help-copy regressions to require the new edge-soften behavior to be documented.
