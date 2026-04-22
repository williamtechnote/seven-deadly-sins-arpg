import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function loadCoreApi() {
    const coreSourcePath = path.join(repoRoot, 'shared/game-core.js');
    let requiredCore = null;
    try {
        requiredCore = createRequire(import.meta.url)(coreSourcePath);
    } catch (error) {
        requiredCore = null;
    }
    if (requiredCore && typeof requiredCore.getScaledWeaponStats === 'function') {
        return requiredCore;
    }

    const coreSource = fs.readFileSync(coreSourcePath, 'utf8');
    const previousGameCore = globalThis.GameCore;
    let fallbackCore = null;
    try {
        globalThis.GameCore = undefined;
        fallbackCore = Function(`${coreSource}\nreturn globalThis.GameCore;`)();
    } finally {
        globalThis.GameCore = previousGameCore;
    }
    if (!fallbackCore || typeof fallbackCore.getScaledWeaponStats !== 'function') {
        throw new Error('Failed to load GameCore API for regression checks');
    }
    return fallbackCore;
}

const core = loadCoreApi();

const {
    WEAPON_SCALING,
    WEAPON_TO_MATERIAL,
    STATUS_EFFECT_DEFS,
    RUN_MODIFIER_POOL,
    DEFAULT_RUN_EFFECTS,
    CRAFTING_RECIPES,
    RUN_EVENT_ROOM_POOL,
    getScaledWeaponStats,
    getUpgradeCostForLevel,
    canUpgradeWeapon,
    applyWeaponUpgrade,
    buildWeaponUpgradeAffordance,
    buildWeaponUpgradeBenefitSummary,
    buildWeaponUpgradePreviewSummary,
    buildWeaponUpgradeRowLabel,
    buildWeaponUpgradeFailureMessage,
    buildWeaponUpgradeSuccessMessage,
    getStatusEffectDef,
    computeStatusTickDamage,
    pickRunModifiers,
    buildRunModifierEffects,
    getRunEventRoomByKey,
    getRunEventRoomChoices,
    normalizeRunEventRoom,
    pickRunEventRoom,
    resolveRunEventRoomChoice,
    buildRunEventRoomChoicePreview,
    buildRunEventRoomChoicePanelPreview,
    getRunEventRoomChoiceAffordabilityLabel,
    getRunEventRoomChoiceFailureMessage,
    buildRunEventRoomEffects,
    buildRunEventRoomHudSummary,
    buildRunEventRoomHudLines,
    getRunEventRoomChoiceEncounterProfile,
    buildRunEventEncounterRoster,
    buildRunEventEncounterFormationSlots,
    buildRunEventEncounterPayoffPresentation,
    buildRunEventEncounterEntryPreview,
    buildRunEventEncounterSourceCue,
    buildRunEventEncounterClearRecap,
    buildRunEventEncounterBossDoorRecap,
    buildRunEventEncounterBossOpeningEcho,
    buildRunEventEncounterBossVictoryRecap,
    buildHubLastRunSummary,
    buildHubPortalChoiceSummary,
    buildBlacksmithPrepRecommendation,
    buildShopPrepRecommendation,
    buildInventoryPrepReview,
    buildRunStartPrepReceipt,
    buildRunStartTargetCue,
    buildFirstCombatTargetCue,
    buildCorridorTargetBridgeCue,
    buildRunEventRoomTargetPostureCue,
    formatRunEventEncounterPayoffTimingLabel,
    buildRunEventRoomChoiceRecommendation,
    buildCraftRecipeAffordance,
    buildCraftRecipeRowLabel,
    buildCraftRecipeQuickSlotPreview,
    buildCraftRecipeBatchReceipt,
    buildCraftRecipeFailureMessage,
    buildCraftRecipeSuccessMessage,
    formatRunEventRoomChoiceEncounterPreview,
    formatRunEventRoomChoiceEncounterTiming,
    getRunEventEncounterProfile,
    getRunChallengeSafeSidebarLabel,
    getRunChallengeInProgressInvalidTargetVisibleFallbacks,
    getRunChallengeCompletedInvalidTargetVisibleFallbacks,
    buildRunChallengeSidebarLines,
    buildRunChallengeSidebarBadge,
    getRunChallengeInProgressBadgeVariants,
    getRunChallengeHiddenInProgressBadgeVariants,
    getRunChallengeUltraCompactSummaryVariants,
    getRunChallengeUltraCompactInProgressSummaryVariants,
    getRunChallengeUltraCompactCompletedSummaryVariants,
    getRunChallengeRegularInProgressDetailVariants,
    getRunChallengeRegularCompletedDetailVariants,
    getRunChallengeCompactInProgressDetailVariants,
    getRunChallengeCompactCompletedDetailVariants,
    formatRunChallengeRewardShortLabel,
    buildRunChallengeCompletedFeedbackText,
    getRunChallengeCompletedBadgeVariants,
    getRunChallengeHiddenCompletedBadgeVariants,
    getRunChallengeSidebarBadgeAppearance,
    getRunModifierHeadingBadgeLayout,
    getRunModifierHeadingPresentation,
    buildRunEventRoomWorldLabelRouteLine,
    buildRunEventRoomWorldLabel,
    buildRunEventRoomPromptLabel,
    formatAimDirectionLabel,
    buildPlayerHudLayout,
    buildCombatActionReadiness,
    buildCombatActionHudLayout,
    buildCombatActionHudSegments,
    buildCombatActionHudSummary,
    getStaminaPayoffPulsePresentation,
    buildQuickSlotItemLabel,
    buildQuickSlotAutoAssignNotice,
    buildQuickSlotAutoAssignResult,
    getViewportTextClampX,
    getViewportCenteredTextClampX,
    getInventoryTooltipClampX,
    clampTextToWidth,
    clampTextLinesToWidth,
    clampTextLinesToWidthAndCount,
    getHudSidebarResponsiveMetrics,
    getHudSidebarHeadingBadgeMetrics,
    getHudSidebarViewportTier,
    getHudSidebarLineCap,
    getHudSidebarOverflowPolicy,
    buildVerticalTextStackLayout,
    buildPriorityTextStackLayout,
    getQuickSlotAutoAssignIndex,
    resolveKeyboardAimState,
    resolveConsumableUse,
    buildStatusHudSummary,
    advanceBossHpAfterimage,
    buildBossAttackRhythmSummary,
    buildBossAttackCadenceTrace,
    buildBossAttackCadenceReviewChecklist,
    buildBossAttackCadenceArtifactBundle,
    buildBossPhaseHudSummary,
    buildBossTelegraphHudSummary,
    buildBossTelegraphTextLayout,
    buildBossStatusHighlightSummary,
    canCraftRecipe,
    applyCraftRecipe,
    serializeSaveData,
    deserializeSaveData,
    DEFAULT_SAVE_DATA
} = core;

function loadDataConstants() {
    const dataSource = fs.readFileSync(path.join(repoRoot, 'data.js'), 'utf8');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(`${dataSource}\n;globalThis.__DATA__ = { GAME_CONFIG, WEAPONS, ITEMS, BOSSES, ENEMIES };`, sandbox);
    return sandbox.__DATA__;
}

function loadGameSource() {
    return fs.readFileSync(path.join(repoRoot, 'game.js'), 'utf8');
}

function loadReadmeSource() {
    return fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
}

function runTest(name, fn) {
    try {
        fn();
        console.log(`PASS ${name}`);
    } catch (err) {
        console.error(`FAIL ${name}`);
        throw err;
    }
}

function testWeaponScalingMonotonicity() {
    const { WEAPONS } = loadDataConstants();
    assert.ok(WEAPONS && Object.keys(WEAPONS).length > 0, 'WEAPONS should exist');

    for (const weaponKey of Object.keys(WEAPONS)) {
        let prev = getScaledWeaponStats(WEAPONS, weaponKey, 1, WEAPON_SCALING);
        for (let level = 2; level <= 8; level++) {
            const cur = getScaledWeaponStats(WEAPONS, weaponKey, level, WEAPON_SCALING);
            assert.ok(cur.damage >= prev.damage, `${weaponKey} damage should be non-decreasing`);
            assert.ok(cur.attackSpeed <= prev.attackSpeed, `${weaponKey} attackSpeed should be non-increasing`);
            assert.ok(cur.specialCooldown <= prev.specialCooldown, `${weaponKey} specialCooldown should be non-increasing`);
            assert.ok(cur.staminaCost <= prev.staminaCost, `${weaponKey} staminaCost should be non-increasing`);
            assert.ok(cur.specialStaminaCost <= prev.specialStaminaCost, `${weaponKey} specialStaminaCost should be non-increasing`);
            prev = cur;
        }
    }
}

function testSwordEarlyReachBaseline() {
    const { WEAPONS } = loadDataConstants();
    assert.equal(WEAPONS.sword.range, 55, 'sword base range should be nudged to 55 for safer early spacing');
}

function testNormalEnemyPressureBaseline() {
    const { ENEMIES, BOSSES } = loadDataConstants();
    const expectedEnemySpeeds = {
        wrathSoldier: 66,
        wrathArcher: 56,
        wrathBrute: 47,
        prideKnight: 71,
        prideArcher: 61,
        prideSentinel: 52,
        envyCrawler: 75,
        envyMimic: 66,
        envyShifter: 56,
        slothSpider: 47,
        slothDreamer: 38,
        slothCocoon: 33,
        greedGolem: 52,
        greedThief: 85,
        greedGuardian: 42,
        gluttonySlime: 38,
        gluttonyMaw: 56,
        gluttonyBloat: 28,
        lustFairy: 89,
        lustCharm: 56,
        lustGuard: 66
    };
    const expectedBossSpeeds = {
        pride: 120,
        envy: 140,
        wrath: 100,
        sloth: 60,
        greed: 110,
        gluttony: 80,
        lust: 150,
        final: 130
    };

    Object.entries(expectedEnemySpeeds).forEach(([enemyKey, expectedSpeed]) => {
        assert.equal(
            ENEMIES[enemyKey].speed,
            expectedSpeed,
            `${enemyKey} speed should be lowered to the calmer baseline`
        );
    });
    Object.entries(expectedBossSpeeds).forEach(([bossKey, expectedSpeed]) => {
        assert.equal(
            BOSSES[bossKey].speed,
            expectedSpeed,
            `${bossKey} boss speed should remain on the existing difficulty baseline`
        );
    });
}

function computeSwordOpeningCoverage(targetSpeeds, options) {
    const {
        playerSpeed,
        swordRange,
        startDistances,
        targetRange,
        playerWindupMs,
        targetWindupMs,
        safeLeadMs
    } = options;
    let safeCount = 0;
    let totalCount = 0;

    Object.values(targetSpeeds).forEach((targetSpeed) => {
        startDistances.forEach((distance) => {
            const playerReadyMs = (Math.max(0, distance - swordRange) / playerSpeed) * 1000 + playerWindupMs;
            const targetImpactMs = (Math.max(0, distance - targetRange) / targetSpeed) * 1000 + targetWindupMs;
            if ((targetImpactMs - playerReadyMs) >= safeLeadMs) {
                safeCount += 1;
            }
            totalCount += 1;
        });
    });

    return safeCount / totalCount;
}

function testSwordOpeningBalanceWindow() {
    const { GAME_CONFIG, WEAPONS, ENEMIES, BOSSES } = loadDataConstants();
    const legacyEnemySpeeds = {
        wrathSoldier: 70,
        wrathArcher: 60,
        wrathBrute: 50,
        prideKnight: 75,
        prideArcher: 65,
        prideSentinel: 55,
        envyCrawler: 80,
        envyMimic: 70,
        envyShifter: 60,
        slothSpider: 50,
        slothDreamer: 40,
        slothCocoon: 35,
        greedGolem: 55,
        greedThief: 90,
        greedGuardian: 45,
        gluttonySlime: 40,
        gluttonyMaw: 60,
        gluttonyBloat: 30,
        lustFairy: 95,
        lustCharm: 60,
        lustGuard: 70
    };
    const stableBossSpeeds = {
        pride: 120,
        envy: 140,
        wrath: 100,
        sloth: 60,
        greed: 110,
        gluttony: 80,
        lust: 150,
        final: 130
    };
    const startDistances = [80, 90, 100, 110];
    const playerSpeed = GAME_CONFIG.PLAYER.speed;
    const swordRange = WEAPONS.sword.range;
    const safeLeadMs = 350;
    const playerWindupMs = 220;

    const enemyCoverageBefore = computeSwordOpeningCoverage(legacyEnemySpeeds, {
        playerSpeed,
        swordRange,
        startDistances,
        targetRange: 40,
        playerWindupMs,
        targetWindupMs: 180,
        safeLeadMs
    });
    const enemyCoverageAfter = computeSwordOpeningCoverage(
        Object.fromEntries(Object.entries(ENEMIES).map(([key, config]) => [key, config.speed])),
        {
            playerSpeed,
            swordRange,
            startDistances,
            targetRange: 40,
            playerWindupMs,
            targetWindupMs: 180,
            safeLeadMs
        }
    );
    assert.ok(
        enemyCoverageAfter >= enemyCoverageBefore + 0.03,
        `normal-enemy sword opening coverage should improve materially (before=${enemyCoverageBefore.toFixed(3)}, after=${enemyCoverageAfter.toFixed(3)})`
    );

    const bossCoverageBaseline = computeSwordOpeningCoverage(stableBossSpeeds, {
        playerSpeed,
        swordRange,
        startDistances,
        targetRange: 55,
        playerWindupMs,
        targetWindupMs: 260,
        safeLeadMs
    });
    const bossCoverageCurrent = computeSwordOpeningCoverage(
        Object.fromEntries(Object.entries(BOSSES).map(([key, config]) => [key, config.speed])),
        {
            playerSpeed,
            swordRange,
            startDistances,
            targetRange: 55,
            playerWindupMs,
            targetWindupMs: 260,
            safeLeadMs
        }
    );
    assert.ok(
        Math.abs(bossCoverageCurrent - bossCoverageBaseline) <= 0.001,
        `boss sword opening coverage should stay effectively unchanged (baseline=${bossCoverageBaseline.toFixed(3)}, current=${bossCoverageCurrent.toFixed(3)})`
    );
}

function testMaterialBoundUpgradeChecks() {
    const state = {
        gold: 1000,
        inventory: {
            wrathEssence: 5,
            greedEssence: 9
        },
        weaponLevels: {
            sword: 1,
            hammer: 1
        }
    };

    const hammerRequirement = WEAPON_TO_MATERIAL.hammer;
    assert.equal(hammerRequirement, 'wrathEssence', 'hammer should require wrathEssence');

    const levelOneCost = getUpgradeCostForLevel(1);
    const ok = canUpgradeWeapon(state, 'hammer');
    assert.equal(ok.ok, true, 'hammer should be upgradable with required material');
    assert.equal(ok.cost.gold, levelOneCost.gold);
    assert.equal(ok.cost.essence, levelOneCost.essence);
    assert.equal(ok.requiredMaterialKey, 'wrathEssence');

    const wrongMaterialState = {
        ...state,
        inventory: {
            wrathEssence: 0,
            greedEssence: 50
        }
    };
    const blocked = canUpgradeWeapon(wrongMaterialState, 'hammer');
    assert.equal(blocked.ok, false, 'upgrade must fail when only wrong materials exist');
    assert.equal(blocked.reason, 'material');

    const applied = applyWeaponUpgrade(state, 'hammer');
    assert.equal(applied.ok, true, 'upgrade should apply');
    assert.equal(applied.weaponKey, 'hammer', 'upgrade result should preserve which weapon generated the success receipt');
    assert.equal(applied.nextState.gold, state.gold - levelOneCost.gold, 'gold should be deducted');
    assert.equal(applied.nextState.inventory.wrathEssence, state.inventory.wrathEssence - levelOneCost.essence, 'bound material should be deducted');
    assert.equal(applied.nextState.inventory.greedEssence, state.inventory.greedEssence, 'other materials should remain untouched');
    assert.equal(applied.nextState.weaponLevels.hammer, 2, 'weapon level should increase');
}

function testWeaponUpgradeMessageHelpers() {
    const { ITEMS, WEAPONS } = loadDataConstants();
    assert.equal(typeof buildWeaponUpgradeFailureMessage, 'function', 'upgrade failure message helper should be exported');
    assert.equal(typeof buildWeaponUpgradeSuccessMessage, 'function', 'upgrade success message helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);

    const fullFailureTarget = '材料不足! 需要2个暴怒之精华';
    assert.equal(
        buildWeaponUpgradeFailureMessage({
            reason: 'material',
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, {
            maxWidth: measureTextWidth(fullFailureTarget),
            measureTextWidth
        }),
        fullFailureTarget,
        'upgrade material failure should keep the full blocker detail when width allows'
    );

    const compactFailureTarget = '材料不足! 需要2个暴怒';
    assert.equal(
        buildWeaponUpgradeFailureMessage({
            reason: 'material',
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, {
            maxWidth: measureTextWidth(compactFailureTarget),
            measureTextWidth
        }),
        compactFailureTarget,
        'upgrade material failure should compact the essence name before it drops the blocker count'
    );

    const countOnlyFailureTarget = '材料不足! 需要2个';
    assert.equal(
        buildWeaponUpgradeFailureMessage({
            reason: 'material',
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, {
            maxWidth: measureTextWidth(countOnlyFailureTarget),
            measureTextWidth
        }),
        countOnlyFailureTarget,
        'upgrade material failure should preserve the blocker count when width gets tighter again'
    );

    const fullSuccessWithCumulativeTarget = '强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 / 特攻-0.3s / 体耗-3 · 消耗2个暴怒之精华';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 2,
            nextLevel: 3,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(fullSuccessWithCumulativeTarget),
            measureTextWidth
        }),
        fullSuccessWithCumulativeTarget,
        'later upgrade success messages should keep the current-step payoff, cumulative post-upgrade total, and spent material anchor together when width allows'
    );

    const mediumSuccessWithCompactCumulativeSpendTarget = '强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计+9 / 特攻-0.3s · 消耗2个暴怒';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 2,
            nextLevel: 3,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(mediumSuccessWithCompactCumulativeSpendTarget),
            measureTextWidth
        }),
        mediumSuccessWithCompactCumulativeSpendTarget,
        'later upgrade success messages should preserve a compact cumulative-plus-spend anchor at medium widths before they drop back to cumulative-only or payoff-only copy'
    );

    const tightSuccessWithCumulativeSpendAnchorTarget = '强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 · 消耗2个暴怒';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 2,
            nextLevel: 3,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(tightSuccessWithCumulativeSpendAnchorTarget),
            measureTextWidth
        }),
        tightSuccessWithCumulativeSpendAnchorTarget,
        'later upgrade success messages should keep at least one cumulative segment plus a compact spend anchor before they fall back to the older payoff ladder'
    );

    const ultraTightSuccessWithCumulativeAnchorTarget = '强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 2,
            nextLevel: 3,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(ultraTightSuccessWithCumulativeAnchorTarget),
            measureTextWidth
        }),
        ultraTightSuccessWithCumulativeAnchorTarget,
        'later upgrade success messages should still keep the cumulative first segment once the compact spend anchor no longer fits'
    );

    const fullSuccessWithMaterialTarget = '强化成功! Lv.1→Lv.2 · 本次伤害+4 / 特攻-0.2s / 体耗-2 · 消耗2个暴怒之精华';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 1,
            nextLevel: 2,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(fullSuccessWithMaterialTarget),
            measureTextWidth
        }),
        fullSuccessWithMaterialTarget,
        'upgrade success message should keep the level transition, full payoff receipt, and spent material anchor when width allows'
    );

    const fullSuccessTarget = '强化成功! Lv.1→Lv.2 · 本次伤害+4 / 特攻-0.2s / 体耗-2';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 1,
            nextLevel: 2,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(fullSuccessTarget),
            measureTextWidth
        }),
        fullSuccessTarget,
        'upgrade success message should keep the success conclusion plus the full payoff receipt when width allows'
    );

    const compactSuccessTarget = '强化成功! Lv.1→Lv.2 · 本次伤害+4';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 1,
            nextLevel: 2,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(compactSuccessTarget),
            measureTextWidth
        }),
        compactSuccessTarget,
        'upgrade success message should preserve the level-transition anchor before it falls back from the full payoff receipt'
    );

    const countOnlySuccessTarget = '强化成功! Lv.1→Lv.2';
    assert.equal(
        buildWeaponUpgradeSuccessMessage({
            weaponKey: 'sword',
            level: 1,
            nextLevel: 2,
            cost: { essence: 2 },
            requiredMaterialKey: 'wrathEssence'
        }, ITEMS, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(countOnlySuccessTarget),
            measureTextWidth
        }),
        countOnlySuccessTarget,
        'upgrade success message should preserve the level-transition anchor when width gets tighter again'
    );
}

function testWeaponUpgradeAffordance() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildWeaponUpgradeAffordance, 'function', 'upgrade affordance helper should be exported');

    assert.deepEqual(
        buildWeaponUpgradeAffordance('hammer', {
            gold: 250,
            inventory: {
                wrathEssence: 2
            },
            weaponLevels: {
                hammer: 2
            }
        }, ITEMS),
        {
            label: '可强化',
            canUpgrade: true,
            blockedReason: null,
            missingItemKey: null,
            missingCount: 0
        },
        'upgrade affordance should expose a pre-click ready state when the weapon is currently affordable'
    );

    assert.deepEqual(
        buildWeaponUpgradeAffordance('hammer', {
            gold: 200,
            inventory: {
                wrathEssence: 2
            },
            weaponLevels: {
                hammer: 2
            }
        }, ITEMS),
        {
            label: '差50金',
            canUpgrade: false,
            blockedReason: 'gold',
            missingItemKey: null,
            missingCount: 0
        },
        'upgrade affordance should expose the exact gold shortfall before clicking'
    );

    assert.deepEqual(
        buildWeaponUpgradeAffordance('hammer', {
            gold: 250,
            inventory: {
                wrathEssence: 0
            },
            weaponLevels: {
                hammer: 2
            }
        }, ITEMS),
        {
            label: '差2个暴怒之精华',
            canUpgrade: false,
            blockedReason: 'material',
            missingItemKey: 'wrathEssence',
            missingCount: 2
        },
        'upgrade affordance should expose the missing essence before clicking'
    );
}

function testWeaponUpgradeBenefitSummary() {
    const { ITEMS, WEAPONS } = loadDataConstants();
    assert.equal(typeof buildWeaponUpgradeBenefitSummary, 'function', 'upgrade benefit summary helper should be exported');
    assert.equal(typeof buildWeaponUpgradePreviewSummary, 'function', 'upgrade preview summary helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);

    const fullBenefitTarget = '伤害+4 / 特攻-0.2s / 体耗-2';
    assert.equal(
        buildWeaponUpgradeBenefitSummary('sword', 1, 2, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(fullBenefitTarget),
            measureTextWidth
        }),
        fullBenefitTarget,
        'upgrade benefit summary should expose the next-level damage, special cooldown, and stamina payoff when width allows'
    );

    const compactBenefitTarget = '伤害+4 / 特攻-0.2s';
    assert.equal(
        buildWeaponUpgradeBenefitSummary('sword', 1, 2, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(compactBenefitTarget),
            measureTextWidth
        }),
        compactBenefitTarget,
        'upgrade benefit summary should drop the third stat before it sacrifices the primary damage and cooldown payoff'
    );

    const singleBenefitTarget = '伤害+4';
    assert.equal(
        buildWeaponUpgradeBenefitSummary('sword', 1, 2, WEAPONS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(singleBenefitTarget),
            measureTextWidth
        }),
        singleBenefitTarget,
        'upgrade benefit summary should preserve at least one core payoff when width gets tight'
    );

    const fullPreviewTarget = '长剑 Lv.1 · 可强化 · 本次伤害+4 / 特攻-0.2s / 体耗-2';
    assert.equal(
        buildWeaponUpgradePreviewSummary('sword', {
            gold: 100,
            inventory: {
                greedEssence: 1
            },
            weaponLevels: {
                sword: 1
            }
        }, WEAPONS, ITEMS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(fullPreviewTarget),
            measureTextWidth
        }),
        fullPreviewTarget,
        'upgrade preview summary should compose the weapon name, affordability label, and next-level payoff when width allows'
    );

    const preservedBenefitTarget = '长剑 Lv.2 · 累计+下次 · 累计伤害+4 / 本次伤害+5';
    assert.equal(
        buildWeaponUpgradePreviewSummary('sword', {
            gold: 250,
            inventory: {
                greedEssence: 0
            },
            weaponLevels: {
                sword: 2
            }
        }, WEAPONS, ITEMS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(preservedBenefitTarget),
            measureTextWidth
        }),
        preservedBenefitTarget,
        'upgrade preview summary should surface a non-max cumulative-plus-next payoff summary before it falls back to blocker-only copy'
    );

    const compactLayerAnchorTarget = '长剑 Lv.2 · 累计+4 / 下次+5';
    assert.equal(
        buildWeaponUpgradePreviewSummary('sword', {
            gold: 250,
            inventory: {
                greedEssence: 0
            },
            weaponLevels: {
                sword: 2
            }
        }, WEAPONS, ITEMS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(compactLayerAnchorTarget),
            measureTextWidth
        }),
        compactLayerAnchorTarget,
        'upgrade preview summary should keep both cumulative and next layer anchors in a compact value-pair fallback before it drops to single-layer or blocker-only copy'
    );

    const maxLevelEchoTarget = '长剑 Lv.3 · 已满级 · 累计伤害+9 / 特攻-0.3s / 体耗-3';
    assert.equal(
        buildWeaponUpgradePreviewSummary('sword', {
            gold: 0,
            inventory: {},
            weaponLevels: {
                sword: 3
            }
        }, WEAPONS, ITEMS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(maxLevelEchoTarget),
            measureTextWidth
        }),
        maxLevelEchoTarget,
        'upgrade preview summary should keep a max-level purchased-benefit echo visible once no further upgrade exists'
    );

    const compactMaxLevelEchoTarget = '长剑 Lv.3 · 满阶 · 累计伤害+9';
    assert.equal(
        buildWeaponUpgradePreviewSummary('sword', {
            gold: 0,
            inventory: {},
            weaponLevels: {
                sword: 3
            }
        }, WEAPONS, ITEMS, WEAPON_SCALING, {
            maxWidth: measureTextWidth(compactMaxLevelEchoTarget),
            measureTextWidth
        }),
        compactMaxLevelEchoTarget,
        'upgrade preview summary should compact the max-level status before it drops the purchased-benefit echo'
    );
}

function testWeaponUpgradeRowLabel() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildWeaponUpgradeRowLabel, 'function', 'upgrade row label helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);

    const fullTarget = '[强化] 250金+2暴怒之精华';
    assert.equal(
        buildWeaponUpgradeRowLabel('hammer', 2, ITEMS, {
            maxWidth: measureTextWidth(fullTarget),
            measureTextWidth
        }),
        fullTarget,
        'upgrade row label should keep the full gold and material cost when width allows'
    );

    const compactMaterialTarget = '[强化] 250金+2暴怒';
    assert.equal(
        buildWeaponUpgradeRowLabel('hammer', 2, ITEMS, {
            maxWidth: measureTextWidth(compactMaterialTarget),
            measureTextWidth
        }),
        compactMaterialTarget,
        'upgrade row label should compact the essence name before it drops the material cost'
    );

    const costOnlyTarget = '[强化] 250金+2个';
    assert.equal(
        buildWeaponUpgradeRowLabel('hammer', 2, ITEMS, {
            maxWidth: measureTextWidth(costOnlyTarget),
            measureTextWidth
        }),
        costOnlyTarget,
        'upgrade row label should keep the action plus gold/material counts before it falls back to gold-only copy'
    );

    const maxLevelTarget = '已满级';
    assert.equal(
        buildWeaponUpgradeRowLabel('hammer', 3, ITEMS, {
            maxWidth: measureTextWidth(maxLevelTarget),
            measureTextWidth
        }),
        maxLevelTarget,
        'upgrade row label should expose an explicit max-level status instead of leaving the action slot blank'
    );

    const compactMaxLevelTarget = '满阶';
    assert.equal(
        buildWeaponUpgradeRowLabel('hammer', 3, ITEMS, {
            maxWidth: measureTextWidth(compactMaxLevelTarget),
            measureTextWidth
        }),
        compactMaxLevelTarget,
        'upgrade row label should compact the max-level status before the action slot collapses back to empty'
    );
}

function testSaveLoadIntegrity() {
    const resolvedEventRoom = {
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
        selectedChoiceRecommendationReason: '',
        resolutionText: '失去 30 生命，获得 120 金币'
    };
    const source = {
        inventory: { wrathEssence: 2, hpPotion: 3 },
        gold: 456,
        defeatedBosses: ['wrath', 'envy'],
        sinSeals: ['wrath'],
        weaponLevels: { ...DEFAULT_SAVE_DATA.weaponLevels, hammer: 2 },
        unlockedWeapons: ['sword', 'hammer'],
        selectedWeaponKey: 'hammer',
        runModifiers: ['frenziedFoes', 'fortuneWindfall'],
        runEventRoom: resolvedEventRoom,
        lastRunSummary: {
            bossLabel: '已讨伐 色欲 · 色欲魔窟',
            routeRecap: '淘金路线 · 带赏收官',
            choiceLabel: '豪赌',
            recommendationReason: '当前更宜稳押'
        },
        quickSlots: ['hpPotion', null, 'staminaPotion', null]
    };

    const raw = serializeSaveData(source);
    const loaded = deserializeSaveData(raw);
    assert.deepEqual(loaded, {
        inventory: { wrathEssence: 2, hpPotion: 3 },
        gold: 456,
        defeatedBosses: ['wrath', 'envy'],
        sinSeals: ['wrath'],
        weaponLevels: { ...DEFAULT_SAVE_DATA.weaponLevels, hammer: 2 },
        unlockedWeapons: ['sword', 'hammer'],
        selectedWeaponKey: 'hammer',
        runModifiers: ['frenziedFoes', 'fortuneWindfall'],
        runEventRoom: {
            key: 'gamblersShrine',
            name: '赌徒圣坛',
            description: '以生命为筹码，换取不同档位的金币回报',
            type: 'trade',
            discovered: true,
            resolved: true,
            selectedChoiceKey: 'highStakeWager',
            selectedChoiceLabel: '豪赌',
            selectedChoiceRecommendationReason: '',
            resolutionText: '失去 30 生命，获得 120 金币',
            encounterProfilePending: false
        },
        lastRunSummary: {
            bossLabel: '已讨伐 色欲 · 色欲魔窟',
            routeRecap: '淘金路线 · 带赏收官',
            choiceLabel: '豪赌',
            recommendationReason: '当前更宜稳押'
        },
        quickSlots: ['hpPotion', null, 'staminaPotion', null]
    }, 'serialized+deserialized state should stay stable');

    const corrupted = deserializeSaveData('this is not json');
    assert.deepEqual(corrupted, DEFAULT_SAVE_DATA, 'corrupted save should fallback to defaults');
}

function testHubLastRunSummaryHelper() {
    assert.equal(typeof buildHubLastRunSummary, 'function', 'hub last-run summary helper should be exported');

    assert.deepEqual(
        buildHubLastRunSummary({
            bossLabel: '已讨伐 色欲 · 色欲魔窟',
            routeRecap: '淘金路线 · 带赏收官',
            choiceLabel: '豪赌',
            recommendationReason: '当前更宜稳押'
        }),
        {
            visible: true,
            title: '上轮战报',
            lines: [
                '已讨伐 色欲 · 色欲魔窟',
                '淘金路线 · 带赏收官',
                '源于 豪赌 · 当前更宜稳押'
            ]
        },
        'hub last-run summary helper should keep boss, route, and routed choice reason in a compact three-line block'
    );

    assert.deepEqual(
        buildHubLastRunSummary({
            bossLabel: '已讨伐 傲慢 · 傲慢战场',
            routeRecap: '高压路线 · 顶压收官',
            choiceLabel: '借势修习',
            recommendationReason: ''
        }),
        {
            visible: true,
            title: '上轮战报',
            lines: [
                '已讨伐 傲慢 · 傲慢战场',
                '高压路线 · 顶压收官',
                '源于 借势修习'
            ]
        },
        'hub last-run summary helper should keep the source choice line even when no recommendation reason was stored'
    );

    assert.deepEqual(
        buildHubLastRunSummary({
            bossLabel: '已讨伐 暴怒 · 暴怒刑场',
            routeRecap: '缓冲路线 · 稳线收官'
        }),
        {
            visible: true,
            title: '上轮战报',
            lines: [
                '已讨伐 暴怒 · 暴怒刑场',
                '缓冲路线 · 稳线收官'
            ]
        },
        'hub last-run summary helper should stay readable with a two-line fallback when only boss and route recap exist'
    );

    assert.deepEqual(
        buildHubLastRunSummary(null),
        {
            visible: false,
            title: '上轮战报',
            lines: []
        },
        'hub last-run summary helper should stay hidden when no recap payload exists'
    );
}

function testHubPortalChoiceSummaryHelper() {
    assert.equal(typeof buildHubPortalChoiceSummary, 'function', 'hub portal choice summary helper should be exported');

    assert.deepEqual(
        buildHubPortalChoiceSummary({
            bossLabel: '已讨伐 色欲 · 色欲魔窟',
            routeRecap: '淘金路线 · 带赏收官',
            choiceLabel: '豪赌',
            recommendationReason: '当前更宜稳押'
        }, {
            label: '傲慢 天空神殿',
            bossKey: 'pride'
        }),
        {
            visible: true,
            title: '选门参考',
            lines: [
                '目标 傲慢 天空神殿',
                '门前 稳线读招',
                '上轮 淘金路线 · 带赏收官',
                '源于 豪赌 · 当前更宜稳押'
            ]
        },
        'hub portal choice summary helper should keep target, boss posture, route, and routed source reason in one compact decision card'
    );

    assert.deepEqual(
        buildHubPortalChoiceSummary({
            bossLabel: '已讨伐 暴怒 · 暴怒刑场',
            routeRecap: '',
            choiceLabel: '',
            recommendationReason: ''
        }, {
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        {
            visible: true,
            title: '选门参考',
            lines: [
                '目标 色欲 幻梦花园',
                '门前 稳拍反制',
                '上轮 已讨伐 暴怒 · 暴怒刑场'
            ]
        },
        'hub portal choice summary helper should fall back to the previous boss recap when no route recap survives and still keep the target cue'
    );

    assert.deepEqual(
        buildHubPortalChoiceSummary(null, {
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        {
            visible: true,
            title: '选门参考',
            lines: [
                '目标 色欲 幻梦花园',
                '门前 稳拍反制'
            ]
        },
        'hub portal choice summary helper should stay useful with target-only framing when no last-run summary exists'
    );

    assert.deepEqual(
        buildHubPortalChoiceSummary(null, '傲慢 · 傲慢王庭'),
        {
            visible: false,
            title: '选门参考',
            lines: []
        },
        'hub portal choice summary helper should stay hidden for legacy string payloads when no last-run summary exists'
    );

    assert.deepEqual(
        buildHubPortalChoiceSummary({
            bossLabel: '已讨伐 暴食 · 暴食盛宴'
        }, ''),
        {
            visible: false,
            title: '选门参考',
            lines: []
        },
        'hub portal choice summary helper should stay hidden when no portal target is in focus'
    );
}

function testBlacksmithPrepRecommendationHelper() {
    assert.equal(typeof buildBlacksmithPrepRecommendation, 'function', 'blacksmith prep recommendation helper should be exported');

    assert.deepEqual(
        buildBlacksmithPrepRecommendation({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        {
            visible: true,
            title: '备战参考',
            lines: [
                '目标 暴怒 · 回体扛压',
                '推荐 净化药剂 · 稳场备净'
            ],
            recipeKey: 'cleanseTonic'
        },
        'blacksmith prep recommendation helper should turn a sustain-heavy target posture into a concrete stabilize-first craft recommendation'
    );

    assert.deepEqual(
        buildBlacksmithPrepRecommendation({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        {
            visible: true,
            title: '备战参考',
            lines: [
                '目标 色欲 · 稳拍反制',
                '推荐 狂战油 · 抢势开刃'
            ],
            recipeKey: 'berserkerOil'
        },
        'blacksmith prep recommendation helper should turn a pressure-heavy target posture into a committed damage-prep recommendation'
    );

    assert.deepEqual(
        buildBlacksmithPrepRecommendation('傲慢 · 天空神殿'),
        {
            visible: false,
            title: '备战参考',
            lines: [],
            recipeKey: ''
        },
        'blacksmith prep recommendation helper should stay hidden for legacy string targets without boss-aware posture data'
    );

    assert.deepEqual(
        buildBlacksmithPrepRecommendation(null),
        {
            visible: false,
            title: '备战参考',
            lines: [],
            recipeKey: ''
        },
        'blacksmith prep recommendation helper should stay hidden when no prep target payload exists'
    );
}

function testShopPrepRecommendationHelper() {
    const { ITEMS } = loadDataConstants();
    assert.equal(ITEMS.cleanseTonic.price, 55, 'cleanse tonic should stay merchant-buyable for shop prep recommendations');
    assert.equal(ITEMS.berserkerOil.price, 65, 'berserker oil should stay merchant-buyable for shop prep recommendations');
    assert.equal(typeof buildShopPrepRecommendation, 'function', 'shop prep recommendation helper should be exported');

    assert.deepEqual(
        buildShopPrepRecommendation({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        {
            visible: true,
            title: '采购参考',
            lines: [
                '目标 暴怒 · 回体扛压',
                '推荐 净化药剂 · 稳场备净'
            ],
            itemKey: 'cleanseTonic'
        },
        'shop prep recommendation helper should turn a sustain-heavy target posture into a concrete merchant purchase recommendation'
    );

    assert.deepEqual(
        buildShopPrepRecommendation({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        {
            visible: true,
            title: '采购参考',
            lines: [
                '目标 色欲 · 稳拍反制',
                '推荐 狂战油 · 抢势开刃'
            ],
            itemKey: 'berserkerOil'
        },
        'shop prep recommendation helper should turn a pressure-heavy target posture into a committed merchant purchase recommendation'
    );

    assert.deepEqual(
        buildShopPrepRecommendation('傲慢 · 天空神殿'),
        {
            visible: false,
            title: '采购参考',
            lines: [],
            itemKey: ''
        },
        'shop prep recommendation helper should stay hidden for legacy string targets without boss-aware posture data'
    );

    assert.deepEqual(
        buildShopPrepRecommendation(null),
        {
            visible: false,
            title: '采购参考',
            lines: [],
            itemKey: ''
        },
        'shop prep recommendation helper should stay hidden when no prep target payload exists'
    );
}

function testInventoryPrepReviewHelper() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildInventoryPrepReview, 'function', 'inventory prep review helper should be exported');

    assert.deepEqual(
        buildInventoryPrepReview(
            {
                label: '色欲 幻梦花园',
                bossKey: 'lust'
            },
            {
                inventory: {
                    berserkerOil: 2
                },
                quickSlots: [null, 'berserkerOil', null, null]
            },
            ITEMS
        ),
        {
            visible: true,
            title: '备战复查',
            lines: [
                '目标 色欲 · 稳拍反制',
                '复查 狂战油 · 背包已有2 · 快捷栏2'
            ],
            itemKey: 'berserkerOil',
            ownedCount: 2,
            quickSlotIndex: 1
        },
        'inventory prep review helper should show the recommended consumable together with owned count and ready quick-slot anchor'
    );

    assert.deepEqual(
        buildInventoryPrepReview(
            {
                label: '暴怒 熔岩锻炉',
                bossKey: 'wrath'
            },
            {
                inventory: {},
                quickSlots: [null, null, null, null]
            },
            ITEMS
        ),
        {
            visible: true,
            title: '备战复查',
            lines: [
                '目标 暴怒 · 回体扛压',
                '复查 净化药剂 · 背包暂无 · 快捷栏待补'
            ],
            itemKey: 'cleanseTonic',
            ownedCount: 0,
            quickSlotIndex: null
        },
        'inventory prep review helper should stay useful when the recommended consumable is still missing and not slotted'
    );

    assert.deepEqual(
        buildInventoryPrepReview('傲慢 · 天空神殿', { inventory: {}, quickSlots: [] }, ITEMS),
        {
            visible: false,
            title: '备战复查',
            lines: [],
            itemKey: '',
            ownedCount: 0,
            quickSlotIndex: null
        },
        'inventory prep review helper should stay hidden for legacy string targets without boss-aware posture data'
    );

    assert.deepEqual(
        buildInventoryPrepReview(null, null, ITEMS),
        {
            visible: false,
            title: '备战复查',
            lines: [],
            itemKey: '',
            ownedCount: 0,
            quickSlotIndex: null
        },
        'inventory prep review helper should stay hidden when no prep target payload exists'
    );
}

function testRunStartPrepReceiptHelper() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildRunStartPrepReceipt, 'function', 'run-start prep receipt helper should be exported');

    const equippedReceipt = buildRunStartPrepReceipt(
        { label: '色欲 幻梦花园', bossKey: 'lust' },
        { inventory: { berserkerOil: 2 }, quickSlots: ['berserkerOil', null, null, null] },
        ITEMS
    );
    assert.deepEqual(equippedReceipt, {
        visible: true,
        title: '开局备战',
        lines: [
            '目标 色欲 · 稳拍反制',
            '✓ 已挂狂战油'
        ],
        itemKey: 'berserkerOil',
        ownedCount: 2,
        quickSlotIndex: 0
    }, 'run-start prep receipt should confirm when the recommended consumable is already slotted');

    const unslottedReceipt = buildRunStartPrepReceipt(
        { label: '暴怒 熔岩锻炉', bossKey: 'wrath' },
        { inventory: { cleanseTonic: 1 }, quickSlots: [null, null, null, null] },
        ITEMS
    );
    assert.equal(unslottedReceipt.lines[1], '○ 已备净化药剂', 'run-start prep receipt should flag carried but unslotted consumables');

    const missingReceipt = buildRunStartPrepReceipt(
        { label: '暴怒 熔岩锻炉', bossKey: 'wrath' },
        { inventory: {}, quickSlots: [null, null, null, null] },
        ITEMS
    );
    assert.equal(missingReceipt.lines[1], '✗ 缺净化药剂', 'run-start prep receipt should flag missing prep when the item is not carried');

    const hiddenReceipt = buildRunStartPrepReceipt(null, { inventory: {}, quickSlots: [] }, ITEMS);
    assert.deepEqual(hiddenReceipt, {
        visible: false,
        title: '开局备战',
        lines: [],
        itemKey: '',
        ownedCount: 0,
        quickSlotIndex: null
    }, 'run-start prep receipt should stay hidden without a valid portal-prep target');
}

function testRunStartTargetCueHelper() {
    assert.equal(typeof buildRunStartTargetCue, 'function', 'run-start target cue helper should be exported');

    assert.equal(
        buildRunStartTargetCue({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        '目标 色欲 · 稳拍反制',
        'run-start target cue helper should compress the boss-aware portal framing into one short level-entry cue'
    );

    assert.equal(
        buildRunStartTargetCue({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        '目标 暴怒 · 回体扛压',
        'run-start target cue helper should reuse the same boss posture vocabulary for sustain-heavy bosses'
    );

    assert.equal(
        buildRunStartTargetCue('傲慢 · 天空神殿'),
        '',
        'run-start target cue helper should stay silent for legacy string targets without a boss-aware cue'
    );

    assert.equal(
        buildRunStartTargetCue(null),
        '',
        'run-start target cue helper should stay silent when no target payload exists'
    );
}

function testFirstCombatTargetCueHelper() {
    assert.equal(typeof buildFirstCombatTargetCue, 'function', 'first-combat target cue helper should be exported');

    assert.equal(
        buildFirstCombatTargetCue({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        '首战 稳拍反制',
        'first-combat target cue helper should compress the current boss posture into a shorter combat-facing wake-up cue'
    );

    assert.equal(
        buildFirstCombatTargetCue({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        '首战 回体扛压',
        'first-combat target cue helper should reuse the same sustain-heavy boss posture vocabulary'
    );

    assert.equal(
        buildFirstCombatTargetCue('傲慢 · 天空神殿'),
        '',
        'first-combat target cue helper should stay silent for legacy targets without a boss-aware cue'
    );

    assert.equal(
        buildFirstCombatTargetCue(null),
        '',
        'first-combat target cue helper should stay silent when no target payload exists'
    );
}

function testCorridorTargetBridgeCueHelper() {
    assert.equal(typeof buildCorridorTargetBridgeCue, 'function', 'corridor target bridge cue helper should be exported');

    assert.equal(
        buildCorridorTargetBridgeCue({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        '承接 稳拍反制',
        'corridor target bridge cue helper should compress the current boss posture into a short transition-facing bridge cue'
    );

    assert.equal(
        buildCorridorTargetBridgeCue({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        '承接 回体扛压',
        'corridor target bridge cue helper should reuse the same sustain-heavy boss posture vocabulary'
    );

    assert.equal(
        buildCorridorTargetBridgeCue('傲慢 · 天空神殿'),
        '',
        'corridor target bridge cue helper should stay silent for legacy targets without a boss-aware cue'
    );

    assert.equal(
        buildCorridorTargetBridgeCue(null),
        '',
        'corridor target bridge cue helper should stay silent when no target payload exists'
    );
}

function testRunEventRoomTargetPostureCueHelper() {
    assert.equal(typeof buildRunEventRoomTargetPostureCue, 'function', 'run-event shrine target-posture helper should be exported');

    assert.deepEqual(
        buildRunEventRoomTargetPostureCue({
            label: '色欲 幻梦花园',
            bossKey: 'lust'
        }),
        {
            promptCue: '稳拍反制',
            worldLabelCue: '稳拍反制'
        },
        'run-event shrine target-posture helper should derive a compact shrine-facing reminder from the current boss target'
    );

    assert.deepEqual(
        buildRunEventRoomTargetPostureCue({
            label: '暴怒 熔岩锻炉',
            bossKey: 'wrath'
        }),
        {
            promptCue: '回体扛压',
            worldLabelCue: '回体扛压'
        },
        'run-event shrine target-posture helper should reuse the same boss posture vocabulary for sustain-heavy bosses'
    );

    assert.equal(
        buildRunEventRoomTargetPostureCue('傲慢 · 天空神殿'),
        null,
        'run-event shrine target-posture helper should stay silent for legacy targets without a boss-aware cue'
    );
}

function testStatusEffectLogic() {
    assert.ok(STATUS_EFFECT_DEFS.burn, 'burn status should exist');
    assert.ok(STATUS_EFFECT_DEFS.bleed, 'bleed status should exist');
    assert.ok(STATUS_EFFECT_DEFS.slow, 'slow status should exist');
    assert.equal(getStatusEffectDef('burn').durationMs, 3200, 'burn duration should remain stable');
    assert.equal(getStatusEffectDef('slow').speedMultiplier, 0.68, 'slow multiplier should remain stable');
    assert.equal(getStatusEffectDef('unknown'), null, 'unknown status should return null');

    const burnTick = computeStatusTickDamage('burn', 50);
    assert.equal(burnTick, 5, 'burn tick damage should scale from source damage');
    const bleedTick = computeStatusTickDamage('bleed', 200);
    assert.equal(bleedTick, 12, 'bleed tick damage should be capped by max');
    const slowTick = computeStatusTickDamage('slow', 50);
    assert.equal(slowTick, 0, 'slow should not deal periodic damage');
}

function testRunModifierSelectionAndEffects() {
    assert.ok(Array.isArray(RUN_MODIFIER_POOL) && RUN_MODIFIER_POOL.length >= 6, 'run modifier pool should contain entries');
    assert.equal(DEFAULT_RUN_EFFECTS.enemySpeedMultiplier, 1, 'default effects should be neutral');

    const picks = pickRunModifiers(() => 0, 3);
    assert.deepEqual(picks, ['glassBlade', 'fortuneWindfall', 'ironWill'], 'selection should be deterministic with fixed RNG');
    assert.equal(new Set(picks).size, 3, 'selected modifiers should be unique');

    const effects = buildRunModifierEffects(['glassBlade', 'frenziedFoes', 'fortuneWindfall']);
    assert.equal(effects.playerDamageMultiplier, 1.28, 'glassBlade should boost player damage');
    assert.equal(effects.enemySpeedMultiplier.toFixed(2), '1.22', 'frenziedFoes should boost enemy speed');
    assert.equal(effects.goldDropMultiplier.toFixed(2), '1.35', 'fortuneWindfall should boost gold drops');
}

function testRunEventRoomSelection() {
    assert.ok(Array.isArray(RUN_EVENT_ROOM_POOL) && RUN_EVENT_ROOM_POOL.length >= 5, 'event room pool should contain all shipped entries');

    const picked = pickRunEventRoom(() => 0);
    assert.equal(picked.key, RUN_EVENT_ROOM_POOL[0].key, 'deterministic event pick should select first entry');
    assert.equal(picked.selectedChoiceKey, null, 'fresh event pick should not have a selected choice');
    assert.equal(picked.resolutionText, '', 'fresh event pick should not have a settlement summary');

    const byKey = getRunEventRoomByKey(picked.key);
    assert.ok(byKey && byKey.key === picked.key, 'event lookup by key should work');

    const choices = getRunEventRoomChoices(picked);
    assert.deepEqual(choices.map(choice => choice.key), ['highStakeWager', 'carefulWager'], 'first event should expose deterministic choice keys');

    const normalized = normalizeRunEventRoom({ key: picked.key, discovered: true, resolved: false });
    assert.equal(normalized.key, picked.key, 'normalize should keep valid key');
    assert.equal(normalized.discovered, true, 'normalize should keep discovered flag');
    assert.equal(normalized.selectedChoiceKey, null, 'normalize should default choice key to null');

    const invalid = normalizeRunEventRoom({ key: 'not-exist' });
    assert.equal(invalid, null, 'normalize should drop invalid event key');

    const settlement = resolveRunEventRoomChoice({
        gold: 40,
        playerHp: 100,
        playerMaxHp: 120
    }, picked, 'highStakeWager');
    assert.equal(settlement.ok, true, 'valid event choice should resolve');
    assert.equal(settlement.nextState.gold, 160, 'high stake should grant the configured gold');
    assert.equal(settlement.nextState.playerHp, 70, 'high stake should deduct 30% current HP');
    assert.equal(settlement.eventRoom.resolved, true, 'resolved event should be marked resolved');
    assert.equal(settlement.eventRoom.selectedChoiceKey, 'highStakeWager', 'resolved event should persist selected choice key');
    assert.match(settlement.eventRoom.resolutionText, /120 金币/, 'resolution summary should mention the reward');

    const repeat = resolveRunEventRoomChoice({
        gold: 160,
        playerHp: 70,
        playerMaxHp: 120
    }, settlement.eventRoom, 'carefulWager');
    assert.equal(repeat.ok, false, 'resolved event should reject repeat settlement');
    assert.equal(repeat.reason, 'already_resolved', 'repeat settlement should report already_resolved');

    const fountain = getRunEventRoomByKey('healingFountain');
    assert.ok(fountain, 'healing fountain should exist');
    const fountainChoices = getRunEventRoomChoices('healingFountain');
    assert.deepEqual(
        fountainChoices.map(choice => choice.key),
        ['vitalSurge', 'purifyingSip'],
        'healing fountain should expose both healing choices'
    );
    const fountainSettlement = resolveRunEventRoomChoice({
        gold: 10,
        playerHp: 48,
        playerMaxHp: 120,
        negativeStatuses: ['burn', 'slow']
    }, {
        key: 'healingFountain',
        discovered: true,
        resolved: false
    }, 'purifyingSip');
    assert.equal(fountainSettlement.ok, true, 'healing fountain choice should resolve');
    assert.equal(fountainSettlement.nextState.playerHp, 84, 'purifying sip should restore 30% max HP');
    assert.equal(fountainSettlement.nextState.cleanseNegativeStatuses, true, 'purifying sip should request a cleanse');
    assert.match(fountainSettlement.eventRoom.resolutionText, /净化/, 'healing fountain summary should mention the cleanse');
    assert.equal(
        fountainSettlement.eventRoom.selectedChoiceRecommendationReason,
        '可净化2层',
        'event-room resolution should persist the compact high-confidence recommendation reason when the selected route matches it'
    );

    const contractChoices = getRunEventRoomChoices('bloodContract');
    assert.deepEqual(
        contractChoices.map(choice => choice.key),
        ['crimsonEdge', 'temperedPact'],
        'blood contract should expose both pact choices'
    );
    const contractSettlement = resolveRunEventRoomChoice({
        gold: 10,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'bloodContract',
        discovered: true,
        resolved: false
    }, 'crimsonEdge');
    assert.equal(contractSettlement.ok, true, 'blood contract choice should resolve');
    const contractEffects = buildRunEventRoomEffects(contractSettlement.eventRoom);
    assert.equal(contractEffects.playerDamageMultiplier, 1.35, 'crimson pact should grant the configured damage bonus');
    assert.equal(contractEffects.playerDamageTakenMultiplier, 1.18, 'crimson pact should increase incoming damage');
    assert.match(contractSettlement.eventRoom.resolutionText, /\+35%/, 'blood contract summary should mention the offensive buff');

    const supplyChoices = getRunEventRoomChoices('supplyCache');
    assert.deepEqual(
        supplyChoices.map(choice => choice.key),
        ['fieldTonic', 'berserkerKit'],
        'supply cache should expose both consumable exchange choices'
    );
    const supplySettlement = resolveRunEventRoomChoice({
        gold: 140,
        playerHp: 84,
        playerMaxHp: 120,
        inventory: {
            hpPotion: 1
        }
    }, {
        key: 'supplyCache',
        discovered: true,
        resolved: false
    }, 'fieldTonic');
    assert.equal(supplySettlement.ok, true, 'supply cache should resolve when enough gold exists');
    assert.equal(supplySettlement.nextState.gold, 95, 'field tonic should deduct its configured gold cost');
    assert.equal(supplySettlement.nextState.inventory.cleanseTonic, 1, 'field tonic should grant a cleanse tonic');
    assert.equal(supplySettlement.nextState.inventory.hpPotion, 1, 'other inventory entries should remain intact');
    assert.match(supplySettlement.eventRoom.resolutionText, /净化药剂/, 'supply cache summary should mention the granted item');

    const supplyBlocked = resolveRunEventRoomChoice({
        gold: 30,
        playerHp: 84,
        playerMaxHp: 120,
        inventory: {}
    }, {
        key: 'supplyCache',
        discovered: true,
        resolved: false
    }, 'berserkerKit');
    assert.equal(supplyBlocked.ok, false, 'supply cache should reject choices when gold is insufficient');
    assert.equal(supplyBlocked.reason, 'insufficient_gold', 'supply cache should report gold gating explicitly');

    const carefulSettlement = resolveRunEventRoomChoice({
        gold: 40,
        playerHp: 52,
        playerMaxHp: 120
    }, {
        key: 'gamblersShrine',
        discovered: true,
        resolved: false
    }, 'carefulWager');
    assert.equal(carefulSettlement.ok, true, 'careful wager should resolve on the safer gold route');
    assert.equal(
        carefulSettlement.eventRoom.selectedChoiceRecommendationReason,
        '当前更宜稳押',
        'careful wager should persist the safer-gamble recommendation reason when the player is already too low to justify the high-stake route'
    );

    const prayerChoices = getRunEventRoomChoices('prayerShrine');
    assert.deepEqual(
        prayerChoices.map(choice => choice.key),
        ['renewalPrayer', 'tempoPrayer'],
        'prayer shrine should expose both prayer routes'
    );
    const prayerSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'prayerShrine',
        discovered: true,
        resolved: false
    }, 'tempoPrayer');
    assert.equal(prayerSettlement.ok, true, 'prayer shrine choice should resolve');
    assert.equal(prayerSettlement.eventRoom.selectedChoiceLabel, '迅击祷言', 'prayer shrine should persist the chosen label');
    assert.equal(
        prayerSettlement.eventRoom.selectedChoiceRecommendationReason,
        '',
        'event-room resolution should stay silent when the selected route did not earn a high-confidence recommendation'
    );
    const prayerEffects = buildRunEventRoomEffects(prayerSettlement.eventRoom);
    assert.equal(prayerEffects.playerSpecialCooldownMultiplier, 0.78, 'tempo prayer should shorten special cooldowns');
    assert.match(prayerSettlement.eventRoom.resolutionText, /冷却/, 'prayer shrine summary should mention the cooldown buff');

    const recommendedPrayerSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 100,
        playerMaxHp: 120,
        bossKey: 'wrath',
        selectedWeaponKey: 'sword'
    }, {
        key: 'prayerShrine',
        discovered: true,
        resolved: false
    }, 'renewalPrayer');
    assert.equal(
        recommendedPrayerSettlement.eventRoom.selectedChoiceRecommendationReason,
        '目标Boss更宜回体',
        'prayer shrine resolution should persist the boss-aware sustain reason when renewal prayer earned the recommendation'
    );
}

function testCombatDisciplineEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerAttackCooldownMultiplier,
        1,
        'default run effects should keep normal-attack cadence neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerDodgeCooldownMultiplier,
        1,
        'default run effects should keep dodge cooldown neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerDodgeStaminaCostMultiplier,
        1,
        'default run effects should keep dodge stamina cost neutral'
    );

    const combatChoices = getRunEventRoomChoices('combatDisciplineShrine');
    assert.deepEqual(
        combatChoices.map(choice => choice.key),
        ['flurryLesson', 'ghostStepLesson'],
        'combat discipline shrine should expose both combat-style routes'
    );

    const flurrySettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'combatDisciplineShrine',
        discovered: true,
        resolved: false
    }, 'flurryLesson');
    assert.equal(flurrySettlement.ok, true, 'combat discipline shrine attack route should resolve');
    const flurryEffects = buildRunEventRoomEffects(flurrySettlement.eventRoom);
    assert.equal(flurryEffects.playerAttackCooldownMultiplier, 0.82, 'flurry lesson should accelerate normal attacks');
    assert.match(flurrySettlement.eventRoom.resolutionText, /普攻冷却 -18%/, 'attack route summary should mention faster normal attacks');

    const ghostStepSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'combatDisciplineShrine',
        discovered: true,
        resolved: false
    }, 'ghostStepLesson');
    assert.equal(ghostStepSettlement.ok, true, 'combat discipline shrine dodge route should resolve');
    const ghostStepEffects = buildRunEventRoomEffects(ghostStepSettlement.eventRoom);
    assert.equal(ghostStepEffects.playerDodgeCooldownMultiplier, 0.8, 'ghost step lesson should shorten dodge cooldown');
    assert.equal(ghostStepEffects.playerDodgeStaminaCostMultiplier, 0.82, 'ghost step lesson should reduce dodge stamina cost');
    assert.match(ghostStepSettlement.eventRoom.resolutionText, /闪避冷却 -20%/, 'dodge route summary should mention faster dodge recovery');
    assert.match(ghostStepSettlement.eventRoom.resolutionText, /闪避体力消耗 -18%/, 'dodge route summary should mention cheaper dodges');

    const recommendedFlurrySettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120,
        attackCooldownMs: 1200,
        specialCooldownMs: 200,
        dodgeCooldownMs: 120,
        stamina: 24,
        staminaRegenPerSecond: 12,
        attackStaminaCost: 8,
        specialStaminaCost: 18,
        dodgeStaminaCost: 10
    }, {
        key: 'combatDisciplineShrine',
        discovered: true,
        resolved: false
    }, 'flurryLesson');
    assert.equal(
        recommendedFlurrySettlement.eventRoom.selectedChoiceRecommendationReason,
        '普攻卡拍',
        'combat discipline resolution should persist the action-context recommendation reason when the selected route earned the footer recommendation'
    );

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'combatDisciplineShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '连斩修习: 普攻冷却-18% · 下间高压 · 首拍兑现',
            '游步修习: 闪避冷却-20%, 闪避体力消耗-18% · 下间缓冲 · 稳场兑现'
        ],
        'combat discipline shrine HUD summary should surface both style routes alongside their routed payoff timing'
    );
}

function testCombatFlowEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerAttackHitStaminaGain,
        0,
        'default run effects should keep attack-hit stamina refunds disabled'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerPostDodgeSpecialDamageMultiplier,
        1,
        'default run effects should keep post-dodge special damage neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerPostDodgeSpecialWindowMs,
        0,
        'default run effects should keep post-dodge special windows disabled'
    );

    const flowChoices = getRunEventRoomChoices('combatFlowShrine');
    assert.deepEqual(
        flowChoices.map(choice => choice.key),
        ['breathingLesson', 'momentumLesson'],
        'combat flow shrine should expose both hit-confirm and dodge-conversion routes'
    );

    const breathingSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'combatFlowShrine',
        discovered: true,
        resolved: false
    }, 'breathingLesson');
    assert.equal(breathingSettlement.ok, true, 'combat flow shrine stamina route should resolve');
    const breathingEffects = buildRunEventRoomEffects(breathingSettlement.eventRoom);
    assert.equal(breathingEffects.playerAttackHitStaminaGain, 4, 'breathing lesson should refund stamina on landed normal attacks');
    assert.match(breathingSettlement.eventRoom.resolutionText, /普攻命中回体 \+4/, 'stamina route summary should mention hit-confirm stamina flow');

    const momentumSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'combatFlowShrine',
        discovered: true,
        resolved: false
    }, 'momentumLesson');
    assert.equal(momentumSettlement.ok, true, 'combat flow shrine dodge-conversion route should resolve');
    const momentumEffects = buildRunEventRoomEffects(momentumSettlement.eventRoom);
    assert.equal(momentumEffects.playerPostDodgeSpecialDamageMultiplier, 1.35, 'momentum lesson should empower the next special after a dodge');
    assert.equal(momentumEffects.playerPostDodgeSpecialWindowMs, 1600, 'momentum lesson should define a short post-dodge special window');
    assert.match(momentumSettlement.eventRoom.resolutionText, /闪避后 1\.6s 内特攻伤害 \+35%/, 'momentum route summary should mention the short empowered special window');

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'combatFlowShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '回息修习: 普攻命中回体+4 · 下间缓冲 · 稳场兑现',
            '借势修习: 闪避后1.6s内特攻伤害+35% · 下间高压 · 首拍兑现'
        ],
        'combat flow shrine HUD summary should surface both route identities alongside their routed payoff timing'
    );
}

function testComboLinkEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerAttackHitSpecialCooldownReductionMs,
        0,
        'default run effects should keep attack-hit special cooldown refunds disabled'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerSpecialHitDodgeCooldownReductionMs,
        0,
        'default run effects should keep special-hit dodge cooldown refunds disabled'
    );

    const comboChoices = getRunEventRoomChoices('comboLinkShrine');
    assert.deepEqual(
        comboChoices.map(choice => choice.key),
        ['sharpeningLesson', 'reversalStepLesson'],
        'combo link shrine should expose both combo-routing choices'
    );

    const sharpeningSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'comboLinkShrine',
        discovered: true,
        resolved: false
    }, 'sharpeningLesson');
    assert.equal(sharpeningSettlement.ok, true, 'combo link shrine attack-to-special route should resolve');
    const sharpeningEffects = buildRunEventRoomEffects(sharpeningSettlement.eventRoom);
    assert.equal(sharpeningEffects.playerAttackHitSpecialCooldownReductionMs, 200, 'sharpening lesson should refund special cooldown on landed normal attacks');
    assert.match(sharpeningSettlement.eventRoom.resolutionText, /普攻命中特攻冷却 -200ms/, 'attack-to-special route summary should mention the fixed special cooldown refund');

    const reversalSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'comboLinkShrine',
        discovered: true,
        resolved: false
    }, 'reversalStepLesson');
    assert.equal(reversalSettlement.ok, true, 'combo link shrine special-to-dodge route should resolve');
    const reversalEffects = buildRunEventRoomEffects(reversalSettlement.eventRoom);
    assert.equal(reversalEffects.playerSpecialHitDodgeCooldownReductionMs, 300, 'reversal step lesson should refund dodge cooldown on landed specials');
    assert.match(reversalSettlement.eventRoom.resolutionText, /特攻命中闪避冷却 -300ms/, 'special-to-dodge route summary should mention the fixed dodge cooldown refund');

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'comboLinkShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '催锋修习: 普攻命中特攻冷却-200ms · 下间高压 · 首拍兑现',
            '回身修习: 特攻命中闪避冷却-300ms · 下间缓冲 · 稳场兑现'
        ],
        'combo link shrine HUD summary should surface both combo-routing identities alongside their routed payoff timing'
    );
}

function testCounterattackEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerPostDodgeAttackDamageMultiplier,
        1,
        'default run effects should keep post-dodge attack damage neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerPostDodgeAttackWindowMs,
        0,
        'default run effects should keep post-dodge attack windows disabled'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerSpecialHitStaminaGain,
        0,
        'default run effects should keep special-hit stamina refunds disabled'
    );

    const counterChoices = getRunEventRoomChoices('counterattackShrine');
    assert.deepEqual(
        counterChoices.map(choice => choice.key),
        ['pursuitLesson', 'focusLesson'],
        'counterattack shrine should expose both dodge-attack and special-sustain routes'
    );

    const pursuitSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'counterattackShrine',
        discovered: true,
        resolved: false
    }, 'pursuitLesson');
    assert.equal(pursuitSettlement.ok, true, 'counterattack shrine dodge-attack route should resolve');
    const pursuitEffects = buildRunEventRoomEffects(pursuitSettlement.eventRoom);
    assert.equal(pursuitEffects.playerPostDodgeAttackDamageMultiplier, 1.28, 'pursuit lesson should empower the next normal attack after a dodge');
    assert.equal(pursuitEffects.playerPostDodgeAttackWindowMs, 1400, 'pursuit lesson should define a short post-dodge normal-attack window');
    assert.match(pursuitSettlement.eventRoom.resolutionText, /闪避后 1\.4s 内普攻伤害 \+28%/, 'dodge-attack route summary should mention the short empowered normal-attack window');

    const focusSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'counterattackShrine',
        discovered: true,
        resolved: false
    }, 'focusLesson');
    assert.equal(focusSettlement.ok, true, 'counterattack shrine special-sustain route should resolve');
    const focusEffects = buildRunEventRoomEffects(focusSettlement.eventRoom);
    assert.equal(focusEffects.playerSpecialHitStaminaGain, 6, 'focus lesson should refund stamina on landed specials');
    assert.match(focusSettlement.eventRoom.resolutionText, /特攻命中回体 \+6/, 'special-sustain route summary should mention the fixed stamina refund');

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'counterattackShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '追猎修习: 闪避后1.4s内普攻伤害+28% · 下间淘金 · 追赏兑现',
            '调息修习: 特攻命中回体+6 · 下间缓冲 · 稳场兑现'
        ],
        'counterattack shrine HUD summary should surface both follow-up identities alongside their routed payoff timing'
    );
}

function testWeaponRoutingEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerMeleeAttackCooldownMultiplier,
        1,
        'default run effects should keep melee-weapon attack cadence neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerRangedSpecialCooldownMultiplier,
        1,
        'default run effects should keep ranged-weapon special cadence neutral'
    );

    const routingChoices = getRunEventRoomChoices('weaponRoutingShrine');
    assert.deepEqual(
        routingChoices.map(choice => choice.key),
        ['vanguardLesson', 'longshotLesson'],
        'weapon-routing shrine should expose both melee and ranged routing choices'
    );

    const vanguardSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'weaponRoutingShrine',
        discovered: true,
        resolved: false
    }, 'vanguardLesson');
    assert.equal(vanguardSettlement.ok, true, 'weapon-routing shrine melee route should resolve');
    const vanguardEffects = buildRunEventRoomEffects(vanguardSettlement.eventRoom);
    assert.equal(vanguardEffects.playerMeleeAttackCooldownMultiplier, 0.82, 'vanguard lesson should only speed up melee normal attacks');
    assert.match(vanguardSettlement.eventRoom.resolutionText, /近战武器普攻冷却 -18%/, 'melee routing summary should mention melee-only attack cadence');

    const recommendedVanguardSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 98,
        playerMaxHp: 120,
        selectedWeaponKey: 'sword',
        attackCooldownMs: 1250,
        specialCooldownMs: 220,
        dodgeCooldownMs: 260,
        stamina: 24,
        staminaRegenPerSecond: 12,
        attackStaminaCost: 8,
        specialStaminaCost: 18,
        dodgeStaminaCost: 10
    }, {
        key: 'weaponRoutingShrine',
        discovered: true,
        resolved: false
    }, 'vanguardLesson');
    assert.equal(
        recommendedVanguardSettlement.eventRoom.selectedChoiceRecommendationReason,
        '近战更宜压线',
        'weapon-routing resolution should persist the contextual pressure-fit reason when vanguard earned the recommendation'
    );

    const longshotSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'weaponRoutingShrine',
        discovered: true,
        resolved: false
    }, 'longshotLesson');
    assert.equal(longshotSettlement.ok, true, 'weapon-routing shrine ranged route should resolve');
    const longshotEffects = buildRunEventRoomEffects(longshotSettlement.eventRoom);
    assert.equal(longshotEffects.playerRangedSpecialCooldownMultiplier, 0.78, 'longshot lesson should only speed up ranged specials');
    assert.match(longshotSettlement.eventRoom.resolutionText, /远程武器特攻冷却 -22%/, 'ranged routing summary should mention ranged-only special cadence');

    const recommendedLongshotSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 102,
        playerMaxHp: 120,
        selectedWeaponKey: 'staff',
        attackCooldownMs: 180,
        specialCooldownMs: 1450,
        dodgeCooldownMs: 180,
        stamina: 26,
        staminaRegenPerSecond: 12,
        attackStaminaCost: 8,
        specialStaminaCost: 18,
        dodgeStaminaCost: 10
    }, {
        key: 'weaponRoutingShrine',
        discovered: true,
        resolved: false
    }, 'longshotLesson');
    assert.equal(
        recommendedLongshotSettlement.eventRoom.selectedChoiceRecommendationReason,
        '远程更宜追赏',
        'weapon-routing resolution should persist the contextual windfall-fit reason when longshot earned the recommendation'
    );

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'weaponRoutingShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '压阵修习: 近战武器普攻冷却-18% · 下间高压 · 首拍兑现',
            '离弦修习: 远程武器特攻冷却-22% · 下间淘金 · 追赏兑现'
        ],
        'weapon-routing shrine HUD summary should surface both weapon-routing identities alongside their routed payoff timing'
    );
}

function testRiskRewardEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerLowHpDamageMultiplier,
        1,
        'default run effects should keep low-HP damage neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerLowHpThresholdRatio,
        0,
        'default run effects should keep low-HP threshold routing disabled'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerHighHpDamageTakenMultiplier,
        1,
        'default run effects should keep high-HP mitigation neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerHighHpThresholdRatio,
        0,
        'default run effects should keep high-HP threshold routing disabled'
    );

    const riskRewardChoices = getRunEventRoomChoices('riskRewardShrine');
    assert.deepEqual(
        riskRewardChoices.map(choice => choice.key),
        ['desperationLesson', 'composureLesson'],
        'risk/reward shrine should expose both low-HP burst and high-HP guard routes'
    );

    const desperationSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'riskRewardShrine',
        discovered: true,
        resolved: false
    }, 'desperationLesson');
    assert.equal(desperationSettlement.ok, true, 'risk/reward shrine low-HP route should resolve');
    const desperationEffects = buildRunEventRoomEffects(desperationSettlement.eventRoom);
    assert.equal(desperationEffects.playerLowHpDamageMultiplier, 1.4, 'desperation lesson should boost damage once HP falls into the danger threshold');
    assert.equal(desperationEffects.playerLowHpThresholdRatio, 0.45, 'desperation lesson should persist the low-HP threshold ratio');
    assert.match(desperationSettlement.eventRoom.resolutionText, /生命低于 45% 时伤害 \+40%/, 'low-HP route summary should mention the threshold-gated damage burst');

    const composureSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'riskRewardShrine',
        discovered: true,
        resolved: false
    }, 'composureLesson');
    assert.equal(composureSettlement.ok, true, 'risk/reward shrine high-HP route should resolve');
    const composureEffects = buildRunEventRoomEffects(composureSettlement.eventRoom);
    assert.equal(composureEffects.playerHighHpDamageTakenMultiplier, 0.82, 'composure lesson should reduce incoming damage while HP stays above the guard threshold');
    assert.equal(composureEffects.playerHighHpThresholdRatio, 0.7, 'composure lesson should persist the high-HP threshold ratio');
    assert.match(composureSettlement.eventRoom.resolutionText, /生命高于 70% 时承伤 -18%/, 'high-HP route summary should mention the threshold-gated mitigation');

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'riskRewardShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '绝境修习 [爆发/冒险]: 生命<45%时伤害+40% · 下间高压 · 首拍兑现',
            '守心修习 [续航/稳健]: 生命>70%时承伤-18% · 下间缓冲 · 稳场兑现'
        ],
        'risk/reward shrine HUD summary should surface both HP-threshold identities alongside their encounter-routing intent tags and payoff timing'
    );
}

function testStatusRoutingEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerBurnStatusDurationMultiplier,
        1,
        'default run effects should keep burn duration neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerBurnStatusDamageMultiplier,
        1,
        'default run effects should keep burn damage neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerBleedStatusDurationMultiplier,
        1,
        'default run effects should keep bleed duration neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerBleedStatusDamageMultiplier,
        1,
        'default run effects should keep bleed damage neutral'
    );

    const statusChoices = getRunEventRoomChoices('statusRoutingShrine');
    assert.deepEqual(
        statusChoices.map(choice => choice.key),
        ['emberLesson', 'bloodtraceLesson'],
        'status-routing shrine should expose both burn and bleed routing choices'
    );

    const emberSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'statusRoutingShrine',
        discovered: true,
        resolved: false
    }, 'emberLesson');
    assert.equal(emberSettlement.ok, true, 'status-routing shrine burn route should resolve');
    const emberEffects = buildRunEventRoomEffects(emberSettlement.eventRoom);
    assert.equal(emberEffects.playerBurnStatusDurationMultiplier, 1.45, 'ember lesson should extend burn duration');
    assert.equal(emberEffects.playerBurnStatusDamageMultiplier, 1.3, 'ember lesson should boost burn damage');
    assert.match(emberSettlement.eventRoom.resolutionText, /灼烧持续时间 \+45%/, 'burn route summary should mention longer burn duration');
    assert.match(emberSettlement.eventRoom.resolutionText, /灼烧伤害 \+30%/, 'burn route summary should mention stronger burn damage');

    const recommendedEmberSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 68,
        playerMaxHp: 120,
        selectedWeaponKey: 'staff',
        attackCooldownMs: 260,
        specialCooldownMs: 420,
        dodgeCooldownMs: 980,
        stamina: 18,
        staminaRegenPerSecond: 11,
        attackStaminaCost: 10,
        specialStaminaCost: 20,
        dodgeStaminaCost: 14
    }, {
        key: 'statusRoutingShrine',
        discovered: true,
        resolved: false
    }, 'emberLesson');
    assert.equal(
        recommendedEmberSettlement.eventRoom.selectedChoiceRecommendationReason,
        '灼烧更宜稳场',
        'status-routing resolution should persist the contextual breather-fit reason when ember earned the recommendation'
    );

    const bloodtraceSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'statusRoutingShrine',
        discovered: true,
        resolved: false
    }, 'bloodtraceLesson');
    assert.equal(bloodtraceSettlement.ok, true, 'status-routing shrine bleed route should resolve');
    const bloodtraceEffects = buildRunEventRoomEffects(bloodtraceSettlement.eventRoom);
    assert.equal(bloodtraceEffects.playerBleedStatusDurationMultiplier, 1.4, 'bloodtrace lesson should extend bleed duration');
    assert.equal(bloodtraceEffects.playerBleedStatusDamageMultiplier, 1.25, 'bloodtrace lesson should boost bleed damage');
    assert.match(bloodtraceSettlement.eventRoom.resolutionText, /流血持续时间 \+40%/, 'bleed route summary should mention longer bleed duration');
    assert.match(bloodtraceSettlement.eventRoom.resolutionText, /流血伤害 \+25%/, 'bleed route summary should mention stronger bleed damage');

    const recommendedBloodtraceSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 108,
        playerMaxHp: 120,
        selectedWeaponKey: 'sword',
        attackCooldownMs: 180,
        specialCooldownMs: 260,
        dodgeCooldownMs: 200,
        stamina: 28,
        staminaRegenPerSecond: 12,
        attackStaminaCost: 8,
        specialStaminaCost: 18,
        dodgeStaminaCost: 10
    }, {
        key: 'statusRoutingShrine',
        discovered: true,
        resolved: false
    }, 'bloodtraceLesson');
    assert.equal(
        recommendedBloodtraceSettlement.eventRoom.selectedChoiceRecommendationReason,
        '挂血更宜抢势',
        'status-routing resolution should persist the contextual pressure-fit reason when bloodtrace earned the recommendation'
    );

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'statusRoutingShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '余烬修习: 灼烧持续时间+45%, 灼烧伤害+30% · 下间缓冲 · 稳场兑现',
            '血痕修习: 流血持续时间+40%, 流血伤害+25% · 下间高压 · 首拍兑现'
        ],
        'status-routing shrine HUD summary should surface both abnormal-status identities alongside their routed payoff timing'
    );
}

function testControlRoutingEventRoom() {
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerSlowStatusDurationMultiplier,
        1,
        'default run effects should keep slow duration neutral'
    );
    assert.equal(
        DEFAULT_RUN_EFFECTS.playerDamageVsSlowedMultiplier,
        1,
        'default run effects should keep damage-vs-slowed neutral'
    );

    const controlChoices = getRunEventRoomChoices('controlRoutingShrine');
    assert.deepEqual(
        controlChoices.map(choice => choice.key),
        ['crushingLesson', 'executionLesson'],
        'control-routing shrine should expose both slow/control routing choices'
    );

    const crushingSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'controlRoutingShrine',
        discovered: true,
        resolved: false
    }, 'crushingLesson');
    assert.equal(crushingSettlement.ok, true, 'control-routing shrine slow route should resolve');
    const crushingEffects = buildRunEventRoomEffects(crushingSettlement.eventRoom);
    assert.equal(crushingEffects.playerSlowStatusDurationMultiplier, 1.45, 'crushing lesson should extend slow duration');
    assert.match(crushingSettlement.eventRoom.resolutionText, /减速持续时间 \+45%/, 'slow route summary should mention longer slow duration');

    const executionSettlement = resolveRunEventRoomChoice({
        gold: 95,
        playerHp: 84,
        playerMaxHp: 120
    }, {
        key: 'controlRoutingShrine',
        discovered: true,
        resolved: false
    }, 'executionLesson');
    assert.equal(executionSettlement.ok, true, 'control-routing shrine payoff route should resolve');
    const executionEffects = buildRunEventRoomEffects(executionSettlement.eventRoom);
    assert.equal(executionEffects.playerDamageVsSlowedMultiplier, 1.28, 'execution lesson should boost damage vs slowed targets');
    assert.match(executionSettlement.eventRoom.resolutionText, /对减速目标伤害 \+28%/, 'payoff route summary should mention stronger damage vs slowed targets');
    assert.match(executionSettlement.eventRoom.resolutionText, /Boss 破招窗口中的减速目标会进入终结兑现/, 'payoff route summary should mention the boss break-window finisher payoff');

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'controlRoutingShrine',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '镇步修习: 减速持续时间+45% · 下间缓冲 · 稳场兑现',
            '破势修习: 对减速目标伤害+28%, Boss破招窗口终结 · 下间淘金 · 追赏兑现'
        ],
        'control-routing shrine HUD summary should surface both slow/control identities alongside their routed payoff timing'
    );
}

function testRunEventRoomChoiceHelpers() {
    assert.equal(typeof buildRunEventRoomChoicePreview, 'function', 'event room choice preview helper should be exported');
    assert.equal(typeof getRunEventRoomChoiceFailureMessage, 'function', 'event room choice failure helper should be exported');

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    assert.equal(
        buildRunEventRoomChoicePreview(healingChoice),
        '净泉啜饮 [续航/净化]: 生命+30%, 净化',
        'choice preview helper should surface tactical intent tags for cleanse-healing routes'
    );

    const tradeChoice = getRunEventRoomChoices('supplyCache').find(choice => choice.key === 'fieldTonic');
    assert.equal(
        buildRunEventRoomChoicePreview(tradeChoice),
        '战地净化包 [补给/净化]: 金币-45, 净化药剂x1',
        'choice preview helper should surface tactical intent tags for support consumable routes'
    );

    const riskChoice = getRunEventRoomChoices('bloodContract').find(choice => choice.key === 'crimsonEdge');
    assert.equal(
        buildRunEventRoomChoicePreview(riskChoice),
        '猩红锋契 [爆发/冒险]: 伤害+35%, 承伤+18%',
        'choice preview helper should surface tactical intent tags for high-risk burst routes'
    );

    assert.equal(
        getRunEventRoomChoiceFailureMessage({ reason: 'insufficient_gold' }),
        '金币不足，无法选择该路线',
        'failure helper should expose an explicit gold-gating message'
    );
    assert.equal(
        getRunEventRoomChoiceFailureMessage({ reason: 'already_resolved' }),
        '该事件房已结算',
        'failure helper should expose an explicit resolved-state message'
    );
    assert.equal(
        getRunEventRoomChoiceFailureMessage({ reason: 'unexpected_reason' }),
        '当前无法完成该选择',
        'failure helper should fall back to a stable generic message for unknown reasons'
    );
}

const ACTION_ROUTE_ENCOUNTER_CASES = Object.freeze([
    {
        roomKey: 'combatDisciplineShrine',
        choiceKey: 'flurryLesson',
        expectedProfileKey: 'pressure',
        expectedPreview: '下间高压',
        expectedEntry: '高压战 · 三向成压 · 连斩抢拍',
        expectedClear: '高压战 · 顶住成压 · 连斩抢拍',
        expectedSourceCue: '连斩抢拍',
        moment: 'engage'
    },
    {
        roomKey: 'combatDisciplineShrine',
        choiceKey: 'ghostStepLesson',
        expectedProfileKey: 'breather',
        expectedPreview: '下间缓冲',
        expectedEntry: '缓冲战 · 双拍缓冲 · 游步整拍',
        expectedClear: '缓冲战 · 稳住出清 · 游步整拍',
        expectedSourceCue: '游步整拍',
        moment: 'stabilize'
    },
    {
        roomKey: 'controlRoutingShrine',
        choiceKey: 'crushingLesson',
        expectedProfileKey: 'breather',
        expectedPreview: '下间缓冲',
        expectedEntry: '缓冲战 · 双拍缓冲 · 镇步控场',
        expectedClear: '缓冲战 · 稳住出清 · 镇步控场',
        expectedSourceCue: '镇步控场',
        moment: 'stabilize'
    },
    {
        roomKey: 'controlRoutingShrine',
        choiceKey: 'executionLesson',
        expectedProfileKey: 'windfall',
        expectedPreview: '下间淘金',
        expectedEntry: '淘金战 · 后排赏金 · 破势追杀',
        expectedClear: '淘金战 · 赏金到手 · 破势追杀',
        expectedSourceCue: '破势追杀',
        moment: 'bounty'
    },
    {
        roomKey: 'combatFlowShrine',
        choiceKey: 'breathingLesson',
        expectedProfileKey: 'breather',
        expectedPreview: '下间缓冲',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回息稳场',
        expectedClear: '缓冲战 · 稳住出清 · 回息稳场',
        expectedSourceCue: '回息稳场',
        moment: 'stabilize'
    },
    {
        roomKey: 'combatFlowShrine',
        choiceKey: 'momentumLesson',
        expectedProfileKey: 'pressure',
        expectedPreview: '下间高压',
        expectedEntry: '高压战 · 三向成压 · 借势重击',
        expectedClear: '高压战 · 顶住成压 · 借势重击',
        expectedSourceCue: '借势重击',
        moment: 'engage'
    },
    {
        roomKey: 'comboLinkShrine',
        choiceKey: 'sharpeningLesson',
        expectedProfileKey: 'pressure',
        expectedPreview: '下间高压',
        expectedEntry: '高压战 · 三向成压 · 催锋连段',
        expectedClear: '高压战 · 顶住成压 · 催锋连段',
        expectedSourceCue: '催锋连段',
        moment: 'engage'
    },
    {
        roomKey: 'comboLinkShrine',
        choiceKey: 'reversalStepLesson',
        expectedProfileKey: 'breather',
        expectedPreview: '下间缓冲',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回身整拍',
        expectedClear: '缓冲战 · 稳住出清 · 回身整拍',
        expectedSourceCue: '回身整拍',
        moment: 'stabilize'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'pursuitLesson',
        expectedProfileKey: 'windfall',
        expectedPreview: '下间淘金',
        expectedEntry: '淘金战 · 后排赏金 · 追猎追赏',
        expectedClear: '淘金战 · 赏金到手 · 追猎追赏',
        expectedSourceCue: '追猎追赏',
        moment: 'bounty'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'focusLesson',
        expectedProfileKey: 'breather',
        expectedPreview: '下间缓冲',
        expectedEntry: '缓冲战 · 双拍缓冲 · 调息回线',
        expectedClear: '缓冲战 · 稳住出清 · 调息回线',
        expectedSourceCue: '调息回线',
        moment: 'stabilize'
    }
]);

const ACTION_ROUTE_RECOMMENDATION_ECHO_CASES = Object.freeze([
    {
        roomKey: 'combatDisciplineShrine',
        choiceKey: 'flurryLesson',
        reason: '普攻卡拍',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 抢拍开刃',
        expectedClear: '高压战 · 顶住成压 · 抢拍开刃',
        expectedSourceCue: '抢拍开刃',
        moment: 'engage'
    },
    {
        roomKey: 'combatDisciplineShrine',
        choiceKey: 'ghostStepLesson',
        reason: '闪避卡拍',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 游步回拍',
        expectedClear: '缓冲战 · 稳住出清 · 游步回拍',
        expectedSourceCue: '游步回拍',
        moment: 'stabilize'
    },
    {
        roomKey: 'controlRoutingShrine',
        choiceKey: 'crushingLesson',
        reason: '当前更宜控场',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 先控稳场',
        expectedClear: '缓冲战 · 稳住出清 · 先控稳场',
        expectedSourceCue: '先控稳场',
        moment: 'stabilize'
    },
    {
        roomKey: 'controlRoutingShrine',
        choiceKey: 'crushingLesson',
        reason: '目标Boss更宜控场',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 先控稳场',
        expectedClear: '缓冲战 · 稳住出清 · 先控稳场',
        expectedSourceCue: '先控稳场',
        moment: 'stabilize'
    },
    {
        roomKey: 'controlRoutingShrine',
        choiceKey: 'executionLesson',
        reason: '当前可追终结',
        expectedProfileKey: 'windfall',
        expectedEntry: '淘金战 · 后排赏金 · 破势收赏',
        expectedClear: '淘金战 · 赏金到手 · 破势收赏',
        expectedSourceCue: '破势收赏',
        moment: 'bounty'
    },
    {
        roomKey: 'combatFlowShrine',
        choiceKey: 'breathingLesson',
        reason: '当前更缺回线',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回线稳场',
        expectedClear: '缓冲战 · 稳住出清 · 回线稳场',
        expectedSourceCue: '回线稳场',
        moment: 'stabilize'
    },
    {
        roomKey: 'combatFlowShrine',
        choiceKey: 'momentumLesson',
        reason: '特攻待借势',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 借势抢压',
        expectedClear: '高压战 · 顶住成压 · 借势抢压',
        expectedSourceCue: '借势抢压',
        moment: 'engage'
    },
    {
        roomKey: 'combatFlowShrine',
        choiceKey: 'momentumLesson',
        reason: '目标Boss更宜借势',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 借势抢压',
        expectedClear: '高压战 · 顶住成压 · 借势抢压',
        expectedSourceCue: '借势抢压',
        moment: 'engage'
    },
    {
        roomKey: 'comboLinkShrine',
        choiceKey: 'sharpeningLesson',
        reason: '特攻待连段',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 连段催锋',
        expectedClear: '高压战 · 顶住成压 · 连段催锋',
        expectedSourceCue: '连段催锋',
        moment: 'engage'
    },
    {
        roomKey: 'comboLinkShrine',
        choiceKey: 'sharpeningLesson',
        reason: '目标Boss更宜连段',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 连段催锋',
        expectedClear: '高压战 · 顶住成压 · 连段催锋',
        expectedSourceCue: '连段催锋',
        moment: 'engage'
    },
    {
        roomKey: 'comboLinkShrine',
        choiceKey: 'reversalStepLesson',
        reason: '闪避待回身',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回身回拍',
        expectedClear: '缓冲战 · 稳住出清 · 回身回拍',
        expectedSourceCue: '回身回拍',
        moment: 'stabilize'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'pursuitLesson',
        reason: '可立即追猎',
        expectedProfileKey: 'windfall',
        expectedEntry: '淘金战 · 后排赏金 · 追猎收赏',
        expectedClear: '淘金战 · 赏金到手 · 追猎收赏',
        expectedSourceCue: '追猎收赏',
        moment: 'bounty'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'pursuitLesson',
        reason: '目标Boss更宜追猎',
        expectedProfileKey: 'windfall',
        expectedEntry: '淘金战 · 后排赏金 · 追猎收赏',
        expectedClear: '淘金战 · 赏金到手 · 追猎收赏',
        expectedSourceCue: '追猎收赏',
        moment: 'bounty'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'focusLesson',
        reason: '当前更缺回体',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回体稳线',
        expectedClear: '缓冲战 · 稳住出清 · 回体稳线',
        expectedSourceCue: '回体稳线',
        moment: 'stabilize'
    },
    {
        roomKey: 'counterattackShrine',
        choiceKey: 'focusLesson',
        reason: '目标Boss更宜回体',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 回体稳线',
        expectedClear: '缓冲战 · 稳住出清 · 回体稳线',
        expectedSourceCue: '回体稳线',
        moment: 'stabilize'
    }
]);

const RESOURCE_ROUTE_ENCOUNTER_CASES = Object.freeze([
    {
        roomKey: 'prayerShrine',
        choiceKey: 'renewalPrayer',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 复苏回拍',
        expectedClear: '缓冲战 · 稳住出清 · 复苏回拍',
        expectedSourceCue: '复苏回拍',
        moment: 'stabilize'
    },
    {
        roomKey: 'prayerShrine',
        choiceKey: 'tempoPrayer',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 迅击抢拍',
        expectedClear: '高压战 · 顶住成压 · 迅击抢拍',
        expectedSourceCue: '迅击抢拍',
        moment: 'engage'
    },
    {
        roomKey: 'gamblersShrine',
        choiceKey: 'highStakeWager',
        expectedProfileKey: 'windfall',
        expectedEntry: '淘金战 · 后排赏金 · 豪赌追赏',
        expectedClear: '淘金战 · 赏金到手 · 豪赌追赏',
        expectedSourceCue: '豪赌追赏',
        moment: 'bounty'
    },
    {
        roomKey: 'gamblersShrine',
        choiceKey: 'carefulWager',
        expectedProfileKey: 'windfall',
        expectedEntry: '淘金战 · 后排赏金 · 稳押收赏',
        expectedClear: '淘金战 · 赏金到手 · 稳押收赏',
        expectedSourceCue: '稳押收赏',
        moment: 'bounty'
    },
    {
        roomKey: 'supplyCache',
        choiceKey: 'fieldTonic',
        expectedProfileKey: 'breather',
        expectedEntry: '缓冲战 · 双拍缓冲 · 净包稳场',
        expectedClear: '缓冲战 · 稳住出清 · 净包稳场',
        expectedSourceCue: '净包稳场',
        moment: 'stabilize'
    },
    {
        roomKey: 'supplyCache',
        choiceKey: 'berserkerKit',
        expectedProfileKey: 'pressure',
        expectedEntry: '高压战 · 三向成压 · 狂油抢势',
        expectedClear: '高压战 · 顶住成压 · 狂油抢势',
        expectedSourceCue: '狂油抢势',
        moment: 'engage'
    }
]);

function testRunEventEncounterProfileHelpers() {
    assert.equal(typeof getRunEventRoomChoiceEncounterProfile, 'function', 'event room encounter profile helper should be exported');
    assert.equal(typeof buildRunEventEncounterRoster, 'function', 'event room encounter roster helper should be exported');
    assert.equal(typeof formatRunEventRoomChoiceEncounterPreview, 'function', 'event room encounter preview helper should be exported');
    assert.equal(typeof getRunEventEncounterProfile, 'function', 'resolved event room encounter helper should be exported');
    assert.equal(typeof buildRunEventEncounterEntryPreview, 'function', 'event room encounter entry preview helper should be exported');

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    const healingProfile = getRunEventRoomChoiceEncounterProfile(healingChoice);
    assert.equal(healingProfile.key, 'breather', 'healing/cleanse routes should bias the next room toward a breather profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(healingChoice), '下间缓冲', 'healing/cleanse routes should preview the breather encounter');

    const prayerChoice = getRunEventRoomChoices('prayerShrine').find(choice => choice.key === 'tempoPrayer');
    const prayerProfile = getRunEventRoomChoiceEncounterProfile(prayerChoice);
    assert.equal(prayerProfile.key, 'pressure', 'tempo/burst routes should bias the next room toward a pressure profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(prayerChoice), '下间高压', 'tempo/burst routes should preview the pressure encounter');

    const desperationChoice = getRunEventRoomChoices('riskRewardShrine').find(choice => choice.key === 'desperationLesson');
    const desperationProfile = getRunEventRoomChoiceEncounterProfile(desperationChoice);
    assert.equal(desperationProfile.key, 'pressure', 'low-HP burst routes should now bias the next room toward a pressure profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(desperationChoice), '下间高压', 'low-HP burst routes should preview the pressure encounter once they participate in routing');

    const composureChoice = getRunEventRoomChoices('riskRewardShrine').find(choice => choice.key === 'composureLesson');
    const composureProfile = getRunEventRoomChoiceEncounterProfile(composureChoice);
    assert.equal(composureProfile.key, 'breather', 'high-HP guard routes should now bias the next room toward a breather profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(composureChoice), '下间缓冲', 'high-HP guard routes should preview the breather encounter once they participate in routing');

    const vanguardChoice = getRunEventRoomChoices('weaponRoutingShrine').find(choice => choice.key === 'vanguardLesson');
    const vanguardProfile = getRunEventRoomChoiceEncounterProfile(vanguardChoice);
    assert.equal(vanguardProfile.key, 'pressure', 'melee weapon-routing routes should bias the next room toward a pressure profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(vanguardChoice), '下间高压', 'melee weapon-routing routes should preview the pressure encounter');

    const longshotChoice = getRunEventRoomChoices('weaponRoutingShrine').find(choice => choice.key === 'longshotLesson');
    const longshotProfile = getRunEventRoomChoiceEncounterProfile(longshotChoice);
    assert.equal(longshotProfile.key, 'windfall', 'ranged weapon-routing routes should bias the next room toward a windfall profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(longshotChoice), '下间淘金', 'ranged weapon-routing routes should preview the windfall encounter');

    const emberChoice = getRunEventRoomChoices('statusRoutingShrine').find(choice => choice.key === 'emberLesson');
    const emberProfile = getRunEventRoomChoiceEncounterProfile(emberChoice);
    assert.equal(emberProfile.key, 'breather', 'burn status routes should bias the next room toward a breather profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(emberChoice), '下间缓冲', 'burn status routes should preview the breather encounter');

    const bloodtraceChoice = getRunEventRoomChoices('statusRoutingShrine').find(choice => choice.key === 'bloodtraceLesson');
    const bloodtraceProfile = getRunEventRoomChoiceEncounterProfile(bloodtraceChoice);
    assert.equal(bloodtraceProfile.key, 'pressure', 'bleed status routes should bias the next room toward a pressure profile');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(bloodtraceChoice), '下间高压', 'bleed status routes should preview the pressure encounter');

    ACTION_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedPreview }) => {
        const choice = getRunEventRoomChoices(roomKey).find(item => item.key === choiceKey);
        const profile = getRunEventRoomChoiceEncounterProfile(choice);
        assert.equal(
            profile && profile.key,
            expectedProfileKey,
            `${choiceKey} should bias the next room toward ${expectedProfileKey}`
        );
        assert.equal(
            formatRunEventRoomChoiceEncounterPreview(choice),
            expectedPreview,
            `${choiceKey} should preview ${expectedPreview}`
        );
    });

    const gambleChoice = getRunEventRoomChoices('gamblersShrine').find(choice => choice.key === 'highStakeWager');
    const gambleProfile = getRunEventRoomChoiceEncounterProfile(gambleChoice);
    assert.equal(gambleProfile.key, 'windfall', 'economy routes should bias the next room toward a windfall profile');
    assert.equal(gambleProfile.enemyGoldMultiplier, 1.5, 'windfall routes should scale the next room gold drops');
    assert.equal(formatRunEventRoomChoiceEncounterPreview(gambleChoice), '下间淘金', 'economy routes should preview the windfall encounter');

    const resolvedProfile = getRunEventEncounterProfile({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'tempoPrayer',
        selectedChoiceLabel: '迅击祷言',
        resolutionText: '特攻冷却 -22%'
    });
    assert.equal(resolvedProfile.key, 'pressure', 'resolved event rooms should expose the chosen route encounter profile');
    assert.equal(resolvedProfile.encounterLabel, '高压战', 'resolved event rooms should expose the human-readable encounter label');
    assert.equal(
        buildRunEventEncounterEntryPreview(resolvedProfile),
        '高压战 · 三向成压',
        'pressure routes should expose the shared room-entry tactical cue'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'healingFountain',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'purifyingSip',
                selectedChoiceRecommendationReason: '可净化2层'
            }
        ),
        '缓冲战 · 双拍缓冲 · 净化后稳场',
        'breather entry previews should append a short recommendation echo when a cleanse route recommendation still explains the routed encounter'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'tempoPrayer',
                selectedChoiceRecommendationReason: '当前局已偏节奏'
            }
        ),
        '高压战 · 三向成压 · 顺势抢压',
        'tempo prayer should upgrade its routed entry cue when tempo bias is the high-confidence reason behind the pressure route'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'supplyCache',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'fieldTonic',
                selectedChoiceRecommendationReason: '当前可负担'
            }
        ),
        '缓冲战 · 双拍缓冲 · 趁价备净',
        'field tonic should upgrade its routed entry cue when current affordability is what justified buying the support item now'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '已处绝境线'
            }
        ),
        '高压战 · 三向成压 · 压线抢势',
        'pressure entry previews should append a short recommendation echo when a low-HP burst route is already inside its threshold'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '当前持近战'
            }
        ),
        '高压战 · 三向成压 · 贴身压阵',
        'pressure entry previews should append a short recommendation echo when a melee routing recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '近战更宜压线'
            }
        ),
        '高压战 · 三向成压 · 贴身压阵',
        'pressure entry previews should also accept the newer contextual vanguard reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '当前持远程'
            }
        ),
        '淘金战 · 后排赏金 · 远程追赏',
        'windfall entry previews should append a short recommendation echo when a ranged routing recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '远程更宜追赏'
            }
        ),
        '淘金战 · 后排赏金 · 远程追赏',
        'windfall entry previews should also accept the newer contextual longshot reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'renewalPrayer',
                selectedChoiceRecommendationReason: '目标Boss更宜回体'
            }
        ),
        '缓冲战 · 双拍缓冲 · 回体稳线',
        'breather entry previews should also accept boss-aware sustain reasons when the chosen prayer was recommended for the current boss posture'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            }
        ),
        '缓冲战 · 双拍缓冲 · 灼烧稳场',
        'breather entry previews should append a short recommendation echo when a burn route recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '灼烧更宜稳场'
            }
        ),
        '缓冲战 · 双拍缓冲 · 灼烧稳场',
        'breather entry previews should also accept the newer contextual ember reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'composureLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜回体'
            }
        ),
        '缓冲战 · 双拍缓冲 · 守心稳场',
        'breather entry previews should accept boss-aware sustain reasons for threshold routes when composure was chosen for the target boss posture'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜控场'
            }
        ),
        '缓冲战 · 双拍缓冲 · 灼烧稳场',
        'breather entry previews should accept boss-aware control reasons for burn-status routes when the target boss posture still explains the calmer room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            }
        ),
        '高压战 · 三向成压 · 挂血抢势',
        'pressure entry previews should append a short recommendation echo when a bleed route recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '挂血更宜抢势'
            }
        ),
        '高压战 · 三向成压 · 挂血抢势',
        'pressure entry previews should also accept the newer contextual bloodtrace reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            }
        ),
        '高压战 · 三向成压 · 压线抢势',
        'pressure entry previews should accept boss-aware pressure reasons for threshold routes when desperation was chosen for the target boss posture'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            }
        ),
        '高压战 · 三向成压 · 挂血抢势',
        'pressure entry previews should accept boss-aware pressure reasons for bleed-status routes when the target boss posture still explains the aggressive room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'gamblersShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'highStakeWager',
                selectedChoiceRecommendationReason: '当前血线更能承受'
            }
        ),
        '淘金战 · 后排赏金 · 血线够追赏',
        'windfall entry previews should append a short recommendation echo when the player explicitly had enough HP to cash into a chase-for-bounty route'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview({ key: 'breather', encounterLabel: '缓冲战' }),
        '缓冲战 · 双拍缓冲',
        'breather routes should expose the shared room-entry tactical cue'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview({ key: 'windfall', encounterLabel: '淘金战' }),
        '淘金战 · 后排赏金',
        'windfall routes should expose the shared room-entry tactical cue'
    );
    ACTION_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedEntry }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterEntryPreview(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                }
            ),
            expectedEntry,
            `${choiceKey} should append its baseline route anchor to the routed room-3 entry cue`
        );
    });
    ACTION_ROUTE_RECOMMENDATION_ECHO_CASES.forEach(({ roomKey, choiceKey, reason, expectedProfileKey, expectedEntry }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterEntryPreview(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey,
                    selectedChoiceRecommendationReason: reason
                }
            ),
            expectedEntry,
            `${choiceKey} should upgrade its routed room-3 entry cue when its action recommendation reason still explains the encounter`
        );
    });
    RESOURCE_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedEntry }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterEntryPreview(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                }
            ),
            expectedEntry,
            `${choiceKey} should append its resource-route baseline anchor to the routed room-3 entry cue`
        );
    });
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'gamblersShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'carefulWager',
                selectedChoiceRecommendationReason: '当前更宜稳押'
            }
        ),
        '淘金战 · 后排赏金 · 留本追赏',
        'careful wager should upgrade its routed entry cue when the safer-gamble recommendation reason is what justified the windfall room'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview({ key: 'unknown', encounterLabel: '未知战' }),
        '',
        'unknown encounter profiles should stay silent instead of inventing a room-entry cue'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(null),
        '',
        'missing encounter profiles should keep the room-entry cue helper silent'
    );
}

function testRunEventEncounterRosterHelpers() {
    const enemyPool = ['soldier', 'archer', 'brute'];
    const enemyDefs = {
        soldier: { hp: 48, damage: 10, speed: 66, drops: { gold: [5, 15] } },
        archer: { hp: 52, damage: 12, speed: 56, drops: { gold: [8, 20] } },
        brute: { hp: 72, damage: 18, speed: 47, drops: { gold: [10, 25] } }
    };

    assert.deepEqual(
        buildRunEventEncounterRoster({ key: 'breather' }, enemyPool, enemyDefs),
        ['soldier', 'archer'],
        'breather profiles should keep room 3 to the two lowest-pressure enemy archetypes'
    );
    assert.deepEqual(
        buildRunEventEncounterRoster({ key: 'pressure' }, enemyPool, enemyDefs),
        ['brute', 'archer', 'soldier'],
        'pressure profiles should route room 3 through every local archetype ordered by pressure'
    );
    assert.deepEqual(
        buildRunEventEncounterRoster({ key: 'windfall' }, enemyPool, enemyDefs),
        ['brute', 'archer'],
        'windfall profiles should keep room 3 focused on the highest-gold enemy archetypes'
    );
    assert.deepEqual(
        buildRunEventEncounterRoster({ key: 'unknown' }, enemyPool, enemyDefs),
        ['soldier', 'archer'],
        'unknown profiles should fall back to the first two local archetypes'
    );
}

function testRunEventEncounterFormationHelpers() {
    assert.equal(typeof buildRunEventEncounterFormationSlots, 'function', 'event room encounter formation helper should be exported');

    assert.deepEqual(
        buildRunEventEncounterFormationSlots({ key: 'breather' }, ['soldier', 'archer']),
        [
            { enemyKey: 'soldier', laneRatio: 0.64, depthBand: 'back', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
            { enemyKey: 'archer', laneRatio: 0.82, depthBand: 'back', flankOffset: 1, engageDelayMs: 700, goldDropMultiplier: 1, bountyLabel: '' }
        ],
        'breather profiles should open room 3 with a deeper wider spread, a staggered second engage beat, and stable even reward weight'
    );
    assert.deepEqual(
        buildRunEventEncounterFormationSlots({ key: 'pressure' }, ['brute', 'archer', 'soldier']),
        [
            { enemyKey: 'brute', laneRatio: 0.3, depthBand: 'front', flankOffset: 0, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
            { enemyKey: 'archer', laneRatio: 0.42, depthBand: 'front', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
            { enemyKey: 'soldier', laneRatio: 0.54, depthBand: 'front', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' }
        ],
        'pressure profiles should compress room 3 into an earlier multi-angle opening without delaying any threat or pushing a single bounty target'
    );
    assert.deepEqual(
        buildRunEventEncounterFormationSlots({ key: 'windfall' }, ['brute', 'archer']),
        [
            { enemyKey: 'archer', laneRatio: 0.46, depthBand: 'front', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 0.7, bountyLabel: '' },
            { enemyKey: 'brute', laneRatio: 0.78, depthBand: 'back', flankOffset: -1, engageDelayMs: 900, goldDropMultiplier: 1.3, bountyLabel: '赏金' }
        ],
        'windfall profiles should stagger the bounty pair into a front/back stack, delay the deeper reward target, and pin more gold plus a bounty marker onto that chase target'
    );
    assert.deepEqual(
        buildRunEventEncounterFormationSlots({ key: 'unknown' }, ['soldier', 'archer']),
        [
            { enemyKey: 'soldier', laneRatio: 0.4, depthBand: 'mid', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
            { enemyKey: 'archer', laneRatio: 0.6, depthBand: 'mid', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' }
        ],
        'unknown profiles should fall back to a stable mid-room spread without hidden timing shifts or reward bias'
    );
}

function testRunEventEncounterPayoffHelpers() {
    assert.equal(typeof buildRunEventEncounterPayoffPresentation, 'function', 'event room encounter payoff helper should be exported');

    assert.equal(
        buildRunEventEncounterPayoffPresentation({ goldDropMultiplier: 1, bountyLabel: '' }, 24),
        null,
        'non-bounty encounter slots should keep the default steady gold feedback'
    );
    assert.equal(
        buildRunEventEncounterPayoffPresentation({ goldDropMultiplier: 1.3, bountyLabel: '赏金' }, 0),
        null,
        'bounty feedback should stay silent if no actual gold was awarded'
    );
    assert.deepEqual(
        buildRunEventEncounterPayoffPresentation({ goldDropMultiplier: 1.3, bountyLabel: '赏金' }, 37),
        {
            receiptLabel: '赏金+37',
            receiptColor: '#fff0a6',
            pulseColor: 0xFFE27A,
            pickupTint: 0xFFD27A,
            pickupScale: 1.35
        },
        'marked windfall targets should convert routed gold into a short bounty receipt plus a brighter gold-burst presentation'
    );
}

function testRunEventEncounterClearRecapHelpers() {
    assert.equal(typeof buildRunEventEncounterClearRecap, 'function', 'event room encounter clear recap helper should be exported');

    assert.equal(
        buildRunEventEncounterClearRecap({ key: 'breather', encounterLabel: '缓冲战' }),
        '缓冲战 · 稳住出清',
        'breather routes should close the room with a stability-first clear recap'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'healingFountain',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'purifyingSip',
                selectedChoiceRecommendationReason: '可净化2层'
            }
        ),
        '缓冲战 · 稳住出清 · 净化后稳场',
        'breather clear recaps should append the shared recommendation echo when a cleanse route is still what made the routed room make sense'
    );
    assert.equal(
        buildRunEventEncounterClearRecap({ key: 'pressure', encounterLabel: '高压战' }),
        '高压战 · 顶住成压',
        'pressure routes should close the room with a pressure-held clear recap'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '已处绝境线'
            }
        ),
        '高压战 · 顶住成压 · 压线抢势',
        'pressure clear recaps should append the shared recommendation echo when a threshold-risk route still explains the routed pressure room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '当前持近战'
            }
        ),
        '高压战 · 顶住成压 · 贴身压阵',
        'pressure clear recaps should append the shared recommendation echo when a melee routing recommendation still explains the routed pressure room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '当前持远程'
            }
        ),
        '淘金战 · 赏金到手 · 远程追赏',
        'windfall clear recaps should append the shared recommendation echo when a ranged routing recommendation still explains the routed bounty room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            }
        ),
        '缓冲战 · 稳住出清 · 灼烧稳场',
        'breather clear recaps should append the shared recommendation echo when a burn route recommendation still explains the routed breather room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'composureLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜回体'
            }
        ),
        '缓冲战 · 稳住出清 · 守心稳场',
        'breather clear recaps should accept boss-aware sustain reasons for threshold routes when composure still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜控场'
            }
        ),
        '缓冲战 · 稳住出清 · 灼烧稳场',
        'breather clear recaps should accept boss-aware control reasons for burn-status routes when the target boss posture still explains the calmer room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            }
        ),
        '高压战 · 顶住成压 · 挂血抢势',
        'pressure clear recaps should append the shared recommendation echo when a bleed route recommendation still explains the routed pressure room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            }
        ),
        '高压战 · 顶住成压 · 压线抢势',
        'pressure clear recaps should accept boss-aware pressure reasons for threshold routes when desperation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            }
        ),
        '高压战 · 顶住成压 · 挂血抢势',
        'pressure clear recaps should accept boss-aware pressure reasons for bleed-status routes when the target boss posture still explains the aggressive room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap({ key: 'windfall', encounterLabel: '淘金战' }),
        '淘金战 · 赏金到手',
        'windfall routes should close the room with a payoff-secured clear recap'
    );
    ACTION_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedClear }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterClearRecap(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                }
            ),
            expectedClear,
            `${choiceKey} should append its baseline route anchor to the routed room-3 clear recap`
        );
    });
    ACTION_ROUTE_RECOMMENDATION_ECHO_CASES.forEach(({ roomKey, choiceKey, reason, expectedProfileKey, expectedClear }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterClearRecap(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey,
                    selectedChoiceRecommendationReason: reason
                }
            ),
            expectedClear,
            `${choiceKey} should upgrade its routed room-3 clear recap when its action recommendation reason still explains the encounter`
        );
    });
    RESOURCE_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedClear }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterClearRecap(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                }
            ),
            expectedClear,
            `${choiceKey} should append its resource-route baseline anchor to the routed room-3 clear recap`
        );
    });
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'gamblersShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'carefulWager',
                selectedChoiceRecommendationReason: '当前更宜稳押'
            }
        ),
        '淘金战 · 赏金到手 · 留本追赏',
        'careful wager should upgrade its clear recap when the safer-gamble recommendation reason still explains the routed bounty room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'tempoPrayer',
                selectedChoiceRecommendationReason: '当前局已偏节奏'
            }
        ),
        '高压战 · 顶住成压 · 顺势抢压',
        'tempo prayer should upgrade its routed clear recap when tempo bias still explains the pressure room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'supplyCache',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'fieldTonic',
                selectedChoiceRecommendationReason: '当前可负担'
            }
        ),
        '缓冲战 · 稳住出清 · 趁价备净',
        'field tonic should upgrade its routed clear recap when affordability is the reason that made the stabilize-first route sensible'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '近战更宜压线'
            }
        ),
        '高压战 · 顶住成压 · 贴身压阵',
        'pressure clear recaps should also accept the newer contextual vanguard reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '远程更宜追赏'
            }
        ),
        '淘金战 · 赏金到手 · 远程追赏',
        'windfall clear recaps should also accept the newer contextual longshot reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '灼烧更宜稳场'
            }
        ),
        '缓冲战 · 稳住出清 · 灼烧稳场',
        'breather clear recaps should also accept the newer contextual ember reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '挂血更宜抢势'
            }
        ),
        '高压战 · 顶住成压 · 挂血抢势',
        'pressure clear recaps should also accept the newer contextual bloodtrace reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterClearRecap({ key: 'unknown', encounterLabel: '未知战' }),
        '',
        'unknown encounter profiles should stay silent instead of inventing a clear recap'
    );
    assert.equal(
        buildRunEventEncounterClearRecap(null),
        '',
        'missing encounter profiles should keep the room-clear recap helper silent'
    );
}

function testRunEventEncounterBossDoorRecapHelpers() {
    assert.equal(typeof buildRunEventEncounterBossDoorRecap, 'function', 'event room Boss-door recap helper should be exported');

    assert.equal(
        buildRunEventEncounterBossDoorRecap({ key: 'breather', encounterLabel: '缓冲战' }),
        '缓冲路线 · 稳线迎战',
        'breather routes should preserve a stability-first run-arc recap at the Boss door'
    );
    assert.equal(
        buildRunEventEncounterBossDoorRecap({ key: 'pressure', encounterLabel: '高压战' }),
        '高压路线 · 顶压迎战',
        'pressure routes should preserve a pressure-first run-arc recap at the Boss door'
    );
    assert.equal(
        buildRunEventEncounterBossDoorRecap({ key: 'windfall', encounterLabel: '淘金战' }),
        '淘金路线 · 带赏迎战',
        'windfall routes should preserve a bounty-first run-arc recap at the Boss door'
    );
    assert.equal(
        buildRunEventEncounterBossDoorRecap({ key: 'unknown', encounterLabel: '未知战' }),
        '',
        'unknown encounter profiles should stay silent instead of inventing a Boss-door run-arc recap'
    );
    assert.equal(
        buildRunEventEncounterBossDoorRecap(null),
        '',
        'missing encounter profiles should keep the Boss-door run-arc recap helper silent'
    );
}

function testRunEventEncounterBossOpeningEchoHelpers() {
    assert.equal(typeof buildRunEventEncounterBossOpeningEcho, 'function', 'event room Boss-opening echo helper should be exported');

    assert.equal(
        buildRunEventEncounterBossOpeningEcho({ key: 'breather', encounterLabel: '缓冲战' }),
        '缓冲路线 · 稳线开局',
        'breather routes should carry a stability-first echo into the first boss-opening beat'
    );
    assert.equal(
        buildRunEventEncounterBossOpeningEcho({ key: 'pressure', encounterLabel: '高压战' }),
        '高压路线 · 抢势开局',
        'pressure routes should carry a pressure-first echo into the first boss-opening beat'
    );
    assert.equal(
        buildRunEventEncounterBossOpeningEcho({ key: 'windfall', encounterLabel: '淘金战' }),
        '淘金路线 · 带赏开局',
        'windfall routes should carry a bounty-first echo into the first boss-opening beat'
    );
    assert.equal(
        buildRunEventEncounterBossOpeningEcho({ key: 'unknown', encounterLabel: '未知战' }),
        '',
        'unknown encounter profiles should stay silent instead of inventing a Boss-opening echo'
    );
    assert.equal(
        buildRunEventEncounterBossOpeningEcho(null),
        '',
        'missing encounter profiles should keep the Boss-opening echo helper silent'
    );
}

function testRunEventEncounterBossVictoryRecapHelpers() {
    assert.equal(typeof buildRunEventEncounterBossVictoryRecap, 'function', 'event room Boss-victory recap helper should be exported');

    assert.equal(
        buildRunEventEncounterBossVictoryRecap({ key: 'breather', encounterLabel: '缓冲战' }),
        '缓冲路线 · 稳线收官',
        'breather routes should close the routed segment with a stability-first Boss-victory recap'
    );
    assert.equal(
        buildRunEventEncounterBossVictoryRecap({ key: 'pressure', encounterLabel: '高压战' }),
        '高压路线 · 顶压收官',
        'pressure routes should close the routed segment with a pressure-first Boss-victory recap'
    );
    assert.equal(
        buildRunEventEncounterBossVictoryRecap({ key: 'windfall', encounterLabel: '淘金战' }),
        '淘金路线 · 带赏收官',
        'windfall routes should close the routed segment with a bounty-first Boss-victory recap'
    );
    assert.equal(
        buildRunEventEncounterBossVictoryRecap({ key: 'unknown', encounterLabel: '未知战' }),
        '',
        'unknown encounter profiles should stay silent instead of inventing a Boss-victory recap'
    );
    assert.equal(
        buildRunEventEncounterBossVictoryRecap(null),
        '',
        'missing encounter profiles should keep the Boss-victory recap helper silent'
    );
}

function testRunEventEncounterSourceCueHelpers() {
    assert.equal(typeof buildRunEventEncounterSourceCue, 'function', 'event room encounter source cue helper should be exported');

    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'healingFountain',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'purifyingSip',
                selectedChoiceRecommendationReason: '可净化2层'
            },
            'stabilize'
        ),
        '净化后稳场',
        'breather source cues should fire on the first stabilize beat when a cleanse recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '已处绝境线'
            },
            'engage'
        ),
        '压线抢势',
        'pressure source cues should fire on the first pressure-contact beat when the low-HP burst recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '当前持近战'
            },
            'engage'
        ),
        '贴身压阵',
        'pressure source cues should fire on the first pressure-contact beat when a melee routing recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '近战更宜压线'
            },
            'engage'
        ),
        '贴身压阵',
        'pressure source cues should also accept the newer contextual vanguard reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '当前持远程'
            },
            'bounty'
        ),
        '远程追赏',
        'windfall source cues should fire on the first bounty payoff beat when a ranged routing recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'longshotLesson',
                selectedChoiceRecommendationReason: '远程更宜追赏'
            },
            'bounty'
        ),
        '远程追赏',
        'windfall source cues should also accept the newer contextual longshot reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            },
            'stabilize'
        ),
        '灼烧稳场',
        'breather source cues should fire on the first stabilize beat when a burn route recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '灼烧更宜稳场'
            },
            'stabilize'
        ),
        '灼烧稳场',
        'breather source cues should also accept the newer contextual ember reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'composureLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜回体'
            },
            'stabilize'
        ),
        '守心稳场',
        'breather source cues should accept boss-aware sustain reasons for threshold routes when composure still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'emberLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜控场'
            },
            'stabilize'
        ),
        '灼烧稳场',
        'breather source cues should accept boss-aware control reasons for burn-status routes when the target boss posture still explains the calmer room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '当前武器可触发'
            },
            'engage'
        ),
        '挂血抢势',
        'pressure source cues should fire on the first pressure-contact beat when a bleed route recommendation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '挂血更宜抢势'
            },
            'engage'
        ),
        '挂血抢势',
        'pressure source cues should also accept the newer contextual bloodtrace reason when it still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'riskRewardShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'desperationLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            },
            'engage'
        ),
        '压线抢势',
        'pressure source cues should accept boss-aware pressure reasons for threshold routes when desperation still explains the routed room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'statusRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'bloodtraceLesson',
                selectedChoiceRecommendationReason: '目标Boss更宜压线'
            },
            'engage'
        ),
        '挂血抢势',
        'pressure source cues should accept boss-aware pressure reasons for bleed-status routes when the target boss posture still explains the aggressive room'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'gamblersShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'highStakeWager',
                selectedChoiceRecommendationReason: '当前血线更能承受'
            },
            'bounty'
        ),
        '血线够追赏',
        'windfall source cues should fire on the first bounty payoff beat when the high-risk gold route was explicitly recommended'
    );
    ACTION_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedSourceCue, moment }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterSourceCue(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                },
                moment
            ),
            expectedSourceCue,
            `${choiceKey} should fire its baseline route anchor on the routed combat beat`
        );
    });
    ACTION_ROUTE_RECOMMENDATION_ECHO_CASES.forEach(({ roomKey, choiceKey, reason, expectedProfileKey, expectedSourceCue, moment }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterSourceCue(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey,
                    selectedChoiceRecommendationReason: reason
                },
                moment
            ),
            expectedSourceCue,
            `${choiceKey} should upgrade its routed combat source cue when its action recommendation reason still explains the encounter`
        );
    });
    RESOURCE_ROUTE_ENCOUNTER_CASES.forEach(({ roomKey, choiceKey, expectedProfileKey, expectedSourceCue, moment }) => {
        const encounterLabel = expectedProfileKey === 'breather'
            ? '缓冲战'
            : (expectedProfileKey === 'pressure' ? '高压战' : '淘金战');
        assert.equal(
            buildRunEventEncounterSourceCue(
                { key: expectedProfileKey, encounterLabel },
                {
                    key: roomKey,
                    discovered: true,
                    resolved: true,
                    selectedChoiceKey: choiceKey
                },
                moment
            ),
            expectedSourceCue,
            `${choiceKey} should fire its resource-route baseline anchor on the routed combat beat`
        );
    });
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'windfall', encounterLabel: '淘金战' },
            {
                key: 'gamblersShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'carefulWager',
                selectedChoiceRecommendationReason: '当前更宜稳押'
            },
            'bounty'
        ),
        '留本追赏',
        'careful wager should upgrade its bounty-moment source cue when the safer-gamble recommendation reason is still what makes the routed room sensible'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'tempoPrayer',
                selectedChoiceRecommendationReason: '当前局已偏节奏'
            },
            'engage'
        ),
        '顺势抢压',
        'tempo prayer should upgrade its pressure-contact source cue when tempo bias is the reason that made the routed room fit'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'supplyCache',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'fieldTonic',
                selectedChoiceRecommendationReason: '当前可负担'
            },
            'stabilize'
        ),
        '趁价备净',
        'field tonic should upgrade its stabilize-beat source cue when the item was recommended because it was affordable right now'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(
            { key: 'breather', encounterLabel: '缓冲战' },
            {
                key: 'healingFountain',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'purifyingSip',
                selectedChoiceRecommendationReason: '可净化2层'
            },
            'engage'
        ),
        '',
        'source cue helper should stay silent when the trigger moment does not match the routed combat beat'
    );
    assert.equal(
        buildRunEventEncounterEntryPreview(
            { key: 'pressure', encounterLabel: '高压战' },
            {
                key: 'weaponRoutingShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'vanguardLesson',
                selectedChoiceRecommendationReason: '当前持近战'
            }
        ),
        '高压战 · 三向成压 · 贴身压阵',
        'recommendation-specific routed cues should still win over any baseline route-anchor fallback'
    );
    assert.equal(
        buildRunEventEncounterSourceCue(null, null, 'bounty'),
        '',
        'source cue helper should stay silent for missing encounter context'
    );
}

function testRunEventRoomChoiceRecommendation() {
    assert.equal(typeof buildRunEventRoomChoiceRecommendation, 'function', 'event room choice recommendation helper should be exported');

    const healingChoices = getRunEventRoomChoices('healingFountain');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(healingChoices, {
            playerHp: 84,
            playerMaxHp: 120,
            negativeStatuses: ['burn', 'slow']
        }),
        '建议 2：净泉啜饮 · 可净化2层',
        'recommendation helper should elevate the cleanse route when the player is currently carrying multiple negative statuses'
    );

    const riskRewardChoices = getRunEventRoomChoices('riskRewardShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(riskRewardChoices, {
            playerHp: 52,
            playerMaxHp: 120
        }),
        '建议 1：绝境修习 · 已处绝境线',
        'recommendation helper should elevate the low-HP route when the player is already under its damage threshold'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(riskRewardChoices, {
            playerHp: 72,
            playerMaxHp: 120,
            bossKey: 'pride'
        }),
        '建议 1：绝境修习 · 目标Boss更宜压线',
        'recommendation helper should use the current boss posture as a tiebreaker for threshold routes when the target fight rewards a pressure-first answer'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(riskRewardChoices, {
            playerHp: 72,
            playerMaxHp: 120,
            bossKey: 'wrath'
        }),
        '建议 2：守心修习 · 目标Boss更宜回体',
        'recommendation helper should use the current boss posture as a tiebreaker for threshold sustain routes when the target fight rewards steadier survivability'
    );

    const combatDisciplineChoices = getRunEventRoomChoices('combatDisciplineShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(combatDisciplineChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 1150,
            specialCooldownMs: 180,
            dodgeCooldownMs: 120,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：连斩修习 · 普攻卡拍',
        'recommendation helper should elevate flurry when the normal-attack cadence is the clear live bottleneck'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(combatDisciplineChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 180,
            specialCooldownMs: 220,
            dodgeCooldownMs: 1250,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：游步修习 · 闪避卡拍',
        'recommendation helper should elevate ghost step when dodge recovery is the clear live bottleneck'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(combatDisciplineChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'lust',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 240,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：游步修习 · 目标Boss更宜稳拍',
        'recommendation helper should use the current boss posture as a tiebreaker for combat-discipline routes when no stronger live bottleneck is present'
    );

    const controlChoices = getRunEventRoomChoices('controlRoutingShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(controlChoices, {
            playerHp: 60,
            playerMaxHp: 120,
            selectedWeaponKey: 'hammer',
            attackCooldownMs: 220,
            specialCooldownMs: 420,
            dodgeCooldownMs: 980,
            stamina: 18,
            staminaRegenPerSecond: 11,
            attackStaminaCost: 12,
            specialStaminaCost: 20,
            dodgeStaminaCost: 14
        }),
        '建议 1：镇步修习 · 当前更宜控场',
        'recommendation helper should elevate the slow-control route when the live state clearly calls for a safer control-oriented stabilizer'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(controlChoices, {
            playerHp: 102,
            playerMaxHp: 120,
            selectedWeaponKey: 'hammer',
            attackCooldownMs: 120,
            specialCooldownMs: 420,
            dodgeCooldownMs: 160,
            stamina: 30,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 12,
            specialStaminaCost: 20,
            dodgeStaminaCost: 14
        }),
        '建议 2：破势修习 · 当前可追终结',
        'recommendation helper should elevate the execution route when the current weapon and live state both support an immediate chase-to-kill posture'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(controlChoices, {
            playerHp: 90,
            playerMaxHp: 120,
            bossKey: 'gluttony',
            selectedWeaponKey: 'hammer',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 12,
            specialStaminaCost: 20,
            dodgeStaminaCost: 14
        }),
        '建议 1：镇步修习 · 目标Boss更宜控场',
        'recommendation helper should extend boss-posture tiebreakers into control routes when the current boss clearly rewards a slower control-first answer'
    );

    const flowChoices = getRunEventRoomChoices('combatFlowShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(flowChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 0,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 6,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：回息修习 · 当前更缺回线',
        'recommendation helper should elevate breathing when the player is currently stamina-starved'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(flowChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 160,
            specialCooldownMs: 1450,
            dodgeCooldownMs: 0,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：借势修习 · 特攻待借势',
        'recommendation helper should elevate momentum when dodge is ready but the special payoff is still clearly waiting to be cashed in'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(flowChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'lust',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：借势修习 · 目标Boss更宜借势',
        'recommendation helper should extend boss-posture tiebreakers into combat-flow routes when the target fight rewards dodge-into-special punishes'
    );

    const comboChoices = getRunEventRoomChoices('comboLinkShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(comboChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 0,
            specialCooldownMs: 1500,
            dodgeCooldownMs: 180,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：催锋修习 · 特攻待连段',
        'recommendation helper should elevate sharpening when normal attacks are ready but special cooldown is the current bottleneck'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(comboChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 180,
            specialCooldownMs: 0,
            dodgeCooldownMs: 1500,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：回身修习 · 闪避待回身',
        'recommendation helper should elevate reversal step when special is ready but dodge is the current bottleneck'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(comboChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'envy',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：催锋修习 · 目标Boss更宜连段',
        'recommendation helper should extend boss-posture tiebreakers into combo-link routes when the target fight rewards sustained chained pressure'
    );

    const counterChoices = getRunEventRoomChoices('counterattackShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(counterChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 0,
            specialCooldownMs: 320,
            dodgeCooldownMs: 0,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：追猎修习 · 可立即追猎',
        'recommendation helper should elevate pursuit when the player can cash a dodge-into-attack counter route immediately'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(counterChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 180,
            stamina: 6,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：调息修习 · 当前更缺回体',
        'recommendation helper should elevate focus when the player is clearly missing the stamina to keep the special loop stable'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(counterChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'greed',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：追猎修习 · 目标Boss更宜追猎',
        'recommendation helper should extend boss-posture tiebreakers into counter routes when the target fight rewards an explicit chase-and-punish posture'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(counterChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'wrath',
            attackCooldownMs: 220,
            specialCooldownMs: 820,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 10,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：调息修习 · 目标Boss更宜回体',
        'recommendation helper should extend boss-posture tiebreakers into counter sustain routes when the target fight clearly rewards extra stamina recovery'
    );

    const prayerChoices = getRunEventRoomChoices('prayerShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(prayerChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            runModifiers: [{ key: 'arcaneTempo', effects: { playerSpecialCooldownMultiplier: 0.82 } }]
        }),
        '建议 2：迅击祷言 · 当前局已偏节奏',
        'recommendation helper should elevate tempo prayer when the current run is already strongly biased toward tempo payoffs'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(prayerChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            selectedWeaponKey: 'sword'
        }),
        '',
        'recommendation helper should stay silent when neither visible option has a clear contextual edge'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(prayerChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            bossKey: 'wrath',
            selectedWeaponKey: 'sword'
        }),
        '建议 1：复苏祷言 · 目标Boss更宜回体',
        'recommendation helper should use the current boss posture as a tiebreaker for prayer routes when the target fight clearly asks for sustain'
    );

    const weaponRoutingChoices = getRunEventRoomChoices('weaponRoutingShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(weaponRoutingChoices, {
            playerHp: 98,
            playerMaxHp: 120,
            selectedWeaponKey: 'sword',
            attackCooldownMs: 1250,
            specialCooldownMs: 220,
            dodgeCooldownMs: 260,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 1：压阵修习 · 近战更宜压线',
        'recommendation helper should elevate vanguard when melee loadout and live combat state both point toward a pressure-first route'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(weaponRoutingChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            selectedWeaponKey: 'staff',
            attackCooldownMs: 180,
            specialCooldownMs: 1450,
            dodgeCooldownMs: 180,
            stamina: 26,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：离弦修习 · 远程更宜追赏',
        'recommendation helper should elevate longshot when ranged loadout and live combat state both point toward a bounty-chase route'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(weaponRoutingChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            selectedWeaponKey: 'sword',
            attackCooldownMs: 180,
            specialCooldownMs: 220,
            dodgeCooldownMs: 220,
            stamina: 24,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '',
        'recommendation helper should stay silent for build routes when the loadout fits but the live combat state does not create a strong reason-now signal'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(weaponRoutingChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            bossKey: 'greed',
            selectedWeaponKey: 'staff',
            attackCooldownMs: 220,
            specialCooldownMs: 260,
            dodgeCooldownMs: 220,
            stamina: 26,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：离弦修习 · 目标Boss更宜追后',
        'recommendation helper should use the current boss posture as a tiebreaker for weapon-routing routes when the target fight rewards ranged chase pressure'
    );

    const statusRoutingChoices = getRunEventRoomChoices('statusRoutingShrine');
    assert.equal(
        buildRunEventRoomChoiceRecommendation(statusRoutingChoices, {
            playerHp: 68,
            playerMaxHp: 120,
            selectedWeaponKey: 'staff',
            attackCooldownMs: 260,
            specialCooldownMs: 420,
            dodgeCooldownMs: 980,
            stamina: 18,
            staminaRegenPerSecond: 11,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 14
        }),
        '建议 1：余烬修习 · 灼烧更宜稳场',
        'recommendation helper should elevate ember when a burn-capable loadout currently wants a stabilize-first room'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(statusRoutingChoices, {
            playerHp: 108,
            playerMaxHp: 120,
            selectedWeaponKey: 'sword',
            attackCooldownMs: 180,
            specialCooldownMs: 260,
            dodgeCooldownMs: 200,
            stamina: 28,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：血痕修习 · 挂血更宜抢势',
        'recommendation helper should elevate bloodtrace when a bleed-capable loadout currently supports immediate pressure follow-up'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(statusRoutingChoices, {
            playerHp: 100,
            playerMaxHp: 120,
            bossKey: 'gluttony',
            selectedWeaponKey: 'staff',
            attackCooldownMs: 620,
            specialCooldownMs: 480,
            dodgeCooldownMs: 560,
            stamina: 26,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 14
        }),
        '建议 1：余烬修习 · 目标Boss更宜控场',
        'recommendation helper should use the current boss posture as a tiebreaker for burn-status routes when the target fight rewards a calmer control-first posture'
    );
    assert.equal(
        buildRunEventRoomChoiceRecommendation(statusRoutingChoices, {
            playerHp: 96,
            playerMaxHp: 120,
            bossKey: 'pride',
            selectedWeaponKey: 'sword',
            attackCooldownMs: 620,
            specialCooldownMs: 480,
            dodgeCooldownMs: 560,
            stamina: 26,
            staminaRegenPerSecond: 12,
            attackStaminaCost: 8,
            specialStaminaCost: 18,
            dodgeStaminaCost: 10
        }),
        '建议 2：血痕修习 · 目标Boss更宜压线',
        'recommendation helper should use the current boss posture as a tiebreaker for bleed-status routes when the target fight rewards immediate pressure'
    );
}

function testRunEventRoomChoicePanelPreview() {
    assert.equal(typeof buildRunEventRoomChoicePanelPreview, 'function', 'event room choice panel preview helper should be exported');
    assert.equal(typeof formatRunEventRoomChoiceEncounterTiming, 'function', 'event room choice timing helper should be exported');

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(healingChoice, {
            playerHp: 84,
            playerMaxHp: 120,
            negativeStatuses: ['burn', 'slow']
        }),
        '净泉啜饮 [续航/净化]: 生命+30%, 净化 · 预估生命+36 · 可净化2层',
        'panel preview should keep tactical intent tags while appending projected healing and contextual cleanse value'
    );

    const gambleChoice = getRunEventRoomChoices('gamblersShrine').find(choice => choice.key === 'highStakeWager');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(gambleChoice, {
            playerHp: 100,
            playerMaxHp: 120
        }),
        '豪赌 [经济/冒险]: 生命-30%, 金币+120 · 预估生命-30',
        'panel preview should surface tactical intent tags for risky economy routes while appending projected HP loss'
    );

    const tradeChoice = getRunEventRoomChoices('supplyCache').find(choice => choice.key === 'fieldTonic');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(tradeChoice, {
            gold: 20,
            playerHp: 100,
            playerMaxHp: 120
        }),
        '战地净化包 [补给/净化]: 金币-45, 净化药剂x1 · 仅差25金',
        'panel preview should quantify near-miss affordability for supply routes before the hard blocker footer'
    );

    const emberChoice = getRunEventRoomChoices('statusRoutingShrine').find(choice => choice.key === 'emberLesson');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(emberChoice, {
            playerHp: 100,
            playerMaxHp: 120,
            selectedWeaponKey: 'staff'
        }),
        '余烬修习: 灼烧持续时间+45%, 灼烧伤害+30% · 当前武器可触发',
        'panel preview should surface when the current loadout already supports the burn route'
    );

    const executionChoice = getRunEventRoomChoices('controlRoutingShrine').find(choice => choice.key === 'executionLesson');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(executionChoice, {
            playerHp: 100,
            playerMaxHp: 120,
            selectedWeaponKey: 'staff'
        }),
        '破势修习: 对减速目标伤害+28%, Boss破招窗口终结 · 需切至减速武器',
        'panel preview should warn when the current loadout cannot directly trigger the slow/control payoff route'
    );
    assert.equal(
        buildRunEventRoomChoicePanelPreview(tradeChoice, {
            gold: 0,
            playerHp: 100,
            playerMaxHp: 120
        }),
        '战地净化包 [补给/净化]: 金币-45, 净化药剂x1 · 金币紧张',
        'panel preview should de-emphasize supply routes when the player is far from affording them'
    );
    assert.equal(
        buildRunEventRoomChoicePanelPreview(tradeChoice, {
            gold: 60,
            playerHp: 100,
            playerMaxHp: 120,
            inventory: { cleanseTonic: 2 }
        }),
        '战地净化包 [补给/净化]: 金币-45, 净化药剂x1 · 背包已有2',
        'panel preview should surface duplicate-supply context when the player already carries the granted item'
    );

    const desperationChoice = getRunEventRoomChoices('riskRewardShrine').find(choice => choice.key === 'desperationLesson');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(desperationChoice, {
            playerHp: 52,
            playerMaxHp: 120
        }),
        '绝境修习 [爆发/冒险]: 生命<45%时伤害+40% · 已处绝境线',
        'panel preview should surface threshold relevance for low-HP risk routes when the player is already inside the breakpoint and now expose their encounter-routing intent tags'
    );

    const composureChoice = getRunEventRoomChoices('riskRewardShrine').find(choice => choice.key === 'composureLesson');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(composureChoice, {
            playerHp: 96,
            playerMaxHp: 120
        }),
        '守心修习 [续航/稳健]: 生命>70%时承伤-18% · 高血稳定',
        'panel preview should surface threshold relevance for high-HP guard routes when the player is already above the breakpoint and now expose their encounter-routing intent tags'
    );

    const tempoChoice = getRunEventRoomChoices('prayerShrine').find(choice => choice.key === 'tempoPrayer');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(tempoChoice, {
            playerHp: 100,
            playerMaxHp: 120,
            runModifiers: [{ key: 'arcaneTempo', effects: { playerSpecialCooldownMultiplier: 0.82 } }]
        }),
        '迅击祷言 [节奏/爆发]: 特攻冷却-22% · 当前局已偏节奏',
        'panel preview should surface when a tempo-focused prayer route already aligns with the current run modifiers'
    );

    const hedgeChoice = getRunEventRoomChoices('gamblersShrine').find(choice => choice.key === 'carefulWager');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(hedgeChoice, {
            playerHp: 100,
            playerMaxHp: 120,
            runModifiers: [{ key: 'fortuneWindfall', effects: { goldDropMultiplier: 1.35, extraDropRateMultiplier: 1.4 } }]
        }),
        '稳押 [经济/稳健]: 生命-12%, 金币+45 · 预估生命-12 · 当前局已偏经济',
        'panel preview should let economy synergy coexist with hp-for-gold projection notes'
    );

    assert.equal(
        buildRunEventRoomChoicePanelPreview(healingChoice, {
            playerHp: 114,
            playerMaxHp: 120,
            negativeStatuses: []
        }),
        '净泉啜饮 [续航/净化]: 生命+30%, 净化 · 预估生命+6 · 无负面可净化',
        'panel preview should surface limited healing plus the lack of cleanse value when the player is already healthy and clean'
    );
    assert.equal(
        formatRunEventRoomChoiceEncounterTiming(tempoChoice),
        '首拍兑现',
        'choice timing helper should describe pressure routes as engage-first payoffs before selection'
    );
    assert.equal(
        formatRunEventRoomChoiceEncounterTiming(healingChoice),
        '稳场兑现',
        'choice timing helper should describe breather routes as stabilize-first payoffs before selection'
    );
    assert.equal(
        formatRunEventRoomChoiceEncounterTiming(hedgeChoice),
        '追赏兑现',
        'choice timing helper should describe windfall routes as bounty-first payoffs before selection'
    );
}

function testRunEventRoomChoiceAffordabilityLabel() {
    assert.equal(typeof getRunEventRoomChoiceAffordabilityLabel, 'function', 'event room choice affordability helper should be exported');

    const affordableTradeChoice = getRunEventRoomChoices('supplyCache').find(choice => choice.key === 'fieldTonic');
    assert.equal(
        getRunEventRoomChoiceAffordabilityLabel(affordableTradeChoice, { gold: 60 }),
        '可负担',
        'affordability helper should mark gold routes as affordable when the player has enough gold'
    );
    assert.equal(
        getRunEventRoomChoiceAffordabilityLabel(affordableTradeChoice, { gold: 20 }),
        '金币不足',
        'affordability helper should mark gold routes as blocked when the player lacks gold'
    );

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    assert.equal(
        getRunEventRoomChoiceAffordabilityLabel(healingChoice, { gold: 20 }),
        '',
        'affordability helper should stay silent for non-gold routes'
    );
}

function testRunEventRoomHudSummary() {
    assert.equal(typeof buildRunEventRoomHudSummary, 'function', 'event room HUD summary helper should be exported');
    assert.equal(typeof buildRunEventRoomHudLines, 'function', 'event room HUD line builder should be exported');
    assert.equal(typeof formatRunEventEncounterPayoffTimingLabel, 'function', 'event room resolved timing helper should be exported');

    const unknownTypePool = [
        {
            key: 'mysteryArchive',
            name: '谜藏书库',
            description: '未来扩展或未知房型的回退夹具',
            type: 'mystery',
            choices: [
                {
                    key: 'sealedIndex',
                    label: '封印索引',
                    description: '金币 +88',
                    effect: {
                        type: 'grantGold'
                    }
                }
            ]
        }
    ];

    const unresolvedSummary = buildRunEventRoomHudSummary({
        key: 'supplyCache',
        discovered: true,
        resolved: false
    });
    assert.equal(unresolvedSummary.metaLabel, '交易 · 已发现', 'HUD summary should compress the type/state metadata');
    assert.deepEqual(
        unresolvedSummary.routeLines,
        [
            '战地净化包 [补给/净化]: 金币-45, 净化药剂x1 · 下间缓冲 · 稳场兑现',
            '狂战补给 [补给/爆发]: 金币-60, 狂战油x1 · 下间高压 · 首拍兑现'
        ],
        'HUD summary should split unresolved routes into one compact line per choice while exposing both routed encounter identity and payoff timing'
    );

    const resolvedSummary = buildRunEventRoomHudSummary({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'tempoPrayer',
        selectedChoiceLabel: '迅击祷言',
        resolutionText: '特攻冷却 -22%'
    });
    assert.equal(resolvedSummary.metaLabel, '祝福 · 已触发', 'HUD summary should keep the compressed blessing metadata');
    assert.deepEqual(
        resolvedSummary.routeLines,
        ['效果: 迅击祷言 · 下间高压 · 首拍兑现'],
        'resolved blessing summary should keep the chosen-route prefix while surfacing the next-room pacing profile and its payoff timing'
    );
    assert.equal(
        resolvedSummary.resolutionText,
        '特攻冷却-22%',
        'resolved blessing summary should compress cooldown settlements into compact effect text'
    );
    const resolvedRiskBuffSummary = buildRunEventRoomHudSummary({
        key: 'bloodContract',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'crimsonEdge',
        selectedChoiceLabel: '猩红锋契',
        resolutionText: '本局伤害 +35%，承伤 +18%'
    });
    assert.equal(
        resolvedRiskBuffSummary.resolutionText,
        '伤害+35%, 承伤+18%',
        'resolved risk-buff summary should compress offensive-risk settlements into compact delta text'
    );
    assert.deepEqual(
        resolvedRiskBuffSummary.routeLines,
        ['效果: 猩红锋契 · 下间高压 · 首拍兑现'],
        'resolved risk-buff summary should keep the shared effect prefix while surfacing the next-room pacing profile and its payoff timing'
    );
    const resolvedTradeSummary = buildRunEventRoomHudSummary({
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
        resolutionText: '失去 30 生命，获得 120 金币'
    });
    assert.equal(
        resolvedTradeSummary.resolutionText,
        '生命-30, 金币+120',
        'resolved trade summary should compress hp-for-gold settlements into compact delta text'
    );
    assert.deepEqual(
        resolvedTradeSummary.routeLines,
        ['交易: 豪赌 · 下间淘金 · 追赏兑现'],
        'resolved trade summary should keep the trade-specific chosen-route prefix while surfacing the next-room pacing profile and its payoff timing'
    );

    const resolvedSupplySummary = buildRunEventRoomHudSummary({
        key: 'supplyCache',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'fieldTonic',
        selectedChoiceLabel: '战地净化包',
        resolutionText: '支付 45 金币，获得 净化药剂 x1'
    });
    assert.equal(
        resolvedSupplySummary.resolutionText,
        '金币-45, 净化药剂x1',
        'resolved supply summary should compress purchase settlements into compact delta text'
    );

    const resolvedHealingSummary = buildRunEventRoomHudSummary({
        key: 'healingFountain',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'purifyingSip',
        selectedChoiceLabel: '净泉啜饮',
        selectedChoiceRecommendationReason: '可净化2层',
        resolutionText: '恢复 36 生命，并净化负面状态'
    });
    assert.deepEqual(
        resolvedHealingSummary.routeLines,
        ['治疗: 净泉啜饮 · 可净化2层 · 下间缓冲 · 稳场兑现'],
        'resolved healing summary should keep the healing-specific chosen-route prefix while carrying the persisted recommendation receipt ahead of the next-room pacing profile and payoff timing'
    );
    assert.equal(
        resolvedHealingSummary.resolutionText,
        '生命+36, 净化',
        'resolved healing summary should compress restore-and-cleanse settlements into compact delta text'
    );

    const resolvedHealingDoubleFallbackSummary = buildRunEventRoomHudSummary({
        key: 'healingFountain',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'purifyingSip',
        selectedChoiceLabel: '',
        resolutionText: ''
    });
    assert.deepEqual(
        resolvedHealingDoubleFallbackSummary.routeLines,
        ['治疗: 未知选项 · 下间缓冲 · 稳场兑现'],
        'resolved healing summary should keep the healing prefix, unknown-option fallback, next-room pacing profile, and payoff timing when the choice key is still known'
    );
    assert.equal(
        resolvedHealingDoubleFallbackSummary.resolutionText,
        '结算待同步',
        'resolved healing summary should keep the stable settlement placeholder when both stored fragments are missing'
    );

    const resolvedBlessingMissingLabelSummary = buildRunEventRoomHudSummary({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredPrayer',
        selectedChoiceLabel: '',
        resolutionText: '特攻冷却 -22%'
    });
    assert.deepEqual(
        resolvedBlessingMissingLabelSummary.routeLines,
        ['效果: 未知选项'],
        'resolved blessing summary should keep the effect prefix even when the stored option label is missing'
    );
    assert.equal(
        resolvedBlessingMissingLabelSummary.resolutionText,
        '特攻冷却-22%',
        'resolved blessing summary should still compact the stored settlement text when the chosen label is missing'
    );

    const resolvedTradeMissingSettlementSummary = buildRunEventRoomHudSummary({
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
        resolutionText: ''
    });
    assert.deepEqual(
        resolvedTradeMissingSettlementSummary.routeLines,
        ['交易: 豪赌 · 下间淘金 · 追赏兑现'],
        'resolved trade summary should keep the trade prefix, next-room pacing profile, and payoff timing when settlement text is missing'
    );
    assert.equal(
        resolvedTradeMissingSettlementSummary.resolutionText,
        '结算待同步',
        'resolved trade summary should fall back to a stable settlement placeholder when settlement text is missing'
    );

    const resolvedUnknownSummary = buildRunEventRoomHudSummary({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        selectedChoiceRecommendationReason: '旧档理由',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownSummary.routeLines,
        ['已选: 封印索引 · 旧档理由'],
        'resolved unknown-type summary should fall back to the persisted chosen label and carry the compact recommendation receipt with the generic 已选 prefix'
    );
    assert.equal(
        resolvedUnknownSummary.resolutionText,
        '金币+88',
        'resolved unknown-type summary should still compact the stored settlement text'
    );

    const resolvedUnknownMissingSettlementSummary = buildRunEventRoomHudSummary({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        resolutionText: ''
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownMissingSettlementSummary.routeLines,
        ['已选: 封印索引'],
        'resolved unknown-type summary should keep the generic chosen-route prefix even when settlement text is missing'
    );
    assert.equal(
        resolvedUnknownMissingSettlementSummary.resolutionText,
        '结算待同步',
        'resolved unknown-type summary should fall back to a stable settlement placeholder when stored settlement text is missing'
    );

    const resolvedUnknownMissingLabelSummary = buildRunEventRoomHudSummary({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownMissingLabelSummary.routeLines,
        ['已选: 未知选项'],
        'resolved unknown-type summary should fall back to a stable generic chosen label when the stored option label is missing'
    );
    assert.equal(
        resolvedUnknownMissingLabelSummary.resolutionText,
        '金币+88',
        'resolved unknown-type summary should still compact the stored settlement text when the chosen label is missing'
    );

    const resolvedUnknownDoubleFallbackSummary = buildRunEventRoomHudSummary({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: ''
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownDoubleFallbackSummary.routeLines,
        ['已选: 未知选项'],
        'resolved unknown-type summary should keep a stable generic chosen label when both stored fragments are missing'
    );
    assert.equal(
        resolvedUnknownDoubleFallbackSummary.resolutionText,
        '结算待同步',
        'resolved unknown-type summary should keep a stable settlement placeholder when both stored fragments are missing'
    );
    assert.equal(
        formatRunEventEncounterPayoffTimingLabel(
            getRunEventEncounterProfile({
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'tempoPrayer',
                selectedChoiceLabel: '迅击祷言',
                resolutionText: '特攻冷却 -22%'
            }),
            {
                key: 'prayerShrine',
                discovered: true,
                resolved: true,
                selectedChoiceKey: 'tempoPrayer',
                selectedChoiceLabel: '迅击祷言',
                resolutionText: '特攻冷却 -22%'
            }
        ),
        '首拍兑现',
        'resolved timing helper should describe pressure routes as engage-first payoffs after selection'
    );
}

function testRunEventRoomHudLines() {
    const unknownTypePool = [
        {
            key: 'mysteryArchive',
            name: '谜藏书库',
            description: '未来扩展或未知房型的回退夹具',
            type: 'mystery',
            choices: [
                {
                    key: 'sealedIndex',
                    label: '封印索引',
                    description: '金币 +88',
                    effect: {
                        type: 'grantGold'
                    }
                }
            ]
        }
    ];

    const unresolvedLines = buildRunEventRoomHudLines({
        key: 'supplyCache',
        discovered: true,
        resolved: false
    });
    assert.deepEqual(
        unresolvedLines,
        [
            '事件房: 战备商柜',
            '交易 · 已发现',
            '战地净化包 [补给/净化]: 金币-45, 净化药剂x1 · 下间缓冲 · 稳场兑现',
            '狂战补给 [补给/爆发]: 金币-60, 狂战油x1 · 下间高压 · 首拍兑现'
        ],
        'unresolved event rooms should keep one line per available route while surfacing tactical intent, routed encounter identity, and payoff timing'
    );

    const resolvedLines = buildRunEventRoomHudLines({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'tempoPrayer',
        selectedChoiceLabel: '迅击祷言',
        resolutionText: '特攻冷却 -22%'
    });
    assert.deepEqual(
        resolvedLines,
        [
            '事件房: 祈愿圣坛',
            '祝福 · 已触发',
            '效果: 迅击祷言 · 下间高压 · 首拍兑现 · 特攻冷却-22%'
        ],
        'resolved blessing event rooms should merge the chosen route, next-room pacing profile, payoff timing, and compact settlement into one line'
    );

    const resolvedTradeLines = buildRunEventRoomHudLines({
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
        resolutionText: '失去 30 生命，获得 120 金币'
    });
    assert.deepEqual(
        resolvedTradeLines,
        [
            '事件房: 赌徒圣坛',
            '交易 · 已触发',
            '交易: 豪赌 · 下间淘金 · 追赏兑现 · 生命-30, 金币+120'
        ],
        'resolved trade event rooms should merge the chosen label, next-room pacing profile, payoff timing, and actual settlement delta'
    );

    const resolvedTradeMissingSettlementLines = buildRunEventRoomHudLines({
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
        resolutionText: ''
    });
    assert.deepEqual(
        resolvedTradeMissingSettlementLines,
        [
            '事件房: 赌徒圣坛',
            '交易 · 已触发',
            '交易: 豪赌 · 下间淘金 · 追赏兑现 · 结算待同步'
        ],
        'resolved trade event rooms should keep a stable merged fallback line when settlement text is missing but payoff timing is known'
    );

    const resolvedHealingLines = buildRunEventRoomHudLines({
        key: 'healingFountain',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'purifyingSip',
        selectedChoiceLabel: '净泉啜饮',
        selectedChoiceRecommendationReason: '可净化2层',
        resolutionText: '恢复 36 生命，并净化负面状态'
    });
    assert.deepEqual(
        resolvedHealingLines,
        [
            '事件房: 疗愈泉眼',
            '治疗 · 已触发',
            '治疗: 净泉啜饮 · 可净化2层 · 下间缓冲 · 稳场兑现 · 生命+36, 净化'
        ],
        'resolved healing event rooms should merge the chosen label, persisted recommendation receipt, next-room pacing profile, payoff timing, and actual settlement delta'
    );

    const resolvedHealingDoubleFallbackLines = buildRunEventRoomHudLines({
        key: 'healingFountain',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'purifyingSip',
        selectedChoiceLabel: '',
        resolutionText: ''
    });
    assert.deepEqual(
        resolvedHealingDoubleFallbackLines,
        [
            '事件房: 疗愈泉眼',
            '治疗 · 已触发',
            '治疗: 未知选项 · 下间缓冲 · 稳场兑现 · 结算待同步'
        ],
        'resolved healing event rooms should keep a stable merged fallback line when both stored fragments are missing but the chosen route and payoff timing remain known'
    );

    const resolvedUnknownLines = buildRunEventRoomHudLines({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        selectedChoiceRecommendationReason: '旧档理由',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownLines,
        [
            '事件房: 谜藏书库',
            '未知 · 已触发',
            '已选: 封印索引 · 旧档理由 · 金币+88'
        ],
        'resolved unknown-type event rooms should keep the generic 已选 prefix, carry the persisted recommendation receipt, and merge the compact settlement text'
    );

    const resolvedUnknownMissingSettlementLines = buildRunEventRoomHudLines({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        resolutionText: ''
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownMissingSettlementLines,
        [
            '事件房: 谜藏书库',
            '未知 · 已触发',
            '已选: 封印索引 · 结算待同步'
        ],
        'resolved unknown-type event rooms should keep a stable merged fallback line when settlement text is missing'
    );

    const resolvedUnknownMissingLabelLines = buildRunEventRoomHudLines({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownMissingLabelLines,
        [
            '事件房: 谜藏书库',
            '未知 · 已触发',
            '已选: 未知选项 · 金币+88'
        ],
        'resolved unknown-type event rooms should keep a stable merged fallback line when the stored option label is missing'
    );

    const resolvedUnknownDoubleFallbackLines = buildRunEventRoomHudLines({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: ''
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownDoubleFallbackLines,
        [
            '事件房: 谜藏书库',
            '未知 · 已触发',
            '已选: 未知选项 · 结算待同步'
        ],
        'resolved unknown-type event rooms should keep a stable merged fallback line when both stored fragments are missing'
    );
}

function testRunEventRoomWorldLabel() {
    const unknownTypePool = [
        {
            key: 'mysteryArchive',
            name: '谜藏书库',
            description: '未来扩展或未知房型的回退夹具',
            type: 'mystery',
            choices: [
                {
                    key: 'sealedIndex',
                    label: '封印索引',
                    description: '金币 +88',
                    effect: {
                        type: 'grantGold'
                    }
                }
            ]
        }
    ];
    assert.equal(typeof buildRunEventRoomWorldLabel, 'function', 'event room world-label helper should be exported');
    assert.equal(typeof buildRunEventRoomWorldLabelRouteLine, 'function', 'event room world-label route-line helper should be exported');
    assert.equal(
        buildRunEventRoomWorldLabel(
            { key: 'prayerShrine', discovered: true, resolved: false },
            RUN_EVENT_ROOM_POOL,
            { label: '色欲 幻梦花园', bossKey: 'lust' }
        ),
        '祈愿圣坛 · 稳拍反制',
        'unresolved altar labels should carry the current boss posture into the first shrine approach when a boss-aware target exists'
    );

    const resolvedBlessingLabel = buildRunEventRoomWorldLabel({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'tempoPrayer',
        selectedChoiceLabel: '迅击祷言',
        selectedChoiceRecommendationReason: '当前持远程',
        resolutionText: '特攻冷却 -22%'
    });
    assert.equal(
        resolvedBlessingLabel,
        '祈愿圣坛 · 效果: 迅击祷言 · 当前持远程 · 首拍兑现',
        'resolved altar labels should append the compact chosen-route summary, persisted recommendation receipt, and payoff timing for known room types'
    );

    const resolvedBlessingMissingLabel = buildRunEventRoomWorldLabel({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredPrayer',
        selectedChoiceLabel: '',
        resolutionText: '特攻冷却 -22%'
    });
    assert.equal(
        resolvedBlessingMissingLabel,
        '祈愿圣坛 · 效果: 未知选项',
        'resolved altar labels should keep the type prefix and unknown-option fallback when the stored route label is missing'
    );

    const resolvedUnknownRouteLine = buildRunEventRoomWorldLabelRouteLine({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        selectedChoiceRecommendationReason: '旧档理由',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownRouteLine,
        '已选: 封印索引 · 旧档理由',
        'resolved unknown-type altar labels should keep the generic 已选 prefix and persisted recommendation receipt when the persisted route label exists'
    );

    const resolvedUnknownMissingLabelRouteLine = buildRunEventRoomWorldLabelRouteLine({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownMissingLabelRouteLine,
        '已选: 未知选项',
        'resolved unknown-type altar labels should keep the generic 已选 prefix when the persisted route label is missing'
    );

    const resolvedUnknownLabel = buildRunEventRoomWorldLabel({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        selectedChoiceRecommendationReason: '旧档理由',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownLabel,
        '谜藏书库 · 已选: 封印索引 · 旧档理由',
        'resolved unknown-type altar labels should append the persisted route label and recommendation receipt with the generic 已选 prefix'
    );

    const resolvedUnknownMissingLabel = buildRunEventRoomWorldLabel({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownMissingLabel,
        '谜藏书库 · 已选: 未知选项',
        'resolved unknown-type altar labels should keep the generic 已选 prefix and unknown-option fallback when the persisted route label is missing'
    );

    const retiredUnknownRouteLine = buildRunEventRoomWorldLabelRouteLine({
        key: 'retiredMysteryArchive',
        name: '谜藏书库',
        type: 'mystery',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        retiredUnknownRouteLine,
        '',
        'resolved unknown-type altar labels should expose no route line when the saved room definition no longer exists in the current pool'
    );

    const retiredUnknownLabel = buildRunEventRoomWorldLabel({
        key: 'retiredMysteryArchive',
        name: '谜藏书库',
        type: 'mystery',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        retiredUnknownLabel,
        '谜藏书库 · 已结算',
        'resolved unknown-type altar labels should fall back to 已结算 when the saved room definition no longer exists in the current pool'
    );
}

function testRunEventRoomPromptLabel() {
    const unknownTypePool = [
        {
            key: 'mysteryArchive',
            name: '谜藏书库',
            description: '未来扩展或未知房型的回退夹具',
            type: 'mystery',
            choices: [
                {
                    key: 'sealedIndex',
                    label: '封印索引',
                    description: '金币 +88',
                    effect: {
                        type: 'grantGold'
                    }
                }
            ]
        }
    ];

    assert.equal(typeof buildRunEventRoomPromptLabel, 'function', 'event room prompt-label helper should be exported');
    assert.equal(
        buildRunEventRoomPromptLabel(
            { key: 'prayerShrine', discovered: true, resolved: false },
            RUN_EVENT_ROOM_POOL,
            { label: '色欲 幻梦花园', bossKey: 'lust' }
        ),
        '按F祈愿 · 稳拍反制',
        'unresolved shrine prompts should append the compact boss-posture reminder before the first route decision'
    );
    assert.equal(
        buildRunEventRoomPromptLabel({ key: 'gamblersShrine', discovered: true, resolved: false }),
        '按F交易',
        'trade event rooms should show the trade short tag in the shrine prompt'
    );
    assert.equal(
        buildRunEventRoomPromptLabel({ key: 'healingFountain', discovered: true, resolved: false }),
        '按F治疗',
        'healing event rooms should show the healing short tag in the shrine prompt'
    );
    assert.equal(
        buildRunEventRoomPromptLabel({ key: 'prayerShrine', discovered: true, resolved: false }),
        '按F祈愿',
        'prayer shrines should use a lighter祈愿 tag in the shrine prompt'
    );
    assert.equal(
        buildRunEventRoomPromptLabel({ key: 'bloodContract', discovered: true, resolved: false }),
        '按F效果',
        'risk buff event rooms should share the effect short tag in the shrine prompt'
    );
    assert.equal(
        buildRunEventRoomPromptLabel({ key: 'mysteryArchive', discovered: true, resolved: false }, unknownTypePool),
        '按F抉择',
        'unknown or future event rooms should keep the generic prompt fallback'
    );
}

function testRunEventEncounterRoutingHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\._runEventBossTarget = \{\s*label:\s*`\$\{boss\.sin\} \$\{boss\.area\}`,\s*bossKey\s*\};/,
        'LevelScene should cache the current boss target once so shrine prompts and world labels can reuse the same posture framing'
    );
    assert.match(
        source,
        /buildRunEventRoomPromptLabel\(eventRoom,\s*RUN_EVENT_ROOM_POOL,\s*this\._runEventBossTarget\)/,
        'LevelScene should pass the current boss target into the shared shrine prompt-label helper'
    );
    assert.match(
        source,
        /buildRunEventRoomWorldLabel\(eventRoom,\s*RUN_EVENT_ROOM_POOL,\s*this\._runEventBossTarget\)/,
        'LevelScene should pass the current boss target into the shared shrine world-label helper'
    );
    assert.match(
        source,
        /_buildRunEventChoicePreviewState\(\)\s*{[\s\S]*?selectedWeaponKey:\s*this\.player\.currentWeaponKey,[\s\S]*?bossKey:\s*this\.bossKey,[\s\S]*?negativeStatuses:\s*Object\.keys\(this\.player\.activeStatusEffects \|\| \{\}\),[\s\S]*?runModifiers:\s*\(GameState\.runModifiers \|\| \[\]\)\.map\(key => getRunModifierByKey\(key\)\),[\s\S]*?attackCooldownMs:\s*this\.player\.attackCooldown,[\s\S]*?specialCooldownMs:\s*this\.player\.specialCooldown,[\s\S]*?dodgeCooldownMs:\s*this\.player\.dodgeCooldownTimer,[\s\S]*?stamina:\s*this\.player\.stamina,[\s\S]*?staminaRegenPerSecond,[\s\S]*?dodgeStaminaCost:\s*Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* \(runEffects\.playerDodgeStaminaCostMultiplier \|\| 1\)\)\)/,
        'run-event preview-state builder should pass boss target, route state, and live combat context into shared recommendation helpers'
    );
    assert.match(
        source,
        /_openRunEventChoicePanel\(\)\s*{[\s\S]*?const previewState = this\._buildRunEventChoicePreviewState\(\);[\s\S]*?const encounterPreview = formatRunEventRoomChoiceEncounterPreview\(choice\);[\s\S]*?const encounterTiming = formatRunEventRoomChoiceEncounterTiming\(choice,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?textNode\.setText\(`\$\{index \+ 1\}\. \$\{previewText\}\$\{encounterPreview \? ` · \$\{encounterPreview\}` : ''\}\$\{encounterTiming \? ` · \$\{encounterTiming\}` : ''\}\$\{affordabilityLabel \? ` · \$\{affordabilityLabel\}` : ''\}`\);/,
        'run-event choice panel should pass the full route context and append both the next-room encounter preview tag and the shared payoff-timing label'
    );
    assert.match(
        source,
        /_openRunEventChoicePanel\(\)\s*{[\s\S]*?const previewState = this\._buildRunEventChoicePreviewState\(\);[\s\S]*?const recommendation = buildRunEventRoomChoiceRecommendation\(this\._runEventChoiceOptions,\s*previewState\);[\s\S]*?this\._setRunEventChoicePanelFooter\(recommendation \|\| RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT,\s*'default'\);/,
        'run-event choice panel should route the shared preview state into a contextual recommendation helper and only replace the neutral footer when that helper returns a message'
    );
    assert.match(
        source,
        /_handleRunEventChoiceHotkey\(choiceIndex\)\s*{[\s\S]*?const settlementState = this\._buildRunEventChoicePreviewState\(\);[\s\S]*?settlementState\.gold = startGold;[\s\S]*?const settlement = resolveRunEventRoomChoice\(settlementState,\s*GameState\.runEventRoom,\s*choice\.key,\s*RUN_EVENT_ROOM_POOL\);/,
        'run-event choice resolution should pass the same recommendation-relevant preview state so the selected route can persist a post-choice recommendation receipt'
    );
    assert.match(
        source,
        /_showRunEventSettlementFeedback\(settlement,\s*startGold,\s*startHp,\s*encounterProfile\)\s*{[\s\S]*?const recommendationReason = typeof settlement\.eventRoom\.selectedChoiceRecommendationReason === 'string'[\s\S]*?selectedChoiceRecommendationReason\.trim\(\)[\s\S]*?if \(recommendationReason\) \{[\s\S]*?lines\.push\(\{\s*text:\s*recommendationReason,/,
        'settlement floating feedback should surface the persisted compact recommendation receipt when one was stored during event-room resolution'
    );
    assert.match(
        source,
        /_spawnRoom3EnemyFromFormationSlot\(slot\)\s*{[\s\S]*?const engageDelayMs = Math\.max\(0,\s*Number\(safeSlot\.engageDelayMs\) \|\| 0\);[\s\S]*?const goldDropMultiplier = Math\.max\(0\.2,\s*Number\(safeSlot\.goldDropMultiplier\) \|\| 1\);[\s\S]*?const bountyLabel = typeof safeSlot\.bountyLabel === 'string' \? safeSlot\.bountyLabel\.trim\(\) : '';\s*[\s\S]*?enemy\._runEventEncounterEngageAt = this\.time\.now \+ engageDelayMs;[\s\S]*?enemy\._runEventEncounterFormation = \{ laneRatio,\s*depthBand,\s*flankOffset,\s*engageDelayMs,\s*goldDropMultiplier,\s*bountyLabel \};[\s\S]*?enemy\._runEventEncounterBountyTag = bountyLabel \? this\.add\.text\(/,
        'LevelScene should stamp profile-driven reward metadata onto spawned room-3 enemies and create a bounty marker when the shared contract requests one'
    );
    assert.match(
        source,
        /_applyRunEventEncounterProfileToRoom3\(profile\)\s*{[\s\S]*?const enemyPool = \(typeof AREA_ENEMIES !== 'undefined' && AREA_ENEMIES\[this\.bossKey\]\)[\s\S]*?const rosterKeys = buildRunEventEncounterRoster\(profile,\s*enemyPool,\s*ENEMIES\);[\s\S]*?const formationSlots = buildRunEventEncounterFormationSlots\(profile,\s*rosterKeys\);[\s\S]*?this\._rebuildRoom3EnemiesFromFormationSlots\(formationSlots\);[\s\S]*?enemy\._runEventEncounterBase = \{[\s\S]*?maxHp:\s*enemy\.maxHp,[\s\S]*?speed:\s*enemy\.speed,[\s\S]*?drops:\s*this\._cloneEnemyDrops\(enemy\.drops\)[\s\S]*?\};[\s\S]*?const slotGoldScale = Math\.max\(0\.2,\s*Number\(enemy\._runEventEncounterFormation && enemy\._runEventEncounterFormation\.goldDropMultiplier\) \|\| 1\);[\s\S]*?enemy\.maxHp = Math\.max\(1,\s*Math\.round\(baseStats\.maxHp \* hpScale\)\);[\s\S]*?enemy\.speed = Math\.max\(20,\s*Math\.round\(baseStats\.speed \* speedScale\)\);[\s\S]*?enemy\.drops = this\._scaleEnemyDropGold\(baseStats\.drops,\s*goldScale \* slotGoldScale\);/,
        'LevelScene should still rebuild room 3 from encounter-profile formation slots before retuning HP, speed, and per-target gold drops'
    );
    assert.match(
        source,
        /takeDamage\(amount,\s*options\)\s*{[\s\S]*?if \(this\.drops\.gold != null\) {[\s\S]*?drops\.gold = Math\.round\([\s\S]*?\);[\s\S]*?}\s*const runEventEncounterPayoff = buildRunEventEncounterPayoffPresentation\(this\._runEventEncounterFormation,\s*drops\.gold\);\s*if \(runEventEncounterPayoff\) {\s*drops\.runEventEncounterPayoff = runEventEncounterPayoff;\s*}/,
        'Enemy death should attach shared encounter-payoff presentation data onto the drop payload once the routed gold amount is known'
    );
    assert.match(
        source,
        /_spawnDropPickups\(x,\s*y,\s*drops\)\s*{[\s\S]*?const runEventEncounterPayoff = drops && typeof drops\.runEventEncounterPayoff === 'object'\s*\?\s*drops\.runEventEncounterPayoff\s*:\s*null;[\s\S]*?if \(runEventEncounterPayoff && runEventEncounterPayoff\.receiptLabel\) {[\s\S]*?showHitImpactPulse\(this,\s*x,\s*y,\s*runEventEncounterPayoff\.pulseColor,\s*16\);[\s\S]*?showFloatingCombatText\(this,\s*x,\s*y - 54,\s*runEventEncounterPayoff\.receiptLabel,\s*runEventEncounterPayoff\.receiptColor,\s*680\);[\s\S]*?}\s*if \(drops\.gold && drops\.gold > 0\) {[\s\S]*?color:\s*runEventEncounterPayoff && runEventEncounterPayoff\.pickupTint \? runEventEncounterPayoff\.pickupTint : 0xFFD700,[\s\S]*?scale:\s*runEventEncounterPayoff && runEventEncounterPayoff\.pickupScale \? runEventEncounterPayoff\.pickupScale : 1\.1,/,
        'LevelScene should consume shared encounter-payoff presentation data to show a bounty receipt and brighten the spawned gold pickup'
    );
    assert.match(
        source,
        /update\(time,\s*delta,\s*playerSprite\)\s*{[\s\S]*?const engageAt = Number\(this\._runEventEncounterEngageAt\) \|\| 0;[\s\S]*?if \(engageAt > 0 && time < engageAt\) {[\s\S]*?this\.state = 'patrol';[\s\S]*?this\.setVelocity\(0,\s*0\);[\s\S]*?return false;[\s\S]*?}/,
        'Enemy update should keep delayed room-3 enemies passive until their routed engage timestamp elapses'
    );
    assert.match(
        source,
        /GameState\.runEventRoom = settlement\.eventRoom;[\s\S]*?GameState\.refreshRunEffects\(\);[\s\S]*?const encounterProfile = this\._syncRunEventEncounterProfile\(\);[\s\S]*?this\._showRunEventSettlementFeedback\(settlement,\s*startGold,\s*startHp,\s*encounterProfile\);/,
        'run-event settlement should immediately apply the chosen encounter profile and expose it in the settlement feedback'
    );
    assert.match(
        source,
        /_maybeAnnounceRunEventEncounterProfile\(\)\s*{[\s\S]*?const profile = getRunEventEncounterProfile\(GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?const encounterEntryPreview = buildRunEventEncounterEntryPreview\(profile,\s*GameState\.runEventRoom\);[\s\S]*?if \(!encounterEntryPreview\) return;[\s\S]*?this\._showFloatingText\([\s\S]*?encounterEntryPreview/,
        'LevelScene should announce the shared next-room tactical cue on first entry into room 3 and let it consume the persisted event-room recommendation context'
    );
    assert.match(
        source,
        /_syncRunEventEncounterProfile\(\)\s*{[\s\S]*?this\._runEventEncounterProfileClearRecapKey = '';\s*this\._runEventEncounterSourceCueShown = \{\s*engage:\s*false,\s*stabilize:\s*false,\s*bounty:\s*false\s*\};\s*this\._runEventEncounterProfileKey = profile\.key;/,
        'applying a routed encounter profile should reset the one-shot source-cue moments before the new room-3 contract starts'
    );
    assert.match(
        source,
        /_maybeShowRunEventEncounterSourceCue\(moment,\s*x,\s*y\)\s*{[\s\S]*?if \(!safeMoment \|\| this\._runEventEncounterSourceCueShown\[safeMoment\]\) return;[\s\S]*?const profile = getRunEventEncounterProfile\(GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?const cue = buildRunEventEncounterSourceCue\(profile,\s*GameState\.runEventRoom,\s*safeMoment,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?if \(!cue\) return;[\s\S]*?this\._runEventEncounterSourceCueShown\[safeMoment\] = true;[\s\S]*?this\._showFloatingText\(x,\s*y,\s*cue,/,
        'LevelScene should route room-3 combat moments through the shared source-cue helper and enforce one-shot delivery per moment'
    );
    assert.match(
        source,
        /if \(runEventEncounterPayoff && runEventEncounterPayoff\.receiptLabel\) {[\s\S]*?showFloatingCombatText\(this,\s*x,\s*y - 54,\s*runEventEncounterPayoff\.receiptLabel,\s*runEventEncounterPayoff\.receiptColor,\s*680\);[\s\S]*?this\._maybeShowRunEventEncounterSourceCue\('bounty',\s*x,\s*y - 76\);[\s\S]*?}/,
        'windfall bounty payoff should piggyback on the existing routed gold receipt to show the shared source cue once'
    );
    assert.match(
        source,
        /if \(drops\) {[\s\S]*?this\._spawnDropPickups\(enemy\.x,\s*enemy\.y,\s*drops\);[\s\S]*?const remainingRoom3Enemies = this\.room3Enemies\.filter\(candidate => candidate && candidate\.isAlive\);[\s\S]*?if \(this\.room3Enemies\.includes\(enemy\) && this\._runEventEncounterProfileKey === 'breather' && remainingRoom3Enemies\.length > 0\) {[\s\S]*?this\._maybeShowRunEventEncounterSourceCue\('stabilize',\s*enemy\.x,\s*enemy\.y - 72\);[\s\S]*?}/,
        'breather routing should show the shared source cue on the first stabilize beat after a room-3 kill leaves the routed room still active'
    );
    assert.match(
        source,
        /if \(attacking\) {[\s\S]*?if \(this\.room3Enemies\.includes\(enemy\) && this\._runEventEncounterProfileKey === 'pressure'\) {[\s\S]*?this\._maybeShowRunEventEncounterSourceCue\('engage',\s*this\.player\.x,\s*this\.player\.y - 96\);[\s\S]*?}[\s\S]*?const d = Phaser\.Math\.Distance\.Between\(enemy\.x,\s*enemy\.y,\s*this\.player\.x,\s*this\.player\.y\);/,
        'pressure routing should show the shared source cue on the first room-3 pressure-contact beat before applying the attack hit'
    );
    assert.match(
        source,
        /_maybeShowRunEventEncounterClearRecap\(\)\s*{[\s\S]*?const room3AllDead = this\.room3Enemies\.every\(e => !e\.isAlive\);[\s\S]*?if \(!room3AllDead \|\| this\._runEventEncounterProfileClearRecapKey === this\._runEventEncounterProfileKey\) return;[\s\S]*?const profile = getRunEventEncounterProfile\(GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?const encounterClearRecap = buildRunEventEncounterClearRecap\(profile,\s*GameState\.runEventRoom\);[\s\S]*?if \(!encounterClearRecap\) return;[\s\S]*?this\._runEventEncounterProfileClearRecapKey = this\._runEventEncounterProfileKey;[\s\S]*?this\._showFloatingText\([\s\S]*?encounterClearRecap/,
        'LevelScene should derive a one-shot shared clear recap once room 3 is fully cleared and let it consume the persisted event-room recommendation context'
    );
    assert.match(
        source,
        /this\._maybeShowRunEventEncounterClearRecap\(\);[\s\S]*?const room3AllDead = this\.room3Enemies\.every\(e => !e\.isAlive\);[\s\S]*?if \(room3AllDead\) this\.bossDoor\.setAlpha\(1\);/,
        'LevelScene update should trigger the shared clear recap before promoting the Boss door to the cleared state'
    );
    assert.match(
        source,
        /_refreshBossDoorLabel\(\)\s*{[\s\S]*?const room3AllDead = this\.room3Enemies\.every\(e => !e\.isAlive\);[\s\S]*?const profile = getRunEventEncounterProfile\(GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\);[\s\S]*?const bossDoorRecap = room3AllDead \? buildRunEventEncounterBossDoorRecap\(profile,\s*GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\) : ''[\s\S]*?this\.bossDoorLabel\.setText\(bossDoorRecap \? `\$\{this\._bossDoorBaseLabel\}\\n\$\{bossDoorRecap\}` : this\._bossDoorBaseLabel\);/,
        'LevelScene should compose the Boss-door label from the shared run-arc recap only after room 3 is fully cleared'
    );
    assert.match(
        source,
        /this\._refreshBossDoorLabel\(\);[\s\S]*?if \(room3AllDead\) this\.bossDoor\.setAlpha\(1\);/,
        'LevelScene update should refresh the Boss-door run-arc label before promoting the door into its cleared state'
    );
    assert.match(
        source,
        /this\.scene\.start\('BossScene',\s*\{\s*bossKey:\s*this\.bossKey,\s*runEventEncounterProfile:\s*getRunEventEncounterProfile\(GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\)\s*\}\);/,
        'LevelScene should pass the routed encounter profile into BossScene when the cleared Boss door is entered'
    );
    assert.match(
        source,
        /this\._bossOpeningRouteEchoShown = false;[\s\S]*?this\._bossOpeningRouteEcho = buildRunEventEncounterBossOpeningEcho\(\s*data\.runEventEncounterProfile,\s*GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\s*\);/,
        'BossScene should resolve the shared boss-opening route echo from the scene payload at create time'
    );
    assert.match(
        source,
        /this\._bossOpeningRouteEcho = buildRunEventEncounterBossOpeningEcho\([\s\S]*?\);\s*this\._bossVictoryRouteRecap = buildRunEventEncounterBossVictoryRecap\(\s*data\.runEventEncounterProfile,\s*GameState\.runEventRoom,\s*RUN_EVENT_ROOM_POOL\s*\);/,
        'BossScene should also resolve the shared Boss-victory route recap from the same scene payload at create time'
    );
    assert.match(
        source,
        /if \(!this\._bossOpeningRouteEchoShown && this\._bossOpeningRouteEcho\) {[\s\S]*?this\._bossOpeningRouteEchoShown = true;[\s\S]*?showFloatingCombatText\(\s*this,\s*this\.player\.x,\s*this\.player\.y - 72,\s*this\._bossOpeningRouteEcho,/,
        'BossScene should show the shared boss-opening route echo once near fight start and stay silent when no route echo exists'
    );
    assert.match(
        source,
        /const lines = \['Victory!'\];[\s\S]*?if \(this\._bossVictoryRouteRecap\) {\s*lines\.push\(this\._bossVictoryRouteRecap\);\s*}/,
        'BossScene victory settlement should append the shared Boss-victory route recap to the existing reward lines when a routed segment exists'
    );
}

function testCraftingRecipeChecks() {
    assert.ok(CRAFTING_RECIPES.cleanseTonic, 'cleanse recipe should exist');
    assert.ok(CRAFTING_RECIPES.berserkerOil, 'berserker recipe should exist');
    assert.deepEqual(Object.keys(CRAFTING_RECIPES.cleanseTonic.materials).sort(), ['envyEssence', 'slothEssence'], 'cleanse recipe materials should stay deterministic');

    const craftableState = {
        gold: 120,
        inventory: {
            envyEssence: 3,
            slothEssence: 2
        }
    };
    const canCraft = canCraftRecipe(craftableState, 'cleanseTonic');
    assert.equal(canCraft.ok, true, 'craft should be allowed with enough resources');

    const crafted = applyCraftRecipe(craftableState, 'cleanseTonic');
    assert.equal(crafted.ok, true, 'craft should succeed');
    assert.equal(crafted.nextState.gold, 75, 'craft gold cost should be deducted');
    assert.equal(crafted.nextState.inventory.envyEssence, 2, 'envy essence should be consumed');
    assert.equal(crafted.nextState.inventory.slothEssence, 1, 'sloth essence should be consumed');
    assert.equal(crafted.nextState.inventory.cleanseTonic, 1, 'crafted item should be added');

    const craftedBatch = applyCraftRecipe(craftableState, 'cleanseTonic', { count: 99 });
    assert.equal(craftedBatch.ok, true, 'batch craft should succeed when at least one copy is affordable');
    assert.equal(craftedBatch.producedCount, 2, 'batch craft should clamp to the current max craftable count');
    assert.equal(craftedBatch.nextState.gold, 30, 'batch craft should deduct gold for every crafted copy');
    assert.equal(craftedBatch.nextState.inventory.envyEssence, 1, 'batch craft should consume shared materials for every crafted copy');
    assert.equal(craftedBatch.nextState.inventory.slothEssence, undefined, 'batch craft should remove depleted materials from inventory');
    assert.equal(craftedBatch.nextState.inventory.cleanseTonic, 2, 'batch craft should add the full crafted stack in one application');

    const noMaterial = canCraftRecipe({
        gold: 120,
        inventory: {
            envyEssence: 1
        }
    }, 'cleanseTonic');
    assert.equal(noMaterial.ok, false, 'craft should fail without complete materials');
    assert.equal(noMaterial.reason, 'material');
}

function testCraftRecipeAffordance() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeAffordance, 'function', 'craft recipe affordance helper should be exported');

    assert.deepEqual(
        buildCraftRecipeAffordance('cleanseTonic', {
            gold: 120,
            inventory: {
                envyEssence: 2,
                slothEssence: 2
            }
        }, ITEMS),
        {
            label: '可做x2',
            canCraft: true,
            maxCraftable: 2,
            blockedReason: null,
            missingItemKey: null
        },
        'craft affordance should expose batch potential from the tightest shared bottleneck'
    );

    assert.deepEqual(
        buildCraftRecipeAffordance('cleanseTonic', {
            gold: 30,
            inventory: {
                envyEssence: 3,
                slothEssence: 3
            }
        }, ITEMS),
        {
            label: '差15金',
            canCraft: false,
            maxCraftable: 0,
            blockedReason: 'gold',
            missingItemKey: null
        },
        'craft affordance should expose the exact gold shortfall before clicking'
    );

    assert.deepEqual(
        buildCraftRecipeAffordance('cleanseTonic', {
            gold: 120,
            inventory: {
                envyEssence: 1
            }
        }, ITEMS),
        {
            label: '差1个懒惰之精华',
            canCraft: false,
            maxCraftable: 0,
            blockedReason: 'material',
            missingItemKey: 'slothEssence'
        },
        'craft affordance should name the missing material before clicking'
    );
}

function testCraftRecipeQuickSlotPreview() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeQuickSlotPreview, 'function', 'craft recipe quick-slot preview helper should be exported');

    assert.deepEqual(
        buildCraftRecipeQuickSlotPreview('cleanseTonic', {
            quickSlots: [null, 'berserkerOil', null, null]
        }, ITEMS),
        {
            label: '入1',
            slotIndex: 0,
            didOverwrite: false,
            assignedItemKey: 'cleanseTonic',
            replacedItemKey: null,
            notice: '快捷栏1：+净化'
        },
        'craft quick-slot preview should expose the pre-click landing slot when an empty quick slot is available'
    );

    assert.deepEqual(
        buildCraftRecipeQuickSlotPreview('cleanseTonic', {
            quickSlots: ['berserkerOil', 'hpPotion', 'staminaPotion', 'cleanseTonic']
        }, ITEMS),
        {
            label: '覆盖1：狂战→净化',
            slotIndex: 0,
            didOverwrite: true,
            assignedItemKey: 'cleanseTonic',
            replacedItemKey: 'berserkerOil',
            notice: '快捷栏1：狂战→净化'
        },
        'craft quick-slot preview should expose the overwrite direction before clicking when the quick bar is full'
    );
}

function testCraftRecipeRowLabel() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeRowLabel, 'function', 'craft recipe row label helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);

    const dropOwnedTarget = '净化药剂 — 45金 + 1嫉妒之精华 + 1懒惰之精华 · 可做x2 · 入1';
    assert.equal(
        buildCraftRecipeRowLabel('cleanseTonic', {
            gold: 120,
            inventory: {
                envyEssence: 2,
                slothEssence: 2
            }
        }, ITEMS, {
            maxWidth: measureTextWidth(dropOwnedTarget),
            measureTextWidth
        }),
        dropOwnedTarget,
        'craft recipe row label should drop `拥有` before it sacrifices the shared affordance and quick-slot preview'
    );

    const compactMaterialsTarget = '净化药剂 — 45金 + 嫉妒x1 + 懒惰x1 · 可做x2 · 入1';
    assert.equal(
        buildCraftRecipeRowLabel('cleanseTonic', {
            gold: 120,
            inventory: {
                envyEssence: 2,
                slothEssence: 2
            }
        }, ITEMS, {
            maxWidth: measureTextWidth(compactMaterialsTarget),
            measureTextWidth
        }),
        compactMaterialsTarget,
        'craft recipe row label should compact long material names before it drops the pre-click status labels'
    );

    const affordanceOnlyTarget = '净化药剂 — 45金 + 嫉妒x1 + 懒惰x1 · 差15金';
    assert.equal(
        buildCraftRecipeRowLabel('cleanseTonic', {
            gold: 30,
            inventory: {
                envyEssence: 3,
                slothEssence: 3
            }
        }, ITEMS, {
            maxWidth: measureTextWidth(affordanceOnlyTarget),
            measureTextWidth
        }),
        affordanceOnlyTarget,
        'craft recipe row label should keep the craftability affordance before the quick-slot preview when width gets tighter again'
    );
}

function testCraftRecipeBatchReceipt() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeBatchReceipt, 'function', 'craft recipe batch receipt helper should be exported');

    const goldStopCraft = applyCraftRecipe({
        gold: 120,
        inventory: {
            envyEssence: 2,
            slothEssence: 2
        }
    }, 'cleanseTonic', { count: 99 });
    assert.equal(
        buildCraftRecipeBatchReceipt('cleanseTonic', goldStopCraft, ITEMS),
        '净化药剂x2 · 差15金',
        'craft batch receipt should report the produced stack and the gold stopper after a max batch'
    );

    const materialStopCraft = applyCraftRecipe({
        gold: 120,
        inventory: {
            envyEssence: 3,
            slothEssence: 1
        }
    }, 'cleanseTonic', { count: 99 });
    assert.equal(
        buildCraftRecipeBatchReceipt('cleanseTonic', materialStopCraft, ITEMS),
        '净化药剂x1 · 差1个懒惰之精华',
        'craft batch receipt should report the produced stack and the material stopper after a max batch'
    );
}

function testCraftRecipeSuccessMessage() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeSuccessMessage, 'function', 'craft recipe success message helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);
    const crafted = applyCraftRecipe({
        gold: 120,
        inventory: {
            envyEssence: 2,
            slothEssence: 2
        }
    }, 'cleanseTonic', { count: 99 });
    const autoAssign = buildQuickSlotAutoAssignResult(
        ['berserkerOil', 'hpPotion', 'staminaPotion', 'cleanseTonic'],
        crafted.producedItemKey,
        ITEMS
    );

    const fullTarget = '净化药剂x2 · 差15金 · 快捷栏1：狂战→净化';
    assert.equal(
        buildCraftRecipeSuccessMessage('cleanseTonic', crafted, autoAssign, ITEMS, {
            maxWidth: measureTextWidth(fullTarget),
            measureTextWidth
        }),
        fullTarget,
        'craft success message should keep the full quick-slot notice when the bottom lane is wide enough'
    );

    const compactTarget = '净化药剂x2 · 差15金 · 覆盖1：狂战→净化';
    assert.equal(
        buildCraftRecipeSuccessMessage('cleanseTonic', crafted, autoAssign, ITEMS, {
            maxWidth: measureTextWidth(compactTarget),
            measureTextWidth
        }),
        compactTarget,
        'craft success message should collapse the quick-slot suffix before it sacrifices the batch receipt'
    );

    const receiptOnlyTarget = '净化药剂x2 · 差15金';
    assert.equal(
        buildCraftRecipeSuccessMessage('cleanseTonic', crafted, autoAssign, ITEMS, {
            maxWidth: measureTextWidth(receiptOnlyTarget),
            measureTextWidth
        }),
        receiptOnlyTarget,
        'craft success message should keep the produced-count and stop-reason receipt when the lane gets tighter again'
    );
}

function testCraftRecipeFailureMessage() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildCraftRecipeFailureMessage, 'function', 'craft recipe failure message helper should be exported');

    const measureTextWidth = (text) => Array.from(typeof text === 'string' ? text : '').reduce((sum, glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return sum;
        return sum + (((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) ? 1 : 2);
    }, 0);

    const fullTarget = '材料不足: 懒惰之精华';
    assert.equal(
        buildCraftRecipeFailureMessage({
            reason: 'material',
            label: fullTarget,
            missingItemKey: 'slothEssence',
            requiredCount: 1,
            currentCount: 0
        }, ITEMS, {
            maxWidth: measureTextWidth(fullTarget),
            measureTextWidth
        }),
        fullTarget,
        'craft failure message should keep the full blocker detail when the bottom lane is wide enough'
    );

    const compactTarget = '材料不足: 懒惰';
    assert.equal(
        buildCraftRecipeFailureMessage({
            reason: 'material',
            label: fullTarget,
            missingItemKey: 'slothEssence',
            requiredCount: 1,
            currentCount: 0
        }, ITEMS, {
            maxWidth: measureTextWidth(compactTarget),
            measureTextWidth
        }),
        compactTarget,
        'craft failure message should compact the material detail before it sacrifices the blocker prefix'
    );

    const blockerOnlyTarget = '材料不足';
    assert.equal(
        buildCraftRecipeFailureMessage({
            reason: 'material',
            label: fullTarget,
            missingItemKey: 'slothEssence',
            requiredCount: 1,
            currentCount: 0
        }, ITEMS, {
            maxWidth: measureTextWidth(blockerOnlyTarget),
            measureTextWidth
        }),
        blockerOnlyTarget,
        'craft failure message should keep the blocker reason when width gets tighter again'
    );

    const genericTarget = '制作失败';
    assert.equal(
        buildCraftRecipeFailureMessage({
            reason: 'apply',
            label: '制作失败，请重试'
        }, ITEMS, {
            maxWidth: measureTextWidth(genericTarget),
            measureTextWidth
        }),
        genericTarget,
        'craft failure message should keep the failure reason before a retry suffix when width gets tighter'
    );
}

function testBlacksmithCraftingAffordanceHooks() {
    const source = loadGameSource();
    const coreSource = fs.readFileSync(path.join(repoRoot, 'shared/game-core.js'), 'utf8');
    assert.match(
        source,
        /_buildCraftLabel\(recipeKey\)\s*{[\s\S]*?return buildCraftRecipeRowLabel\(recipeKey,\s*GameState,\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._craftRecipeTextMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftRecipeRow'\)[\s\S]*?\}\);/,
        'BlacksmithScene should route craft-row copy through the shared width-aware recipe-row helper'
    );
    assert.match(
        coreSource,
        /function buildCraftRecipeRowLabel\(recipeKey,\s*state,\s*itemCatalog,\s*options\)\s*{[\s\S]*?const affordance = buildCraftRecipeAffordance\(recipeKey,\s*safeState,\s*safeItemCatalog\);[\s\S]*?const quickSlotPreview = buildCraftRecipeQuickSlotPreview\(recipeKey,\s*safeState,\s*safeItemCatalog,\s*\{[\s\S]*?measureLabelWidth:\s*measureTextWidth[\s\S]*?\}\);/,
        'shared craft recipe row helper should compose the existing affordability and quick-slot preview contracts'
    );
    assert.match(
        source,
        /_syncCraftButtonState\(row,\s*affordance\)\s*{[\s\S]*?canCraft[\s\S]*?disableInteractive\(\)[\s\S]*?setInteractive\(\{ useHandCursor: true \}\)/,
        'BlacksmithScene should toggle craft button interactivity from the shared crafting affordance contract'
    );
    assert.match(
        source,
        /const craftCount = Math\.max\(1,\s*affordance\.maxCraftable \|\| 1\);[\s\S]*?const crafted = applyCraftRecipe\(GameState,\s*recipeKey,\s*\{\s*count:\s*craftCount\s*\}\);/,
        'BlacksmithScene should redeem the shared max-craft affordance through the existing craft button path'
    );
    assert.match(
        source,
        /const affordance = buildCraftRecipeAffordance\(recipeKey,\s*GameState,\s*ITEMS\);[\s\S]*?if \(!affordance\.canCraft\) {[\s\S]*?this\._showMessage\(buildCraftRecipeFailureMessage\(affordance,\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._craftMessageMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftMessage'\)[\s\S]*?\}\),\s*'#ff4444'\);/,
        'BlacksmithScene should route blocked craft feedback through the shared width-aware failure helper'
    );
    assert.match(
        source,
        /if \(!check\.ok && check\.reason === 'material'\) {[\s\S]*?this\._showMessage\(buildCraftRecipeFailureMessage\(\{[\s\S]*?reason:\s*check\.reason[\s\S]*?label:\s*'材料不足: '\s*\+\s*materialName[\s\S]*?missingItemKey:\s*check\.missingItemKey[\s\S]*?requiredCount:\s*check\.requiredCount[\s\S]*?currentCount:\s*check\.currentCount[\s\S]*?\},\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._craftMessageMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftMessage'\)[\s\S]*?\}\),\s*'#ff4444'\);/,
        'BlacksmithScene should route material craft failures through the shared width-aware failure helper'
    );
    assert.match(
        source,
        /const autoAssign = buildQuickSlotAutoAssignResult\(GameState\.quickSlots,\s*crafted\.producedItemKey,\s*ITEMS,\s*\{[\s\S]*?measureLabelWidth:\s*label\s*=>\s*this\._measureQuickSlotNoticeLabel\(label\)[\s\S]*?\}\);[\s\S]*?const successMessage = buildCraftRecipeSuccessMessage\(recipeKey,\s*crafted,\s*autoAssign,\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._craftMessageMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftMessage'\)[\s\S]*?\}\);[\s\S]*?this\._showMessage\(successMessage,\s*'#7dffb3'\);/,
        'BlacksmithScene should route crafted-item success feedback through the shared width-aware receipt helper'
    );
    assert.match(
        source,
        /_measureQuickSlotNoticeLabel\(label\)\s*{[\s\S]*?this\._quickSlotNoticeMeasureText[\s\S]*?setText\(label\)[\s\S]*?return this\._quickSlotNoticeMeasureText\.width;/,
        'BlacksmithScene should expose a Phaser-backed quick-slot notice measurement helper for crafted-item handoff feedback'
    );
    assert.match(
        coreSource,
        /function buildCraftRecipeSuccessMessage\(recipeKey,\s*craftResult,\s*autoAssignResult,\s*itemCatalog,\s*options\)\s*{[\s\S]*?const batchReceipt = buildCraftRecipeBatchReceipt\(recipeKey,\s*craftResult,\s*itemCatalog\);[\s\S]*?const fullNotice = typeof safeAutoAssignResult\.notice === 'string' \? safeAutoAssignResult\.notice\.trim\(\) : '';[\s\S]*?const compactNotice = buildCraftRecipeQuickSlotSummaryFromAutoAssignResult\(safeAutoAssignResult\);[\s\S]*?return clampTextToWidth\(batchReceipt,\s*maxWidth,/,
        'shared craft success helper should keep the batch receipt first and collapse the quick-slot suffix before clamping the receipt itself'
    );
    assert.match(
        source,
        /_measureBlacksmithTextWidth\(text,\s*styleKey\)\s*{[\s\S]*?const measureText = this\._getBlacksmithTextMeasureNode\(styleKey\);[\s\S]*?measureText\.setText\(safeText\);[\s\S]*?const width = measureText\.width;/,
        'BlacksmithScene should expose a Phaser-backed text measurement helper for recipe-row width fitting'
    );
}

function testBlacksmithUpgradeMessageHooks() {
    const source = loadGameSource();
    const coreSource = fs.readFileSync(path.join(repoRoot, 'shared/game-core.js'), 'utf8');
    assert.match(
        coreSource,
        /function buildWeaponUpgradeAffordance\(weaponKey,\s*state,\s*itemCatalog\)\s*{[\s\S]*?const check = canUpgradeWeapon\(safeState,\s*weaponKey\);[\s\S]*?label:\s*'可强化'[\s\S]*?label:\s*`差\$\{Math\.max\(0,\s*check\.cost\.gold - gold\)\}金`[\s\S]*?label:\s*`差\$\{Math\.max\(1,\s*missingCount\)\}个\$\{materialName\}`/,
        'shared upgrade affordance helper should derive ready, gold-shortfall, and material-shortfall labels from the existing upgrade check'
    );
    assert.match(
        coreSource,
        /function buildWeaponUpgradeBenefitSummary\(weaponKey,\s*fromLevel,\s*toLevel,\s*weapons,\s*scalingOverride,\s*options\)\s*{[\s\S]*?const labelPrefix = options && typeof options\.labelPrefix === 'string'[\s\S]*?pushVariant\(withLabelPrefix\(`伤害\+\$\{damageDelta\} \/ 特攻-\$\{specialCooldownSeconds\}s \/ 体耗-\$\{staminaDelta\}`\)\)/,
        'shared upgrade benefit helper should derive payoff copy from the real current-vs-next weapon stats instead of hardcoded strings'
    );
    assert.match(
        coreSource,
        /function buildWeaponUpgradeSuccessMessage\(result,\s*itemCatalog,\s*weapons,\s*scalingOverride,\s*options\)\s*{[\s\S]*?buildWeaponUpgradeBenefitSummary\(\s*safeResult\.weaponKey,\s*safeResult\.level,\s*safeResult\.nextLevel,\s*safeWeapons,\s*safeScaling,[\s\S]*?labelPrefix:\s*'本次'[\s\S]*?const cumulativeBenefitSummary = toLevel > 2\s*\? buildWeaponUpgradeBenefitSummary\(\s*safeResult\.weaponKey,\s*1,\s*toLevel,\s*safeWeapons,\s*safeScaling,[\s\S]*?labelPrefix:\s*'累计'[\s\S]*?\)\s*:\s*''[\s\S]*?const cumulativeSegments = cumulativeBenefitSummary\.split\(' \/ '\)\.map\(segment => segment\.trim\(\)\)\.filter\(Boolean\)[\s\S]*?const compactCumulativeAnchor = [\s\S]*?const cumulativePrimaryAnchor = cumulativeSegments\[0\] \|\| ''[\s\S]*?const compactSpendAnchor = spentCount > 0[\s\S]*?if \(levelTransition && cumulativeBenefitSummary\) {[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{cumulativeBenefitSummary\} · \$\{fullSpendAnchor\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{cumulativeBenefitSummary\} · \$\{compactSpendAnchor\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{compactCumulativeAnchor\} · \$\{compactSpendAnchor\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{cumulativePrimaryAnchor\} · \$\{compactSpendAnchor\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{cumulativeBenefitSummary\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{compactCumulativeAnchor\}`\);[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{cumulativePrimaryAnchor\}`\);[\s\S]*?}[\s\S]*?pushVariant\(`强化成功! \$\{levelTransition\} · \$\{benefitSummary\} · \$\{fullSpendAnchor\}`\)/,
        'shared upgrade success helper should derive compact cumulative-plus-spend anchor variants from the same shared benefit-summary contract before it falls back to the older payoff/material ladder'
    );
    assert.match(
        coreSource,
        /function buildWeaponUpgradePreviewSummary\(weaponKey,\s*state,\s*weapons,\s*itemCatalog,\s*scalingOverride,\s*options\)\s*{[\s\S]*?const affordance = buildWeaponUpgradeAffordance\(weaponKey,\s*safeState,\s*safeItemCatalog\);[\s\S]*?const isMaxLevel = affordance && affordance\.blockedReason === 'max_level';[\s\S]*?pushAffordanceVariant\('已满级'\);[\s\S]*?pushAffordanceVariant\('满阶'\);[\s\S]*?const nextBenefitSummary = isMaxLevel\s*\? ''\s*:\s*buildWeaponUpgradeBenefitSummary\(weaponKey,\s*level,\s*level \+ 1,\s*safeWeapons,\s*safeScaling,\s*\{[\s\S]*?labelPrefix:\s*'本次'[\s\S]*?\}\);[\s\S]*?const cumulativeBenefitSummary = level > 1\s*\? buildWeaponUpgradeBenefitSummary\(weaponKey,\s*1,\s*level,\s*safeWeapons,\s*safeScaling,\s*\{[\s\S]*?labelPrefix:\s*'累计'[\s\S]*?\}\)\s*:\s*'';[\s\S]*?const cumulativePrimarySegment = cumulativeSegments\[0\] \|\| ''[\s\S]*?const nextPrimarySegment = nextSegments\[0\] \|\| ''[\s\S]*?pushLayeredVariant\(\[baseLabel, '累计\+下次', `\$\{cumulativePrimarySegment\} \/ \$\{nextPrimarySegment\}`\]\);/,
        'shared upgrade preview summary should switch from next-level payoff to a max-level purchased-benefit echo once no further upgrade exists'
    );
    assert.match(
        coreSource,
        /function buildWeaponUpgradeRowLabel\(weaponKey,\s*level,\s*itemCatalog,\s*options\)\s*{[\s\S]*?if \(!requiredMaterialKey\) {\s*return '\[强化\]';\s*}[\s\S]*?if \(!cost\) {[\s\S]*?pushVariant\('已满级'\);[\s\S]*?pushVariant\('满阶'\);/,
        'shared upgrade-row helper should expose compact max-level status variants when no further upgrade cost exists'
    );
    assert.match(
        source,
        /weaponKeys\.forEach\(\(key,\s*i\)\s*=>\s*{[\s\S]*?if \(unlocked\) {[\s\S]*?const config = this\._buildUpgradeConfig\(key,\s*level\);[\s\S]*?if \(config\) {[\s\S]*?upgradeBtn = this\._createUpgradeButton\(key,\s*rowText,\s*y,\s*config\);/,
        'BlacksmithScene should create a right-slot status label for unlocked max-level weapons instead of gating the slot on level < 3'
    );
    assert.match(
        source,
        /_buildUpgradeConfig\(weaponKey,\s*level\)\s*{[\s\S]*?if \(!requiredMaterialKey\) return null;[\s\S]*?if \(!cost\) {\s*return \{[\s\S]*?isMaxLevel:\s*true[\s\S]*?label:\s*this\._buildUpgradeLabel\(weaponKey,\s*level\)/,
        'BlacksmithScene should route max-level action-slot copy through the shared width-aware upgrade-row helper'
    );
    assert.match(
        source,
        /_createUpgradeButton\(weaponKey,\s*rowText,\s*y,\s*config\)\s*{[\s\S]*?const isMaxLevel = !!\(config && config\.isMaxLevel\);[\s\S]*?fill:\s*isMaxLevel \? '#98a2b3' : '#4a90d9'[\s\S]*?if \(!isMaxLevel\) {[\s\S]*?setInteractive\(\{ useHandCursor: true \}\)/,
        'BlacksmithScene should render the max-level slot as a non-interactive status label instead of a live upgrade button'
    );
    assert.match(
        source,
        /const newConfig = this\._buildUpgradeConfig\(weaponKey,\s*level\);[\s\S]*?if \(newConfig\) {[\s\S]*?const nextBtn = this\._createUpgradeButton\(weaponKey,\s*rowText,\s*btn\.y,\s*newConfig\);/,
        'BlacksmithScene should rebuild the right-slot label after upgrades even when the new level is maxed'
    );
    assert.match(
        source,
        /_buildWeaponRowText\(weaponKey\)\s*{[\s\S]*?return buildWeaponUpgradePreviewSummary\(weaponKey,\s*GameState,\s*WEAPONS,\s*ITEMS,\s*WEAPON_SCALING,\s*\{[\s\S]*?maxWidth:\s*this\._weaponRowTextMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'weaponRow'\)[\s\S]*?\}\);/,
        'BlacksmithScene should route left-lane upgrade preview copy through the shared measured-width summary helper'
    );
    assert.match(
        source,
        /_syncUpgradeButtonState\(row,\s*affordance\)\s*{[\s\S]*?canUpgrade[\s\S]*?disableInteractive\(\)[\s\S]*?setInteractive\(\{ useHandCursor: true \}\)/,
        'BlacksmithScene should toggle upgrade button interactivity from the shared upgrade affordance contract'
    );
    assert.match(
        source,
        /_refreshWeaponRows\(\)\s*{[\s\S]*?const affordance = buildWeaponUpgradeAffordance\(row\.key,\s*GameState,\s*ITEMS\);[\s\S]*?row\.rowText\.setText\(this\._buildWeaponRowText\(row\.key\)\);[\s\S]*?this\._syncUpgradeButtonState\(row,\s*affordance\);/,
        'BlacksmithScene should refresh weapon rows from the shared upgrade affordance contract'
    );
    assert.match(
        source,
        /this\._refreshWeaponRows\(\);\s*this\._refreshCraftRows\(\);/,
        'BlacksmithScene should refresh weapon affordance rows alongside craft rows after state changes'
    );
    assert.match(
        source,
        /if \(!check\.ok && check\.reason === 'material'\) {[\s\S]*?this\._showMessage\(buildWeaponUpgradeFailureMessage\(check,\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._craftMessageMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftMessage'\)[\s\S]*?\}\),\s*'#ff4444'\);/,
        'BlacksmithScene should route upgrade material blockers through the shared width-aware upgrade failure helper'
    );
    assert.match(
        source,
        /const successMessage = buildWeaponUpgradeSuccessMessage\(applied,\s*ITEMS,\s*WEAPONS,\s*WEAPON_SCALING,\s*\{[\s\S]*?maxWidth:\s*this\._craftMessageMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'craftMessage'\)[\s\S]*?\}\);[\s\S]*?this\._showMessage\(successMessage,\s*'#44ff44'\);/,
        'BlacksmithScene should route upgrade success feedback through the shared width-aware upgrade success helper'
    );
    assert.match(
        source,
        /_buildUpgradeLabel\(weaponKey,\s*level\)\s*{[\s\S]*?return buildWeaponUpgradeRowLabel\(weaponKey,\s*level,\s*ITEMS,\s*\{[\s\S]*?maxWidth:\s*this\._upgradeButtonTextMaxWidth[\s\S]*?measureTextWidth:\s*text\s*=>\s*this\._measureBlacksmithTextWidth\(text,\s*'upgradeButton'\)[\s\S]*?\}\);/,
        'BlacksmithScene should route upgrade button copy through the shared width-aware upgrade-row helper'
    );
    assert.match(
        source,
        /_buildUpgradeConfig\(weaponKey,\s*level\)\s*{[\s\S]*?label:\s*this\._buildUpgradeLabel\(weaponKey,\s*level\)/,
        'BlacksmithScene should source upgrade button labels from the shared measured-width helper'
    );
}

function testConsumableUseResolution() {
    const hpPotion = { key: 'hpPotion', type: 'consumable', effect: 'healHp', value: 40 };
    const fullHp = resolveConsumableUse(hpPotion, {
        hp: 100,
        maxHp: 100,
        stamina: 40,
        maxStamina: 100
    });
    assert.equal(fullHp.ok, false, 'full HP should block consumable usage');
    assert.equal(fullHp.consume, false, 'full HP should not consume item');
    assert.equal(fullHp.reason, 'full', 'full HP should report full reason');
    assert.equal(fullHp.feedbackText, '生命已满', 'full HP should expose warning text');

    const partialHeal = resolveConsumableUse(hpPotion, {
        hp: 73,
        maxHp: 100,
        stamina: 40,
        maxStamina: 100
    });
    assert.equal(partialHeal.ok, true, 'partial HP should allow consumable usage');
    assert.equal(partialHeal.consume, true, 'successful heal should consume item');
    assert.equal(partialHeal.recoveredAmount, 27, 'heal should clamp to missing HP');
    assert.equal(partialHeal.feedbackText, '+27 HP', 'heal feedback should report actual restored amount');
    assert.equal(partialHeal.nextVitals.hp, 100, 'heal should clamp to max HP');

    const staminaPotion = { key: 'staminaPotion', type: 'consumable', effect: 'healStamina', value: 40 };
    const partialStamina = resolveConsumableUse(staminaPotion, {
        hp: 100,
        maxHp: 100,
        stamina: 65,
        maxStamina: 90
    });
    assert.equal(partialStamina.ok, true, 'partial stamina should allow usage');
    assert.equal(partialStamina.recoveredAmount, 25, 'stamina restore should clamp to missing stamina');
    assert.equal(partialStamina.feedbackText, '+25 ST', 'stamina feedback should report actual restored amount');
    assert.equal(partialStamina.nextVitals.stamina, 90, 'stamina restore should clamp to max');

    const berserkerOil = { key: 'berserkerOil', type: 'consumable', effect: 'battleFocus', value: 0 };
    const buff = resolveConsumableUse(berserkerOil, {
        hp: 90,
        maxHp: 100,
        stamina: 10,
        maxStamina: 100
    });
    assert.equal(buff.ok, true, 'buff consumable should remain usable');
    assert.equal(buff.consume, true, 'buff consumable should be consumed');
    assert.equal(buff.effect, 'battleFocus', 'buff result should expose effect key');
    assert.equal(buff.nextVitals.hp, 90, 'buff consumable should not mutate HP directly');
}

function testStatusHudSummary() {
    const summary = buildStatusHudSummary({
        activeStatuses: [
            { key: 'slow', remainingMs: 2400 },
            { key: 'burn', remainingMs: 900 },
            { key: 'bleed', remainingMs: 1400 }
        ],
        controlInvertMs: 700,
        statusResistanceMs: 3200,
        damageBuffMs: 5100,
        damageBuffMultiplier: 1.25
    });

    assert.deepEqual(summary.debuffs, [
        '控制反转 1s',
        '灼烧 1s',
        '流血 2s',
        '减速 3s'
    ], 'debuff lane should sort by urgency');
    assert.deepEqual(summary.buffs, [
        '状态抗性 4s',
        '增伤 +25% 6s'
    ], 'buff lane should include defensive and offensive buffs');
}

function testBossHudReadability() {
    const trailDrop = advanceBossHpAfterimage(1, 0.54, 0.12);
    assert.equal(trailDrop, 0.88, 'afterimage should ease downward by the configured step');

    const trailFloor = advanceBossHpAfterimage(0.58, 0.54, 0.12);
    assert.equal(trailFloor, 0.54, 'afterimage should never fall below the real HP ratio');

    const trailRecover = advanceBossHpAfterimage(0.54, 0.71, 0.12);
    assert.equal(trailRecover, 0.71, 'afterimage should snap upward when HP ratio increases');

    const phaseSummary = buildBossPhaseHudSummary({
        phases: [
            { hpPercent: 1 },
            { hpPercent: 0.7 },
            { hpPercent: 0.4 },
            { hpPercent: 0.15 }
        ],
        currentPhase: 1
    });

    assert.equal(phaseSummary.phaseLabel, 'Phase 2/4', 'summary should expose human-readable phase label');
    assert.equal(phaseSummary.nextThresholdLabel, '下阶段 40%', 'summary should expose next threshold label');
    assert.deepEqual(phaseSummary.thresholdMarkers, [0.7, 0.4, 0.15], 'summary should keep phase threshold marker ratios');

    const finalPhaseSummary = buildBossPhaseHudSummary({
        phases: [
            { hpPercent: 1 },
            { hpPercent: 0.5 }
        ],
        currentPhase: 1
    });
    assert.equal(finalPhaseSummary.nextThresholdLabel, '', 'final phase should not advertise a next threshold');

    const telegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '幻影风暴',
        attackTypeLabel: '特殊',
        counterWindowMs: 1700,
        counterHint: '反制: 先躲弹幕，再找本体',
        telegraphDurationMs: 1300,
        remainingMs: 650
    });
    assert.equal(telegraphSummary.visible, true, 'telegraph summary should become visible when attack metadata exists');
    assert.equal(telegraphSummary.typeLabel, '类型 特殊', 'telegraph summary should expose localized attack type text');
    assert.equal(telegraphSummary.counterWindowLabel, '反制窗口 1.7s', 'telegraph summary should format the counter window in seconds');
    assert.equal(telegraphSummary.hintLabel, '反制: 先躲弹幕，再找本体', 'telegraph summary should keep the counter hint');
    assert.equal(telegraphSummary.progressRatio, 0.5, 'telegraph progress should report the remaining telegraph time ratio');
    assert.equal(telegraphSummary.counterWindowStartMarkerVisible, false, 'telegraph summary should stay quiet when the counter window opens from the first frame');
    assert.equal(telegraphSummary.counterWindowStartMarkerRatio, 0, 'telegraph summary should not offset the start marker when the counter window starts immediately');
    assert.equal(telegraphSummary.counterWindowTailMarkerVisible, true, 'telegraph summary should flag when the counter window extends beyond the telegraph bar');
    assert.equal(telegraphSummary.counterWindowOverflowMs, 400, 'telegraph summary should expose how much the counter window outlasts the telegraph');
    assert.equal(telegraphSummary.counterWindowClosureMarkerVisible, false, 'telegraph summary should not draw an in-bar closure marker when the counter window outlasts the telegraph');
    assert.equal(telegraphSummary.counterWindowClosureMarkerRatio, 0, 'telegraph summary should keep the closure marker ratio at zero when the counter window does not close inside the bar');
    assert.equal(telegraphSummary.counterWindowSpanVisible, false, 'telegraph summary should not draw a contained span when the counter window touches the bar edges');
    assert.equal(telegraphSummary.counterWindowSpanStartRatio, 0, 'telegraph summary should keep the contained span start ratio at zero when no contained span exists');
    assert.equal(telegraphSummary.counterWindowSpanWidthRatio, 0, 'telegraph summary should keep the contained span width ratio at zero when no contained span exists');

    const earlyClosureTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '熔火围城',
        attackTypeLabel: '范围',
        counterWindowMs: 800,
        counterHint: '反制: 贴身压住起手',
        telegraphDurationMs: 1300,
        remainingMs: 650
    });
    assert.equal(earlyClosureTelegraphSummary.counterWindowStartMarkerVisible, false, 'telegraph summary should stay quiet at the bar head when the counter window opens from frame one');
    assert.equal(earlyClosureTelegraphSummary.counterWindowTailMarkerVisible, false, 'telegraph summary should stay quiet at the bar tail when the counter window closes before the telegraph ends');
    assert.equal(earlyClosureTelegraphSummary.counterWindowOverflowMs, 0, 'telegraph summary should report no overflow when the counter window closes inside the telegraph');
    assert.equal(earlyClosureTelegraphSummary.counterWindowClosureMarkerVisible, true, 'telegraph summary should flag when a frame-one counter window closes before the telegraph bar finishes');
    assert.equal(earlyClosureTelegraphSummary.counterWindowClosureMarkerRatio, 800 / 1300, 'telegraph summary should expose the early counter-window closure point as a bar ratio');
    assert.equal(earlyClosureTelegraphSummary.counterWindowTailAfterglowVisible, true, 'telegraph summary should dim the tail segment after a frame-one counter window closes early');
    assert.equal(earlyClosureTelegraphSummary.counterWindowTailAfterglowStartRatio, 800 / 1300, 'telegraph summary should expose where the early-closure tail afterglow begins');
    assert.equal(earlyClosureTelegraphSummary.counterWindowTailAfterglowWidthRatio, 500 / 1300, 'telegraph summary should expose how much of the telegraph body remains after the early closure');
    assert.equal(earlyClosureTelegraphSummary.counterWindowTailAfterglowActive, false, 'telegraph summary should not flip the label before the timeline actually reaches the dimmed tail segment');
    assert.equal(earlyClosureTelegraphSummary.attackLabelMuted, false, 'telegraph summary should keep the attack title bright until the telegraph actually reaches the dimmed tail segment');
    assert.equal(earlyClosureTelegraphSummary.counterWindowLabelMuted, false, 'telegraph summary should keep the counter-window row highlighted until the tail segment becomes active');
    assert.equal(earlyClosureTelegraphSummary.progressFillAlpha, 0.9, 'telegraph summary should keep the main telegraph fill alpha at its normal strength before every warning row has settled');
    assert.equal(earlyClosureTelegraphSummary.currentCountdownHeadMarkerVisible, false, 'telegraph summary should keep the live countdown head marker hidden before the dimmed tail segment actually becomes active');
    assert.equal(earlyClosureTelegraphSummary.currentCountdownHeadMarkerRatio, 0, 'telegraph summary should not expose a live countdown head ratio before the dimmed tail segment becomes active');
    assert.equal(earlyClosureTelegraphSummary.currentCountdownHeadMarkerWarmFlashDurationMs, 0, 'telegraph summary should keep the head-marker warm-flash duration at zero before the dimmed tail segment becomes active');
    assert.equal(earlyClosureTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, false, 'telegraph summary should keep the late head-marker glow disabled before the dimmed tail segment actually becomes active');
    assert.equal(earlyClosureTelegraphSummary.counterWindowSpanVisible, false, 'telegraph summary should avoid drawing a contained span when the counter window starts at the first frame');

    const activeTailAfterglowTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 400
    });
    assert.equal(activeTailAfterglowTelegraphSummary.counterWindowTailAfterglowVisible, true, 'telegraph summary should keep the tail-afterglow metadata once the early-closing window exists');
    assert.equal(activeTailAfterglowTelegraphSummary.counterWindowTailAfterglowActive, true, 'telegraph summary should flag when the live telegraph has already entered the dimmed tail segment');
    assert.equal(activeTailAfterglowTelegraphSummary.attackLabelMuted, true, 'telegraph summary should mark the attack title as muted once the live telegraph has already entered the dimmed tail segment');
    assert.equal(activeTailAfterglowTelegraphSummary.counterWindowLabel, '已收束提示', 'telegraph summary should swap the counter-window label once the live telegraph has already entered the dimmed tail segment');
    assert.equal(activeTailAfterglowTelegraphSummary.counterWindowLabelMuted, true, 'telegraph summary should mark the counter-window label as muted once the telegraph is already in the tail-afterglow phase');
    assert.equal(activeTailAfterglowTelegraphSummary.hintLabel, '闪避提示: 停止冲刺，短步修正方向', 'telegraph summary should relabel stale counter hints as dodge guidance once the live telegraph has already entered the dimmed tail segment');
    assert.equal(activeTailAfterglowTelegraphSummary.hintLabelMuted, true, 'telegraph summary should mark rewritten tail-phase hint copy as muted once the live telegraph has already entered the dimmed tail segment');
    assert.equal(activeTailAfterglowTelegraphSummary.progressFillAlpha, 0.62, 'telegraph summary should lower the surviving main telegraph fill alpha once the live warning has fully settled into the tail-afterglow state');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should expose a dedicated live countdown head marker once the dimmed tail segment is active and the surviving fill has settled');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerRatio, activeTailAfterglowTelegraphSummary.progressRatio, 'telegraph summary should anchor the live countdown head marker to the current telegraph progress edge');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerWarmFlashDurationMs, 120, 'telegraph summary should advertise a short warm-flash budget when the live countdown head marker first becomes relevant');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, false, 'telegraph summary should keep the weaker late head-marker glow disabled until the remaining countdown drops into the final tail beat');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterAlphaMuted, false, 'telegraph summary should keep the residual outer late glow alpha at full strength until the remaining tail countdown falls into the final sub-millisecond beat');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, false, 'telegraph summary should keep the inner countdown-head core in its normal profile until the remaining tail countdown drops under the final focus threshold');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, false, 'telegraph summary should keep the countdown-head inner core at full height until the remaining tail countdown drops under the final height-trim threshold');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength until the remaining tail countdown drops under the final 2ms alpha-trim threshold');
    assert.equal(activeTailAfterglowTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height until the remaining tail countdown drops under the final cap-trim threshold');

    const lateCountdownHeadGlowTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 180
    });
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final tail beat');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, true, 'telegraph summary should flag the weaker late head-marker glow once the remaining countdown drops into the final tail beat');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterAlphaMuted, false, 'telegraph summary should keep the residual outer late glow alpha at full strength while the remaining tail countdown is still above the final sub-millisecond beat');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, false, 'telegraph summary should keep the inner countdown-head core at its default width while the remaining tail countdown is still above the tighter final-focus beat');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, false, 'telegraph summary should keep the countdown-head inner core at full height while the remaining tail countdown is still above the final height-trim threshold');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength while the remaining tail countdown is still above the final 2ms alpha-trim threshold');
    assert.equal(lateCountdownHeadGlowTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height while the remaining tail countdown is still above the final cap-trim threshold');

    const finalCountdownHeadFocusTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 100
    });
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final focus beat');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, true, 'telegraph summary should keep the weaker late head-marker glow active during the final focus beat');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should tighten the inner countdown-head core once the remaining tail countdown drops under the final focus threshold');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerLateGlowTrimmed, false, 'telegraph summary should keep the weaker late head-marker glow at its normal spread until the remaining countdown drops under the tighter final trim threshold');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, false, 'telegraph summary should keep the countdown-head inner core at full height until the remaining tail countdown reaches the final height-trim beat');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength during the final focus beat until the remaining tail countdown reaches the tighter 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadFocusTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height during the final focus beat until the remaining tail countdown reaches the tighter cap-trim threshold');

    const finalCountdownHeadGlowTrimTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 60
    });
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final trim beat');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, true, 'telegraph summary should keep the weaker late head-marker glow active during the final trim beat');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final trim beat');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowTrimmed, true, 'telegraph summary should flag when the weaker late head-marker glow needs to contract around the endpoint during the final trim beat');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowContained, false, 'telegraph summary should keep the weaker late head-marker glow in its normal spill state until the remaining countdown drops under the tighter final containment threshold');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, false, 'telegraph summary should keep the countdown-head inner core at full height during the final trim beat until the remaining tail countdown reaches the last height-trim threshold');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength during the final trim beat until the remaining tail countdown reaches the tighter 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadGlowTrimTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height during the final trim beat until the remaining tail countdown reaches the tighter cap-trim threshold');

    const finalCountdownHeadGlowContainTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 30
    });
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final containment beat');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerLateGlowVisible, true, 'telegraph summary should keep the weaker late head-marker glow active during the final containment beat');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final containment beat');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerLateGlowTrimmed, true, 'telegraph summary should keep the weaker late head-marker glow trimmed during the final containment beat');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerLateGlowContained, true, 'telegraph summary should flag when the weaker late head-marker glow needs to stay inside the bar endpoint during the final containment beat');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, false, 'telegraph summary should keep the countdown-head inner core at full height during the final containment beat until the remaining tail countdown reaches the last height-trim threshold');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength during the final containment beat until the remaining tail countdown reaches the tighter 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadGlowContainTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height during the final containment beat until the remaining tail countdown reaches the tighter cap-trim threshold');

    const finalCountdownHeadHeightTrimTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 10
    });
    assert.equal(finalCountdownHeadHeightTrimTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final height-trim beat');
    assert.equal(finalCountdownHeadHeightTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final height-trim beat');
    assert.equal(finalCountdownHeadHeightTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, true, 'telegraph summary should shorten the countdown-head inner core once the remaining tail countdown drops under the final 20ms height-trim threshold');
    assert.equal(finalCountdownHeadHeightTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength during the final height-trim beat until the remaining tail countdown reaches the tighter 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadHeightTrimTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, false, 'telegraph summary should keep the countdown-head shell caps at full height until the remaining tail countdown drops under the final 10ms cap-trim threshold');

    const finalCountdownHeadShellTrimTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 5
    });
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final cap-trim beat');
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final cap-trim beat');
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, true, 'telegraph summary should keep the inner countdown-head core height trimmed during the final cap-trim beat');
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength until the remaining tail countdown drops under the final 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, true, 'telegraph summary should shorten the countdown-head shell caps once the remaining tail countdown drops under the final 10ms cap-trim threshold');
    assert.equal(finalCountdownHeadShellTrimTelegraphSummary.currentCountdownHeadMarkerShellAlphaMuted, false, 'telegraph summary should keep the countdown-head shell alpha at its normal strength until the remaining tail countdown drops under the final 5ms alpha-trim threshold');

    const finalCountdownHeadShellAlphaTrimTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 4
    });
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final shell-alpha beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final shell-alpha beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, true, 'telegraph summary should keep the inner countdown-head core height trimmed during the final shell-alpha beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, false, 'telegraph summary should keep the countdown-head inner core alpha at full strength during the final shell-alpha beat until the remaining tail countdown drops under the tighter 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, true, 'telegraph summary should keep the countdown-head shell caps trimmed during the final shell-alpha beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellAlphaMuted, true, 'telegraph summary should lower the countdown-head shell alpha once the remaining tail countdown drops under the final 5ms alpha-trim threshold');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerFinalWidthTrimmed, false, 'telegraph summary should keep the countdown-head shell and inner core at their normal focused width until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreContrastMuted, false, 'telegraph summary should keep the countdown-head shell/core brightness contrast at its normal separation until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreWarmthMuted, false, 'telegraph summary should keep the countdown-head shell/core color temperature split at its normal warmth until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreSaturationMuted, false, 'telegraph summary should keep the countdown-head shell/core saturation split at its normal separation until the remaining tail countdown falls into the final sub-millisecond beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeSoftened, false, 'telegraph summary should keep the countdown-head shell/core seam at its normal crispness until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened, false, 'telegraph summary should keep the countdown-head shell/core edge highlight at its normal crest until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight brightness at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight warmth at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight saturation at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight feathering at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight transparency at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced, false, 'telegraph summary should keep the countdown-head shell/core edge-highlight warm-vs-cool transparency layering at its normal lateral bias until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterAlphaMuted, false, 'telegraph summary should keep the residual outer late glow alpha at full strength until the remaining tail countdown falls into the final sub-millisecond beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterWarmthMuted, false, 'telegraph summary should keep the residual outer late glow at its warmer color temperature until the remaining tail countdown falls into the final sub-millisecond beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterHeightTrimmed, false, 'telegraph summary should keep the residual outer late glow at full height until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed, false, 'telegraph summary should keep the residual outer late glow corners at their normal roundness until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerWarmthMuted, false, 'telegraph summary should keep the residual inner late glow at its warmer color temperature until the remaining tail countdown falls into the final sub-millisecond beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerHeightTrimmed, false, 'telegraph summary should keep the residual inner late glow at full height until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerAlphaMuted, false, 'telegraph summary should keep the residual inner late glow alpha at full strength until the remaining tail countdown falls into the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadShellAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed, false, 'telegraph summary should keep the residual inner late glow corners at their normal roundness until the remaining tail countdown falls into the final sub-millisecond trim beat');

    const finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '混乱逆转',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制: 停止冲刺，短步修正方向',
        telegraphDurationMs: 1300,
        remainingMs: 1
    });
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerVisible, true, 'telegraph summary should keep the live countdown head marker visible during the final inner-core alpha beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreFocused, true, 'telegraph summary should keep the inner countdown-head core focused during the final inner-core alpha beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreHeightTrimmed, true, 'telegraph summary should keep the inner countdown-head core height trimmed during the final inner-core alpha beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerInnerCoreAlphaMuted, true, 'telegraph summary should lower the countdown-head inner core alpha once the remaining tail countdown drops under the final 2ms alpha-trim threshold');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCapTrimmed, true, 'telegraph summary should keep the countdown-head shell caps trimmed during the final inner-core alpha beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellAlphaMuted, true, 'telegraph summary should keep the countdown-head shell alpha muted during the final inner-core alpha beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerFinalWidthTrimmed, true, 'telegraph summary should narrow both the countdown-head shell and inner core together during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreContrastMuted, true, 'telegraph summary should also converge the countdown-head shell/core brightness contrast during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreWarmthMuted, true, 'telegraph summary should also converge the countdown-head shell/core color temperature during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreSaturationMuted, true, 'telegraph summary should also converge the countdown-head shell/core saturation during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeSoftened, true, 'telegraph summary should also soften the countdown-head shell/core seam during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened, true, 'telegraph summary should also flatten the countdown-head shell/core edge highlight during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight thickness during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight brightness during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight warmth during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight saturation during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight feathering during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight transparency during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced, true, 'telegraph summary should also balance the countdown-head shell/core edge-highlight warm-vs-cool transparency layering during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed, true, 'telegraph summary should also narrow the residual outer late glow during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterAlphaMuted, true, 'telegraph summary should also lower the residual outer late glow alpha during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterWarmthMuted, true, 'telegraph summary should also cool the residual outer late glow during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterHeightTrimmed, true, 'telegraph summary should also shorten the residual outer late glow height during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed, true, 'telegraph summary should also tighten the residual outer late glow corners during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerWarmthMuted, true, 'telegraph summary should also cool the residual inner late glow during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerHeightTrimmed, true, 'telegraph summary should also shorten the residual inner late glow height during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerAlphaMuted, true, 'telegraph summary should also lower the residual inner late glow alpha during the final sub-millisecond trim beat');
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed, true, 'telegraph summary should also tighten the residual inner late glow corners during the final sub-millisecond trim beat');

    const activeTailAfterglowFollowupTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '幻影风暴',
        attackTypeLabel: '特殊',
        counterWindowMs: 800,
        counterHint: '反制提示: 先躲弹幕，再找本体',
        telegraphDurationMs: 1300,
        remainingMs: 400
    });
    assert.equal(activeTailAfterglowFollowupTelegraphSummary.hintLabel, '收束后处理: 先躲弹幕，再找本体', 'telegraph summary should relabel stale counter hints as post-window follow-up guidance when the remaining copy describes the recovery step');
    assert.equal(activeTailAfterglowFollowupTelegraphSummary.hintLabelMuted, true, 'telegraph summary should keep the follow-up hint muted once the live telegraph is already in the dimmed tail segment and the copy has been rewritten');

    const containedTelegraphSummary = buildBossTelegraphHudSummary({
        attackLabel: '圣剑环阵',
        attackTypeLabel: '弹幕',
        counterWindowMs: 900,
        counterWindowStartOffsetMs: 200,
        counterHint: '反制: 留在外圈，等回收',
        telegraphDurationMs: 1300,
        remainingMs: 650
    });
    assert.equal(containedTelegraphSummary.counterWindowStartMarkerVisible, true, 'telegraph summary should flag when the counter window starts after the bar begins');
    assert.equal(containedTelegraphSummary.counterWindowStartMarkerRatio, 200 / 1300, 'telegraph summary should expose the delayed counter-window entry as a bar ratio');
    assert.equal(containedTelegraphSummary.counterWindowTailMarkerVisible, false, 'telegraph summary should stay quiet when the counter window ends before the telegraph bar');
    assert.equal(containedTelegraphSummary.counterWindowOverflowMs, 0, 'telegraph summary should report no overflow when the counter window stays inside the telegraph');
    assert.equal(containedTelegraphSummary.counterWindowClosureMarkerVisible, false, 'telegraph summary should not add a duplicate closure marker when the contained span already marks both boundaries');
    assert.equal(containedTelegraphSummary.counterWindowClosureMarkerRatio, 0, 'telegraph summary should keep the closure marker ratio at zero when the contained span covers the end cue');
    assert.equal(containedTelegraphSummary.counterWindowSpanVisible, true, 'telegraph summary should flag when the counter window lives inside the telegraph body');
    assert.equal(containedTelegraphSummary.counterWindowSpanStartRatio, 200 / 1300, 'telegraph summary should expose the contained span start as a bar ratio');
    assert.equal(containedTelegraphSummary.counterWindowSpanWidthRatio, 900 / 1300, 'telegraph summary should expose the contained counter-window span width as a bar ratio');

    const inlineTelegraphLayout = buildBossTelegraphTextLayout({
        telegraphWidth: 220,
        mainText: '类型 特殊 | 幻影风暴',
        windowText: '反制窗口 1.7s',
        hintText: '反制: 先躲弹幕，再找本体',
        measureTextWidth: text => text.length * 8
    });
    assert.deepEqual(
        inlineTelegraphLayout,
        {
            stacked: false,
            lineCount: 1,
            mainMaxWidth: 100,
            windowMaxWidth: 112,
            mainYOffset: -4,
            windowYOffset: -4,
            hintYOffset: 16,
            windowX: 220,
            windowOriginX: 1,
            windowAccentVisible: false,
            windowAccentYOffset: 0,
            windowAccentHeight: 0
        },
        'short telegraph copy should stay on a single measured title row'
    );

    const stackedTelegraphLayout = buildBossTelegraphTextLayout({
        telegraphWidth: 220,
        mainText: '类型 特殊 | 业火审判连锁陨落',
        windowText: '反制窗口 12.5s',
        hintText: '反制: 先停手观察第二拍，再向侧后方留翻滚躲收尾',
        measureTextWidth: text => text.length * 8
    });
    assert.deepEqual(
        stackedTelegraphLayout,
        {
            stacked: true,
            lineCount: 2,
            mainMaxWidth: 220,
            windowMaxWidth: 220,
            mainYOffset: -4,
            windowYOffset: 8,
            hintYOffset: 28,
            windowX: 10,
            windowOriginX: 0,
            windowAccentVisible: true,
            windowAccentYOffset: 5,
            windowAccentHeight: 14
        },
        'long telegraph title, counter window and hint copy should promote the warning header into a measured two-line layout with a dedicated counter-window guard row'
    );

    const controlSummary = buildBossStatusHighlightSummary({
        hpRatio: 0.38,
        breakMs: 900,
        activeStatuses: ['burn', 'slow', 'slow']
    });
    assert.equal(controlSummary.segments.length, 2, 'status summary should stack break and control highlight segments');
    assert.deepEqual(controlSummary.segments.map(segment => segment.key), ['break', 'control'], 'break highlight should render ahead of control highlight');
    assert.equal(controlSummary.segments[0].label, '破招窗口', 'break highlight should advertise the counter-break state');
    assert.equal(controlSummary.segments[1].label, '受控: 减速', 'control highlight should summarize crowd-control state');
    assert.equal(controlSummary.segments[1].ratio, 0.38, 'highlight segments should match the current HP ratio');

    const finisherSummary = buildBossStatusHighlightSummary({
        hpRatio: 0.31,
        breakMs: 700,
        activeStatuses: ['slow'],
        finisherArmed: true
    });
    assert.deepEqual(finisherSummary.segments.map(segment => segment.key), ['break', 'control', 'finisher'], 'finisher summary should append the armed finisher cue after break/control highlights');
    assert.equal(finisherSummary.segments[2].label, '破势终结', 'finisher highlight should advertise the upgraded control payoff state');

    const emptyStatusSummary = buildBossStatusHighlightSummary({
        hpRatio: 0.62,
        breakMs: 0,
        activeStatuses: ['burn']
    });
    assert.equal(emptyStatusSummary.segments.length, 0, 'non-control statuses should not produce boss HUD overlay segments');
}

function testBossMechanicDiversityHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.ok(
        BOSSES.wrath.phases.some(phase => Array.isArray(phase.attacks) && phase.attacks.includes('magmaRing')),
        'wrath should add magmaRing into its later-phase attack pool'
    );
    assert.ok(
        BOSSES.pride.phases.some(phase => Array.isArray(phase.attacks) && phase.attacks.includes('bladeOrbit')),
        'pride should add bladeOrbit into its later-phase attack pool'
    );

    assert.match(
        source,
        /magmaRing:\s*'熔火围城'/,
        'attack display names should expose the localized magmaRing label'
    );
    assert.match(
        source,
        /bladeOrbit:\s*'圣剑环阵'/,
        'attack display names should expose the localized bladeOrbit label'
    );
    assert.match(
        source,
        /magmaRing:\s*'反制: 保持在火环安全带内，等收束后再贴近'/,
        'magmaRing should advertise a dedicated counter hint'
    );
    assert.match(
        source,
        /bladeOrbit:\s*'反制: 先绕 Boss 小步走位，再穿过飞剑空档'/,
        'bladeOrbit should advertise a dedicated counter hint'
    );
    assert.match(
        source,
        /magmaRing:\s*1600/,
        'magmaRing should define a counter window for the telegraph HUD'
    );
    assert.match(
        source,
        /bladeOrbit:\s*1500/,
        'bladeOrbit should define a counter window for the telegraph HUD'
    );
    assert.match(
        source,
        /SPECIAL:\s*\[[^\]]*'bladeOrbit'[^\]]*\]/,
        'bladeOrbit should be classified as a SPECIAL boss attack'
    );
    assert.match(
        source,
        /HAZARD:\s*\[[^\]]*'magmaRing'[^\]]*\]/,
        'magmaRing should be classified as a HAZARD boss attack'
    );
    assert.match(
        source,
        /else if \(atk === 'bladeOrbit'\)/,
        'Boss special attack executor should expose a bladeOrbit branch'
    );
    assert.match(
        source,
        /else if \(atk === 'magmaRing'\)/,
        'Boss hazard executor should expose a magmaRing branch'
    );
}

function testLustPhase3AttackOrder() {
    const { BOSSES } = loadDataConstants();
    const attacks = Array.from(BOSSES.lust.phases[2].attacks);
    const reverseControlIndex = attacks.indexOf('reverseControl');
    const illusionIndex = attacks.indexOf('illusion');
    const mirageDanceIndex = attacks.indexOf('mirageDance');

    assert.deepEqual(
        attacks.slice(reverseControlIndex + 1, illusionIndex),
        ['dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash'],
        'lust phase 3 should keep reverseControl and illusion separated by an extra directed light-pressure bridge'
    );
    assert.deepEqual(
        attacks.slice(illusionIndex + 1, mirageDanceIndex),
        ['dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash'],
        'lust phase 3 should keep illusion and mirageDance separated by an even longer directed light-pressure bridge after the illusion recovery follow-up'
    );
    assert.deepEqual(
        attacks.slice(mirageDanceIndex + 1),
        ['dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt', 'dash', 'charmBolt'],
        'lust phase 3 should keep the loopback after mirageDance on an even longer directed light-pressure bridge again after the shared-recovery recheck still left the return path too eager'
    );
}

function testLustIllusionMirageBridgeFollowup() {
    const { BOSSES } = loadDataConstants();
    const attacks = Array.from(BOSSES.lust.phases[2].attacks);
    const illusionIndex = attacks.indexOf('illusion');
    const mirageDanceIndex = attacks.indexOf('mirageDance');

    assert.equal(
        mirageDanceIndex - illusionIndex - 1,
        15,
        'lust phase 3 should add another charmBolt-dash pair before mirageDance after the illusion recovery follow-up'
    );
}

function testLustMirageLoopbackBridgeFollowup() {
    const { BOSSES } = loadDataConstants();
    const attacks = Array.from(BOSSES.lust.phases[2].attacks);
    const mirageDanceIndex = attacks.indexOf('mirageDance');

    assert.equal(
        attacks.length - mirageDanceIndex - 1,
        28,
        'lust phase 3 should add one more dash-charmBolt pair again to the loopback before returning to reverseControl after the shared-recovery recheck'
    );
}

function testLustPhase3RhythmSummary() {
    const { BOSSES } = loadDataConstants();
    const summary = buildBossAttackRhythmSummary({
        attacks: BOSSES.lust.phases[2].attacks,
        majorAttacks: ['reverseControl', 'illusion', 'mirageDance'],
        bridgeAttacks: ['dash', 'charmBolt']
    });

    assert.deepEqual(
        summary.majorAttackOrder,
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 rhythm summary should preserve the three major-special anchors in order'
    );
    assert.deepEqual(
        summary.transitionBridgeCounts,
        [13, 15, 28],
        'lust phase 3 rhythm summary should expose the directed bridge counts between each major-special anchor and the loopback'
    );
    assert.equal(
        summary.longestBridgeKey,
        'mirageDance->loopback',
        'lust phase 3 rhythm summary should identify the loopback as the longest breather bridge'
    );
    assert.equal(
        summary.loopbackBridgeDeltaVsPreviousMax,
        13,
        'lust phase 3 rhythm summary should show the second-loop loopback still staying meaningfully wider than the earlier major-special bridges'
    );
    assert.equal(
        summary.secondLoopDensityWarning,
        false,
        'lust phase 3 rhythm summary should keep the second-loop major-special return out of the dense-stack warning path'
    );
    assert.equal(
        summary.hasOffPatternBridgeAttacks,
        false,
        'lust phase 3 rhythm summary should confirm the bridge windows stay on the intended charmBolt/dash breather palette'
    );
}

function testLustPhase3CadenceTrace() {
    const { BOSSES } = loadDataConstants();
    const trace = buildBossAttackCadenceTrace({
        attacks: BOSSES.lust.phases[2].attacks,
        majorAttacks: ['reverseControl', 'illusion', 'mirageDance'],
        bridgeAttacks: ['dash', 'charmBolt']
    });

    assert.deepEqual(
        trace.majorAnchors,
        [
            { attack: 'reverseControl', index: 2 },
            { attack: 'illusion', index: 16 },
            { attack: 'mirageDance', index: 32 }
        ],
        'lust phase 3 cadence trace should expose the exact major-special anchor indexes'
    );
    assert.deepEqual(
        trace.transitions.map(entry => ({
            key: entry.key,
            fromIndex: entry.fromIndex,
            toIndex: entry.toIndex,
            bridgeStartIndex: entry.bridgeStartIndex,
            bridgeEndIndex: entry.bridgeEndIndex,
            bridgeCount: entry.bridgeCount
        })),
        [
            {
                key: 'reverseControl->illusion',
                fromIndex: 2,
                toIndex: 16,
                bridgeStartIndex: 3,
                bridgeEndIndex: 15,
                bridgeCount: 13
            },
            {
                key: 'illusion->mirageDance',
                fromIndex: 16,
                toIndex: 32,
                bridgeStartIndex: 17,
                bridgeEndIndex: 31,
                bridgeCount: 15
            },
            {
                key: 'mirageDance->loopback',
                fromIndex: 32,
                toIndex: -1,
                bridgeStartIndex: 33,
                bridgeEndIndex: 60,
                bridgeCount: 28
            }
        ],
        'lust phase 3 cadence trace should map the bridge windows between each major-special anchor and the loopback'
    );
    assert.deepEqual(
        trace.transitions.map(entry => Array.from(entry.bridgeTimeline.slice(0, 4))),
        [
            ['3:dash', '4:charmBolt', '5:dash', '6:charmBolt'],
            ['17:dash', '18:charmBolt', '19:dash', '20:charmBolt'],
            ['33:dash', '34:charmBolt', '35:dash', '36:charmBolt']
        ],
        'lust phase 3 cadence trace should expose indexed bridge timeline entries for CLI export'
    );
    assert.equal(
        trace.loopbackBridgeLead,
        13,
        'lust phase 3 cadence trace should quantify how much wider the loopback window stays than the earlier bridges'
    );
    assert.equal(
        trace.transitions[2].bridgePatternLabel,
        '33:dash | 34:charmBolt | 35:dash | 36:charmBolt | 37:dash | 38:charmBolt | 39:dash | 40:charmBolt | 41:dash | 42:charmBolt | 43:dash | 44:charmBolt | 45:dash | 46:charmBolt | 47:dash | 48:charmBolt | 49:dash | 50:charmBolt | 51:dash | 52:charmBolt | 53:dash | 54:charmBolt | 55:dash | 56:charmBolt | 57:dash | 58:charmBolt | 59:dash | 60:charmBolt',
        'lust phase 3 cadence trace should keep a printable loopback pattern for log-friendly live pacing analysis'
    );
}

function testLustPhase3CadenceReviewChecklist() {
    const { BOSSES } = loadDataConstants();
    const phase = BOSSES.lust.phases[2];
    const review = buildBossAttackCadenceReviewChecklist({
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

    assert.equal(
        review.sharedRecoveryLabel,
        'shared recovery≈10.2s',
        'lust phase 3 cadence review should convert the shared major-special recovery window into a recording-friendly label'
    );
    assert.deepEqual(
        review.checkpoints.map(entry => ({
            key: entry.key,
            telegraphAttack: entry.telegraphAttack,
            expectedReturnAttack: entry.expectedReturnAttack,
            bridgeCount: entry.bridgeCount,
            bridgeAttackCounts: entry.bridgeAttackCounts
        })),
        [
            {
                key: 'reverseControl->illusion',
                telegraphAttack: 'reverseControl',
                expectedReturnAttack: 'illusion',
                bridgeCount: 13,
                bridgeAttackCounts: {
                    dash: 7,
                    charmBolt: 6
                }
            },
            {
                key: 'illusion->mirageDance',
                telegraphAttack: 'illusion',
                expectedReturnAttack: 'mirageDance',
                bridgeCount: 15,
                bridgeAttackCounts: {
                    dash: 8,
                    charmBolt: 7
                }
            },
            {
                key: 'mirageDance->loopback',
                telegraphAttack: 'mirageDance',
                expectedReturnAttack: 'reverseControl',
                bridgeCount: 28,
                bridgeAttackCounts: {
                    dash: 14,
                    charmBolt: 14
                }
            }
        ],
        'lust phase 3 cadence review should translate the trace into telegraph-to-return review checkpoints with explicit dash/charmBolt bridge counts'
    );
    assert.equal(
        review.checkpoints[0].recordingFocusLabel,
        'HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴',
        'lust phase 3 cadence review should spell out the first telegraph/recovery/return alignment cue for Playwright or recording review'
    );
    assert.equal(
        review.checkpoints[2].recordingFocusLabel,
        'HUD telegraph 魅影连舞 -> shared recovery≈10.2s -> 28-step dash/charmBolt loopback -> 混乱逆转',
        'lust phase 3 cadence review should keep a dedicated loopback cue for the second-loop return spacing review'
    );
    assert.equal(
        review.checkpoints[2].telegraphHint,
        '反制: 观察真身换位节奏，留翻滚躲最后逆转波',
        'lust phase 3 cadence review should preserve the live HUD counter-hint alongside the loopback review cue'
    );
}

function testLustPhase3CadenceArtifactBundle() {
    const { BOSSES } = loadDataConstants();
    const phase = BOSSES.lust.phases[2];
    const artifact = buildBossAttackCadenceArtifactBundle({
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
        sharedRecoveryMs: phase.sharedAttackRecoveryMs.majorSpecial,
        telegraphSnapshot: {
            attackLabel: '混乱逆转',
            counterHint: '反制: 停止冲刺，短步修正方向',
            counterWindowMs: 1700,
            telegraphDurationMs: 1300
        },
        sharedRecoverySnapshot: {
            sharedRecoveryRemainingMs: 10200,
            breatherRemaining: 8,
            expectedReturnAttack: 'illusion',
            expectedReturnLabel: '幻影风暴'
        }
    });

    assert.deepEqual(
        artifact.checkpointLines,
        [
            '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴 | 反制: 停止冲刺，短步修正方向',
            '2. HUD telegraph 幻影风暴 -> shared recovery≈10.2s -> 15-step dash/charmBolt bridge -> 魅影连舞 | 反制: 先躲弹幕，再找本体',
            '3. HUD telegraph 魅影连舞 -> shared recovery≈10.2s -> 28-step dash/charmBolt loopback -> 混乱逆转 | 反制: 观察真身换位节奏，留翻滚躲最后逆转波'
        ],
        'lust cadence artifact bundle should emit numbered checkpoint lines for recording review output'
    );
    assert.equal(
        artifact.checkpointText,
        [
            '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴 | 反制: 停止冲刺，短步修正方向',
            '2. HUD telegraph 幻影风暴 -> shared recovery≈10.2s -> 15-step dash/charmBolt bridge -> 魅影连舞 | 反制: 先躲弹幕，再找本体',
            '3. HUD telegraph 魅影连舞 -> shared recovery≈10.2s -> 28-step dash/charmBolt loopback -> 混乱逆转 | 反制: 观察真身换位节奏，留翻滚躲最后逆转波'
        ].join('\n'),
        'lust cadence artifact bundle should keep a printable multiline checkpoint summary'
    );
    assert.deepEqual(
        artifact.telegraphSnapshot,
        {
            attackLabel: '混乱逆转',
            counterHint: '反制: 停止冲刺，短步修正方向',
            counterWindowMs: 1700,
            counterWindowStartOffsetMs: 0,
            telegraphDurationMs: 1300
        },
        'lust cadence artifact bundle should preserve the live telegraph snapshot including counterWindowMs and the counter window entry offset for artifact export'
    );
    assert.deepEqual(
        artifact.sharedRecoverySnapshot,
        {
            sharedRecoveryRemainingMs: 10200,
            breatherRemaining: 8,
            expectedReturnAttack: 'illusion',
            expectedReturnLabel: '幻影风暴',
            currentCheckpointKey: 'reverseControl->illusion',
            currentCheckpointStep: 1,
            sharedRecoveryLabel: 'shared recovery≈10.2s',
            checkpointExpectedReturns: {
                'reverseControl->illusion': {
                    attack: 'illusion',
                    label: '幻影风暴'
                },
                'illusion->mirageDance': {
                    attack: 'mirageDance',
                    label: '魅影连舞'
                },
                'mirageDance->loopback': {
                    attack: 'reverseControl',
                    label: '混乱逆转'
                }
            }
        },
        'lust cadence artifact bundle should preserve the shared-recovery snapshot plus checkpoint-local return targets for cadence-review alignment'
    );
}

function testE2eReportPhase3CadenceMarkdownIndex() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sds-e2e-report-'));
    const artifactDir = path.join(tempRoot, 'artifacts', 'e2e', 'lust-phase3-cadence-review');
    fs.mkdirSync(artifactDir, { recursive: true });

    fs.writeFileSync(
        path.join(artifactDir, 'meta.json'),
        JSON.stringify({
            title: 'lust cadence review',
            extra: {
                cadenceArtifact: {
                    checkpointLines: [
                        '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴 | 反制: 停止冲刺，短步修正方向'
                    ]
                }
            }
        }, null, 2)
    );
    fs.writeFileSync(path.join(artifactDir, 'snapshot.json'), JSON.stringify({ scene: 'BossScene' }, null, 2));
    fs.writeFileSync(path.join(artifactDir, 'cadence-review.json'), JSON.stringify({
        review: {
            checkpoints: [
                {
                    key: 'reverseControl->illusion',
                    expectedReturnLabel: '幻影风暴',
                    telegraphHint: '反制: 停止冲刺，短步修正方向'
                },
                {
                    key: 'mirageDance->loopback',
                    expectedReturnLabel: '混乱逆转',
                    telegraphHint: '反制: 观察真身换位节奏，留翻滚躲最后逆转波',
                    bridgeCount: 28,
                    bridgeAttackCounts: {
                        dash: 14,
                        charmBolt: 14
                    },
                    bridgeStartIndex: 29,
                    bridgeEndIndex: 56,
                    bridgeTimeline: [
                        '29:dash',
                        '30:charmBolt',
                        '55:dash',
                        '56:charmBolt'
                    ]
                }
            ]
        },
        telegraphSnapshot: {
            attackLabel: '魅影连舞',
            counterHint: '反制: 观察真身换位节奏，留翻滚躲最后逆转波',
            counterWindowMs: 1700,
            counterWindowStartOffsetMs: 0,
            telegraphDurationMs: 1300
        },
        checkpointLines: [
            '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴 | 反制: 停止冲刺，短步修正方向',
            '2. HUD telegraph 魅影连舞 -> shared recovery≈10.2s -> 28-step dash/charmBolt loopback -> 混乱逆转 | 反制: 观察真身换位节奏，留翻滚躲最后逆转波'
        ]
    }, null, 2));
    fs.writeFileSync(
        path.join(artifactDir, 'phase3-checkpoints.txt'),
        [
            '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴 | 反制: 停止冲刺，短步修正方向',
            '2. HUD telegraph 魅影连舞 -> shared recovery≈10.2s -> 28-step dash/charmBolt loopback -> 混乱逆转 | 反制: 观察真身换位节奏，留翻滚躲最后逆转波'
        ].join('\n') + '\n'
    );
    fs.writeFileSync(
        path.join(artifactDir, 'shared-recovery-snapshot.json'),
        JSON.stringify({
            sharedRecoveryRemainingMs: 10200,
            breatherRemaining: 8,
            expectedReturnLabel: '幻影风暴',
            currentCheckpointKey: 'reverseControl->illusion',
            currentCheckpointStep: 1,
            sharedRecoveryLabel: 'shared recovery≈10.2s',
            checkpointExpectedReturns: {
                'reverseControl->illusion': {
                    attack: 'illusion',
                    label: '幻影风暴'
                },
                'mirageDance->loopback': {
                    attack: 'reverseControl',
                    label: '混乱逆转'
                }
            }
        }, null, 2)
    );
    fs.writeFileSync(path.join(artifactDir, 'telegraph-hud.png'), 'png-placeholder');

    const output = execFileSync('node', [path.join(repoRoot, 'scripts', 'e2e-report.mjs')], {
        cwd: tempRoot,
        encoding: 'utf8'
    });

    assert.match(
        output,
        /^# E2E Artifact Report/m,
        'e2e report should render a markdown heading instead of raw JSON'
    );
    assert.match(
        output,
        /## lust-phase3-cadence-review/,
        'e2e report should render a dedicated section for each artifact directory'
    );
    assert.match(
        output,
        /Phase 3 录屏复盘清单/,
        'e2e report should surface a readable phase-3 cadence checklist section when cadence artifacts exist'
    );
    assert.match(
        output,
        /- Phase 3 汇总: match=2 \| drift=0\n  - recovery: checkpoint `review checkpoint #1 reverseControl->illusion` \| 锚点 `魅影连舞 -> 幻影风暴`\n  - telegraph: 提示 `反制: 观察真身换位节奏，留翻滚躲最后逆转波` \| 窗口 `1\.7s \(130\.8% telegraph\)` \| 起跳 `telegraph开头 0ms 开放` \| 收束 `telegraph后 \+400ms 收尾` \| 跨度 `telegraph开头 -> telegraph后 \+400ms` \| 覆盖 `telegraph全程 \+ 后400ms` \| 时长 `1\.3s \(1300ms\)` \| 尾差 `\+400ms` \| 相位 `telegraph后收束`\n  - artifact count: `4 artifacts ready`\n  - evidence: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should keep the full first-screen evidence shortcut set visible and confirm all four artifacts are ready even when the phase-3 summary has no drift'
    );
    assert.doesNotMatch(
        output,
        /- Drift-only mini checklist:/,
        'e2e report should omit the drift-only mini checklist once the loopback checkpoint and recovery snapshot return labels stay aligned'
    );
    assert.match(
        output,
        /1\. HUD telegraph 混乱逆转 -> shared recovery≈10\.2s -> 13-step dash\/charmBolt bridge -> 幻影风暴 \| 反制: 停止冲刺，短步修正方向 \| 回切目标: `幻影风暴` \| recovery 快照: `sharedRecoveryRemainingMs=10200 · breatherRemaining=8 · expectedReturnLabel=幻影风暴 · currentCheckpoint=review checkpoint #1 reverseControl->illusion` \| 回切校验: match \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should inline cadence checkpoint lines with recovery snapshot notes, the current recovery checkpoint, a match note, and direct artifact anchors'
    );
    assert.match(
        output,
        /2\. HUD telegraph 魅影连舞 -> shared recovery≈10\.2s -> 28-step dash\/charmBolt loopback -> 混乱逆转 \| 反制: 观察真身换位节奏，留翻滚躲最后逆转波 \| 回切目标: `混乱逆转` \| recovery 快照: `sharedRecoveryRemainingMs=10200 · breatherRemaining=8 · expectedReturnLabel=混乱逆转 · currentCheckpoint=review checkpoint #1 reverseControl->illusion` \| 回切校验: match \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should keep the loopback checkpoint aligned with the recovery snapshot return label while still exposing the current live checkpoint'
    );
    assert.match(
        output,
        /shared-recovery-snapshot\.json/,
        'e2e report should index the shared recovery snapshot artifact path'
    );
}

function testE2eReportPhase3CadenceMissingArtifactsSummary() {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sds-e2e-report-missing-artifacts-'));
    const artifactDir = path.join(tempRoot, 'artifacts', 'e2e', 'lust-phase3-cadence-review');
    fs.mkdirSync(artifactDir, { recursive: true });

    fs.writeFileSync(
        path.join(artifactDir, 'cadence-review.json'),
        JSON.stringify({
            checkpoints: [
                {
                    key: 'reverseControl->illusion',
                    step: 1,
                    telegraphLabel: '混乱逆转',
                    telegraphHint: '反制: 停止冲刺，短步修正方向',
                    sharedRecoveryRemainingMs: 10200,
                    bridgeCount: 13,
                    bridgeLabel: '13-step dash/charmBolt bridge',
                    expectedReturnAttack: 'illusion',
                    expectedReturnLabel: '幻影风暴'
                }
            ]
        }, null, 2)
    );
    fs.writeFileSync(
        path.join(artifactDir, 'phase3-checkpoints.txt'),
        [
            '1. HUD telegraph 混乱逆转 -> shared recovery≈10.2s -> 13-step dash/charmBolt bridge -> 幻影风暴'
        ].join('\n')
    );
    fs.writeFileSync(
        path.join(artifactDir, 'shared-recovery-snapshot.json'),
        JSON.stringify({
            sharedRecoveryRemainingMs: 10200,
            breatherRemaining: 8,
            expectedReturnAttack: 'illusion',
            expectedReturnLabel: '幻影风暴',
            currentCheckpointKey: 'reverseControl->illusion',
            currentCheckpointStep: 1,
            checkpointExpectedReturns: {
                'reverseControl->illusion': {
                    attack: 'illusion',
                    label: '幻影风暴'
                }
            }
        }, null, 2)
    );

    const output = execFileSync('node', [path.join(repoRoot, 'scripts', 'e2e-report.mjs')], {
        cwd: tempRoot,
        encoding: 'utf8'
    });

    assert.match(
        output,
        /- Phase 3 汇总: match=1 \| drift=0[\s\S]*?\n  - artifact count: `3 artifacts ready`\n  - missing artifacts: `telegraph`\n  - evidence: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\)/,
        'e2e report should surface a dedicated missing-artifacts summary line when one cadence artifact is absent'
    );
    assert.doesNotMatch(
        output,
        /\[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should not render a telegraph evidence link when the telegraph artifact is missing'
    );
}

function testLustMirageDanceHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.ok(
        BOSSES.lust.phases.some(phase => Array.isArray(phase.attacks) && phase.attacks.includes('mirageDance')),
        'lust should add mirageDance into its phase-3 attack pool'
    );
    assert.match(
        source,
        /mirageDance:\s*'魅影连舞'/,
        'attack display names should expose the localized mirageDance label'
    );
    assert.match(
        source,
        /mirageDance:\s*'反制: 观察真身换位节奏，留翻滚躲最后逆转波'/,
        'mirageDance should advertise a dedicated counter hint'
    );
    assert.match(
        source,
        /mirageDance:\s*1600/,
        'mirageDance should define a counter window for the telegraph HUD'
    );
    assert.match(
        source,
        /SPECIAL:\s*\[[^\]]*'mirageDance'[^\]]*\]/,
        'mirageDance should be classified as a SPECIAL boss attack'
    );
}

function testBossMajorAttackBreatherHooks() {
    const source = loadGameSource();

    assert.match(
        source,
        /this\.lastCompletedAttack\s*=\s*null/,
        'Boss should track the last completed attack for pacing guards'
    );
    assert.match(
        source,
        /this\.currentAttack\s*=\s*this\._pickPhaseAttack\(attacks\);/,
        'Boss idle selector should route phase picks through a dedicated pacing helper'
    );
    assert.match(
        source,
        /_pickPhaseAttack\(attacks\)\s*{/,
        'Boss should expose a phase-attack picker helper'
    );
    assert.match(
        source,
        /const lastAttackWasMajor = MAJOR_BOSS_PHASE_ATTACKS\.has\(this\.lastCompletedAttack\);/,
        'Boss pacing helper should detect when the last completed attack was a major special'
    );
    assert.match(
        source,
        /const hasBreatherAttack = attacks\.some\(attack => !MAJOR_BOSS_PHASE_ATTACKS\.has\(attack\)\);/,
        'Boss pacing helper should only delay major specials when a non-major breather exists'
    );
    assert.match(
        source,
        /this\.lastCompletedAttack\s*=\s*this\.currentAttack;/,
        'Boss should persist the completed attack after finishing an attack'
    );
}

function testLustPhaseLocalCooldownHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.equal(
        BOSSES.lust.phases[2].phaseLocalCooldownMs.reverseControl,
        14000,
        'lust phase 3 should configure a local cooldown for reverseControl'
    );
    assert.equal(
        BOSSES.lust.phases[2].phaseLocalCooldownMs.illusion,
        15500,
        'lust phase 3 should configure a local cooldown for illusion'
    );
    assert.equal(
        BOSSES.lust.phases[2].phaseLocalCooldownMs.mirageDance,
        17500,
        'lust phase 3 should extend the mirageDance local cooldown again after the shared-recovery recheck still left the loopback too tight'
    );
    assert.match(
        source,
        /this\.phaseAttackCooldownExpires\s*=\s*\{\}/,
        'Boss should initialize phase-local cooldown expiry state'
    );
    assert.match(
        source,
        /const phaseLocalCooldownMs = phase && phase\.phaseLocalCooldownMs \? phase\.phaseLocalCooldownMs : \{\};/,
        'Boss selector should read optional phase-local cooldown metadata from the current phase'
    );
    assert.match(
        source,
        /const candidateCooldownExpiresAt = phaseLocalCooldownMs\[candidate\] > 0 \? \(this\.phaseAttackCooldownExpires\[candidate\] \|\| 0\) : 0;/,
        'Boss selector should look up expiry for candidate-specific phase-local cooldowns'
    );
    assert.match(
        source,
        /if \(candidateCooldownExpiresAt > now && attacks\.some\(attack => attack !== candidate\)\) \{/,
        'Boss selector should skip cooled-down attacks when another phase option exists'
    );
    assert.match(
        source,
        /const finishedAttackCooldownMs = phaseLocalCooldownMs\[this\.currentAttack\] \|\| 0;/,
        'Boss finish hook should resolve the configured cooldown for the completed attack'
    );
    assert.match(
        source,
        /this\.phaseAttackCooldownExpires\[this\.currentAttack\] = time \+ finishedAttackCooldownMs;/,
        'Boss finish hook should stamp cooldown expiry for completed attacks'
    );
}

function testLustPostMirageBreatherHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].postAttackBreatherGuards.reverseControl),
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 should block immediate major-special follow-ups after reverseControl when a breather exists'
    );
    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].postAttackBreatherGuards.illusion),
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 should block immediate major-special follow-ups after illusion when a breather exists'
    );
    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].postAttackBreatherGuards.mirageDance),
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 should block immediate major-special follow-ups after mirageDance when a breather exists'
    );
    assert.match(
        source,
        /const postAttackBreatherGuards = phase && phase\.postAttackBreatherGuards \? phase\.postAttackBreatherGuards : \{\};/,
        'Boss selector should read optional post-attack breather guard metadata from the current phase'
    );
    assert.match(
        source,
        /const blockedAfterLastAttack = Array\.isArray\(postAttackBreatherGuards\[this\.lastCompletedAttack\]\) \? postAttackBreatherGuards\[this\.lastCompletedAttack\] : null;/,
        'Boss selector should resolve the guard list for the last completed attack'
    );
    assert.match(
        source,
        /if \(blockedAfterLastAttack && blockedAfterLastAttack\.includes\(candidate\) && attacks\.some\(attack => !blockedAfterLastAttack\.includes\(attack\)\)\) \{\s*continue;\s*\}/,
        'Boss selector should skip guarded follow-ups when an unguarded breather remains in the phase pool'
    );
}

function testLustSharedMajorRecoveryHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.equal(
        BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial,
        10200,
        'lust phase 3 should stretch the shared recovery window for major specials one more time after the longer mirageDance loopback bridge plus the longer illusion, reverseControl, and mirageDance recoveries still leave the full phase-3 loop too eager to return to a major special'
    );
    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].sharedAttackRecoveryGroups.majorSpecial),
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 should group reverseControl, illusion, and mirageDance under the shared recovery guard'
    );
    assert.match(
        source,
        /this\.phaseAttackGroupRecoveryExpires\s*=\s*\{\}/,
        'Boss should initialize phase-level shared recovery expiry state'
    );
    assert.match(
        source,
        /const sharedAttackRecoveryMs = phase && phase\.sharedAttackRecoveryMs \? phase\.sharedAttackRecoveryMs : \{\};/,
        'Boss selector should read optional shared attack recovery metadata from the current phase'
    );
    assert.match(
        source,
        /const sharedAttackRecoveryGroups = phase && phase\.sharedAttackRecoveryGroups \? phase\.sharedAttackRecoveryGroups : \{\};/,
        'Boss selector should read optional shared attack recovery groups from the current phase'
    );
    assert.match(
        source,
        /const candidateSharedGroupKey = Object\.keys\(sharedAttackRecoveryGroups\)\.find\(groupKey => Array\.isArray\(sharedAttackRecoveryGroups\[groupKey\]\) && sharedAttackRecoveryGroups\[groupKey\]\.includes\(candidate\)\);/,
        'Boss selector should resolve whether a candidate belongs to a shared recovery group'
    );
    assert.match(
        source,
        /const sharedRecoveryExpiresAt = candidateSharedGroupKey \? \(this\.phaseAttackGroupRecoveryExpires\[candidateSharedGroupKey\] \|\| 0\) : 0;/,
        'Boss selector should look up the active shared recovery expiry for the candidate group'
    );
    assert.match(
        source,
        /if \(sharedRecoveryExpiresAt > now && attacks\.some\(attack => !sharedAttackRecoveryGroups\[candidateSharedGroupKey\]\.includes\(attack\)\)\) \{\s*continue;\s*\}/,
        'Boss selector should skip shared-recovery major specials when a lighter attack still exists'
    );
    assert.match(
        source,
        /const sharedAttackRecoveryMs = phase && phase\.sharedAttackRecoveryMs \? phase\.sharedAttackRecoveryMs : \{\};[\s\S]*?const sharedAttackRecoveryGroups = phase && phase\.sharedAttackRecoveryGroups \? phase\.sharedAttackRecoveryGroups : \{\};/,
        'Boss finish hook should load shared recovery metadata for the finished phase'
    );
    assert.match(
        source,
        /Object\.entries\(sharedAttackRecoveryGroups\)\.forEach\(\(\[groupKey,\s*groupAttacks\]\) => \{[\s\S]*?if \(!Array\.isArray\(groupAttacks\) \|\| !groupAttacks\.includes\(this\.currentAttack\)\) return;[\s\S]*?const sharedRecoveryMs = sharedAttackRecoveryMs\[groupKey\] \|\| 0;[\s\S]*?this\.phaseAttackGroupRecoveryExpires\[groupKey\] = time \+ sharedRecoveryMs;/,
        'Boss finish hook should stamp shared recovery expiry when a guarded major special completes'
    );
}

function testLustEightBreatherChainHooks() {
    const { BOSSES } = loadDataConstants();
    const source = loadGameSource();

    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].postMajorBreatherChain.triggerAttacks),
        ['reverseControl', 'illusion', 'mirageDance'],
        'lust phase 3 should define which major specials start the breather chain'
    );
    assert.deepEqual(
        Array.from(BOSSES.lust.phases[2].postMajorBreatherChain.breatherAttacks),
        ['charmBolt', 'dash'],
        'lust phase 3 should define the lighter attacks that can satisfy the breather chain'
    );
    assert.equal(
        BOSSES.lust.phases[2].postMajorBreatherChain.requiredCount,
        8,
        'lust phase 3 should require eight lighter attacks before the next major special'
    );
    assert.match(
        source,
        /this\.phaseBreatherChainRemaining\s*=\s*0/,
        'Boss should initialize the phase breather-chain counter'
    );
    assert.match(
        source,
        /const postMajorBreatherChain = phase && phase\.postMajorBreatherChain \? phase\.postMajorBreatherChain : null;/,
        'Boss selector should read optional post-major breather-chain metadata from the current phase'
    );
    assert.match(
        source,
        /const triggerAttacks = postMajorBreatherChain && Array\.isArray\(postMajorBreatherChain\.triggerAttacks\) \? postMajorBreatherChain\.triggerAttacks : \[\];/,
        'Boss selector should resolve the trigger attacks for a pending breather chain'
    );
    assert.match(
        source,
        /const breatherAttacks = postMajorBreatherChain && Array\.isArray\(postMajorBreatherChain\.breatherAttacks\) \? postMajorBreatherChain\.breatherAttacks : \[\];/,
        'Boss selector should resolve the lighter attacks that satisfy the breather chain'
    );
    assert.match(
        source,
        /const requiredBreatherCount = postMajorBreatherChain && postMajorBreatherChain\.requiredCount > 0 \? postMajorBreatherChain\.requiredCount : 0;/,
        'Boss selector should resolve the required breather count from phase metadata'
    );
    assert.match(
        source,
        /if \(this\.phaseBreatherChainRemaining > 0 && triggerAttacks\.includes\(candidate\) && breatherAttacks\.length > 0 && attacks\.some\(attack => breatherAttacks\.includes\(attack\)\)\) \{\s*continue;\s*\}/,
        'Boss selector should block major-special follow-ups while lighter breather picks are still owed'
    );
    assert.match(
        source,
        /if \(requiredBreatherCount > 0 && triggerAttacks\.includes\(this\.currentAttack\)\) \{\s*this\.phaseBreatherChainRemaining = requiredBreatherCount;\s*\} else if \(this\.phaseBreatherChainRemaining > 0 && breatherAttacks\.includes\(this\.currentAttack\)\) \{\s*this\.phaseBreatherChainRemaining = Math\.max\(0, this\.phaseBreatherChainRemaining - 1\);\s*\}/,
        'Boss finish hook should start and consume the breather chain around major specials and lighter follow-ups'
    );
    assert.match(
        source,
        /this\.phaseBreatherChainRemaining\s*=\s*0;\s*\n\s*const phase = this\.config\.phases\[phaseIndex\];/,
        'Boss should reset the pending breather chain when entering a new phase'
    );
}

function testReadmeLustPhaseLocalCooldowns() {
    const source = loadReadmeSource();

    assert.match(
        source,
        /`魅惑女妖` 末阶段还会继续拉高 `reverseControl`、`illusion` 与 `mirageDance` 的 phase-local 冷却/,
        'README should document the completed lust phase-local cooldown trio'
    );
    assert.match(
        source,
        /`mirageDance` 的 phase-local 冷却这轮也会继续再拉长一档，让完整循环后的下一轮 `reverseControl` 更晚回切/,
        'README should document the newest mirageDance cooldown follow-up after the shared-recovery recheck'
    );
}

function testLustMirageDanceExecutorHooks() {
    const source = loadGameSource();

    assert.match(
        source,
        /else if \(atk === 'mirageDance'\)/,
        'Boss special attack executor should expose a mirageDance branch'
    );
    assert.match(
        source,
        /this\.attackData\.beatCount\s*=\s*3/,
        'mirageDance should initialize a three-beat dance cadence'
    );
    assert.match(
        source,
        /this\.attackData\.beatDelays\s*=\s*\[\s*240,\s*340,\s*460\s*\]/,
        'mirageDance should define an explicit beat-delay ladder for phase-3 cadence tuning'
    );
    assert.match(
        source,
        /this\.attackData\.finisherDelayMs\s*=\s*320/,
        'mirageDance should define a longer settle delay before the finisher starts'
    );
    assert.match(
        source,
        /this\.attackData\.finisherRecoveryMs\s*=\s*760/,
        'mirageDance should lengthen its explicit post-collapse recovery window again after the longer loopback bridge, shared recovery, illusion recovery, and reverseControl recovery follow-ups still leave the next reverseControl too eager'
    );
    assert.match(
        source,
        /const collapseMs = 760/,
        'mirageDance should define a longer reverse-wave collapse duration'
    );
    assert.match(
        source,
        /const totalFinisherMs = expandMs \+ collapseMs \+ this\.attackData\.finisherRecoveryMs;/,
        'mirageDance should keep the boss in the attack state through the post-collapse recovery window'
    );
    assert.match(
        source,
        /this\.attackData\.finisherLockX\s*=\s*player\.x/,
        'mirageDance finisher should snapshot the player X position when the reverse wave starts'
    );
    assert.match(
        source,
        /this\.attackData\.finisherLockY\s*=\s*player\.y/,
        'mirageDance finisher should snapshot the player Y position when the reverse wave starts'
    );
    assert.match(
        source,
        /sx \+ \(this\.attackData\.finisherLockX - sx\) \* t/,
        'mirageDance reverse-wave collapse should aim at the locked X position'
    );
    assert.match(
        source,
        /sy \+ \(this\.attackData\.finisherLockY - sy\) \* t/,
        'mirageDance reverse-wave collapse should aim at the locked Y position'
    );
    assert.match(
        source,
        /player\.applyReverseControl\(1800\)/,
        'mirageDance finisher should apply a short reverse-control punish on hit'
    );
}

function testLustMirageRecoveryWindowFollowup() {
    const source = loadGameSource();

    assert.match(
        source,
        /this\.attackData\.finisherRecoveryMs\s*=\s*760/,
        'mirageDance follow-up tuning should lock the newest 760ms post-collapse recovery window'
    );
}

function testLustSpecialRecoveryHooks() {
    const source = loadGameSource();

    assert.match(
        source,
        /} else if \(atk === 'reverseControl'\) \{[\s\S]*?const recoveryMs = 1320;/,
        'reverseControl should lengthen its explicit post-collapse recovery window again after the shared-recovery, mirage-recovery, and loopback-bridge follow-ups still left the next illusion too close'
    );
    assert.match(
        source,
        /} else if \(atk === 'reverseControl'\) \{[\s\S]*?if \(elapsed >= 1400 && !this\.attackData\.recoveryStarted\) \{[\s\S]*?this\.attackData\.recoveryStarted = true;/,
        'reverseControl should start a recovery phase after the projectile collapse resolves'
    );
    assert.match(
        source,
        /} else if \(atk === 'reverseControl'\) \{[\s\S]*?if \(elapsed >= 1400 \+ recoveryMs\) \{[\s\S]*?this\._finishAttack\(time\);/,
        'reverseControl should stay in attack state through the recovery window before finishing'
    );
    assert.match(
        source,
        /} else if \(atk === 'illusion'\) \{[\s\S]*?const recoveryMs = 1680;/,
        'illusion should lengthen its explicit post-despawn recovery window again after the reverseControl recovery, mirage recovery, shared recovery, and loopback-bridge follow-ups still left the next mirageDance too close'
    );
    assert.match(
        source,
        /} else if \(atk === 'illusion'\) \{[\s\S]*?if \(elapsed >= 3000 && !this\.attackData\.recoveryStarted\) \{[\s\S]*?this\.attackData\.recoveryStarted = true;/,
        'illusion should start a recovery phase after clones disperse'
    );
    assert.match(
        source,
        /} else if \(atk === 'illusion'\) \{[\s\S]*?if \(elapsed >= 3000 \+ recoveryMs\) \{[\s\S]*?this\._finishAttack\(time\);/,
        'illusion should stay in attack state through the recovery window before finishing'
    );
}

function testLustIllusionRecoveryWindowFollowup() {
    const source = loadGameSource();

    assert.match(
        source,
        /} else if \(atk === 'illusion'\) \{[\s\S]*?const recoveryMs = 1680;/,
        'illusion follow-up tuning should lock the newest 1680ms post-despawn recovery window'
    );
}

function testReadmeLustPostMirageSpacing() {
    const source = loadReadmeSource();

    assert.match(
        source,
        /`魅惑女妖` 末阶段在 `mirageDance` 收尾后若仍有 `charmBolt` \/ `dash` 可选，会先插入额外呼吸段/,
        'README should document the guaranteed post-mirage breather when lighter attacks are available'
    );
    assert.match(
        source,
        /`魅影连舞` 第三拍后也会保留更长的 settle 窗口/,
        'README should document the longer mirageDance settle window'
    );
    assert.match(
        source,
        /逆转波也会用更长的收束时长回卷/,
        'README should document the longer mirageDance reverse-wave collapse'
    );
    assert.match(
        source,
        /phase 3 攻击池里的 `charmBolt` \/ `dash` 权重再往上抬/,
        'README should document the extra phase-3 breather weighting'
    );
    assert.match(
        source,
        /共享 recovery 与八轻压守卫之外也会继续提高 `charmBolt` \/ `dash` 的占比/,
        'README should document the additional phase-3 light-pressure weighting pass'
    );
    assert.match(
        source,
        /逆转波收尾后也会多留一小段 recovery 空档/,
        'README should document the explicit post-mirage recovery window'
    );
    assert.match(
        source,
        /逆转波收尾后的 recovery 空档这轮也会在更长的 `mirageDance -> reverseControl` 定向轻压过桥、更长的共享 `majorSpecial` recovery window、更长的 `illusion` recovery 空档与更长的 `reverseControl` recovery 空档都落地后继续再拉长一档，让下一轮 `reverseControl` 仍再晚半拍回切/,
        'README should document the newest mirageDance recovery tuning pass after the loopback-bridge, shared-recovery, illusion-recovery, and reverseControl-recovery follow-ups'
    );
}

function testReadmeLustSpecialRecovery() {
    const source = loadReadmeSource();

    assert.match(
        source,
        /`reverseControl` 回卷收束后也会多留一小段 recovery 空档/,
        'README should document the reverseControl recovery window'
    );
    assert.match(
        source,
        /`reverseControl` 的 recovery 空档这轮会在更长的 `mirageDance` recovery 空档、共享 `majorSpecial` recovery window 与更长的 `mirageDance -> reverseControl` 定向轻压过桥都落地后继续再拉长一档，让下一段 `illusion` 再继续晚半拍回切/,
        'README should document the newest reverseControl recovery tuning pass after the mirage-recovery, shared-recovery, and loopback-bridge follow-ups'
    );
    assert.match(
        source,
        /`illusion` 幻身散场后也会多留一小段 recovery 空档/,
        'README should document the illusion recovery window'
    );
    assert.match(
        source,
        /`illusion` 的 recovery 空档这轮会在更长的 `reverseControl` recovery 空档、更长的 `mirageDance` recovery 空档、共享 `majorSpecial` recovery window 与更长的 `mirageDance -> reverseControl` 定向轻压过桥都落地后继续再拉长一档，让下一段 `mirageDance` 再继续晚半拍回切/,
        'README should document the newest illusion recovery tuning pass after the reverseControl recovery, mirage recovery, shared recovery, and loopback-bridge follow-ups'
    );
    assert.match(
        source,
        /`reverseControl` \/ `illusion` 结束后若仍有 `charmBolt` \/ `dash` 可选，也会先插入额外呼吸段/,
        'README should document the new reverseControl and illusion breather guards'
    );
}

function testReadmeLustSharedMajorRecovery() {
    const source = loadReadmeSource();

    assert.match(
        source,
        /phase 3 的 `reverseControl` \/ `illusion` \/ `mirageDance` 之间还会追加一段共享 recovery guard/,
        'README should document the shared major-special recovery guard'
    );
    assert.match(
        source,
        /共享 `majorSpecial` recovery window 这轮也会在更长的 `mirageDance` phase-local cooldown 落地后继续再拉长一档，让下一段 `reverseControl` \/ `illusion` \/ `mirageDance` 再继续晚半拍回切/,
        'README should document the newest shared major-special recovery extension after the longer mirageDance phase-local cooldown follow-up'
    );
    assert.match(
        source,
        /共享 `majorSpecial` recovery window 这轮也会在更长的 `mirageDance` recovery 空档落地后继续再拉长一档，让下一段 `reverseControl` \/ `illusion` \/ `mirageDance` 再继续晚半拍回切/,
        'README should document the newest shared major-special recovery extension after the longer mirageDance recovery-spacing follow-up'
    );
    assert.match(
        source,
        /共享 `majorSpecial` recovery window 这轮也会在更长的 `mirageDance -> reverseControl` 定向轻压过桥落地后继续再拉长一档，让下一段 `reverseControl` \/ `illusion` \/ `mirageDance` 再继续晚半拍回切/,
        'README should document the newest shared major-special recovery extension after the longer mirageDance loopback bridge follow-up'
    );
    assert.match(
        source,
        /共享 `majorSpecial` recovery window 这轮也会在更长的 `mirageDance -> reverseControl` 定向轻压过桥、更长的 `illusion` recovery 空档、更长的 `reverseControl` recovery 空档与更长的 `mirageDance` recovery 空档都落地后继续再拉长一档，让 loopback 轻压过桥结束后的下一段 `reverseControl` \/ `illusion` \/ `mirageDance` 再继续晚半拍回切/,
        'README should document the newest shared major-special recovery extension after the mirage loopback bridge plus the illusion, reverseControl, and mirageDance recovery windows all landed'
    );
    assert.match(
        source,
        /`charmBolt` \/ `dash` 的占比也会继续再往上抬一档/,
        'README should document the latest phase-3 light-pressure weighting pass'
    );
    assert.match(
        source,
        /至少串入八段轻压后才允许回到 `reverseControl` \/ `illusion` \/ `mirageDance`/,
        'README should document the phase-3 eight-breather chain after major specials'
    );
    assert.match(
        source,
        /在更长的 `reverseControl` recovery 之后，`reverseControl` 与 `illusion` 之间会继续再补一小段 `charmBolt` \/ `dash` 定向轻压过桥/,
        'README should document the extra post-reverseControl bridge before illusion'
    );
    assert.match(
        source,
        /在 `illusion` 与 `mirageDance` 之间也会继续再补更长的一整段 `charmBolt` \/ `dash` 定向轻压过桥/,
        'README should document the newest directed bridge extension between illusion and mirageDance'
    );
    assert.match(
        source,
        /并再多压一组 `charmBolt` \/ `dash`，让 `mirageDance` 再继续晚半拍回切/,
        'README should document the extra charmBolt-dash pair added before mirageDance'
    );
    assert.match(
        source,
        /在 `mirageDance` 与下一轮 `reverseControl` 之间也会继续再补更长的一整段 `charmBolt` \/ `dash` 定向轻压过桥/,
        'README should document the newly extended loopback bridge between mirageDance and the next reverseControl loop'
    );
    assert.match(
        source,
        /并再多压六组 `dash` \/ `charmBolt`/,
        'README should document the sixth extra dash-charmBolt pair added to the mirageDance loopback bridge after the shared-recovery recheck'
    );
}

function testReadmeLustCadenceReportChecklist() {
    const source = loadReadmeSource();

    assert.match(
        source,
        /`evidence` 短句，并把 `\[review] \[checkpoints] \[recovery] \[telegraph]` 四组入口一起钉在首屏，让无 drift 录屏也能直接点开完整附件集合/,
        'README should document the dedicated evidence short line for no-drift phase-3 summaries'
    );
    assert.match(
        source,
        /`current recovery checkpoint` 与 `telegraphLabel -> expectedReturnLabel` 改写成单独的 `recovery` 短句，并把 live `telegraphHint`、`counterWindowMs` \/ `counterWindowRatio`、`counterWindowEntryCue`、`counterWindowClosureCue`、`counterWindowSpanCue`、`counterWindowCoverageCue`、`telegraphDurationMs`、`counterWindowDeltaMs` 与 `counterWindowTailPhase` 压进独立 `telegraph` 短句/,
        'README should document that the phase-3 report now splits the summary into dedicated recovery and telegraph short lines'
    );
    assert.match(
        source,
        /再补一段 `artifact count` 短句，把 `4 artifacts ready` 直接钉进 summary，减少录屏排查前先逐个点开附件确认的往返/,
        'README should document the dedicated artifact count short line for phase-3 summary evidence readiness'
    );
    assert.match(
        source,
        /若有附件缺失，还会再补一段 `missing artifacts` 短句，把缺失的 `\[review] \[checkpoints] \[recovery] \[telegraph]` 名称直接钉进 summary/,
        'README should document the dedicated missing-artifacts short line for degraded phase-3 bundles'
    );
    assert.match(
        source,
        /drift-only mini checklist；完整 checkpoint 索引则继续逐条附上/,
        'README should continue documenting the dedicated drift-only mini checklist section'
    );
    assert.match(
        source,
        /`review checkpoint #n` 索引短注记、bridge\/loopback checkpoint alias short note、`dash\/charmBolt` bridge count short note、`bridgeTimeline` index short note、`counterWindowMs` short note、`counterWindowRatio` short note、`counterWindowDeltaMs` short note、`counterWindowEntryCue` short note、`counterWindowSpanCue` short note、`counterWindowTailOffsetMs` short note、`counterWindowTailPhase` short note、`counterWindowClosureCue` short note、`counterWindowCoverageCue` short note 与 `telegraphDurationMs` short note/,
        'README should document the counterWindowMs, counterWindowRatio, counterWindowDeltaMs, counterWindowEntryCue, counterWindowSpanCue, counterWindowTailOffsetMs, counterWindowTailPhase, counterWindowClosureCue, counterWindowCoverageCue and telegraphDurationMs short notes in the drift-only mini checklist'
    );
}

function testKeyboardAimState() {
    const aimRight = resolveKeyboardAimState({
        up: false,
        down: false,
        left: false,
        right: true,
        fallbackAngle: Math.PI / 2
    });
    assert.equal(aimRight.hasInput, true, 'single-axis keyboard aim should be active');
    assert.equal(aimRight.x, 1, 'right aim should produce positive X');
    assert.equal(aimRight.y, 0, 'right aim should not move Y');
    assert.equal(aimRight.angle, 0, 'right aim should face angle 0');

    const aimDiagonal = resolveKeyboardAimState({
        up: true,
        down: false,
        left: true,
        right: false,
        fallbackAngle: 0
    });
    assert.equal(aimDiagonal.hasInput, true, 'diagonal aim should be active');
    assert.equal(aimDiagonal.x.toFixed(3), (-0.707).toFixed(3), 'diagonal aim should normalize X');
    assert.equal(aimDiagonal.y.toFixed(3), (-0.707).toFixed(3), 'diagonal aim should normalize Y');
    assert.equal(
        aimDiagonal.angle.toFixed(3),
        (-2.356).toFixed(3),
        'diagonal aim should preserve the existing angle-based combat model'
    );

    const aimCancelled = resolveKeyboardAimState({
        up: true,
        down: true,
        left: false,
        right: false,
        fallbackAngle: Math.PI / 4
    });
    assert.equal(aimCancelled.hasInput, false, 'opposing aim keys should cancel on the same axis');
    assert.equal(
        aimCancelled.angle.toFixed(3),
        (Math.PI / 4).toFixed(3),
        'empty aim input should preserve the previous facing angle'
    );
}

function testAimDirectionLabel() {
    assert.equal(typeof formatAimDirectionLabel, 'function', 'aim direction label helper should be exported');
    assert.equal(formatAimDirectionLabel(0), '右', '0 radians should map to right');
    assert.equal(formatAimDirectionLabel(Math.PI / 4), '右下', 'screen-space positive diagonal should map to down-right');
    assert.equal(formatAimDirectionLabel(Math.PI / 2), '下', 'positive Y should map to down');
    assert.equal(formatAimDirectionLabel(-Math.PI / 2), '上', 'negative Y should map to up');
    assert.equal(formatAimDirectionLabel(Math.PI), '左', 'pi radians should map to left');
}

function testKeyboardAimSourceHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\._aimKeys = scene\.input\.keyboard\.addKeys\('I,J,K,L'\);/,
        'Player should register a dedicated IJKL aim key set'
    );
    assert.match(
        source,
        /resolveKeyboardAimState\(\s*{[\s\S]*?up:\s*this\._aimKeys\.I\.isDown[\s\S]*?right:\s*this\._aimKeys\.L\.isDown[\s\S]*?fallbackAngle:\s*this\.facingAngle[\s\S]*?}\s*\)/,
        'Player.update should derive facing from keyboard aim state with last-angle fallback'
    );
    assert.ok(
        !source.includes('this.facingAngle = Phaser.Math.Angle.Between(this.x, this.y, worldX, worldY);'),
        'Player.update should no longer overwrite facingAngle from the pointer each frame'
    );
    assert.match(
        source,
        /this\.input\.keyboard\.on\('keydown-U',[\s\S]*?this\.player\.tryAttack\(\)/,
        'keyboard attack should move off J so J can remain a pure aim key'
    );
    assert.match(
        source,
        /this\.input\.keyboard\.on\('keydown-O',[\s\S]*?this\.player\.trySpecialAttack\(\)/,
        'keyboard special attack should move off K so K can remain a pure aim key'
    );
    assert.ok(
        !source.includes("this.input.keyboard.on('keydown-J', () => this.player.tryAttack());"),
        'J should no longer trigger attacks directly once it becomes a left-aim key'
    );
    assert.ok(
        !source.includes("this.input.keyboard.on('keydown-K', () => this.player.trySpecialAttack());"),
        'K should no longer trigger specials directly once it becomes a down-aim key'
    );
}

function testKeyboardControlReadabilityHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\.aimText = this\.add\.text\(/,
        'HUD should allocate a dedicated current-aim text line'
    );
    assert.match(
        source,
        /this\.aimText\.setText\('当前瞄准: ' \+ formatAimDirectionLabel\(player\.facingAngle\) \+ ' \[IJKL\]'\)/,
        'HUD should display the live keyboard aim direction with the IJKL reminder'
    );
    assert.match(
        source,
        /当前瞄准会显示在 HUD 左下角/,
        'help overlay should teach players where to read the live aim direction'
    );
    assert.match(
        source,
        /若冷却转好后仍差体力，则会预告“0\.3s后差8体\/0\.5s”/,
        'help overlay should explain the post-cooldown stamina-gap preview'
    );
    assert.match(
        source,
        /若正处于翻滚锁定，则会继续预告“翻滚中 -> 就绪”这类翻滚后的下一状态；当任一动作刚切进“就绪”时，只有对应那一项会短促闪亮一下/,
        'help overlay should explain the post-roll readiness preview during dodge lockout'
    );
    assert.match(
        source,
        /若 Boss 战切到专用 HUD，则顶部血条会收紧，但左下角当前瞄准 \/ 武器 \/ 行动行与右下快捷栏仍保持稳定底边留白/,
        'help overlay should explain that boss layout keeps the bottom combat lane anchored'
    );
    assert.match(
        source,
        /点击背包消耗品会自动装入快捷栏首个空位/,
        'help overlay should explain the backpack-click auto-fill rule'
    );
    assert.match(
        source,
        /快捷栏已满时会覆盖 1 号槽位/,
        'help overlay should explain the full-quickbar overwrite fallback'
    );
    assert.match(
        source,
        /Q \/ E  —  切换武器/,
        'help overlay should keep weapon-switch guidance visible for keyboard-only play'
    );
    assert.match(
        source,
        /Space  —  闪避翻滚（无敌帧）/,
        'help overlay should keep the dodge guidance visible for keyboard-only play'
    );
}

function testQuickSlotAutoAssignIndex() {
    assert.equal(typeof getQuickSlotAutoAssignIndex, 'function', 'quick-slot auto-assign helper should be exported');
    assert.equal(
        getQuickSlotAutoAssignIndex([null, 'hpPotion', 'staminaPotion', null]),
        0,
        'auto-assign should pick slot 1 when it is empty'
    );
    assert.equal(
        getQuickSlotAutoAssignIndex(['hpPotion', null, 'staminaPotion', null]),
        1,
        'auto-assign should pick the first empty slot from left to right'
    );
    assert.equal(
        getQuickSlotAutoAssignIndex(['hpPotion', 'staminaPotion', 'cleanseTonic', 'berserkerOil']),
        0,
        'auto-assign should fall back to slot 1 when no empty slot remains'
    );
}

function testQuickSlotAutoAssignNotice() {
    assert.equal(typeof buildQuickSlotAutoAssignNotice, 'function', 'quick-slot auto-assign notice helper should be exported');
    assert.equal(
        buildQuickSlotAutoAssignNotice(0),
        '快捷栏1：+道具',
        'auto-assign notice should keep a slot-led plus-marker fallback when the assigned label is unavailable'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { assignedItemName: '生命药水' }),
        '快捷栏1：+生命',
        'auto-assign notice should derive a compact fallback label from the assigned item name when no handcrafted short label exists'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { assignedItemName: '圣疗秘藏浓缩生命药水' }),
        '快捷栏1：+圣疗秘…',
        'auto-assign notice should clamp overlong name-derived fallback labels on the non-overwrite path'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, {
            assignedItemName: '圣疗秘藏浓缩生命药水',
            measureLabelWidth: (label) => {
                const widths = {
                    '圣': 10,
                    '疗': 10,
                    '秘': 10,
                    '藏': 10,
                    '浓': 14,
                    '缩': 14,
                    '生': 14,
                    '命': 14,
                    '…': 8
                };
                return widths[label] || 14;
            }
        }),
        '快捷栏1：+圣疗秘藏…',
        'auto-assign notice should allow runtime measurement hooks to keep additional narrow glyphs before truncation'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { assignedItemName: 'HP恢复药剂' }),
        '快捷栏1：+HP恢复',
        'auto-assign notice should preserve extra narrow glyphs when clamping mixed-width fallback labels'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(3, { assignedItemKey: 'staminaPotion' }),
        '快捷栏4：+ST',
        'auto-assign notice should compress the non-overwrite path into a slot-led plus-marker shortform when the assigned label is known'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { didOverwrite: true, replacedItemKey: 'hpPotion' }),
        '快捷栏1：替换 HP',
        'auto-assign notice should collapse overwrite-only fallback copy into a slot-led shortform'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { didOverwrite: true, assignedItemKey: 'hpPotion', replacedItemKey: 'hpPotion' }),
        '快捷栏1：同类 HP',
        'auto-assign notice should compress same-label overwrite copy into a slot-led shortform'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, { didOverwrite: true, assignedItemKey: 'staminaPotion', replacedItemKey: 'hpPotion' }),
        '快捷栏1：HP→ST',
        'auto-assign notice should show overwrite direction in the shortest slot-led form'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(1, { didOverwrite: true, assignedItemName: '净化药剂', replacedItemName: '狂战油' }),
        '快捷栏2：狂战→净化',
        'auto-assign notice should reuse the name-derived fallback labels on overwrite paths when neither item has a handcrafted short label'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(1, { didOverwrite: true, assignedItemName: 'ST恢复药剂', replacedItemName: 'HP恢复药剂' }),
        '快捷栏2：HP恢复→ST恢复',
        'auto-assign notice should preserve extra narrow glyphs on both sides of mixed-width overwrite copy'
    );
    assert.equal(
        buildQuickSlotAutoAssignNotice(1, {
            didOverwrite: true,
            assignedItemName: '神圣净界长效净化药剂',
            replacedItemName: '古代狂怒战纹狂战油'
        }),
        '快捷栏2：古代狂…→神圣净…',
        'auto-assign notice should clamp overlong name-derived fallback labels on both sides of overwrite copy'
    );

    let repeatedGlyphMeasureCalls = 0;
    assert.equal(
        buildQuickSlotAutoAssignNotice(0, {
            didOverwrite: true,
            assignedItemName: '回回回回回回药剂',
            replacedItemName: '回回回回回回药剂',
            measureLabelWidth: (label) => {
                repeatedGlyphMeasureCalls += 1;
                return label === '回' ? 12 : 16;
            }
        }),
        '快捷栏1：同类 回回回回…',
        'auto-assign notice should keep the same overwrite shortform when runtime measurement is used on repeated glyph labels'
    );
    assert.equal(
        repeatedGlyphMeasureCalls,
        1,
        'auto-assign notice should cache repeated measured glyph widths across both sides of a single overwrite toast'
    );
}

function testQuickSlotAutoAssignResult() {
    const { ITEMS } = loadDataConstants();
    assert.equal(typeof buildQuickSlotAutoAssignResult, 'function', 'quick-slot auto-assign result helper should be exported');
    assert.deepEqual(
        buildQuickSlotAutoAssignResult([null, 'berserkerOil', null, null], 'cleanseTonic', ITEMS),
        {
            slotIndex: 0,
            didOverwrite: false,
            replacedItemKey: null,
            assignedItemKey: 'cleanseTonic',
            assignedItemName: '净化药剂',
            replacedItemName: '',
            nextQuickSlots: ['cleanseTonic', 'berserkerOil', null, null],
            notice: '快捷栏1：+净化'
        },
        'auto-assign result helper should fill the first empty slot and reuse the shared notice contract'
    );
    assert.deepEqual(
        buildQuickSlotAutoAssignResult(['berserkerOil', 'hpPotion', 'staminaPotion', 'cleanseTonic'], 'cleanseTonic', ITEMS),
        {
            slotIndex: 0,
            didOverwrite: true,
            replacedItemKey: 'berserkerOil',
            assignedItemKey: 'cleanseTonic',
            assignedItemName: '净化药剂',
            replacedItemName: '狂战油',
            nextQuickSlots: ['cleanseTonic', 'hpPotion', 'staminaPotion', 'cleanseTonic'],
            notice: '快捷栏1：狂战→净化'
        },
        'auto-assign result helper should preserve the slot-1 overwrite fallback and reuse the shared notice contract'
    );
}

function testCombatActionHudSummary() {
    assert.equal(typeof buildCombatActionHudSummary, 'function', 'combat action HUD helper should be exported');
    assert.equal(
        buildCombatActionHudSummary({
            isDodging: true,
            dodgeLockoutMs: 300,
            dodgePostLockoutCooldownMs: 700,
            attackCooldownMs: 100,
            specialCooldownMs: 500,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 25,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 翻滚中 -> 就绪  特攻 O: 翻滚中 -> 0.2s后差12体/0.8s  闪避 Space: 翻滚中 -> 0.7s后差5体/0.3s',
        'combat action HUD helper should preview each action state after dodge lockout ends instead of collapsing everything into a generic roll label'
    );
    assert.equal(
        buildCombatActionHudSummary({
            isDodging: true,
            dodgeLockoutMs: 300,
            dodgePostLockoutCooldownMs: 700,
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 25,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 翻滚中 -> 差15体/1.0s  特攻 O: 翻滚中 -> 差10体/0.7s  闪避 Space: 翻滚中 -> 0.7s后差5体/0.3s',
        'combat action HUD helper should keep the post-roll stamina-gap preview visible while dodge lockout is still active'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 就绪  特攻 O: 就绪  闪避 Space: 就绪',
        'combat action HUD helper should show all three actions as ready when cooldowns are clear and stamina is sufficient'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 320,
            specialCooldownMs: 1080,
            dodgeCooldownMs: 640,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 0.3s  特攻 O: 1.1s  闪避 Space: 0.6s',
        'combat action HUD helper should format short cooldown seconds for unreadied actions'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 8,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 差2体/0.1s  特攻 O: 差12体/0.8s  闪避 Space: 差17体/1.1s',
        'combat action HUD helper should expose exact stamina gaps plus a short natural-recovery ETA for stamina-gated actions'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 8,
            staminaRegenPerSecond: 0,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 差2体  特攻 O: 差12体  闪避 Space: 差17体',
        'combat action HUD helper should keep the old stamina-gap fallback when regen timing is unavailable'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 300,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 8,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 0.3s  特攻 O: 差12体/0.8s  闪避 Space: 差17体/1.1s',
        'combat action HUD helper should keep the plain cooldown label when cooldown time already covers the stamina gap'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 300,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 就绪  特攻 O: 0.3s后差6体/0.4s  闪避 Space: 差15体/1.0s',
        'combat action HUD helper should preview the remaining stamina gap after cooldown ends when stamina recovery still lags behind'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 300,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 0,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        '普攻 U: 就绪  特攻 O: 0.3s后差10体  闪避 Space: 差15体',
        'combat action HUD helper should keep a no-ETA fallback when cooldown ends before enough stamina is available and regen timing is unknown'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            specialStatusLabel: '借势'
        }),
        '普攻 U: 就绪  特攻 O: 借势 就绪  闪避 Space: 就绪',
        'combat action HUD helper should surface a short special-status label when a temporary combat buff is active'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            attackStatusLabel: '回体+4',
            specialStatusLabel: '借势待闪'
        }),
        '普攻 U: 回体+4 就绪  特攻 O: 借势待闪 就绪  闪避 Space: 就绪',
        'combat action HUD helper should keep shrine route identity visible even before the next proc window opens'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            attackStatusLabel: '连斩-18%',
            dodgeStatusLabel: '游步-20%/-18%'
        }),
        '普攻 U: 连斩-18% 就绪  特攻 O: 就绪  闪避 Space: 游步-20%/-18% 就绪',
        'combat action HUD helper should keep combat-discipline shrine identities visible on the attack and dodge rows'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            specialStatusLabel: '迅击-22%',
            dodgeStatusLabel: '复苏+35%'
        }),
        '普攻 U: 就绪  特攻 O: 迅击-22% 就绪  闪避 Space: 复苏+35% 就绪',
        'combat action HUD helper should keep prayer-shrine cooldown and stamina identities visible on the special and dodge rows'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            specialStatusLabel: '迅击就绪',
            dodgeStatusLabel: '复苏+35%'
        }),
        '普攻 U: 就绪  特攻 O: 迅击就绪 就绪  闪避 Space: 复苏+35% 就绪',
        'combat action HUD helper should support a brief prayer payoff label when the special row truly becomes ready'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            dodgeStatusLabel: '复苏就绪'
        }),
        '普攻 U: 就绪  特攻 O: 就绪  闪避 Space: 复苏就绪 就绪',
        'combat action HUD helper should support a brief prayer payoff label when natural stamina regen restores dodge readiness'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            dodgeStatusLabel: '游步就绪'
        }),
        '普攻 U: 就绪  特攻 O: 就绪  闪避 Space: 游步就绪 就绪',
        'combat action HUD helper should support a brief combat-discipline payoff label when dodge truly becomes ready'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            attackStatusLabel: '连斩就绪'
        }),
        '普攻 U: 连斩就绪 就绪  特攻 O: 就绪  闪避 Space: 就绪',
        'combat action HUD helper should support a brief combat-discipline payoff label when attack truly becomes ready'
    );
    assert.equal(
        buildCombatActionHudSummary({
            isDodging: true,
            dodgeLockoutMs: 300,
            dodgePostLockoutCooldownMs: 700,
            attackCooldownMs: 100,
            specialCooldownMs: 500,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 25,
            dodgeStaminaCost: 25,
            specialStatusLabel: '迅击-22%',
            dodgeStatusLabel: '复苏+35%'
        }),
        '普攻 U: 翻滚中 -> 就绪  特攻 O: 翻滚中 -> 迅击-22% 0.2s后差12体/0.8s  闪避 Space: 翻滚中 -> 复苏+35% 0.7s后差5体/0.3s',
        'combat action HUD helper should preserve prayer-shrine labels while showing the post-roll preview state'
    );
    assert.equal(
        buildCombatActionHudSummary({
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25,
            specialStatusLabel: '借势1.6s'
        }),
        '普攻 U: 就绪  特攻 O: 借势1.6s 就绪  闪避 Space: 就绪',
        'combat action HUD helper should surface the remaining post-dodge empower window instead of a bare shrine tag'
    );
}

function testCombatActionReadiness() {
    assert.equal(typeof buildCombatActionReadiness, 'function', 'combat action readiness helper should be exported');
    assert.deepEqual(
        buildCombatActionReadiness({
            isDodging: true,
            dodgeLockoutMs: 300,
            dodgePostLockoutCooldownMs: 700,
            attackCooldownMs: 0,
            specialCooldownMs: 0,
            dodgeCooldownMs: 0,
            stamina: 60,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        { attack: false, special: false, dodge: false },
        'combat action readiness helper should keep all actions blocked while dodge lockout is active'
    );
    assert.deepEqual(
        buildCombatActionReadiness({
            attackCooldownMs: 0,
            specialCooldownMs: 300,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        { attack: true, special: false, dodge: false },
        'combat action readiness helper should distinguish currently ready actions from cooldown- or stamina-blocked actions'
    );
}

function testCombatActionHudSegments() {
    assert.equal(typeof buildCombatActionHudSegments, 'function', 'combat action HUD segment helper should be exported');
    assert.deepEqual(
        buildCombatActionHudSegments({
            attackCooldownMs: 0,
            specialCooldownMs: 300,
            dodgeCooldownMs: 0,
            stamina: 10,
            staminaRegenPerSecond: 15,
            attackStaminaCost: 10,
            specialStaminaCost: 20,
            dodgeStaminaCost: 25
        }),
        [
            { key: 'attack', text: '普攻 U: 就绪', isReady: true },
            { key: 'special', text: '特攻 O: 0.3s后差6体/0.4s', isReady: false },
            { key: 'dodge', text: '闪避 Space: 差15体/1.0s', isReady: false }
        ],
        'combat action HUD segment helper should keep per-action labels aligned with readiness state so the UI can flash only newly ready actions'
    );
}

function testCombatActionHudLayout() {
    assert.equal(typeof buildCombatActionHudLayout, 'function', 'combat action HUD layout helper should be exported');
    const wrappedLayout = buildCombatActionHudLayout([
        { key: 'attack', width: 188 },
        { key: 'special', width: 278 },
        { key: 'dodge', width: 292 }
    ], {
        startX: 16,
        maxWidth: 620,
        gap: 18,
        rowGap: 22
    });
    assert.equal(wrappedLayout.rowCount, 2, 'combat action HUD layout helper should wrap onto a second row when long labels would overrun the quick-slot lane');
    assert.deepEqual(
        wrappedLayout.placements.map(({ key, x, row, y }) => ({ key, x, row, y })),
        [
            { key: 'attack', x: 16, row: 0, y: 0 },
            { key: 'special', x: 222, row: 0, y: 0 },
            { key: 'dodge', x: 16, row: 1, y: 22 }
        ],
        'combat action HUD layout helper should preserve action order while restarting wrapped rows from the left HUD pad'
    );
    wrappedLayout.placements.forEach((placement) => {
        const right = placement.x + placement.width;
        assert.ok(right <= 636, 'combat action HUD layout helper should keep every wrapped segment inside the reserved bottom-left HUD lane');
    });

    const singleRowLayout = buildCombatActionHudLayout([
        { key: 'attack', width: 120 },
        { key: 'special', width: 140 },
        { key: 'dodge', width: 160 }
    ], {
        startX: 16,
        maxWidth: 620,
        gap: 18,
        rowGap: 22
    });
    assert.equal(singleRowLayout.rowCount, 1, 'combat action HUD layout helper should keep short labels on one row');
    assert.deepEqual(
        singleRowLayout.placements.map(({ key, x, row, y }) => ({ key, x, row, y })),
        [
            { key: 'attack', x: 16, row: 0, y: 0 },
            { key: 'special', x: 154, row: 0, y: 0 },
            { key: 'dodge', x: 312, row: 0, y: 0 }
        ],
        'combat action HUD layout helper should keep short labels on a stable single row'
    );
}

function testStaminaPayoffPulsePresentation() {
    assert.equal(typeof getStaminaPayoffPulsePresentation, 'function', 'stamina payoff pulse helper should be exported');
    const earlyPulse = getStaminaPayoffPulsePresentation(1000, 1180);
    assert.equal(earlyPulse.active, true, 'stamina payoff pulse should stay active before the pulse window expires');
    assert.equal(earlyPulse.fillColor, 0xE8FF9A, 'stamina payoff pulse should brighten the stamina fill color while active');
    assert.equal(earlyPulse.textColor, '#fff6c7', 'stamina payoff pulse should briefly warm the stamina text color');
    assert.ok(earlyPulse.overlayAlpha > 0, 'stamina payoff pulse should expose a visible overlay alpha while active');
    assert.ok(earlyPulse.overlayExtraWidth > 0, 'stamina payoff pulse should expose a short overlay width bonus while active');

    const latePulse = getStaminaPayoffPulsePresentation(1160, 1180);
    assert.equal(latePulse.active, true, 'stamina payoff pulse should remain active until the final frame of the window');
    assert.ok(
        latePulse.overlayAlpha < earlyPulse.overlayAlpha,
        'stamina payoff pulse should decay its overlay alpha as the payoff window closes'
    );
    assert.ok(
        latePulse.overlayExtraWidth < earlyPulse.overlayExtraWidth,
        'stamina payoff pulse should decay its overlay width bonus as the payoff window closes'
    );

    assert.deepEqual(
        getStaminaPayoffPulsePresentation(1180, 1180),
        {
            active: false,
            fillColor: null,
            textColor: null,
            overlayColor: null,
            overlayAlpha: 0,
            overlayExtraWidth: 0,
            overlayExtraHeight: 0
        },
        'stamina payoff pulse should fully reset once the payoff window expires'
    );
}

function testQuickSlotItemLabel() {
    assert.equal(typeof buildQuickSlotItemLabel, 'function', 'quick-slot item label helper should be exported');
    assert.equal(buildQuickSlotItemLabel(null, 0), '-', 'empty quick slot should render a stable placeholder');
    assert.equal(buildQuickSlotItemLabel('hpPotion', 3), 'HP x3', 'hp potions should use a compact short label');
    assert.equal(buildQuickSlotItemLabel('staminaPotion', 2), 'ST x2', 'stamina potions should use a compact short label');
    assert.equal(buildQuickSlotItemLabel('cleanseTonic', 1), '净 x1', 'cleanse tonics should use a localized compact short label');
    assert.equal(buildQuickSlotItemLabel('berserkerOil', 4), '油 x4', 'berserker oil should use a localized compact short label');
}

function testKeyboardHudQolHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\.actionText = \{\s*attack:\s*this\.add\.text\([\s\S]*?special:\s*this\.add\.text\([\s\S]*?dodge:\s*this\.add\.text\(/,
        'HUD should allocate dedicated per-action combat-action text nodes'
    );
    assert.match(
        source,
        /const runEffects = GameState\.runEffects \|\| DEFAULT_RUN_EFFECTS;[\s\S]*?const staminaRegenPerSecond = GAME_CONFIG\.PLAYER\.staminaRegen \* \(runEffects\.playerStaminaRegenMultiplier \|\| 1\);[\s\S]*?const actionHudState = \{[\s\S]*?isDodging:\s*player\.isDodging,[\s\S]*?dodgeLockoutMs:\s*player\.dodgeLockoutMsRemaining,[\s\S]*?dodgePostLockoutCooldownMs:\s*Math\.max\(200,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeCooldown \* \(runEffects\.playerDodgeCooldownMultiplier \|\| 1\)\)\),[\s\S]*?attackCooldownMs:\s*player\.attackCooldown,[\s\S]*?specialCooldownMs:\s*player\.specialCooldown,[\s\S]*?dodgeCooldownMs:\s*player\.dodgeCooldownTimer,[\s\S]*?stamina:\s*player\.stamina,[\s\S]*?staminaRegenPerSecond,[\s\S]*?attackStaminaCost:\s*weapon\s*\?\s*weapon\.staminaCost\s*:\s*0,[\s\S]*?specialStaminaCost:\s*weapon\s*\?\s*weapon\.specialStaminaCost\s*:\s*0,[\s\S]*?dodgeStaminaCost:\s*Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* \(runEffects\.playerDodgeStaminaCostMultiplier \|\| 1\)\)\)[\s\S]*?\};[\s\S]*?const actionHudSegments = buildCombatActionHudSegments\(actionHudState\);/,
        'HUD should derive dodge lockout, cooldown, stamina gaps, and stamina-recovery ETA from the shared combat-action helper'
    );
    assert.match(
        source,
        /this\.actionTextReadyFlashUntil = \{\s*attack:\s*0,\s*special:\s*0,\s*dodge:\s*0\s*\};[\s\S]*?this\._lastCombatActionReadiness = null;/,
        'HUD should initialize per-action readiness flash state alongside the combat action text'
    );
    assert.match(
        source,
        /const actionHudState = \{[\s\S]*?isDodging:\s*player\.isDodging,[\s\S]*?dodgeStaminaCost:\s*Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* \(runEffects\.playerDodgeStaminaCostMultiplier \|\| 1\)\)\)[\s\S]*?\};[\s\S]*?const actionHudSegments = buildCombatActionHudSegments\(actionHudState\);[\s\S]*?const actionHudReadiness = buildCombatActionReadiness\(actionHudState\);[\s\S]*?const previousActionReadiness = this\._lastCombatActionReadiness;[\s\S]*?if \(previousActionReadiness\) \{[\s\S]*?Object\.keys\(actionHudReadiness\)\.forEach\(key => \{[\s\S]*?this\.actionTextReadyFlashUntil\[key\] = this\.time\.now \+ 220;[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?actionHudSegments\.forEach\(segment => \{[\s\S]*?const actionHighlightActive = this\.actionTextReadyFlashUntil\[segment\.key\] > this\.time\.now;[\s\S]*?actionTextNode\.setStyle\(\{ fill: actionHighlightActive \? '#fff4b3' : '#cfd8e6' \}\);[\s\S]*?actionTextNode\.setText\(segment\.text\);/,
        'HUD should derive per-action readiness flashes from the shared combat-action readiness helper when individual actions newly become ready'
    );
    assert.match(
        source,
        /const bottomPad = Number\.isFinite\(layout\.bottomPad\) && layout\.bottomPad >= 0 \? layout\.bottomPad : layout\.pad;[\s\S]*?const actionLayout = buildCombatActionHudLayout\([\s\S]*?startX:\s*bottomPad,[\s\S]*?maxWidth:\s*Math\.max\(0,\s*this\.quickSlots\[0\]\.box\.x - bottomPad - 12\),[\s\S]*?\);[\s\S]*?const actionClusterLift = Math\.max\(0,\s*actionLayout\.rowCount - 1\) \* 22;[\s\S]*?this\.aimText\.setPosition\(bottomPad,\s*this\.cameras\.main\.height - 80 - actionClusterLift\);[\s\S]*?this\.weaponText\.setPosition\(bottomPad,\s*this\.cameras\.main\.height - 58 - actionClusterLift\);[\s\S]*?actionLayout\.placements\.forEach\(placement => \{[\s\S]*?actionTextNode\.setPosition\(placement\.x,\s*this\.cameras\.main\.height - 36 - actionClusterLift \+ placement\.y\);[\s\S]*?\}\);/,
        'HUD should wrap long action labels inside the reserved bottom-left lane and keep that lane anchored to a stable bottom pad'
    );
    assert.match(
        source,
        /this\.autoAssignMessageText = this\.add\.text\(/,
        'InventoryScene should allocate a transient text node for quick-slot auto-assign feedback'
    );
    assert.match(
        source,
        /const autoAssign = buildQuickSlotAutoAssignResult\(GameState\.quickSlots,\s*key,\s*ITEMS,\s*\{[\s\S]*?measureLabelWidth:\s*label\s*=>\s*this\._measureQuickSlotNoticeLabel\(label\)[\s\S]*?\}\);[\s\S]*?GameState\.quickSlots = autoAssign\.nextQuickSlots;[\s\S]*?this\._showAutoAssignMessage\(autoAssign\.notice\);/,
        'inventory consumable clicks should reuse the shared quick-slot auto-assign result helper and notice contract'
    );
    assert.match(
        source,
        /measureLabelWidth:\s*label\s*=>\s*this\._measureQuickSlotNoticeLabel\(label\)/,
        'inventory consumable clicks should pass a Phaser-backed label measurement callback into the shared quick-slot notice helper'
    );
    assert.match(
        source,
        /_measureQuickSlotNoticeLabel\(label\)\s*{[\s\S]*?this\._quickSlotNoticeMeasureText[\s\S]*?setText\(label\)[\s\S]*?return this\._quickSlotNoticeMeasureText\.width;/,
        'InventoryScene should expose a dedicated helper that measures quick-slot notice labels with Phaser text width'
    );
    assert.match(
        source,
        /slot\.itemText\.setText\(buildQuickSlotItemLabel\(itemKey,\s*itemCount\)\);/,
        'HUD quick slots should render compact helper-driven labels with counts'
    );
    assert.match(
        source,
        /_showTooltip\(text,\s*anchorX,\s*anchorY\)\s*{[\s\S]*?this\.tooltip\.setText\(text\);[\s\S]*?getInventoryTooltipClampX\(anchorX,\s*this\.tooltip\.width,\s*this\.cameras\.main\.width\)/,
        'InventoryScene should clamp tooltip placement from the real rendered tooltip width via the shared helper'
    );
}

function testCombatDisciplineRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /const attackCooldownScale = runEffects\.playerAttackCooldownMultiplier \|\| 1;/,
        'player attack runtime should read the normal-attack cadence multiplier from run effects'
    );
    assert.match(
        source,
        /const attackCooldownScale = runEffects\.playerAttackCooldownMultiplier \|\| 1;[\s\S]*?const weaponRoutingAttackCooldownScale = weapon\.type === 'melee' \? \(runEffects\.playerMeleeAttackCooldownMultiplier \|\| 1\) : 1;[\s\S]*?this\.attackCooldown = Math\.max\(120,\s*Math\.round\(weapon\.attackSpeed \* attackCooldownScale \* weaponRoutingAttackCooldownScale\)\);/,
        'player attack runtime should apply the cadence multiplier when starting a normal attack'
    );
    assert.match(
        source,
        /const dodgeCooldownScale = runEffects\.playerDodgeCooldownMultiplier \|\| 1;/,
        'player dodge runtime should read the dodge cooldown multiplier from run effects'
    );
    assert.match(
        source,
        /const dodgeStaminaCostScale = runEffects\.playerDodgeStaminaCostMultiplier \|\| 1;/,
        'player dodge runtime should read the dodge stamina multiplier from run effects'
    );
    assert.match(
        source,
        /const dodgeStaminaCost = Math\.max\(1,\s*Math\.round\(cfg\.dodgeStaminaCost \* dodgeStaminaCostScale\)\);/,
        'player dodge runtime should derive a scaled dodge stamina cost'
    );
    assert.match(
        source,
        /this\.dodgeCooldownTimer = Math\.max\(200,\s*Math\.round\(cfg\.dodgeCooldown \* dodgeCooldownScale\)\);/,
        'player dodge runtime should derive a scaled dodge cooldown'
    );
    assert.match(
        source,
        /dodgePostLockoutCooldownMs:\s*Math\.max\(200,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeCooldown \* \(runEffects\.playerDodgeCooldownMultiplier \|\| 1\)\)\)/,
        'combat action HUD state should preview the scaled dodge cooldown while rolling'
    );
    assert.match(
        source,
        /dodgeStaminaCost:\s*Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* \(runEffects\.playerDodgeStaminaCostMultiplier \|\| 1\)\)\)/,
        'combat action HUD state should preview the scaled dodge stamina cost'
    );
}

function testCombatFlowRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /function combineRunEffects\(\.\.\.effectGroups\)\s*{[\s\S]*?const additiveRunEffectKeys = new Set\(\[[\s\S]*?'playerAttackHitStaminaGain'[\s\S]*?'playerPostDodgeSpecialWindowMs'[\s\S]*?'playerPostDodgeAttackWindowMs'[\s\S]*?'playerAttackHitSpecialCooldownReductionMs'[\s\S]*?'playerSpecialHitDodgeCooldownReductionMs'[\s\S]*?'playerSpecialHitStaminaGain'[\s\S]*?\]\);[\s\S]*?if \(additiveRunEffectKeys\.has\(effectKey\)\) \{[\s\S]*?combined\[effectKey\] \+= value;[\s\S]*?\}[\s\S]*?combined\[effectKey\] \*= value;/,
        'run-effect composition should add fixed stamina refunds, post-dodge windows, and combo-link cooldown refunds instead of multiplying them away'
    );
    assert.match(
        source,
        /grantAttackHitStamina\(isSpecial\)\s*{[\s\S]*?const staminaGain = Math\.max\(0,\s*Math\.round\(runEffects\.playerAttackHitStaminaGain \|\| 0\)\);[\s\S]*?if \(isSpecial \|\| staminaGain <= 0\) return 0;[\s\S]*?this\.stamina = Math\.min\(this\.maxStamina,\s*this\.stamina \+ staminaGain\);/,
        'player runtime should expose a helper that refunds stamina only on landed normal attacks'
    );
    assert.match(
        source,
        /armPostDodgeSpecialWindow\(\)\s*{[\s\S]*?const windowMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerPostDodgeSpecialWindowMs \|\| 0\)\);[\s\S]*?this\.postDodgeSpecialEmpowerUntil = this\.scene\.time\.now \+ windowMs;/,
        'player runtime should arm a timed post-dodge special window from run effects'
    );
    assert.match(
        source,
        /const specialDamageMultiplier = this\.consumePostDodgeSpecialMultiplier\(this\.scene\.time\.now\);[\s\S]*?const damage = Math\.round\(weapon\.damage \* 2 \* this\.getDamageMultiplier\(\) \* specialDamageMultiplier\);/,
        'special attacks should consume the post-dodge empower multiplier when computing burst damage'
    );
    assert.match(
        source,
        /const specialDamageMultiplier = this\.consumePostDodgeSpecialMultiplier\(this\.scene\.time\.now\);[\s\S]*?const isEmpoweredSpecial = specialDamageMultiplier > 1;[\s\S]*?return this\._spawnHitbox\(damage,\s*2,\s*true,\s*isEmpoweredSpecial(?:,\s*[\s\S]*?)?\);/,
        'special attacks should tag when a post-dodge empower window is actually converted into a burst cast'
    );
    assert.match(
        source,
        /const staminaRefund = this\.player\.grantAttackHitStamina\(hb\.isSpecial\);[\s\S]*?if \(staminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'回体\+'\s*\+\s*staminaRefund/,
        'enemy-hit processing should apply the stamina refund feedback when normal attacks land'
    );
    assert.match(
        source,
        /const staminaRefund = this\.player\.grantAttackHitStamina\(hb\.isSpecial\);[\s\S]*?if \(staminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'回体\+'\s*\+\s*staminaRefund[\s\S]*?this\.armStaminaPayoffPulse\(staminaRefund\);/,
        'enemy-hit processing should arm the stamina-bar payoff pulse only when a normal-attack refund actually lands'
    );
    assert.match(
        source,
        /if \(typeof this\.player\.consumeDisciplineAttackHitPayoff === 'function' && this\.player\.consumeDisciplineAttackHitPayoff\(hb,\s*this\.time\.now\)\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'连斩'/,
        'enemy-hit processing should add a distinct combat-discipline payoff cue only when the tagged faster normal attack actually lands'
    );
    assert.match(
        source,
        /if \(hb\.isEmpoweredSpecial\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'借势重击'/,
        'enemy-hit processing should give empowered specials a distinct momentum-burst payoff cue'
    );
    assert.match(
        source,
        /const staminaRefund = this\.player\.grantAttackHitStamina\(hb\.isSpecial\);[\s\S]*?if \(staminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'回体\+'\s*\+\s*staminaRefund/,
        'boss-hit processing should reuse the same stamina refund hook and feedback'
    );
    assert.match(
        source,
        /const staminaRefund = this\.player\.grantAttackHitStamina\(hb\.isSpecial\);[\s\S]*?if \(staminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'回体\+'\s*\+\s*staminaRefund[\s\S]*?this\.armStaminaPayoffPulse\(staminaRefund\);/,
        'boss-hit processing should mirror the stamina-bar payoff pulse when the refund lands on bosses'
    );
    assert.match(
        source,
        /if \(typeof this\.player\.consumeDisciplineAttackHitPayoff === 'function' && this\.player\.consumeDisciplineAttackHitPayoff\(hb,\s*this\.time\.now\)\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'连斩'/,
        'boss-hit processing should mirror the combat-discipline faster-hit payoff cue'
    );
    assert.match(
        source,
        /if \(hb\.isEmpoweredSpecial\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'借势重击'/,
        'boss-hit processing should mirror the empowered-special payoff cue against bosses'
    );
    assert.match(
        source,
        /const staminaPulsePresentation = getStaminaPayoffPulsePresentation\(this\.time\.now,\s*this\.staminaPayoffPulseUntil\);[\s\S]*?if \(staminaPulsePresentation\.active\) \{[\s\S]*?this\.staminaBarPulse\.fillStyle\(/,
        'HUD should derive the stamina-bar payoff pulse from the shared helper before drawing the stamina resource lane'
    );
    assert.match(
        source,
        /attackStatusLabel:\s*typeof player\.getCombatAttackStatusLabel === 'function'\s*\?\s*player\.getCombatAttackStatusLabel\(this\.time\.now\)\s*:\s*''[\s\S]*?specialStatusLabel:\s*typeof player\.getCombatSpecialStatusLabel === 'function'\s*\?\s*player\.getCombatSpecialStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should surface both persistent stamina-refund identity and post-dodge special state labels'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?playerDodgeCooldownMultiplier[\s\S]*?playerDodgeStaminaCostMultiplier[\s\S]*?游步[\s\S]*?dodgeStatusLabel:\s*typeof player\.getCombatDodgeStatusLabel === 'function'\s*\?\s*player\.getCombatDodgeStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should expose the combat-discipline shrine dodge identity alongside the attack-route label'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?playerPostDodgeSpecialWindowMs[\s\S]*?借势[\s\S]*?playerSpecialCooldownMultiplier[\s\S]*?迅击[\s\S]*?specialStatusLabel:\s*typeof player\.getCombatSpecialStatusLabel === 'function'\s*\?\s*player\.getCombatSpecialStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should expose the prayer-shrine special cooldown identity alongside the temporary post-dodge buff label'
    );
    assert.match(
        source,
        /this\.prayerSpecialReadyCueUntil = 0;[\s\S]*?armPrayerSpecialReadyCue\(now\)\s*{[\s\S]*?playerSpecialCooldownMultiplier[\s\S]*?this\.prayerSpecialReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.prayerSpecialReadyCueUntil;/,
        'player runtime should arm a short prayer payoff cue only when the cooldown-reduction route is active'
    );
    assert.match(
        source,
        /this\.prayerDodgeReadyCueUntil = 0;[\s\S]*?armPrayerDodgeReadyCue\(now\)\s*{[\s\S]*?playerDodgeCooldownMultiplier[\s\S]*?playerDodgeStaminaCostMultiplier[\s\S]*?playerStaminaRegenMultiplier[\s\S]*?this\.prayerDodgeReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.prayerDodgeReadyCueUntil;/,
        'player runtime should arm a short prayer dodge cue only when the stamina-regen prayer route is active without overriding dodge-economy labels'
    );
    assert.match(
        source,
        /this\.disciplineAttackReadyCueUntil = 0;[\s\S]*?armDisciplineAttackReadyCue\(now\)\s*{[\s\S]*?playerAttackCooldownMultiplier[\s\S]*?this\.disciplineAttackReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.disciplineAttackReadyCueUntil;/,
        'player runtime should arm a short combat-discipline attack cue only when the attack-cooldown route is active'
    );
    assert.match(
        source,
        /armDisciplineAttackHitPayoff\(now\)\s*{[\s\S]*?playerAttackCooldownMultiplier[\s\S]*?const pendingUntil = Number\(this\.disciplineAttackBaseReadyAt\) \|\| 0;[\s\S]*?if \(pendingUntil <= \(Number\(now\) \|\| 0\)\) return 0;[\s\S]*?this\.disciplineAttackHitPayoffPendingUntil = Math\.max\([\s\S]*?pendingUntil[\s\S]*?\);[\s\S]*?return this\.disciplineAttackHitPayoffPendingUntil;/,
        'player runtime should arm a one-shot combat-discipline hit-payoff window only while the faster attack is still ahead of the base cooldown'
    );
    assert.match(
        source,
        /claimDisciplineAttackHitPayoffWindow\(now\)\s*{[\s\S]*?const pendingUntil = Number\(this\.disciplineAttackHitPayoffPendingUntil\) \|\| 0;[\s\S]*?this\.disciplineAttackHitPayoffPendingUntil = 0;[\s\S]*?return pendingUntil > \(Number\(now\) \|\| 0\) \? pendingUntil : 0;/,
        'player runtime should only let the immediate next normal attack claim the combat-discipline hit-payoff window'
    );
    assert.match(
        source,
        /consumeDisciplineAttackHitPayoff\(hitbox,\s*now\)\s*{[\s\S]*?const payoffUntil = Number\(hitbox\.disciplineAttackPayoffUntil\) \|\| 0;[\s\S]*?const attackSequenceId = Number\(hitbox\.attackSequenceId\) \|\| 0;[\s\S]*?if \(payoffUntil <= \(Number\(now\) \|\| 0\) \|\| attackSequenceId <= 0\) return false;[\s\S]*?if \(this\.disciplineAttackHitPayoffConsumedSequenceId === attackSequenceId\) return false;[\s\S]*?this\.disciplineAttackHitPayoffConsumedSequenceId = attackSequenceId;[\s\S]*?return true;/,
        'player runtime should consume the combat-discipline hit-payoff at most once for the tagged faster attack'
    );
    assert.match(
        source,
        /getCombatAttackStatusLabel\(now\)\s*{[\s\S]*?const disciplineReadyCueUntil = Number\(this\.disciplineAttackReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < disciplineReadyCueUntil[\s\S]*?return '连斩就绪';[\s\S]*?const attackCooldownTag = formatRunEffectReductionTag\(runEffects\.playerAttackCooldownMultiplier\);[\s\S]*?return attackCooldownTag \? `连斩\$\{attackCooldownTag\}` : '';/,
        'combat HUD state should briefly upgrade the combat-discipline attack label to `连斩就绪` before falling back to the persistent route tag'
    );
    assert.match(
        source,
        /this\.disciplineDodgeReadyCueUntil = 0;[\s\S]*?armDisciplineDodgeReadyCue\(now\)\s*{[\s\S]*?playerDodgeCooldownMultiplier[\s\S]*?playerDodgeStaminaCostMultiplier[\s\S]*?this\.disciplineDodgeReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.disciplineDodgeReadyCueUntil;/,
        'player runtime should arm a short combat-discipline dodge cue only when the dodge-economy route is active'
    );
    assert.match(
        source,
        /isDisciplineDodgeStaminaThresholdReady\(\)\s*{[\s\S]*?const dodgeStaminaCostScale = runEffects\.playerDodgeStaminaCostMultiplier \|\| 1;[\s\S]*?if \(dodgeStaminaCostScale >= 1\) return false;[\s\S]*?const baseDodgeStaminaCost = Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost\)\);[\s\S]*?const dodgeStaminaCost = Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* dodgeStaminaCostScale\)\);[\s\S]*?return this\.stamina >= dodgeStaminaCost && this\.stamina < baseDodgeStaminaCost;/,
        'player runtime should expose a combat-discipline stamina-threshold helper that only turns true when reduced dodge cost makes dodge affordable'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?if \(remainingMs > 0\) \{[\s\S]*?return `借势\$\{seconds\.toFixed\(1\)\}s`[\s\S]*?return '借势待闪';[\s\S]*?const prayerReadyCueUntil = Number\(this\.prayerSpecialReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < prayerReadyCueUntil && this\.specialCooldown <= 0\) \{[\s\S]*?return '迅击就绪';[\s\S]*?\}[\s\S]*?playerSpecialCooldownMultiplier[\s\S]*?迅击/,
        'combat HUD state should briefly upgrade the prayer cooldown label to `迅击就绪` when the special truly becomes ready'
    );
    assert.match(
        source,
        /if \(key === 'attack'\) \{[\s\S]*?const previousAttackSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'attack'\) : null;[\s\S]*?const previousAttackText = previousAttackSegment && typeof previousAttackSegment\.text === 'string' \? previousAttackSegment\.text : '';[\s\S]*?const previousAttackWasCooldownBlocked = \/\\d\+\\.\\d\+s\/\.test\(previousAttackText\);[\s\S]*?if \(previousAttackWasCooldownBlocked && typeof player\.armDisciplineAttackReadyCue === 'function'\) \{[\s\S]*?player\.armDisciplineAttackReadyCue\(this\.time\.now\);[\s\S]*?\}[\s\S]*?\}/,
        'combat HUD should arm the combat-discipline attack-ready cue only when the previous attack row still showed cooldown or post-roll cooldown preview'
    );
    assert.match(
        source,
        /if \(key === 'attack'\) \{[\s\S]*?const previousAttackSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'attack'\) : null;[\s\S]*?const previousAttackText = previousAttackSegment && typeof previousAttackSegment\.text === 'string' \? previousAttackSegment\.text : '';[\s\S]*?const previousAttackWasCooldownBlocked = \/\\d\+\\.\\d\+s\/\.test\(previousAttackText\);[\s\S]*?if \(previousAttackWasCooldownBlocked && typeof player\.armDisciplineAttackReadyCue === 'function'\) \{[\s\S]*?player\.armDisciplineAttackReadyCue\(this\.time\.now\);[\s\S]*?\}[\s\S]*?if \(previousAttackWasCooldownBlocked && typeof player\.armDisciplineAttackHitPayoff === 'function'\) \{[\s\S]*?player\.armDisciplineAttackHitPayoff\(this\.time\.now\);[\s\S]*?\}[\s\S]*?\}/,
        'combat HUD should arm the combat-discipline hit-payoff window from the same early-ready edge as the HUD cue'
    );
    assert.match(
        source,
        /const baseAttackCooldown = Math\.max\(120,\s*Math\.round\(weapon\.attackSpeed\)\);[\s\S]*?this\.disciplineAttackBaseReadyAt = this\.scene\.time\.now \+ baseAttackCooldown;[\s\S]*?const disciplineAttackPayoffUntil = this\.claimDisciplineAttackHitPayoffWindow\(this\.scene\.time\.now\);[\s\S]*?return this\._spawnHitbox\(damage,\s*1,\s*false,\s*false,\s*\{[\s\S]*?attackSequenceId,[\s\S]*?disciplineAttackPayoffUntil[\s\S]*?\}\);/,
        'normal attacks should tag only the immediate next swing with combat-discipline hit-payoff metadata'
    );
    assert.match(
        source,
        /_spawnHitbox\(damage,\s*scale,\s*isSpecial,\s*isEmpoweredSpecial,\s*meta\s*=\s*\{\}\)\s*{[\s\S]*?const attackSequenceId = Number\(meta\.attackSequenceId\) \|\| 0;[\s\S]*?const disciplineAttackPayoffUntil = Number\(meta\.disciplineAttackPayoffUntil\) \|\| 0;[\s\S]*?hitbox\.attackSequenceId = attackSequenceId;[\s\S]*?hitbox\.disciplineAttackPayoffUntil = disciplineAttackPayoffUntil;/,
        'spawned hitboxes should carry the combat-discipline payoff metadata into the hit-resolution path'
    );
    assert.match(
        source,
        /if \(previousActionReadiness\) \{[\s\S]*?Object\.keys\(actionHudReadiness\)\.forEach\(key => \{[\s\S]*?if \(actionHudReadiness\[key\] && !previousActionReadiness\[key\]\) \{[\s\S]*?this\.actionTextReadyFlashUntil\[key\] = this\.time\.now \+ 220;[\s\S]*?if \(key === 'special' && typeof player\.armPrayerSpecialReadyCue === 'function'\) \{[\s\S]*?player\.armPrayerSpecialReadyCue\(this\.time\.now\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}/,
        'combat HUD should arm the prayer payoff cue from the same readiness edge that drives the generic per-row flash'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?const prayerReadyCueUntil = Number\(this\.prayerDodgeReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < prayerReadyCueUntil && !this\.isDodging && this\.dodgeCooldownTimer <= 0 && this\.stamina >= dodgeStaminaCost\) \{[\s\S]*?return '复苏就绪';[\s\S]*?\}[\s\S]*?playerStaminaRegenMultiplier[\s\S]*?复苏/,
        'combat HUD state should briefly upgrade the prayer stamina label to `复苏就绪` only while dodge is truly ready'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?const disciplineReadyCueUntil = Number\(this\.disciplineDodgeReadyCueUntil\) \|\| 0;[\s\S]*?const dodgeStaminaCost = Math\.max\(1,\s*Math\.round\(GAME_CONFIG\.PLAYER\.dodgeStaminaCost \* \(runEffects\.playerDodgeStaminaCostMultiplier \|\| 1\)\)\);[\s\S]*?if \(\(Number\(now\) \|\| 0\) < disciplineReadyCueUntil && !this\.isDodging && this\.dodgeCooldownTimer <= 0 && this\.stamina >= dodgeStaminaCost\) \{[\s\S]*?return '游步就绪';[\s\S]*?\}[\s\S]*?if \(tags\.length > 0\) \{[\s\S]*?return `游步\$\{tags\.join\('\/'\)\}`;/,
        'combat HUD state should briefly upgrade the combat-discipline dodge label to `游步就绪` before falling back to the persistent route tag'
    );
    assert.match(
        source,
        /const previousActionHudSegments = this\._lastCombatActionHudSegments;[\s\S]*?if \(previousActionReadiness\) \{[\s\S]*?if \(key === 'dodge'\) \{[\s\S]*?const previousDodgeSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'dodge'\) : null;[\s\S]*?const previousDodgeText = previousDodgeSegment && typeof previousDodgeSegment\.text === 'string' \? previousDodgeSegment\.text : '';[\s\S]*?if \(previousDodgeText\.includes\('差'\) && typeof player\.armPrayerDodgeReadyCue === 'function'\) \{[\s\S]*?player\.armPrayerDodgeReadyCue\(this\.time\.now\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?this\._lastCombatActionHudSegments = actionHudSegments;/,
        'combat HUD should only arm the prayer dodge cue when the dodge row recovers from a stamina-gap state or preview'
    );
    assert.match(
        source,
        /if \(key === 'dodge'\) \{[\s\S]*?const previousDodgeSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'dodge'\) : null;[\s\S]*?const previousDodgeText = previousDodgeSegment && typeof previousDodgeSegment\.text === 'string' \? previousDodgeSegment\.text : '';[\s\S]*?const previousDodgeWasBlocked = previousDodgeText\.includes\('翻滚中 ->'\) \|\| previousDodgeText\.includes\('差'\) \|\| \/\\d\+\\.\\d\+s\/\.test\(previousDodgeText\);[\s\S]*?if \(previousDodgeWasBlocked && typeof player\.armDisciplineDodgeReadyCue === 'function'\) \{[\s\S]*?player\.armDisciplineDodgeReadyCue\(this\.time\.now\);[\s\S]*?\}[\s\S]*?\}/,
        'combat HUD should arm the combat-discipline dodge-ready cue only when the previous dodge row was still blocked or previewing the post-roll state'
    );
    assert.match(
        source,
        /const previousActionHudSegments = this\._lastCombatActionHudSegments;[\s\S]*?if \(previousActionReadiness\) \{[\s\S]*?if \(key === 'dodge'\) \{[\s\S]*?const previousDodgeSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'dodge'\) : null;[\s\S]*?const previousDodgeText = previousDodgeSegment && typeof previousDodgeSegment\.text === 'string' \? previousDodgeSegment\.text : '';[\s\S]*?if \(previousDodgeText\.includes\('差'\) && typeof player\.armPrayerDodgeReadyCue === 'function'\) \{[\s\S]*?player\.armPrayerDodgeReadyCue\(this\.time\.now\);[\s\S]*?this\.armStaminaPayoffPulse\(1\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?this\._lastCombatActionHudSegments = actionHudSegments;/,
        'combat HUD should mirror the prayer dodge-ready threshold cue onto the stamina bar when natural regen crosses the dodge gate'
    );
    assert.match(
        source,
        /if \(key === 'dodge'\) \{[\s\S]*?const previousDodgeSegment = Array\.isArray\(previousActionHudSegments\) \? previousActionHudSegments\.find\(segment => segment\.key === 'dodge'\) : null;[\s\S]*?const previousDodgeText = previousDodgeSegment && typeof previousDodgeSegment\.text === 'string' \? previousDodgeSegment\.text : '';[\s\S]*?const previousDodgeShowedThresholdState = previousDodgeText\.includes\('差'\) \|\| previousDodgeText\.includes\('翻滚中 ->'\);[\s\S]*?if \(previousDodgeShowedThresholdState && typeof player\.isDisciplineDodgeStaminaThresholdReady === 'function' && player\.isDisciplineDodgeStaminaThresholdReady\(\)\) \{[\s\S]*?this\.armStaminaPayoffPulse\(1\);[\s\S]*?\}/,
        'combat HUD should mirror the combat-discipline dodge-cost threshold cue onto the stamina bar only when reduced cost is what makes dodge ready'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?playerStaminaRegenMultiplier[\s\S]*?复苏[\s\S]*?dodgeStatusLabel:\s*typeof player\.getCombatDodgeStatusLabel === 'function'\s*\?\s*player\.getCombatDodgeStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should expose the prayer-shrine stamina-regen identity on the dodge row when no dodge-economy shrine is active'
    );
}

function testComboLinkRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /function combineRunEffects\(\.\.\.effectGroups\)\s*{[\s\S]*?const additiveRunEffectKeys = new Set\(\[[\s\S]*?'playerAttackHitStaminaGain'[\s\S]*?'playerPostDodgeSpecialWindowMs'[\s\S]*?'playerPostDodgeAttackWindowMs'[\s\S]*?'playerAttackHitSpecialCooldownReductionMs'[\s\S]*?'playerSpecialHitDodgeCooldownReductionMs'[\s\S]*?'playerSpecialHitStaminaGain'[\s\S]*?\]\);[\s\S]*?if \(additiveRunEffectKeys\.has\(effectKey\)\) \{[\s\S]*?combined\[effectKey\] \+= value;/,
        'run-effect composition should add the combo-link fixed cooldown refunds and adjacent follow-up windows instead of multiplying them'
    );
    assert.match(
        source,
        /refundSpecialCooldownFromAttackHit\(isSpecial,\s*now\)\s*{[\s\S]*?const reductionMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerAttackHitSpecialCooldownReductionMs \|\| 0\)\);[\s\S]*?if \(isSpecial \|\| reductionMs <= 0 \|\| this\.specialCooldown <= 0\) return 0;[\s\S]*?this\.specialCooldown = Math\.max\(0,\s*previousCooldown - reductionMs\);/,
        'player runtime should expose a helper that refunds special cooldown only on landed normal attacks'
    );
    assert.match(
        source,
        /refundDodgeCooldownFromSpecialHit\(isSpecial,\s*now\)\s*{[\s\S]*?const reductionMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerSpecialHitDodgeCooldownReductionMs \|\| 0\)\);[\s\S]*?if \(!isSpecial \|\| reductionMs <= 0 \|\| this\.dodgeCooldownTimer <= 0\) return 0;[\s\S]*?this\.dodgeCooldownTimer = Math\.max\(0,\s*previousCooldown - reductionMs\);/,
        'player runtime should expose a helper that refunds dodge cooldown only on landed specials'
    );
    assert.match(
        source,
        /this\.comboSpecialReadyCueUntil = 0;[\s\S]*?armComboSpecialReadyCue\(now\)\s*{[\s\S]*?playerAttackHitSpecialCooldownReductionMs[\s\S]*?this\.comboSpecialReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.comboSpecialReadyCueUntil;/,
        'player runtime should arm a short combo-link special cue only when the attack-to-special route is active'
    );
    assert.match(
        source,
        /this\.comboDodgeReadyCueUntil = 0;[\s\S]*?armComboDodgeReadyCue\(now\)\s*{[\s\S]*?playerSpecialHitDodgeCooldownReductionMs[\s\S]*?this\.comboDodgeReadyCueUntil = Math\.max\([\s\S]*?Number\(now\) \|\| 0[\s\S]*?\+ 320\);[\s\S]*?return this\.comboDodgeReadyCueUntil;/,
        'player runtime should arm a short combo-link dodge cue only when the special-to-dodge route is active'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?const comboSpecialReadyCueUntil = Number\(this\.comboSpecialReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < comboSpecialReadyCueUntil && this\.specialCooldown <= 0\) \{[\s\S]*?return '催锋就绪';[\s\S]*?\}[\s\S]*?const attackHitSpecialReductionMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerAttackHitSpecialCooldownReductionMs \|\| 0\)\);[\s\S]*?if \(attackHitSpecialReductionMs > 0\) \{[\s\S]*?return `催锋-\$\{\(attackHitSpecialReductionMs \/ 1000\)\.toFixed\(1\)\}s\/击`;/,
        'combat HUD state should expose the combo-link special identity and briefly upgrade it to `催锋就绪` when the refund makes special ready'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?const comboDodgeReadyCueUntil = Number\(this\.comboDodgeReadyCueUntil\) \|\| 0;[\s\S]*?const dodgeCooldownRefundMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerSpecialHitDodgeCooldownReductionMs \|\| 0\)\);[\s\S]*?if \(\(Number\(now\) \|\| 0\) < comboDodgeReadyCueUntil && !this\.isDodging && this\.dodgeCooldownTimer <= 0 && this\.stamina >= dodgeStaminaCost\) \{[\s\S]*?return '回身就绪';[\s\S]*?\}[\s\S]*?if \(dodgeCooldownRefundMs > 0\) \{[\s\S]*?return `回身-\$\{\(dodgeCooldownRefundMs \/ 1000\)\.toFixed\(1\)\}s\/特攻`;/,
        'combat HUD state should expose the combo-link dodge identity and briefly upgrade it to `回身就绪` when the refund makes dodge ready'
    );
    assert.match(
        source,
        /const specialRefund = this\.player\.refundSpecialCooldownFromAttackHit\(hb\.isSpecial,\s*this\.time\.now\);[\s\S]*?if \(specialRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'催锋-'\s*\+\s*\(specialRefund \/ 1000\)\.toFixed\(1\)\s*\+\s*'s'/,
        'enemy-hit processing should surface the combo-link special-cooldown refund when normal attacks land'
    );
    assert.match(
        source,
        /const dodgeRefund = this\.player\.refundDodgeCooldownFromSpecialHit\(hb\.isSpecial,\s*this\.time\.now\);[\s\S]*?if \(dodgeRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'回身-'\s*\+\s*\(dodgeRefund \/ 1000\)\.toFixed\(1\)\s*\+\s*'s'/,
        'enemy-hit processing should surface the combo-link dodge-cooldown refund when specials land'
    );
    assert.match(
        source,
        /const specialRefund = this\.player\.refundSpecialCooldownFromAttackHit\(hb\.isSpecial,\s*this\.time\.now\);[\s\S]*?if \(specialRefund > 0\) \{[\s\S]*?showFloatingCombatText\(/,
        'boss-hit processing should reuse the combo-link special-cooldown refund hook'
    );
    assert.match(
        source,
        /const dodgeRefund = this\.player\.refundDodgeCooldownFromSpecialHit\(hb\.isSpecial,\s*this\.time\.now\);[\s\S]*?if \(dodgeRefund > 0\) \{[\s\S]*?showFloatingCombatText\(/,
        'boss-hit processing should reuse the combo-link dodge-cooldown refund hook'
    );
}

function testCounterattackRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /grantSpecialHitStamina\(isSpecial\)\s*{[\s\S]*?const staminaGain = Math\.max\(0,\s*Math\.round\(runEffects\.playerSpecialHitStaminaGain \|\| 0\)\);[\s\S]*?if \(!isSpecial \|\| staminaGain <= 0\) return 0;[\s\S]*?this\.stamina = Math\.min\(this\.maxStamina,\s*this\.stamina \+ staminaGain\);/,
        'player runtime should expose a helper that refunds stamina only on landed specials'
    );
    assert.match(
        source,
        /armPostDodgeAttackWindow\(\)\s*{[\s\S]*?const windowMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerPostDodgeAttackWindowMs \|\| 0\)\);[\s\S]*?this\.postDodgeAttackEmpowerUntil = this\.scene\.time\.now \+ windowMs;/,
        'player runtime should arm a timed post-dodge normal-attack window from run effects'
    );
    assert.match(
        source,
        /const attackDamageMultiplier = this\.consumePostDodgeAttackMultiplier\(this\.scene\.time\.now\);[\s\S]*?const isEmpoweredAttack = attackDamageMultiplier > 1;[\s\S]*?const damage = Math\.round\(weapon\.damage \* this\.getDamageMultiplier\(\) \* attackDamageMultiplier\);/,
        'normal attacks should consume the post-dodge attack multiplier when computing empowered follow-up damage'
    );
    assert.match(
        source,
        /return this\._spawnHitbox\(damage,\s*1,\s*false,\s*false,\s*\{[\s\S]*?attackSequenceId,[\s\S]*?disciplineAttackPayoffUntil,[\s\S]*?isEmpoweredAttack[\s\S]*?\}\);/,
        'normal attacks should tag when a post-dodge attack window is actually converted into a follow-up swing'
    );
    assert.match(
        source,
        /_spawnHitbox\(damage,\s*scale,\s*isSpecial,\s*isEmpoweredSpecial,\s*meta\s*=\s*\{\}\)\s*{[\s\S]*?const isEmpoweredAttack = !!meta\.isEmpoweredAttack;[\s\S]*?hitbox\.isEmpoweredAttack = isEmpoweredAttack;/,
        'spawned hitboxes should carry the post-dodge attack payoff metadata into the hit-resolution path'
    );
    assert.match(
        source,
        /consumePostDodgeAttackPayoff\(hitbox\)\s*{[\s\S]*?if \(!hitbox \|\| hitbox\.isSpecial \|\| !hitbox\.isEmpoweredAttack\) return false;[\s\S]*?const attackSequenceId = Number\(hitbox\.attackSequenceId\) \|\| 0;[\s\S]*?if \(attackSequenceId <= 0 \|\| this\.postDodgeAttackPayoffConsumedSequenceId === attackSequenceId\) return false;[\s\S]*?this\.postDodgeAttackPayoffConsumedSequenceId = attackSequenceId;[\s\S]*?return true;/,
        'player runtime should consume the post-dodge attack payoff at most once for the tagged empowered swing'
    );
    assert.match(
        source,
        /const armedAttackWindowMs = this\.armPostDodgeAttackWindow\(\);[\s\S]*?if \(armedAttackWindowMs > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'追猎'/,
        'dodge recovery should surface the counterattack route when it arms the empowered normal-attack window'
    );
    assert.match(
        source,
        /const specialStaminaRefund = this\.player\.grantSpecialHitStamina\(hb\.isSpecial\);[\s\S]*?if \(specialStaminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'调息\+'\s*\+\s*specialStaminaRefund[\s\S]*?this\.armStaminaPayoffPulse\(specialStaminaRefund\);/,
        'enemy-hit processing should surface the special-hit stamina refund only when specials actually cash it out'
    );
    assert.match(
        source,
        /const specialStaminaRefund = this\.player\.grantSpecialHitStamina\(hb\.isSpecial\);[\s\S]*?if \(specialStaminaRefund > 0\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'调息\+'\s*\+\s*specialStaminaRefund[\s\S]*?this\.armStaminaPayoffPulse\(specialStaminaRefund\);/,
        'boss-hit processing should mirror the special-hit stamina refund feedback and pulse'
    );
    assert.match(
        source,
        /if \(typeof this\.player\.consumePostDodgeAttackPayoff === 'function' && this\.player\.consumePostDodgeAttackPayoff\(hb\)\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'追猎斩'/,
        'hit processing should add a distinct counterattack payoff cue only when the tagged empowered normal attack actually lands'
    );
    assert.match(
        source,
        /getCombatAttackStatusLabel\(now\)\s*{[\s\S]*?const attackWindowMs = Math\.max\(0,\s*Math\.round\(runEffects\.playerPostDodgeAttackWindowMs \|\| 0\)\);[\s\S]*?const attackMultiplier = Math\.max\(1,\s*Number\(runEffects\.playerPostDodgeAttackDamageMultiplier\) \|\| 1\);[\s\S]*?if \(attackWindowMs > 0 && attackMultiplier > 1\) \{[\s\S]*?return `追猎\$\{seconds\.toFixed\(1\)\}s`[\s\S]*?return '追猎待闪';/,
        'combat HUD state should expose the counterattack normal-attack identity with active-window countdown and idle waiting label'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?const specialStaminaGain = Math\.max\(0,\s*Math\.round\(runEffects\.playerSpecialHitStaminaGain \|\| 0\)\);[\s\S]*?if \(specialStaminaGain > 0\) \{[\s\S]*?return `调息\+\$\{specialStaminaGain\}`;/,
        'combat HUD state should expose the special-hit stamina identity on the special row when the sustain route is active'
    );
}

function testWeaponRoutingRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /tryAttack\(\)\s*{[\s\S]*?const attackCooldownScale = runEffects\.playerAttackCooldownMultiplier \|\| 1;[\s\S]*?const weaponRoutingAttackCooldownScale = weapon\.type === 'melee' \? \(runEffects\.playerMeleeAttackCooldownMultiplier \|\| 1\) : 1;[\s\S]*?this\.attackCooldown = Math\.max\(120,\s*Math\.round\(weapon\.attackSpeed \* attackCooldownScale \* weaponRoutingAttackCooldownScale\)\);[\s\S]*?const weaponRoutingAttackPayoffActive = weapon\.type === 'melee' && \(runEffects\.playerMeleeAttackCooldownMultiplier \|\| 1\) < 1;[\s\S]*?const weaponRoutingAttackSavedMs = weaponRoutingAttackPayoffActive[\s\S]*?weaponRoutingAttackSavedMs[\s\S]*?weaponRoutingAttackPayoffActive/,
        'player attack runtime should apply the weapon-routing melee cadence bonus only while a melee weapon is equipped and tag routed melee hits for payoff cues'
    );
    assert.match(
        source,
        /trySpecialAttack\(\)\s*{[\s\S]*?const specialCdScale = runEffects\.playerSpecialCooldownMultiplier \|\| 1;[\s\S]*?const weaponRoutingSpecialCdScale = weapon\.type === 'ranged' \? \(runEffects\.playerRangedSpecialCooldownMultiplier \|\| 1\) : 1;[\s\S]*?this\.specialCooldown = Math\.max\(450,\s*Math\.round\(weapon\.specialCooldown \* specialCdScale \* weaponRoutingSpecialCdScale\)\);[\s\S]*?const weaponRoutingSpecialPayoffActive = weapon\.type === 'ranged' && \(runEffects\.playerRangedSpecialCooldownMultiplier \|\| 1\) < 1;[\s\S]*?const weaponRoutingSpecialSavedMs = weaponRoutingSpecialPayoffActive[\s\S]*?weaponRoutingSpecialSavedMs[\s\S]*?weaponRoutingSpecialPayoffActive/,
        'player special runtime should apply the weapon-routing ranged cadence bonus only while a ranged weapon is equipped and tag routed ranged specials for payoff cues'
    );
    assert.match(
        source,
        /_armWeaponRoutingReadyCue\(\)\s*{[\s\S]*?const meleeAttackCooldownTag = formatRunEffectReductionTag\(runEffects\.playerMeleeAttackCooldownMultiplier\);[\s\S]*?if \(meleeAttackCooldownTag && currentWeapon\.type === 'melee'\) \{[\s\S]*?this\.weaponRoutingAttackReadyCueUntil = Math\.max\(this\.weaponRoutingAttackReadyCueUntil \|\| 0, now \+ 480\);[\s\S]*?\}[\s\S]*?const rangedSpecialCooldownTag = formatRunEffectReductionTag\(runEffects\.playerRangedSpecialCooldownMultiplier\);[\s\S]*?if \(rangedSpecialCooldownTag && currentWeapon\.type === 'ranged'\) \{[\s\S]*?this\.weaponRoutingSpecialReadyCueUntil = Math\.max\(this\.weaponRoutingSpecialReadyCueUntil \|\| 0, now \+ 480\);[\s\S]*?\}[\s\S]*?getCombatAttackStatusLabel\(now\)\s*{[\s\S]*?const meleeAttackCooldownTag = formatRunEffectReductionTag\(runEffects\.playerMeleeAttackCooldownMultiplier\);[\s\S]*?if \(meleeAttackCooldownTag\) \{[\s\S]*?const attackReadyCueUntil = Number\(this\.weaponRoutingAttackReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < attackReadyCueUntil && this\.currentWeapon && this\.currentWeapon\.type === 'melee'\) \{[\s\S]*?return '压阵就位';[\s\S]*?\}[\s\S]*?return this\.currentWeapon && this\.currentWeapon\.type === 'melee'\s*\?\s*`压阵\$\{meleeAttackCooldownTag\}`\s*:\s*'压阵切近战';[\s\S]*?\}[\s\S]*?if \(hb\.weaponRoutingAttackPayoffActive && !hb\.isSpecial\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?`压阵省\$\{savedSeconds\.toFixed\(1\)\}s`/,
        'combat HUD state should expose the melee-routing shrine identity, show a switch prompt while the wrong weapon type is equipped, and confirm routed melee hits when they cash out'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?const rangedSpecialCooldownTag = formatRunEffectReductionTag\(runEffects\.playerRangedSpecialCooldownMultiplier\);[\s\S]*?if \(rangedSpecialCooldownTag\) \{[\s\S]*?const specialReadyCueUntil = Number\(this\.weaponRoutingSpecialReadyCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < specialReadyCueUntil && this\.currentWeapon && this\.currentWeapon\.type === 'ranged'\) \{[\s\S]*?return '离弦就位';[\s\S]*?\}[\s\S]*?return this\.currentWeapon && this\.currentWeapon\.type === 'ranged'\s*\?\s*`离弦\$\{rangedSpecialCooldownTag\}`\s*:\s*'离弦切远程';[\s\S]*?\}[\s\S]*?if \(hb\.weaponRoutingSpecialPayoffActive && hb\.isSpecial\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?`离弦省\$\{savedSeconds\.toFixed\(1\)\}s`/,
        'combat HUD state should expose the ranged-routing shrine identity, show a switch prompt while the wrong weapon type is equipped, and confirm routed ranged specials when they cash out'
    );
    assert.match(
        source,
        /attackStatusLabel:\s*typeof player\.getCombatAttackStatusLabel === 'function'\s*\?\s*player\.getCombatAttackStatusLabel\(this\.time\.now\)\s*:\s*''[\s\S]*?specialStatusLabel:\s*typeof player\.getCombatSpecialStatusLabel === 'function'\s*\?\s*player\.getCombatSpecialStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should forward the weapon-routing attack and special labels into the shared action HUD'
    );
}

function testRiskRewardRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /isLowHpDamageRouteActive\(\)\s*{[\s\S]*?const thresholdRatio = Math\.max\(0,\s*Math\.min\(1,\s*Number\(runEffects\.playerLowHpThresholdRatio\) \|\| 0\)\);[\s\S]*?const multiplier = Math\.max\(1,\s*Number\(runEffects\.playerLowHpDamageMultiplier\) \|\| 1\);[\s\S]*?return thresholdRatio > 0 && multiplier > 1 && this\.maxHp > 0 && this\.hp \/ this\.maxHp <= thresholdRatio;/,
        'player runtime should expose a dedicated low-HP route helper keyed off the configured threshold and multiplier'
    );
    assert.match(
        source,
        /isHighHpGuardRouteActive\(\)\s*{[\s\S]*?const thresholdRatio = Math\.max\(0,\s*Math\.min\(1,\s*Number\(runEffects\.playerHighHpThresholdRatio\) \|\| 0\)\);[\s\S]*?const multiplier = Math\.max\(0,\s*Number\(runEffects\.playerHighHpDamageTakenMultiplier\) \|\| 1\);[\s\S]*?return thresholdRatio > 0 && multiplier > 0 && multiplier < 1 && this\.maxHp > 0 && this\.hp \/ this\.maxHp >= thresholdRatio;/,
        'player runtime should expose a dedicated high-HP guard helper keyed off the configured threshold and mitigation value'
    );
    assert.match(
        source,
        /getCombatAttackStatusLabel\(now\)\s*{[\s\S]*?const lowHpDamageTag = formatRunEffectIncreaseTag\(runEffects\.playerLowHpDamageMultiplier\);[\s\S]*?const lowHpThresholdPercent = Math\.round\(Math\.max\(0,\s*Math\.min\(1,\s*Number\(runEffects\.playerLowHpThresholdRatio\) \|\| 0\)\s*\*\s*100\)\);[\s\S]*?if \(lowHpDamageTag && lowHpThresholdPercent > 0\) \{[\s\S]*?return this\.isLowHpDamageRouteActive\(\)\s*\?\s*`绝境\$\{lowHpDamageTag\}`\s*:\s*`绝境<\$\{lowHpThresholdPercent\}%`[\s\S]*?\}/,
        'combat HUD attack row should expose the low-HP burst route as a threshold prompt when inactive and a live bonus tag when active'
    );
    assert.match(
        source,
        /getCombatDodgeStatusLabel\(now\)\s*{[\s\S]*?const highHpGuardTag = formatRunEffectReductionTag\(runEffects\.playerHighHpDamageTakenMultiplier\);[\s\S]*?const highHpThresholdPercent = Math\.round\(Math\.max\(0,\s*Math\.min\(1,\s*Number\(runEffects\.playerHighHpThresholdRatio\) \|\| 0\)\s*\*\s*100\)\);[\s\S]*?if \(highHpGuardTag && highHpThresholdPercent > 0\) \{[\s\S]*?return this\.isHighHpGuardRouteActive\(\)\s*\?\s*`守心\$\{highHpGuardTag\}`\s*:\s*`守心>\$\{highHpThresholdPercent\}%`[\s\S]*?\}/,
        'combat HUD dodge row should expose the high-HP guard route as a threshold prompt when inactive and a live mitigation tag when active'
    );
    assert.match(
        source,
        /getDamageMultiplier\(\)\s*{[\s\S]*?let mult = runEffects\.playerDamageMultiplier \|\| 1;[\s\S]*?if \(typeof this\.isLowHpDamageRouteActive === 'function' && this\.isLowHpDamageRouteActive\(\)\) \{[\s\S]*?mult \*= Math\.max\(1,\s*Number\(runEffects\.playerLowHpDamageMultiplier\) \|\| 1\);[\s\S]*?\}[\s\S]*?return mult;/,
        'player outgoing damage should consume the low-HP route only while the configured danger threshold is active'
    );
    assert.match(
        source,
        /takeDamage\(amount,\s*options\)\s*{[\s\S]*?const incomingScale = opts\.ignoreRunModifier \? 1 : \(runEffects\.playerDamageTakenMultiplier \|\| 1\);[\s\S]*?const highHpGuardScale = typeof this\.isHighHpGuardRouteActive === 'function' && this\.isHighHpGuardRouteActive\(\)\s*\?\s*Math\.max\(0,\s*Number\(runEffects\.playerHighHpDamageTakenMultiplier\) \|\| 1\)\s*:\s*1;[\s\S]*?const finalDamage = Math\.max\(1,\s*Math\.round\(\(Number\(amount\) \|\| 0\) \* incomingScale \* highHpGuardScale\)\);[\s\S]*?showFloatingCombatText\([\s\S]*?'-' \+ finalDamage[\s\S]*?if \(highHpGuardScale < 1 && !opts\.silent\) \{[\s\S]*?showFloatingCombatText\([\s\S]*?'守心'/,
        'player incoming damage should consume the high-HP mitigation route only while the guard threshold is active and show a distinct defense cue'
    );
    assert.match(
        source,
        /tryAttack\(\)\s*{[\s\S]*?const isLowHpDamageEmpowered = typeof this\.isLowHpDamageRouteActive === 'function' && this\.isLowHpDamageRouteActive\(\);[\s\S]*?return this\._spawnHitbox\([\s\S]*?isLowHpDamageEmpowered[\s\S]*?\}\);/,
        'player attack runtime should tag spawned hitboxes when the low-HP damage route is actively empowering outgoing hits'
    );
    assert.match(
        source,
        /trySpecialAttack\(\)\s*{[\s\S]*?const isLowHpDamageEmpowered = typeof this\.isLowHpDamageRouteActive === 'function' && this\.isLowHpDamageRouteActive\(\);[\s\S]*?return this\._spawnHitbox\([\s\S]*?isLowHpDamageEmpowered[\s\S]*?\);/,
        'player special runtime should also tag spawned hitboxes when the low-HP damage route is actively empowering outgoing hits'
    );
    assert.match(
        source,
        /const isLowHpDamageEmpowered = !!meta\.isLowHpDamageEmpowered;[\s\S]*?arrow\.isLowHpDamageEmpowered = isLowHpDamageEmpowered[\s\S]*?orb\.isLowHpDamageEmpowered = isLowHpDamageEmpowered[\s\S]*?slam\.isLowHpDamageEmpowered = isLowHpDamageEmpowered[\s\S]*?hitbox\.isLowHpDamageEmpowered = isLowHpDamageEmpowered/,
        'spawned hitboxes should carry the low-HP empowered marker across every weapon attack pattern'
    );
    assert.match(
        source,
        /if \(hb\.isLowHpDamageEmpowered\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?'绝境'/,
        'hit processing should add a distinct risk-route payoff cue only when the threshold-gated low-HP burst is actually active on impact'
    );
    assert.match(
        source,
        /attackStatusLabel:\s*typeof player\.getCombatAttackStatusLabel === 'function'\s*\?\s*player\.getCombatAttackStatusLabel\(this\.time\.now\)\s*:\s*''[\s\S]*?dodgeStatusLabel:\s*typeof player\.getCombatDodgeStatusLabel === 'function'\s*\?\s*player\.getCombatDodgeStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should forward the risk/reward shrine threshold labels into the shared action HUD'
    );
}

function testStatusRoutingRunEffectHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /_spawnHitbox\(damage,\s*scale,\s*isSpecial,\s*isEmpoweredSpecial,\s*meta = \{\}\)\s*{[\s\S]*?const specialStatus = isSpecial \? getWeaponSpecialStatus\(weaponKey\) : null;[\s\S]*?const burnDurationScale = specialStatus && specialStatus\.key === 'burn' \? Math\.max\(1,\s*Number\(runEffects\.playerBurnStatusDurationMultiplier\) \|\| 1\) : 1;[\s\S]*?const burnDamageScale = specialStatus && specialStatus\.key === 'burn' \? Math\.max\(1,\s*Number\(runEffects\.playerBurnStatusDamageMultiplier\) \|\| 1\) : 1;[\s\S]*?const bleedDurationScale = specialStatus && specialStatus\.key === 'bleed' \? Math\.max\(1,\s*Number\(runEffects\.playerBleedStatusDurationMultiplier\) \|\| 1\) : 1;[\s\S]*?const bleedDamageScale = specialStatus && specialStatus\.key === 'bleed' \? Math\.max\(1,\s*Number\(runEffects\.playerBleedStatusDamageMultiplier\) \|\| 1\) : 1;[\s\S]*?durationMs:\s*Math\.max\(600,\s*Math\.round\(specialStatus\.durationMs \* burnDurationScale \* bleedDurationScale\)\),[\s\S]*?sourceDamage:\s*Math\.max\(1,\s*Math\.round\(damage \* burnDamageScale \* bleedDamageScale\)\),[\s\S]*?routePayoffLabel:\s*specialStatus\.key === 'burn'\s*\?\s*'余烬'\s*:\s*\(specialStatus\.key === 'bleed' \? '血痕' : ''\)/,
        'special hitboxes should scale burn and bleed payloads from the routed run effects and carry a route payoff label'
    );
    assert.match(
        source,
        /if \(hb\.statusEffect && enemy\.applyStatusEffect\) \{[\s\S]*?const didApplyStatus = enemy\.applyStatusEffect\([\s\S]*?if \(didApplyStatus && hb\.statusEffect\.routePayoffLabel\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?hb\.statusEffect\.routePayoffLabel/,
        'enemy hit processing should add a distinct payoff cue when a routed burn or bleed status is actually applied'
    );
    assert.match(
        source,
        /if \(hb\.statusEffect && this\.boss\.applyStatusEffect\) \{[\s\S]*?const didApplyStatus = this\.boss\.applyStatusEffect\([\s\S]*?if \(didApplyStatus && hb\.statusEffect\.routePayoffLabel\) \{[\s\S]*?showHitImpactPulse\([\s\S]*?showFloatingCombatText\([\s\S]*?hb\.statusEffect\.routePayoffLabel/,
        'boss hit processing should also add the routed status payoff cue when burn or bleed is successfully applied'
    );
    assert.match(
        source,
        /getCombatSpecialStatusLabel\(now\)\s*{[\s\S]*?const slowDurationTag = formatRunEffectIncreaseTag\(runEffects\.playerSlowStatusDurationMultiplier\);[\s\S]*?if \(slowDurationTag\) \{[\s\S]*?return weaponStatus && weaponStatus\.key === 'slow'\s*\?\s*`镇步\$\{slowDurationTag\}`\s*:\s*'镇步切减速';[\s\S]*?\}[\s\S]*?const burnDurationTag = formatRunEffectIncreaseTag\(runEffects\.playerBurnStatusDurationMultiplier\);[\s\S]*?const burnDamageTag = formatRunEffectIncreaseTag\(runEffects\.playerBurnStatusDamageMultiplier\);[\s\S]*?if \(burnDurationTag && burnDamageTag\) \{[\s\S]*?return weaponStatus && weaponStatus\.key === 'burn'\s*\?\s*`余烬\$\{burnDurationTag\}\/\$\{burnDamageTag\}`\s*:\s*'余烬切灼烧';[\s\S]*?\}[\s\S]*?const bleedDurationTag = formatRunEffectIncreaseTag\(runEffects\.playerBleedStatusDurationMultiplier\);[\s\S]*?const bleedDamageTag = formatRunEffectIncreaseTag\(runEffects\.playerBleedStatusDamageMultiplier\);[\s\S]*?if \(bleedDurationTag && bleedDamageTag\) \{[\s\S]*?return weaponStatus && weaponStatus\.key === 'bleed'\s*\?\s*`血痕\$\{bleedDurationTag\}\/\$\{bleedDamageTag\}`\s*:\s*'血痕切流血';[\s\S]*?\}[\s\S]*?const damageVsSlowedTag = formatRunEffectIncreaseTag\(runEffects\.playerDamageVsSlowedMultiplier\);[\s\S]*?if \(damageVsSlowedTag\) \{[\s\S]*?if \(\(Number\(now\) \|\| 0\) < finisherReadyUntil\) \{[\s\S]*?return '破势终结';[\s\S]*?\}[\s\S]*?const controlPayoffCueUntil = Number\(this\.controlPayoffCueUntil\) \|\| 0;[\s\S]*?if \(\(Number\(now\) \|\| 0\) < controlPayoffCueUntil\) \{[\s\S]*?return '破势命中';[\s\S]*?\}[\s\S]*?const weaponSupportsSlow = weaponStatus && weaponStatus\.key === 'slow';[\s\S]*?if \(!weaponSupportsSlow\) \{[\s\S]*?return '破势切减速';[\s\S]*?\}[\s\S]*?return statusSummaryText && \/减速\/.test\(statusSummaryText\)[\s\S]*?\? `破势\$\{damageVsSlowedTag\}`[\s\S]*?: '破势待命中';[\s\S]*?\}/,
        'combat HUD special row should expose the routed slow/control identity and show a switch prompt or payoff tag when applicable'
    );
    assert.match(
        source,
        /specialStatusLabel:\s*typeof player\.getCombatSpecialStatusLabel === 'function'\s*\?\s*player\.getCombatSpecialStatusLabel\(this\.time\.now\)\s*:\s*''/,
        'combat HUD state should forward the status-routing shrine label into the shared action HUD'
    );

    const readme = loadReadmeSource();
    assert.match(
        readme,
        /若已选 `镇压圣坛` 的 `镇步修习`，`特攻 O` 在持有附带减速的武器时会显示 `镇步\+45%`，切到其他武器则改成 `镇步切减速`，而当强化后的减速真正命中挂上时还会补一个 `镇步` 提示；若已选 `破势修习`，`特攻 O` 在持有可附带减速的武器但目标尚未进入减速时会先显示 `破势待命中`，切到其他武器则改成 `破势切减速`，目标已处于减速时才会切成 `破势\+28%`，而当这段对减速目标的加伤真正命中兑现时会先短促切成 `破势命中`，同时继续保留命中处的 `破势` 浮字/,
        'README should document the control-routing shrine HUD labels, mismatch prompts, and on-hit payoff cues'
    );
    assert.match(
        readme,
        /`镇压圣坛`（在 `镇步修习` 的减速强化与 `破势修习` 的对减速目标加伤 \/ Boss 破招窗口终结兑现之间二选一）/,
        'README should list the new control-routing shrine in the event-room roster'
    );
}

function testBossActionHudBottomLayoutGuard() {
    assert.equal(typeof buildPlayerHudLayout, 'function', 'screen HUD layout helper should be exported');
    const regularLayout = buildPlayerHudLayout({ width: 1024, isBossLayout: false });
    assert.equal(regularLayout.pad, 16, 'regular HUD layout should keep the shared top pad');
    assert.equal(regularLayout.bottomPad, 16, 'regular HUD layout should keep the stable bottom pad');
    assert.equal(regularLayout.sidePanelStartY, 26, 'regular HUD layout should start the sidebar beneath the top bars');
    assert.equal(regularLayout.showSidePanel, true, 'regular HUD layout should keep the sidebar visible');

    const bossLayout = buildPlayerHudLayout({ width: 1024, isBossLayout: true });
    assert.equal(bossLayout.pad, 8, 'boss HUD layout should tighten only the top pad');
    assert.equal(bossLayout.bottomPad, 16, 'boss HUD layout should preserve the stable bottom pad for aim, weapon, and action rows');
    assert.equal(bossLayout.sidePanelStartY, 112, 'boss HUD layout should keep the boss-fight sidebar guard height');
    assert.equal(bossLayout.showSidePanel, false, 'boss HUD layout should hide the sidebar while the boss HUD is active');

    const source = loadGameSource();
    assert.match(
        source,
        /const quickSlotPad = this\._hudLayout\.bottomPad;[\s\S]*?const slotsStartX = width - quickSlotPad - \(4 \* slotSize \+ 3 \* slotGap\);[\s\S]*?const slotsY = height - quickSlotPad - slotSize;/,
        'quick-slot boxes should anchor to the stable bottom pad so boss-layout top compression does not drag the quick bar'
    );
}

function testInventoryTooltipClampXHelper() {
    assert.equal(typeof getViewportTextClampX, 'function', 'generic viewport text clamp helper should be exported');
    assert.equal(typeof getViewportCenteredTextClampX, 'function', 'centered viewport text clamp helper should be exported');
    assert.equal(typeof getInventoryTooltipClampX, 'function', 'inventory tooltip clamp helper should be exported');
    assert.equal(
        getViewportTextClampX(120, 80, 1024),
        120,
        'generic clamp should keep positions that already fit within the viewport'
    );
    assert.equal(
        getViewportTextClampX(940, 180, 1024),
        834,
        'generic clamp should shift overly wide labels left by their rendered width near the right edge'
    );
    assert.equal(
        getViewportTextClampX(1990, 120, 1024, 10, 1024),
        1918,
        'generic clamp should support world-space viewport offsets'
    );
    assert.equal(
        getViewportCenteredTextClampX(120, 80, 1024),
        120,
        'centered clamp should keep anchors that already fit within the viewport'
    );
    assert.equal(
        getViewportCenteredTextClampX(40, 180, 1024),
        100,
        'centered clamp should shift long centered labels right when their left half would leave the viewport'
    );
    assert.equal(
        getViewportCenteredTextClampX(980, 180, 1024),
        924,
        'centered clamp should shift long centered labels left when their right half would leave the viewport'
    );
    assert.equal(
        getViewportCenteredTextClampX(1990, 120, 1024, 10, 1024),
        1978,
        'centered clamp should respect viewport offsets for world-space centered labels'
    );
    assert.equal(
        getInventoryTooltipClampX(120, 80, 1024),
        120,
        'tooltip clamp should keep positions that already fit within the viewport'
    );
    assert.equal(
        getInventoryTooltipClampX(940, 180, 1024),
        834,
        'tooltip clamp should shift overly wide tooltips left by their real rendered width near the right edge'
    );
    assert.equal(
        getInventoryTooltipClampX(0, 180, 1024),
        10,
        'tooltip clamp should preserve the minimum left padding'
    );
}

function testMeasuredTextClampHelper() {
    assert.equal(typeof clampTextToWidth, 'function', 'measured text clamp helper should be exported');
    const glyphWidths = {
        '类': 10,
        '型': 10,
        ' ': 4,
        '特': 10,
        '殊': 10,
        '|': 4,
        '幻': 10,
        '影': 10,
        '风': 10,
        '暴': 10,
        '…': 8,
        'H': 6,
        'P': 6,
        '恢': 10,
        '复': 10,
        '1': 6,
        '2': 6,
        '3': 6,
        '.': 4
    };
    const measureGlyphWidth = (glyph) => glyphWidths[glyph] || 10;
    assert.equal(
        clampTextToWidth('HP恢复', 40, { measureGlyphWidth }),
        'HP恢复',
        'measured clamp should keep text that already fits'
    );
    assert.equal(
        clampTextToWidth('类型 特殊 | 幻影风暴', 70, { measureGlyphWidth }),
        '类型 特殊 | …',
        'measured clamp should ellipsize long strings against measured glyph widths'
    );
    assert.equal(typeof clampTextLinesToWidth, 'function', 'multiline measured clamp helper should be exported');
    assert.deepEqual(
        clampTextLinesToWidth(['本局挑战：已完成', '击败 30 个敌人', '进度:30/30  奖励:+90金'], 68, { measureGlyphWidth }),
        ['本局挑战：已…', '击败 30 个…', '进度:30/…'],
        'multiline measured clamp should fit each sidebar line independently against measured widths'
    );
    assert.equal(typeof clampTextLinesToWidthAndCount, 'function', 'measured text line-cap helper should be exported');
    assert.deepEqual(
        clampTextLinesToWidthAndCount(['1. 暴怒连战', '2. 永夜诅咒', '3. 贪婪税'], 60, 2, { measureGlyphWidth }),
        ['1. 暴怒连战', '2. 永夜诅…'],
        'line-cap helper should preserve earlier fitted lines and ellipsize the final visible line when additional lines are dropped'
    );
}

function testHudSidebarViewportPolicy() {
    assert.equal(typeof getHudSidebarViewportTier, 'function', 'sidebar viewport-tier helper should be exported');
    assert.equal(typeof getHudSidebarResponsiveMetrics, 'function', 'sidebar responsive metrics helper should be exported');
    assert.equal(typeof getHudSidebarHeadingBadgeMetrics, 'function', 'sidebar heading badge metrics helper should be exported');
    assert.equal(getHudSidebarViewportTier(1280, 800), 'regular', 'wide/tall viewports should keep the regular sidebar tier');
    assert.equal(getHudSidebarViewportTier(1024, 900), 'compact', 'narrow viewports should downgrade the sidebar tier to compact');
    assert.equal(getHudSidebarViewportTier(1280, 680), 'ultraCompact', 'short viewports should downgrade the sidebar tier to ultra-compact');
    assert.equal(getHudSidebarViewportTier(900, 900), 'ultraCompact', 'very narrow viewports should downgrade the sidebar tier to ultra-compact');
    assert.deepEqual(
        getHudSidebarResponsiveMetrics(1400, 900, 900, 640),
        {
            displayWidth: 1400,
            displayHeight: 900,
            viewportTier: 'regular',
            maxWidth: 320
        },
        'sidebar responsive metrics should keep the regular tier when actual display size is roomy even if the logical viewport still looks cramped'
    );
    assert.deepEqual(
        getHudSidebarResponsiveMetrics(390, 844, 1024, 768),
        {
            displayWidth: 390,
            displayHeight: 844,
            viewportTier: 'ultraCompact',
            maxWidth: 294
        },
        'sidebar responsive metrics should use actual display size to trigger the tighter ultra-compact budget on narrow screens'
    );
    assert.deepEqual(
        getHudSidebarResponsiveMetrics(undefined, undefined, 1024, 768),
        {
            displayWidth: 1024,
            displayHeight: 768,
            viewportTier: 'compact',
            maxWidth: 320
        },
        'sidebar responsive metrics should fall back to the logical viewport when display-size data is unavailable'
    );
    assert.deepEqual(
        getHudSidebarResponsiveMetrics(220, 640, 1024, 768),
        {
            displayWidth: 220,
            displayHeight: 640,
            viewportTier: 'ultraCompact',
            maxWidth: 124
        },
        'sidebar responsive metrics should expose the much tighter badge-width budgets needed on extremely small displays'
    );
    assert.equal(typeof getHudSidebarLineCap, 'function', 'sidebar line-cap policy helper should be exported');
    assert.equal(typeof getHudSidebarOverflowPolicy, 'function', 'sidebar overflow policy helper should be exported');
    assert.equal(getHudSidebarLineCap('challengeSidebar', 'regular'), 0, 'regular sidebar tiers should not cap challenge lines');
    assert.equal(getHudSidebarLineCap('runModifierSidebar', 'compact'), 2, 'compact sidebars should keep two run-modifier lines');
    assert.equal(getHudSidebarLineCap('eventRoomSidebar', 'compact'), 3, 'compact sidebars should keep three event-room lines');
    assert.equal(getHudSidebarLineCap('runModifierSidebar', 'ultraCompact'), 1, 'ultra-compact sidebars should collapse run modifiers to one line');
    assert.equal(getHudSidebarLineCap('challengeSidebar', 'ultraCompact'), 1, 'ultra-compact sidebars should collapse challenge copy to one line');
    assert.equal(getHudSidebarLineCap('eventRoomSidebar', 'ultraCompact'), 2, 'ultra-compact sidebars should keep only two event-room lines');
    assert.deepEqual(
        getHudSidebarOverflowPolicy('regular'),
        {
            maxBottomInset: 96,
            gaps: {
                areaNameText: 4,
                runModifierTitle: 2,
                runModifierText: 12,
                challengeText: 12,
                eventRoomText: 0
            },
            droppable: {
                runModifierText: true,
                challengeText: false,
                eventRoomText: true
            },
            collapsePriority: {
                runModifierText: 2,
                challengeText: 1,
                eventRoomText: 3
            }
        },
        'regular sidebar overflow policy should preserve the existing spacing and drop order'
    );
    assert.deepEqual(
        getHudSidebarOverflowPolicy('ultraCompact'),
        {
            maxBottomInset: 72,
            gaps: {
                areaNameText: 2,
                runModifierTitle: 1,
                runModifierText: 8,
                challengeText: 8,
                eventRoomText: 0
            },
            droppable: {
                runModifierText: true,
                challengeText: true,
                eventRoomText: true
            },
            collapsePriority: {
                runModifierText: 2,
                challengeText: 1,
                eventRoomText: 3
            }
        },
        'ultra-compact sidebar overflow policy should tighten spacing and allow challenge copy to drop last'
    );
}

function testRunChallengeSidebarLines() {
    assert.equal(typeof buildRunChallengeSidebarLines, 'function', 'run challenge sidebar helper should be exported');
    assert.equal(typeof buildRunChallengeSidebarBadge, 'function', 'run challenge badge helper should be exported');
    assert.equal(
        typeof getRunChallengeInProgressInvalidTargetVisibleFallbacks,
        'function',
        'in-progress invalid-target visible fallback helper should be exported'
    );
    assert.equal(
        typeof getRunChallengeCompletedInvalidTargetVisibleFallbacks,
        'function',
        'completed invalid-target visible fallback helper should be exported'
    );
    assert.equal(typeof getRunChallengeUltraCompactSummaryVariants, 'function', 'ultra-compact visible challenge summary variants helper should be exported');
    assert.equal(typeof getRunChallengeUltraCompactInProgressSummaryVariants, 'function', 'ultra-compact visible in-progress summary variants helper should be exported');
    assert.equal(typeof getRunChallengeUltraCompactCompletedSummaryVariants, 'function', 'ultra-compact visible completed summary variants helper should be exported');
    assert.equal(typeof getRunChallengeRegularInProgressDetailVariants, 'function', 'regular in-progress challenge detail variants helper should be exported');
    assert.equal(typeof getRunChallengeRegularCompletedDetailVariants, 'function', 'regular completed challenge detail variants helper should be exported');
    assert.equal(typeof getRunChallengeCompactInProgressDetailVariants, 'function', 'compact in-progress challenge detail variants helper should be exported');
    assert.equal(typeof getRunChallengeCompactCompletedDetailVariants, 'function', 'compact completed challenge detail variants helper should be exported');
    assert.equal(typeof formatRunChallengeRewardShortLabel, 'function', 'run challenge reward short-label helper should be exported');
    assert.equal(typeof getRunChallengeCompletedBadgeVariants, 'function', 'completed run challenge badge variants helper should be exported');
    assert.equal(typeof getRunChallengeHiddenInProgressBadgeVariants, 'function', 'hidden in-progress challenge badge variants helper should be exported');
    assert.equal(typeof getRunChallengeSidebarBadgeAppearance, 'function', 'run challenge badge appearance helper should be exported');
    const measureBadgeWidth = (label) => Array.from(label).reduce((sum, glyph) => sum + ({
        '完': 10,
        '成': 10,
        '进': 10,
        '金': 10,
        '+': 6,
        '/': 6,
        '0': 6,
        '1': 6,
        '2': 6,
        '3': 6,
        '9': 6
    }[glyph] || 10), 0);
    const measureCompletedBadgeWidth = (label) => Array.from(label).reduce((sum, glyph) => sum + ({
        '完': 15,
        '成': 15,
        '金': 15,
        '+': 8,
        '9': 8,
        '0': 8
    }[glyph] || 10), 0);
    const measureTightProgressBadgeWidth = (label) => Array.from(label).reduce((sum, glyph) => sum + ({
        '进': 14,
        '1': 8,
        '2': 8
    }[glyph] || 10), 0);
    const measureChallengeSummaryWidth = (label) => Array.from(label).reduce((sum, glyph) => sum + ({
        '挑': 12,
        '战': 12,
        '完': 12,
        '成': 12,
        '金': 12,
        '+': 6,
        '·': 4,
        '/': 6,
        ' ': 4,
        '0': 6,
        '1': 6,
        '2': 6,
        '3': 6,
        '9': 6
    }[glyph] || 10), 0);
    assert.deepEqual(
        getRunChallengeInProgressInvalidTargetVisibleFallbacks(''),
        {
            compactTitle: '本局挑战：进行中',
            compactDetailVariants: [],
            regularDetailVariants: ['进行中'],
            ultraCompactSummaryVariants: ['挑战进行中', '进行中']
        },
        'in-progress invalid-target visible fallback helper should expose the shared no-reward state-first ladders for regular, compact, and ultra-compact summaries'
    );
    assert.deepEqual(
        getRunChallengeCompletedInvalidTargetVisibleFallbacks(''),
        {
            compactTitle: '本局挑战：已完成',
            compactDetailVariants: [],
            regularDetailVariants: ['已完成'],
            ultraCompactSummaryVariants: ['挑战完成', '完成']
        },
        'completed invalid-target visible fallback helper should expose the shared no-reward state-first ladders for regular, compact, and ultra-compact summaries'
    );
    assert.deepEqual(
        getRunChallengeInProgressInvalidTargetVisibleFallbacks('+90金', '未知挑战'),
        {
            compactTitle: '本局挑战：进行中',
            compactDetailVariants: ['未知挑战 · +90金', '未知挑战'],
            regularDetailVariants: ['进行中  奖励:+90金', '进行中'],
            ultraCompactSummaryVariants: ['挑战进行中 · +90金', '挑战进行中', '进行中']
        },
        'in-progress invalid-target visible fallback helper should expose the shared reward-bearing ladders for regular, compact, and ultra-compact summaries'
    );
    assert.deepEqual(
        getRunChallengeCompletedInvalidTargetVisibleFallbacks('+90金', '未知挑战'),
        {
            compactTitle: '本局挑战：已完成',
            compactDetailVariants: ['未知挑战 · +90金', '未知挑战'],
            regularDetailVariants: ['已完成  奖励:+90金', '已完成'],
            ultraCompactSummaryVariants: ['挑战完成 · +90金', '挑战完成', '完成']
        },
        'completed invalid-target visible fallback helper should expose the shared reward-bearing ladders for regular, compact, and ultra-compact summaries'
    );
    assert.deepEqual(
        getRunChallengeRegularInProgressDetailVariants('12/30', ''),
        ['进度:12/30', '12/30'],
        'regular in-progress detail variants should keep the existing progress-first ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeRegularInProgressDetailVariants('', '+90金'),
        ['进行中  奖励:+90金', '进行中'],
        'regular in-progress detail variants should fall back to readable in-progress copy instead of 0/0 when the target is invalid'
    );
    assert.deepEqual(
        getRunChallengeRegularCompletedDetailVariants('30/30', ''),
        ['进度:30/30', '30/30'],
        'regular completed detail variants should keep the existing progress-first ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeCompactInProgressDetailVariants('击败 30 个敌人', ''),
        ['击败 30 个敌人', '击败30个敌人'],
        'compact in-progress detail variants should keep the existing label-first ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeCompactCompletedDetailVariants('击败 30 个敌人', ''),
        ['击败 30 个敌人', '击败30个敌人'],
        'compact completed detail variants should keep the existing label-first ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactInProgressSummaryVariants('12/30', ''),
        ['挑战 12/30', '12/30'],
        'ultra-compact visible in-progress summary variants should keep the existing progress-first ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactInProgressSummaryVariants('', '+90金'),
        ['挑战进行中 · +90金', '挑战进行中', '进行中'],
        'ultra-compact visible in-progress summary variants should fall back to readable in-progress copy instead of 0/0 when the target is invalid'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactCompletedSummaryVariants(''),
        ['挑战完成', '完成'],
        'ultra-compact visible completed summary variants should keep the existing completion ladder when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactSummaryVariants({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }),
        ['挑战 12/30 · +90金', '挑战 12/30', '12/30'],
        'ultra-compact visible in-progress summary variants should keep the existing progress-first ladder when the upstream label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactSummaryVariants({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }),
        ['挑战完成 · +90金', '挑战完成', '完成'],
        'ultra-compact visible completed summary variants should keep the existing completion ladder when the upstream label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactSummaryVariants({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }),
        ['挑战 12/30 · +9999金 +净化', '挑战 12/30', '12/30'],
        'ultra-compact visible in-progress summary variants should keep the same compound-reward ladder when the upstream label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeUltraCompactSummaryVariants({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }),
        ['挑战完成 · +9999金 +净化', '挑战完成', '完成'],
        'ultra-compact visible completed summary variants should keep the same compound-reward ladder when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        typeof getRunChallengeSafeSidebarLabel,
        'function',
        'run challenge safe sidebar-label helper should be exported'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('本局挑战：挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should fall back to 未知挑战 once repeated prefix stripping exhausts the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel(' 本局　挑战： 挑战： 本局  击败 30 个敌人 '),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip mixed 本局/挑战 prefixes even when upstream copy inserts half-width or full-width spaces between prefix tokens'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel(' 本局　挑战： 挑战： 本局 '),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when whitespace-padded mixed prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('本局：挑战：本局：击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip standalone 本局 prefixes even when they carry a colon that would otherwise block the next 挑战 cleanup pass'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('本局：挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when standalone 本局 colons exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('本局：挑战：：击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip orphan separators that remain after repeated prefix cleanup before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('挑战： - 击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip mixed colon and dash separators that remain ahead of the real body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('本局：挑战：： - '),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when repeated prefix cleanup leaves only orphan separators'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【本局挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip full-width bracketed challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('[挑战]击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip half-width bracketed challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［挑战］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip full-width square-bracket decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【本局挑战】挑战：本局：击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should keep stripping repeated plain-text prefixes after removing a bracketed challenge decorator'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［本局挑战］挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width square-bracket decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('(挑战)击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ASCII round-parenthesis decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('（本局挑战）挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width round-parenthesis decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【（挑战）】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and parenthesis challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('（［本局挑战］）挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and parenthesis decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【：挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat colon-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《：本局挑战》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when colon-prefixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【：】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip separator-only decorator payloads before rendering the real body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《-》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when separator-only decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('{挑战}击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ASCII curly-brace challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｛本局挑战｝挑战：击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip full-width curly-brace decorators before repeated plain-text prefix cleanup'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【｛挑战｝】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and curly challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｛［本局挑战］｝挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and curly decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('<挑战>击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ASCII angle-bracket challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('＜本局挑战＞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width angle-bracket decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('「挑战」击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip quoted challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('“挑战”击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip western smart-quote decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｢挑战｣击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip half-width corner-quote decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('『本局挑战』挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when quoted decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｢本局挑战｣挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when half-width corner-quote decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('‘本局挑战’挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when western smart-quote decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('"挑战"击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ASCII double-quote decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('\'本局挑战\'挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when ASCII single-quote decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《挑战》挑战：本局：击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip book-title challenge decorators before repeated plain-text prefix cleanup'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈本局挑战〉挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when book-title decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〈挑战〉〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip repeated corner-angle decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［［本局挑战］］挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when repeated full-width square decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('""挑战""击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip repeated ASCII double-quote decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("''本局挑战''挑战：本局"),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when repeated ASCII single-quote decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〝挑战〞〟击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip same-open ornamental quote stacks that close in double-prime then low-double-prime order before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〝本局挑战〞〟挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when same-open ornamental quote stacks close in double-prime then low-double-prime order and repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〝挑战〟〞击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip same-open ornamental quote stacks that close in low-double-prime then double-prime order before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〝本局挑战〟〞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when same-open ornamental quote stacks close in low-double-prime then double-prime order and repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈"挑战"〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and ASCII straight-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('"〈本局挑战〉"挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and ASCII straight-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("〈'挑战'〉击败 30 个敌人"),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and ASCII single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("'〈本局挑战〉'挑战：本局"),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and ASCII single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('﹁挑战﹂击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip presentation-form quote decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝挑战〞击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ornamental double-prime decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝挑战〟击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip ornamental low double-prime decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〘挑战〙击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip white tortoise-shell bracket decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〚挑战〛击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip white square bracket decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('﹃本局挑战﹄挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when presentation-form quote decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝本局挑战〞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when ornamental double-prime decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝本局挑战〟挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when ornamental low double-prime decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〘本局挑战〙挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when white tortoise-shell bracket decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〚本局挑战〛挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when white square bracket decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〔挑战〕击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip shell challenge decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〖本局挑战〗挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when lenticular decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〔-本局挑战〕挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should treat dash-prefixed decorator payloads as removable challenge wrappers before repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〖—挑战〗击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip dash-prefixed decorator payloads before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【—挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip em-dash-prefixed decorator payloads before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战–》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when en-dash-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【｜：挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat full-width leading separator chains inside decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《／本局挑战》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width leading separator chains plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【挑战｜】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip full-width trailing separator payloads before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战／》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width trailing separator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【、挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat comma-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战，》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when comma-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【；挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat semicolon-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战;》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when semicolon-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【。挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat period-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战。》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when period-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【!挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat exclamation-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战！》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width exclamation-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【·挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat middle-dot-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战•》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when bullet-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【|挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat pipe-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战/》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when slash-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【\\挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat backslash-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战\\》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when backslash-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【?挑战】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should treat question-prefixed decorator payloads as removable challenge wrappers before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《本局挑战？》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when full-width question-suffixed decorator payloads plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【「挑战」】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【"挑战"】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested ASCII straight-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【＜挑战＞】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and angle mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【《挑战》】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and book-title mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【『挑战』】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and corner-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【｢挑战｣】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and half-width corner-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【﹁挑战﹂】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and presentation-form mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〝挑战〞】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and ornamental double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〝挑战〟】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and ornamental low double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〘挑战〙】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and white tortoise-shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〚挑战〛】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and white square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〔挑战〕】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〖挑战〗】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and lenticular mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【“挑战”】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and curly double-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【‘挑战’】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and curly single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("【'挑战'】击败 30 个敌人"),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and ASCII single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【［挑战］】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and full-width square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【[挑战]】击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested square and ASCII square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［【挑战】］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［[挑战]］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and ASCII square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［｛挑战｝］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and full-width curly mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［（挑战）］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and parenthesis mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［＜挑战＞］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and angle mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［《挑战》］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and book-title mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［「挑战」］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and corner-bracket mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［"挑战"］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and ASCII straight-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〘挑战〙］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and white tortoise-shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［﹁挑战﹂］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and presentation-form mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〚挑战〛］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and white square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〔挑战〕］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〖挑战〗］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and lenticular mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［“挑战”］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and curly double-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［『挑战』］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and corner-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［｢挑战｣］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and half-width corner-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〝挑战〞］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and ornamental double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〝挑战〟］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and ornamental low double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［‘挑战’］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and curly single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("［'挑战'］击败 30 个敌人"),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and ASCII single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〈挑战〉］击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested full-width square and corner-angle mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈［挑战］〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and full-width square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈[挑战]〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and ASCII square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈【挑战】〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〘挑战〙〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and white tortoise-shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〚挑战〛〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and white square mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〔挑战〕〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and shell mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〖挑战〗〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and lenticular mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈“挑战”〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and curly double-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈‘挑战’〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and curly single-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈｢挑战｣〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and half-width corner-quote mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈﹁挑战﹂〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and presentation-form mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〝挑战〞〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and ornamental double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈〝挑战〟〉击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested corner-angle and ornamental low double-prime mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('[〈挑战〉]击败 30 个敌人'),
        '击败 30 个敌人',
        'run challenge safe sidebar-label helper should strip nested ASCII square and corner-angle mixed decorators before rendering the body label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《〔本局挑战〕》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《\'本局挑战\'》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested ASCII straight-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('＜［本局挑战］＞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and angle mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈［本局挑战］〉挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and corner-angle mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〈本局挑战〉］挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and full-width square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('[〈本局挑战〉]挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and ASCII square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【〈本局挑战〉】挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〘〈本局挑战〉〙挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and white tortoise-shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〚〈本局挑战〉〛挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and white square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〔〈本局挑战〉〕挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〖〈本局挑战〉〗挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and lenticular mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('“〈本局挑战〉”挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and curly double-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('‘〈本局挑战〉’挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and curly single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｢〈本局挑战〉｣挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and half-width corner-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('﹃〈本局挑战〉﹄挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and presentation-form mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〈本局挑战〉〞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and ornamental double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝〈本局挑战〉〟挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested corner-angle and ornamental low double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〈[本局挑战]〉挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested ASCII square and corner-angle mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('『［本局挑战］』挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and corner-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('｢［本局挑战］｣挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and half-width corner-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('﹃［本局挑战］﹄挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and presentation-form mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝［本局挑战］〞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and ornamental double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝［本局挑战］〟挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and ornamental low double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〘［本局挑战］〙挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and white tortoise-shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〚［本局挑战］〛挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and white square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〔［本局挑战］〕挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〖［本局挑战］〗挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and lenticular mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('“［本局挑战］”挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and curly double-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('‘［本局挑战］’挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and curly single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("'［本局挑战］'挑战：本局"),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and ASCII single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［【本局挑战】］挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and full-width square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('[【本局挑战】]挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested square and ASCII square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('[［本局挑战］]挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and ASCII square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('＜［本局挑战］＞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and angle mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('《［本局挑战］》挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and book-title mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('「［本局挑战］」挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and corner-bracket mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('"［本局挑战］"挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and ASCII straight-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〘［本局挑战］〙挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and white tortoise-shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('﹃［本局挑战］﹄挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and presentation-form mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【［本局挑战］】挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〚［本局挑战］〛挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and white square mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('［〔本局挑战〕］挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and shell mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〖［本局挑战］〗挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and lenticular mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('“［本局挑战］”挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and curly double-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝［本局挑战］〞挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and ornamental double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('〝［本局挑战］〟挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and ornamental low double-prime mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('‘［本局挑战］’挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and curly single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel("'［本局挑战］'挑战：本局"),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when nested full-width square and ASCII single-quote mixed decorators plus repeated plain-text prefixes exhaust the upstream label'
    );
    assert.equal(
        getRunChallengeSafeSidebarLabel('【本局挑战】[挑战]本局：挑战：本局'),
        '未知挑战',
        'run challenge safe sidebar-label helper should still fall back to 未知挑战 when mixed bracketed and plain-text prefixes exhaust the upstream label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 100,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30'],
        'ultra-compact visible in-progress challenge summaries should still drop an extra-large reward chunk before truncating semantic progress copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30'],
        'full in-progress challenge summaries should keep the semantic progress line when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, { viewportTier: 'ultraCompact' }),
        ['挑战 12/30'],
        'ultra-compact challenge sidebar helper should keep the in-progress no-reward summary on the same progress-first ladder'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, { viewportTier: 'ultraCompact' }),
        ['挑战完成'],
        'ultra-compact challenge sidebar helper should keep the completed no-reward summary on the same completion ladder'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 34,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['12/30'],
        'ultra-compact visible in-progress no-reward summaries should preserve the ratio as the final semantic fallback before hiding'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 22,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['完成'],
        'ultra-compact visible completed no-reward summaries should preserve a minimal completion fallback before the challenge block disappears'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full challenge sidebar helper should preserve the existing three-line summary while reusing the shared reward short label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进行中  奖励:+90金'],
        'full in-progress challenge summaries should keep readable in-progress copy instead of surfacing 0/0 when the target is invalid'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 0,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进行中'],
        'full in-progress challenge summaries should fall back to a readable in-progress state when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+9999金 +净化'],
        'full challenge sidebar helper should reuse the shared reward short label when a future compound reward is provided'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip duplicated challenge prefixes from upstream labels before rendering the regular three-line body copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should keep stripping repeated mixed 本局/挑战 prefixes until the objective label is clean'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局　挑战： 挑战： 本局  击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should keep stripping mixed 本局/挑战 prefixes even when upstream copy inserts half-width or full-width spaces between prefix tokens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局：挑战：本局：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should keep stripping repeated 本局/挑战 prefixes even when standalone 本局 carries a colon'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '未知挑战', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should fall back to 未知挑战 when repeated prefix stripping exhausts the upstream label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, { compact: false }),
        ['本局挑战', '未知挑战', '进度:12/30'],
        'full in-progress challenge summaries should keep 未知挑战 plus the progress-only third-line fallback when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局：挑战：：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should keep stripping orphan separators that remain after repeated prefix cleanup'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败　　30   个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should collapse repeated half-width and full-width spaces in the normalized objective label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            compact: false,
            maxLineWidth: 26,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战', '击败 30 个敌人', '12/30'],
        'full in-progress challenge summaries should preserve the bare progress ratio as the final fallback even when the challenge has no reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            compact: false,
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30'],
        'full in-progress challenge summaries should drop the reward chunk before generic truncation when the regular third-line budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            compact: false,
            maxLineWidth: 26,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战', '击败 30 个敌人', '12/30'],
        'full in-progress challenge summaries should preserve the bare progress ratio as the final semantic fallback before generic truncation'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, {
            compact: false,
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30'],
        'full in-progress challenge summaries should keep the same progress-first fallback when a future compound reward grows too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人'],
        'compact in-progress challenge summaries should keep the detail label readable when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +90金'],
        'compact challenge sidebar helper should collapse active challenges into two lines while surfacing the shared reward short label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '击败 30 个敌人 · +90金'],
        'compact in-progress challenge summaries should keep readable in-progress title copy instead of surfacing 0/0 when the target is invalid'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 0,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '击败 30 个敌人'],
        'compact in-progress challenge summaries should keep a readable in-progress title when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            compact: true,
            maxLineWidth: 64,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战 12/30', '击败30个敌人'],
        'compact in-progress challenge summaries should still tighten internal whitespace before generic truncation when the challenge has no reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +9999金 +净化'],
        'compact challenge sidebar helper should reuse the shared reward short label when an active challenge receives a future compound reward'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +90金'],
        'compact in-progress challenge summaries should strip duplicated challenge prefixes from upstream labels before appending reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局　挑战： 挑战： 本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when whitespace-padded mixed prefixes exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when standalone 本局 colons exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '挑战： - 击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +90金'],
        'compact in-progress challenge summaries should strip orphan separators before composing the detail line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【~挑战】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip tilde separators inside decorator payloads before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《本局挑战～》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when tilde separators exhaust the decorator payload label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【…挑战】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip ellipsis separators inside decorator payloads before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《本局挑战⋯》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when ellipsis separators exhaust the decorator payload label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【·挑战】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip middle-dot separators inside decorator payloads before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《本局挑战•》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when bullet separators exhaust the decorator payload label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【|挑战】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip ASCII pipe separators inside decorator payloads before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《本局挑战/》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when slash separators exhaust the decorator payload label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败　　30   个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +90金'],
        'compact in-progress challenge summaries should collapse repeated half-width and full-width spaces in the normalized detail label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【本局挑战】[挑战]击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip stacked bracketed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【本局挑战】挑战：本局：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '击败 30 个敌人 · +90金'],
        'compact in-progress challenge summaries should keep stripping repeated plain-text prefixes after a bracketed decorator is removed'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '｛本局挑战｝挑战：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip curly-brace decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《挑战》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when book-title decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '“挑战”击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip western smart-quote decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '｢挑战｣击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip half-width corner-quote decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '﹃本局挑战﹄挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when presentation-form quote decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝挑战〞击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip ornamental double-prime decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝本局挑战〟挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when ornamental low double-prime decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〔本局挑战〕挑战：本局：击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip shell decorators before repeated plain-text prefix cleanup'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〖本局挑战〗挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when lenticular decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【「挑战」】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【＜挑战＞】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and angle mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【《挑战》】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and book-title mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【『挑战』】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and corner-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【｢挑战｣】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and half-width corner-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【﹁挑战﹂】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and presentation-form mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〝挑战〞】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and ornamental double-prime mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〝挑战〟】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and ornamental low double-prime mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〘挑战〙】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and white tortoise-shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〚挑战〛】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and white square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〔挑战〕】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〖挑战〗】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and lenticular mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【“挑战”】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and curly double-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【‘挑战’】击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and curly single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "【'挑战'】击败 30 个敌人",
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested square and ASCII single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［【挑战】］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［[挑战]］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and ASCII square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［＜挑战＞］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and angle mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［《挑战》］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and book-title mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［「挑战」］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and corner-bracket mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［"挑战"］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and ASCII straight-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〘挑战〙］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and white tortoise-shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［﹁挑战﹂］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and presentation-form mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〚挑战〛］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and white square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〔挑战〕］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［『挑战』］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and corner-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［｢挑战｣］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and half-width corner-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〝挑战〞］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and ornamental double-prime mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〝挑战〟］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and ornamental low double-prime mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［‘挑战’］击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and curly single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "［'挑战'］击败 30 个敌人",
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested full-width square and ASCII single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈〈挑战〉〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip repeated corner-angle decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '""挑战""击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip repeated ASCII double-quote decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈[挑战]〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and ASCII square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈【挑战】〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈〘挑战〙〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and white tortoise-shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈〚挑战〛〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and white square mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈〔挑战〕〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and shell mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈〖挑战〗〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and lenticular mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈“挑战”〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and curly double-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈‘挑战’〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and curly single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈｢挑战｣〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and half-width corner-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈﹁挑战﹂〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and presentation-form mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈"挑战"〉击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and ASCII straight-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "〈'挑战'〉击败 30 个敌人",
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested corner-angle and ASCII single-quote mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '[〈挑战〉]击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { compact: false }),
        ['本局挑战', '击败 30 个敌人', '进度:12/30  奖励:+90金'],
        'full in-progress challenge summaries should strip nested ASCII square and corner-angle mixed decorators before rendering the regular body label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［［本局挑战］］挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when repeated full-width square decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "''本局挑战''挑战：本局",
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when repeated ASCII single-quote decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《〔本局挑战〕》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '＜［本局挑战］＞挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and angle mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈［本局挑战］〉挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and book-title mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '[〈本局挑战〉]挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and ASCII square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【〈本局挑战〉】挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〘〈本局挑战〉〙挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and white tortoise-shell mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〚〈本局挑战〉〛挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and white square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〈[本局挑战]〉挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested ASCII square and corner-angle mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '"〈本局挑战〉"挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and ASCII straight-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "'〈本局挑战〉'挑战：本局",
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and ASCII single-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '｢〈本局挑战〉｣挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and half-width corner-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '﹃〈本局挑战〉﹄挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested corner-angle and presentation-form mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '『［本局挑战］』挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and corner-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '｢［本局挑战］｣挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and half-width corner-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '﹃［本局挑战］﹄挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and presentation-form mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝［本局挑战］〞挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and ornamental double-prime mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝［本局挑战］〟挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and ornamental low double-prime mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '＜［本局挑战］＞挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and angle mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '《［本局挑战］》挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and book-title mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '「［本局挑战］」挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and corner-bracket mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '"［本局挑战］"挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and ASCII straight-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〘［本局挑战］〙挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and white tortoise-shell mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '﹃［本局挑战］﹄挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and presentation-form mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〚［本局挑战］〛挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and white square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〔［本局挑战］〕挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and shell mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〖［本局挑战］〗挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and lenticular mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '“［本局挑战］”挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and curly double-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝［本局挑战］〞挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and ornamental double-prime mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〝［本局挑战］〟挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and ornamental low double-prime mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '‘［本局挑战］’挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and curly single-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "'［本局挑战］'挑战：本局",
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested square and ASCII single-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【［本局挑战］】挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '[［本局挑战］]挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and ASCII square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '〚［本局挑战］〛挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and white square mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '［〔本局挑战〕］挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and shell mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '‘［本局挑战］’挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and curly single-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: "'［本局挑战］'挑战：本局",
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when nested full-width square and ASCII single-quote mixed decorators exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '【本局挑战】[挑战]本局：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should still fall back to 未知挑战 when mixed bracketed and plain-text prefixes exhaust the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, { compact: true }),
        ['本局挑战 12/30', '未知挑战'],
        'compact in-progress challenge summaries should keep 未知挑战 as the label-only fallback when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战 · +90金'],
        'compact in-progress invalid-target summaries should keep 未知挑战 plus the reward-bearing detail fallback when repeated prefix stripping exhausts the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 0,
            completed: false
        }, { compact: true }),
        ['本局挑战：进行中', '未知挑战'],
        'compact in-progress invalid-target summaries should keep 未知挑战 plus the label-only detail fallback when repeated prefix stripping exhausts the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            compact: true,
            maxLineWidth: 72,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战 12/30', '击败 30 个敌人'],
        'compact in-progress challenge summaries should drop the reward chunk before generic truncation when the second-line budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, {
            compact: true,
            maxLineWidth: 72,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战 12/30', '击败 30 个敌人'],
        'compact in-progress challenge summaries should keep the same label-first fallback when a future compound reward grows too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, {
            compact: true,
            maxLineWidth: 64,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战 12/30', '击败30个敌人'],
        'compact in-progress challenge summaries should keep one more whitespace-tightened semantic fallback before generic truncation when future compound rewards still leave the detail line too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '击败 30 个敌人 · +90金'],
        'compact challenge sidebar helper should preserve completion state and reward once the challenge is done'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '击败 30 个敌人 · +9999金 +净化'],
        'compact challenge sidebar helper should reuse the shared reward short label when a future compound reward is provided'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '挑战：击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '击败 30 个敌人', '进度:30/30'],
        'full completed challenge summaries should keep the semantic progress line when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '挑战：击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '击败 30 个敌人', '进度:30/30  奖励:+90金'],
        'full completed challenge summaries should strip duplicated challenge prefixes from upstream labels before rendering the regular three-line body copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 0,
            rewardGold: 90,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '击败 30 个敌人', '已完成  奖励:+90金'],
        'full completed challenge summaries should keep readable completed-state copy instead of regressing to 进行中 when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 0,
            rewardGold: 0,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '击败 30 个敌人', '已完成'],
        'full completed challenge summaries should keep a readable completed-state fallback when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 0,
            rewardGold: 90,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '未知挑战', '已完成  奖励:+90金'],
        'full completed challenge summaries should keep 未知挑战 plus completed-state fallback copy when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, {
            compact: false,
            maxLineWidth: 26,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人', '30/30'],
        'full completed challenge summaries should preserve the bare ratio as the final fallback even when the challenge has no reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, { compact: false }),
        ['本局挑战：已完成', '未知挑战', '进度:30/30'],
        'full completed challenge summaries should keep 未知挑战 plus the progress-only third-line fallback when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            compact: false,
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人', '进度:30/30'],
        'full completed challenge summaries should drop the reward chunk before generic truncation when the regular third-line budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            compact: false,
            maxLineWidth: 26,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人', '30/30'],
        'full completed challenge summaries should preserve the bare ratio as the final semantic fallback before generic truncation'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            compact: false,
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人', '进度:30/30'],
        'full completed challenge summaries should keep the same progress-first fallback when a future compound reward grows too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '击败 30 个敌人'],
        'compact completed challenge summaries should keep the detail label readable when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '击败 30 个敌人 · +90金'],
        'compact completed challenge summaries should strip duplicated challenge prefixes from upstream labels before appending reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '击败 30 个敌人 · +90金'],
        'compact completed challenge summaries should keep stripping repeated mixed 本局/挑战 prefixes until the detail label is clean'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '未知挑战 · +90金'],
        'compact completed challenge summaries should fall back to 未知挑战 when repeated prefix stripping exhausts the detail label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '未知挑战'],
        'compact completed challenge summaries should keep 未知挑战 as the label-only fallback when no reward label is available'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 0,
            rewardGold: 90,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '未知挑战 · +90金'],
        'compact completed invalid-target summaries should keep 未知挑战 plus the reward-bearing detail fallback when repeated prefix stripping exhausts the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 0,
            rewardGold: 0,
            completed: true
        }, { compact: true }),
        ['本局挑战：已完成', '未知挑战'],
        'compact completed invalid-target summaries should keep 未知挑战 plus the label-only detail fallback when repeated prefix stripping exhausts the label'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            compact: true,
            maxLineWidth: 72,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人'],
        'compact completed challenge summaries should drop the reward chunk before generic truncation when the second-line budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, {
            compact: true,
            maxLineWidth: 64,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败30个敌人'],
        'compact completed challenge summaries should still tighten internal whitespace before generic truncation when the challenge has no reward copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            compact: true,
            maxLineWidth: 72,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败 30 个敌人'],
        'compact completed challenge summaries should keep the same label-first fallback when a future compound reward grows too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            compact: true,
            maxLineWidth: 64,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['本局挑战：已完成', '击败30个敌人'],
        'compact completed challenge summaries should keep one more whitespace-tightened semantic fallback before generic truncation when future compound rewards still leave the detail line too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact' }),
        ['挑战 12/30 · +90金'],
        'ultra-compact challenge sidebar helper should collapse active challenges into a single progress-first line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact' }),
        ['挑战进行中 · +90金'],
        'ultra-compact challenge sidebar helper should keep readable in-progress summary copy instead of surfacing 0/0 when the target is invalid'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 0,
            completed: false
        }, { viewportTier: 'ultraCompact' }),
        ['挑战进行中'],
        'ultra-compact challenge sidebar helper should keep a readable in-progress summary when invalid data removes ratio semantics'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 42,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['进行中'],
        'ultra-compact invalid-target summaries should still preserve a final readable in-progress fallback before disappearing'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { viewportTier: 'ultraCompact' }),
        ['挑战完成 · +90金'],
        'ultra-compact challenge sidebar helper should collapse completed challenges into a single completion line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '本局挑战：挑战：',
            progress: 30,
            target: 0,
            rewardGold: 90,
            completed: true
        }, { viewportTier: 'ultraCompact' }),
        ['挑战完成 · +90金'],
        'ultra-compact completed invalid-target summaries should stay on the same completion-first ladder even when wider tiers would collapse the label to 未知挑战'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30'],
        'ultra-compact visible challenge summaries should drop reward copy before generic ellipsis when the single-line budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 999,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 100,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30'],
        'ultra-compact visible in-progress challenge summaries should still drop a large reward chunk before truncating semantic progress copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 34,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['12/30'],
        'ultra-compact visible challenge summaries should preserve the progress ratio as the final in-progress fallback before hiding'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 999,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 50,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['12/30'],
        'ultra-compact visible in-progress challenge summaries should keep the same final ratio fallback even when large rewards expand the first variant'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 48,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战完成'],
        'ultra-compact visible completed summaries should drop reward copy before generic ellipsis when the width budget tightens'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 999,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 90,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战完成'],
        'ultra-compact visible completed summaries should still drop a large reward chunk before truncating semantic completion copy'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 22,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['完成'],
        'ultra-compact visible completed summaries should preserve a minimal completion label before the challenge block disappears'
    );
    assert.equal(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 90,
            measureLabelWidth: measureChallengeSummaryWidth
        })[0],
        '挑战完成',
        'ultra-compact visible completed summaries should still drop an extra-large reward chunk before truncating semantic completion copy'
    );
    assert.equal(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 999,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 40,
            measureLabelWidth: measureChallengeSummaryWidth
        })[0],
        '完成',
        'ultra-compact visible completed summaries should keep the same final completion fallback even when large rewards expand the first variant'
    );
    assert.equal(
        formatRunChallengeRewardShortLabel({
            rewardGold: 9999
        }),
        '+9999金',
        'reward short-label helper should keep the legacy gold-only short form when no explicit reward label is provided'
    );
    assert.equal(
        formatRunChallengeRewardShortLabel({
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化'
        }),
        '+9999金 +净化',
        'reward short-label helper should prefer an explicit future-facing reward short label over the legacy gold-only copy'
    );
    assert.equal(
        formatRunChallengeRewardShortLabel({
            rewardGold: 9999,
            rewardLabel: '  +9999金　 +净化  '
        }),
        '+9999金 +净化',
        'reward short-label helper should collapse repeated half-width and full-width spaces inside explicit reward labels'
    );
    assert.equal(
        formatRunChallengeRewardShortLabel({
            rewardGold: 9999,
            rewardLabel: ' + 9999金　 + 净化 '
        }),
        '+9999金 +净化',
        'reward short-label helper should collapse additive token spacing inside explicit reward labels before reusing the shared short form'
    );
    assert.equal(
        formatRunChallengeRewardShortLabel({
            rewardGold: 9999,
            rewardLabel: ' ＋ 9999金　＋ 净化 '
        }),
        '+9999金 +净化',
        'reward short-label helper should normalize full-width plus tokens inside explicit reward labels before reusing the shared short form'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 150,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30 · +9999金 +净化'],
        'ultra-compact visible in-progress challenge summaries should surface an explicit compound reward short label when width allows'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金　 +净化',
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 150,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30 · +9999金 +净化'],
        'ultra-compact visible in-progress challenge summaries should collapse repeated half-width and full-width spaces in explicit reward labels before composing the line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+ 9999金　 + 净化',
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 150,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30 · +9999金 +净化'],
        'ultra-compact visible in-progress challenge summaries should collapse additive token spacing in explicit reward labels before composing the line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: ' ＋ 9999金　＋ 净化 ',
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 150,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30 · +9999金 +净化'],
        'ultra-compact visible in-progress challenge summaries should normalize full-width plus tokens before composing the shared reward-bearing line'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 70,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战 12/30'],
        'ultra-compact visible in-progress challenge summaries should keep the same semantic fallback chain when an explicit compound reward short label grows too wide'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 140,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战完成 · +9999金 +净化'],
        'ultra-compact visible completed summaries should surface an explicit compound reward short label when width allows'
    );
    assert.deepEqual(
        buildRunChallengeSidebarLines({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            maxLineWidth: 60,
            measureLabelWidth: measureChallengeSummaryWidth
        }),
        ['挑战完成'],
        'ultra-compact visible completed summaries should keep the same semantic fallback chain when an explicit compound reward short label grows too wide'
    );
    assert.equal(
        typeof getRunChallengeInProgressBadgeVariants,
        'function',
        'in-progress challenge badge helper should be exported'
    );
    assert.equal(
        typeof getRunChallengeHiddenCompletedBadgeVariants,
        'function',
        'hidden completed challenge badge variants helper should be exported'
    );
    assert.deepEqual(
        getRunChallengeInProgressBadgeVariants({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }),
        ['进12/30', '12/30', '进12'],
        'in-progress challenge badge helper should keep the progress-only fallback chain when no reward label is available'
    );
    assert.deepEqual(
        getRunChallengeHiddenInProgressBadgeVariants({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }),
        ['进12/30', '12/30', '进12'],
        'hidden in-progress challenge badge variants helper should expose the same label-agnostic progress ladder even when a reward short label exists'
    );
    assert.deepEqual(
        getRunChallengeHiddenInProgressBadgeVariants({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }),
        ['进12/30', '12/30', '进12'],
        'hidden in-progress challenge badge variants helper should keep the same progress ladder when the upstream body label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeHiddenInProgressBadgeVariants({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }),
        [],
        'hidden in-progress challenge badge variants helper should stay empty when invalid targets would otherwise surface misleading hidden progress copy'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        '进12/30',
        'ultra-compact challenge badge helper should further shorten in-progress copy once both the challenge block and modifier body are hidden'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        '完成+90金',
        'ultra-compact challenge badge helper should preserve completion and reward with a shorter badge when the main challenge block is hidden'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: false }),
        '',
        'challenge badge helper should stay silent while the full challenge block is still visible'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: false }),
        '',
        'ultra-compact challenge badge helper should stay silent while the run-modifier body is still visible'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 0,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        '',
        'ultra-compact challenge badge helper should stay silent until the hidden challenge has meaningful progress'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        '',
        'ultra-compact challenge badge helper should stay silent when invalid targets would otherwise produce misleading 0/0 progress copy'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '12/30',
        'ultra-compact challenge badge helper should drop the leading progress marker when the fallback badge width budget gets tighter'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 28,
            measureLabelWidth: measureBadgeWidth
        }),
        '进12',
        'ultra-compact challenge badge helper should fall back to a no-ellipsis progress stub once even the ratio badge no longer fits'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: getHudSidebarHeadingBadgeMetrics(204, 640, 1024, 768).badgeMaxWidth,
            measureLabelWidth: measureTightProgressBadgeWidth
        }),
        '',
        'display-size-derived ultra-tight badge floors should hide the in-progress badge once even 进N no longer fits'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '12/30',
        'rewardless ultra-compact in-progress challenge badges should keep the same ratio fallback without inventing placeholder reward copy'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 28,
            measureLabelWidth: measureBadgeWidth
        }),
        '进12',
        'rewardless ultra-compact in-progress challenge badges should keep the same final short stub before silent hide'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '12/30',
        'rewardless ultra-compact in-progress challenge badges should keep the same ratio fallback when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 0,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 28,
            measureLabelWidth: measureBadgeWidth
        }),
        '进12',
        'rewardless ultra-compact in-progress challenge badges should keep the same final short stub when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '12/30',
        'reward-bearing ultra-compact in-progress challenge badges should keep the same label-agnostic progress ladder when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '',
        'reward-bearing ultra-compact in-progress challenge badges should stay silent when invalid targets collapse wider summaries and the upstream label falls back to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeSidebarBadgeAppearance({
            label: '本局挑战：挑战：本局',
            progress: 12,
            target: 0,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        {
            text: '',
            fill: '',
            alpha: 1
        },
        'reward-bearing hidden in-progress challenge badge appearance should clear its subdued tint once invalid targets and unknown labels collapse the badge to silence'
    );
    assert.deepEqual(
        getRunChallengeCompletedBadgeVariants({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }),
        ['完成+90金', '完成'],
        'completed challenge badge helper should expose the final reward-to-complete fallback chain explicitly'
    );
    assert.deepEqual(
        getRunChallengeCompletedBadgeVariants({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }),
        ['完成+9999金 +净化', '完成'],
        'completed challenge badge helper should reuse the explicit reward short label before falling back to 完成'
    );
    assert.deepEqual(
        getRunChallengeCompletedBadgeVariants({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }),
        ['完成'],
        'completed challenge badge helper should keep a rewardless completion-only fallback chain without placeholder reward copy'
    );
    assert.deepEqual(
        getRunChallengeHiddenCompletedBadgeVariants({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }),
        ['完成+90金', '完成'],
        'hidden completed challenge badge variants helper should stay on the same reward-to-complete ladder when the upstream label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeHiddenCompletedBadgeVariants({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }),
        ['完成+9999金 +净化', '完成'],
        'hidden completed challenge badge variants helper should stay on the same explicit compound-reward ladder when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 130,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+9999金 +净化',
        'ultra-compact completed challenge badges should surface an explicit compound reward short label when width allows'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金　 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 130,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+9999金 +净化',
        'ultra-compact completed challenge badges should collapse repeated half-width and full-width spaces in explicit reward labels before rendering'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+ 9999金　 + 净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 130,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+9999金 +净化',
        'ultra-compact completed challenge badges should collapse additive token spacing in explicit reward labels before rendering'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 40,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成',
        'ultra-compact completed challenge badges should keep the same reward-to-complete fallback chain when an explicit compound reward short label grows too wide'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '完成',
        'ultra-compact completed challenge badge helper should drop reward copy before it squeezes the shared heading line'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: getHudSidebarHeadingBadgeMetrics(220, 640, 1024, 768).badgeMaxWidth,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成',
        'display-size-derived final-tight badge budgets should still fall back from reward copy to the readable 完成 label'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 18,
            measureLabelWidth: measureBadgeWidth
        }),
        '',
        'ultra-compact completed challenge badge helper should go silent once even the minimum readable completion badge no longer fits'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: getHudSidebarHeadingBadgeMetrics(204, 640, 1024, 768).badgeMaxWidth,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '',
        'display-size-derived ultra-tight badge floors should hide the completed badge once even 完成 no longer fits'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 72,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+90金',
        'reward-bearing ultra-compact completed challenge badges should keep the same gold-reward fallback chain when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 0,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 72,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+90金',
        'reward-bearing ultra-compact completed challenge badges should keep the same completed-state ladder when invalid targets and unknown labels collapse wider summaries'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 130,
            measureLabelWidth: measureCompletedBadgeWidth
        }),
        '完成+9999金 +净化',
        'reward-bearing ultra-compact completed challenge badges should keep the same explicit compound-reward ladder when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '完成',
        'rewardless ultra-compact completed challenge badges should keep the same completion fallback when the upstream label collapses to 未知挑战'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 0,
            rewardGold: 0,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 34,
            measureLabelWidth: measureBadgeWidth
        }),
        '完成',
        'rewardless ultra-compact completed challenge badges should keep the same no-reward ladder when invalid targets collapse wider summaries'
    );
    assert.equal(
        buildRunChallengeSidebarBadge({
            label: '本局挑战：挑战：本局',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 18,
            measureLabelWidth: measureBadgeWidth
        }),
        '',
        'rewardless ultra-compact completed challenge badges should still go silent once even 完成 no longer fits after the upstream label collapses to 未知挑战'
    );
    assert.deepEqual(
        getRunChallengeSidebarBadgeAppearance({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: 18,
            measureLabelWidth: measureBadgeWidth
        }),
        {
            text: '',
            fill: '',
            alpha: 1
        },
        'completed challenge badge appearance helper should clear tint once the final ultra-tight fallback goes silent'
    );
    assert.deepEqual(
        getRunChallengeSidebarBadgeAppearance({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, {
            viewportTier: 'ultraCompact',
            hidden: true,
            runModifierHidden: true,
            maxBadgeWidth: getHudSidebarHeadingBadgeMetrics(204, 640, 1024, 768).badgeMaxWidth,
            measureLabelWidth: measureTightProgressBadgeWidth
        }),
        {
            text: '',
            fill: '',
            alpha: 1
        },
        'in-progress challenge badge appearance helper should clear tint once the final ultra-tight fallback goes silent'
    );
    assert.deepEqual(
        getRunChallengeSidebarBadgeAppearance({
            label: '击败 30 个敌人',
            progress: 12,
            target: 30,
            rewardGold: 90,
            completed: false
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        {
            text: '进12/30',
            fill: '#a8b3c7',
            alpha: 0.72
        },
        'in-progress challenge badges should further lower their emphasis once they only appear after the modifier body is gone'
    );
    assert.deepEqual(
        getRunChallengeSidebarBadgeAppearance({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }, { viewportTier: 'ultraCompact', hidden: true, runModifierHidden: true }),
        {
            text: '完成+90金',
            fill: '#8fb39a',
            alpha: 0.78
        },
        'completed challenge badges should keep a more muted completion tint in the final ultra-compact fallback state'
    );
}

function testRunChallengeRewardFeedback() {
    assert.equal(
        typeof buildRunChallengeCompletedFeedbackText,
        'function',
        'run challenge completion feedback helper should be exported'
    );
    assert.equal(
        buildRunChallengeCompletedFeedbackText({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 90,
            completed: true
        }),
        '挑战完成 +90金',
        'default challenge completion feedback should surface the aligned gold reward short label'
    );
    assert.equal(
        buildRunChallengeCompletedFeedbackText({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '+9999金 +净化',
            completed: true
        }),
        '挑战完成 +9999金 +净化',
        'challenge completion feedback should prefer an explicit future reward short label when provided'
    );
    assert.equal(
        buildRunChallengeCompletedFeedbackText({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 9999,
            rewardLabel: '  +9999金　 +净化  ',
            completed: true
        }),
        '挑战完成 +9999金 +净化',
        'challenge completion feedback should collapse repeated half-width and full-width spaces inside explicit reward labels before rendering'
    );
    assert.equal(
        buildRunChallengeCompletedFeedbackText({
            label: '击败 30 个敌人',
            progress: 30,
            target: 30,
            rewardGold: 0,
            completed: true
        }),
        '挑战完成',
        'challenge completion feedback should stay readable when no reward label is available'
    );

    const source = loadGameSource();
    assert.match(
        source,
        /RUN_CHALLENGE_POOL\s*=\s*\[\s*{\s*key:\s*'enemySlayer',\s*label:\s*'挑战:\s*本局击败 30 个敌人',\s*target:\s*30,\s*rewardGold:\s*90\s*}\s*]/,
        'default run challenge seed should align its live reward with the documented +90金 baseline'
    );
    assert.match(
        source,
        /showFloatingCombatText\([\s\S]*?enemy\.x,\s*[\s\S]*?enemy\.y - 24,\s*[\s\S]*?buildRunChallengeCompletedFeedbackText\(GameState\.getRunChallengeSummary\(\)\s*\|\|\s*GameState\.runChallenge\)[\s\S]*?'#7CFFB2',\s*[\s\S]*?1200[\s\S]*?\)/,
        'challenge completion combat text should be built from the shared reward feedback helper instead of a hardcoded generic label'
    );
}

function testRunModifierHeadingBadgeLayout() {
    assert.equal(typeof getRunModifierHeadingBadgeLayout, 'function', 'run-modifier heading badge layout helper should be exported');
    assert.equal(typeof getRunModifierHeadingPresentation, 'function', 'run-modifier heading presentation helper should be exported');
    assert.deepEqual(
        getRunModifierHeadingBadgeLayout(180, { viewportTier: 'regular' }),
        { maxWidth: 75, gap: 8 },
        'regular sidebar headings should preserve the existing badge-width share and gap'
    );
    assert.deepEqual(
        getRunModifierHeadingBadgeLayout(180, { viewportTier: 'ultraCompact' }),
        { maxWidth: 61, gap: 6 },
        'ultra-compact sidebar headings should further shrink badge width share and heading gap'
    );
    assert.deepEqual(
        getRunModifierHeadingBadgeLayout(150, { viewportTier: 'ultraCompact' }),
        { maxWidth: 45, gap: 5 },
        'ultra-compact sidebar headings should enter a tighter budget tier before the badge hits its floor width'
    );
    assert.deepEqual(
        getRunModifierHeadingBadgeLayout(120, { viewportTier: 'ultraCompact' }),
        { maxWidth: 40, gap: 4 },
        'ultra-compact sidebar headings should still clamp the badge to a safe floor width while tightening the heading gap again'
    );
    assert.deepEqual(
        getRunModifierHeadingBadgeLayout(108, { viewportTier: 'ultraCompact' }),
        { maxWidth: 28, gap: 3 },
        'ultra-compact sidebar headings should introduce one more ultra-tight badge tier before title truncation destabilizes'
    );
    assert.deepEqual(
        getHudSidebarHeadingBadgeMetrics(246, 640, 1024, 768),
        {
            displayWidth: 246,
            displayHeight: 640,
            viewportTier: 'ultraCompact',
            maxWidth: 150,
            badgeMaxWidth: 45,
            badgeGap: 5
        },
        'sidebar heading badge metrics should reuse the display-size-derived maxWidth when entering the tighter ultra-compact badge budget tier'
    );
    assert.deepEqual(
        getHudSidebarHeadingBadgeMetrics(220, 640, 1024, 768),
        {
            displayWidth: 220,
            displayHeight: 640,
            viewportTier: 'ultraCompact',
            maxWidth: 124,
            badgeMaxWidth: 40,
            badgeGap: 4
        },
        'sidebar heading badge metrics should keep badge width and gap on the final ultra-tight floor derived from the actual display budget'
    );
    assert.deepEqual(
        getHudSidebarHeadingBadgeMetrics(204, 640, 1024, 768),
        {
            displayWidth: 204,
            displayHeight: 640,
            viewportTier: 'ultraCompact',
            maxWidth: 108,
            badgeMaxWidth: 28,
            badgeGap: 3
        },
        'sidebar heading badge metrics should expose the final ultra-tight badge floor derived from the actual display budget'
    );
    assert.deepEqual(
        getRunModifierHeadingPresentation(108, {
            text: '',
            fill: '#a8b3c7',
            alpha: 0.72
        }, {
            viewportTier: 'ultraCompact',
            fitTitle: text => text,
            fitBadge: text => text,
            measureBadgeWidth: text => text.length * 10
        }),
        {
            titleText: '本局词缀',
            titleMaxWidth: 108,
            badgeText: '',
            badgeVisible: false,
            badgeFill: '',
            badgeAlpha: 1,
            badgeWidth: 0,
            badgeGap: 3
        },
        'run-modifier heading presentation helper should release the full title width and clear badge styling once the lightweight challenge badge goes silent'
    );
    assert.deepEqual(
        getRunModifierHeadingPresentation(108, {
            text: '完成+90金',
            fill: '#8fb39a',
            alpha: 0.78
        }, {
            viewportTier: 'ultraCompact',
            fitTitle: text => text,
            fitBadge: () => '',
            measureBadgeWidth: text => text.length * 10
        }),
        {
            titleText: '本局词缀',
            titleMaxWidth: 108,
            badgeText: '',
            badgeVisible: false,
            badgeFill: '',
            badgeAlpha: 1,
            badgeWidth: 0,
            badgeGap: 3
        },
        'run-modifier heading presentation helper should treat a badge that collapses to empty after fitting as fully silent'
    );
    assert.deepEqual(
        getRunModifierHeadingPresentation(108, {
            text: ' 　 ',
            fill: '#8fb39a',
            alpha: 0.78
        }, {
            viewportTier: 'ultraCompact',
            fitTitle: text => text,
            fitBadge: text => text,
            measureBadgeWidth: text => text.length * 10
        }),
        {
            titleText: '本局词缀',
            titleMaxWidth: 108,
            badgeText: '',
            badgeVisible: false,
            badgeFill: '',
            badgeAlpha: 1,
            badgeWidth: 0,
            badgeGap: 3
        },
        'run-modifier heading presentation helper should normalize whitespace-only badge text into the same silent state'
    );
    assert.deepEqual(
        getRunModifierHeadingPresentation(108, {
            text: '12/30',
            fill: '#a8b3c7',
            alpha: 0.72
        }, {
            viewportTier: 'ultraCompact',
            fitTitle: text => text,
            fitBadge: text => text,
            measureBadgeWidth: text => text.length * 6
        }),
        {
            titleText: '本局词缀',
            titleMaxWidth: 75,
            badgeText: '12/30',
            badgeVisible: true,
            badgeFill: '#a8b3c7',
            badgeAlpha: 0.72,
            badgeWidth: 30,
            badgeGap: 3
        },
        'run-modifier heading presentation helper should reserve the measured badge width and shared gap before fitting the title'
    );
}

function testRunEventPromptMeasurementHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /_measureLevelTextWidth\(text,\s*'runEventPrompt'/,
        'LevelScene should measure run-event prompt widths through a dedicated cached Phaser text helper'
    );
    assert.match(
        source,
        /getViewportTextClampX\(this\.runEventRoomShrine\.x,\s*promptWidth,\s*this\.cameras\.main\.width,\s*12,\s*this\.cameras\.main\.worldView\.x\)/,
        'run-event prompt placement should clamp against the active camera viewport using the shared helper'
    );
}

function testRunEventWorldLabelMeasurementHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /_fitLevelTextToWidth\(text,\s*maxWidth,\s*'runEventWorldLabel'\)/,
        'LevelScene should fit run-event world labels through a dedicated measured text helper'
    );
    assert.match(
        source,
        /getViewportCenteredTextClampX\(this\.runEventRoomShrine\.x,\s*labelWidth,\s*this\.cameras\.main\.width,\s*12,\s*this\.cameras\.main\.worldView\.x\)/,
        'run-event world labels should clamp centered anchors against the active camera viewport'
    );
}

function testBossHudMeasurementHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\.bossTelegraphCountdownHeadMarker = this\.add\.graphics\(\);[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.setScrollFactor\(0\);/,
        'BossScene should allocate a dedicated graphics node for the live countdown head marker'
    );
    assert.match(
        source,
        /_fitBossHudTextToWidth\(text,\s*maxWidth,\s*styleKey\)/,
        'BossScene should fit telegraph strings through a dedicated Boss HUD measurement helper'
    );
    assert.match(
        source,
        /this\.bossTelegraphCountdownHeadFlash = this\.add\.graphics\(\);[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.setScrollFactor\(0\);/,
        'Boss telegraph should create a dedicated graphics layer for the countdown head warm flash'
    );
    assert.match(
        source,
        /this\._bossTelegraphCountdownHeadFlashUntil = 0;[\s\S]*?this\._bossTelegraphCountdownHeadMarkerWasVisible = false;/,
        'Boss telegraph should initialize countdown-head flash timing and visibility state'
    );
    assert.match(
        source,
        /this\.bossTelegraphCountdownHeadMarker\.clear\(\);[\s\S]*?if \(telegraphHud\.currentCountdownHeadMarkerVisible\) \{[\s\S]*?const countdownHeadMarkerX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.currentCountdownHeadMarkerRatio;[\s\S]*?const countdownHeadShellEdgeSoftInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeSoftened \? 0\.25 : 0;[\s\S]*?const countdownHeadShellY = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.y \+ 2 \+ countdownHeadShellEdgeSoftInset\s*:\s*telegraphRect\.y \+ 1;[\s\S]*?const countdownHeadShellHeight = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.h - 4 - countdownHeadShellEdgeSoftInset \* 2\s*:\s*telegraphRect\.h - 2;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillRoundedRect\(\s*(?:countdownHeadMarkerX - 1|countdownHeadShellX),\s*(?:telegraphRect\.y \+ 1|countdownHeadShellY),\s*(?:2|countdownHeadShellWidth),\s*(?:telegraphRect\.h - 2|countdownHeadShellHeight),\s*(?:1|countdownHeadShellRadius)\s*\);/,
        'Boss telegraph should draw a thin dedicated live countdown head marker once the dimmed tail segment becomes active'
    );
    assert.match(
        source,
        /this\.bossTelegraphCountdownHeadFlash\.clear\(\);[\s\S]*?if \(telegraphHud\.currentCountdownHeadMarkerVisible && !this\._bossTelegraphCountdownHeadMarkerWasVisible\) \{[\s\S]*?this\._bossTelegraphCountdownHeadFlashUntil = this\.time\.now \+ telegraphHud\.currentCountdownHeadMarkerWarmFlashDurationMs;[\s\S]*?\}[\s\S]*?const countdownHeadFlashRemainingMs = Math\.max\(0,\s*this\._bossTelegraphCountdownHeadFlashUntil - this\.time\.now\);[\s\S]*?if \(telegraphHud\.currentCountdownHeadMarkerVisible\) \{[\s\S]*?if \(countdownHeadFlashRemainingMs > 0\) \{[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillRoundedRect\(\s*countdownHeadMarkerX - 4,\s*telegraphRect\.y - 2,\s*8,\s*telegraphRect\.h \+ 4,\s*3\s*\);/,
        'Boss telegraph should trigger a short warm flash only when the live countdown head marker first appears at the tail-afterglow transition'
    );
    assert.match(
        source,
        /const telegraphMainText = telegraphHud\.typeLabel[\s\S]*?const telegraphLayout = buildBossTelegraphTextLayout\({[\s\S]*?this\._measureBossHudTextWidth\(text,\s*styleKey\)[\s\S]*?this\.bossTelegraphText\.setY\(telegraphRect\.y \+ telegraphLayout\.mainYOffset\);[\s\S]*?this\.bossTelegraphText\.setText\(this\._fitBossHudTextToWidth\(telegraphMainText,\s*telegraphLayout\.mainMaxWidth,\s*'bossTelegraphMain'\)\);/,
        'Boss telegraph title should derive its width budget and row position from the shared two-line layout helper'
    );
    assert.match(
        source,
        /this\.bossTelegraphWindowGuard\.clear\(\);[\s\S]*?if \(telegraphLayout\.windowAccentVisible\) \{[\s\S]*?this\.bossTelegraphWindowGuard\.fillRoundedRect\(\s*telegraphRect\.x,\s*telegraphRect\.y \+ telegraphLayout\.windowAccentYOffset,\s*telegraphRect\.w,\s*telegraphLayout\.windowAccentHeight,\s*4\s*\);[\s\S]*?\}[\s\S]*?this\.bossTelegraphWindowText\.setX\(telegraphRect\.x \+ telegraphLayout\.windowX\);[\s\S]*?this\.bossTelegraphWindowText\.setOrigin\(telegraphLayout\.windowOriginX,\s*0\);[\s\S]*?this\.bossTelegraphWindowText\.setY\(telegraphRect\.y \+ telegraphLayout\.windowYOffset\);[\s\S]*?this\.bossTelegraphWindowText\.setText\(this\._fitBossHudTextToWidth\(telegraphHud\.counterWindowLabel,\s*telegraphLayout\.windowMaxWidth,\s*'bossTelegraphWindow'\)\);[\s\S]*?this\.bossTelegraphHintText\.setY\(telegraphRect\.y \+ telegraphLayout\.hintYOffset\);[\s\S]*?this\.bossTelegraphHintText\.setText\(this\._fitBossHudTextToWidth\(telegraphHud\.hintLabel \|\| '',\s*telegraphRect\.w,\s*'bossTelegraphHint'\)\);/,
        'Boss telegraph window row should use the shared stacked-layout guard band, anchor, and offsets when warning copy grows long'
    );
    assert.match(
        source,
        /this\.bossTelegraphCounterWindowSpan\.clear\(\);[\s\S]*?if \(telegraphHud\.counterWindowSpanVisible\) \{[\s\S]*?const counterWindowSpanX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.counterWindowSpanStartRatio;[\s\S]*?const counterWindowSpanWidth = telegraphRect\.w \* telegraphHud\.counterWindowSpanWidthRatio;[\s\S]*?this\.bossTelegraphCounterWindowSpan\.fillRoundedRect\(\s*counterWindowSpanX,\s*telegraphRect\.y \+ 2,\s*counterWindowSpanWidth,\s*telegraphRect\.h - 4,\s*3\s*\);/,
        'Boss telegraph should render a dedicated in-bar span when the counter window is fully contained inside the telegraph body'
    );
    assert.match(
        source,
        /this\.bossTelegraphTailMarker\.clear\(\);[\s\S]*?this\.bossTelegraphStartMarker\.clear\(\);[\s\S]*?if \(telegraphHud\.counterWindowStartMarkerVisible\) \{[\s\S]*?const startMarkerX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.counterWindowStartMarkerRatio;[\s\S]*?this\.bossTelegraphStartMarker\.fillRoundedRect\(\s*startMarkerX - 2,\s*telegraphRect\.y - 1,\s*4,\s*telegraphRect\.h \+ 2,\s*2\s*\);/,
        'Boss telegraph should draw a dedicated in-bar start marker when the counter window opens after the telegraph begins'
    );
    assert.match(
        source,
        /this\.bossTelegraphClosureMarker\.clear\(\);[\s\S]*?if \(telegraphHud\.counterWindowClosureMarkerVisible\) \{[\s\S]*?const closureMarkerX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.counterWindowClosureMarkerRatio;[\s\S]*?this\.bossTelegraphClosureMarker\.fillRoundedRect\(\s*closureMarkerX - 2,\s*telegraphRect\.y - 1,\s*4,\s*telegraphRect\.h \+ 2,\s*2\s*\);/,
        'Boss telegraph should draw a dedicated in-bar closure marker when a frame-one counter window closes before the telegraph body ends'
    );
    assert.match(
        source,
        /this\.bossTelegraphTailAfterglow\.clear\(\);[\s\S]*?if \(telegraphHud\.counterWindowTailAfterglowVisible\) \{[\s\S]*?const tailAfterglowX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.counterWindowTailAfterglowStartRatio;[\s\S]*?const tailAfterglowWidth = telegraphRect\.w \* telegraphHud\.counterWindowTailAfterglowWidthRatio;[\s\S]*?this\.bossTelegraphTailAfterglow\.fillRoundedRect\(\s*tailAfterglowX,\s*telegraphRect\.y \+ 1,\s*tailAfterglowWidth,\s*telegraphRect\.h - 2,\s*3\s*\);/,
        'Boss telegraph should darken the post-closure tail segment when a frame-one counter window ends before the bar body'
    );
    assert.match(
        source,
        /this\.bossTelegraphBarFill\.fillStyle\(telegraphColor,\s*telegraphHud\.progressFillAlpha\);[\s\S]*?this\.bossTelegraphBarFill\.fillRoundedRect\(/,
        'Boss telegraph should lower the surviving main-fill alpha through the shared telegraph summary once every warning row has settled into tail-afterglow copy'
    );
    assert.match(
        source,
        /const telegraphMainTextFill = telegraphHud\.attackLabelMuted \? '#d6c9bb' : '#f7e6cf';[\s\S]*?this\.bossTelegraphText\.setStyle\(\{\s*fill:\s*telegraphMainTextFill\s*\}\);[\s\S]*?this\.bossTelegraphText\.setText\(this\._fitBossHudTextToWidth\(telegraphMainText,\s*telegraphLayout\.mainMaxWidth,\s*'bossTelegraphMain'\)\);/,
        'Boss telegraph should mute the main attack-title row to a warm gray-white once the live telegraph has already entered the tail-afterglow segment'
    );
    assert.match(
        source,
        /const telegraphWindowTextFill = telegraphHud\.counterWindowLabelMuted \? '#c6b7a1' : '#ffe1a1';[\s\S]*?this\.bossTelegraphWindowText\.setStyle\(\{\s*fill:\s*telegraphWindowTextFill\s*\}\);[\s\S]*?this\.bossTelegraphWindowText\.setText\(this\._fitBossHudTextToWidth\(telegraphHud\.counterWindowLabel,\s*telegraphLayout\.windowMaxWidth,\s*'bossTelegraphWindow'\)\);/,
        'Boss telegraph should mute the counter-window row color once the live telegraph has already entered the tail-afterglow segment'
    );
    assert.match(
        source,
        /const telegraphHintTextFill = telegraphHud\.hintLabelMuted \? '#d7b07a' : '#ffdcb3';[\s\S]*?this\.bossTelegraphHintText\.setStyle\(\{\s*fill:\s*telegraphHintTextFill\s*\}\);[\s\S]*?this\.bossTelegraphHintText\.setText\(this\._fitBossHudTextToWidth\(telegraphHud\.hintLabel \|\| '',\s*telegraphRect\.w,\s*'bossTelegraphHint'\)\);/,
        'Boss telegraph should mute rewritten tail-phase hint copy to a softer amber once the live telegraph has already entered the tail-afterglow segment'
    );
    assert.match(
        source,
        /this\.bossTelegraphTailMarker\.clear\(\);[\s\S]*?if \(telegraphHud\.counterWindowTailMarkerVisible\) \{[\s\S]*?const tailMarkerX = telegraphRect\.x \+ telegraphRect\.w - 1;[\s\S]*?this\.bossTelegraphTailMarker\.fillRoundedRect\(\s*tailMarkerX,\s*telegraphRect\.y - 1,\s*6,\s*telegraphRect\.h \+ 2,\s*2\s*\);/,
        'Boss telegraph should draw a dedicated end-of-bar tail marker when the counter window outlasts the telegraph body'
    );
}

function testSidebarMeasurementHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /_getHudSidebarResponsiveMetrics\(\)\s*{[\s\S]*?return getHudSidebarResponsiveMetrics\(/,
        'UIScene should centralize sidebar responsiveness through the shared responsive metrics helper'
    );
    assert.match(
        source,
        /_fitHudSidebarTextLine\(text,\s*maxWidth,\s*styleKey\)\s*{/,
        'UIScene should expose a dedicated single-line fitting helper for fixed sidebar headings'
    );
    assert.match(
        source,
        /clampTextToWidth\(text,\s*maxWidth,\s*{[\s\S]*?_measureHudSidebarTextWidth\(glyph,\s*styleKey\)/,
        'single-line sidebar fitting should reuse the shared measured clamp helper with Phaser-backed glyph measurement'
    );
    assert.match(
        source,
        /_fitHudSidebarTextLines\(lines,\s*maxWidth,\s*styleKey\)\s*{/,
        'UIScene should expose a dedicated multiline fitting helper for fixed sidebar copy'
    );
    assert.match(
        source,
        /clampTextLinesToWidth\(lines,\s*maxWidth,\s*{[\s\S]*?_measureHudSidebarTextWidth\(glyph,\s*styleKey\)/,
        'sidebar multiline fitting should reuse the shared multiline clamp helper with Phaser-backed glyph measurement'
    );
    assert.match(
        source,
        /_isCompactHudSidebarViewport\(\)\s*{/,
        'UIScene should centralize compact sidebar viewport detection'
    );
    assert.match(
        source,
        /_getHudSidebarResponsiveMetrics\(\)\s*{\s*const layout = this\._hudLayout \|\| this\._buildHudLayout\(false\);[\s\S]*?const displaySize = this\.scale && this\.scale\.displaySize \? this\.scale\.displaySize : null;[\s\S]*?return getHudSidebarResponsiveMetrics\(\s*displaySize && Number\.isFinite\(displaySize\.width\) \? displaySize\.width : 0,\s*displaySize && Number\.isFinite\(displaySize\.height\) \? displaySize\.height : 0,\s*viewportWidth,\s*viewportHeight\s*\);\s*}/,
        'UIScene should derive sidebar responsiveness from actual display size with a logical-viewport fallback'
    );
    assert.match(
        source,
        /_getHudSidebarViewportTier\(\)\s*{\s*return this\._getHudSidebarResponsiveMetrics\(\)\.viewportTier;\s*}/,
        'UIScene should read the sidebar tier from the shared responsive metrics helper'
    );
    assert.match(
        source,
        /_getHudSidebarMaxWidth\(\)\s*{\s*return this\._getHudSidebarResponsiveMetrics\(\)\.maxWidth;\s*}/,
        'UIScene should read the sidebar width budget from the shared responsive metrics helper'
    );
    assert.match(
        source,
        /getHudSidebarOverflowPolicy\(this\._getHudSidebarViewportTier\(\)\)/,
        'UIScene should centralize sidebar overflow spacing and droppable policy through the shared helper'
    );
    assert.match(
        source,
        /_getHudSidebarLineCap\(sectionKey\)\s*{/,
        'UIScene should expose a dedicated narrow-viewport line-cap policy helper for sidebar sections'
    );
    assert.match(
        source,
        /getHudSidebarLineCap\(sectionKey,\s*this\._getHudSidebarViewportTier\(\)\)/,
        'sidebar line-cap policy should be delegated to the shared viewport-tier helper'
    );
    assert.match(
        source,
        /_fitHudSidebarTextBlock\(lines,\s*maxWidth,\s*styleKey,\s*sectionKey\)\s*{/,
        'UIScene should expose a dedicated block fitter that combines width clamp and optional line caps'
    );
    assert.match(
        source,
        /clampTextLinesToWidthAndCount\(lines,\s*maxWidth,\s*lineCap,\s*{[\s\S]*?_measureHudSidebarTextWidth\(glyph,\s*styleKey\)/,
        'sidebar block fitting should reuse the shared measured line-cap helper when a compact viewport cap applies'
    );
    assert.match(
        source,
        /this\.runModifierTitle\.setText\(this\._fitHudSidebarTextLine\('本局词缀',\s*this\._getHudSidebarMaxWidth\(\),\s*'sidebarSectionTitle'\)\);/,
        'sidebar section headings should route through the measured single-line fitting helper'
    );
    assert.match(
        source,
        /this\.areaNameText\.setText\(this\._fitHudSidebarTextLine\(areaName\s*\|\|\s*'',\s*this\._getHudSidebarMaxWidth\(\),\s*'areaNameSidebar'\)\);/,
        'area-name sidebar should route its heading through the measured sidebar fitting helper'
    );
    assert.match(
        source,
        /this\.runModifierText\.setText\(this\._fitHudSidebarTextBlock\(modifierLines,\s*this\._getHudSidebarMaxWidth\(\),\s*'runModifierSidebar',\s*'runModifierSidebar'\)\.join\('\\n'\)\);/,
        'run-modifier sidebar should route generated lines through the measured sidebar line-cap helper'
    );
    assert.match(
        source,
        /buildRunChallengeSidebarLines\(challenge,\s*{\s*viewportTier:\s*this\._getHudSidebarViewportTier\(\),\s*maxLineWidth:\s*this\._getHudSidebarMaxWidth\(\),\s*measureLabelWidth:\s*text => this\._measureHudSidebarTextWidth\(text,\s*'challengeSidebar'\)\s*}\)/,
        'challenge sidebar should build its lines through the shared viewport-tier-aware helper with the live sidebar width budget and Phaser measurement hook'
    );
    assert.match(
        source,
        /this\.challengeText\.setText\(this\._fitHudSidebarTextBlock\(challengeLines,\s*this\._getHudSidebarMaxWidth\(\),\s*'challengeSidebar',\s*'challengeSidebar'\)\.join\('\\n'\)\);/,
        'challenge sidebar should route helper-generated lines through the measured sidebar block fitter'
    );
    assert.match(
        source,
        /this\.runModifierBadgeText\s*=\s*this\.add\.text\(width - pad,\s*this\._hudLayout\.sidePanelStartY \+ 26,\s*'',\s*{/,
        'UIScene should create a dedicated run-modifier challenge badge text node for ultra-compact fallback badges'
    );
    assert.match(
        source,
        /_updateRunModifierHeading\(\s*badgeAppearance\s*\)\s*{/,
        'UIScene should centralize independent run-modifier title and badge layout in a dedicated helper'
    );
    assert.match(
        source,
        /_getRunModifierBadgeMaxWidth\(maxWidth\)\s*{\s*const badgeLayout = getRunModifierHeadingBadgeLayout\(maxWidth,\s*\{\s*viewportTier:\s*this\._getHudSidebarViewportTier\(\)\s*\}\);\s*return badgeLayout\.maxWidth;\s*}/,
        'badge max-width helper should delegate to the shared run-modifier heading layout policy'
    );
    assert.match(
        source,
        /_getRunModifierBadgeGap\(maxWidth\)\s*{\s*const badgeLayout = getRunModifierHeadingBadgeLayout\(maxWidth,\s*\{\s*viewportTier:\s*this\._getHudSidebarViewportTier\(\)\s*\}\);\s*return badgeLayout\.gap;\s*}/,
        'badge gap helper should delegate to the shared run-modifier heading layout policy'
    );
    assert.match(
        source,
        /const headingPresentation = getRunModifierHeadingPresentation\(maxWidth,\s*safeBadgeAppearance,\s*{[\s\S]*?fitTitle:\s*\(text,\s*titleWidth\)\s*=>\s*this\._fitHudSidebarTextLine\(text,\s*titleWidth,\s*'sidebarSectionTitle'\)[\s\S]*?fitBadge:\s*\(text,\s*badgeWidth\)\s*=>\s*this\._fitHudSidebarTextLine\(text,\s*badgeWidth,\s*'sidebarChallengeBadge'\)[\s\S]*?measureBadgeWidth:\s*text\s*=>\s*this\._measureHudSidebarTextWidth\(text,\s*'sidebarChallengeBadge'\)[\s\S]*?}\);/,
        'run-modifier heading layout should reserve badge space through the shared presentation helper before fitting the title'
    );
    assert.match(
        source,
        /this\._updateRunModifierHeading\(challengeBadgeAppearance\);/,
        'sidebar update should route lightweight challenge badges through the dedicated heading layout helper'
    );
    assert.match(
        source,
        /this\.runModifierBadgeText\.setStyle\(\{\s*fill:\s*headingPresentation\.badgeFill,\s*alpha:\s*headingPresentation\.badgeAlpha\s*\}\);/,
        'dedicated challenge badge text should apply the shared subdued appearance state instead of inheriting the title tint'
    );
    assert.match(
        source,
        /const headingPresentation = getRunModifierHeadingPresentation\(maxWidth,\s*safeBadgeAppearance,\s*{[\s\S]*?viewportTier:\s*this\._getHudSidebarViewportTier\(\)[\s\S]*?}\);/,
        'run-modifier heading update should route its title-width and badge-width decisions through the shared heading presentation helper'
    );
    assert.match(
        source,
        /if\s*\(!headingPresentation\.badgeVisible\)\s*{[\s\S]*?this\.runModifierTitle\.setPosition\(anchorX,\s*titleY\);[\s\S]*?this\.runModifierBadgeText\.setText\(''\);[\s\S]*?this\.runModifierBadgeText\.setStyle\(\{\s*fill:\s*'',\s*alpha:\s*1\s*\}\);[\s\S]*?this\.runModifierBadgeText\.setAlpha\(1\);[\s\S]*?this\.runModifierBadgeText\.setVisible\(false\);[\s\S]*?return;/,
        'run-modifier heading reset should clear the badge node style and alpha whenever the shared presentation collapses the lightweight badge to silence'
    );
    assert.match(
        source,
        /const challengeBadgeAppearance = challenge \? getRunChallengeSidebarBadgeAppearance\(challenge,\s*{\s*viewportTier:\s*this\._getHudSidebarViewportTier\(\),\s*hidden:\s*!\(!layout\.showSidePanel \|\| sidebarLayout\.visibility\.challengeText\),\s*runModifierHidden:\s*!sidebarLayout\.visibility\.runModifierText,\s*maxBadgeWidth:\s*badgeMaxWidth,\s*measureLabelWidth:\s*text => this\._measureHudSidebarTextWidth\(text,\s*'sidebarChallengeBadge'\)\s*}\)\s*:\s*\{\s*text:\s*'',\s*fill:\s*'',\s*alpha:\s*1\s*\};/,
        'UIScene should derive the fallback badge through the shared helper only after both the challenge block and modifier body have dropped, while passing the real badge width budget and Phaser-backed measurement'
    );
    assert.match(
        source,
        /this\.runModifierTitle\.setText\(headingPresentation\.titleText\);/,
        'sidebar title should consume the shared heading presentation result instead of recomputing its own width budget inline'
    );
    assert.match(
        source,
        /buildPriorityTextStackLayout\(/,
        'fixed sidebar layout should route through a priority-aware stack helper when overflow handling is needed'
    );
    assert.match(
        source,
        /droppable:\s*!!sidebarPolicy\.droppable\.challengeText/,
        'challenge sidebar visibility should become last-resort droppable through the shared overflow policy'
    );
    assert.match(
        source,
        /gapAfter:\s*sidebarPolicy\.gaps\.challengeText/,
        'challenge sidebar block should consume shared ultra-compact stack spacing'
    );
    assert.match(
        source,
        /eventRoomText:\s*showSidePanel\s*&&\s*!!sidebarLayout\.visibility\.eventRoomText/,
        'event-room sidebar visibility should honor the overflow-priority visibility map'
    );
    assert.match(
        source,
        /runModifierText:\s*showSidePanel\s*&&\s*!!sidebarLayout\.visibility\.runModifierText/,
        'run-modifier sidebar visibility should honor the overflow-priority visibility map'
    );
    assert.match(
        source,
        /const sidebarLayout = this\._layoutHudSidebarBlocks\(\);/,
        'HUD layout application should use the sidebar layout result to drive final visibility'
    );
    assert.match(
        source,
        /maxBottom:\s*this\._getHudSidebarMaxBottom\(\)/,
        'priority-aware sidebar layout should clamp against a dedicated safe bottom threshold'
    );
    assert.match(
        source,
        /styleKey === 'sidebarSectionTitle'/,
        'sidebar measurement nodes should define a dedicated sidebar-section-title style'
    );
    assert.match(
        source,
        /styleKey === 'runModifierSidebar'/,
        'sidebar measurement nodes should define a dedicated run-modifier style'
    );
    assert.match(
        source,
        /styleKey === 'areaNameSidebar'/,
        'sidebar measurement nodes should define a dedicated area-name style'
    );
    assert.match(
        source,
        /this\.eventRoomText\.setText\(this\._fitHudSidebarTextBlock\(lines,\s*this\._getHudSidebarMaxWidth\(\),\s*'eventRoomSidebar',\s*'eventRoomSidebar'\)\.join\('\\n'\)\);/,
        'event-room sidebar should route generated HUD lines through the measured sidebar line-cap helper'
    );
    assert.match(
        source,
        /_layoutHudSidebarBlocks\(\)\s*{/,
        'UIScene should expose a dedicated fixed-sidebar vertical layout helper'
    );
    assert.match(
        source,
        /const sidebarLayout = buildPriorityTextStackLayout\(\[/,
        'fixed sidebar vertical layout should be derived from the shared priority-aware stack helper'
    );
}

function testReadmeKeyboardInventoryLoop() {
    const source = loadReadmeSource();
    assert.match(
        source,
        /玩家刚踏进第三房时，还会先收到 `缓冲战 · 双拍缓冲` \/ `高压战 · 三向成压` \/ `淘金战 · 后排赏金` 这类极短开场预告/,
        'README should document the third-room entry cue that exposes the routed encounter posture immediately'
    );
    assert.match(
        source,
        /当这个高赏金目标死亡时，还会立刻补一条 `赏金\+X` 与更亮的金币爆点，而 `高压战 \/ 缓冲战` 继续维持更平均、更平稳的掉金反馈/,
        'README should document the kill-time bounty receipt and the steadier non-windfall gold feedback'
    );
    assert.match(
        source,
        /第三房真正清场、Boss 门点亮时，还会再补一条 `缓冲战 · 稳住出清` \/ `高压战 · 顶住成压` \/ `淘金战 · 赏金到手` 这类极短收束语/,
        'README should document the room-clear recap that closes the routed encounter arc when room 3 is finished'
    );
    assert.match(
        source,
        /当清场浮字淡出后，Boss 门标签也会继续保留 `缓冲路线 · 稳线迎战` \/ `高压路线 · 顶压迎战` \/ `淘金路线 · 带赏迎战` 这类 run-arc 回顾/,
        'README should document the persistent Boss-door run-arc recap that survives after the room-clear floating text fades'
    );
    assert.match(
        source,
        /真正踏进 Boss 房后的第一拍，还会再补一次 `缓冲路线 · 稳线开局` \/ `高压路线 · 抢势开局` \/ `淘金路线 · 带赏开局` 这类共享 opener/,
        'README should document the one-shot Boss-opening route echo that extends the routed segment into the next major fight'
    );
    assert.match(
        source,
        /回到 Hub 后，画面上还会保留一个小型 `上轮战报`，至少会把 `已讨伐谁 \/ 哪条路线收官 \/ 源于哪次抉择` 继续钉在下一次选门前[\s\S]*?当前 hub route-memory baseline 已明确收束为这组 `上轮战报 \+ 选门参考` 双卡片，现阶段不再额外新增 run-history 入口；后续 prep surface 已交由 `备战参考 \/ 采购参考 \/ 备战复查` 各自承接/,
        'README should document the hub-visible last-run recap that preserves the route memory bridge after Boss victory'
    );
    assert.match(
        source,
        /当玩家真正贴近任一传送门时，画面还会再补一个 compact `选门参考`[\s\S]*?`门前 稳线读招` \/ `门前 追影拆位` \/ `门前 回体扛压` \/ `门前 稳拍反制`/,
        'README should document the boss-facing portal target cues that frame the next run posture at portal focus'
    );
    assert.match(
        source,
        /真正踏进关卡后的第一秒，还会补一次 `目标 色欲 · 稳拍反制` \/ `目标 暴怒 · 回体扛压` 这类一次性的开局目标 cue/,
        'README should document the one-shot run-start target cue that carries portal posture into level entry'
    );
    assert.match(
        source,
        /若开局 seed 会先把玩家落进首段普通战斗，首个房间刚被敌群唤醒时还会再补一次 `首战 稳拍反制` \/ `首战 回体扛压` 这类短 cue[\s\S]*?这条首战 cue 现在也会更快收束/,
        'README should document the one-shot first-combat cue that keeps the boss target alive before the first shrine'
    );
    assert.match(
        source,
        /首段普通战斗清场后，穿过首段 corridor 时还会再补一次 `承接 稳拍反制` \/ `承接 回体扛压` 这类短 cue[\s\S]*?当前这条 early-run ladder 现已稳定成“首战开压 \+ corridor handoff \+ shrine 靠近”的轻量三段接力，并已正式收束为当前早段 baseline，不再额外新增首段清场 cue/,
        'README should document the one-shot corridor bridge cue that carries the boss target through the quiet gap before shrine proximity'
    );
    assert.match(
        source,
        /首个未结算事件房的靠近提示 \/ 世界标签还会继续补 `按F祈愿 · 稳拍反制` \/ `祈愿圣坛 · 稳拍反制` 这类更紧的短 reminder（由事件房前缀映射直接产出一致文案）/,
        'README should document the first-shrine posture reminder that keeps the boss target alive into the first route decision'
    );
    assert.match(
        source,
        /Tab.*背包/,
        'README should keep the backpack key binding visible'
    );
    assert.match(
        source,
        /点击背包里的消耗品会自动装入快捷栏首个空位/,
        'README should explain the backpack click auto-fill behavior'
    );
    assert.match(
        source,
        /快捷栏已满时会回写 1 号槽位，并提示“快捷栏1：<旧短名>→<新短名>”/,
        'README should explain the shortform overwrite direction toast when labels differ'
    );
    assert.match(
        source,
        /若新旧道具短名相同，则会压缩为“快捷栏1：同类 <短名>”/,
        'README should document the same-label shortform overwrite toast'
    );
    assert.match(
        source,
        /若临时拿不到新短名，则会改为沿用道具名生成的“快捷栏1：<旧标签>→<新标签>”短句，例如“快捷栏1：狂战→净化”/,
        'README should document the name-derived overwrite fallback when handcrafted short labels are unavailable'
    );
    assert.match(
        source,
        /若 hub 最近聚焦的传送门已经把 `目标 Boss \/ 门前姿态` 压成 consumable prep 问题，打开背包时还会补一个 compact `备战复查`[\s\S]*?`背包已有2` \/ `快捷栏2` \/ `快捷栏待补`/,
        'README should document the backpack prep review block that turns the last hub consumable check into owned-count plus quick-slot readiness'
    );
    assert.match(
        source,
        /顶部 telegraph 也会自动切成双行测量布局[\s\S]*?第二行 `反制窗口` 还会改成左对齐高亮带/,
        'README should document the stacked telegraph fallback and highlighted counter-window row for long boss warning copy'
    );
    assert.match(
        source,
        /若 `反制窗口` 实际会拖到进度条终点之后，条尾还会补一枚 `超出尾标`/,
        'README should document the telegraph tail marker for counter windows that outlast the bar body'
    );
    assert.match(
        source,
        /若 `反制窗口` 起点实际晚于进度条开头，条内还会补一枚 `起跳刻度`/,
        'README should document the telegraph start marker for delayed counter-window entry'
    );
    assert.match(
        source,
        /若 `反制窗口` 从第一帧开放、却会在进度条清空前提早收束，条内还会补一枚 `收束刻度`/,
        'README should document the in-bar closure marker for frame-one counter windows that end early'
    );
    assert.match(
        source,
        /`收束刻度` 右侧剩余条体也会压成更暗的 `尾段残影`/,
        'README should document the dimmed tail afterglow for frame-one counter windows that close early'
    );
    assert.match(
        source,
        /一旦倒计时已经走进这段 `尾段残影`，第二行 `反制窗口` 也会同步切成更低饱和的 `已收束提示`/,
        'README should document that the counter-window row flips to a subdued settled label once the live telegraph is already in the tail-afterglow phase'
    );
    assert.match(
        source,
        /第三行 hint 则会把原本的 `反制:` \/ `反制提示:` 前缀改写成更明确的 `收束后处理:` 或 `闪避提示:`/,
        'README should document that the telegraph hint switches from counter phrasing to post-window guidance once the live telegraph is already in the tail-afterglow phase'
    );
    assert.match(
        source,
        /第三行 hint 则会把原本的 `反制:` \/ `反制提示:` 前缀改写成更明确的 `收束后处理:` 或 `闪避提示:`，并同步降成更柔和的琥珀色/,
        'README should document that rewritten tail-phase hint copy also shifts to a softer amber once the live telegraph has already entered the tail-afterglow phase'
    );
    assert.match(
        source,
        /若第二、三行都已切进收束态，第一行 `类型 \| 攻击名` 也会同步压成更低饱和的暖灰白/,
        'README should document that the telegraph title row also dims once the live telegraph has already entered the settled tail phase'
    );
    assert.match(
        source,
        /若第一、二、三行都已切进收束态，进度条左侧仍存活的主色填充也会同步降一档 alpha/,
        'README should document that the surviving telegraph fill also dims once every warning row has settled into the tail-afterglow state'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且主色填充已同步降档 alpha，再给进度头部补一枚更细的暖色 `当前倒计时头标`/,
        'README should document the dedicated live countdown head marker for the dimmed tail-afterglow phase'
    );
    assert.match(
        source,
        /若 Boss telegraph 刚从可反制主拍切进 `尾段残影` 且新的 `当前倒计时头标` 首次出现，头标还会追加约 120ms 的短促暖闪/,
        'README should document the short warm flash that fires when the live countdown head marker first appears at the tail-afterglow transition'
    );
    assert.match(
        source,
        /若这段短促暖闪刚结束且剩余读招倒计时已低于约 220ms，头标外侧还会续上一层更弱的暖色余辉/,
        'README should document the weaker late warm glow that persists after the head-marker flash ends near the final tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 40ms，再把 `当前倒计时头标` 外层余辉 alpha 继续压低并钳在条体终点内侧/,
        'README should document the dimmer contained outer head-marker glow during the final 40ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 120ms，再把 `当前倒计时头标` 的内芯略微收窄提亮/,
        'README should document the narrower brighter countdown-head inner core during the last tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 20ms，再把 `当前倒计时头标` 的主芯高度略微收短贴边/,
        'README should document the shorter countdown-head inner core height during the final 20ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 10ms，再把 `当前倒计时头标` 外壳的上下帽沿也略微压短/,
        'README should document the shorter countdown-head shell caps during the final 10ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 2ms，再把 `当前倒计时头标` 内芯 alpha 也轻压一档/,
        'README should document the softer countdown-head inner core alpha during the final 2ms tail beat'
    );
    assert.match(
        source,
        /若已选 `命途圣坛` 的 `绝境修习`，`普攻 U` 会在生命高于 45% 时显示 `绝境<45%`、压进阈值后改成 `绝境\+40%`，真正带着这段低血爆发命中时还会补一个 `绝境` 浮字；若已选 `守心修习`，`闪避 Space` 会在生命高于 70% 时显示 `守心-18%`、跌出阈值后改成 `守心>70%`，而当这段高血减伤真实挡下一击时，玩家身旁还会补一个 `守心` 提示/,
        'README should document the risk/reward shrine threshold labels and the real combat payoff cues for both routes'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 的内芯与外壳再同步收窄半拍/,
        'README should document the final synchronized width trim for the countdown-head shell and inner core'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 外侧残余暖辉也同步压成更贴边的极细收尾/,
        'README should document that the residual outer late glow also narrows during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 外侧残余暖辉的色温也同步压淡半拍，避免最后一圈外辉仍比真正撞线更抢戏/,
        'README should document that the residual outer late glow color temperature also cools during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 内层残余暖辉的色温也同步压淡半拍，避免最后一丝内辉仍比真正撞线更抢戏/,
        'README should document that the residual inner late glow color temperature also cools during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间的色温反差也同步收敛半拍，避免清零前最后一粒撞线仍带双层暖度分层/,
        'README should document that the countdown-head shell/core color temperature also converges during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间的边缘清晰度也同步压软半拍，避免清零前最后一粒撞线仍像保留双层描边/,
        'README should document that the countdown-head shell/core seam also softens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间残余边缘高光也同步压平半拍，避免清零前最后一粒撞线仍像夹着一道细白描边/,
        'README should document that the countdown-head shell/core edge highlight also flattens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间残余边缘高光的左右厚差也同步抹平半拍，避免清零前最后一粒撞线仍像偏着一道细白描边/,
        'README should document that the countdown-head shell/core edge-highlight thickness also balances during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间残余边缘高光的左右亮度偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧多挂半圈白边/,
        'README should document that the countdown-head shell/core edge-highlight brightness also balances during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 壳芯之间残余边缘高光的左右冷暖透明层次也同步压匀半拍，避免清零前最后一粒撞线仍像单侧残留更白的一缕雾光/,
        'README should document that the countdown-head shell/core edge-highlight warm-vs-cool transparency layering also balances during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 外侧残余暖辉的上下高度也同步压短半拍/,
        'README should document that the residual outer late glow height also shortens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入 `尾段残影` 区间且剩余读招倒计时已低于约 1ms，再把 `当前倒计时头标` 内层残余暖辉 alpha 也同步轻压半拍/,
        'README should document that the residual inner late glow also softens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 `反制窗口` 只落在进度条本体中段，条内还会补一段 `窗口高亮区段`/,
        'README should document the contained counter-window span highlight for mid-bar counter windows'
    );
    assert.match(
        source,
        /Tab -> 点击背包消耗品 -> 1-4 使用/,
        'README should document the keyboard inventory-to-quick-slot loop'
    );
    assert.match(
        source,
        /若冷却结束后仍差体力，则会直接预告 `0\.3s后差8体\/0\.5s` 这类双阶段提示/,
        'README should document the post-cooldown stamina-gap preview on the action HUD'
    );
    assert.match(
        source,
        /翻滚锁定期间则会继续预告 `翻滚中 -> 就绪`、`翻滚中 -> 0\.2s`、`翻滚中 -> 差15体\/1\.0s` 这类翻滚后的下一状态；当任一动作刚切进 `就绪` 时，只有对应那一项会短促闪亮一下/,
        'README should document the per-action readiness flash on the action HUD during dodge lockout'
    );
    assert.match(
        source,
        /若窄屏下三段文案合计过长，行动 HUD 也会自动改成两行左对齐，并把瞄准\/武器提示整体上提/,
        'README should document the narrow-screen two-line fallback for long action HUD labels'
    );
    assert.match(
        source,
        /若已选 `复苏祷言`，`闪避 Space` 会常驻显示 `复苏\+35%`，真正因自然回体转好时还会短促切成 `复苏就绪`[\s\S]*?若已选 `迅击祷言`，`特攻 O` 会常驻显示 `迅击-22%`，真正转好时还会短促切成 `迅击就绪`/,
        'README should document the prayer-shrine identity label and payoff-ready cue'
    );
    assert.match(
        source,
        /资源与结算路线也会接进同一套第三房锚点：`复苏祷言 \/ 迅击祷言 \/ 豪赌 \/ 稳押 \/ 战地净化包 \/ 狂战补给` 会分别补 `复苏回拍 \/ 迅击抢拍 \/ 豪赌追赏 \/ 稳押收赏 \/ 净包稳场 \/ 狂油抢势` 这类 entry \/ clear \/ source cue；若 `稳押` 本身是因为 `当前更宜稳押` 才被推荐，还会继续升级成 `留本追赏`/,
        'README should document the resource-route anchor ladder and the narrower safer-gamble recommendation override'
    );
    assert.match(
        source,
        /`迅击祷言` 若本身就是因为 `当前局已偏节奏` 才被推荐，还会继续把 routed `高压战` 压成 `顺势抢压`；`战地净化包` 若是因为 `当前可负担` 才成立，也会把 routed `缓冲战` 继续压成 `趁价备净`/,
        'README should document the newly added tempo-bias and affordability why-now echoes for resource routes'
    );
    assert.match(
        source,
        /choice panel \/ 侧栏事件房摘要 \/ 已触发后的祭坛世界标签现在还会继续补 `首拍兑现 \/ 稳场兑现 \/ 追赏兑现` 这类极短时机签/,
        'README should document the new routed payoff-timing labels across the choice panel, sidebar summary, and resolved shrine label'
    );
    assert.match(
        source,
        /若已选 `连斩修习`，`普攻 U` 会常驻显示 `连斩-18%`，而当减 CD 真正把 `普攻 U` 从 `冷却` 或翻滚后的冷却预告推回 `就绪` 时，还会短促切成 `连斩就绪`/,
        'README should document the combat-discipline attack-ready payoff cue alongside the persistent route label'
    );
    assert.match(
        source,
        /当更短普攻 CD 真正压出更快的下一次普攻命中时，命中处还会补一个短促的 `连斩` 浮字与轻 hit pulse/,
        'README should document the combat-discipline hit-payoff cue when the shorter cooldown cashes out into a faster hit'
    );
    assert.match(
        source,
        /若已选 `游步修习`，`闪避 Space` 会常驻显示 `游步-20%\/-18%`，而当减 CD \/ 减耗真正把翻滚从 `冷却`、`差体` 或翻滚后的下一状态推回 `就绪` 时，还会短促切成 `游步就绪`/,
        'README should document the combat-discipline dodge-ready payoff cue alongside the persistent route label'
    );
    assert.match(
        source,
        /若已选 `复苏祷言`，`闪避 Space` 会常驻显示 `复苏\+35%`，真正因自然回体转好时还会短促切成 `复苏就绪`，并让体力条也同步短促抬亮一下/,
        'README should document the prayer-shrine stamina-bar threshold cue alongside the dodge-ready cue'
    );
    assert.match(
        source,
        /若已选 `游步修习`，`闪避 Space` 会常驻显示 `游步-20%\/-18%`，而当减 CD \/ 减耗真正把翻滚从 `冷却`、`差体` 或翻滚后的下一状态推回 `就绪` 时，还会短促切成 `游步就绪`；当减耗真正把 `闪避 Space` 从 `差体` 或翻滚后预告推回 `就绪` 时，体力条也会同步短促抬亮一下/,
        'README should document the combat-discipline stamina-bar threshold cue alongside the dodge-ready cue'
    );
    assert.match(
        source,
        /若已选 `追猎修习`，`普攻 U` 会先显示 `追猎待闪`，翻滚收招后改成 `追猎1\.4s` 这类剩余窗口提示，真正把这段窗口兑现成强化普攻命中时，还会补一个更亮的 `追猎斩` 浮字与 hit pulse；若已选 `调息修习`，`特攻 O` 会常驻显示 `调息\+6`，且只有在特攻命中后真的回到体力时，左上体力条才会同步短促抬亮并脉冲一下/,
        'README should document the counterattack-shrine attack-followup window and special-hit stamina payoff cues'
    );
    assert.match(
        source,
        /Boss 战切到专用 HUD 后，顶部血条会继续收紧，但左下角 `当前瞄准 \/ 武器 \/ 普攻-特攻-闪避` 与右下快捷栏仍保持同一套底边留白/,
        'README should document the stable bottom spacing guard when boss layout tightens the top HUD'
    );
    assert.match(
        source,
        /快捷栏N：\+<短名>/,
        'README should document the slot-led plus-marker shortform for non-overwrite quick-slot placement feedback'
    );
    assert.match(
        source,
        /若临时拿不到显式短名，则会改为沿用道具名生成的“快捷栏N：\+<道具名词干>”短句，例如“快捷栏N：\+生命”/,
        'README should document the name-derived fallback for the non-overwrite placement toast'
    );
    assert.match(
        source,
        /若道具名词干过长，则会自动截成带省略号的紧凑标签，例如“快捷栏N：\+圣疗秘…”/,
        'README should document the ellipsis clamp for overlong non-overwrite fallback labels'
    );
    assert.match(
        source,
        /优先按 Phaser 文本实际宽度钳制.*“快捷栏N：\+HP恢复”/,
        'README should document the Phaser-backed mixed-width fallback example'
    );
    assert.match(
        source,
        /若当前环境拿不到真实测量结果，则会回退为宽度权重估算/,
        'README should document the heuristic fallback when runtime text measurement is unavailable'
    );
    assert.match(
        source,
        /覆盖路径也会沿用同一钳制，例如“快捷栏1：古代狂…→神圣净…”/,
        'README should document the shared ellipsis clamp on overwrite fallback labels'
    );
    assert.match(
        source,
        /净化药剂\/狂战油在铁匠制作成功时也会直接装入快捷栏，并沿用同一套“快捷栏N：\+净化”\/“快捷栏1：狂战→净化”提示/,
        'README should document that crafted combat consumables also route straight into the quick bar with the shared notice contract'
    );
    assert.match(
        source,
        /制作行现在还会直接补“入1”\/“覆盖1：狂战→净化”这类快捷栏预告，让玩家在点前就知道会落在哪格、会不会顶掉现有补给/,
        'README should document the pre-click quick-slot landing preview on blacksmith recipe rows'
    );
    assert.match(
        source,
        /并额外补一条“净化药剂x2 · 差15金”这类批量回执，直接交代本次做了几份、又是因金币还是材料耗尽才停下/,
        'README should document the compact batch receipt that reports produced count and stop reason'
    );
    assert.match(
        source,
        /若这条制作成功回执还要再拼上快捷栏落位提示，底部消息会先按实际宽度把“快捷栏1：狂战→净化”收束成“覆盖1：狂战→净化”\/“入1”这类短后缀，并把“净化药剂x2 · 差15金”这类做了几份\/为何停下信息留在前面/,
        'README should document that narrow craft success toasts collapse the quick-slot suffix before they sacrifice the batch receipt'
    );
    assert.match(
        source,
        /若制作失败提示碰上长材料名或后续 richer error copy，底部消息也会先按实际宽度把“材料不足: 懒惰之精华”收束成“材料不足: 懒惰”\/“材料不足”，把 blocker 留在前面/,
        'README should document that narrow craft failure toasts keep the blocker prefix before clamping long material detail'
    );
    assert.match(
        source,
        /若强化成功提示触发时，底部消息会优先读出“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4 \/ 特攻-0.2s \/ 体耗-2 · 消耗2个暴怒之精华”这类带升级段位、收益与材料锚点的回执；若像“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5 \/ 特攻-0.2s \/ 体耗-1 · 累计伤害\+9 \/ 特攻-0.3s \/ 体耗-3 · 消耗2个暴怒之精华”这类末级升级累计总览也放得下，还会优先把整把武器的累计现况与本次花费一起钉在回执尾段；若中宽档位放不下完整累计总览，则会先保住“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5 \/ 特攻-0.2s \/ 体耗-1 · 累计\+9 \/ 特攻-0.3s · 消耗2个暴怒”或至少“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5 \/ 特攻-0.2s \/ 体耗-1 · 累计伤害\+9 · 消耗2个暴怒”这类累计\+消耗双锚点，再继续退回只保留累计首段的旧梯子；若行宽再继续吃紧，才会退回“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4 \/ 特攻-0.2s \/ 体耗-2”、“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4”或“强化成功! Lv\.1→Lv\.2”，优先把成功结论与升级段位留在前；材料不足路径也会先把“材料不足! 需要2个暴怒之精华”收束成“材料不足! 需要2个暴怒”\/“材料不足! 需要2个”，把 blocker 留在前面/,
        'README should document that later-upgrade success toasts now preserve compact cumulative-plus-spend anchors before they fall back to the older level/payoff ladder'
    );
    assert.match(
        source,
        /若窄窗口下“\[强化\] 250金\+2暴怒之精华”这类强化按钮过长，按钮文案也会先按实际宽度把精华名收束成“\[强化\] 250金\+2暴怒”\/“\[强化\] 250金\+2个”，并把“\[强化\]”与金币\/材料成本留在前，避免长精华名继续挤窄按钮可读区/,
        'README should document that narrow upgrade buttons keep the action plus gold/material cost before clamping long essence names'
    );
    assert.match(
        source,
        /铁匠强化行现在也会在点按钮前直接显示 `可强化 \/ 差50金 \/ 差2个暴怒之精华` 这类短标签，blocked 时 `\[强化\]` 会同步降色停用，避免继续把 upgrade 决策留到失败提示才揭晓/,
        'README should document that upgrade rows expose the shared pre-click affordability labels and disable blocked buttons'
    );
    assert.match(
        source,
        /Lv\.3 武器右侧动作位不再留空，会直接显示 `已满级` \/ `满阶` 这类短标签，并沿用同一宽度护栏，避免把空白误读成未解锁、渲染缺失或还能继续强化/,
        'README should document that max-level weapon rows keep a compact right-slot status label instead of a blank action lane'
    );
    assert.match(
        source,
        /铁匠强化行现在也会在点按钮前直接补上 `本次伤害\+4 \/ 特攻-0.2s \/ 体耗-2` 这类短收益摘要；若武器已升过但还没满级，强化行还会优先补 `累计\+下次 · 累计伤害\+4 \/ 本次伤害\+5` 这类双层短摘要，让玩家在同一行同时读到已购成长与下一跳收益；若行宽再吃紧，会先收束成 `累计\+4 \/ 下次\+5` 这类紧凑双层锚点，再继续退到 `累计伤害\+4 \/ 本次伤害\+5`、`累计伤害\+4` 或 `本次伤害\+5`，避免非满级阶段过早丢掉双层语义/,
        'README should document that non-max upgrade rows keep a compact cumulative-versus-next anchor before they fall back to unlabeled or single-layer summaries'
    );
    assert.match(
        source,
        /若武器已满级，强化行也不会退回只剩武器名，而会改为常驻显示 `已满级 · 累计伤害\+9 \/ 特攻-0.3s \/ 体耗-3` 这类累计已购收益；若行宽继续吃紧，会先收束成 `满阶 · 累计伤害\+9`，避免满级后又读不出这把武器已经买到了哪些成长/,
        'README should document that max-level upgrade rows keep an owned-benefit echo visible after the final purchase'
    );
    assert.match(
        source,
        /若制作行已显示 `可做xN`，点击一次 `\[制作\]` 还会直接做到当前上限，不再逐份点满/,
        'README should document that the visible craftable count now cashes out as a one-click max batch'
    );
    assert.match(
        source,
        /背包悬停说明也会按实际文本宽度贴边，因此靠近屏幕右缘时不会继续沿用固定 200px 估算/,
        'README should document the width-aware inventory tooltip placement'
    );
    assert.match(
        source,
        /事件房祭坛靠近提示也会按 Phaser 文本实际宽度贴在当前视口内，因此贴近屏幕边缘时不会被裁出画面/,
        'README should document viewport-safe measured event-room prompts'
    );
    assert.match(
        source,
        /事件房抉择面板本身也会在高置信场景下把 `建议 1\/2：净泉啜饮 · 可净化2层` 这类 shared recommendation 压进底部脚注，把当前状态真正收束成一眼可读的选择结论，但不会改动原有 1\/2 顺序；若玩家真的按下这条高置信路线，已触发后的 HUD \/ 祭坛世界标签 \/ 结算浮字也会继续补 `治疗: 净泉啜饮 · 可净化2层` \/ `效果: 绝境修习 · 已处绝境线` 这类极短确认/,
        'README should document that a high-confidence event-room recommendation can persist into resolved confirmation surfaces after the player commits'
    );
    assert.match(
        source,
        /同一套 shared recommendation 现在也会在 `祈愿圣坛` 给出 `建议 2：迅击祷言 · 当前局已偏节奏` 这类节奏偏向脚注/,
        'README should document the new tempo-bias recommendation footer for prayer shrine choices'
    );
    assert.match(
        source,
        /当前目标 Boss 也会在少量高置信场景下折进同一套 footer：例如 `复苏祷言 \/ 游步修习 \/ 离弦修习` 现在也能分别给出 `目标Boss更宜回体 \/ 稳拍 \/ 追后` 这类 matchup-aware reason/,
        'README should document the new boss-aware recommendation footer examples'
    );
    assert.match(
        source,
        /补充：`命途圣坛 \/ 烙痕圣坛` 现在也会沿用同一套 boss-posture ladder。若当前血线还没压进 `绝境 \/ 守心` 阈值，或 burn\/bleed loadout 也还没有强到足以单独解释当前 live state，`绝境修习 \/ 守心修习 \/ 余烬修习 \/ 血痕修习` 也会分别给出 `目标Boss更宜压线 \/ 回体 \/ 控场 \/ 压线` 这类脚注[\s\S]*?现阶段这条 threshold\/status posture ladder 就停在 routed encounter handoff，不再继续扩到 forge \/ consumable 这类更间接 surface；在出现新的真实缺口前，也不再额外开新的延伸 lane。 当前项目已进入一轮维护模式/,
        'README should document the new threshold/status boss-posture tiebreakers'
    );
    assert.match(
        source,
        /`战技 \/ 镇压 \/ 战势 \/ 连携 \/ 反击` 这些行动型 blessing route 也会把 live combat state 接进同一套 recommendation helper，并在高置信场景下给出 `建议 1\/2：连斩修习 · 普攻卡拍` \/ `游步修习 · 闪避卡拍` \/ `镇步修习 · 当前更宜控场` \/ `借势修习 · 特攻待借势` \/ `催锋修习 · 特攻待连段` \/ `回身修习 · 闪避待回身` \/ `追猎修习 · 可立即追猎` \/ `调息修习 · 当前更缺回体` 这类脚注/,
        'README should document that action-route recommendations now use live combat bottlenecks before selection'
    );
    assert.match(
        source,
        /当这些 action recommendation 的 persisted reason 仍和 routed encounter 强相关时，第三房入口 \/ 清场 \/ 首个关键战斗节点还会继续补 `高压战 · 三向成压 · 抢拍开刃` \/ `缓冲战 · 双拍缓冲 · 游步回拍` \/ `淘金战 · 后排赏金 · 破势收赏` 这类更窄的 why-now echo/,
        'README should document that action-route recommendation reasons now continue into narrower routed room-3 echoes'
    );
    assert.match(
        source,
        /当这个已存储 reason 与 routed encounter 仍强相关时，第三房入口 \/ 清场短句还会继续补 `缓冲战 · 双拍缓冲 · 净化后稳场` \/ `高压战 · 三向成压 · 压线抢势` \/ `淘金战 · 后排赏金 · 血线够追赏` 这类更短遭遇回响；`命途圣坛` 的 `绝境修习 \/ 守心修习` 现在也会真正导向 `下间高压 \/ 下间缓冲`/,
        'README should document that persisted recommendation reasons can now echo through routed room-3 entry and clear feedback, including the newly routed threshold shrine'
    );
    assert.match(
        source,
        /`武备圣坛` 的 `压阵修习 \/ 离弦修习` 会分别把下一房压成 `下间高压 \/ 下间淘金`，`烙痕圣坛` 的 `余烬修习 \/ 血痕修习` 则会分别导向 `下间缓冲 \/ 下间高压`；若这些路线本身也是当下的高置信 recommendation，入口 \/ 清场 \/ 战中 source cue 还会继续补 `贴身压阵 \/ 远程追赏 \/ 灼烧稳场 \/ 挂血抢势`/,
        'README should document the first build-facing shrine routes that now participate in routed encounter mapping and recommendation cues'
    );
    assert.match(
        source,
        /`武备圣坛 \/ 烙痕圣坛` 这批 build-facing route 现在也不再只看“当前持近战 \/ 当前持远程 \/ 当前武器可触发”这类静态 loadout fit；当 live combat state 同样指向 routed encounter 的节奏时，choice panel 也会给出 `建议 1\/2：压阵修习 · 近战更宜压线` \/ `离弦修习 · 远程更宜追赏` \/ `余烬修习 · 灼烧更宜稳场` \/ `血痕修习 · 挂血更宜抢势`/,
        'README should document that build-facing route recommendations now use loadout plus live combat context before selection'
    );
    assert.match(
        source,
        /若这些 boss-aware reason 仍和 routed encounter 强相关，`复苏祷言 \/ 游步修习 \/ 离弦修习` 也会继续压成 `回体稳线 \/ 游步稳拍 \/ 远程断后` 这类更窄 echo/,
        'README should document that boss-aware recommendation reasons continue into routed encounter echoes'
    );
    assert.match(
        source,
        /同一套 Boss posture 现在也会继续折进更细颗粒的 action route：`镇步修习 \/ 借势修习 \/ 催锋修习 \/ 追猎修习 \/ 调息修习` 也会在少量高置信场景下分别给出 `目标Boss更宜控场 \/ 借势 \/ 连段 \/ 追猎 \/ 回体` 这类脚注/,
        'README should document the extended boss-aware action-route recommendation footer examples'
    );
    assert.match(
        source,
        /当这些 action-route boss-aware reason 仍和 routed encounter 强相关时，第三房入口 \/ 清场 \/ 首个关键战斗节点也会继续压成 `先控稳场 \/ 借势抢压 \/ 连段催锋 \/ 追猎收赏 \/ 回体稳线` 这类更窄 echo/,
        'README should document the routed encounter echoes for the extended boss-aware action-route reasons'
    );
    assert.match(
        source,
        /其余行动型 blessing route 现在也会接进同一套 ladder：`战技圣坛` 的 `连斩修习 \/ 游步修习`、`镇压圣坛` 的 `镇步修习 \/ 破势修习`、`战势圣坛` 的 `回息修习 \/ 借势修习`、`连携圣坛` 的 `催锋修习 \/ 回身修习`、`反击圣坛` 的 `追猎修习 \/ 调息修习` 也会分别导向 `下间缓冲 \/ 下间高压 \/ 下间淘金`，并在没有高置信 recommendation receipt 时继续补 `连斩抢拍 \/ 游步整拍 \/ 镇步控场 \/ 破势追杀 \/ 回息稳场 \/ 借势重击 \/ 催锋连段 \/ 回身整拍 \/ 追猎追赏 \/ 调息回线`/,
        'README should document the new action-route encounter ladder and baseline anchors for non-recommendation blessing routes'
    );
    assert.match(
        source,
        /当第三房真正开始兑现这条 recommendation 时，shared contract 还会只在首个稳场节点 \/ 首个高压接敌 \/ 首个赏金兑现点再补一次 `净化后稳场` \/ `压线抢势` \/ `血线够追赏` 这类战中 source cue，把“为什么推荐这条”接到实际交手瞬间/,
        'README should document the one-shot combat source cue that cashes recommendation reasons into the first key routed room-3 beat'
    );
    assert.match(
        source,
        /右侧固定侧栏里的章节标题、区域名、本局词缀、本局挑战与事件房摘要会优先按 Phaser 文本实际宽度钳制，并按实际文本高度动态纵向排布/,
        'README should document measured fitting and vertical stacking for the fixed right sidebar'
    );
    assert.match(
        source,
        /若视口进入 compact 档位，则本局词缀与事件房摘要会收敛为有限行数并在最后一行补省略号/,
        'README should document the compact-tier line-cap and ellipsis policy for long sidebar blocks'
    );
    assert.match(
        source,
        /regular 三行挑战摘要的正文行若遇到上游已带 `本局挑战：` \/ `挑战：` 前缀的标签，也会先去重，避免与标题行重复同一前缀/,
        'README should document that regular three-line challenge summaries dedupe upstream challenge prefixes before rendering the body line'
    );
    assert.match(
        source,
        /若上游标签重复混入 `本局` \/ `挑战：` 这类 plain-text 前缀，会继续循环去重直到收敛成真正目标；各类 decorator wrapper（如 `【本局挑战】` \/ `\[挑战\]`[\s\S]*?`〔挑战〕` \/ `〖本局挑战〗`，以及 `【「挑战」】` \/ `《〔本局挑战〕》`[\s\S]*?`【〖挑战〗】` \/ `〖［本局挑战］〗`[\s\S]*?`【'挑战'】` \/ `'［本局挑战］'` 这类 nested mixed）也会先逐层剥离，再继续做同一轮 `本局` \/ `挑战` 去重/u,
        'README should document grouped challenge decorator cleanup families before repeated plain-text prefix dedupe'
    );
    assert.match(
        source,
        /`［挑战］` \/ `［本局挑战］`/,
        'README should document full-width square-bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`\(挑战\)` \/ `（本局挑战）`/,
        'README should document round-parenthesis challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`【（挑战）】` \/ `（［本局挑战］）`/,
        'README should explicitly document nested square and parenthesis mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【｛挑战｝】` \/ `｛［本局挑战］｝`/,
        'README should explicitly document nested square and curly mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【＜挑战＞】` \/ `＜［本局挑战］＞`/,
        'README should explicitly document nested square and angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【《挑战》】` \/ `〈［本局挑战］〉`/,
        'README should explicitly document nested square and book-title mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〈挑战〉］` \/ `〈［本局挑战］〉`/,
        'README should explicitly document nested full-width square and corner-angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈［挑战］〉` \/ `［〈本局挑战〉］`/,
        'README should explicitly document nested corner-angle and full-width square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈\[挑战\]〉` \/ `\[〈本局挑战〉\]`/,
        'README should explicitly document nested corner-angle and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈【挑战】〉` \/ `【〈本局挑战〉】`/,
        'README should explicitly document nested corner-angle and square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〘挑战〙〉` \/ `〘〈本局挑战〉〙`/,
        'README should explicitly document nested corner-angle and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〚挑战〛〉` \/ `〚〈本局挑战〉〛`/,
        'README should explicitly document nested corner-angle and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〔挑战〕〉` \/ `〔〈本局挑战〉〕`/,
        'README should explicitly document nested corner-angle and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〖挑战〗〉` \/ `〖〈本局挑战〉〗`/,
        'README should explicitly document nested corner-angle and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈“挑战”〉` \/ `“〈本局挑战〉”`/,
        'README should explicitly document nested corner-angle and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈‘挑战’〉` \/ `‘〈本局挑战〉’`/,
        'README should explicitly document nested corner-angle and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈"挑战"〉` \/ `"〈本局挑战〉"`/,
        'README should explicitly document nested corner-angle and ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈'挑战'〉` \/ `'〈本局挑战〉'`/,
        'README should explicitly document nested corner-angle and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈｢挑战｣〉` \/ `｢〈本局挑战〉｣`/,
        'README should explicitly document nested corner-angle and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈﹁挑战﹂〉` \/ `﹃〈本局挑战〉﹄`/,
        'README should explicitly document nested corner-angle and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〝挑战〞〉` \/ `〝〈本局挑战〉〞`/,
        'README should explicitly document nested corner-angle and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〝挑战〟〉` \/ `〝〈本局挑战〉〟`/,
        'README should explicitly document nested corner-angle and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〈〈挑战〉〉` \/ `［［本局挑战］］`/,
        'README should explicitly document repeated same-family bracket stacks alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`""挑战""` \/ `''本局挑战''`/,
        'README should explicitly document repeated same-family symmetric quote stacks alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`〝〝挑战〞〟` \/ `〝〝本局挑战〟〟`/,
        'README should explicitly document same-open ornamental quote stacks that close in double-prime then low-double-prime order alongside the existing repeated stack examples'
    );
    assert.match(
        source,
        /`〝〝挑战〟〞` \/ `〝〝本局挑战〟〞`/,
        'README should explicitly document same-open ornamental quote stacks that close in low-double-prime then double-prime order alongside the existing repeated stack examples'
    );
    assert.match(
        source,
        /`\[〈挑战〉\]` \/ `〈\[本局挑战\]〉`/,
        'README should explicitly document nested ASCII square and corner-angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【『挑战』】` \/ `『［本局挑战］』`/,
        'README should explicitly document nested square and corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【｢挑战｣】` \/ `｢［本局挑战］｣`/,
        'README should explicitly document nested square and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【﹁挑战﹂】` \/ `﹃［本局挑战］﹄`/,
        'README should explicitly document nested square and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〝挑战〞】` \/ `〝［本局挑战］〞`/,
        'README should explicitly document nested square and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〝挑战〟】` \/ `〝［本局挑战］〟`/,
        'README should explicitly document nested square and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〘挑战〙】` \/ `〘［本局挑战］〙`/,
        'README should explicitly document nested square and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〚挑战〛】` \/ `〚［本局挑战］〛`/,
        'README should explicitly document nested square and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〔挑战〕】` \/ `〔［本局挑战］〕`/,
        'README should explicitly document nested square and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【〖挑战〗】` \/ `〖［本局挑战］〗`/,
        'README should explicitly document nested square and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【“挑战”】` \/ `“［本局挑战］”`/,
        'README should explicitly document nested square and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【‘挑战’】` \/ `‘［本局挑战］’`/,
        'README should explicitly document nested square and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【'挑战'】` \/ `'［本局挑战］'`/,
        'README should explicitly document nested square and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【［挑战］】` \/ `［【本局挑战】］`/,
        'README should explicitly document nested square and full-width square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【\[挑战\]】` \/ `\[【本局挑战】\]`/,
        'README should explicitly document nested square and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［【挑战】］` \/ `【［本局挑战］】`/,
        'README should explicitly document nested full-width square and square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［\[挑战\]］` \/ `\[［本局挑战］\]`/,
        'README should explicitly document nested full-width square and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［｛挑战｝］` \/ `｛［本局挑战］｝`/,
        'README should explicitly document nested full-width square and full-width curly mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［（挑战）］` \/ `（［本局挑战］）`/,
        'README should explicitly document nested full-width square and parenthesis mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［＜挑战＞］` \/ `＜［本局挑战］＞`/,
        'README should explicitly document nested full-width square and angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［《挑战》］` \/ `《［本局挑战］》`/,
        'README should explicitly document nested full-width square and book-title mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［「挑战」］` \/ `「［本局挑战］」`/,
        'README should explicitly document nested full-width square and corner-bracket mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［"挑战"］` \/ `"［本局挑战］"`/,
        'README should explicitly document nested full-width square and ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〘挑战〙］` \/ `〘［本局挑战］〙`/,
        'README should explicitly document nested full-width square and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［﹁挑战﹂］` \/ `﹃［本局挑战］﹄`/,
        'README should explicitly document nested full-width square and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〚挑战〛］` \/ `〚［本局挑战］〛`/,
        'README should explicitly document nested full-width square and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〔挑战〕］` \/ `〔［本局挑战］〕`/,
        'README should explicitly document nested full-width square and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〖挑战〗］` \/ `〖［本局挑战］〗`/,
        'README should explicitly document nested full-width square and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［“挑战”］` \/ `“［本局挑战］”`/,
        'README should explicitly document nested full-width square and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［『挑战』］` \/ `『［本局挑战］』`/,
        'README should explicitly document nested full-width square and corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［｢挑战｣］` \/ `｢［本局挑战］｣`/,
        'README should explicitly document nested full-width square and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〝挑战〞］` \/ `〝［本局挑战］〞`/,
        'README should explicitly document nested full-width square and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［〝挑战〟］` \/ `〝［本局挑战］〟`/,
        'README should explicitly document nested full-width square and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［‘挑战’］` \/ `‘［本局挑战］’`/,
        'README should explicitly document nested full-width square and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`［'挑战'］` \/ `'［本局挑战］'`/,
        'README should explicitly document nested full-width square and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`【"挑战"】` \/ `《'本局挑战'》`/,
        'README should explicitly document nested ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /`"挑战"` \/ `'本局挑战'`/,
        'README should document ASCII straight-quote challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`｢挑战｣` \/ `｢本局挑战｣`/,
        'README should document half-width corner-quote challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`﹁挑战﹂` \/ `﹃本局挑战﹄`/,
        'README should document presentation-form quote challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`〝挑战〞` \/ `〝本局挑战〞`/,
        'README should document ornamental double-prime quote decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`〝挑战〟` \/ `〝本局挑战〟`/,
        'README should document ornamental low double-prime quote decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`〘挑战〙` \/ `〘本局挑战〙`/,
        'README should document white tortoise-shell bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /`〚挑战〛` \/ `〚本局挑战〛`/,
        'README should document white square bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /wrapper 内部的 separator 家族现在按分组统一做 token 规范化：leading \/ orphan separators（如 `：挑战` \/ `-本局挑战` \/ standalone `：` \/ `-`(?:，以及 `【：】` \/ `《-》` 这类 separator-only payload)?）、full-width pipe \/ slash（`｜` \/ `／`）、ASCII pipe \/ slash \/ backslash（`\|` \/ `\/` \/ `\\\\`）、middle-dot \/ bullet（`·` \/ `•`）、comma \/ semicolon \/ sentence punctuation（`、` \/ `，` \/ `；` \/ `。` \/ `!` \/ `\?` \/ `！` \/ `？`）、tilde \/ ellipsis（`~` \/ `～` \/ `…` \/ `⋯`）、dash（`—` \/ `–`）；这些脏分隔符都会先被清掉，再继续做同一轮 `本局` \/ `挑战` 去重；若去重后已无剩余正文，则 regular \/ compact 摘要统一回退为 `未知挑战`/,
        'README should document grouped wrapper-internal separator cleanup families and the shared 未知挑战 fallback'
    );
    assert.match(
        source,
        /`【：】` \/ `《-》` 这类 separator-only payload/,
        'README should document separator-only wrapper payload cleanup inside the grouped separator family guidance'
    );
    assert.match(
        source,
        /当 regular 第三行宽度预算继续吃紧时，进行中与完成态也会先沿用 `进度:12\/30  奖励:\+90金 -> 进度:12\/30 -> 12\/30` \/ `进度:30\/30  奖励:\+90金 -> 进度:30\/30 -> 30\/30` 这条语义回退链，而不是直接退化成通用省略/,
        'README should document the regular third-line semantic fallback chain for both in-progress and completed challenge summaries'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 regular 第三行会继续沿用 `进度:12\/30 -> 12\/30` \/ `进度:30\/30 -> 30\/30` 这条 progress-only 回退梯子，不会伪造 `奖励:\+0金` \/ `奖励:未知` 这类占位奖励；若未来扩展到 `\+9999金 \+净化` 这类复合奖励短句，regular 第三行也会继续沿用同一条进度优先回退链/,
        'README should document the rewardless regular third-line fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /共享 challenge 标签与显式奖励短句 helper 也会压缩异常半角 \/ 全角空白，并把 `\+ 9999金` \/ `\+ 净化` 与 `＋ 9999金` \/ `＋ 净化` 这类 additive token 空白 \/ full-width plus 规整成 `\+9999金 \+净化`/,
        'README should document full-width plus normalization inside explicit reward short labels'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为 `未知挑战` 且当前 challenge 没有奖励短句，则 regular 三行摘要会继续保留 `未知挑战` 正文，并沿用 `进度:12\/30 -> 12\/30` \/ `进度:30\/30 -> 30\/30` 这条 no-reward progress-only 回退链/,
        'README should document the unknown-label rewardless regular fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为 `未知挑战` 但当前 challenge 仍有奖励短句，则 regular 三行摘要会继续保留 `未知挑战` 正文，并沿用 `进度:12\/30  奖励:\+90金` \/ `进度:30\/30  奖励:\+90金` 这条 reward-bearing 第三行语义，不额外插入新的中间短句/,
        'README should document the unknown-label reward-bearing regular fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，则 regular 第三行会改为沿用 `进行中  奖励:\+90金 -> 进行中` 这组状态优先回退，不再输出误导性的 `进度:0\/0` \/ `0\/0`；compact 标题也会改为 `本局挑战：进行中`，继续保留第二行目标 \/ 奖励短句/,
        'README should document the invalid-target regular and compact in-progress fallbacks without misleading 0/0 copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用 `进行中`；compact 标题继续保留 `本局挑战：进行中` 且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用 `挑战进行中 -> 进行中` 这组 no-reward 状态回退，不补 `0\/0` \/ `奖励:\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the invalid-target in-progress no-reward fallback chain across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular \/ compact \/ ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing in-progress helper，统一收敛 `进行中  奖励:\+90金` \/ `击败 30 个敌人 · \+90金` \/ `挑战进行中 · \+90金` 这条状态优先语义，避免未来文案漂移/,
        'README should document the shared reward-bearing in-progress invalid-target helper across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，且前缀去重后的正文已回退为 `未知挑战`，compact 第二行也会继续沿用 `未知挑战 · \+90金` \/ `未知挑战` 这组 detail fallback，不补 `0\/0` \/ `进度:0\/0` 这类误导性占位/,
        'README should document the invalid-target compact in-progress unknown-label fallback without reintroducing misleading ratio copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，则 regular 第三行会改为沿用 `已完成  奖励:\+90金 -> 已完成` 这组 completed-state 回退，不再误退回 `进行中`；即使正文已因前缀去重回退成 `未知挑战`，第三行也会继续保留 completed-state 语义/,
        'README should document the invalid-target regular completed fallback without regressing to in-progress copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用 `已完成`；compact 标题继续保留 `本局挑战：已完成` 且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用 `挑战完成 -> 完成` 这组 completed-state \/ no-reward 回退链，不误退回 `进行中`，也不补 `奖励:\+0金` \/ `奖励:未知`/,
        'README should document the invalid-target completed no-reward fallback chain across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular \/ compact \/ ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing completed helper，统一收敛 `已完成  奖励:\+90金` \/ `击败 30 个敌人 · \+90金` \/ `挑战完成 · \+90金` 这条 completed-state 语义，避免未来文案漂移/,
        'README should document the shared reward-bearing completed invalid-target helper across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且前缀去重后的正文已回退为 `未知挑战`，compact 第二行也会继续沿用 `未知挑战 · \+90金` \/ `未知挑战` 这组 completed detail fallback，不误退回 `进行中`/,
        'README should document the invalid-target compact completed unknown-label fallback without regressing to in-progress copy'
    );
    assert.match(
        source,
        /若上游挑战标题仍带 `本局挑战：` \/ `挑战：` 前缀，compact 第二行也会先去重再拼接奖励短句，避免紧凑摘要重复“挑战”标题/,
        'README should document that compact challenge detail lines dedupe upstream challenge prefixes before appending reward labels'
    );
    assert.match(
        source,
        /当 compact 进行中摘要的第二行宽度预算继续吃紧时，也会先沿用 `击败 30 个敌人 · \+90金 -> 击败 30 个敌人 -> 击败30个敌人` 这条语义回退链，而不是直接退化成通用省略/,
        'README should document the compact in-progress second-line semantic fallback before generic truncation'
    );
    assert.match(
        source,
        /完成态的第二行宽度预算继续吃紧时，也会沿用同一条 `击败 30 个敌人 · \+90金 -> 击败 30 个敌人 -> 击败30个敌人` 语义回退链/,
        'README should document the compact completed second-line semantic fallback before generic truncation'
    );
    assert.match(
        source,
        /若未来扩展到 `\+9999金 \+净化` 这类复合奖励短句，compact 进行中 \/ 完成态第二行也都会继续沿用同一条回退链/,
        'README should document that compact in-progress and completed compound rewards reuse the same second-line fallback chain'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 compact 第二行会继续沿用 `击败 30 个敌人 -> 击败30个敌人` 这条 label-only 回退梯子，不补 `\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the rewardless compact second-line fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为 `未知挑战` 且当前 challenge 没有奖励短句，则 compact 第二行也会继续保留 `未知挑战` 这条 label-only 回退，不补 `\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the unknown-label rewardless compact fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为 `未知挑战` 且当前 challenge 仍有奖励短句，则 compact 第二行也会继续保留 `未知挑战 · \+90金` 这条 reward-bearing 回退，不额外插入新的中间短句/,
        'README should document the unknown-label reward-bearing compact fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若进一步进入 ultra-compact 档位，则会先进一步收紧各区块间距与底边缓冲，本局词缀会压到 1 行、事件房摘要压到 2 行，本局挑战也会收敛为单行 `挑战 进度 · 奖励` 摘要/,
        'README should document the ultra-compact spacing reduction before the tightest sidebar caps'
    );
    assert.match(
        source,
        /即使奖励数值扩大到 `\+9999金` 这类长度，进行中态也会继续沿用 `挑战 12\/30 · \+90金 -> 挑战 12\/30 -> 12\/30` 这条语义回退链，完成态则继续沿用 `挑战完成 · \+90金 -> 挑战完成 -> 完成`，而不会额外插入新的中间短句/,
        'README should document that large reward values still use the existing visible challenge summary fallback ladders'
    );
    assert.match(
        source,
        /若未来扩展到 `\+9999金 \+净化` 这类复合奖励短句，也会继续沿用同一条可见摘要与完成徽记回退链/,
        'README should document that future compound reward short labels reuse the same fallback ladder'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 ultra-compact 单行摘要也会继续沿用 `挑战 12\/30 -> 12\/30` \/ `挑战完成 -> 完成` 这条 no-reward 回退梯子，不补 `\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the rewardless ultra-compact fallback ladder without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，则 ultra-compact 单行摘要会改为沿用 `挑战进行中 · \+90金 -> 挑战进行中 -> 进行中` 这组状态优先回退；隐藏后的轻量 in-progress badge 则保持静默，不输出 `挑战 0\/0` \/ `进0\/0` \/ `0\/0`。/,
        'README should document the invalid-target ultra-compact and hidden-badge fallbacks without misleading ratio copy'
    );
    assert.match(
        source,
        /即使当前 challenge 仍有奖励短句，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，隐藏后的轻量 in-progress challenge badge 也仍会继续沿用 `进12\/30 -> 12\/30 -> 进12 -> 静默隐藏` 这组 progress-only 回退链，不额外插入 `未知挑战` \/ `\+90金` \/ `奖励:未知` 这类中间占位/,
        'README should document that reward-bearing hidden in-progress badges stay on the same label-agnostic progress ladder when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的 `target` 压成 0 或更低，且当前 challenge 仍有奖励短句，隐藏后的轻量 in-progress challenge badge 也会继续保持静默，不输出 `挑战 0\/0` \/ `进0\/0` \/ `0\/0`/,
        'README should document that reward-bearing hidden in-progress badges stay silent on invalid targets'
    );
    assert.match(
        source,
        /对应的轻量 badge appearance 也会回退为空文案并清空弱化 tint \/ alpha，避免标题行残留旧着色/,
        'README should document that the silent reward-bearing hidden in-progress badge also clears its subdued appearance state'
    );
    assert.match(
        source,
        /run-modifier heading 在 hidden challenge badge 静默路径下也会同步回收标题宽度预算；即使 badge 输入在最终拟合后被压成空文案或只剩空白，也会清空残留样式/,
        'README should document that the run-modifier heading also clears stale badge styling when fitting collapses the hidden badge to silence'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，ultra-compact 这条单行摘要也仍会保持同一组 `挑战 12\/30 · \+90金 -> 挑战 12\/30 -> 12\/30` \/ `挑战完成 · \+90金 -> 挑战完成 -> 完成` 语义短句，不额外插入 `未知挑战` 这类中间短句/,
        'README should document that ultra-compact challenge summaries stay on the same fallback ladder even when the body label falls back to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，ultra-compact 这条单行摘要也仍会继续沿用 `挑战完成 · \+90金 -> 挑战完成 -> 完成` 这组 completed-state 回退链，不额外插入 `未知挑战`/,
        'README should document the invalid-target completed ultra-compact unknown-label fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，若奖励短句未来扩展到 `\+9999金 \+净化` 这类显式复合形式，ultra-compact 这条单行摘要也仍会继续沿用同一组 `挑战 12\/30 · \+9999金 \+净化 -> 挑战 12\/30 -> 12\/30` \/ `挑战完成 · \+9999金 \+净化 -> 挑战完成 -> 完成` 语义短句，不额外插入 `未知挑战` 这类中间短句/,
        'README should document the unknown-label ultra-compact compound-reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /regular \/ compact 分档里凡是仍会显示奖励的路径，也会复用同一奖励短句 helper，避免与 ultra-compact 回退链出现文案漂移/,
        'README should document that regular and compact reward-bearing summaries reuse the same short-label helper'
    );
    assert.match(
        source,
        /共享 challenge 标签与显式奖励短句 helper 也会压缩异常半角 \/ 全角空白，并把 `\+ 9999金` \/ `\+ 净化` 与 `＋ 9999金` \/ `＋ 净化` 这类 additive token 空白 \/ full-width plus 规整成 `\+9999金 \+净化`，避免正文间距或复合奖励文案因脏输入而提前挤爆各分档宽度预算/,
        'README should document the shared whitespace normalization for challenge labels and explicit reward labels'
    );
    assert.match(
        source,
        /若侧栏总高度仍超出安全范围，则会优先隐藏事件房摘要，其次再隐藏本局词缀正文，最后才隐藏本局挑战摘要/,
        'README should document the final overflow-priority hiding order for the fixed sidebar'
    );
    assert.match(
        source,
        /这些 compact \/ ultra-compact \/ ultra-tight 分档现在会按实际显示尺寸触发，而不再只依赖固定逻辑画布尺寸/,
        'README should document that the tighter sidebar tiers are now driven by actual display size'
    );
    assert.match(
        source,
        /若该挑战摘要与本局词缀正文都因溢出被隐藏，则会在挑战起步后把 `进12\/30` \/ `完成` 这类更轻量的进度徽记挂到“本局词缀”标题后；若标题预算进一步吃紧，则进行中态还会继续压成 `12\/30`；若进入 ultra-tight 更紧预算，则会再回退为 `进12` 这类无省略最终短句；若连进行中态的 `进12` 都放不下，则也会静默隐藏 badge，把同一行预算完全还给标题/,
        'README should document the full in-progress challenge badge fallback chain through the final ultra-tight silent-hide state'
    );
    assert.match(
        source,
        /完成态还会先从 `完成\+90金` 这类奖励短句回退为 `完成`；若连完成态的 `完成` 都放不下，则会静默隐藏 badge，把同一行预算完全还给标题/,
        'README should document the full completed-badge reward-to-complete-to-silent fallback chain'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则隐藏后的轻量挑战徽记也会继续沿用 `进12\/30 -> 12\/30 -> 进12 -> 静默隐藏` \/ `完成 -> 静默隐藏` 这组 no-reward 回退链，不补 `\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the rewardless hidden challenge-badge fallback ladders without placeholder reward copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，隐藏后的轻量挑战徽记也仍会继续沿用 `进12\/30 -> 12\/30 -> 进12 -> 静默隐藏` \/ `完成 -> 静默隐藏` 这组 no-reward 回退链，不额外插入 `未知挑战` \/ `\+0金` \/ `奖励:未知` 这类中间占位/,
        'README should document that rewardless hidden challenge badges stay on the same fallback ladder even when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用 `完成\+90金 -> 完成 -> 静默隐藏` 这组回退链，不额外插入 `未知挑战` 这类中间短句/,
        'README should document that reward-bearing hidden completed challenge badges stay on the same fallback ladder even when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用 `完成\+90金 -> 完成 -> 静默隐藏` 这组 completed-state 回退链，不额外插入 `未知挑战` 这类中间短句/,
        'README should document the invalid-target hidden completed-badge reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的 `target` 压成 0 或更低，且当前 challenge 没有奖励短句，则隐藏后的轻量 completed challenge badge 也会继续沿用 `完成 -> 静默隐藏` 这组 no-reward 回退链，不补 `\+0金` \/ `奖励:未知` 这类占位/,
        'README should document the invalid-target hidden completed-badge no-reward fallback without placeholder reward copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成 `未知挑战`，若隐藏后的轻量 completed challenge badge 奖励短句未来扩展到 `\+9999金 \+净化` 这类显式复合形式，也会继续沿用 `完成\+9999金 \+净化 -> 完成 -> 静默隐藏` 同一语义回退链，不额外插入 `未知挑战` 这类中间短句/,
        'README should document the unknown-label hidden completed-badge compound-reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /该轻量徽记会拆成独立弱化色阶，并进一步下调字级与透明度后再与“本局词缀”标题分开贴边；若标题预算继续压窄，则会按更紧预算分档继续下调 badge 宽度占比、最小宽度与固定 gap，优先把更多横向空间留给标题正文/,
        'README should document the quieter typography plus the ultra-tight width-budget tier for the final ultra-compact challenge badge fallback'
    );
}

function testHelpOverlayQuickSlotLoop() {
    const source = loadGameSource();
    assert.match(
        source,
        /点击背包消耗品会自动装入快捷栏首个空位，并提示“快捷栏N：\+<短名>”/,
        'help overlay should explain the slot-led plus-marker shortform non-overwrite toast'
    );
    assert.match(
        source,
        /若临时拿不到显式短名则会沿用道具名生成“快捷栏N：\+生命”这类短句/,
        'help overlay should explain the name-derived fallback for the non-overwrite toast'
    );
    assert.match(
        source,
        /若道具名词干过长则会截成“快捷栏N：\+圣疗秘…”这类省略短句/,
        'help overlay should explain the ellipsis clamp for overlong non-overwrite fallback labels'
    );
    assert.match(
        source,
        /优先按 Phaser 文本实际宽度钳制[^。]*“快捷栏N：\+HP恢复”/,
        'help overlay should explain the Phaser-backed mixed-width fallback example'
    );
    assert.match(
        source,
        /若当前环境拿不到真实测量结果则回退为宽度权重估算/,
        'help overlay should explain the heuristic fallback when Phaser text measurement is unavailable'
    );
    assert.match(
        source,
        /快捷栏已满时会覆盖 1 号槽位，并提示“快捷栏1：<旧短名>→<新短名>”；若新旧短名相同则压缩为“快捷栏1：同类 <短名>”；若拿不到显式短名则改用“快捷栏1：狂战→净化”这类道具名短句/,
        'help overlay should explain the overwrite toast variants, including the name-derived fallback path'
    );
    assert.match(
        source,
        /若这些道具名过长则同样会截成“快捷栏1：古代狂…→神圣净…”这类省略短句/,
        'help overlay should explain the shared ellipsis clamp on overwrite fallback labels'
    );
    assert.match(
        source,
        /净化药剂\/狂战油在铁匠制作成功时也会直接装入快捷栏，并沿用同一套“快捷栏N：\+净化”\/“快捷栏1：狂战→净化”提示/,
        'help overlay should explain that crafted combat consumables also route straight into the quick bar with the shared notice contract'
    );
    assert.match(
        source,
        /制作行现在还会直接补“入1”\/“覆盖1：狂战→净化”这类快捷栏预告，让玩家在点前就知道会落在哪格、会不会顶掉现有补给/,
        'help overlay should explain the pre-click quick-slot landing preview on blacksmith recipe rows'
    );
    assert.match(
        source,
        /并额外补一条“净化药剂x2 · 差15金”这类批量回执，直接交代本次做了几份、又是因金币还是材料耗尽才停下/,
        'help overlay should explain the compact batch receipt that reports produced count and stop reason'
    );
    assert.match(
        source,
        /若这条制作成功回执还要再拼上快捷栏落位提示，底部消息会先按实际宽度把“快捷栏1：狂战→净化”收束成“覆盖1：狂战→净化”\/“入1”这类短后缀，并把“净化药剂x2 · 差15金”这类做了几份\/为何停下信息留在前面/,
        'help overlay should explain that narrow craft success toasts collapse the quick-slot suffix before they sacrifice the batch receipt'
    );
    assert.match(
        source,
        /若制作失败提示碰上长材料名或后续 richer error copy，底部消息也会先按实际宽度把“材料不足: 懒惰之精华”收束成“材料不足: 懒惰”\/“材料不足”，把 blocker 留在前面/,
        'help overlay should explain that narrow craft failure toasts keep the blocker prefix before clamping long material detail'
    );
    assert.match(
        source,
        /若强化成功提示触发时，底部消息会优先读出“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4\/特攻-0.2s\/体耗-2 · 消耗2个暴怒之精华”这类带升级段位、收益与材料锚点的回执；若像“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5\/特攻-0.2s\/体耗-1 · 累计伤害\+9\/特攻-0.3s\/体耗-3 · 消耗2个暴怒之精华”这类末级升级累计总览也放得下，还会优先把整把武器的累计现况与本次花费一起钉在回执尾段；若中宽档位放不下完整累计总览，则会先保住“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5\/特攻-0.2s\/体耗-1 · 累计\+9\/特攻-0.3s · 消耗2个暴怒”或至少“强化成功! Lv\.2→Lv\.3 · 本次伤害\+5\/特攻-0.2s\/体耗-1 · 累计伤害\+9 · 消耗2个暴怒”这类累计\+消耗双锚点，再继续退回只保留累计首段的旧梯子；若行宽再继续吃紧，才会退回“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4\/特攻-0.2s\/体耗-2”、“强化成功! Lv\.1→Lv\.2 · 本次伤害\+4”或“强化成功! Lv\.1→Lv\.2”，优先把成功结论与升级段位留在前；材料不足路径也会先把“材料不足! 需要2个暴怒之精华”收束成“材料不足! 需要2个暴怒”\/“材料不足! 需要2个”，把 blocker 留在前面/,
        'help overlay should explain that later-upgrade success toasts now preserve compact cumulative-plus-spend anchors before they fall back to the older level/payoff ladder'
    );
    assert.match(
        source,
        /若窄窗口下“\[强化\] 250金\+2暴怒之精华”这类强化按钮过长，按钮文案也会先按实际宽度把精华名收束成“\[强化\] 250金\+2暴怒”\/“\[强化\] 250金\+2个”，并把“\[强化\]”与金币\/材料成本留在前，避免长精华名继续挤窄按钮可读区/,
        'help overlay should explain that narrow upgrade buttons keep the action plus gold/material cost before clamping long essence names'
    );
    assert.match(
        source,
        /铁匠强化行现在也会在点按钮前直接显示“可强化\/差50金\/差2个暴怒之精华”这类短标签，blocked 时“\[强化\]”会同步降色停用，避免继续把 upgrade 决策留到失败提示才揭晓/,
        'help overlay should explain that upgrade rows expose the shared pre-click affordability labels and disable blocked buttons'
    );
    assert.match(
        source,
        /Lv\.3 武器右侧动作位不再留空，会直接显示“已满级”\/“满阶”这类短标签，并沿用同一宽度护栏，避免把空白误读成未解锁、渲染缺失或还能继续强化/,
        'help overlay should explain that max-level weapon rows keep a compact right-slot status label instead of a blank action lane'
    );
    assert.match(
        source,
        /铁匠强化行现在也会在点按钮前直接补上“本次伤害\+4\/特攻-0.2s\/体耗-2”这类短收益摘要；若武器已升过但还没满级，强化行还会优先补“累计\+下次 · 累计伤害\+4\/本次伤害\+5”这类双层短摘要，让玩家在同一行同时读到已购成长与下一跳收益；若行宽再吃紧，会先收束成“累计\+4\/下次\+5”这类紧凑双层锚点，再继续退到“累计伤害\+4\/本次伤害\+5”、“累计伤害\+4”或“本次伤害\+5”，避免非满级阶段过早丢掉双层语义/,
        'help overlay should explain that non-max upgrade rows keep a compact cumulative-versus-next anchor before they fall back to unlabeled or single-layer summaries'
    );
    assert.match(
        source,
        /若武器已满级，强化行也不会退回只剩武器名，而会改为常驻显示“已满级 · 累计伤害\+9\/特攻-0.3s\/体耗-3”这类累计已购收益；若行宽继续吃紧，会先收束成“满阶 · 累计伤害\+9”，避免满级后又读不出这把武器已经买到了哪些成长/,
        'help overlay should explain that max-level upgrade rows keep an owned-benefit echo visible after the final purchase'
    );
    assert.match(
        source,
        /若制作行显示“可做xN”，点击一次“\[制作\]”还会直接做到当前上限/,
        'help overlay should explain that the visible craftable count now cashes out as a one-click max batch'
    );
    assert.match(
        source,
        /若已选“复苏祷言”，闪避行会常驻显示“复苏\+35%”，真正因自然回体转好时还会短促切成“复苏就绪”[\s\S]*?若已选“迅击祷言”，特攻行会常驻显示“迅击-22%”，真正转好时还会短促切成“迅击就绪”/,
        'help overlay should explain the prayer-shrine identity label and payoff-ready cue'
    );
    assert.match(
        source,
        /资源与结算路线现在也会把第三房继续钉成更具体的战术短句：“复苏祷言 \/ 迅击祷言 \/ 豪赌 \/ 稳押 \/ 战地净化包 \/ 狂战补给”会分别补“复苏回拍 \/ 迅击抢拍 \/ 豪赌追赏 \/ 稳押收赏 \/ 净包稳场 \/ 狂油抢势”；若“稳押”本身是因为“当前更宜稳押”才成立，还会继续升级成“留本追赏”/,
        'help overlay should explain the resource-route anchor ladder and the narrower safer-gamble recommendation override'
    );
    assert.match(
        source,
        /若“迅击祷言”本身就是因为“当前局已偏节奏”才被推荐，还会继续把 routed “高压战”压成“顺势抢压”；若“战地净化包”是因为“当前可负担”才成立，也会把 routed “缓冲战”继续压成“趁价备净”/,
        'help overlay should explain the newly added tempo-bias and affordability why-now echoes for resource routes'
    );
    assert.match(
        source,
        /choice panel \/ 侧栏事件房摘要 \/ 已触发后的祭坛世界标签现在还会继续补“首拍兑现 \/ 稳场兑现 \/ 追赏兑现”这类极短时机签/,
        'help overlay should explain the new routed payoff-timing labels across the choice panel, sidebar summary, and resolved shrine label'
    );
    assert.match(
        source,
        /若已选“连斩修习”，普攻行会常驻显示“连斩-18%”，而当减 CD 真正把“普攻 U”从“冷却”或翻滚后的冷却预告推回“就绪”时，还会短促切成“连斩就绪”/,
        'help overlay should explain the combat-discipline attack-ready payoff cue alongside the persistent route label'
    );
    assert.match(
        source,
        /当更短普攻 CD 真正压出更快的下一次普攻命中时，命中处还会补一个短促的“连斩”浮字与轻 hit pulse/,
        'help overlay should explain the combat-discipline hit-payoff cue when the shorter cooldown cashes out into a faster hit'
    );
    assert.match(
        source,
        /若已选“游步修习”，闪避行会常驻显示“游步-20%\/-18%”，而当减 CD \/ 减耗真正把翻滚从“冷却”、“差体”或翻滚后的下一状态推回“就绪”时，还会短促切成“游步就绪”/,
        'help overlay should explain the combat-discipline dodge-ready payoff cue alongside the persistent route label'
    );
    assert.match(
        source,
        /若已选“复苏祷言”，闪避行会常驻显示“复苏\+35%”，真正因自然回体转好时还会短促切成“复苏就绪”，并让体力条也同步短促抬亮一下/,
        'help overlay should explain that the prayer dodge-ready threshold also briefly brightens the stamina bar'
    );
    assert.match(
        source,
        /若已选“游步修习”，闪避行会常驻显示“游步-20%\/-18%”，而当减 CD \/ 减耗真正把翻滚从“冷却”、“差体”或翻滚后的下一状态推回“就绪”时，还会短促切成“游步就绪”；当减耗真正把“闪避 Space”从“差体”或翻滚后预告推回“就绪”时，体力条也会同步短促抬亮一下/,
        'help overlay should explain that the combat-discipline dodge-cost threshold also briefly brightens the stamina bar'
    );
    assert.match(
        source,
        /若已选“追猎修习”，普攻行会先显示“追猎待闪”，翻滚收招后改成“追猎1\.4s”这类剩余窗口提示，真正把这段窗口兑现成强化普攻命中时，还会补一个更亮的“追猎斩”浮字与 hit pulse；若已选“调息修习”，特攻行会常驻显示“调息\+6”，且只有在特攻命中后真的回到体力时，体力条才会同步短促抬亮并脉冲一下/,
        'help overlay should explain the counterattack-shrine attack-followup window and special-hit stamina payoff cues'
    );
    assert.match(
        source,
        /若已选“绝境修习”，普攻行会在生命高于 45% 时显示“绝境<45%”，压进阈值后改成“绝境\+40%”，真正带着这段低血爆发命中时还会补一个“绝境”浮字；若已选“守心修习”，闪避行会在生命高于 70% 时显示“守心-18%”，跌出阈值后改成“守心>70%”，而当这段高血减伤真实挡下一击时，玩家身旁还会补一个“守心”提示/,
        'help overlay should explain the risk/reward shrine threshold states and both trigger-side payoff cues'
    );
    assert.match(
        source,
        /背包悬停说明也会按实际文本宽度贴边，因此靠近屏幕右缘时不会继续沿用固定 200px 估算/,
        'help overlay should document the width-aware inventory tooltip placement'
    );
    assert.match(
        source,
        /事件房祭坛靠近提示也会按 Phaser 文本实际宽度贴在当前视口内，因此贴近屏幕边缘时不会被裁出画面/,
        'help overlay should document viewport-safe measured event-room prompts'
    );
    assert.match(
        source,
        /右侧固定侧栏里的章节标题、区域名、本局词缀、本局挑战与事件房摘要会优先按 Phaser 文本实际宽度钳制，并按实际文本高度动态纵向排布/,
        'help overlay should document measured fitting and vertical stacking for the fixed right sidebar'
    );
    assert.match(
        source,
        /若视口进入 compact 档位，则本局词缀与事件房摘要会额外收敛为有限行数，并在最后一行补省略号/,
        'help overlay should document the compact-tier line-cap and ellipsis policy for long sidebar blocks'
    );
    assert.match(
        source,
        /regular 三行挑战摘要的正文行若遇到上游已带“本局挑战：”\/“挑战：”前缀的标签，也会先去重，避免与标题行重复同一前缀/,
        'help overlay should document that regular three-line challenge summaries dedupe upstream challenge prefixes before rendering the body line'
    );
    assert.match(
        source,
        /若上游标签重复混入“本局”\/“挑战：”这类 plain-text 前缀，会继续循环去重直到收敛成真正目标；各类 decorator wrapper（如“【本局挑战】”\/“\[挑战\]”[\s\S]*?“〔挑战〕”\/“〖本局挑战〗”，以及“【「挑战」】”\/“《〔本局挑战〕》”[\s\S]*?“【〖挑战〗】”\/“〖［本局挑战］〗”[\s\S]*?“【'挑战'】”\/“'［本局挑战］'”这类 nested mixed）也会先逐层剥离，再继续做同一轮“本局”\/“挑战”去重/u,
        'help overlay should document grouped challenge decorator cleanup families before repeated plain-text prefix dedupe'
    );
    assert.match(
        source,
        /“［挑战］”\/“［本局挑战］”/,
        'help overlay should document full-width square-bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“\(挑战\)”\/“（本局挑战）”/,
        'help overlay should document round-parenthesis challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“【（挑战）】”\/“（［本局挑战］）”/,
        'help overlay should explicitly document nested square and parenthesis mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【｛挑战｝】”\/“｛［本局挑战］｝”/,
        'help overlay should explicitly document nested square and curly mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【＜挑战＞】”\/“＜［本局挑战］＞”/,
        'help overlay should explicitly document nested square and angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【《挑战》】”\/“〈［本局挑战］〉”/,
        'help overlay should explicitly document nested square and book-title mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〈挑战〉］”\/“〈［本局挑战］〉”/,
        'help overlay should explicitly document nested full-width square and corner-angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈［挑战］〉”\/“［〈本局挑战〉］”/,
        'help overlay should explicitly document nested corner-angle and full-width square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈\[挑战\]〉”\/“\[〈本局挑战〉\]”/,
        'help overlay should explicitly document nested corner-angle and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈【挑战】〉”\/“【〈本局挑战〉】”/,
        'help overlay should explicitly document nested corner-angle and square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〘挑战〙〉”\/“〘〈本局挑战〉〙”/,
        'help overlay should explicitly document nested corner-angle and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〚挑战〛〉”\/“〚〈本局挑战〉〛”/,
        'help overlay should explicitly document nested corner-angle and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〔挑战〕〉”\/“〔〈本局挑战〉〕”/,
        'help overlay should explicitly document nested corner-angle and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〖挑战〗〉”\/“〖〈本局挑战〉〗”/,
        'help overlay should explicitly document nested corner-angle and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈“挑战”〉”\/““〈本局挑战〉””/,
        'help overlay should explicitly document nested corner-angle and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈‘挑战’〉”\/“‘〈本局挑战〉’”/,
        'help overlay should explicitly document nested corner-angle and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈"挑战"〉”\/“"〈本局挑战〉"”/,
        'help overlay should explicitly document nested corner-angle and ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈'挑战'〉”\/“'〈本局挑战〉'”/,
        'help overlay should explicitly document nested corner-angle and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈｢挑战｣〉”\/“｢〈本局挑战〉｣”/,
        'help overlay should explicitly document nested corner-angle and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈﹁挑战﹂〉”\/“﹃〈本局挑战〉﹄”/,
        'help overlay should explicitly document nested corner-angle and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〝挑战〞〉”\/“〝〈本局挑战〉〞”/,
        'help overlay should explicitly document nested corner-angle and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〝挑战〟〉”\/“〝〈本局挑战〉〟”/,
        'help overlay should explicitly document nested corner-angle and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〈〈挑战〉〉”\/“［［本局挑战］］”/,
        'help overlay should explicitly document repeated same-family bracket stacks alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“""挑战""”\/“''本局挑战''”/,
        'help overlay should explicitly document repeated same-family symmetric quote stacks alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“〝〝挑战〞〟”\/“〝〝本局挑战〟〟”/,
        'help overlay should explicitly document same-open ornamental quote stacks that close in double-prime then low-double-prime order alongside the existing repeated stack examples'
    );
    assert.match(
        source,
        /“〝〝挑战〟〞”\/“〝〝本局挑战〟〞”/,
        'help overlay should explicitly document same-open ornamental quote stacks that close in low-double-prime then double-prime order alongside the existing repeated stack examples'
    );
    assert.match(
        source,
        /“\[〈挑战〉\]”\/“〈\[本局挑战\]〉”/,
        'help overlay should explicitly document nested ASCII square and corner-angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【『挑战』】”\/“『［本局挑战］』”/,
        'help overlay should explicitly document nested square and corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【｢挑战｣】”\/“｢［本局挑战］｣”/,
        'help overlay should explicitly document nested square and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【﹁挑战﹂】”\/“﹃［本局挑战］﹄”/,
        'help overlay should explicitly document nested square and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〝挑战〞】”\/“〝［本局挑战］〞”/,
        'help overlay should explicitly document nested square and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〝挑战〟】”\/“〝［本局挑战］〟”/,
        'help overlay should explicitly document nested square and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〘挑战〙】”\/“〘［本局挑战］〙”/,
        'help overlay should explicitly document nested square and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〚挑战〛】”\/“〚［本局挑战］〛”/,
        'help overlay should explicitly document nested square and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〔挑战〕】”\/“〔［本局挑战］〕”/,
        'help overlay should explicitly document nested square and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【〖挑战〗】”\/“〖［本局挑战］〗”/,
        'help overlay should explicitly document nested square and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【“挑战”】”\/““［本局挑战］””/,
        'help overlay should explicitly document nested square and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【‘挑战’】”\/“‘［本局挑战］’”/,
        'help overlay should explicitly document nested square and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【'挑战'】”\/“'［本局挑战］'”/,
        'help overlay should explicitly document nested square and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【［挑战］】”\/“［【本局挑战】］”/,
        'help overlay should explicitly document nested square and full-width square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【\[挑战\]】”\/“\[【本局挑战】\]”/,
        'help overlay should explicitly document nested square and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［【挑战】］”\/“【［本局挑战］】”/,
        'help overlay should explicitly document nested full-width square and square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［\[挑战\]］”\/“\[［本局挑战］\]”/,
        'help overlay should explicitly document nested full-width square and ASCII square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［｛挑战｝］”\/“｛［本局挑战］｝”/,
        'help overlay should explicitly document nested full-width square and full-width curly mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［（挑战）］”\/“（［本局挑战］）”/,
        'help overlay should explicitly document nested full-width square and parenthesis mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［＜挑战＞］”\/“＜［本局挑战］＞”/,
        'help overlay should explicitly document nested full-width square and angle mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［《挑战》］”\/“《［本局挑战］》”/,
        'help overlay should explicitly document nested full-width square and book-title mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［「挑战」］”\/“「［本局挑战］」”/,
        'help overlay should explicitly document nested full-width square and corner-bracket mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［"挑战"］”\/“"［本局挑战］"”/,
        'help overlay should explicitly document nested full-width square and ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〘挑战〙］”\/“〘［本局挑战］〙”/,
        'help overlay should explicitly document nested full-width square and white tortoise-shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［﹁挑战﹂］”\/“﹃［本局挑战］﹄”/,
        'help overlay should explicitly document nested full-width square and presentation-form mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〚挑战〛］”\/“〚［本局挑战］〛”/,
        'help overlay should explicitly document nested full-width square and white square mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〔挑战〕］”\/“〔［本局挑战］〕”/,
        'help overlay should explicitly document nested full-width square and shell mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〖挑战〗］”\/“〖［本局挑战］〗”/,
        'help overlay should explicitly document nested full-width square and lenticular mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［“挑战”］”\/““［本局挑战］””/,
        'help overlay should explicitly document nested full-width square and curly double-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［『挑战』］”\/“『［本局挑战］』”/,
        'help overlay should explicitly document nested full-width square and corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［｢挑战｣］”\/“｢［本局挑战］｣”/,
        'help overlay should explicitly document nested full-width square and half-width corner-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〝挑战〞］”\/“〝［本局挑战］〞”/,
        'help overlay should explicitly document nested full-width square and ornamental double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［〝挑战〟］”\/“〝［本局挑战］〟”/,
        'help overlay should explicitly document nested full-width square and ornamental low double-prime mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［‘挑战’］”\/“‘［本局挑战］’”/,
        'help overlay should explicitly document nested full-width square and curly single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“［'挑战'］”\/“'［本局挑战］'”/,
        'help overlay should explicitly document nested full-width square and ASCII single-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“【"挑战"】”\/“《\\?'本局挑战\\?'》”/,
        'help overlay should explicitly document nested ASCII straight-quote mixed challenge decorators alongside the existing nested mixed examples'
    );
    assert.match(
        source,
        /“"挑战"”\/“\\'本局挑战\\'”/,
        'help overlay should document ASCII straight-quote challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“｢挑战｣”\/“｢本局挑战｣”/,
        'help overlay should document half-width corner-quote challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“﹁挑战﹂”\/“﹃本局挑战﹄”/,
        'help overlay should document presentation-form quote decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“〝挑战〞”\/“〝本局挑战〞”/,
        'help overlay should document ornamental double-prime quote decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“〝挑战〟”\/“〝本局挑战〟”/,
        'help overlay should document ornamental low double-prime quote decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“〘挑战〙”\/“〘本局挑战〙”/,
        'help overlay should document white tortoise-shell bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /“〚挑战〛”\/“〚本局挑战〛”/,
        'help overlay should document white square bracket challenge decorators alongside the existing wrapper families'
    );
    assert.match(
        source,
        /wrapper 内部的 separator 家族现在按分组统一做 token 规范化：leading \/ orphan separators（如“：挑战”\/“-本局挑战”\/standalone “：”\/“-”(?:，以及“【：】”\/“《-》”这类 separator-only payload)?）、full-width pipe \/ slash（“｜”\/“／”）、ASCII pipe \/ slash \/ backslash（“\|”\/“\/”\/“\\\\\\\\”）、middle-dot \/ bullet（“·”\/“•”）、comma \/ semicolon \/ sentence punctuation（“、”\/“，”\/“；”\/“。”\/“!”\/“\?”\/“！”\/“？”）、tilde \/ ellipsis（“~”\/“～”\/“…”\/“⋯”）、dash（“—”\/“–”）；这些脏分隔符都会先被清掉，再继续做同一轮“本局”\/“挑战”去重；若去重后已无剩余正文，则 regular \/ compact 摘要统一回退为“未知挑战”/,
        'help overlay should document grouped wrapper-internal separator cleanup families and the shared 未知挑战 fallback'
    );
    assert.match(
        source,
        /“【：】”\/“《-》”这类 separator-only payload/,
        'help overlay should document separator-only wrapper payload cleanup inside the grouped separator family guidance'
    );
    assert.match(
        source,
        /当 regular 第三行宽度预算继续吃紧时，进行中与完成态也会先沿用“进度:12\/30  奖励:\+90金 -> 进度:12\/30 -> 12\/30”\/“进度:30\/30  奖励:\+90金 -> 进度:30\/30 -> 30\/30”这条语义回退链，而不是直接退化成通用省略/,
        'help overlay should document the regular third-line semantic fallback chain for both in-progress and completed challenge summaries'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“进度:12\/30 -> 12\/30”\/“进度:30\/30 -> 30\/30”这条 progress-only 回退梯子，不会伪造“奖励:\+0金”\/“奖励:未知”这类占位奖励；若 regular 第三行的奖励短句未来扩展到“\+9999金 \+净化”这类复合形式，进行中 \/ 完成态也都会继续沿用同一条进度优先回退链/,
        'help overlay should document the rewardless regular third-line fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /共享 challenge 标签与显式奖励短句 helper 也会压缩异常半角 \/ 全角空白，并把“\+ 9999金”\/“\+ 净化”与“＋ 9999金”\/“＋ 净化”这类 additive token 空白 \/ full-width plus 规整成“\+9999金 \+净化”/,
        'help overlay should document full-width plus normalization inside explicit reward short labels'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为“未知挑战”且当前 challenge 没有奖励短句，则 regular 三行摘要会继续保留“未知挑战”正文，并沿用“进度:12\/30 -> 12\/30”\/“进度:30\/30 -> 30\/30”这条 no-reward progress-only 回退链/,
        'help overlay should document the unknown-label rewardless regular fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为“未知挑战”但当前 challenge 仍有奖励短句，则 regular 三行摘要会继续保留“未知挑战”正文，并沿用“进度:12\/30  奖励:\+90金”\/“进度:30\/30  奖励:\+90金”这条 reward-bearing 第三行语义，不额外插入新的中间短句/,
        'help overlay should document the unknown-label reward-bearing regular fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若 Boss 的“反制窗口”起点实际晚于 telegraph 进度条开头，条内还会补一枚“起跳刻度”，避免把整段条体误读成从第一帧起就能反制/,
        'help overlay should document the telegraph start marker for delayed counter-window entry'
    );
    assert.match(
        source,
        /事件房导向的第三房路线现在不只会在 shrine 结算时预告“下间缓冲”\/“下间高压”\/“下间淘金”，进房时补“缓冲战 · 双拍缓冲”\/“高压战 · 三向成压”\/“淘金战 · 后排赏金”，还会在真正清场时再补“缓冲战 · 稳住出清”\/“高压战 · 顶住成压”\/“淘金战 · 赏金到手”这类短回顾/,
        'help overlay should document that routed room-3 identity now closes with a clear-time recap, not only a selection-time preview and entry cue'
    );
    assert.match(
        source,
        /当清场浮字淡出后，Boss 门标签也会继续保留“缓冲路线 · 稳线迎战”\/“高压路线 · 顶压迎战”\/“淘金路线 · 带赏迎战”这类 run-arc 回顾，让这段路线怎样改写了整段推进节奏不会在进 Boss 前立刻断掉/,
        'help overlay should document the persistent Boss-door run-arc recap that keeps the routed segment readable into the boss handoff'
    );
    assert.match(
        source,
        /真正踏进 Boss 房后的第一拍，还会再补一次“缓冲路线 · 稳线开局”\/“高压路线 · 抢势开局”\/“淘金路线 · 带赏开局”这类共享 opener，把这段 route identity 真正接进 Boss 开局/,
        'help overlay should document the one-shot Boss-opening route echo that carries route identity into the boss opener'
    );
    assert.match(
        source,
        /Hub 里的“上轮战报 \+ 选门参考”既然已经稳定覆盖上轮收官与当前门前姿态，后续 prep surface 也已交给“备战参考”\/“采购参考”\/“备战复查”各自承接，真正踏进关卡后的第一秒还会再补一次“目标 傲慢 · 稳线读招”\/“目标 暴怒 · 回体扛压”\/“目标 色欲 · 稳拍反制”这类一次性开局提示/,
        'help overlay should document the one-shot run-start target cue that keeps portal posture alive after the scene transition'
    );
    assert.match(
        source,
        /若开局 seed 会先把玩家落进首段普通战斗，首个房间刚被敌群唤醒时也会再补一次“首战 稳拍反制”\/“首战 回体扛压”这类短 cue，把目标姿态保到第一次开压[\s\S]*?这条首战 cue 也会更快收束/,
        'help overlay should document the one-shot first-combat cue that keeps the boss target alive before the first shrine'
    );
    assert.match(
        source,
        /若首段普通战斗已经清场，但首个未结算 shrine 还没贴近，穿过首段 corridor 时也会再补一次“承接 稳拍反制”\/“承接 回体扛压”这类短 cue，把目标姿态继续保到第一次路线抉择前[\s\S]*?目前这段 early-run handoff 已稳定形成“首战开压 \+ corridor handoff \+ shrine 靠近”的三段接力，并已收束为当前早段 baseline，不再额外新增首段清场 cue/,
        'help overlay should document the one-shot corridor bridge cue that carries the boss target through the quiet gap before shrine proximity'
    );
    assert.match(
        source,
        /当玩家真正贴近首个未结算事件房时，靠近提示\/世界标签也会继续补“按F祈愿 · 稳拍反制”\/“祈愿圣坛 · 稳拍反制”这类更紧的短 reminder，把同一条 Boss posture 以统一前缀映射 contract 接到第一次路线抉择前/,
        'help overlay should document the first-shrine posture reminder that keeps the boss target alive into the first route decision'
    );
    assert.match(
        source,
        /若已存储的 recommendation reason 仍和 routed encounter 强相关，入口\/清场短句还会继续补“缓冲战 · 双拍缓冲 · 净化后稳场”\/“高压战 · 三向成压 · 压线抢势”\/“淘金战 · 后排赏金 · 血线够追赏”这类更短 echo，命途圣坛的“绝境修习”\/“守心修习”也会一起接进“下间高压”\/“下间缓冲”/,
        'help overlay should document the new routed encounter echo and threshold-shrine routing extension'
    );
    assert.match(
        source,
        /武备圣坛的“压阵修习”\/“离弦修习”会分别导向“下间高压”\/“下间淘金”，烙痕圣坛的“余烬修习”\/“血痕修习”则会分别导向“下间缓冲”\/“下间高压”/,
        'help overlay should document the first build-facing shrine routes that now participate in routed encounter mapping'
    );
    assert.match(
        source,
        /其余行动型 blessing route 也会继续把第三房压成“缓冲\/高压\/淘金”，并在没有 recommendation receipt 时补“连斩抢拍”\/“游步整拍”\/“镇步控场”\/“破势追杀”\/“回息稳场”\/“借势重击”\/“催锋连段”\/“回身整拍”\/“追猎追赏”\/“调息回线”这类 baseline anchor/,
        'help overlay should document the baseline action-route anchors that now land even without a stored recommendation receipt'
    );
    assert.match(
        source,
        /当第三房真正开始兑现这条 recommendation 时，系统还会只在首个稳场节点\/首个高压接敌\/首个赏金兑现点再补一次“净化后稳场”\/“压线抢势”\/“血线够追赏”这类战中 source cue；若 recommendation 来自压阵\/离弦\/余烬\/血痕这些 build-facing 路线，还会对应补“贴身压阵”\/“远程追赏”\/“灼烧稳场”\/“挂血抢势”，把“为什么推荐这条”接到实际交手瞬间/,
        'help overlay should document the one-shot combat source cue that lands on the first routed room-3 beat'
    );
    assert.match(
        source,
        /即使没有 recommendation receipt，战技\/镇压\/战势\/连携\/反击这些行动型 blessing route 也会在同一拍点补“连斩抢拍”\/“游步整拍”\/“镇步控场”\/“破势追杀”\/“回息稳场”\/“借势重击”\/“催锋连段”\/“回身整拍”\/“追猎追赏”\/“调息回线”/,
        'help overlay should document that action-route baseline anchors reuse the same routed combat beats as recommendation cues'
    );
    assert.match(
        source,
        /若 recommendation 来自压阵\/离弦\/余烬\/血痕这些 build-facing 路线，还会对应补“贴身压阵”\/“远程追赏”\/“灼烧稳场”\/“挂血抢势”/,
        'help overlay should document the build-facing route recommendation cues that now land during room-3 combat'
    );
    assert.match(
        source,
        /事件房 choice panel 若出现明显上下文倾向，还会在底部脚注补“建议 1\/2：净泉啜饮 · 可净化2层”这类短推荐，但不会改动原有 1\/2 顺序；若玩家真的选了这条高置信路线，已触发后的 HUD \/ 祭坛世界标签 \/ 结算浮字也会继续补“治疗: 净泉啜饮 · 可净化2层”这类极短确认/,
        'help overlay should document that high-confidence event-room recommendations can persist into resolved confirmation surfaces after selection'
    );
    assert.match(
        source,
        /祈愿圣坛现在也会在明显节奏偏向时给出“建议 2：迅击祷言 · 当前局已偏节奏”这类脚注/,
        'help overlay should document the new tempo-bias recommendation footer for prayer shrine choices'
    );
    assert.match(
        source,
        /战技\/镇压\/战势\/连携\/反击这些行动型 blessing route 也会把 live combat state 接进同一套 recommendation helper，并在高置信场景下给出“建议 1\/2：连斩修习 · 普攻卡拍”\/“游步修习 · 闪避卡拍”\/“镇步修习 · 当前更宜控场”\/“借势修习 · 特攻待借势”\/“催锋修习 · 特攻待连段”\/“回身修习 · 闪避待回身”\/“追猎修习 · 可立即追猎”\/“调息修习 · 当前更缺回体”这类脚注/,
        'help overlay should document that action-route recommendations now use live combat bottlenecks before selection'
    );
    assert.match(
        source,
        /武备\/烙痕这些 build-facing route 也会在高置信场景下给出“建议 1\/2：压阵修习 · 近战更宜压线”\/“离弦修习 · 远程更宜追赏”\/“余烬修习 · 灼烧更宜稳场”\/“血痕修习 · 挂血更宜抢势”/,
        'help overlay should document that build-facing recommendations now use why-now context instead of static loadout fit alone'
    );
    assert.match(
        source,
        /命途\/烙痕这些 threshold\/status route 也会在较安静但高置信的场景下复用同一套 Boss posture：若当前血线还没压进“绝境\/守心”阈值，或 burn\/bleed loadout 也还没有强到足以单独解释当前 live state，choice panel 也会补“建议 1\/2：绝境修习 · 目标Boss更宜压线”\/“守心修习 · 目标Boss更宜回体”\/“余烬修习 · 目标Boss更宜控场”\/“血痕修习 · 目标Boss更宜压线”/,
        'help overlay should document the new threshold/status boss-posture recommendation ladder'
    );
    assert.match(
        source,
        /若这些 action recommendation 的 persisted reason 仍和 routed encounter 强相关，第三房还会继续把“普攻卡拍\/闪避卡拍\/当前可追终结\/特攻待借势\/特攻待连段\/可立即追猎”压成“抢拍开刃\/游步回拍\/破势收赏\/借势抢压\/连段催锋\/追猎收赏”这类更窄的 why-now echo/,
        'help overlay should document the narrower action-route why-now echoes that now continue into room-3 combat'
    );
    assert.match(
        source,
        /若 Boss 的“反制窗口”从第一帧开放、却会在 telegraph 进度条清空前提早收束，条内还会补一枚“收束刻度”，避免把剩余条体误读成还在可反制/,
        'help overlay should document the telegraph closure marker for frame-one counter windows that end before the bar does'
    );
    assert.match(
        source,
        /“收束刻度”右侧剩余条体也会压成更暗的“尾段残影”，提醒那一截只剩读招倒计时，不再代表可反制窗口/,
        'help overlay should document the dimmed tail afterglow after an early-closing frame-one counter window'
    );
    assert.match(
        source,
        /一旦倒计时已经走进这段“尾段残影”，第二行“反制窗口”也会同步切成更低饱和的“已收束提示”[\s\S]*?避免窗口已过后仍把旧提示读成“现在还能反制”/,
        'help overlay should document that the counter-window row flips to a subdued settled label once the live telegraph is already inside the tail-afterglow segment'
    );
    assert.match(
        source,
        /第三行 hint 则会把原本的“反制:”\/“反制提示:”前缀改写成更明确的“收束后处理:”或“闪避提示:”/,
        'help overlay should document that the telegraph hint switches from counter phrasing to post-window guidance once the live telegraph is already inside the tail-afterglow segment'
    );
    assert.match(
        source,
        /第三行 hint 则会把原本的“反制:”\/“反制提示:”前缀改写成更明确的“收束后处理:”或“闪避提示:”，并同步降成更柔和的琥珀色/,
        'help overlay should document that rewritten tail-phase hint copy also shifts to a softer amber once the live telegraph is already inside the tail-afterglow segment'
    );
    assert.match(
        source,
        /若第二、三行都已切进收束态，第一行“类型 \| 攻击名”也会同步压成更低饱和的暖灰白/,
        'help overlay should document that the telegraph title row also dims once the live telegraph has already entered the settled tail phase'
    );
    assert.match(
        source,
        /若第一、二、三行都已切进收束态，进度条左侧仍存活的主色填充也会同步降一档 alpha/,
        'help overlay should document that the surviving telegraph fill also dims once every warning row has settled into the tail-afterglow state'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且主色填充已同步降档 alpha，还会在进度头部补一枚更细的暖色“当前倒计时头标”/,
        'help overlay should document the dedicated live countdown head marker for the dimmed tail-afterglow phase'
    );
    assert.match(
        source,
        /若 Boss telegraph 刚从可反制主拍切进“尾段残影”且新的“当前倒计时头标”首次出现，头标还会追加约 120ms 的短促暖闪/,
        'help overlay should document the short warm flash that fires when the live countdown head marker first appears at the tail-afterglow transition'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerLateGlowVisible/,
        'boss telegraph rendering should consume the late head-marker glow flag from the shared summary'
    );
    assert.match(
        source,
        /countdownHeadFlashRemainingMs\s*<=\s*0[\s\S]*currentCountdownHeadMarkerLateGlowVisible/,
        'boss telegraph rendering should only draw the weaker late head-marker glow after the short warm flash has already finished'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerLateGlowInnerWidthTrimmed/,
        'boss telegraph rendering should consume the residual inner late-glow width-trim flag from the shared summary'
    );
    assert.match(
        source,
        /lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed\s*\?\s*countdownHeadMarkerX - 4\s*:\s*countdownHeadMarkerX - 5;[\s\S]*?lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 3\s*:\s*lateGlowOuterX;[\s\S]*?lateGlowOuterWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed\s*\?\s*6\s*:\s*telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed\s*\?\s*8\s*:\s*10;/,
        'boss telegraph rendering should contract the residual outer late glow around the endpoint during the final trim beat'
    );
    assert.match(
        source,
        /const lateGlowInnerX = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerWidthTrimmed\s*\?\s*countdownHeadMarkerX - 1\s*:\s*telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed\s*\?\s*countdownHeadMarkerX - 2\s*:\s*countdownHeadMarkerX - 3;[\s\S]*?const lateGlowInnerWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerWidthTrimmed\s*\?\s*2\s*:\s*telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed\s*\?\s*4\s*:\s*6;/,
        'boss telegraph rendering should also narrow the residual inner late glow during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowOuterAlpha = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterAlphaMuted\s*\?\s*0\.03\s*:\s*telegraphHud\.currentCountdownHeadMarkerLateGlowContained \? 0\.05 : 0\.08;[\s\S]*?const lateGlowOuterColor = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterWarmthMuted \? 0xF2E7D6 : 0xFFE7AE;[\s\S]*?lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowContained \? Math\.max\(telegraphRect\.x \+ 1,\s*lateGlowOuterX\) : lateGlowOuterX;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillStyle\(lateGlowOuterColor,\s*lateGlowOuterAlpha\);/,
        'boss telegraph rendering should lower and contain the weaker late head-marker outer glow during the final 40ms tail beat'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerInnerCoreFocused[\s\S]*?fillStyle\((?:0xFFF2C8|countdownHeadInnerCoreColor),\s*(?:1|countdownHeadInnerCoreAlpha)\)[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 0\.25|countdownHeadInnerCoreX),\s*(?:telegraphRect\.y \+ 2|countdownHeadInnerCoreY),\s*(?:0\.5|countdownHeadInnerCoreWidth),\s*(?:telegraphRect\.h - 4|countdownHeadInnerCoreHeight),\s*(?:1|countdownHeadInnerCoreRadius)\s*\)/,
        'boss telegraph rendering should narrow and brighten the countdown-head inner core during the final tail-focus beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreEdgeSoftInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeSoftened \? 0\.25 : 0;[\s\S]*?const countdownHeadInnerCoreY = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.y \+ 3 \+ countdownHeadInnerCoreEdgeSoftInset\s*:\s*telegraphRect\.y \+ 2;[\s\S]*?const countdownHeadInnerCoreHeight = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.h - 6 - countdownHeadInnerCoreEdgeSoftInset \* 2\s*:\s*telegraphRect\.h - 4;[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 0\.25|countdownHeadInnerCoreX),\s*countdownHeadInnerCoreY,\s*(?:0\.5|countdownHeadInnerCoreWidth),\s*countdownHeadInnerCoreHeight,\s*(?:1|countdownHeadInnerCoreRadius)\s*\)/,
        'boss telegraph rendering should shorten the countdown-head inner core height during the final 20ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellEdgeSoftInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeSoftened \? 0\.25 : 0;[\s\S]*?const countdownHeadShellY = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.y \+ 2 \+ countdownHeadShellEdgeSoftInset\s*:\s*telegraphRect\.y \+ 1;[\s\S]*?const countdownHeadShellHeight = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.h - 4 - countdownHeadShellEdgeSoftInset \* 2\s*:\s*telegraphRect\.h - 2;[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 1|countdownHeadShellX),\s*countdownHeadShellY,\s*(?:2|countdownHeadShellWidth),\s*countdownHeadShellHeight,\s*(?:1|countdownHeadShellRadius)\s*\)/,
        'boss telegraph rendering should shorten the countdown-head shell caps during the final 10ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.74 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.7 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.72 : telegraphHud\.currentCountdownHeadMarkerShellAlphaMuted\s*\?\s*0\.76\s*:\s*0\.94;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\((?:0xFFE7AE|countdownHeadShellColor),\s*countdownHeadShellAlpha\);/,
        'boss telegraph rendering should lower the countdown-head shell alpha during the final 5ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.74 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.7 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.72 : telegraphHud\.currentCountdownHeadMarkerShellAlphaMuted\s*\?\s*0\.76\s*:\s*0\.94;[\s\S]*?const countdownHeadShellColor = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0xF0E9E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced \? 0xEDE8E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced \? 0xF3E8DC : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0xF4E6CC : telegraphHud\.currentCountdownHeadMarkerShellCoreSaturationMuted \? 0xEEE7DC : telegraphHud\.currentCountdownHeadMarkerShellCoreWarmthMuted \? 0xF2E5D2 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0xF8E0AE : 0xFFE7AE;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\(countdownHeadShellColor,\s*countdownHeadShellAlpha\);/,
        'boss telegraph rendering should also converge the countdown-head shell brightness during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadShellColor = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0xF0E9E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced \? 0xEDE8E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced \? 0xF3E8DC : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0xF4E6CC : telegraphHud\.currentCountdownHeadMarkerShellCoreSaturationMuted \? 0xEEE7DC : telegraphHud\.currentCountdownHeadMarkerShellCoreWarmthMuted \? 0xF2E5D2 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0xF8E0AE : 0xFFE7AE;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\(countdownHeadShellColor,\s*countdownHeadShellAlpha\);/,
        'boss telegraph rendering should also cool the countdown-head shell color temperature during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.84 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerInnerCoreAlphaMuted\s*\?\s*0\.82\s*:\s*1;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\((?:0xFFF2C8|countdownHeadInnerCoreColor),\s*countdownHeadInnerCoreAlpha\);/,
        'boss telegraph rendering should lower the countdown-head inner core alpha during the final 2ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.84 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerInnerCoreAlphaMuted\s*\?\s*0\.82\s*:\s*1;[\s\S]*?const countdownHeadInnerCoreColor = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0xF2ECE4 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced \? 0xF2EEE6 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced \? 0xF6EDE3 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0xF9ECCB : telegraphHud\.currentCountdownHeadMarkerShellCoreSaturationMuted \? 0xF4EEE4 : telegraphHud\.currentCountdownHeadMarkerShellCoreWarmthMuted \? 0xF4E7D7 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0xFBE8B9 : 0xFFF2C8;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\(countdownHeadInnerCoreColor,\s*countdownHeadInnerCoreAlpha\);/,
        'boss telegraph rendering should also converge the countdown-head inner-core brightness during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreWarmthMuted/,
        'boss telegraph rendering should consume the countdown-head shell/core color-temperature trim flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreSaturationMuted/,
        'boss telegraph rendering should consume the countdown-head shell/core saturation-trim flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeSoftened/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-soften flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight flatten flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight brightness-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight warmth-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight saturation-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight feather-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight alpha-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight warm-vs-cool transparency-balance flag from the shared summary'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced/,
        'boss telegraph rendering should consume the countdown-head shell/core edge-highlight thickness-balance flag from the shared summary'
    );
    assert.match(
        source,
        /const countdownHeadShellColor = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0xF0E9E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced \? 0xEDE8E0 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced \? 0xF3E8DC : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0xF4E6CC : telegraphHud\.currentCountdownHeadMarkerShellCoreSaturationMuted \? 0xEEE7DC : telegraphHud\.currentCountdownHeadMarkerShellCoreWarmthMuted \? 0xF2E5D2 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0xF8E0AE : 0xFFE7AE;[\s\S]*?const countdownHeadInnerCoreColor = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0xF2ECE4 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced \? 0xF2EEE6 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced \? 0xF6EDE3 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0xF9ECCB : telegraphHud\.currentCountdownHeadMarkerShellCoreSaturationMuted \? 0xF4EEE4 : telegraphHud\.currentCountdownHeadMarkerShellCoreWarmthMuted \? 0xF4E7D7 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0xFBE8B9 : 0xFFF2C8;/,
        'boss telegraph rendering should further neutralize the countdown-head shell/core edge-highlight saturation during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadShellEdgeFeatherInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced \? 0\.0625 : 0;[\s\S]*?const countdownHeadShellX = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*countdownHeadMarkerX - 0\.625 \+ countdownHeadShellEdgeFeatherInset\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.75\s*:\s*countdownHeadMarkerX - 1;[\s\S]*?const countdownHeadShellWidth = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*1\.25 - countdownHeadShellEdgeFeatherInset \* 2\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*1\.5\s*:\s*2;[\s\S]*?const countdownHeadShellRadius = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced \? 0\.25 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened \? 0\.5 : 1;[\s\S]*?fillRoundedRect\(\s*countdownHeadShellX,\s*countdownHeadShellY,\s*countdownHeadShellWidth,\s*countdownHeadShellHeight,\s*countdownHeadShellRadius\s*\)/,
        'boss telegraph rendering should narrow the countdown-head shell during the final sub-millisecond width-trim beat'
    );
    assert.match(
        source,
        /const countdownHeadShellEdgeSoftInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeSoftened \? 0\.25 : 0;[\s\S]*?const countdownHeadShellY = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.y \+ 2 \+ countdownHeadShellEdgeSoftInset\s*:\s*telegraphRect\.y \+ 1;[\s\S]*?const countdownHeadShellHeight = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.h - 4 - countdownHeadShellEdgeSoftInset \* 2\s*:\s*telegraphRect\.h - 2;[\s\S]*?fillRoundedRect\(\s*countdownHeadShellX,\s*countdownHeadShellY,\s*countdownHeadShellWidth,\s*countdownHeadShellHeight,\s*(?:1|countdownHeadShellRadius)\s*\)/,
        'boss telegraph rendering should soften the countdown-head shell seam during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreEdgeFeatherInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced \? 0\.03125 : 0;[\s\S]*?const countdownHeadInnerCoreX = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*countdownHeadMarkerX - 0\.0625 \+ countdownHeadInnerCoreEdgeFeatherInset\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.125\s*:\s*countdownHeadMarkerX - 0\.25;[\s\S]*?const countdownHeadInnerCoreWidth = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*0\.125 - countdownHeadInnerCoreEdgeFeatherInset \* 2\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*0\.25\s*:\s*0\.5;[\s\S]*?const countdownHeadInnerCoreRadius = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced \? 0\.25 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened \? 0\.5 : 1;[\s\S]*?fillRoundedRect\(\s*countdownHeadInnerCoreX,\s*countdownHeadInnerCoreY,\s*countdownHeadInnerCoreWidth,\s*countdownHeadInnerCoreHeight,\s*countdownHeadInnerCoreRadius\s*\)/,
        'boss telegraph rendering should narrow the countdown-head inner core during the final sub-millisecond width-trim beat'
    );
    assert.match(
        source,
        /const countdownHeadShellEdgeFeatherInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced \? 0\.0625 : 0;[\s\S]*?const countdownHeadShellX = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*countdownHeadMarkerX - 0\.625 \+ countdownHeadShellEdgeFeatherInset\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.75\s*:\s*countdownHeadMarkerX - 1;[\s\S]*?const countdownHeadShellWidth = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*1\.25 - countdownHeadShellEdgeFeatherInset \* 2\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*1\.5\s*:\s*2;[\s\S]*?const countdownHeadInnerCoreEdgeFeatherInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced \? 0\.03125 : 0;[\s\S]*?const countdownHeadInnerCoreX = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*countdownHeadMarkerX - 0\.0625 \+ countdownHeadInnerCoreEdgeFeatherInset\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.125\s*:\s*countdownHeadMarkerX - 0\.25;[\s\S]*?const countdownHeadInnerCoreWidth = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced\s*\?\s*0\.125 - countdownHeadInnerCoreEdgeFeatherInset \* 2\s*:\s*telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*0\.25\s*:\s*0\.5;/,
        'boss telegraph rendering should symmetrically trim the countdown-head shell/core edge feathering during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadShellAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.74 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.7 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.72 : telegraphHud\.currentCountdownHeadMarkerShellAlphaMuted \? 0\.76 : 0\.94;[\s\S]*?const countdownHeadInnerCoreAlpha = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced \? 0\.84 : telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced \? 0\.8 : telegraphHud\.currentCountdownHeadMarkerShellCoreContrastMuted \? 0\.76 : telegraphHud\.currentCountdownHeadMarkerInnerCoreAlphaMuted \? 0\.82 : 1;/,
        'boss telegraph rendering should rebalance the countdown-head shell/core edge-highlight transparency layering during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreEdgeSoftInset = telegraphHud\.currentCountdownHeadMarkerShellCoreEdgeSoftened \? 0\.25 : 0;[\s\S]*?const countdownHeadInnerCoreY = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.y \+ 3 \+ countdownHeadInnerCoreEdgeSoftInset\s*:\s*telegraphRect\.y \+ 2;[\s\S]*?const countdownHeadInnerCoreHeight = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.h - 6 - countdownHeadInnerCoreEdgeSoftInset \* 2\s*:\s*telegraphRect\.h - 4;[\s\S]*?fillRoundedRect\(\s*countdownHeadInnerCoreX,\s*countdownHeadInnerCoreY,\s*countdownHeadInnerCoreWidth,\s*countdownHeadInnerCoreHeight,\s*(?:1|countdownHeadInnerCoreRadius)\s*\)/,
        'boss telegraph rendering should soften the countdown-head inner-core seam during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? countdownHeadMarkerX - 3 : lateGlowOuterX;[\s\S]*?const lateGlowOuterWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? 6 : telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? 8 : 10;/,
        'boss telegraph rendering should narrow the residual outer late glow during the final sub-millisecond width-trim beat'
    );
    assert.match(
        source,
        /const lateGlowOuterY = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterHeightTrimmed \? telegraphRect\.y - 2 : telegraphRect\.y - 3;[\s\S]*?const lateGlowOuterHeight = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterHeightTrimmed \? telegraphRect\.h \+ 4 : telegraphRect\.h \+ 6;[\s\S]*?const lateGlowOuterRadius = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed \? 3 : 4;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillRoundedRect\(lateGlowOuterX,\s*lateGlowOuterY,\s*lateGlowOuterWidth,\s*lateGlowOuterHeight,\s*lateGlowOuterRadius\);/,
        'boss telegraph rendering should also shorten the residual outer late glow height during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowOuterRadius = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed \? 3 : 4;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillRoundedRect\(lateGlowOuterX,\s*lateGlowOuterY,\s*lateGlowOuterWidth,\s*lateGlowOuterHeight,\s*lateGlowOuterRadius\);/,
        'boss telegraph rendering should also tighten the residual outer late glow corners during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerLateGlowOuterAlphaMuted/,
        'boss telegraph rendering should consume the residual outer late-glow alpha trim flag from the shared summary'
    );
    assert.match(
        source,
        /const lateGlowOuterColor = telegraphHud\.currentCountdownHeadMarkerLateGlowOuterWarmthMuted \? 0xF2E7D6 : 0xFFE7AE;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillStyle\(lateGlowOuterColor,\s*lateGlowOuterAlpha\);/,
        'boss telegraph rendering should cool the residual outer late glow during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowInnerColor = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerWarmthMuted \? 0xF2E3C1 : 0xFFD27A;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillStyle\(lateGlowInnerColor,\s*lateGlowInnerAlpha\);/,
        'boss telegraph rendering should also cool the residual inner late glow during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowInnerY = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerHeightTrimmed \? telegraphRect\.y - 1 : telegraphRect\.y - 2;[\s\S]*?const lateGlowInnerHeight = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerHeightTrimmed \? telegraphRect\.h \+ 2 : telegraphRect\.h \+ 4;[\s\S]*?const lateGlowInnerRadius = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed \? 2 : 3;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillRoundedRect\(lateGlowInnerX,\s*lateGlowInnerY,\s*lateGlowInnerWidth,\s*lateGlowInnerHeight,\s*lateGlowInnerRadius\);/,
        'boss telegraph rendering should also shorten the residual inner late glow height during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowInnerRadius = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed \? 2 : 3;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillRoundedRect\(lateGlowInnerX,\s*lateGlowInnerY,\s*lateGlowInnerWidth,\s*lateGlowInnerHeight,\s*lateGlowInnerRadius\);/,
        'boss telegraph rendering should also tighten the residual inner late glow corners during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /const lateGlowInnerAlpha = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerAlphaMuted \? 0\.08 : 0\.12;[\s\S]*?const lateGlowInnerColor = telegraphHud\.currentCountdownHeadMarkerLateGlowInnerWarmthMuted \? 0xF2E3C1 : 0xFFD27A;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillStyle\(lateGlowInnerColor,\s*lateGlowInnerAlpha\);/,
        'boss telegraph rendering should also lower the residual inner late glow alpha during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若这段短促暖闪刚结束且剩余读招倒计时已低于约 220ms，头标外侧还会续上一层更弱的暖色余辉/,
        'help overlay should document the weaker late warm glow that persists after the head-marker flash ends near the final tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 80ms，还会把“当前倒计时头标”外侧那层弱暖色余辉略微收短贴边/,
        'help overlay should document the trimmed late head-marker glow during the final 80ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”外侧残余暖辉 alpha 也同步轻压半拍/,
        'help overlay should document the outer late-glow alpha trim during the final sub-millisecond tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间的色温反差也同步收敛半拍，避免清零前最后一粒撞线仍带双层暖度分层/,
        'help overlay should document the countdown-head shell/core color-temperature convergence during the final sub-millisecond tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 40ms，还会把“当前倒计时头标”外层余辉 alpha 继续压低并钳在条体终点内侧/,
        'help overlay should document the dimmer contained outer head-marker glow during the final 40ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 120ms，还会把“当前倒计时头标”的内芯略微收窄提亮/,
        'help overlay should document the narrower brighter countdown-head inner core during the last tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 20ms，还会把“当前倒计时头标”的主芯高度略微收短贴边/,
        'help overlay should document the shorter countdown-head inner core height during the final 20ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 10ms，还会把“当前倒计时头标”外壳的上下帽沿也略微压短/,
        'help overlay should document the shorter countdown-head shell caps during the final 10ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 5ms，还会把“当前倒计时头标”外壳 alpha 也轻压一档/,
        'help overlay should document the softer countdown-head shell alpha during the final 5ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 2ms，还会把“当前倒计时头标”内芯 alpha 也轻压一档/,
        'help overlay should document the softer countdown-head inner core alpha during the final 2ms tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”的内芯与外壳再同步收窄半拍/,
        'help overlay should document the final synchronized width trim for the countdown-head shell and inner core'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”外侧残余暖辉也同步压成更贴边的极细收尾/,
        'help overlay should document that the residual outer late glow also narrows during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”外侧残余暖辉的色温也同步压淡半拍，避免最后一圈外辉仍比真正撞线更抢戏/,
        'help overlay should document the outer late-glow color-temperature trim during the final sub-millisecond tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”内层残余暖辉的色温也同步压淡半拍，避免最后一丝内辉仍比真正撞线更抢戏/,
        'help overlay should document the inner late-glow color-temperature trim during the final sub-millisecond tail beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”外侧残余暖辉的上下高度也同步压短半拍/,
        'help overlay should document that the residual outer late glow height also shortens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”外侧残余暖辉的圆角也同步收紧半拍/,
        'help overlay should document that the residual outer late glow corners also tighten during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”内层残余暖辉的左右宽度也同步收窄半拍/,
        'help overlay should document that the residual inner late glow width also narrows during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”内层残余暖辉的上下高度也同步压短半拍/,
        'help overlay should document that the residual inner late glow height also shortens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”内层残余暖辉 alpha 也同步轻压半拍/,
        'help overlay should document that the residual inner late glow also softens during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”内层残余暖辉的圆角也同步收紧半拍/,
        'help overlay should document that the residual inner late glow corners also tighten during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间的明度反差也同步收敛半拍，避免清零前最后一粒撞线仍像双层亮点悬着/,
        'help overlay should document the converged countdown-head shell/core brightness contrast during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间的边缘清晰度也同步压软半拍，避免清零前最后一粒撞线仍像保留双层描边/,
        'help overlay should document the countdown-head shell/core edge-softening during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光也同步压平半拍，避免清零前最后一粒撞线仍像夹着一道细白描边/,
        'help overlay should document the flattened countdown-head shell/core edge highlight during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右厚差也同步抹平半拍，避免清零前最后一粒撞线仍像偏着一道细白描边/,
        'help overlay should document the countdown-head shell/core edge-highlight thickness balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右亮度偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧多挂半圈白边/,
        'help overlay should document the countdown-head shell/core edge-highlight brightness balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右色温偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧偏暖半圈/,
        'help overlay should document the countdown-head shell/core edge-highlight warmth balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右饱和偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧偏奶油半圈/,
        'help overlay should document the countdown-head shell/core edge-highlight saturation balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右羽化偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧拖着一缕虚边/,
        'help overlay should document the countdown-head shell/core edge-highlight feather balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右透明偏心也同步压匀半拍，避免清零前最后一粒撞线仍像单侧多留一层淡雾/,
        'help overlay should document the countdown-head shell/core edge-highlight transparency balancing during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss telegraph 已进入“尾段残影”区间且剩余读招倒计时已低于约 1ms，还会把“当前倒计时头标”壳芯之间残余边缘高光的左右冷暖透明层次也同步压匀半拍，避免清零前最后一粒撞线仍像单侧残留更白的一缕雾光/,
        'help overlay should document the countdown-head shell/core edge-highlight warm-vs-cool transparency layering during the final sub-millisecond trim beat'
    );
    assert.match(
        source,
        /若 Boss 的“反制窗口”只落在 telegraph 进度条本体中段，条内还会补一段“窗口高亮区段”，避免还要自己心算真正可反制跨度/,
        'help overlay should document the contained counter-window span highlight for mid-bar counter windows'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“已完成  奖励:\+90金 -> 已完成”这组 completed-state 回退，不再误退回“进行中”；即使正文已因前缀去重回退成“未知挑战”，第三行也会继续保留 completed-state 语义/,
        'help overlay should document the invalid-target regular completed fallback without regressing to in-progress copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“已完成”；compact 标题继续保留“本局挑战：已完成”且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用“挑战完成 -> 完成”这组 completed-state \/ no-reward 回退链，不误退回“进行中”，也不补“奖励:\+0金”\/“奖励:未知”/,
        'help overlay should document the invalid-target completed no-reward fallback chain across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若上游挑战标题仍带“本局挑战：”\/“挑战：”前缀，compact 第二行也会先去重再拼接奖励短句，避免紧凑摘要重复“挑战”标题/,
        'help overlay should document that compact challenge detail lines dedupe upstream challenge prefixes before appending reward labels'
    );
    assert.match(
        source,
        /当 compact 进行中摘要的第二行宽度预算继续吃紧时，也会先沿用“击败 30 个敌人 · \+90金 -> 击败 30 个敌人 -> 击败30个敌人”这条语义回退链，而不是直接退化成通用省略/,
        'help overlay should document the compact in-progress second-line semantic fallback before generic truncation'
    );
    assert.match(
        source,
        /完成态的第二行宽度预算继续吃紧时，也会沿用同一条“击败 30 个敌人 · \+90金 -> 击败 30 个敌人 -> 击败30个敌人”语义回退链/,
        'help overlay should document the compact completed second-line semantic fallback before generic truncation'
    );
    assert.match(
        source,
        /若这条 compact 第二行的奖励短句未来扩展到“\+9999金 \+净化”这类复合形式，进行中 \/ 完成态也都会继续沿用同一条回退链/,
        'help overlay should document that compact in-progress and completed compound rewards reuse the same second-line fallback chain'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 compact 第二行会继续沿用“击败 30 个敌人 -> 击败30个敌人”这条 label-only 回退梯子，不补“\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the rewardless compact second-line fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为“未知挑战”且当前 challenge 没有奖励短句，则 compact 第二行也会继续保留“未知挑战”这条 label-only 回退，不补“\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the unknown-label rewardless compact fallback without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若前缀去重后的正文回退为“未知挑战”且当前 challenge 仍有奖励短句，则 compact 第二行也会继续保留“未知挑战 · \+90金”这条 reward-bearing 回退，不额外插入新的中间短句/,
        'help overlay should document the unknown-label reward-bearing compact fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若视口进一步进入 ultra-compact 档位，则会先进一步收紧各区块间距与底边缓冲，本局词缀会压到 1 行、事件房摘要压到 2 行、本局挑战压到单行进度摘要/,
        'help overlay should document the ultra-compact spacing reduction before the tightest sidebar caps'
    );
    assert.match(
        source,
        /若这条可见摘要的奖励短句未来扩展到“\+9999金 \+净化”这类复合形式，也会继续沿用同一条可见摘要与完成徽记回退链/,
        'help overlay should document that future compound reward short labels reuse the same fallback ladder'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则 ultra-compact 单行摘要也会继续沿用“挑战 12\/30 -> 12\/30”\/“挑战完成 -> 完成”这条 no-reward 回退梯子，不补“\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the rewardless ultra-compact fallback ladder without inserting placeholder reward copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“进行中  奖励:\+90金 -> 进行中”这组状态优先回退，不再输出误导性的“进度:0\/0”\/“0\/0”；compact 标题也会改为“本局挑战：进行中”，继续保留第二行目标 \/ 奖励短句/,
        'help overlay should document the invalid-target regular and compact in-progress fallbacks without misleading 0/0 copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“进行中”；compact 标题继续保留“本局挑战：进行中”且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用“挑战进行中 -> 进行中”这组 no-reward 状态回退，不补“0\/0”\/“奖励:\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the invalid-target in-progress no-reward fallback chain across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular \/ compact \/ ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing in-progress helper，统一收敛“进行中  奖励:\+90金”\/“击败 30 个敌人 · \+90金”\/“挑战进行中 · \+90金”这条状态优先语义，避免未来文案漂移/,
        'help overlay should document the shared reward-bearing in-progress invalid-target helper across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且前缀去重后的正文已回退为“未知挑战”，compact 第二行也会继续沿用“未知挑战 · \+90金”\/“未知挑战”这组 detail fallback，不补“0\/0”\/“进度:0\/0”这类误导性占位/,
        'help overlay should document the invalid-target compact in-progress unknown-label fallback without reintroducing misleading ratio copy'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，则 ultra-compact 单行摘要会改为沿用“挑战进行中 · \+90金 -> 挑战进行中 -> 进行中”这组状态优先回退；隐藏后的轻量 in-progress badge 则保持静默，不输出“挑战 0\/0”\/“进0\/0”\/“0\/0”/,
        'help overlay should document the invalid-target ultra-compact and hidden-badge fallbacks without misleading ratio copy'
    );
    assert.match(
        source,
        /即使当前 challenge 仍有奖励短句，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 in-progress challenge badge 也仍会继续沿用“进12\/30 -> 12\/30 -> 进12 -> 静默隐藏”这组 progress-only 回退链，不额外插入“未知挑战”\/“\+90金”\/“奖励:未知”这类中间占位/,
        'help overlay should document that reward-bearing hidden in-progress badges stay on the same label-agnostic progress ladder when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，隐藏后的轻量 in-progress challenge badge 也会继续保持静默，不输出“挑战 0\/0”\/“进0\/0”\/“0\/0”/,
        'help overlay should document that reward-bearing hidden in-progress badges stay silent on invalid targets'
    );
    assert.match(
        source,
        /对应的轻量 badge appearance 也会回退为空文案并清空弱化 tint\/alpha，避免标题行残留旧着色/,
        'help overlay should document that the silent reward-bearing hidden in-progress badge also clears its subdued appearance state'
    );
    assert.match(
        source,
        /run-modifier heading 在 hidden challenge badge 静默路径下也会同步回收标题宽度预算；即使 badge 输入在最终拟合后被压成空文案或只剩空白，也会清空残留样式/,
        'help overlay should document that the run-modifier heading also clears stale badge styling when fitting collapses the hidden badge to silence'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且前缀去重后的正文已回退为“未知挑战”，compact 第二行也会继续沿用“未知挑战 · \+90金”\/“未知挑战”这组 completed detail fallback，不误退回“进行中”/,
        'help overlay should document the invalid-target compact completed unknown-label fallback without regressing to in-progress copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular \/ compact \/ ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing completed helper，统一收敛“已完成  奖励:\+90金”\/“击败 30 个敌人 · \+90金”\/“挑战完成 · \+90金”这条 completed-state 语义，避免未来文案漂移/,
        'help overlay should document the shared reward-bearing completed invalid-target helper across regular, compact, and ultra-compact summaries'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，ultra-compact 这条单行摘要也仍会保持同一组“挑战 12\/30 · \+90金 -> 挑战 12\/30 -> 12\/30”\/“挑战完成 · \+90金 -> 挑战完成 -> 完成”语义短句，不额外插入“未知挑战”这类中间短句/,
        'help overlay should document that ultra-compact challenge summaries stay on the same fallback ladder even when the body label falls back to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，ultra-compact 这条单行摘要也仍会继续沿用“挑战完成 · \+90金 -> 挑战完成 -> 完成”这组 completed-state 回退链，不额外插入“未知挑战”/,
        'help overlay should document the invalid-target completed ultra-compact unknown-label fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，若奖励短句未来扩展到“\+9999金 \+净化”这类显式复合形式，ultra-compact 这条单行摘要也仍会继续沿用同一组“挑战 12\/30 · \+9999金 \+净化 -> 挑战 12\/30 -> 12\/30”\/“挑战完成 · \+9999金 \+净化 -> 挑战完成 -> 完成”语义短句，不额外插入“未知挑战”这类中间短句/,
        'help overlay should document the unknown-label ultra-compact compound-reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /regular \/ compact 分档里凡是仍会显示奖励的路径，也会复用同一奖励短句 helper，避免与 ultra-compact 回退链出现文案漂移/,
        'help overlay should document that regular and compact reward-bearing summaries reuse the same short-label helper'
    );
    assert.match(
        source,
        /共享 challenge 标签与显式奖励短句 helper 也会压缩异常半角 \/ 全角空白，并把“\+ 9999金”\/“\+ 净化”与“＋ 9999金”\/“＋ 净化”这类 additive token 空白 \/ full-width plus 规整成“\+9999金 \+净化”，避免正文间距或复合奖励文案因脏输入而提前挤爆各分档宽度预算/,
        'help overlay should document the shared whitespace normalization for challenge labels and explicit reward labels'
    );
    assert.match(
        source,
        /若侧栏总高度仍超出安全范围，则会优先隐藏事件房摘要，其次再隐藏本局词缀正文，最后才隐藏本局挑战摘要/,
        'help overlay should document the final overflow-priority hiding order for the fixed sidebar'
    );
    assert.match(
        source,
        /这些 compact \/ ultra-compact \/ ultra-tight 分档会按实际显示尺寸触发，而不再只依赖固定逻辑画布尺寸/,
        'help overlay should document that the tighter sidebar tiers are now driven by actual display size'
    );
    assert.match(
        source,
        /若该挑战摘要与本局词缀正文都因溢出被隐藏，则会在挑战起步后把“进12\/30”\/“完成”压成挂在“本局词缀”标题后的轻量徽记；若标题预算进一步吃紧，则进行中态还会继续压成“12\/30”；若进入 ultra-tight 更紧预算，则会再回退为“进12”这类无省略最终短句；若连进行中态的“进12”都放不下，则也会静默隐藏 badge，把同一行预算完全还给标题/,
        'help overlay should document the full in-progress challenge badge fallback chain through the final ultra-tight silent-hide state'
    );
    assert.match(
        source,
        /完成态还会先从“完成\+90金”这类奖励短句回退为“完成”；若连完成态的“完成”都放不下，则会静默隐藏 badge，把同一行预算完全还给标题/,
        'help overlay should document the full completed-badge reward-to-complete-to-silent fallback chain'
    );
    assert.match(
        source,
        /若当前 challenge 没有奖励短句，则隐藏后的轻量挑战徽记也会继续沿用“进12\/30 -> 12\/30 -> 进12 -> 静默隐藏”\/“完成 -> 静默隐藏”这组 no-reward 回退链，不补“\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the rewardless hidden challenge-badge fallback ladders without placeholder reward copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量挑战徽记也仍会继续沿用“进12\/30 -> 12\/30 -> 进12 -> 静默隐藏”\/“完成 -> 静默隐藏”这组 no-reward 回退链，不额外插入“未知挑战”\/“\+0金”\/“奖励:未知”这类中间占位/,
        'help overlay should document that rewardless hidden challenge badges stay on the same fallback ladder even when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用“完成\+90金 -> 完成 -> 静默隐藏”这组回退链，不额外插入“未知挑战”这类中间短句/,
        'help overlay should document that reward-bearing hidden completed challenge badges stay on the same fallback ladder even when the body label collapses to 未知挑战'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用“完成\+90金 -> 完成 -> 静默隐藏”这组 completed-state 回退链，不额外插入“未知挑战”这类中间短句/,
        'help overlay should document the invalid-target hidden completed-badge reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则隐藏后的轻量 completed challenge badge 也会继续沿用“完成 -> 静默隐藏”这组 no-reward 回退链，不补“\+0金”\/“奖励:未知”这类占位/,
        'help overlay should document the invalid-target hidden completed-badge no-reward fallback without placeholder reward copy'
    );
    assert.match(
        source,
        /即使上游挑战标签在 regular \/ compact 路径里因前缀去重而回退成“未知挑战”，若隐藏后的轻量 completed challenge badge 奖励短句未来扩展到“\+9999金 \+净化”这类显式复合形式，也会继续沿用“完成\+9999金 \+净化 -> 完成 -> 静默隐藏”同一语义回退链，不额外插入“未知挑战”这类中间短句/,
        'help overlay should document the unknown-label hidden completed-badge compound-reward fallback without introducing extra intermediate copy'
    );
    assert.match(
        source,
        /该轻量徽记会拆成独立弱化色阶，并进一步下调字级与透明度后再与“本局词缀”标题分开贴边；若标题预算继续压窄，则会按更紧预算分档继续下调 badge 宽度占比、最小宽度与固定 gap，优先把更多横向空间留给标题正文/,
        'help overlay should document the quieter typography plus the ultra-tight width-budget tier for the final ultra-compact challenge badge fallback'
    );
}

function testVerticalTextStackLayout() {
    assert.equal(typeof buildVerticalTextStackLayout, 'function', 'vertical text stack layout helper should be exported');
    const layout = buildVerticalTextStackLayout([
        { key: 'area', height: 22, gapAfter: 4, active: true },
        { key: 'title', height: 14, gapAfter: 2, active: true },
        { key: 'modifiers', height: 39, gapAfter: 12, active: true },
        { key: 'challenge', height: 0, gapAfter: 10, active: false },
        { key: 'event', height: 26, gapAfter: 0, active: true }
    ], 30);
    assert.deepEqual(
        layout,
        {
            area: 30,
            title: 56,
            modifiers: 72,
            challenge: 123,
            event: 123
        },
        'vertical text stack layout should skip inactive blocks while preserving the next active anchor'
    );
}

function testPriorityTextStackLayoutHelper() {
    assert.equal(typeof buildPriorityTextStackLayout, 'function', 'priority-aware text stack layout helper should be exported');
    const layout = buildPriorityTextStackLayout([
        { key: 'areaNameText', height: 22, gapAfter: 4, active: true, droppable: false },
        { key: 'runModifierTitle', height: 14, gapAfter: 2, active: true, droppable: false },
        { key: 'runModifierText', height: 39, gapAfter: 12, active: true, droppable: true, collapsePriority: 2 },
        { key: 'challengeText', height: 26, gapAfter: 12, active: true, droppable: false },
        { key: 'eventRoomText', height: 39, gapAfter: 0, active: true, droppable: true, collapsePriority: 3 }
    ], 30, { maxBottom: 124 });
    assert.deepEqual(
        layout.positions,
        {
            areaNameText: 30,
            runModifierTitle: 56,
            runModifierText: 72,
            challengeText: 72,
            eventRoomText: 110
        },
        'priority-aware stack layout should recompute positions after hiding lower-priority blocks'
    );
    assert.deepEqual(
        layout.visibility,
        {
            areaNameText: true,
            runModifierTitle: true,
            runModifierText: false,
            challengeText: true,
            eventRoomText: false
        },
        'priority-aware stack layout should hide lower-priority droppable blocks until the stack fits'
    );
    assert.deepEqual(
        layout.hiddenKeys,
        ['eventRoomText', 'runModifierText'],
        'priority-aware stack layout should report the hidden keys in collapse order'
    );

    const ultraCompactLayout = buildPriorityTextStackLayout([
        { key: 'areaNameText', height: 22, gapAfter: 2, active: true, droppable: false },
        { key: 'runModifierTitle', height: 14, gapAfter: 1, active: true, droppable: false },
        { key: 'runModifierText', height: 18, gapAfter: 8, active: true, droppable: true, collapsePriority: 2 },
        { key: 'challengeText', height: 18, gapAfter: 8, active: true, droppable: true, collapsePriority: 1 },
        { key: 'eventRoomText', height: 18, gapAfter: 0, active: true, droppable: true, collapsePriority: 3 }
    ], 30, { maxBottom: 80 });
    assert.deepEqual(
        ultraCompactLayout.visibility,
        {
            areaNameText: true,
            runModifierTitle: true,
            runModifierText: false,
            challengeText: false,
            eventRoomText: false
        },
        'priority-aware stack layout should allow challenge copy to disappear only after higher-priority droppable blocks are removed'
    );
    assert.deepEqual(
        ultraCompactLayout.hiddenKeys,
        ['eventRoomText', 'runModifierText', 'challengeText'],
        'priority-aware stack layout should drop challenge copy last when ultra-compact overflow still remains'
    );
}

function testPlayerDeathFreezeHook() {
    const source = loadGameSource();
    assert.match(source, /freezeForDeath\(\)\s*{/, 'Player should define a centralized freezeForDeath hook');
    assert.match(
        source,
        /freezeForDeath\(\)\s*{[\s\S]*?this\.setVelocity\(0,\s*0\);/,
        'freezeForDeath should zero the player sprite velocity immediately'
    );
    assert.match(
        source,
        /freezeForDeath\(\)\s*{[\s\S]*?this\.body[\s\S]*?setVelocity\(0,\s*0\);/,
        'freezeForDeath should zero the physics body velocity immediately'
    );
    assert.match(
        source,
        /freezeForDeath\(\)\s*{[\s\S]*?this\.isDodging = false;/,
        'freezeForDeath should cancel dodge state'
    );
    assert.match(
        source,
        /freezeForDeath\(\)\s*{[\s\S]*?this\.isAttacking = false;/,
        'freezeForDeath should cancel attack state'
    );
    const deathHookCalls = source.match(/this\.player\.freezeForDeath\(\);/g) || [];
    assert.equal(deathHookCalls.length, 2, 'both LevelScene and BossScene should invoke player.freezeForDeath() on death');
}

function testBossHudLayoutAndVictoryGuards() {
    const source = loadGameSource();
    assert.match(
        source,
        /setBossHudLayout\(enabled\)\s*{/,
        'UIScene should expose a dedicated boss HUD layout switcher'
    );
    assert.match(
        source,
        /this\._bossHudLayoutApplied = true;/,
        'BossScene should mark boss HUD layout as applied once UIScene is available'
    );
    assert.match(
        source,
        /GameState\.save\(\);\s*}\s*catch\s*\(/,
        'Boss victory should guard save failures so post-fight flow does not hard-freeze'
    );
    assert.match(
        source,
        /this\._victoryFailSafeTimer = this\.time\.delayedCall\(/,
        'Boss victory should install a fail-safe delayed transition to avoid getting stuck'
    );
}

function testBossVictoryCombatCleanup() {
    const source = loadGameSource();
    assert.match(
        source,
        /freezeForCinematic\(\)\s*{/,
        'Player should define a cinematic freeze hook for victory/death transitions'
    );
    assert.match(
        source,
        /freezeForCinematic\(\)\s*{[\s\S]*?this\.weaponVisual\.clear\(\);/,
        'cinematic freeze should clear the persisted weapon visual to avoid frozen ghost weapons'
    );
    assert.match(
        source,
        /clearAttackVisuals\(\)\s*{/,
        'Boss should expose a dedicated attack visual cleanup hook'
    );
    assert.match(
        source,
        /if \(!this\.boss\.isAlive && !this\.bossDead\)\s*{[\s\S]*?this\.boss\.clearAttackVisuals\(\);/,
        'boss defeat path should cleanup attack visuals immediately'
    );
    assert.match(
        source,
        /if \(!this\.boss\.isAlive && !this\.bossDead\)\s*{[\s\S]*?this\.player\.freezeForCinematic\(\);/,
        'boss defeat path should freeze player motion immediately to prevent post-win drifting'
    );
}

function testPauseWeaponInfoLayoutGuards() {
    const source = loadGameSource();
    assert.match(
        source,
        /_setWeaponInfoLayout\(visible\)\s*{/,
        'PauseScene should provide a dedicated weapon-info layout switcher'
    );
    assert.match(
        source,
        /this\.volumeDownButton = this\._createButton\(/,
        'PauseScene should keep a reference to volume-down button for layout toggling'
    );
    assert.match(
        source,
        /this\.volumeUpButton = this\._createButton\(/,
        'PauseScene should keep a reference to volume-up button for layout toggling'
    );
    assert.match(
        source,
        /this\.backToTitleButton = this\._createButton\(/,
        'PauseScene should keep a reference to return-to-title button for layout toggling'
    );
    assert.match(
        source,
        /this\._setWeaponInfoLayout\(this\._infoVisible\);/,
        'weapon-info toggle should switch pause menu layout to prevent text overlap'
    );
}

function testBossVictoryAlwaysTransitions() {
    const source = loadGameSource();
    assert.match(
        source,
        /if \(!this\.boss\.isAlive && !this\.bossDead\)\s*{[\s\S]*?try\s*{[\s\S]*?}\s*finally\s*{[\s\S]*?this\._victorySequence\(\);[\s\S]*?}/,
        'boss defeat flow should always enter victory sequence even if reward settlement throws'
    );
}

function testBossVictoryFailSafeIndependence() {
    const source = loadGameSource();
    assert.match(
        source,
        /_victorySequence\(\)\s*{[\s\S]*?this\._victoryFailSafeTimer = this\.time\.delayedCall\(\s*12000,/,
        'victory flow should install a long fail-safe timer at sequence start'
    );
    assert.match(
        source,
        /this\.time\.delayedCall\(2500,\s*\(\)\s*=>\s*{[\s\S]*?try\s*{/,
        'victory delayed settlement callback should be wrapped in try/catch'
    );
    assert.match(
        source,
        /catch\s*\(e\)\s*{[\s\S]*?finishVictoryTransition\(\);/,
        'victory settlement callback should fallback to direct transition on runtime errors'
    );
}

function testBossDefeatOuterFinallyGuard() {
    const source = loadGameSource();
    assert.match(
        source,
        /if \(!this\.boss\.isAlive && !this\.bossDead\)\s*{[\s\S]*?try\s*{[\s\S]*?this\.player\.freezeForCinematic\(\);[\s\S]*?this\.boss\.clearAttackVisuals\(\);[\s\S]*?}\s*catch\s*\(e\)\s*{[\s\S]*?}\s*finally\s*{[\s\S]*?this\._victorySequence\(\);[\s\S]*?}/,
        'boss defeat branch should outer-guard cleanup and rewards, then always trigger victory sequence in finally'
    );
    assert.match(
        source,
        /window\.setTimeout\(\(\)\s*=>\s*{[\s\S]*?finishVictoryTransition\(\);[\s\S]*?},\s*14000\);/,
        'victory flow should include browser timer fallback independent of Phaser scene clock'
    );
}

function testBossVictorySyncErrorFallback() {
    const source = loadGameSource();
    assert.match(
        source,
        /_forceVictoryTransition\(\)\s*{/,
        'BossScene should expose a hard fallback transition helper'
    );
    assert.match(
        source,
        /finally\s*{[\s\S]*?try\s*{[\s\S]*?this\._victorySequence\(\);[\s\S]*?}\s*catch\s*\(e\)\s*{[\s\S]*?this\._forceVictoryTransition\(\);/,
        'boss defeat finally block should fallback to hard transition when victory sequence throws synchronously'
    );
    assert.match(
        source,
        /_victorySequence\(\)\s*{[\s\S]*?try\s*{[\s\S]*?}\s*catch\s*\(e\)\s*{[\s\S]*?this\._forceVictoryTransition\(\);/,
        'victory sequence should catch synchronous errors and force transition'
    );
}

function testBossVictoryWatchdogLoop() {
    const source = loadGameSource();
    assert.match(
        source,
        /if \(this\.bossDead\)\s*{\s*this\._watchVictoryFlow\(\);\s*return;\s*}/,
        'BossScene update should keep a watchdog active while waiting for victory transition'
    );
    assert.match(
        source,
        /_watchVictoryFlow\(\)\s*{/,
        'BossScene should define a watchdog method for stalled victory transitions'
    );
    assert.match(
        source,
        /_forceVictoryTransition\(\)\s*{[\s\S]*?let started = false;/,
        'force transition should only mark completion after a successful scene start'
    );
}

function testHubPortalTransitionSafetyHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\.physics\.add\.overlap\(this\.player,\s*this\.portalGroup,\s*\(_player,\s*portal\)\s*=>\s*{[\s\S]*?if \(this\._portalTransitioning\) return;[\s\S]*?this\._pendingPortalBossKey = bossKey;[\s\S]*?}\);/,
        'HubScene portal overlap should only set a pending portal key with a re-entry guard, not start scenes directly inside overlap callback'
    );
    assert.match(
        source,
        /_flushPortalTransition\(\)\s*{[\s\S]*?if \(!this\._portalTransitioning \|\| !this\._pendingPortalBossKey\) return false;[\s\S]*?this\._pendingPortalBossKey = null;[\s\S]*?this\.scene\.start\('LevelScene',\s*{\s*bossKey\s*}\);/,
        'HubScene should flush queued portal transitions from update loop and start the target scene there'
    );
    assert.match(
        source,
        /update\(time,\s*delta\)\s*{[\s\S]*?if \(this\._flushPortalTransition\(\)\) return;[\s\S]*?this\.player\.update\(time,\s*delta\);/,
        'HubScene update should execute queued portal transition before normal movement updates to avoid overlap callback deadlocks'
    );
    assert.match(
        source,
        /catch \(err\)\s*{[\s\S]*?this\._portalTransitioning = false;[\s\S]*?if \(!this\.scene\.isActive\('UIScene'\)\) this\.scene\.launch\('UIScene'\);[\s\S]*?return false;/,
        'HubScene portal transition flush should recover from transition errors by clearing lock and relaunching UIScene'
    );
}

function testHubLastRunSummaryRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /this\._hubLastRunSummary = buildHubLastRunSummary\(GameState\.lastRunSummary\);/,
        'HubScene should build the fixed-position last-run recap block from the shared helper'
    );
    assert.match(
        source,
        /if \(this\._hubLastRunSummary\.visible\)[\s\S]*?this\.add\.text\([\s\S]*?this\._hubLastRunSummary\.title[\s\S]*?this\.add\.text\([\s\S]*?this\._hubLastRunSummary\.lines\.join\('\\n'\)/,
        'HubScene should render both the last-run recap title and multiline detail block when a recap exists'
    );
    assert.match(
        source,
        /GameState\.lastRunSummary = \{[\s\S]*?bossLabel:[\s\S]*?routeRecap:[\s\S]*?choiceLabel:[\s\S]*?recommendationReason:/,
        'BossScene victory flow should persist a structured last-run summary before saving'
    );
}

function testHubPortalChoiceRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildHubPortalChoiceSummary,/,
        'game.js should import the shared hub portal choice helper from GameCore'
    );
    assert.match(
        source,
        /this\._hubPortalChoicePanel = this\.add\.rectangle\(/,
        'HubScene should create a dedicated portal-focus decision panel'
    );
    assert.match(
        source,
        /this\._hubPortalChoiceSummary = buildHubPortalChoiceSummary\(GameState\.lastRunSummary,\s*\{\s*label:\s*targetLabel,\s*bossKey:\s*focusedPortal\.bossKey\s*\}\);/,
        'HubScene should rebuild portal-focus copy from the shared helper and current boss-aware portal target'
    );
    assert.match(
        source,
        /this\._hubPortalChoiceTitleText\.setText\(this\._hubPortalChoiceSummary\.title\);[\s\S]*?this\._hubPortalChoiceBodyText\.setText\(this\._hubPortalChoiceSummary\.lines\.join\('\\n'\)\);/,
        'HubScene should update both portal-focus title and multiline detail text from the shared helper output'
    );
    assert.match(
        source,
        /const portalFocusRadius = 96;[\s\S]*?if \(distance < portalFocusRadius && distance < nearestDistance\)/,
        'HubScene should only surface portal-focus copy for the nearest in-range portal'
    );
}

function testRunStartTargetCueRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildRunStartTargetCue,/,
        'game.js should import the shared run-start target cue helper from GameCore'
    );
    assert.match(
        source,
        /const boss = BOSSES\[bossKey\];[\s\S]*?this\._runStartTargetCue = buildRunStartTargetCue\(\{\s*label:\s*`\$\{boss\.sin\} \$\{boss\.area\}`,\s*bossKey\s*\}\);/,
        'LevelScene should derive the run-start target cue from the current boss target when the run scene is created'
    );
    assert.match(
        source,
        /this\._runStartTargetCueShown = false;/,
        'LevelScene should track whether the run-start target cue has already been shown'
    );
    assert.match(
        source,
        /_maybeShowRunStartTargetCue\(\)\s*{[\s\S]*?if \(!this\._runStartTargetCue \|\| this\._runStartTargetCueShown\) return;[\s\S]*?this\._runStartTargetCueShown = true;[\s\S]*?this\.time\.delayedCall\(220,\s*\(\)\s*=>\s*\{[\s\S]*?this\._showFloatingText\(\s*this\.player\.x,\s*this\.player\.y - 84,\s*this\._runStartTargetCue,\s*'#ffe7b8'\s*\);[\s\S]*?\}\);[\s\S]*?}/,
        'LevelScene should show the run-start target cue once, shortly after scene entry, using the shared floating-text channel'
    );
    assert.match(
        source,
        /update\(time,\s*delta\)\s*{[\s\S]*?this\._maybeShowRunStartTargetCue\(\);[\s\S]*?this\.player\.update\(time,\s*delta\);/,
        'LevelScene update should trigger the one-shot run-start target cue before normal gameplay updates continue'
    );
    assert.match(
        source,
        /this\._runStartPrepReceipt = buildRunStartPrepReceipt\(GameState\.portalPreparationTarget, GameState, ITEMS\);/,
        'LevelScene should derive the run-start prep receipt from the latest portal prep target when the run scene is created'
    );
    assert.match(
        source,
        /this\._runStartPrepReceiptShown = false;/,
        'LevelScene should track whether the run-start prep receipt has already been shown'
    );
    assert.match(
        source,
        /_maybeShowRunStartPrepReceipt\(\) \{[\s\S]*?const prepColor = receiptLine\.startsWith\('✗'\)[\s\S]*?'#ff9a9a'[\s\S]*?receiptLine\.startsWith\('✓'\)[\s\S]*?'#7dffb3'[\s\S]*?'#ffe7a8'[\s\S]*?this\._showFloatingText\(this\.player\.x, this\.player\.y - 42, receiptLine, prepColor, 720\);[\s\S]*?\}/,
        'LevelScene should show the run-start prep receipt once, shortly after scene entry, with status-aware coloring, tighter post-entry timing, a lower vertical offset, and a faster fade so the prep audit lands beneath the target cue without lingering as long'
    );
    assert.match(
        source,
        /this\._maybeShowRunStartTargetCue\(\);\s*this\._maybeShowRunStartPrepReceipt\(\);\s*this\._maybeShowFirstCombatTargetCue\(\);/,
        'LevelScene update should trigger the run-start prep receipt alongside the run-start target cue before normal gameplay updates continue'
    );
}

function testFirstCombatTargetCueRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildFirstCombatTargetCue,/,
        'game.js should import the shared first-combat target cue helper from GameCore'
    );
    assert.match(
        source,
        /const boss = BOSSES\[bossKey\];[\s\S]*?this\._firstCombatTargetCue = buildFirstCombatTargetCue\(\{\s*label:\s*`\$\{boss\.sin\} \$\{boss\.area\}`,\s*bossKey\s*\}\);/,
        'LevelScene should derive the first-combat target cue from the current boss target when the run scene is created'
    );
    assert.match(
        source,
        /this\._firstCombatTargetCueShown = false;/,
        'LevelScene should track whether the first-combat target cue has already been shown'
    );
    assert.match(
        source,
        /this\.room1Enemies = this\.enemies\.filter\(\(_, i\) => i < 3\);/,
        'LevelScene should keep a dedicated room-1 enemy slice so the first-combat cue only reacts to the opening fight'
    );
    assert.match(
        source,
        /_maybeShowFirstCombatTargetCue\(\)\s*{[\s\S]*?if \(!this\._firstCombatTargetCue \|\| this\._firstCombatTargetCueShown\) return;[\s\S]*?const room1CombatWakeup = this\.room1Enemies\.some\(\(enemy\) => enemy && enemy\.isAlive && \(enemy\.state === 'chase' \|\| enemy\.state === 'attack'\)\);[\s\S]*?if \(!room1CombatWakeup\) return;[\s\S]*?this\._firstCombatTargetCueShown = true;[\s\S]*?this\._showFloatingText\([\s\S]*?this\._firstCombatTargetCue,\s*'#ffe7b8',\s*760\s*\);[\s\S]*?}/,
        'LevelScene should show the first-combat target cue once when room-1 enemies first wake up'
    );
    assert.match(
        source,
        /for \(const enemy of this\.enemies\) \{[\s\S]*?const attacking = enemy\.update\(time,\s*delta,\s*this\.player\);[\s\S]*?\}[\s\S]*?this\._maybeShowFirstCombatTargetCue\(\);[\s\S]*?this\._maybeShowRunEventEncounterClearRecap\(\);/,
        'LevelScene update should trigger the first-combat target cue after enemy states update and before later room-3 recap hooks'
    );
}

function testCorridorTargetBridgeCueRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildCorridorTargetBridgeCue,/,
        'game.js should import the shared corridor target bridge cue helper from GameCore'
    );
    assert.match(
        source,
        /const boss = BOSSES\[bossKey\];[\s\S]*?this\._corridorTargetBridgeCue = buildCorridorTargetBridgeCue\(\{\s*label:\s*`\$\{boss\.sin\} \$\{boss\.area\}`,\s*bossKey\s*\}\);/,
        'LevelScene should derive the corridor target bridge cue from the current boss target when the run scene is created'
    );
    assert.match(
        source,
        /this\._corridorTargetBridgeCueShown = false;/,
        'LevelScene should track whether the corridor target bridge cue has already been shown'
    );
    assert.match(
        source,
        /this\.firstCorridorBounds = corridors\[0\];/,
        'LevelScene should keep the first corridor bounds so the bridge cue only fires on the room-1 to room-2 transition'
    );
    assert.match(
        source,
        /_maybeShowCorridorTargetBridgeCue\(\)\s*{[\s\S]*?if \(!this\._corridorTargetBridgeCue \|\| this\._corridorTargetBridgeCueShown\) return;[\s\S]*?const room1AllDead = this\.room1Enemies\.every\(\(enemy\) => !enemy \|\| !enemy\.isAlive\);[\s\S]*?if \(!room1AllDead\) return;[\s\S]*?const corridor = this\.firstCorridorBounds;[\s\S]*?const insideFirstCorridor = this\.player\.x >= corridor\.x && this\.player\.x <= corridor\.x \+ corridor\.w && this\.player\.y >= corridor\.y && this\.player\.y <= corridor\.y \+ corridor\.h;[\s\S]*?if \(!insideFirstCorridor\) return;[\s\S]*?this\._corridorTargetBridgeCueShown = true;[\s\S]*?this\._showFloatingText\([\s\S]*?this\._corridorTargetBridgeCue,\s*'#ffe7b8'\s*\);[\s\S]*?}/,
        'LevelScene should show the corridor target bridge cue once only after room-1 clear and first-corridor entry'
    );
    assert.match(
        source,
        /this\._maybeShowFirstCombatTargetCue\(\);[\s\S]*?this\._maybeShowCorridorTargetBridgeCue\(\);[\s\S]*?this\._maybeShowRunEventEncounterClearRecap\(\);/,
        'LevelScene update should trigger the corridor target bridge cue after the first-combat cue and before later recap hooks'
    );
}

function testBlacksmithPrepRecommendationRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildBlacksmithPrepRecommendation,/,
        'game.js should import the shared blacksmith prep recommendation helper from GameCore'
    );
    assert.match(
        source,
        /portalPreparationTarget:\s*null,/,
        'GameState should keep an ephemeral portal prep target payload for hub-to-blacksmith handoff'
    );
    assert.match(
        source,
        /this\._hubPortalChoiceSummary = buildHubPortalChoiceSummary\([\s\S]*?if \(focusedPortal && focusedPortal\.bossKey && targetLabel\) \{\s*GameState\.portalPreparationTarget = \{\s*label:\s*targetLabel,\s*bossKey:\s*focusedPortal\.bossKey\s*\};\s*}/,
        'HubScene should preserve the currently focused portal target in GameState for later prep surfaces'
    );
    assert.match(
        source,
        /this\._blacksmithPrepRecommendation = buildBlacksmithPrepRecommendation\(GameState\.portalPreparationTarget\);/,
        'BlacksmithScene should build its prep panel from the shared helper and the last focused portal target'
    );
    assert.match(
        source,
        /this\._blacksmithPrepTitleText = this\.add\.text\([\s\S]*?this\._blacksmithPrepBodyText = this\.add\.text\(/,
        'BlacksmithScene should allocate a compact prep title/body block near the header'
    );
    assert.match(
        source,
        /const isRecommendedRecipe = !!\(this\._blacksmithPrepRecommendation && this\._blacksmithPrepRecommendation\.recipeKey === recipeKey\);[\s\S]*?fill:\s*isRecommendedRecipe \? '#ffe7b8' : '#ffffff'/,
        'BlacksmithScene craft rows should highlight the recommended recipe line'
    );
    assert.match(
        source,
        /const isRecommendedRecipe = !!\(this\._blacksmithPrepRecommendation && this\._blacksmithPrepRecommendation\.recipeKey === recipeKey\);[\s\S]*?fill:\s*isRecommendedRecipe \? '#ffd27a' : '#4a90d9'/,
        'BlacksmithScene craft buttons should highlight the recommended recipe button before disabled-state sync runs'
    );
}

function testShopPrepRecommendationRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildShopPrepRecommendation,/,
        'game.js should import the shared shop prep recommendation helper from GameCore'
    );
    assert.match(
        source,
        /this\._shopPrepRecommendation = buildShopPrepRecommendation\(GameState\.portalPreparationTarget\);/,
        'ShopScene should build its prep panel from the shared helper and the last focused portal target'
    );
    assert.match(
        source,
        /this\._shopPrepTitleText = this\.add\.text\([\s\S]*?this\._shopPrepBodyText = this\.add\.text\(/,
        'ShopScene should allocate a compact purchase recommendation block near the header'
    );
    assert.match(
        source,
        /const isRecommendedItem = !!\(this\._shopPrepRecommendation && this\._shopPrepRecommendation\.itemKey === key\);[\s\S]*?fill:\s*isRecommendedItem \? '#ffe7b8' : '#ffffff'/,
        'ShopScene item rows should highlight the recommended purchase line'
    );
    assert.match(
        source,
        /const isRecommendedItem = !!\(this\._shopPrepRecommendation && this\._shopPrepRecommendation\.itemKey === key\);[\s\S]*?fill:\s*isRecommendedItem \? '#ffd27a' : '#4a90d9'/,
        'ShopScene buy buttons should highlight the recommended purchase button before buy-state logic runs'
    );
}

function testInventoryPrepReviewRuntimeHooks() {
    const source = loadGameSource();
    assert.match(
        source,
        /buildInventoryPrepReview,/,
        'game.js should import the shared inventory prep review helper from GameCore'
    );
    assert.match(
        source,
        /this\._inventoryPrepReview = buildInventoryPrepReview\(GameState\.portalPreparationTarget, GameState, ITEMS\);/,
        'InventoryScene should build its prep review block from the shared helper, portal target, and current inventory state'
    );
    assert.match(
        source,
        /this\._inventoryPrepTitleText = this\.add\.text\([\s\S]*?this\._inventoryPrepBodyText = this\.add\.text\(/,
        'InventoryScene should allocate a compact prep-review title/body block near the header'
    );
    assert.match(
        source,
        /const startY = this\._inventoryPrepReview\.visible \? 190 : 130;/,
        'InventoryScene should push the item grid down when the prep review block is visible'
    );
    assert.match(
        source,
        /const isRecommendedItem = !!\(this\._inventoryPrepReview && this\._inventoryPrepReview\.itemKey === key\);[\s\S]*?box\.fillStyle\(isRecommendedItem \? 0x467f3a : 0x2d5a27, 1\);[\s\S]*?const txt = this\.add\.text\([\s\S]*?fill: isRecommendedItem \? '#ffe7b8' : '#ffffff'[\s\S]*?const cnt = this\.add\.text\([\s\S]*?fill: isRecommendedItem \? '#ffd27a' : '#aaaaaa'/,
        'InventoryScene consumable rows should highlight the recommended prep item and its count when the backpack review points at it'
    );
}

function main() {
    runTest('weapon scaling monotonicity', testWeaponScalingMonotonicity);
    runTest('sword early reach baseline', testSwordEarlyReachBaseline);
    runTest('normal enemy pressure baseline', testNormalEnemyPressureBaseline);
    runTest('sword opening balance window', testSwordOpeningBalanceWindow);
    runTest('material-bound upgrade checks', testMaterialBoundUpgradeChecks);
    runTest('weapon upgrade affordance', testWeaponUpgradeAffordance);
    runTest('weapon upgrade benefit summary', testWeaponUpgradeBenefitSummary);
    runTest('weapon upgrade row label', testWeaponUpgradeRowLabel);
    runTest('weapon upgrade message helpers', testWeaponUpgradeMessageHelpers);
    runTest('save/load integrity', testSaveLoadIntegrity);
    runTest('hub last-run summary helper', testHubLastRunSummaryHelper);
    runTest('hub portal choice summary helper', testHubPortalChoiceSummaryHelper);
    runTest('blacksmith prep recommendation helper', testBlacksmithPrepRecommendationHelper);
    runTest('shop prep recommendation helper', testShopPrepRecommendationHelper);
    runTest('inventory prep review helper', testInventoryPrepReviewHelper);
    runTest('run-start prep receipt helper', testRunStartPrepReceiptHelper);
    runTest('run-start target cue helper', testRunStartTargetCueHelper);
    runTest('first-combat target cue helper', testFirstCombatTargetCueHelper);
    runTest('corridor target bridge cue helper', testCorridorTargetBridgeCueHelper);
    runTest('run-event shrine target cue helper', testRunEventRoomTargetPostureCueHelper);
    runTest('status effect logic', testStatusEffectLogic);
    runTest('run modifier selection/effects', testRunModifierSelectionAndEffects);
    runTest('run event room selection', testRunEventRoomSelection);
    runTest('combat discipline event room', testCombatDisciplineEventRoom);
    runTest('combat flow event room', testCombatFlowEventRoom);
    runTest('combo link event room', testComboLinkEventRoom);
    runTest('counterattack event room', testCounterattackEventRoom);
    runTest('weapon routing event room', testWeaponRoutingEventRoom);
    runTest('risk/reward event room', testRiskRewardEventRoom);
    runTest('status-routing event room', testStatusRoutingEventRoom);
    runTest('control-routing event room', testControlRoutingEventRoom);
    runTest('run event room choice helpers', testRunEventRoomChoiceHelpers);
    runTest('run event encounter profile helpers', testRunEventEncounterProfileHelpers);
    runTest('run event encounter roster helpers', testRunEventEncounterRosterHelpers);
    runTest('run event encounter formation helpers', testRunEventEncounterFormationHelpers);
    runTest('run event encounter payoff helpers', testRunEventEncounterPayoffHelpers);
    runTest('run event encounter clear recap helpers', testRunEventEncounterClearRecapHelpers);
    runTest('run event encounter Boss-door recap helpers', testRunEventEncounterBossDoorRecapHelpers);
    runTest('run event encounter Boss-opening echo helpers', testRunEventEncounterBossOpeningEchoHelpers);
    runTest('run event encounter Boss-victory recap helpers', testRunEventEncounterBossVictoryRecapHelpers);
    runTest('run event encounter source cue helpers', testRunEventEncounterSourceCueHelpers);
    runTest('run event room choice recommendation', testRunEventRoomChoiceRecommendation);
    runTest('run event room choice panel preview', testRunEventRoomChoicePanelPreview);
    runTest('run event room choice affordability label', testRunEventRoomChoiceAffordabilityLabel);
    runTest('run event room HUD summary', testRunEventRoomHudSummary);
    runTest('run event room HUD lines', testRunEventRoomHudLines);
    runTest('run event room world label', testRunEventRoomWorldLabel);
    runTest('run event room prompt label', testRunEventRoomPromptLabel);
    runTest('run event encounter routing hooks', testRunEventEncounterRoutingHooks);
    runTest('crafting recipe checks', testCraftingRecipeChecks);
    runTest('craft recipe affordance', testCraftRecipeAffordance);
    runTest('craft recipe quick-slot preview', testCraftRecipeQuickSlotPreview);
    runTest('craft recipe row label', testCraftRecipeRowLabel);
    runTest('craft recipe batch receipt', testCraftRecipeBatchReceipt);
    runTest('craft recipe failure message', testCraftRecipeFailureMessage);
    runTest('blacksmith crafting affordance hooks', testBlacksmithCraftingAffordanceHooks);
    runTest('blacksmith upgrade message hooks', testBlacksmithUpgradeMessageHooks);
    runTest('consumable use resolution', testConsumableUseResolution);
    runTest('status HUD summary', testStatusHudSummary);
    runTest('boss HUD readability helpers', testBossHudReadability);
    runTest('boss mechanic diversity hooks', testBossMechanicDiversityHooks);
    runTest('lust phase 3 attack order', testLustPhase3AttackOrder);
    runTest('lust phase 3 rhythm summary', testLustPhase3RhythmSummary);
    runTest('lust phase 3 cadence trace', testLustPhase3CadenceTrace);
    runTest('lust phase 3 cadence review checklist', testLustPhase3CadenceReviewChecklist);
    runTest('lust phase 3 cadence artifact bundle', testLustPhase3CadenceArtifactBundle);
    runTest('e2e report phase-3 cadence markdown index', testE2eReportPhase3CadenceMarkdownIndex);
    runTest('e2e report phase-3 cadence missing artifacts summary', testE2eReportPhase3CadenceMissingArtifactsSummary);
    runTest('lust mirage dance hooks', testLustMirageDanceHooks);
    runTest('boss major attack breather hooks', testBossMajorAttackBreatherHooks);
    runTest('lust phase-local cooldown hooks', testLustPhaseLocalCooldownHooks);
    runTest('lust post-mirage breather hooks', testLustPostMirageBreatherHooks);
    runTest('lust shared major recovery hooks', testLustSharedMajorRecoveryHooks);
    runTest('lust eight breather chain hooks', testLustEightBreatherChainHooks);
    runTest('lust mirage dance executor hooks', testLustMirageDanceExecutorHooks);
    runTest('lust special recovery hooks', testLustSpecialRecoveryHooks);
    runTest('lust mirage recovery follow-up', testLustMirageRecoveryWindowFollowup);
    runTest('lust illusion recovery follow-up', testLustIllusionRecoveryWindowFollowup);
    runTest('lust illusion-mirage bridge follow-up', testLustIllusionMirageBridgeFollowup);
    runTest('lust mirage loopback bridge follow-up', testLustMirageLoopbackBridgeFollowup);
    runTest('keyboard aim state helper', testKeyboardAimState);
    runTest('aim direction label helper', testAimDirectionLabel);
    runTest('keyboard aim source hooks', testKeyboardAimSourceHooks);
    runTest('keyboard control readability hooks', testKeyboardControlReadabilityHooks);
    runTest('quick-slot auto-assign helper', testQuickSlotAutoAssignIndex);
    runTest('quick-slot auto-assign notice', testQuickSlotAutoAssignNotice);
    runTest('quick-slot auto-assign result', testQuickSlotAutoAssignResult);
    runTest('inventory tooltip clamp helper', testInventoryTooltipClampXHelper);
    runTest('measured text clamp helper', testMeasuredTextClampHelper);
    runTest('sidebar viewport policy helper', testHudSidebarViewportPolicy);
    runTest('run challenge sidebar lines', testRunChallengeSidebarLines);
    runTest('run challenge reward feedback', testRunChallengeRewardFeedback);
    runTest('run modifier heading badge layout', testRunModifierHeadingBadgeLayout);
    runTest('run-event prompt measurement hooks', testRunEventPromptMeasurementHooks);
    runTest('run-event world-label measurement hooks', testRunEventWorldLabelMeasurementHooks);
    runTest('fixed sidebar measurement hooks', testSidebarMeasurementHooks);
    runTest('README lust phase-local cooldowns', testReadmeLustPhaseLocalCooldowns);
    runTest('README lust post-mirage spacing', testReadmeLustPostMirageSpacing);
    runTest('README lust special recovery', testReadmeLustSpecialRecovery);
    runTest('README lust shared major recovery', testReadmeLustSharedMajorRecovery);
    runTest('README lust cadence report checklist', testReadmeLustCadenceReportChecklist);
    runTest('combat action HUD summary helper', testCombatActionHudSummary);
    runTest('combat action readiness helper', testCombatActionReadiness);
    runTest('combat action HUD segments helper', testCombatActionHudSegments);
    runTest('combat action HUD layout helper', testCombatActionHudLayout);
    runTest('stamina payoff pulse helper', testStaminaPayoffPulsePresentation);
    runTest('quick-slot item label helper', testQuickSlotItemLabel);
    runTest('keyboard HUD QoL hooks', testKeyboardHudQolHooks);
    runTest('combat discipline run-effect hooks', testCombatDisciplineRunEffectHooks);
    runTest('combat flow run-effect hooks', testCombatFlowRunEffectHooks);
    runTest('combo link run-effect hooks', testComboLinkRunEffectHooks);
    runTest('counterattack run-effect hooks', testCounterattackRunEffectHooks);
    runTest('weapon routing run-effect hooks', testWeaponRoutingRunEffectHooks);
    runTest('risk/reward run-effect hooks', testRiskRewardRunEffectHooks);
    runTest('status-routing run-effect hooks', testStatusRoutingRunEffectHooks);
    runTest('boss action HUD bottom-layout guard', testBossActionHudBottomLayoutGuard);
    runTest('README keyboard inventory loop', testReadmeKeyboardInventoryLoop);
    runTest('help overlay quick-slot loop', testHelpOverlayQuickSlotLoop);
    runTest('priority text stack layout helper', testPriorityTextStackLayoutHelper);
    runTest('player death freeze hook', testPlayerDeathFreezeHook);
    runTest('boss HUD layout and victory guards', testBossHudLayoutAndVictoryGuards);
    runTest('boss victory combat cleanup', testBossVictoryCombatCleanup);
    runTest('pause weapon info layout guards', testPauseWeaponInfoLayoutGuards);
    runTest('boss HUD measurement hooks', testBossHudMeasurementHooks);
    runTest('boss victory always transitions', testBossVictoryAlwaysTransitions);
    runTest('boss victory fail-safe independence', testBossVictoryFailSafeIndependence);
    runTest('boss defeat outer finally guard', testBossDefeatOuterFinallyGuard);
    runTest('boss victory sync-error fallback', testBossVictorySyncErrorFallback);
    runTest('boss victory watchdog loop', testBossVictoryWatchdogLoop);
    runTest('hub portal transition safety hooks', testHubPortalTransitionSafetyHooks);
    runTest('hub last-run summary runtime hooks', testHubLastRunSummaryRuntimeHooks);
    runTest('hub portal choice runtime hooks', testHubPortalChoiceRuntimeHooks);
    runTest('blacksmith prep recommendation runtime hooks', testBlacksmithPrepRecommendationRuntimeHooks);
    runTest('shop prep recommendation runtime hooks', testShopPrepRecommendationRuntimeHooks);
    runTest('inventory prep review runtime hooks', testInventoryPrepReviewRuntimeHooks);
    runTest('run-start target cue runtime hooks', testRunStartTargetCueRuntimeHooks);
    runTest('first-combat target cue runtime hooks', testFirstCombatTargetCueRuntimeHooks);
    runTest('corridor target bridge cue runtime hooks', testCorridorTargetBridgeCueRuntimeHooks);
    console.log('All regression checks passed.');
}

main();
