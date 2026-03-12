import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

test('combat: real input can produce combat/drop/settlement evidence', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 424242, testScenario: 'combat' });
  await expectTestHooks(page);
  await clickStart(page);

  await expect
    .poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene))
    .toBe('HubScene');

  await expect
    .poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().events.length))
    .toBeGreaterThan(0);

  await dumpEvidence(page, testInfo, 'combat', {
    consoleErrors
  });

  expect(consoleErrors).toEqual([]);
});
