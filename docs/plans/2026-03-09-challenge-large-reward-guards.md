# Challenge Large Reward Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add regression coverage for ultra-compact visible challenge summaries with `+999金` rewards and document that they keep the existing semantic fallback chain.

**Architecture:** Reuse the existing `buildRunChallengeSidebarLines` helper in `shared/game-core.js`, which already selects among ordered label variants by width. The work is test-first: add failing regression assertions for in-progress and completed large-reward summaries, make only the minimal helper/doc changes needed to satisfy them, and keep README/TODO/PROGRESS aligned with the new coverage.

**Tech Stack:** Plain JavaScript, Node-based regression script, Phaser runtime docs in `README.md`

---

### Task 1: Large Reward Summary Guards

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Write the failing test**

Add two regression assertions for `rewardGold: 999` that expect:
- in-progress ultra-compact visible summary: `挑战 12/30 · +999金 -> 挑战 12/30 -> 12/30`
- completed ultra-compact visible summary: `挑战完成 · +999金 -> 挑战完成 -> 完成`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new large-reward summary assertions until the implementation/doc alignment is complete.

**Step 3: Write minimal implementation**

Keep the existing variant-based fallback logic unless the failing assertions reveal a real gap. Update README wording only as needed to describe that the same semantic fallback chain still applies to larger reward values.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add TODO.md README.md shared/game-core.js scripts/regression-checks.mjs PROGRESS.log docs/plans/2026-03-09-challenge-large-reward-guards-design.md docs/plans/2026-03-09-challenge-large-reward-guards.md
git commit -m "test: guard large reward challenge fallbacks"
```
