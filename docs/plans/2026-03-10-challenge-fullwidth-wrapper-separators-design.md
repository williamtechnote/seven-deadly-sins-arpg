# Challenge Full-Width Wrapper Separators Design

**Goal:** Make run-challenge label cleanup treat full-width wrapper separators like `｜` and `／` the same as the existing half-width separator set when they appear around decorator payload tokens.

**Project context:** `shared/game-core.js` already strips decorator wrappers and normalizes half-width / CJK colon-dash separators before matching `挑战` / `本局挑战` tokens. The current gap is that full-width vertical bar and slash variants still leak through wrapper payloads, even though the downstream prefix-dedupe and `未知挑战` fallback chains are already correct.

**Approaches considered:**
- **Recommended:** expand the shared separator character class used by wrapper-token normalization. This keeps decorator stripping, plain-text prefix cleanup, and fallback behavior centralized in one place.
- Add special-case checks for `｜` and `／` inside `isRunChallengePrefixToken()`. Rejected because it splits equivalent separator handling across multiple branches.
- Pre-normalize every raw label before decorator stripping. Rejected because it broadens scope beyond wrapper payload tokens and risks eating legitimate body punctuation.

**Design:**
- Promote three TODOs: leading full-width separators, trailing full-width separators, and docs/regression sync.
- Implement both behavior changes via the same shared separator normalization path in `shared/game-core.js`.
- Add regression coverage first for the leading/trailing full-width cases, watch it fail, then patch the shared helper.
- Update README/help-overlay wording so docs explicitly mention `｜` / `／` alongside the existing wrapper-internal separator cleanup rules.
