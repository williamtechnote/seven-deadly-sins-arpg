# Phase 3 Evidence Checkpoints Design

## Context

`npm run e2e:report` already prints a dedicated no-drift `evidence` short line for the Lust phase 3 cadence summary, but that line still omits `phase3-checkpoints.txt`. Readers can open the review JSON, recovery snapshot, and HUD screenshot from the first screen, yet they still need to scroll into the checkpoint list before they can open the plain-text checkpoint artifact.

## Approaches

1. Extend the existing summary evidence helper so the no-drift `evidence` line prints `[review] [checkpoints] [recovery] [telegraph]`.
2. Keep the summary shortcut unchanged and rely on the checkpoint list for the text artifact link.
3. Move the checkpoint link into the `recovery` line instead of the dedicated `evidence` line.

## Recommendation

Use approach 1. It closes the remaining first-screen gap with the smallest possible change and keeps all attachment anchors grouped in the same sentence.

## Design

Update `buildCadenceSummaryEvidenceLinks` in `scripts/e2e-report.mjs` to include `phase3-checkpoints.txt` in the same ordered shortcut set used by the checkpoint lines. Because the drift checklist reuses the summary helper, simplify that checklist helper so it does not duplicate the checkpoint link.

Lock the behavior with a regression in `scripts/regression-checks.mjs` that expects the no-drift summary to show all four anchors. Document the new first-screen shortcut set in `README.md`, then roll `TODO.md` forward by marking this item done and promoting one freshly brainstormed cadence-review follow-up.
