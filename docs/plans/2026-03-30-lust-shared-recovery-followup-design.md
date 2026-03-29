# Lust Shared Recovery Follow-Up Design

**Context**

`魅惑女妖` phase 3 has already gained a longer `mirageDance` recovery window and a longer `mirageDance -> reverseControl` light-pressure bridge. The remaining active TODO is the next pacing follow-up: if the loop still feels dense after those changes, bias the selector further toward lighter attacks before another major special.

**Approaches**

1. Raise only `mirageDance` recovery again.
This delays the next loopback, but only after one specific attack and does not help `reverseControl` and `illusion`.

2. Extend the shared `majorSpecial` recovery guard again.
This keeps the existing phase-3 pacing model intact and delays all three major specials uniformly whenever lighter attacks are available.

3. Add even more bridge attacks between every major special.
This works, but it keeps growing the attack list and is harder to reason about than reusing the existing shared recovery guard.

**Recommendation**

Use option 2. The repo already has a shared `majorSpecial` recovery contract, selector hooks, README wording, and regression coverage. A small increase to that shared guard is the lowest-risk way to widen phase-3 breathing room without changing attack identities or adding another bespoke rule.

**Design**

- Increase `BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial`.
- Update regression checks to lock the new numeric contract and the README wording.
- Update README to describe that the shared recovery guard was extended again after the longer `mirageDance` recovery pass.
- After completion, queue one new observation TODO to decide whether pacing still needs more loopback bridge or recovery work.
