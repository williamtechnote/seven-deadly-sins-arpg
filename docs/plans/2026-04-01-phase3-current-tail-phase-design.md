# Phase 3 Current Tail Phase Design

## Context

`npm run e2e:report` already surfaces the live `当前窗口收束` and `当前窗口尾差` for the Lust phase 3 cadence review summary. The remaining readability gap is that the reader still needs to parse the `+/-` delta sign to know whether the live counter window closes inside the telegraph, exactly at the tail, or after the telegraph.

## Approaches

1. Extend only the `Phase 3 汇总` line with a concise `当前尾差相位` label built from the existing live telegraph snapshot.
2. Ask readers to infer the phase from `当前窗口尾差` and keep the extra context only in the drift-only notes.
3. Replace `当前窗口收束` with a categorical label and drop the more precise timing sentence.

## Recommendation

Use approach 1. The existing `counterWindowTailPhase` wording already exists in the report's drift-only notes, so reusing it in the summary closes the gap with minimal code and without sacrificing the precise `当前窗口收束` sentence.

## Design

Add a focused formatter in `scripts/e2e-report.mjs` that reads the live `counterWindowMs` and `telegraphDurationMs` from `telegraphSnapshot`, derives the same `counterWindowTailPhase` wording already used by the drift-only notes, and appends `当前尾差相位` to `buildCadenceCheckpointSummaryLine`.

Update the regression expectation in `scripts/regression-checks.mjs` so the summary must include the new label, and extend the README cadence-report paragraph to document that the summary now inlines the live tail-phase category as well. After the task is green, mark the current TODO complete and promote one newly brainstormed E2E readability follow-up for the next cycle.
