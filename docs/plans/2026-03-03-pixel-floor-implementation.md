# Pixel Floor Tiles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace flat floor fills with procedural pixel tiles in Hub/Level/Boss scenes and make each map style visually distinct.

**Architecture:** Add shared tile-style config and procedural texture generation utilities near rendering helpers, then reuse a single tiling renderer to draw floor regions in each scene. Keep all gameplay/collision logic unchanged.

**Tech Stack:** Phaser 3, plain JavaScript, runtime-generated textures via `Graphics.generateTexture`.

---

### Task 1: Add tile style config and helpers

**Files:**
- Modify: `game.js`
- Test: manual visual verification in browser

**Step 1: Add map tile style dictionary**
- Add style definitions for `hub`, each boss key, and a fallback style.

**Step 2: Add procedural tile texture generator**
- Implement helper that builds `pixel_tile_<style>` textures once.

**Step 3: Add rectangle tiling renderer**
- Implement helper to fill arbitrary floor rectangles by repeating generated tile textures.

**Step 4: Manual check**
- Run game and verify no runtime errors in Boot/Title.

### Task 2: Replace Hub floor rendering

**Files:**
- Modify: `game.js` (`HubScene.create`)
- Test: manual visual verification in browser

**Step 1: Replace old fill + line grid**
- Use tile renderer for hub bounds.

**Step 2: Keep readability**
- Keep subtle overlay line style only if needed for orientation.

**Step 3: Manual check**
- Enter Hub and verify pixel style is applied and movement is unaffected.

### Task 3: Replace Level floor rendering per map

**Files:**
- Modify: `game.js` (`LevelScene.create`)
- Test: manual visual verification in browser

**Step 1: Use `bossKey` to select tile style**
- Map `bossKey -> style key`.

**Step 2: Tile each room/corridor**
- Replace `fillRect` floor with tile fill while preserving border strokes.

**Step 3: Manual check**
- Enter at least two different boss maps and confirm floor styles differ.

### Task 4: Replace Boss arena floor rendering per map

**Files:**
- Modify: `game.js` (`BossScene.create`)
- Test: manual visual verification in browser

**Step 1: Select style from current boss key**
- Use matching style for arena floor.

**Step 2: Keep current border/high-contrast readability**
- Preserve edge visibility for combat.

**Step 3: Manual check**
- Trigger one boss fight and confirm pixel floor + clear combat readability.

### Task 5: Validate and polish

**Files:**
- Modify: `game.js` (if tuning needed)
- Test: lint + manual visual walkthrough

**Step 1: Run diagnostics**
- Check IDE lint diagnostics for `game.js`.

**Step 2: Tune contrast if needed**
- Reduce highlight/accent probability if visuals are too noisy.

**Step 3: Final verification**
- Verify Hub, Level, Boss all use pixel floor and map styles are distinct.
