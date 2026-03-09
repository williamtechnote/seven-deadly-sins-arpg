# Run Modifier Heading Reset Design

## Goal

Close the remaining regression gap around the ultra-compact hidden challenge badge reset path so the run-modifier heading reliably clears badge styling and returns the full title width budget when the badge goes silent.

## Context

`_updateRunModifierHeading` in `game.js` already resets the badge node when `badgeAppearance.text` is empty, but current regression coverage mostly checks source shape and the badge appearance helper. The missing gap is a tighter contract around the heading reset behavior itself.

## Approaches

1. Keep source-regex-only coverage.
Rejected because it does not prove the width-release contract in a reusable way.

2. Add a shared pure helper for heading presentation and route `UIScene` through it.
Recommended because it gives the CLI regressions a stable, behavior-level surface to verify while keeping the Phaser scene code thin.

3. Build a fake Phaser scene harness in the regression script.
Rejected because it adds more moving parts than the codepath warrants.

## Design

Add a shared helper that accepts the heading width budget, viewport tier, badge appearance, and measurement hooks, then returns:
- whether the badge should be visible
- the fitted badge text
- the fitted title text
- the title width budget after reserving badge width and gap
- the badge style to apply in visible and silent states

`UIScene._updateRunModifierHeading` will consume that helper instead of re-implementing the reset/layout math inline. The silent path will still clear badge text, reset fill/alpha, hide the badge node, and restore the title to the full sidebar width.

## Testing

Add a failing regression that verifies:
- empty badge appearance returns a full-width title budget and hidden badge state from the shared helper
- `game.js` routes `_updateRunModifierHeading` through the shared helper and still clears the badge node style on the silent path
- README/help text documents that the heading also reclaims the width budget when the badge goes silent
