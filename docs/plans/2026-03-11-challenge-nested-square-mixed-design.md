# Challenge Nested Square Mixed Decorators Design

## Context

`shared/game-core.js` already strips nested mixed challenge decorators recursively as long as each wrapper pair is individually recognized. The remaining gap is not runtime support for the next nested square-based combinations, but the explicit contract in `README.md`, the in-game help overlay, and the regression suite.

## Options

1. Document and regress the already-supported nested square mixed wrappers.
   Trade-off: no runtime logic change, but it turns implicit recursive support into an explicit contract and keeps the TODO lane moving.

2. Refactor the decorator parser before documenting the next nested families.
   Trade-off: more churn without a demonstrated bug because the shared helper already handles the target examples.

3. Skip the docs/tests and keep relying on implicit helper behavior.
   Trade-off: leaves user-facing guidance and regression coverage behind the actual implementation.

## Decision

Choose option 1. This cycle should promote three adjacent nested square-based follow-ups into `TODO.md`, then implement the first two by locking `【（挑战）】` / `（［本局挑战］）` and `【｛挑战｝】` / `｛［本局挑战］｝` into the README/help/regression contract while leaving nested square/angle mixed wrappers active for the next heartbeat.
