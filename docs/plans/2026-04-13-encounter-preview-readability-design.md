# Encounter Preview Readability Design

## Goal

Turn the current abstract next-room preview into a more executable read by pairing the existing route posture label with one compact enemy-picture phrase.

## Problem

Latest `main` already routes the next combat room into `下间缓冲 / 下间高压 / 下间淘金`, but that label still answers only "what kind of pacing is coming." The active TODO correctly calls out the missing layer: players should be able to read "who is coming" before entering room 3.

## Chosen Approach

Add one shared encounter-composition helper that maps routed profiles to short phrases:

- `缓冲` -> `双低压`
- `高压` -> `三敌齐压`
- `淘金` -> `双赏金`

Then thread that helper through the three surfaces named by the active TODO:

- choice panel option preview
- resolved event-room HUD summary
- settlement floating text

## Why This Approach

- It improves player comprehension in one run without changing combat balance.
- It reuses the existing routed-encounter system instead of inventing new state.
- It keeps copy compact enough for current UI surfaces.
- It sets up the next TODO cleanly: after players can read the encounter picture, we can add a short objective cue for the first decision.

## Testing

Regression coverage should prove:

- the shared helper returns the new composition phrases
- choice-panel previews append the new phrase after the existing route label
- resolved HUD summaries carry both layers
- settlement feedback emits the shared preview text instead of only the abstract profile label
