# First Shrine Choice Target Footer Design

## Context

The current snapshot already keeps boss posture alive through portal focus, run start, and the first unresolved shrine's approach/world-label surfaces. The remaining drop happens inside the actual shrine choice panel: when no shared recommendation is confident enough to override the neutral footer, the panel loses the target posture at the exact moment the player chooses between routes.

## Options

1. Add the boss posture into each option line.
This is too heavy. It repeats the same cue twice and competes with route preview, payoff timing, and affordability labels.

2. Replace the neutral footer with a shared target footer only when no stronger recommendation exists.
Recommended. It preserves the existing footer slot, keeps the guidance neutral, and fits the repo's current posture ladder without changing option density.

3. Add another persistent panel row for target posture.
This is clearer but bloats the panel for a small reminder and creates another surface that docs/tests must keep in sync.

## Decision

Choose option 2. Build a shared helper that returns:

- the high-confidence recommendation when available
- otherwise `当前目标：<boss posture>` when the active boss has a portal/shrine posture cue
- otherwise an empty string so runtime can keep the generic footer

## Testing

- Add regression coverage for the new shared footer helper.
- Verify it prefers existing recommendations over the neutral target footer.
- Verify it falls back to `当前目标：稳拍反制` for a no-recommendation first-shrine state against Lust.
- Verify it stays silent when there is no boss-aware target.
- Update runtime-source, README, and help-overlay assertions to require the new footer behavior.
