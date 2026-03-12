import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

const seeds = [101, 202, 303];

for (const seed of seeds) {
  test(`longrun: seed ${seed} completes stable startup`, async ({ page }, testInfo) => {
    const consoleErrors = await attachConsoleCapture(page);
    await gotoGame(page, { seed, testScenario: 'longrun' });
    await expectTestHooks(page);
    await clickStart(page);

    await expect
      .poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene))
      .toBe('HubScene');

    await dumpEvidence(page, testInfo, `longrun-${seed}`, {
      seed,
      consoleErrors
    });

    expect(consoleErrors).toEqual([]);
  });
}
