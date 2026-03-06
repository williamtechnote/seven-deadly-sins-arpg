(function initGameCore(root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.GameCore = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createGameCore() {
    const WEAPON_SCALING = {
        damagePerLevel: 0.22,
        attackSpeedReductionPerLevel: 0.08,
        specialCooldownReductionPerLevel: 0.06,
        staminaReductionPerLevel: 0.06,
        specialStaminaReductionPerLevel: 0.06,
        minAttackSpeed: 120,
        minSpecialCooldown: 900,
        minStaminaCost: 2,
        minSpecialStaminaCost: 8
    };

    const DEFAULT_WEAPON_LEVELS = {
        sword: 1,
        dualBlades: 1,
        hammer: 1,
        bow: 1,
        staff: 1
    };

    const WEAPON_TO_MATERIAL = {
        sword: 'greedEssence',
        dualBlades: 'prideEssence',
        hammer: 'wrathEssence',
        bow: 'envyEssence',
        staff: 'slothEssence'
    };

    const DEFAULT_SAVE_DATA = {
        inventory: {},
        gold: 0,
        defeatedBosses: [],
        sinSeals: [],
        weaponLevels: { ...DEFAULT_WEAPON_LEVELS },
        unlockedWeapons: ['sword'],
        quickSlots: [null, null, null, null]
    };

    function createDefaultSaveData() {
        return {
            inventory: {},
            gold: DEFAULT_SAVE_DATA.gold,
            defeatedBosses: [...DEFAULT_SAVE_DATA.defeatedBosses],
            sinSeals: [...DEFAULT_SAVE_DATA.sinSeals],
            weaponLevels: { ...DEFAULT_WEAPON_LEVELS },
            unlockedWeapons: [...DEFAULT_SAVE_DATA.unlockedWeapons],
            quickSlots: [...DEFAULT_SAVE_DATA.quickSlots]
        };
    }

    const AUDIO_SETTINGS_STORAGE_KEY = 'sevenSinsAudioSettings';
    const DEFAULT_AUDIO_SETTINGS = {
        muted: false,
        volume: 100
    };

    function clampInt(value, min, max, fallback) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const rounded = Math.round(n);
        return Math.min(max, Math.max(min, rounded));
    }

    function sanitizeStringArray(value) {
        if (!Array.isArray(value)) return [];
        return value.filter(v => typeof v === 'string');
    }

    function normalizeInventory(inventory) {
        if (!inventory || typeof inventory !== 'object') return {};
        const out = {};
        Object.entries(inventory).forEach(([key, value]) => {
            const count = clampInt(value, 0, Number.MAX_SAFE_INTEGER, 0);
            if (count > 0) out[key] = count;
        });
        return out;
    }

    function normalizeWeaponLevels(levels) {
        const out = { ...DEFAULT_WEAPON_LEVELS };
        if (levels && typeof levels === 'object') {
            Object.keys(DEFAULT_WEAPON_LEVELS).forEach((weaponKey) => {
                out[weaponKey] = clampInt(levels[weaponKey], 1, 99, DEFAULT_WEAPON_LEVELS[weaponKey]);
            });
        }
        return out;
    }

    function normalizeQuickSlots(quickSlots) {
        const out = [null, null, null, null];
        if (!Array.isArray(quickSlots)) return out;
        for (let i = 0; i < out.length; i++) {
            const item = quickSlots[i];
            out[i] = typeof item === 'string' ? item : null;
        }
        return out;
    }

    function normalizeSaveData(data) {
        if (!data || typeof data !== 'object') return createDefaultSaveData();
        const unlocked = sanitizeStringArray(data.unlockedWeapons);
        return {
            inventory: normalizeInventory(data.inventory),
            gold: clampInt(data.gold, 0, Number.MAX_SAFE_INTEGER, 0),
            defeatedBosses: sanitizeStringArray(data.defeatedBosses),
            sinSeals: sanitizeStringArray(data.sinSeals),
            weaponLevels: normalizeWeaponLevels(data.weaponLevels),
            unlockedWeapons: unlocked.length > 0
                ? unlocked
                : ['sword'],
            quickSlots: normalizeQuickSlots(data.quickSlots)
        };
    }

    function serializeSaveData(data) {
        return JSON.stringify(normalizeSaveData(data));
    }

    function deserializeSaveData(raw) {
        if (typeof raw !== 'string' || !raw.trim()) {
            return createDefaultSaveData();
        }
        try {
            const parsed = JSON.parse(raw);
            return normalizeSaveData(parsed);
        } catch (e) {
            return createDefaultSaveData();
        }
    }

    function normalizeAudioSettings(raw) {
        const src = raw && typeof raw === 'object' ? raw : {};
        return {
            muted: !!src.muted,
            volume: clampInt(src.volume, 0, 100, DEFAULT_AUDIO_SETTINGS.volume)
        };
    }

    function audioSettingsToGain(settings, maxGain) {
        const safe = normalizeAudioSettings(settings);
        const cap = Number.isFinite(maxGain) ? maxGain : 0.2;
        if (safe.muted) return 0;
        return (safe.volume / 100) * cap;
    }

    function getWeaponLevel(weaponLevels, weaponKey) {
        const levels = normalizeWeaponLevels(weaponLevels);
        return levels[weaponKey] || 1;
    }

    function getScaledWeaponStats(weapons, weaponKey, level, scalingOverride) {
        const base = weapons && weapons[weaponKey];
        if (!base) return null;

        const scaling = scalingOverride || WEAPON_SCALING;
        const actualLevel = clampInt(level, 1, 99, 1);
        const lv = actualLevel - 1;

        const scaled = { ...base, key: weaponKey, level: actualLevel };
        scaled.damage = Math.round(base.damage * (1 + scaling.damagePerLevel * lv));
        scaled.attackSpeed = Math.max(
            scaling.minAttackSpeed,
            Math.round(base.attackSpeed * Math.pow(1 - scaling.attackSpeedReductionPerLevel, lv))
        );
        scaled.specialCooldown = Math.max(
            scaling.minSpecialCooldown,
            Math.round(base.specialCooldown * Math.pow(1 - scaling.specialCooldownReductionPerLevel, lv))
        );
        scaled.staminaCost = Math.max(
            scaling.minStaminaCost,
            Math.round(base.staminaCost * Math.pow(1 - scaling.staminaReductionPerLevel, lv))
        );
        scaled.specialStaminaCost = Math.max(
            scaling.minSpecialStaminaCost,
            Math.round(base.specialStaminaCost * Math.pow(1 - scaling.specialStaminaReductionPerLevel, lv))
        );

        return scaled;
    }

    function getUpgradeCostForLevel(level) {
        const safeLevel = clampInt(level, 1, 99, 1);
        if (safeLevel === 1) return { gold: 100, essence: 1 };
        if (safeLevel === 2) return { gold: 250, essence: 2 };
        return null;
    }

    function getRequiredMaterialForWeapon(weaponKey) {
        return WEAPON_TO_MATERIAL[weaponKey] || null;
    }

    function canUpgradeWeapon(state, weaponKey) {
        const safeState = state && typeof state === 'object' ? state : {};
        const level = getWeaponLevel(safeState.weaponLevels, weaponKey);
        const cost = getUpgradeCostForLevel(level);
        const requiredMaterialKey = getRequiredMaterialForWeapon(weaponKey);

        if (!requiredMaterialKey) {
            return { ok: false, reason: 'material_binding_missing', level, cost, requiredMaterialKey };
        }
        if (!cost) {
            return { ok: false, reason: 'max_level', level, cost, requiredMaterialKey };
        }

        const gold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        if (gold < cost.gold) {
            return { ok: false, reason: 'gold', level, cost, requiredMaterialKey };
        }

        const inventory = normalizeInventory(safeState.inventory);
        const materialCount = inventory[requiredMaterialKey] || 0;
        if (materialCount < cost.essence) {
            return { ok: false, reason: 'material', level, cost, requiredMaterialKey };
        }

        return {
            ok: true,
            reason: null,
            level,
            cost,
            requiredMaterialKey
        };
    }

    function applyWeaponUpgrade(state, weaponKey) {
        const check = canUpgradeWeapon(state, weaponKey);
        if (!check.ok) return { ...check, nextState: null, nextLevel: check.level };

        const safeState = state && typeof state === 'object' ? state : {};
        const nextState = {
            ...safeState,
            inventory: normalizeInventory(safeState.inventory),
            weaponLevels: normalizeWeaponLevels(safeState.weaponLevels),
            gold: clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0)
        };

        nextState.gold -= check.cost.gold;

        const materialLeft = (nextState.inventory[check.requiredMaterialKey] || 0) - check.cost.essence;
        if (materialLeft > 0) nextState.inventory[check.requiredMaterialKey] = materialLeft;
        else delete nextState.inventory[check.requiredMaterialKey];

        nextState.weaponLevels[weaponKey] = check.level + 1;

        return {
            ok: true,
            reason: null,
            level: check.level,
            nextLevel: check.level + 1,
            cost: check.cost,
            requiredMaterialKey: check.requiredMaterialKey,
            nextState
        };
    }

    return {
        WEAPON_SCALING,
        DEFAULT_WEAPON_LEVELS,
        WEAPON_TO_MATERIAL,
        DEFAULT_SAVE_DATA,
        AUDIO_SETTINGS_STORAGE_KEY,
        DEFAULT_AUDIO_SETTINGS,
        normalizeAudioSettings,
        audioSettingsToGain,
        normalizeSaveData,
        serializeSaveData,
        deserializeSaveData,
        getWeaponLevel,
        getScaledWeaponStats,
        getUpgradeCostForLevel,
        getRequiredMaterialForWeapon,
        canUpgradeWeapon,
        applyWeaponUpgrade
    };
});
