# Action RPG Run Variety Principles

These notes capture the gameplay practices that matter most for this repo's current shape: short browser runs, one active event room per run, and heavy reliance on HUD-readable combat state.

## 1. Give each run a different verb, not just bigger numbers

If a run-only buff changes only output damage, players feel the result late and vaguely. Stronger variety comes from changing a verb they repeat every few seconds:

- attack cadence
- dodge timing
- stamina recovery and spend
- route economy

For this project, event-room rewards should prefer these verb-level changes before raw stat inflation.

## 2. Event-room choices should create readable identities

Each room only offers two choices, so both branches need to communicate instantly:

- one branch should reward a clear playstyle
- the other branch should reward a different playstyle
- the HUD should already expose the changed resource or timing so the player can feel it without opening extra menus

That makes event rooms meaningful even in a single run.

## 3. Favor tempo and mobility over opaque complexity

The game already has weapon switching, stamina, dodge lockout, special cooldowns, run modifiers, and challenge pressure. New run-shaping systems should therefore reuse existing combat loops instead of adding another hidden subsystem.

Low-risk additions for this repo:

- faster basic-attack recovery
- cheaper or faster dodge recovery
- stronger stamina economy
- clearer risk/reward routes

Higher-risk additions that should be avoided unless necessary:

- bespoke room-only currencies
- hidden proc systems
- stateful combo meters that need new HUD real estate

## 4. Shared logic first, scene glue second

If a gameplay rule affects event-room resolution, route summaries, save/load persistence, and regression checks, it belongs in `shared/game-core.js` first. `game.js` should only consume the resolved state and apply it to runtime cooldowns or costs.

## 5. Ship run-shaping features with contract tests

For this repo, a gameplay feature is not done unless the regression script proves:

- the event-room pool exposes the route
- the chosen route resolves to the expected run effects
- helper summaries stay readable
- runtime hooks actually consume the new run effect

This keeps heartbeat cycles from drifting into README-only changes.
