# ARPG Reward Feedback Timing Ladder

## Why This Matters

A route reward in a short-run ARPG is only legible if the player can answer two questions quickly:

1. What kind of next room am I steering into?
2. When will this choice actually start paying me back?

This repo already communicates route identity well through `下间缓冲 / 下间高压 / 下间淘金`. The next clarity gain is timing: whether the reward matters on engage, on the first stabilize beat, or on the first bounty cash-out.

## Timing Ladder

Use the same reward across these five beats when possible:

1. **Choice**: show the route identity before commitment.
2. **Resolve**: confirm the chosen route and its compact payoff.
3. **Entry**: tell the player what posture the next room opens with.
4. **First cash-out beat**: show the first moment the route really pays back.
5. **Clear recap**: close the loop after the room is finished.

If a route skips beat 4, players often understand the theory but miss the felt payoff.

## Practical Labels For This Repo

- `首拍兑现`: the route matters as the room first collapses into pressure.
- `稳场兑现`: the route matters once the player survives the opener and resets tempo.
- `追赏兑现`: the route matters when the player secures the bounty target or greedy finish.

These labels should stay short enough to fit sidebars, shrine labels, and choice panels without needing bespoke UI.

## Usage Rule

Prefer one timing label per route. Do not stack multiple timings unless the mechanic truly has two distinct payoffs that the player must plan around.

## Implementation Rule

Derive timing from the routed encounter contract first, then let higher-confidence recommendation receipts narrow the exact combat cue. Shared helpers should own the timing label so the choice panel, HUD summary, world label, and regression checks stay in sync.
