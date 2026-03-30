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
    buildQuickSlotItemLabel,
    buildQuickSlotAutoAssignNotice,
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
    assert.equal(applied.nextState.gold, state.gold - levelOneCost.gold, 'gold should be deducted');
    assert.equal(applied.nextState.inventory.wrathEssence, state.inventory.wrathEssence - levelOneCost.essence, 'bound material should be deducted');
    assert.equal(applied.nextState.inventory.greedEssence, state.inventory.greedEssence, 'other materials should remain untouched');
    assert.equal(applied.nextState.weaponLevels.hammer, 2, 'weapon level should increase');
}

function testSaveLoadIntegrity() {
    const resolvedEventRoom = {
        key: 'gamblersShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'highStakeWager',
        selectedChoiceLabel: '豪赌',
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
            resolutionText: '失去 30 生命，获得 120 金币'
        },
        quickSlots: ['hpPotion', null, 'staminaPotion', null]
    }, 'serialized+deserialized state should stay stable');

    const corrupted = deserializeSaveData('this is not json');
    assert.deepEqual(corrupted, DEFAULT_SAVE_DATA, 'corrupted save should fallback to defaults');
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
        playerMaxHp: 120
    }, {
        key: 'healingFountain',
        discovered: true,
        resolved: false
    }, 'purifyingSip');
    assert.equal(fountainSettlement.ok, true, 'healing fountain choice should resolve');
    assert.equal(fountainSettlement.nextState.playerHp, 84, 'purifying sip should restore 30% max HP');
    assert.equal(fountainSettlement.nextState.cleanseNegativeStatuses, true, 'purifying sip should request a cleanse');
    assert.match(fountainSettlement.eventRoom.resolutionText, /净化/, 'healing fountain summary should mention the cleanse');

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
    const prayerEffects = buildRunEventRoomEffects(prayerSettlement.eventRoom);
    assert.equal(prayerEffects.playerSpecialCooldownMultiplier, 0.78, 'tempo prayer should shorten special cooldowns');
    assert.match(prayerSettlement.eventRoom.resolutionText, /冷却/, 'prayer shrine summary should mention the cooldown buff');
}

function testRunEventRoomChoiceHelpers() {
    assert.equal(typeof buildRunEventRoomChoicePreview, 'function', 'event room choice preview helper should be exported');
    assert.equal(typeof getRunEventRoomChoiceFailureMessage, 'function', 'event room choice failure helper should be exported');

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    assert.equal(
        buildRunEventRoomChoicePreview(healingChoice),
        '净泉啜饮: 生命+30%, 净化',
        'choice preview helper should reuse the compact healing route copy'
    );

    const tradeChoice = getRunEventRoomChoices('supplyCache').find(choice => choice.key === 'fieldTonic');
    assert.equal(
        buildRunEventRoomChoicePreview(tradeChoice),
        '战地净化包: 金币-45, 净化药剂x1',
        'choice preview helper should reuse the compact trade route copy'
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

function testRunEventRoomChoicePanelPreview() {
    assert.equal(typeof buildRunEventRoomChoicePanelPreview, 'function', 'event room choice panel preview helper should be exported');

    const healingChoice = getRunEventRoomChoices('healingFountain').find(choice => choice.key === 'purifyingSip');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(healingChoice, {
            playerHp: 84,
            playerMaxHp: 120
        }),
        '净泉啜饮: 生命+30%, 净化 · 预估生命+36',
        'panel preview should append projected healing when the route restores HP'
    );

    const gambleChoice = getRunEventRoomChoices('gamblersShrine').find(choice => choice.key === 'highStakeWager');
    assert.equal(
        buildRunEventRoomChoicePanelPreview(gambleChoice, {
            playerHp: 100,
            playerMaxHp: 120
        }),
        '豪赌: 生命-30%, 金币+120 · 预估生命-30',
        'panel preview should append projected HP loss when the route trades HP for gold'
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
            '战地净化包: 金币-45, 净化药剂x1',
            '狂战补给: 金币-60, 狂战油x1'
        ],
        'HUD summary should split unresolved routes into one compact line per choice'
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
        ['效果: 迅击祷言'],
        'resolved blessing summary should switch to an effect-specific chosen-route prefix'
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
        ['效果: 猩红锋契'],
        'resolved risk-buff summary should use the shared effect prefix for the chosen route'
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
        ['交易: 豪赌'],
        'resolved trade summary should switch to a trade-specific chosen-route prefix'
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
        resolutionText: '恢复 36 生命，并净化负面状态'
    });
    assert.deepEqual(
        resolvedHealingSummary.routeLines,
        ['治疗: 净泉啜饮'],
        'resolved healing summary should switch to a healing-specific chosen-route prefix'
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
        ['治疗: 未知选项'],
        'resolved healing summary should keep the healing prefix and explicit unknown-option fallback when both stored fragments are missing'
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
        ['交易: 豪赌'],
        'resolved trade summary should keep the trade prefix when settlement text is missing'
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
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownSummary.routeLines,
        ['已选: 封印索引'],
        'resolved unknown-type summary should fall back to the persisted chosen label with the generic 已选 prefix'
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
            '战地净化包: 金币-45, 净化药剂x1',
            '狂战补给: 金币-60, 狂战油x1'
        ],
        'unresolved event rooms should keep one line per available route'
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
            '效果: 迅击祷言 · 特攻冷却-22%'
        ],
        'resolved blessing event rooms should merge the chosen route and compact settlement into one line with an effect prefix'
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
            '交易: 豪赌 · 生命-30, 金币+120'
        ],
        'resolved trade event rooms should merge the chosen label and actual settlement delta with a trade prefix'
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
            '交易: 豪赌 · 结算待同步'
        ],
        'resolved trade event rooms should keep a stable merged fallback line when settlement text is missing'
    );

    const resolvedHealingLines = buildRunEventRoomHudLines({
        key: 'healingFountain',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'purifyingSip',
        selectedChoiceLabel: '净泉啜饮',
        resolutionText: '恢复 36 生命，并净化负面状态'
    });
    assert.deepEqual(
        resolvedHealingLines,
        [
            '事件房: 疗愈泉眼',
            '治疗 · 已触发',
            '治疗: 净泉啜饮 · 生命+36, 净化'
        ],
        'resolved healing event rooms should merge the chosen label and actual settlement delta with a healing prefix'
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
            '治疗: 未知选项 · 结算待同步'
        ],
        'resolved healing event rooms should keep a stable merged fallback line when both stored fragments are missing'
    );

    const resolvedUnknownLines = buildRunEventRoomHudLines({
        key: 'mysteryArchive',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'retiredChoice',
        selectedChoiceLabel: '封印索引',
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.deepEqual(
        resolvedUnknownLines,
        [
            '事件房: 谜藏书库',
            '未知 · 已触发',
            '已选: 封印索引 · 金币+88'
        ],
        'resolved unknown-type event rooms should keep the generic 已选 prefix and merge the compact settlement text'
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

    const resolvedBlessingLabel = buildRunEventRoomWorldLabel({
        key: 'prayerShrine',
        discovered: true,
        resolved: true,
        selectedChoiceKey: 'tempoPrayer',
        selectedChoiceLabel: '迅击祷言',
        resolutionText: '特攻冷却 -22%'
    });
    assert.equal(
        resolvedBlessingLabel,
        '祈愿圣坛 · 效果: 迅击祷言',
        'resolved altar labels should append the compact chosen-route summary for known room types'
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
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownRouteLine,
        '已选: 封印索引',
        'resolved unknown-type altar labels should keep the generic 已选 prefix when the persisted route label exists'
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
        resolutionText: '金币 +88'
    }, unknownTypePool);
    assert.equal(
        resolvedUnknownLabel,
        '谜藏书库 · 已选: 封印索引',
        'resolved unknown-type altar labels should append the persisted route label with the generic 已选 prefix'
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
        '按F效果',
        'blessing event rooms should show the effect short tag in the shrine prompt'
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

    const noMaterial = canCraftRecipe({
        gold: 120,
        inventory: {
            envyEssence: 1
        }
    }, 'cleanseTonic');
    assert.equal(noMaterial.ok, false, 'craft should fail without complete materials');
    assert.equal(noMaterial.reason, 'material');
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
    assert.equal(finalCountdownHeadInnerCoreAlphaTrimTelegraphSummary.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed, true, 'telegraph summary should also narrow the residual outer late glow during the final sub-millisecond trim beat');

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
            sharedRecoveryLabel: 'shared recovery≈10.2s'
        },
        'lust cadence artifact bundle should preserve the shared-recovery snapshot plus the readable recovery label'
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
            sharedRecoveryLabel: 'shared recovery≈10.2s'
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
        /- Phase 3 汇总: match=1 \| drift=1 \| drift checkpoints: `混乱逆转` \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should surface a phase-3 summary header with match\/drift totals, drifting checkpoint names, and direct drift evidence anchors'
    );
    assert.match(
        output,
        /- Drift-only mini checklist:\n  - 2\. HUD telegraph 魅影连舞 -> shared recovery≈10\.2s -> 28-step dash\/charmBolt loopback -> 混乱逆转 \| 反制: 观察真身换位节奏，留翻滚躲最后逆转波 \| recovery 快照: `sharedRecoveryRemainingMs=10200 · breatherRemaining=8 · expectedReturnLabel=幻影风暴` \| 回切校验: drift checkpoint=`混乱逆转` recovery=`幻影风暴` \| review checkpoint #2 \| loopback checkpoint alias: `mirageDance->loopback` \| dash\/charmBolt count: `14\/14 \(28 total\)` \| bridgeTimeline index: `29-56 \(29:dash -> 56:charmBolt\)` \| counterWindowMs: `1700ms` \| counterWindowRatio: `130\.8%` \| counterWindowDeltaMs: `\+400ms` \| counterWindowEntryCue: `telegraph开头 0ms 开放` \| counterWindowSpanCue: `telegraph开头 -> telegraph后 \+400ms` \| counterWindowTailOffsetMs: `\+400ms after telegraph` \| counterWindowTailPhase: `telegraph后收束` \| counterWindowClosureCue: `telegraph后 \+400ms 收尾` \| counterWindowCoverageCue: `telegraph全程 \+ 后400ms` \| telegraphDurationMs: `1300ms` \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\)/,
        'e2e report should add a drift-only mini checklist that relists each drifting checkpoint line with inline recovery/drift notes, a review checkpoint index, a bridge/loopback alias note, a dash/charmBolt count note, a bridgeTimeline span note, counterWindowMs, counterWindowRatio, counterWindowDeltaMs, counterWindowEntryCue, counterWindowSpanCue, counterWindowTailOffsetMs, counterWindowTailPhase, counterWindowClosureCue, counterWindowCoverageCue and telegraphDurationMs short notes, and direct artifact anchors'
    );
    assert.match(
        output,
        /1\. HUD telegraph 混乱逆转 -> shared recovery≈10\.2s -> 13-step dash\/charmBolt bridge -> 幻影风暴 \| 反制: 停止冲刺，短步修正方向 \| 回切目标: `幻影风暴` \| recovery 快照: `sharedRecoveryRemainingMs=10200 · breatherRemaining=8 · expectedReturnLabel=幻影风暴` \| 回切校验: match \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should inline cadence checkpoint lines with recovery snapshot notes, a match note, and direct artifact anchors'
    );
    assert.match(
        output,
        /2\. HUD telegraph 魅影连舞 -> shared recovery≈10\.2s -> 28-step dash\/charmBolt loopback -> 混乱逆转 \| 反制: 观察真身换位节奏，留翻滚躲最后逆转波 \| 回切目标: `混乱逆转` \| recovery 快照: `sharedRecoveryRemainingMs=10200 · breatherRemaining=8 · expectedReturnLabel=幻影风暴` \| 回切校验: drift checkpoint=`混乱逆转` recovery=`幻影风暴` \| 证据: \[review]\(artifacts\/e2e\/lust-phase3-cadence-review\/cadence-review\.json\) \[checkpoints]\(artifacts\/e2e\/lust-phase3-cadence-review\/phase3-checkpoints\.txt\) \[recovery]\(artifacts\/e2e\/lust-phase3-cadence-review\/shared-recovery-snapshot\.json\) \[telegraph]\(artifacts\/e2e\/lust-phase3-cadence-review\/telegraph-hud\.png\)/,
        'e2e report should flag when a checkpoint expected-return label drifts from the shared recovery snapshot'
    );
    assert.match(
        output,
        /shared-recovery-snapshot\.json/,
        'e2e report should index the shared recovery snapshot artifact path'
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
        /const runEffects = GameState\.runEffects \|\| DEFAULT_RUN_EFFECTS;[\s\S]*?const staminaRegenPerSecond = GAME_CONFIG\.PLAYER\.staminaRegen \* \(runEffects\.playerStaminaRegenMultiplier \|\| 1\);[\s\S]*?const actionHudState = \{[\s\S]*?isDodging:\s*player\.isDodging,[\s\S]*?dodgeLockoutMs:\s*player\.dodgeLockoutMsRemaining,[\s\S]*?dodgePostLockoutCooldownMs:\s*GAME_CONFIG\.PLAYER\.dodgeCooldown,[\s\S]*?attackCooldownMs:\s*player\.attackCooldown,[\s\S]*?specialCooldownMs:\s*player\.specialCooldown,[\s\S]*?dodgeCooldownMs:\s*player\.dodgeCooldownTimer,[\s\S]*?stamina:\s*player\.stamina,[\s\S]*?staminaRegenPerSecond,[\s\S]*?attackStaminaCost:\s*weapon\s*\?\s*weapon\.staminaCost\s*:\s*0,[\s\S]*?specialStaminaCost:\s*weapon\s*\?\s*weapon\.specialStaminaCost\s*:\s*0,[\s\S]*?dodgeStaminaCost:\s*GAME_CONFIG\.PLAYER\.dodgeStaminaCost[\s\S]*?\};[\s\S]*?const actionHudSegments = buildCombatActionHudSegments\(actionHudState\);/,
        'HUD should derive dodge lockout, cooldown, stamina gaps, and stamina-recovery ETA from the shared combat-action helper'
    );
    assert.match(
        source,
        /this\.actionTextReadyFlashUntil = \{\s*attack:\s*0,\s*special:\s*0,\s*dodge:\s*0\s*\};[\s\S]*?this\._lastCombatActionReadiness = null;/,
        'HUD should initialize per-action readiness flash state alongside the combat action text'
    );
    assert.match(
        source,
        /const actionHudState = \{[\s\S]*?isDodging:\s*player\.isDodging,[\s\S]*?dodgeStaminaCost:\s*GAME_CONFIG\.PLAYER\.dodgeStaminaCost[\s\S]*?\};[\s\S]*?const actionHudSegments = buildCombatActionHudSegments\(actionHudState\);[\s\S]*?const actionHudReadiness = buildCombatActionReadiness\(actionHudState\);[\s\S]*?const previousActionReadiness = this\._lastCombatActionReadiness;[\s\S]*?if \(previousActionReadiness\) \{[\s\S]*?Object\.keys\(actionHudReadiness\)\.forEach\(key => \{[\s\S]*?this\.actionTextReadyFlashUntil\[key\] = this\.time\.now \+ 220;[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?actionHudSegments\.forEach\(segment => \{[\s\S]*?const actionHighlightActive = this\.actionTextReadyFlashUntil\[segment\.key\] > this\.time\.now;[\s\S]*?actionTextNode\.setStyle\(\{ fill: actionHighlightActive \? '#fff4b3' : '#cfd8e6' \}\);[\s\S]*?actionTextNode\.setText\(segment\.text\);/,
        'HUD should derive per-action readiness flashes from the shared combat-action readiness helper when individual actions newly become ready'
    );
    assert.match(
        source,
        /const bottomPad = Number\.isFinite\(layout\.bottomPad\) && layout\.bottomPad >= 0 \? layout\.bottomPad : layout\.pad;[\s\S]*?const actionLayout = buildCombatActionHudLayout\([\s\S]*?startX:\s*bottomPad,[\s\S]*?maxWidth:\s*Math\.max\(0,\s*this\.quickSlots\[0\]\.box\.x - bottomPad - 12\),[\s\S]*?\);[\s\S]*?const actionClusterLift = Math\.max\(0,\s*actionLayout\.rowCount - 1\) \* 22;[\s\S]*?this\.aimText\.setPosition\(bottomPad,\s*this\.cameras\.main\.height - 80 - actionClusterLift\);[\s\S]*?this\.weaponText\.setPosition\(bottomPad,\s*this\.cameras\.main\.height - 58 - actionClusterLift\);[\s\S]*?actionLayout\.placements\.forEach\(placement => \{[\s\S]*?actionTextNode\.setPosition\(placement\.x,\s*this\.cameras\.main\.height - 36 - actionClusterLift \+ placement\.y\);[\s\S]*?\}\);/,
        'HUD should wrap long action labels inside the reserved bottom-left lane and keep that lane anchored to a stable bottom pad'
    );
    assert.match(
        source,
        /const slot = getQuickSlotAutoAssignIndex\(GameState\.quickSlots\);/,
        'inventory consumable clicks should derive the destination slot from the shared auto-assign helper'
    );
    assert.match(
        source,
        /const didOverwrite = !GameState\.quickSlots\.some\(slotKey => !slotKey\);/,
        'inventory consumable clicks should detect when the quick bar is already full'
    );
    assert.match(
        source,
        /this\.autoAssignMessageText = this\.add\.text\(/,
        'InventoryScene should allocate a transient text node for quick-slot auto-assign feedback'
    );
    assert.match(
        source,
        /const replacedItemKey = didOverwrite \? GameState\.quickSlots\[slot\] : null;/,
        'inventory consumable clicks should capture the replaced quick-slot occupant before overwriting it'
    );
    assert.match(
        source,
        /this\._showAutoAssignMessage\(buildQuickSlotAutoAssignNotice\(slot,\s*\{[\s\S]*?didOverwrite,[\s\S]*?assignedItemKey:\s*key,[\s\S]*?replacedItemKey[\s\S]*?\}\)\);/,
        'inventory consumable clicks should derive overwrite-aware feedback copy with both the assigned and replaced item labels from the shared auto-assign notice helper'
    );
    assert.match(
        source,
        /const assignedItemName = item && item\.name;/,
        'inventory consumable clicks should capture the assigned item display name for derived fallback labels'
    );
    assert.match(
        source,
        /const replacedItemName = replacedItemKey && ITEMS\[replacedItemKey\][\s\S]*?ITEMS\[replacedItemKey\]\.name[\s\S]*?: '';/,
        'inventory consumable clicks should capture the replaced item display name for derived overwrite fallback labels'
    );
    assert.match(
        source,
        /assignedItemName,[\s\S]*?replacedItemKey,[\s\S]*?replacedItemName/,
        'inventory consumable clicks should pass both item names into the shared quick-slot notice helper'
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
        /this\.bossTelegraphCountdownHeadMarker\.clear\(\);[\s\S]*?if \(telegraphHud\.currentCountdownHeadMarkerVisible\) \{[\s\S]*?const countdownHeadMarkerX = telegraphRect\.x \+ telegraphRect\.w \* telegraphHud\.currentCountdownHeadMarkerRatio;[\s\S]*?const countdownHeadShellY = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.y \+ 2\s*:\s*telegraphRect\.y \+ 1;[\s\S]*?const countdownHeadShellHeight = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.h - 4\s*:\s*telegraphRect\.h - 2;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillRoundedRect\(\s*(?:countdownHeadMarkerX - 1|countdownHeadShellX),\s*countdownHeadShellY,\s*(?:2|countdownHeadShellWidth),\s*countdownHeadShellHeight,\s*1\s*\);/,
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
        /lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? countdownHeadMarkerX - 4 : countdownHeadMarkerX - 5;[\s\S]*?lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? countdownHeadMarkerX - 3 : lateGlowOuterX;[\s\S]*?lateGlowOuterWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? 6 : telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? 8 : 10;[\s\S]*?lateGlowInnerX = telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? countdownHeadMarkerX - 2 : countdownHeadMarkerX - 3;[\s\S]*?lateGlowInnerWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? 4 : 6;/,
        'boss telegraph rendering should contract the weaker late head-marker glow around the endpoint during the final trim beat'
    );
    assert.match(
        source,
        /const lateGlowOuterAlpha = telegraphHud\.currentCountdownHeadMarkerLateGlowContained \? 0\.05 : 0\.08;[\s\S]*?lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowContained \? Math\.max\(telegraphRect\.x \+ 1,\s*lateGlowOuterX\) : lateGlowOuterX;[\s\S]*?this\.bossTelegraphCountdownHeadFlash\.fillStyle\(0xFFE7AE,\s*lateGlowOuterAlpha\);/,
        'boss telegraph rendering should lower and contain the weaker late head-marker outer glow during the final 40ms tail beat'
    );
    assert.match(
        source,
        /currentCountdownHeadMarkerInnerCoreFocused[\s\S]*?fillStyle\(0xFFF2C8,\s*(?:1|countdownHeadInnerCoreAlpha)\)[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 0\.25|countdownHeadInnerCoreX),\s*(?:telegraphRect\.y \+ 2|countdownHeadInnerCoreY),\s*(?:0\.5|countdownHeadInnerCoreWidth),\s*(?:telegraphRect\.h - 4|countdownHeadInnerCoreHeight),\s*1\s*\)/,
        'boss telegraph rendering should narrow and brighten the countdown-head inner core during the final tail-focus beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreY = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.y \+ 3\s*:\s*telegraphRect\.y \+ 2;[\s\S]*?const countdownHeadInnerCoreHeight = telegraphHud\.currentCountdownHeadMarkerInnerCoreHeightTrimmed\s*\?\s*telegraphRect\.h - 6\s*:\s*telegraphRect\.h - 4;[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 0\.25|countdownHeadInnerCoreX),\s*countdownHeadInnerCoreY,\s*(?:0\.5|countdownHeadInnerCoreWidth),\s*countdownHeadInnerCoreHeight,\s*1\s*\)/,
        'boss telegraph rendering should shorten the countdown-head inner core height during the final 20ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellY = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.y \+ 2\s*:\s*telegraphRect\.y \+ 1;[\s\S]*?const countdownHeadShellHeight = telegraphHud\.currentCountdownHeadMarkerShellCapTrimmed\s*\?\s*telegraphRect\.h - 4\s*:\s*telegraphRect\.h - 2;[\s\S]*?fillRoundedRect\(\s*(?:countdownHeadMarkerX - 1|countdownHeadShellX),\s*countdownHeadShellY,\s*(?:2|countdownHeadShellWidth),\s*countdownHeadShellHeight,\s*1\s*\)/,
        'boss telegraph rendering should shorten the countdown-head shell caps during the final 10ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellAlpha = telegraphHud\.currentCountdownHeadMarkerShellAlphaMuted\s*\?\s*0\.76\s*:\s*0\.94;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\(0xFFE7AE,\s*countdownHeadShellAlpha\);/,
        'boss telegraph rendering should lower the countdown-head shell alpha during the final 5ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreAlpha = telegraphHud\.currentCountdownHeadMarkerInnerCoreAlphaMuted\s*\?\s*0\.82\s*:\s*1;[\s\S]*?this\.bossTelegraphCountdownHeadMarker\.fillStyle\(0xFFF2C8,\s*countdownHeadInnerCoreAlpha\);/,
        'boss telegraph rendering should lower the countdown-head inner core alpha during the final 2ms tail beat'
    );
    assert.match(
        source,
        /const countdownHeadShellX = telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.75\s*:\s*countdownHeadMarkerX - 1;[\s\S]*?const countdownHeadShellWidth = telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*1\.5\s*:\s*2;[\s\S]*?fillRoundedRect\(\s*countdownHeadShellX,\s*countdownHeadShellY,\s*countdownHeadShellWidth,\s*countdownHeadShellHeight,\s*1\s*\)/,
        'boss telegraph rendering should narrow the countdown-head shell during the final sub-millisecond width-trim beat'
    );
    assert.match(
        source,
        /const countdownHeadInnerCoreX = telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*countdownHeadMarkerX - 0\.125\s*:\s*countdownHeadMarkerX - 0\.25;[\s\S]*?const countdownHeadInnerCoreWidth = telegraphHud\.currentCountdownHeadMarkerFinalWidthTrimmed\s*\?\s*0\.25\s*:\s*0\.5;[\s\S]*?fillRoundedRect\(\s*countdownHeadInnerCoreX,\s*countdownHeadInnerCoreY,\s*countdownHeadInnerCoreWidth,\s*countdownHeadInnerCoreHeight,\s*1\s*\)/,
        'boss telegraph rendering should narrow the countdown-head inner core during the final sub-millisecond width-trim beat'
    );
    assert.match(
        source,
        /lateGlowOuterX = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? countdownHeadMarkerX - 3 : lateGlowOuterX;[\s\S]*?const lateGlowOuterWidth = telegraphHud\.currentCountdownHeadMarkerLateGlowFinalWidthTrimmed \? 6 : telegraphHud\.currentCountdownHeadMarkerLateGlowTrimmed \? 8 : 10;/,
        'boss telegraph rendering should narrow the residual outer late glow during the final sub-millisecond width-trim beat'
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

function main() {
    runTest('weapon scaling monotonicity', testWeaponScalingMonotonicity);
    runTest('sword early reach baseline', testSwordEarlyReachBaseline);
    runTest('normal enemy pressure baseline', testNormalEnemyPressureBaseline);
    runTest('sword opening balance window', testSwordOpeningBalanceWindow);
    runTest('material-bound upgrade checks', testMaterialBoundUpgradeChecks);
    runTest('save/load integrity', testSaveLoadIntegrity);
    runTest('status effect logic', testStatusEffectLogic);
    runTest('run modifier selection/effects', testRunModifierSelectionAndEffects);
    runTest('run event room selection', testRunEventRoomSelection);
    runTest('run event room choice helpers', testRunEventRoomChoiceHelpers);
    runTest('run event room choice panel preview', testRunEventRoomChoicePanelPreview);
    runTest('run event room choice affordability label', testRunEventRoomChoiceAffordabilityLabel);
    runTest('run event room HUD summary', testRunEventRoomHudSummary);
    runTest('run event room HUD lines', testRunEventRoomHudLines);
    runTest('run event room world label', testRunEventRoomWorldLabel);
    runTest('run event room prompt label', testRunEventRoomPromptLabel);
    runTest('crafting recipe checks', testCraftingRecipeChecks);
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
    runTest('quick-slot item label helper', testQuickSlotItemLabel);
    runTest('keyboard HUD QoL hooks', testKeyboardHudQolHooks);
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
    console.log('All regression checks passed.');
}

main();
