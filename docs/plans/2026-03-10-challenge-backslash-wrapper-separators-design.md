# Challenge Backslash Wrapper Separators Design

**Goal:** Extend run challenge label cleanup so decorator payloads tolerate leading and trailing backslash separators, then document the behavior in the README and in-game help copy.

**Scope**
- Reuse the existing wrapper-internal separator normalization path rather than adding a separate backslash-only branch.
- Cover both leading and trailing backslash cases so mixed decorator wrappers keep collapsing to the real objective label or `未知挑战`.
- Keep docs and regression checks aligned with the shared helper.

**Approaches**
1. Expand the existing separator regexes to include backslashes.
   Recommendation: smallest change, keeps all current decorator stripping behavior centralized.
2. Add a backslash-specific pre-pass before token classification.
   Tradeoff: works, but duplicates the same cleanup pipeline and is easier to drift from other separators.
3. Special-case backslash examples inside the decorator-stripper.
   Tradeoff: narrowest fix, but it does not scale and would fragment the normalization rules.

**Design**
- Update the shared leading and trailing separator regexes in [shared/game-core.js](/Users/william.chenwl/work/seven-deadly-sins-arpg/shared/game-core.js) so `\` is treated like the other wrapper-internal separators already supported.
- Add regression assertions in [scripts/regression-checks.mjs](/Users/william.chenwl/work/seven-deadly-sins-arpg/scripts/regression-checks.mjs) for leading and trailing backslash payloads plus README/help-overlay wording.
- Update [README.md](/Users/william.chenwl/work/seven-deadly-sins-arpg/README.md) and the help-overlay copy in [game.js](/Users/william.chenwl/work/seven-deadly-sins-arpg/game.js) to mention the new backslash-cleanup path alongside the existing separator families.
