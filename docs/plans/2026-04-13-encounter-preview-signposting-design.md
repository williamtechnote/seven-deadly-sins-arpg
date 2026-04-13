# Encounter Preview Signposting Design

## Context

The current committed route surfaces still summarize resolved encounter routing as `下间缓冲 / 下间高压 / 下间淘金`. That preserves the route family, but it hides the first tactical ask until either the staging receipt or the room-3 entry cue appears.

The methodology docs now point at a narrower gap:

- route identity should be understandable before the doorway
- preview surfaces should tell the player what first reaction the next room wants
- the lighter preview surface should stay distinct from the richer entry / payoff ladder

## Options

### 1. Keep the coarse route labels

Pros: shortest copy.
Cons: players still have to remember what each route family implies, so the preview does not help much when scanning quickly.

### 2. Reuse the full staging receipt everywhere

Pros: maximum detail.
Cons: too noisy for choice rows and resolved summaries, and it collapses the distinction between forecast and payoff explanation.

### 3. Add a shared objective preview layer

Examples:

- `下间缓冲 · 双低压`
- `下间高压 · 三敌齐压`
- `下间淘金 · 双赏金`

Pros: compact, readable, and specific enough to prime the first tactical question before room entry.
Cons: adds one more naming layer that must stay aligned with the existing room-entry and source-cue ladder.

## Recommendation

Choose option 3.

It gives the player better pre-room information without displacing the current `缓冲战 / 高压战 / 淘金战` runtime contract. Shared helpers remain the source of truth, so choice panel, resolved HUD, settlement feedback, README, and regression checks can move together.

## Design

- Add one shared helper that maps the routed encounter profile to an objective preview label.
- Route `formatRunEventRoomChoiceEncounterPreview(...)` through that helper so existing callsites upgrade together.
- Keep entry previews and staging receipts unchanged; they still own the richer combat-language layer.
- Thread the objective preview into resolved world-facing summaries where the current copy is still only the coarse route family.

## Testing

- Update the shared preview-helper assertions to expect the new compact labels.
- Update HUD/world-label assertions that currently only expect `下间缓冲 / 下间高压 / 下间淘金`.
- Update runtime source assertions for the choice panel and settlement feedback so they prove the new helper is being consumed.

## Assumption

This heartbeat is running non-interactively, so the design is treated as approved once recorded.
