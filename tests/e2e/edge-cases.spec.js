import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

async function bootToHub(page) {
  await gotoGame(page, { seed: 787878, testScenario: 'combat' });
  await expectTestHooks(page);
  await clickStart(page);
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('HubScene');
}

test('edge: linear close-range attack can hit enemy', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
  });

  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    return !!(s && s.player && Array.isArray(s.enemies) && s.enemies.length > 0);
  })).toBe(true);

  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    const target = s.enemies.find((e) => e && e.isAlive);
    s.__testTargetEnemy = target;
    s.player.setPosition(350, 350);
    s.player.facingAngle = 0;
    target.setPosition(390, 350);
    target.hp = 1;
    target.speed = 0;
    s.enemies.forEach((e) => {
      if (e !== target && e && e.isAlive) e.setPosition(2200, 2200);
    });
  });

  await page.keyboard.press('u');

  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    const target = s.__testTargetEnemy;
    return target ? !!target.isAlive : true;
  })).toBe(false);

  await dumpEvidence(page, testInfo, 'edge-linear-hit', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});

test('edge: player can die from normal enemy encounter path', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    return !!(s && s.player && Array.isArray(s.enemies) && s.enemies.length > 0);
  })).toBe(true);

  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    const enemy = s.enemies.find((e) => e && e.isAlive);
    s.player.hp = 1;
    enemy.damage = Math.max(enemy.damage, 999);
    s.player.setPosition(enemy.x + 5, enemy.y + 5);
    enemy.attackCooldown = 0;
  });

  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().level?.playerDead ?? false), { timeout: 15000 }).toBe(true);
  await dumpEvidence(page, testInfo, 'edge-player-die-enemy', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});

test('edge: boss can be killed and player can be killed by boss', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  // Kill boss path
  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await page.evaluate(() => {
    window.__SDS_TEST__.startBoss('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return !!(s && s.player && s.boss);
  })).toBe(true);
  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    s.player.setPosition(560, 420);
    s.player.facingAngle = -Math.PI / 2;
    // Deterministic kill-path trigger in real scene update loop
    s.boss.hp = 0;
    s.boss.isAlive = false;
  });
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return !!(s && s.bossDead);
  }), { timeout: 15000 }).toBe(true);

  // Die by boss path
  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await page.evaluate(() => {
    window.__SDS_TEST__.startBoss('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');
  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    s.player.hp = 1;
    s.boss._dealDamageToPlayer(s.player, 999, 'bite');
  });

  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return !!(s && s.playerDead);
  }), { timeout: 15000 }).toBe(true);

  await dumpEvidence(page, testInfo, 'edge-boss-kill-and-death', { consoleErrors });
  expect(consoleErrors).toEqual([]);
});

test('edge: dialog text stays inside dialog box (no overflow/cover)', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.launchScene('DialogScene', {
      dialog: [
        {
          speaker: '测试角色',
          text: '这是一段非常长非常长的文本，用来验证在对话框中自动换行时不会越出边界，不会覆盖头像区域，也不会超出底部区域。'.repeat(3)
        }
      ]
    }, 'HubScene');
  });

  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().activeScenes.includes('DialogScene'))).toBe(true);

  const withinBounds = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('DialogScene');
    const textBounds = s.dialogText.getBounds();
    const speakerBounds = s.speakerText.getBounds();
    const boxTop = 500;
    const boxBottom = 768;
    const boxLeft = 0;
    const boxRight = 1024;
    return {
      textInside: textBounds.x >= boxLeft && textBounds.right <= boxRight && textBounds.y >= boxTop && textBounds.bottom <= boxBottom,
      speakerInside: speakerBounds.x >= boxLeft && speakerBounds.right <= boxRight && speakerBounds.y >= boxTop && speakerBounds.bottom <= boxBottom
    };
  });

  expect(withinBounds.textInside).toBe(true);
  expect(withinBounds.speakerInside).toBe(true);

  await dumpEvidence(page, testInfo, 'edge-dialog-overflow', { consoleErrors, withinBounds });
  expect(consoleErrors).toEqual([]);
});

test('edge: death while moving should not stay in walk animation', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    return !!(s && s.player && Array.isArray(s.enemies) && s.enemies.length > 0);
  })).toBe(true);

  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    const enemy = s.enemies.find((e) => e && e.isAlive);
    s.player.setPosition(enemy.x - 20, enemy.y);
    s.player.hp = 1;
    enemy.damage = 999;
    enemy.attackCooldown = 0;
  });

  await page.keyboard.down('d');
  await expect.poll(async () => page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    return !!s.playerDead;
  }), { timeout: 15000 }).toBe(true);
  await page.keyboard.up('d');

  const state = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('LevelScene');
    const p = s.player;
    return {
      playerDead: s.playerDead,
      animState: p._animState,
      animDir: p._animDir,
      vx: p.body?.velocity?.x ?? 0,
      vy: p.body?.velocity?.y ?? 0
    };
  });

  expect(state.playerDead).toBe(true);
  expect(state.animState).not.toBe('walk');
  expect(Math.abs(state.vx)).toBeLessThan(1);
  expect(Math.abs(state.vy)).toBeLessThan(1);

  await dumpEvidence(page, testInfo, 'edge-death-walk-animation', { consoleErrors, state });
  expect(consoleErrors).toEqual([]);
});

test('edge: hp bar no drift; dead player cannot continue moving', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await bootToHub(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('wrath');
    window.__SDS_TEST__.startBoss('wrath');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

  const before = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return { x: s.bossHpLabel.x, y: s.bossHpLabel.y };
  });

  await page.keyboard.down('d');
  await page.waitForTimeout(800);
  await page.keyboard.up('d');

  const after = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return { x: s.bossHpLabel.x, y: s.bossHpLabel.y };
  });

  expect(after).toEqual(before);

  await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    s.player.hp = 0;
    s.playerDead = true;
    s.player.freezeForDeath();
  });

  const deadBefore = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return { x: s.player.x, y: s.player.y };
  });

  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');

  const deadAfter = await page.evaluate(() => {
    const s = window.__SDS_GAME__.scene.getScene('BossScene');
    return { x: s.player.x, y: s.player.y };
  });

  expect(Math.abs(deadAfter.x - deadBefore.x)).toBeLessThan(1);
  expect(Math.abs(deadAfter.y - deadBefore.y)).toBeLessThan(1);

  await dumpEvidence(page, testInfo, 'edge-hpbar-drift-dead-move', { consoleErrors, before, after, deadBefore, deadAfter });
  expect(consoleErrors).toEqual([]);
});
