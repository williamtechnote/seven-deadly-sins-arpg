import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

async function boot(page, scenario = 'combat', seed = 13579) {
  await gotoGame(page, { seed, testScenario: scenario });
  await expectTestHooks(page);
  await clickStart(page);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');
}

test('stability: rapid scene switches should not leave stale UI scenes', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await boot(page);

  // Open layered UI scenes in hub first
  await page.keyboard.press('Tab');
  await page.keyboard.press('h');

  // Rapid chain transitions
  for (let i = 0; i < 5; i++) {
    const okLevel = await page.evaluate(() => window.__SDS_TEST__.startLevel('wrath'));
    expect(okLevel).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');

    const okBoss = await page.evaluate(() => window.__SDS_TEST__.startBoss('wrath'));
    expect(okBoss).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

    const okHub = await page.evaluate(() => window.__SDS_TEST__.returnHub());
    expect(okHub).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');
  }

  const noResidue = await page.evaluate(() => {
    const active = window.__SDS_TEST__.getSnapshot().activeScenes || [];
    const forbidden = ['InventoryScene', 'HelpScene', 'PauseScene', 'DialogScene', 'ShopScene', 'BlacksmithScene'];
    return forbidden.every((k) => !active.includes(k));
  });

  expect(noResidue).toBe(true);
  await dumpEvidence(page, testInfo, 'stability-scene-residue', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});

test('stability: boss arena clamp + no NaN positions after stress inputs', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await boot(page);

  await page.evaluate(() => window.__SDS_TEST__.startLevel('wrath'));
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await page.evaluate(() => window.__SDS_TEST__.startBoss('wrath'));
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

  // Force out-of-bounds and let scene update clamp it back
  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    s.player.setPosition(-5000, -5000);
    s.boss.sprite.setPosition(99999, 99999);
  });

  await page.keyboard.down('w');
  await page.keyboard.down('a');
  await page.keyboard.down('s');
  await page.keyboard.down('d');
  await page.waitForTimeout(600);
  await page.keyboard.up('w');
  await page.keyboard.up('a');
  await page.keyboard.up('s');
  await page.keyboard.up('d');

  const sane = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    const p = s.player;
    const b = s.boss.sprite;
    const bounds = s.physics.world.bounds;
    const finite = Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(b.x) && Number.isFinite(b.y);
    const inArena =
      p.x >= bounds.x && p.x <= bounds.right &&
      p.y >= bounds.y && p.y <= bounds.bottom &&
      b.x >= bounds.x && b.x <= bounds.right &&
      b.y >= bounds.y && b.y <= bounds.bottom;
    return { finite, inArena, bounds: { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom } };
  });

  expect(sane.finite).toBe(true);
  expect(sane.inArena).toBe(true);

  await dumpEvidence(page, testInfo, 'stability-boss-clamp', { consoleErrors, sane });
  expect(consoleErrors).toEqual([]);
});

test('stability: 20-cycle soak keeps scene graph and state consistent', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await boot(page, 'longrun', 24680);

  for (let i = 0; i < 20; i++) {
    const okLevel = await page.evaluate(() => window.__SDS_TEST__.startLevel('wrath'));
    expect(okLevel).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');

    const okBoss = await page.evaluate(() => window.__SDS_TEST__.startBoss('wrath'));
    expect(okBoss).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

    const okHub = await page.evaluate(() => window.__SDS_TEST__.returnHub());
    expect(okHub).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');
  }

  const healthy = await page.evaluate(() => {
    const snap = window.__SDS_TEST__.getSnapshot();
    const active = snap.activeScenes || [];
    const state = snap.gameState || {};
    return {
      active,
      okActive: active.length >= 1 && active.length <= 3,
      okState: Array.isArray(state.defeatedBosses) && Array.isArray(state.sinSeals)
    };
  });

  expect(healthy.okActive).toBe(true);
  expect(healthy.okState).toBe(true);

  await dumpEvidence(page, testInfo, 'stability-soak-20', { consoleErrors, healthy });
  expect(consoleErrors).toEqual([]);
});
