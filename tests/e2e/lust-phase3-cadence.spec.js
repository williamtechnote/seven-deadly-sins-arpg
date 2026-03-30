import { test, expect } from '@playwright/test';
import { attachConsoleCapture, clickStart, dumpEvidence, expectTestHooks, gotoGame } from './helpers/game-driver.js';

test('lust cadence: phase-3 review checkpoints align telegraph and shared recovery evidence', async ({ page }, testInfo) => {
  const consoleErrors = await attachConsoleCapture(page);
  await gotoGame(page, { seed: 20260330, testScenario: 'combat' });
  await expectTestHooks(page);
  await clickStart(page);

  await page.evaluate(() => {
    window.__SDS_TEST__.startLevel('lust');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('LevelScene');
  await page.evaluate(() => {
    window.__SDS_TEST__.startBoss('lust');
  });
  await expect.poll(async () => page.evaluate(() => window.__SDS_TEST__.getSnapshot().scene)).toBe('BossScene');

  await page.evaluate(() => {
    const scene = window.__SDS_GAME__.scene.getScene('BossScene');
    const boss = scene.boss;
    boss.currentPhase = 2;
    boss.phaseTransitioned = boss.config.phases.map(() => true);
    boss.phaseMajorAttackQueue = new Set(['reverseControl', 'illusion', 'mirageDance']);
    boss.phaseAttackCooldownExpires = {};
    boss.phaseAttackGroupRecoveryExpires = {};
    boss.phaseBreatherChainRemaining = 0;
    boss.lastCompletedAttack = null;
    boss.attackState = 'idle';
    boss.currentAttack = null;
    boss.attackData = {};
    boss.attackIndex = 2;
    boss.attackTimer = 0;
    boss.invincibleUntil = 0;
    boss.hp = Math.min(boss.hp, Math.round(boss.maxHp * 0.2));
  });

  await expect.poll(async () => page.evaluate(() => {
    const scene = window.__SDS_GAME__.scene.getScene('BossScene');
    return scene.boss.activeTelegraph ? scene.boss.activeTelegraph.attackLabel : '';
  }), { timeout: 15000 }).toBe('混乱逆转');

  const reviewState = await page.evaluate(() => {
    const scene = window.__SDS_GAME__.scene.getScene('BossScene');
    const phase = scene.boss.config.phases[2];
    const review = window.GameCore.buildBossAttackCadenceReviewChecklist({
      attacks: phase.attacks,
      majorAttacks: ['reverseControl', 'illusion', 'mirageDance'],
      bridgeAttacks: ['dash', 'charmBolt'],
      attackLabels: {
        reverseControl: '混乱逆转',
        illusion: '幻影风暴',
        mirageDance: '魅影连舞'
      },
      counterHints: {
        reverseControl: '反制: 停止冲刺，短步修正方向',
        illusion: '反制: 先躲弹幕，再找本体',
        mirageDance: '反制: 观察真身换位节奏，留翻滚躲最后逆转波'
      },
      sharedRecoveryMs: phase.sharedAttackRecoveryMs.majorSpecial
    });
    return {
      telegraph: scene.boss.activeTelegraph
        ? {
            attackLabel: scene.boss.activeTelegraph.attackLabel,
            counterHint: scene.boss.activeTelegraph.counterHint,
            telegraphDurationMs: scene.boss.activeTelegraph.telegraphDurationMs
          }
        : null,
      review
    };
  });

  expect(reviewState.review.checkpoints).toHaveLength(3);
  expect(reviewState.telegraph?.attackLabel).toBe(reviewState.review.checkpoints[0].telegraphLabel);
  expect(reviewState.telegraph?.counterHint).toBe(reviewState.review.checkpoints[0].telegraphHint);
  expect(reviewState.review.checkpoints[0].recordingFocusLabel).toBe(
    'HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴'
  );

  const recoveryState = await page.evaluate(() => {
    const scene = window.__SDS_GAME__.scene.getScene('BossScene');
    const phase = scene.boss.config.phases[2];
    scene.boss.currentAttack = 'reverseControl';
    scene.boss._finishAttack(scene.time.now);
    const review = window.GameCore.buildBossAttackCadenceReviewChecklist({
      attacks: phase.attacks,
      majorAttacks: ['reverseControl', 'illusion', 'mirageDance'],
      bridgeAttacks: ['dash', 'charmBolt'],
      attackLabels: {
        reverseControl: '混乱逆转',
        illusion: '幻影风暴',
        mirageDance: '魅影连舞'
      },
      counterHints: {
        reverseControl: '反制: 停止冲刺，短步修正方向',
        illusion: '反制: 先躲弹幕，再找本体',
        mirageDance: '反制: 观察真身换位节奏，留翻滚躲最后逆转波'
      },
      sharedRecoveryMs: phase.sharedAttackRecoveryMs.majorSpecial
    });
    return {
      sharedRecoveryRemainingMs: Math.max(0, (scene.boss.phaseAttackGroupRecoveryExpires.majorSpecial || 0) - scene.time.now),
      breatherRemaining: scene.boss.phaseBreatherChainRemaining,
      review
    };
  });

  expect(recoveryState.sharedRecoveryRemainingMs).toBe(10200);
  expect(recoveryState.breatherRemaining).toBe(8);
  expect(recoveryState.review.sharedRecoveryLabel).toBe('shared recovery≈10.2s');

  await dumpEvidence(page, testInfo, 'lust-phase3-cadence-review', {
    consoleErrors,
    reviewState,
    recoveryState
  });
  expect(consoleErrors).toEqual([]);
});
