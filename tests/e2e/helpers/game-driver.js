import fs from 'node:fs/promises';
import path from 'node:path';
import { expect } from '@playwright/test';

export async function gotoGame(page, options = {}) {
  const {
    seed = 1337,
    testScenario = 'default'
  } = options;
  const url = new URL('/index.html', page.context()._options.baseURL || 'http://127.0.0.1:4173');
  url.searchParams.set('testMode', '1');
  url.searchParams.set('seed', String(seed));
  url.searchParams.set('testScenario', testScenario);
  await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
}

export async function attachConsoleCapture(page) {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push({
      text: error.message,
      location: null
    });
  });
  return consoleErrors;
}

export async function expectTestHooks(page) {
  await expect
    .poll(async () => page.evaluate(() => typeof window.__SDS_TEST__))
    .toBe('object');
}

export async function clickStart(page) {
  // Phaser title text is canvas-rendered, so DOM text locators are unreliable.
  const startedByHook = await page.evaluate(() => {
    if (window.__SDS_TEST__ && typeof window.__SDS_TEST__.startNewGame === 'function') {
      return window.__SDS_TEST__.startNewGame();
    }
    return false;
  });

  if (startedByHook) return;

  // Fallback: click where the start button is expected on 1024x768 canvas.
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not available for start click fallback');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + 40);
}

export async function dumpEvidence(page, testInfo, name, extra = {}) {
  const safeName = name.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const outputDir = path.join(process.cwd(), 'artifacts', 'e2e', safeName);
  await fs.mkdir(outputDir, { recursive: true });

  const snapshot = await page.evaluate(async () => {
    if (!window.__SDS_TEST__) return null;
    return window.__SDS_TEST__.getSnapshot();
  });
  const events = await page.evaluate(async () => {
    if (!window.__SDS_TEST__) return [];
    return window.__SDS_TEST__.getEvents();
  });
  const inputLog = await page.evaluate(async () => {
    if (!window.__SDS_TEST__) return [];
    return window.__SDS_TEST__.getInputLog();
  });
  const consoleErrors = await page.evaluate(async () => {
    if (!window.__SDS_TEST__) return [];
    return window.__SDS_TEST__.getConsoleErrors();
  });

  await page.screenshot({
    path: path.join(outputDir, 'page.png'),
    fullPage: true
  });
  await fs.writeFile(path.join(outputDir, 'snapshot.json'), JSON.stringify(snapshot, null, 2));
  await fs.writeFile(path.join(outputDir, 'events.json'), JSON.stringify(events, null, 2));
  await fs.writeFile(path.join(outputDir, 'input-log.json'), JSON.stringify(inputLog, null, 2));
  await fs.writeFile(path.join(outputDir, 'console-errors.json'), JSON.stringify(consoleErrors, null, 2));
  await fs.writeFile(
    path.join(outputDir, 'meta.json'),
    JSON.stringify(
      {
        testId: testInfo.testId,
        title: testInfo.title,
        extra
      },
      null,
      2
    )
  );
}
