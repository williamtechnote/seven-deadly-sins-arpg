# Phase 3 Current Counter Window Design

## Context

`npm run e2e:report` already surfaces the live `current recovery checkpoint`, `当前复盘锚点`, and `当前反制提示` for the Lust phase 3 cadence review. The remaining readability gap is that the summary still hides the actual live counter-window length unless the reader scans the detailed checkpoint notes.

## Approaches

1. Extend only the `Phase 3 汇总` line with a concise `当前反制窗口` label built from the existing live telegraph snapshot.
2. Repeat the existing drift-only short-note fragments inside the summary verbatim.
3. Add a new artifact file just for the live telegraph window breakdown.

## Recommendation

Use approach 1. The data already exists in `telegraphSnapshot`, it keeps the summary readable, and it avoids duplicating the long drift-only note vocabulary in the headline.

## Design

Add a focused formatter in `scripts/e2e-report.mjs` that reads `counterWindowMs` and `telegraphDurationMs` from the live `telegraphSnapshot`, then renders a short label such as `1.7s (130.8% telegraph)`. Wire that label into `buildCadenceCheckpointSummaryLine` after `当前反制提示`.

Update the regression fixture in `scripts/regression-checks.mjs` so the markdown summary must include the new field, and extend the README cadence-report paragraph to document that the summary now inlines the live counter-window size and ratio. After the task is green, mark the current TODO complete and promote one new follow-up TODO item for the next readability gap.
