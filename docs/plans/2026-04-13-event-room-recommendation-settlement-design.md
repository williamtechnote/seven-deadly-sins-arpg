# Event Room Recommendation Settlement Design

## Context

The choice panel can now surface a high-confidence footer recommendation such as `建议 2：净泉啜饮 · 可净化2层`, but that judgment disappears the moment the player commits. After selection, the repo only keeps the route label, encounter preview, and settlement delta.

That breaks the information chain the methodology docs are pushing toward:

- event rooms should answer "what problem does this route solve right now?"
- tags and reasoning should stay stable across UI surfaces
- rewards should keep their meaning visible through the next confirmation step, not only during pre-choice comparison

The next gain is therefore not another panel note. It is a compact post-choice echo of the already-earned recommendation reason.

## Options

1. Recompute recommendation text after settlement from the post-resolution state.
Rejected: many high-confidence reasons disappear once the route resolves (`净化` clears statuses, heal routes change HP thresholds), so the post-choice state would often erase the reason we actually want to confirm.

2. Paste the full `建议 1/2：...` footer string into resolved summaries.
Rejected: the numbering is panel-specific and the copy is too long/noisy for HUD lines, world labels, and altar feedback.

3. Persist a compact recommendation receipt on resolution and let shared resolved-summary helpers consume it.
Recommended: it preserves the exact pre-choice reason that won the recommendation, keeps the copy short enough for all post-choice surfaces, and fits the repo's shared-logic-first rule.

## Chosen Direction

When a player resolves an event room, the shared resolution helper should:

- rebuild the same preview state used by the choice panel,
- derive the current high-confidence recommendation,
- and, only if it points at the selected choice, persist a compact receipt like `可净化2层`, `已处绝境线`, or `当前持远程`.

Resolved summaries should then reuse that stored receipt:

- HUD line: `治疗: 净泉啜饮 · 可净化2层 · 下间缓冲 · 生命+36, 净化`
- world label: `疗愈泉眼 · 治疗: 净泉啜饮 · 可净化2层`
- shrine floating feedback: keep the route label first, then echo the compact reason before the route/settlement deltas

If the recommendation was absent or pointed at the other option, resolved summaries stay exactly as they are today.

## Design Notes

- Add the new receipt in `shared/game-core.js` and carry it through `normalizeRunEventRoom`, `pickRunEventRoom`, `resolveRunEventRoomChoice`, `buildRunEventRoomHudSummary`, `buildRunEventRoomHudLines`, and world-label helpers.
- Keep the stored value reason-only, not the full `建议 1/2` string. Post-choice surfaces should not mention panel numbering.
- Only persist high-confidence matches for the selected option. No "anti-recommendation" copy for the non-recommended route.
- Keep fallback behavior stable when room definitions are missing or when stored route/settlement text is absent.

## Success Criteria

- Resolving a recommended route preserves a compact reason receipt across save/load and shared summary helpers.
- Resolving a non-recommended or ambiguous route produces no new suffix.
- HUD lines, world labels, and runtime settlement feedback reuse the same compact receipt without duplicating numbering.
- Regression checks lock the shared helper output, runtime source hooks, and README/help wording.
