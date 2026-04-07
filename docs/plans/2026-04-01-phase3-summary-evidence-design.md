# Phase 3 Summary Evidence Shortcut Design

## Context

`npm run e2e:report` already splits the Lust phase 3 cadence summary into `recovery` and `telegraph` short lines. The remaining readability gap is the all-match path: when `drift=0`, the summary header no longer prints the direct `[review] [recovery] [telegraph]` artifact anchors, so readers still need to scroll down to the checkpoint index before they can open the attachments.

## Approaches

1. Add a dedicated `evidence` short line under `Phase 3 汇总` that always prints the summary artifact anchors when they exist.
2. Put the artifact links back into the header line even for `drift=0`, making the first line longer again.
3. Leave the all-match summary compact and rely on the checkpoint list for artifact entry points.

## Recommendation

Use approach 1. It preserves the narrow-terminal readability win from the `recovery` / `telegraph` split while restoring first-screen artifact access for no-drift runs.

## Design

Reuse the existing `buildCadenceSummaryEvidenceLinks` helper in `scripts/e2e-report.mjs` and append a dedicated `  - evidence: ...` line whenever those links exist. Keep the current drift-only behavior intact so the header still calls out drift checkpoints, but make the evidence line unconditional for artifact-rich summaries.

Lock the behavior with a regression in `scripts/regression-checks.mjs` that expects the new evidence line in the all-match fixture, and document the always-visible evidence shortcut in `README.md`. Once green, mark the current TODO complete, then promote one new E2E readability follow-up into `TODO.md`.
