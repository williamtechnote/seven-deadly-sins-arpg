# Event Room Context Recommendation Design

## Context

The event-room choice panel already exposes a lot of state: intent tags, HP projections, cleanse value, near-miss gold blockers, duplicate-supply notes, weapon-routing notes, and threshold relevance. The remaining friction is comparison. Players still need to scan both lines and decide which one is the better fit for the current run state.

The methodology docs point at a better target:

- context should beat static value
- room choices should answer "what problem does this route solve right now?"
- high-ROI TODOs should improve a player's next decision inside one panel read

That means the next gain is not more raw notes on each row. It is a short shared recommendation that converts those notes into a decision hint when the state clearly favors one option.

## Options

1. Keep appending more per-option notes.
Rejected: this increases information but not decision speed; the player still performs the comparison manually.

2. Reorder the two options by current relevance.
Rejected: it would break stable `1 / 2` muscle memory and make the panel feel slippery across runs.

3. Add one shared footer recommendation while keeping both option rows unchanged.
Recommended: it preserves stable ordering, reuses the existing footer space, and lets a deterministic helper surface only high-confidence recommendations.

## Chosen Direction

Add a shared recommendation helper that scores the two currently visible options against the live run state and returns a short footer hint only when the fit gap is meaningful. Target examples:

- `建议 2：净泉啜饮 · 可净化2层`
- `建议 1：绝境修习 · 已处绝境线`
- `建议 2：离弦修习 · 当前持远程`

When the state does not clearly favor either option, the panel keeps the existing neutral footer.

## Design Notes

- Shared logic stays in `shared/game-core.js`; `game.js` should only pass current panel state plus the two choices, then apply the returned footer text.
- Recommendation rules should stay conservative. Show nothing rather than making a weak guess.
- High-confidence signals should prioritize:
  - negative-status cleanse value
  - low-/high-HP threshold alignment
  - current weapon type / status matching route requirements
  - obvious gold affordability gaps
  - duplicate-supply devaluation
- README and help overlay should document that the event-room panel can now elevate one option into a contextual recommendation without changing the button order.

## Success Criteria

- The event-room panel can surface a shared `建议 1/2：...` footer when current state clearly favors one option.
- Ambiguous states keep the default neutral footer.
- Recommendation logic is deterministic and regression-covered through shared-helper assertions plus a game-scene source hook.
- Existing option text, numbering, encounter preview, and affordability labels remain unchanged.
