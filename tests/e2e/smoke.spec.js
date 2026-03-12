import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

test('smoke: title -> hub -> level exposes deterministic test hooks', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 20260311, testScenario: 'smoke' });
  await expectTestHooks(page);
  await clickStart(page);

  await expect
    .poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene))
    .toBe('HubScene');

  await page.keyboard.down('a');
  await page.waitForTimeout(150);
  await page.keyboard.up('a');

  await expect
    .poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().player != null))
    .toBe(true);

  await dumpEvidence(page, testInfo, 'smoke', {
    consoleErrors
  });

  expect(consoleErrors).toEqual([]);
});
