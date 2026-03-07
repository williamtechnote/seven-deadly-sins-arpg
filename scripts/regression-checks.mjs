import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const core = require('../shared/game-core.js');

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
    buildRunEventRoomWorldLabelRouteLine,
    buildRunEventRoomWorldLabel,
    buildRunEventRoomPromptLabel,
    formatAimDirectionLabel,
    buildCombatActionHudSummary,
    buildQuickSlotItemLabel,
    getQuickSlotAutoAssignIndex,
    resolveKeyboardAimState,
    resolveConsumableUse,
    buildStatusHudSummary,
    advanceBossHpAfterimage,
    buildBossPhaseHudSummary,
    buildBossTelegraphHudSummary,
    buildBossStatusHighlightSummary,
    canCraftRecipe,
    applyCraftRecipe,
    serializeSaveData,
    deserializeSaveData,
    DEFAULT_SAVE_DATA
} = core;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
        /点击背包消耗品会自动装入快捷栏首个空位/,
        'help overlay should explain the backpack-click auto-fill rule'
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

function testCombatActionHudSummary() {
    assert.equal(typeof buildCombatActionHudSummary, 'function', 'combat action HUD helper should be exported');
    assert.equal(
        buildCombatActionHudSummary({ attackCooldownMs: 0, specialCooldownMs: 0 }),
        '普攻 U: 就绪  特攻 O: 就绪  闪避: Space',
        'combat action HUD helper should show both actions as ready when cooldowns are clear'
    );
    assert.equal(
        buildCombatActionHudSummary({ attackCooldownMs: 320, specialCooldownMs: 1080 }),
        '普攻 U: 0.3s  特攻 O: 1.1s  闪避: Space',
        'combat action HUD helper should format short cooldown seconds for unreadied actions'
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
        /this\.actionText = this\.add\.text\(/,
        'HUD should allocate a dedicated combat-action cooldown line'
    );
    assert.match(
        source,
        /this\.actionText\.setText\(buildCombatActionHudSummary\(\{\s*attackCooldownMs:\s*player\.attackCooldown,\s*specialCooldownMs:\s*player\.specialCooldown\s*\}\)\);/,
        'HUD should derive the keyboard combat loop text from the shared combat-action helper'
    );
    assert.match(
        source,
        /const slot = getQuickSlotAutoAssignIndex\(GameState\.quickSlots\);/,
        'inventory consumable clicks should derive the destination slot from the shared auto-assign helper'
    );
    assert.match(
        source,
        /slot\.itemText\.setText\(buildQuickSlotItemLabel\(itemKey,\s*itemCount\)\);/,
        'HUD quick slots should render compact helper-driven labels with counts'
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
        /Tab -> 点击背包消耗品 -> 1-4 使用/,
        'README should document the keyboard inventory-to-quick-slot loop'
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
    runTest('keyboard aim state helper', testKeyboardAimState);
    runTest('aim direction label helper', testAimDirectionLabel);
    runTest('keyboard aim source hooks', testKeyboardAimSourceHooks);
    runTest('keyboard control readability hooks', testKeyboardControlReadabilityHooks);
    runTest('quick-slot auto-assign helper', testQuickSlotAutoAssignIndex);
    runTest('combat action HUD summary helper', testCombatActionHudSummary);
    runTest('quick-slot item label helper', testQuickSlotItemLabel);
    runTest('keyboard HUD QoL hooks', testKeyboardHudQolHooks);
    runTest('README keyboard inventory loop', testReadmeKeyboardInventoryLoop);
    runTest('player death freeze hook', testPlayerDeathFreezeHook);
    console.log('All regression checks passed.');
}

main();
