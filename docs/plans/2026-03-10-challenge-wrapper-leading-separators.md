# Challenge Wrapper Leading Separators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove wrapper-internal leading separators from challenge decorator payloads without changing the downstream summary fallback ladders.

**Architecture:** Reuse the existing challenge decorator stripping path in `shared/game-core.js`. Add test coverage in `scripts/regression-checks.mjs`, normalize only wrapper payload tokens, then sync user-facing docs in `README.md`.

**Tech Stack:** JavaScript, Node CLI regression checks, Markdown docs

---

### Task 1: Colon-prefixed decorator payloads

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add assertions for `【：挑战】击败 30 个敌人` and `《：本局挑战》挑战：本局`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

**Step 3: Write minimal implementation**

Normalize wrapper payload text with the existing leading-separator helper before token matching.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

### Task 2: Dash-prefixed decorator payloads

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add assertions for `〔-本局挑战〕挑战：本局` and `〖—挑战〗击败 30 个敌人`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

**Step 3: Write minimal implementation**

Reuse the same wrapper payload normalization so dash-prefixed tokens collapse into existing challenge-prefix matching.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

### Task 3: Docs and regression sync

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Document the new behavior**

Update README challenge-cleanup notes to mention wrapper-internal leading separator cleanup.

**Step 2: Verify regression/docs coverage**

Run: `node scripts/regression-checks.mjs`

**Step 3: Record audit**

Append a PROGRESS audit line with branch, tests, merge status, and blockers if any.
