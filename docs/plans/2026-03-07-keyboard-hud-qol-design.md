# Keyboard HUD QoL Design

## Goal

Fill the empty heartbeat `Active` queue with a small, coherent keyboard-combat readability pass, then implement the first two items inside one cycle.

## Context

The current HUD already teaches `IJKL` aim and `Q/E` weapon switching, but two parts of the keyboard loop still require guesswork:

- players cannot read whether `U` normal attack or `O` special attack is ready without pressing the key
- quick slots only show large item names inside tiny boxes, without counts, which is hard to parse during touchpad-friendly play

## Approaches

### 1. Recommended: add small shared HUD-format helpers and consume them in `UIScene`

Use pure helpers in `shared/game-core.js` to format combat-action readiness and compact quick-slot labels, then render those helpers in the existing HUD and lock them with regression checks.

Why:

- keeps gameplay rules unchanged
- makes the new UI copy testable without a browser harness
- fits the heartbeat scope cleanly

### 2. Hard-code strings directly in `UIScene`

This is faster up front, but it pushes formatting logic into scene code and makes regression checks depend on larger chunks of source text.

### 3. Add a larger combat tutorial overlay

This could teach more, but it is oversized for a single heartbeat and adds state/UI churn unrelated to the immediate readability gaps.

## Chosen Design

### Combat readiness line

- keep the existing weapon line
- add a second line that shows `普攻 U` and `特攻 O` readiness using short labels such as `就绪` or `0.8s`
- keep `Space` dodge guidance on the same line so the whole keyboard combat loop remains visible

### Quick slots

- keep the four-slot layout in the bottom-right
- render each slot with a compact short name plus `xN` inventory count
- empty slots continue to show `-`

### Regression coverage

- add pure-helper tests for readiness labels and quick-slot labels
- add source-hook checks proving the HUD uses the new helpers and renders the cooldown line / compact slot text

## Risks

- cooldown labels should stay stable when values are almost ready; rounding must avoid flicker-heavy copy
- compact quick-slot naming should prefer deterministic short labels over truncating arbitrary localized item names
