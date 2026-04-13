# Encounter Staging Receipt Design

## Goal

Add a compact `遭遇:` receipt so resolved event rooms and settlement feedback can restate the next room-3 combat contract before the player actually crosses the doorway.

## Problem

The repo already communicates route identity at four moments:

- choice-panel recommendation
- resolved route receipt
- room-3 entry / source-cue / clear recap
- payoff-specific combat feedback

The weak step is the space between settlement and room entry. Current resolved HUD lines mostly stop at `下间缓冲 / 下间高压 / 下间淘金`, which preserves direction but drops the authored tactical suffix and any still-relevant recommendation echo.

## Approaches

### 1. Upgrade the existing preview label only

Pros: small patch, minimal UI churn.
Cons: keeps staging semantics buried inside a generic preview label and does not give HUD/settlement a stable shared contract.

### 2. Add a dedicated shared staging helper

Pros: reuses existing encounter echo logic, keeps wording aligned with entry preview, easy to test in shared helpers and scene wiring.
Cons: slightly more surface area.

### 3. Add a new persistent HUD panel

Pros: strongest visibility.
Cons: higher UI cost, more invasive than this cycle needs.

## Chosen Approach

Use approach 2.

Add a shared helper that formats `遭遇: 缓冲战 · 双拍缓冲 · 游步回拍` style text from the resolved event room and encounter profile. Then consume it in:

- resolved event-room HUD lines
- settlement floating feedback

Unknown / legacy room types should skip the staging receipt.

## Testing

- Add shared regression checks for the new helper.
- Update resolved HUD summary/line expectations to include the new `遭遇:` line for known routed room types.
- Update scene regex checks so settlement feedback consumes the new shared staging helper rather than only `encounterProfile.previewLabel`.
