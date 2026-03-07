# Keyboard HUD Readability Design

## Goal

Complete the two active keyboard-control TODO items by making the current keyboard-only combat loop easier to read in-game and harder to regress in code.

## Context

The repo already supports `WASD` movement, `IJKL` aim, and `U/O` attack input, but the visible guidance still under-explains that layout:

- the HUD only shows weapon switching and hides the current aim direction.
- the help overlay lists the new aim keys, but does not teach players to read the live aim state from the HUD.
- regression checks confirm low-level aim math and attack remaps, but do not lock the visible control copy or the broader keyboard-only combat loop (`move + aim + switch + dodge + attack + special`).

## Approaches

### 1. Recommended: add a small shared aim-direction label helper and reuse it in HUD + regression checks

Keep combat behavior unchanged. Add one pure helper that turns the current aim angle into a short localized label, surface that label in the HUD, and extend regression checks to prove the help overlay and keyboard input bindings stay aligned with the touchpad-friendly control scheme.

Why this fits:

- smallest change to gameplay code
- easy to test without a browser harness
- solves both active TODO items in one pass

### 2. Hard-code direction text directly inside `UIScene`

This would avoid touching shared code, but duplicates angle-to-label mapping and leaves tests anchored to UI source strings instead of a stable helper.

Why not:

- more brittle
- harder to reuse in docs/tests later

### 3. Build a full interactive tutorial overlay

This could teach movement/aim/weapon flow more explicitly.

Why not:

- too large for a heartbeat cycle
- adds new UX/state-management risk unrelated to the active TODOs

## Chosen Design

### HUD

- add a dedicated control-readability line near the weapon text.
- show both the live aim direction and the key loop summary, e.g. `瞄准: 右上 [IJKL]  攻击: U/O  闪避: Space`.
- if no aim key is currently pressed, continue showing the last retained facing direction, matching the existing combat model.

### Help overlay

- keep the current section layout.
- expand the aim/help copy so the overlay teaches that the HUD shows `当前瞄准`.
- keep the attack, dodge, and weapon-switch guidance explicit for touchpad-only play.

### Regression coverage

- add failing checks for the new shared aim-direction helper.
- add source-level checks that the HUD renders `当前瞄准` and that the help overlay still documents `IJKL`, `U/O`, `Q/E`, and `Space` together as the core keyboard loop.

## Risks

- direction naming at diagonal boundaries must stay stable; the helper should use simple 8-way buckets around the existing angle model.
- source-level regression checks should target durable copy fragments, not huge blocks of UI text, to avoid noisy failures on unrelated formatting changes.
