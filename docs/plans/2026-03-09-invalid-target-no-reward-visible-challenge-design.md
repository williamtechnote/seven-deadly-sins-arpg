# Invalid-Target No-Reward Visible Challenge Design

**Context**

`TODO.md` is empty after the last heartbeat cycle, while the current challenge-summary work has already locked most reward-bearing invalid-target paths. The next smallest gap is the visible no-reward invalid-target copy: the formatter already falls back correctly, but the intent is still mostly implicit and the README/help overlay only call out the reward-bearing invalid-target cases.

**Approaches**

1. Docs-only sync
   Update `README.md` and the help overlay copy in `game.js` to describe the existing no-reward invalid-target behavior.
   Trade-off: low risk, but it does not add new regression coverage or make the shared formatter intent clearer.

2. Tests + docs sync
   Add regression assertions for the missing visible no-reward invalid-target wording and update the docs.
   Trade-off: behavior is locked, but the formatter still depends on implicit `progressLabel === ''` handling spread across multiple helpers.

3. Shared explicit status-first fallback helpers + tests + docs
   Add small shared helpers in `shared/game-core.js` for invalid-target visible summaries, then add regression coverage and sync `README.md` plus the help overlay copy in `game.js`.
   Trade-off: slightly more change than docs-only, but still narrow and makes future maintenance safer.

**Recommendation**

Take approach 3. It preserves current behavior, makes the no-reward invalid-target intent explicit in code, and keeps the heartbeat delta tightly scoped to the existing challenge-summary area.

**Scope**

- Implement the first two TODO items:
  - visible in-progress invalid-target + no-reward fallback docs/tests/code clarity
  - visible completed invalid-target + no-reward fallback docs/tests/code clarity
- Leave a third helper-hardening TODO active for the next heartbeat entry.
