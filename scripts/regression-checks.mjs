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
    normalizeRunEventRoom,
    pickRunEventRoom,
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
    vm.runInContext(`${dataSource}\n;globalThis.__DATA__ = { WEAPONS, ITEMS };`, sandbox);
    return sandbox.__DATA__;
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
    const source = {
        inventory: { wrathEssence: 2, hpPotion: 3 },
        gold: 456,
        defeatedBosses: ['wrath', 'envy'],
        sinSeals: ['wrath'],
        weaponLevels: { ...DEFAULT_SAVE_DATA.weaponLevels, hammer: 2 },
        unlockedWeapons: ['sword', 'hammer'],
        selectedWeaponKey: 'hammer',
        runModifiers: ['frenziedFoes', 'fortuneWindfall'],
        runEventRoom: null,
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
        runEventRoom: null,
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
    assert.ok(Array.isArray(RUN_EVENT_ROOM_POOL) && RUN_EVENT_ROOM_POOL.length >= 3, 'event room pool should contain entries');

    const picked = pickRunEventRoom(() => 0);
    assert.equal(picked.key, RUN_EVENT_ROOM_POOL[0].key, 'deterministic event pick should select first entry');

    const byKey = getRunEventRoomByKey(picked.key);
    assert.ok(byKey && byKey.key === picked.key, 'event lookup by key should work');

    const normalized = normalizeRunEventRoom({ key: picked.key, discovered: true, resolved: false });
    assert.equal(normalized.key, picked.key, 'normalize should keep valid key');
    assert.equal(normalized.discovered, true, 'normalize should keep discovered flag');

    const invalid = normalizeRunEventRoom({ key: 'not-exist' });
    assert.equal(invalid, null, 'normalize should drop invalid event key');
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

function main() {
    runTest('weapon scaling monotonicity', testWeaponScalingMonotonicity);
    runTest('material-bound upgrade checks', testMaterialBoundUpgradeChecks);
    runTest('save/load integrity', testSaveLoadIntegrity);
    runTest('status effect logic', testStatusEffectLogic);
    runTest('run modifier selection/effects', testRunModifierSelectionAndEffects);
    runTest('run event room selection', testRunEventRoomSelection);
    runTest('crafting recipe checks', testCraftingRecipeChecks);
    console.log('All regression checks passed.');
}

main();
