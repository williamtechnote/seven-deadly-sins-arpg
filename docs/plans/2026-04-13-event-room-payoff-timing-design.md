# Event Room Payoff Timing Design

## Goal

Make event-room routes say not only **which** third-room posture they create, but also **when** that reward is expected to pay off.

## Context

Current event-room UX already communicates:

- route identity before selection
- selected route + compact settlement after resolution
- room-3 entry preview
- first key combat cue
- clear recap

The missing layer is a compact timing contract on persistent surfaces like the choice panel, sidebar, and world label.

## Approaches

### 1. Add long explanatory copy

Pros: explicit.
Cons: noisy, bad fit for sidebar and shrine labels, duplicates existing room-3 feedback.

### 2. Add one compact timing label per routed encounter

Examples: `首拍兑现 / 稳场兑现 / 追赏兑现`.

Pros: short, reusable across surfaces, easy to test, reinforces current encounter-routing architecture.
Cons: less descriptive than a full sentence.

### 3. Add a dedicated recap/history panel

Pros: richest explanation.
Cons: new UI surface, higher implementation cost, lower ROI for one heartbeat.

## Recommendation

Choose approach 2.

It keeps the feature systemic and low-risk: derive a shared timing label from the routed encounter profile/feedback moment, then append it to the existing choice panel, resolved HUD summary, and world label.

## Design

- Add shared helpers that translate routed encounter timing into one compact label.
- Choice-panel options append the timing label after `下间缓冲 / 下间高压 / 下间淘金`.
- Resolved HUD summaries append the same timing label after the routed preview.
- Shrine/world labels append the timing label after any persisted recommendation reason.
- Keep recommendation echo/source-cue behavior unchanged; this feature only exposes *when* to expect the payoff.

## Testing

- Add deterministic regression coverage for the timing helper.
- Update HUD summary, HUD lines, and world-label assertions to include the new timing label.
- Update README/help-overlay expectations so docs stay aligned with shipped behavior.

## Assumption

This cycle is running in non-interactive automation, so the design is self-approved to satisfy the requested heartbeat workflow.
