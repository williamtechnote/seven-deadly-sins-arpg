#!/usr/bin/env node
/**
 * Download Pixel Crawler asset pack from itch.io
 */
import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'fs';
import { join } from 'path';

const outDir = join(process.cwd(), 'downloads');
const url = 'https://anokolisa.itch.io/dungeon-crawler-pixel-art-asset-pack';

async function main() {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(process.cwd(), 'debug-output'), { recursive: true });

  const exePath = '/Users/william/work/amy_project/.playwright-browsers/chromium_headless_shell-1208/chrome-headless-shell-mac-x64/chrome-headless-shell';
  const browser = await chromium.launch({
    headless: true,
    executablePath: exePath,
    args: ['--enable-unsafe-swiftshader'],
  });

  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log('1. Navigating to', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Click Download - may go to payment page or trigger download
  console.log('2. Clicking Download...');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.locator('a:has-text("Download")').first().click(),
  ]);

  await page.waitForTimeout(3000);

  if (download) {
    const savePath = join(outDir, download.suggestedFilename());
    await download.saveAs(savePath);
    console.log('SUCCESS: Saved to', savePath);
    console.log('Size:', statSync(savePath).size, 'bytes');
    await browser.close();
    return;
  }

  // On payment/download page - look for "No thanks" or download link
  console.log('3. On payment/download page, handling...');
  const noThanks = page.locator('text=No thanks');
  if (await noThanks.count() > 0) {
    const [d2] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      noThanks.first().click(),
    ]);
    await page.waitForTimeout(2000);
    if (d2) {
      const savePath = join(outDir, d2.suggestedFilename());
      await d2.saveAs(savePath);
      console.log('SUCCESS: Saved to', savePath);
      console.log('Size:', statSync(savePath).size, 'bytes');
      await browser.close();
      return;
    }
  }

  // Try clicking the .zip download link directly
  const zipLink = page.locator('a[href*=".zip"], a:has-text("Pixel Crawler"), a:has-text("2.0.4")');
  if (await zipLink.count() > 0) {
    const [d3] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      zipLink.first().click(),
    ]);
    const savePath = join(outDir, d3.suggestedFilename());
    await d3.saveAs(savePath);
    console.log('SUCCESS: Saved to', savePath);
    console.log('Size:', statSync(savePath).size, 'bytes');
  } else {
    console.log('Could not find download link. URL:', page.url());
    await page.screenshot({ path: join(process.cwd(), 'debug-output', 'itch-state.png') });
  }

  await browser.close();
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
