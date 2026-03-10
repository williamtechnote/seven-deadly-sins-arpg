# Challenge Wrapper Leading Separators Design

**Goal:** Make run-challenge label cleanup treat wrapper payloads like `【：挑战】` and `〔-本局挑战〕` as removable decorator prefixes instead of leaking their tokens into sidebar summaries.

**Recommended approach:** Normalize wrapper payload text before `isRunChallengePrefixToken()` evaluates it. This keeps the existing decorator-strip loop, prefix dedupe, and `未知挑战` fallback behavior unchanged for downstream callers.

**Alternatives considered:**
- Broaden the token regexes to accept leading separators in every branch. Rejected because it spreads the same tolerance across multiple call sites and is easier to drift.
- Pre-clean the whole label before decorator stripping. Rejected because it can erase real body punctuation outside decorator wrappers.

**Scope for this cycle:**
- Implement leading colon payload cleanup.
- Implement leading dash payload cleanup.
- Leave mixed multi-separator payloads queued as the next TODO item after the same normalization hook lands.
