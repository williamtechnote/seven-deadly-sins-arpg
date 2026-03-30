# Phase 3 Drift Mini Recovery Note Design

**Context**

The current markdown `Phase 3 录屏复盘清单` already exposes:
- a phase-3 summary line with drift counts,
- a drift-only mini checklist that relists drifting checkpoint rows, and
- a full checkpoint index with `回切目标` / recovery snapshot / `回切校验`.

The remaining review gap is that the drift-only mini checklist still forces the reviewer to scroll down into the full checkpoint list to confirm why a checkpoint drifted and what the shared recovery snapshot recorded.

**Goal**

Make each drift-only mini checklist row self-sufficient enough for live pacing review by inlining the checkpoint's `回切校验` note and recovery snapshot short note while keeping the direct `[checkpoints]` anchor.

**Recommended Approach**

Reuse the same checkpoint-derived metadata already used by the full checkpoint index:
- resolve the checkpoint `expectedReturnLabel`,
- build the shared recovery snapshot short note from `shared-recovery-snapshot.json`,
- derive the `回切校验: match/drift` note against the shared recovery expected return,
- append those notes only for drift rows in the mini checklist.

This keeps one source of truth for drift detection and avoids inventing a second formatting path.

**Non-Goals**

- Do not change cadence review artifact generation.
- Do not alter the full checkpoint index wording except where shared helpers are reused.
- Do not retune gameplay or boss timings in this heartbeat.

**Testing**

- Add/adjust regression coverage in `scripts/regression-checks.mjs` so the rendered markdown must include the richer drift-only mini checklist row.
- Re-run the repo’s required syntax checks and regression script exactly as requested by the heartbeat cycle.
