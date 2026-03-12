import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

test('ui-scenes: inventory/help/pause/dialog/shop/blacksmith scenes are reachable', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 565656, testScenario: 'smoke' });
  await expectTestHooks(page);
  await clickStart(page);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');

  await page.keyboard.press('Tab');
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().activeScenes.includes('InventoryScene'))).toBe(true);

  await page.keyboard.press('h');
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().activeScenes.includes('HelpScene'))).toBe(true);

  const pauseOk = await page.evaluate(() => window.__SDS_TEST__.launchScene('PauseScene', { parentScene: 'HubScene' }, 'HubScene'));
  expect(pauseOk).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().activeScenes.includes('PauseScene'))).toBe(true);

  const dialogOk = await page.evaluate(() => window.__SDS_TEST__.launchScene('DialogScene', { dialog: [{ speaker: '测试', text: 'hello' }] }, 'HubScene'));
  expect(dialogOk).toBe(true);

  const shopOk = await page.evaluate(() => window.__SDS_TEST__.launchScene('ShopScene', {}, 'HubScene'));
  expect(shopOk).toBe(true);

  const blacksmithOk = await page.evaluate(() => window.__SDS_TEST__.launchScene('BlacksmithScene', {}, 'HubScene'));
  expect(blacksmithOk).toBe(true);

  await expect
    .poll(async () => page.evaluate(() => {
      const events = window.__SDS_TEST__.getSnapshot().events || [];
      const opened = events
        .filter((e) => e && e.type === 'test-harness:scene-open')
        .map((e) => e.payload && e.payload.sceneKey)
        .filter(Boolean);
      return {
        hasDialog: opened.includes('DialogScene'),
        hasShop: opened.includes('ShopScene'),
        hasBlacksmith: opened.includes('BlacksmithScene')
      };
    }))
    .toEqual({ hasDialog: true, hasShop: true, hasBlacksmith: true });

  await dumpEvidence(page, testInfo, 'ui-scenes', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});
