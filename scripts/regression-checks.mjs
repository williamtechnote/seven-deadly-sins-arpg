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
    getScaledWeaponStats,
    getUpgradeCostForLevel,
    canUpgradeWeapon,
    applyWeaponUpgrade,
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
        quickSlots: ['hpPotion', null, 'staminaPotion', null]
    }, 'serialized+deserialized state should stay stable');

    const corrupted = deserializeSaveData('this is not json');
    assert.deepEqual(corrupted, DEFAULT_SAVE_DATA, 'corrupted save should fallback to defaults');
}

function main() {
    runTest('weapon scaling monotonicity', testWeaponScalingMonotonicity);
    runTest('material-bound upgrade checks', testMaterialBoundUpgradeChecks);
    runTest('save/load integrity', testSaveLoadIntegrity);
    console.log('All regression checks passed.');
}

main();
