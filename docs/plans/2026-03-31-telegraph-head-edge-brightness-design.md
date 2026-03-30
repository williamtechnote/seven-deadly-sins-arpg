# Telegraph Head Edge Brightness Design

## Goal

Balance the final sub-millisecond countdown-head shell/core edge highlight so the telegraph endpoint no longer looks brighter on one side during the last visible tail-afterglow frame.

## Approach

Keep the existing countdown-head polish pipeline intact and add one more boolean contract in the shared telegraph summary for the final `remainingMs < 1` beat. BossScene already consumes neighboring flags to narrow geometry, flatten edge highlight shape, and mute shell/core contrast. This step extends that same path by rebalancing the shell/core brightness relationship laterally once the final-width trim is active.

## Options Considered

1. Geometry-only rebalance
   Shift shell/core bounds again without touching color or alpha. This is low risk but does not directly address a brightness-weight problem.

2. Symmetric alpha/color rebalance for the final beat
   Use the existing final-width-trim moment to slightly converge shell/core highlight brightness and keep both sides visually even. This directly targets the reported perception issue and fits the current boolean-contract pattern.

3. Separate bespoke shader-like blend logic
   This could be more precise but is unnecessary for a one-pixel telegraph marker and would break the repo's current simple rendering model.

## Decision

Use option 2. Add a new shared summary flag and consume it in `game.js` by slightly rebalancing the countdown-head shell/core highlight brightness on the final beat. Sync README/help-overlay copy, regression checks, TODO progression, and the heartbeat audit log to that same contract.
