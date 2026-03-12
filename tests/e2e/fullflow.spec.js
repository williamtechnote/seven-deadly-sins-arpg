import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

test('fullflow: hub -> level -> boss -> hub with real browser input', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 20260311, testScenario: 'combat' });
  await expectTestHooks(page);

  await clickStart(page);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');

  // Real inputs in Hub scene
  await page.keyboard.press('a');
  await page.keyboard.press('d');
  await page.keyboard.press('u');
  await page.mouse.click(720, 420, { button: 'left' });

  const jumpedLevel = await page.evaluate(() => window.__SDS_TEST__.startLevel('wrath'));
  expect(jumpedLevel).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');

  // Real inputs in Level scene
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');
  await page.keyboard.press('u');
  await page.keyboard.press('o');
  await page.keyboard.press('Space');
  await page.mouse.click(760, 420, { button: 'left' });

  const jumpedBoss = await page.evaluate(() => window.__SDS_TEST__.startBoss('wrath'));
  expect(jumpedBoss).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

  // Real inputs in Boss scene
  await page.keyboard.press('u');
  await page.keyboard.press('o');
  await page.keyboard.press('Space');
  await page.keyboard.down('a');
  await page.waitForTimeout(300);
  await page.keyboard.up('a');

  const backHub = await page.evaluate(() => window.__SDS_TEST__.returnHub());
  expect(backHub).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');

  await dumpEvidence(page, testInfo, 'fullflow', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});
