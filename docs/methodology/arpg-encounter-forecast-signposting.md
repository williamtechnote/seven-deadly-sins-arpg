# ARPG Encounter Forecast Signposting

## Why This Exists

Short-run ARPG routing only matters if the player can tell what the next room is asking of them before the first hit lands.

Mike Stout's telegraphing essays are a useful fit for this repo:

- players cannot answer a combat question they were never shown
- readable combat comes from many small, overlapping, well-communicated questions
- if players do not know a system exists, it effectively is not in the game

For this project, shrine routing already changes roster, spacing, engage timing, and bounty shape. The remaining job is to expose that change one beat earlier, in a width-safe way.

## Repo Rules

1. Separate forecast from in-room payoff.
   Use a pre-room objective preview like `下间高压 · 三敌齐压` before entry, then keep the in-room cue like `高压战 · 三向成压` for the threshold-crossing moment.

2. Preview the first tactical question, not the full room spec.
   `双低压 / 三敌齐压 / 双赏金` works because it tells the player what to solve first without restating every spawn, depth band, or engage delay.

3. Keep preview nouns stable across surfaces.
   The same compact preview should survive choice panel, resolved HUD, and settlement feedback so the player does not re-parse the route every time.

4. Let objective previews stay narrower than staging receipts.
   The preview says "what kind of opener is coming." The staging receipt or room-entry cue can still say "why this route fits now."

5. Prefer three reusable forecast buckets over bespoke copy per route.
   Reusing shared encounter profiles keeps the system testable and avoids copy drift between shrine families.

## Recommended Ladder For This Repo

1. Choice panel: `下间高压 · 三敌齐压`
2. Resolved summary: keep the same compact objective preview
3. Room-3 entry: `高压战 · 三向成压`
4. First payoff beat: source cue such as `压线抢势`
5. Clear recap: `高压战 · 顶住成压`

This keeps the player-facing language moving from forecast to contact to payoff without making any single surface too verbose.

## References

- Mike Stout, "Enemy Attacks and Telegraphing": https://www.chaoticstupid.com/enemy-attacks-and-telegraphing/
- Mike Stout, "Telegraphs 2: Post-attack vulnerability": https://www.chaoticstupid.com/telegraphs-2-post-attack-vulnerability/
