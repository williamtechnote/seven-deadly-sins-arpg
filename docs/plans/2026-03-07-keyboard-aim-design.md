# Keyboard Aim Design

## Goal

Implement the first two active TODO items by replacing pointer-driven facing with keyboard aim input, while preserving the current angle-based combat math and allowing `WASD` movement plus `IJKL` aiming at the same time.

## Context

Current player facing is overwritten every frame from `scene.input.activePointer`, so:

- `I/J/K/L` cannot steer the player.
- moving and aiming are not independent.
- attacks, specials, projectiles, and dodge inherit mouse direction even when the player uses the keyboard.

## Approaches

### 1. Recommended: last-nonzero keyboard aim over existing angle system

Add pure helpers that convert `IJKL` key state into a normalized aim vector / angle, then let `Player.update()` keep the last valid keyboard aim when no aim key is held. Existing hitbox, projectile, weapon-visual, and animation code continues to read `facingAngle`.

Why this is the right fit:

- smallest code change against the current combat implementation
- no need to rewrite angle-based attack and dodge logic
- easy to regression-test in `shared/game-core.js`
- satisfies simultaneous move/aim input cleanly

### 2. Hybrid fallback to mouse when no aim key is held

Keyboard aim would take priority only while `IJKL` is pressed, then revert to pointer orientation on release.

Why not:

- conflicts with the TODO wording that keyboard aim should replace mouse-facing
- creates unstable direction changes on touchpad / accidental mouse movement

### 3. Convert combat to explicit 8-direction enums

Store direction as `up/down/left/right/diagonal` and derive angle only when needed.

Why not:

- broader refactor than this heartbeat needs
- duplicates existing angle math
- higher regression risk in melee arcs, projectile travel, and dodge

## Chosen Design

### Input model

- `WASD` remains movement only.
- `IJKL` becomes aim only.
- keyboard attack / special move to `U / O` so `J / K` can stay dedicated to left/down aim.
- opposing aim keys cancel each other on their axis (`I` + `K` => `0`, `J` + `L` => `0`).
- diagonal aim is normalized to the existing angle system.
- when aim input is empty, retain the last non-zero keyboard aim instead of snapping back to the mouse.

### Player behavior

- `Player` stores a small keyboard-aim state (`vector`, `angle`, `hasAimInput`).
- `Player.update()` derives `facingAngle` from that state, not from the pointer.
- dodge keeps using `facingAngle`, which makes dodge direction consistent with the new keyboard aim baseline.
- attack / special / projectile direction stays untouched because those systems already consume `facingAngle`.

### UI and docs

- README and help overlay text switch from `J/K` attacks to `IJKL` aim plus `J/K` attacks.
- This heartbeat intentionally stops short of adding a HUD-facing indicator; that remains in the later TODO item.

### Testing

- add pure regression coverage for:
  - `IJKL` to normalized aim vector / angle
  - empty aim input preserving the prior facing angle
  - axis-cancel behavior and diagonal normalization
- add source-level checks that `Player` now registers `I/J/K/L` aim keys and no longer overwrites `facingAngle` from `activePointer` inside `update()`

## Risks

- dodge will now follow keyboard aim instead of pointer aim; this is intentional because it removes mixed-control ambiguity.
- if the player never provides aim input, the initial angle remains the existing default (`0`, facing right) until the first aim input arrives.
