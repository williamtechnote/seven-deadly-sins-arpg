# Combat Discipline HUD Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose `战技圣坛` route identity directly in the action HUD so `连斩修习 / 游步修习` remain readable during live combat, cooldowns, and dodge-lock previews.

**Architecture:** Reuse the existing action-HUD status-prefix path instead of adding a separate shrine widget. Extend the shared HUD formatter to accept a dodge-row prefix, then derive compact runtime labels from existing run effects inside `Player`.

**Tech Stack:** Phaser 3, plain JavaScript, `shared/game-core.js` HUD helpers, Node regression script

---

### Task 1: Lock the HUD contract with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a `buildCombatActionHudSummary` assertion for:

```js
{
    attackStatusLabel: '连斩-18%',
    dodgeStatusLabel: '游步-20%/-18%'
}
```

Expected summary:

```js
'普攻 U: 连斩-18% 就绪  特攻 O: 就绪  闪避 Space: 游步-20%/-18% 就绪'
```

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the dodge row ignores shrine status labels.

### Task 2: Implement the minimal shared/runtime support

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Extend shared HUD formatting**

Add `dodgeStatusLabel` support in `buildCombatActionHudSegments()` so both ready and dodge-lock preview rows preserve the prefix.

**Step 2: Derive compact player labels**

Add runtime helpers in `Player`:

- `getCombatAttackStatusLabel()` returns `回体+N` first when applicable, otherwise `连斩-18%`
- `getCombatDodgeStatusLabel()` returns `游步-20%/-18%`

**Step 3: Wire the HUD state**

Pass `dodgeStatusLabel` into the existing `actionHudState` object in `UIScene`.

**Step 4: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 3: Update docs and close out the heartbeat record

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `docs/gameplay-run-variety-principles.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new `连斩-18%` / `游步-20%/-18%` action-HUD behavior and promote the next adjacent shrine-readability TODO.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-combat-discipline-hud-labels`.
