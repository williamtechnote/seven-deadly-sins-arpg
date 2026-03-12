import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

const BOSSES = ['pride', 'envy', 'wrath', 'sloth', 'greed', 'gluttony', 'lust', 'final'];

test('boss-matrix: each boss level/boss scene boots with real input', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 909090, testScenario: 'combat' });
  await expectTestHooks(page);
  await clickStart(page);

  for (const bossKey of BOSSES) {
    const levelOk = await page.evaluate((key) => window.__SDS_TEST__.startLevel(key), bossKey);
    expect(levelOk).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().level?.bossKey ?? null)).toBe(bossKey);

    await page.keyboard.press('u');
    await page.keyboard.press('o');
    await page.keyboard.press('Space');

    const bossOk = await page.evaluate((key) => window.__SDS_TEST__.startBoss(key), bossKey);
    expect(bossOk).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().boss?.bossKey ?? null)).toBe(bossKey);

    await page.keyboard.press('u');
    await page.keyboard.press('o');
    await page.mouse.click(760, 420, { button: 'left' });

    const backHub = await page.evaluate(() => window.__SDS_TEST__.returnHub());
    expect(backHub).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');
  }

  await dumpEvidence(page, testInfo, 'boss-matrix', {
    bosses: BOSSES,
    consoleErrors
  });
  expect(consoleErrors).toEqual([]);
});
