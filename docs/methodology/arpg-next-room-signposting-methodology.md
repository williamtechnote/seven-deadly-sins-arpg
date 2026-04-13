# ARPG Next-Room Signposting Methodology

## Why This Matters

Once an event room starts routing the next combat encounter, the player needs two answers before they step through the door:

1. what pressure profile is coming
2. what concrete enemy picture that profile implies

If the UI only says `下间缓冲 / 下间高压 / 下间淘金`, the player understands posture but may still not know whether that means two slow bodies, three immediate threats, or a back-line bounty target.

This project should therefore treat next-room previews as a two-layer signpost:

- layer 1: route posture, such as `下间缓冲 / 下间高压 / 下间淘金`
- layer 2: encounter picture, such as `双低压 / 三敌齐压 / 双赏金`

## Practical Rules

1. Keep the first layer stable.
   The route label is the shared vocabulary for pacing and reward identity. Do not replace it when adding more detail.

2. Add one concrete enemy-picture noun phrase.
   Use a short phrase that tells the player who or how many to expect, not abstract flavor.

3. Reuse the same phrase across surfaces.
   Choice panel, resolved HUD summary, settlement float text, and any later room-entry cue should all read from the same shared helper.

4. Prefer readable shape over exact counts when counts are not the point.
   `双低压` is more useful than a long list of enemy archetypes if the real decision is "safe staggered opener."

5. Leave room for a later objective cue.
   After players can read "what is coming," the next improvement is "what should I do first" with short directives such as `先稳前排` or `先追后排`.

## Recommended Pattern For This Repo

- `缓冲战`
  Use a composition phrase that reads as a softer two-enemy opener.
- `高压战`
  Use a composition phrase that reads as an immediate three-angle stack.
- `淘金战`
  Use a composition phrase that reads as two targets with a clear bounty carrier.

## Reference

- The Level Design Book, combat design overview: https://book.leveldesignbook.com/process/combat
