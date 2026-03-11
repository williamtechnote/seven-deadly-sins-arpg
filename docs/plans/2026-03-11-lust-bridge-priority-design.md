# Lust Bridge Priority Design

**Date:** 2026-03-11

## Goal

Resolve the remaining `魅惑女妖` phase 3 pacing observation by defaulting to a bridge-first pass: split the lone active TODO into three concrete follow-ups, then implement the first two with the smallest possible runtime surface.

## Options

### Option 1: Bridge-first (chosen)

Extend the directed `charmBolt` / `dash` bridges before `illusion` and `mirageDance` again, then leave one final observation item for any remaining loopback density.

Pros:
- stays data-driven inside the existing phase-3 attack list
- targets the remaining density without stretching the special executors again
- keeps regression coverage explicit around the two bridge segments that still feed back into the major-special stack

Cons:
- slightly lengthens the full phase-3 loop

### Option 2: Recovery-first

Lengthen `reverseControl` and `illusion` recovery again before adding more bridge spacing.

Trade-off:
- lower attack-count churn
- overlaps with the last two completed passes and risks repeating the same lever before exhausting bridge tuning

### Option 3: Loopback-only

Add more `mirageDance -> reverseControl` bridge spacing first and leave the earlier bridges alone.

Trade-off:
- helps the end of the loop
- leaves the `reverseControl -> illusion` and `illusion -> mirageDance` re-entry points unchanged even though they are still the earliest special handoffs

## Recommendation

Use option 1. The latest recovery pass already widened the individual special endings, so the next narrow move is to keep the next two special handoffs in light-pressure space longer before revisiting another recovery lever.

## Approved Design

1. Split the remaining observation into `二十二-一 / 二十二-二 / 二十二-三`.
2. Extend the `reverseControl -> illusion` directed bridge by one more `charmBolt` / `dash` segment.
3. Extend the `illusion -> mirageDance` directed bridge by one more `charmBolt` / `dash` segment.
4. Update README, TODO, regression checks, and PROGRESS logging to make the bridge-first contract explicit while leaving one final observation item active.
