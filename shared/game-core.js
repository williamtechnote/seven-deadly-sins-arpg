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

    const STATUS_EFFECT_DEFS = {
        burn: {
            key: 'burn',
            label: '灼烧',
            durationMs: 3200,
            tickMs: 400,
            damageMultiplier: 0.09,
            minTickDamage: 2,
            maxTickDamage: 14,
            speedMultiplier: 1
        },
        bleed: {
            key: 'bleed',
            label: '流血',
            durationMs: 3000,
            tickMs: 500,
            damageMultiplier: 0.08,
            minTickDamage: 2,
            maxTickDamage: 12,
            speedMultiplier: 1
        },
        slow: {
            key: 'slow',
            label: '减速',
            durationMs: 2400,
            tickMs: 0,
            damageMultiplier: 0,
            minTickDamage: 0,
            maxTickDamage: 0,
            speedMultiplier: 0.68
        }
    };

    const RUN_MODIFIER_POOL = [
        {
            key: 'frenziedFoes',
            name: '狂怒敌群',
            description: '敌方移动速度 +22%',
            effects: {
                enemySpeedMultiplier: 1.22
            }
        },
        {
            key: 'glassBlade',
            name: '锋刃赌注',
            description: '玩家伤害 +28%，承伤 +15%',
            effects: {
                playerDamageMultiplier: 1.28,
                playerDamageTakenMultiplier: 1.15
            }
        },
        {
            key: 'fortuneWindfall',
            name: '财运涌动',
            description: '金币与额外掉落率提高',
            effects: {
                goldDropMultiplier: 1.35,
                extraDropRateMultiplier: 1.4
            }
        },
        {
            key: 'ironWill',
            name: '钢铁意志',
            description: '玩家减伤，但敌人更耐打',
            effects: {
                playerDamageTakenMultiplier: 0.82,
                enemyHpMultiplier: 1.12
            }
        },
        {
            key: 'drainingMist',
            name: '迟滞迷雾',
            description: '体力恢复降低，敌人略快',
            effects: {
                playerStaminaRegenMultiplier: 0.78,
                enemySpeedMultiplier: 1.1
            }
        },
        {
            key: 'arcaneTempo',
            name: '奥能节律',
            description: '特殊攻击冷却缩短',
            effects: {
                playerSpecialCooldownMultiplier: 0.82
            }
        }
    ];

    const DEFAULT_RUN_EFFECTS = {
        enemySpeedMultiplier: 1,
        enemyHpMultiplier: 1,
        playerDamageMultiplier: 1,
        playerDamageTakenMultiplier: 1,
        goldDropMultiplier: 1,
        extraDropRateMultiplier: 1,
        playerStaminaRegenMultiplier: 1,
        playerSpecialCooldownMultiplier: 1
    };

    const CRAFTING_RECIPES = {
        cleanseTonic: {
            key: 'cleanseTonic',
            itemKey: 'cleanseTonic',
            count: 1,
            gold: 45,
            materials: {
                envyEssence: 1,
                slothEssence: 1
            }
        },
        berserkerOil: {
            key: 'berserkerOil',
            itemKey: 'berserkerOil',
            count: 1,
            gold: 60,
            materials: {
                wrathEssence: 1,
                greedEssence: 1
            }
        }
    };

    const RUN_EVENT_ROOM_POOL = [
        {
            key: 'gamblersShrine',
            name: '赌徒圣坛',
            description: '以生命为筹码，换取不同档位的金币回报',
            type: 'trade',
            choices: [
                {
                    key: 'highStakeWager',
                    label: '豪赌',
                    description: '失去当前生命 30%，换取 120 金币',
                    effect: {
                        type: 'hpForGold',
                        hpCostRatio: 0.3,
                        goldGain: 120
                    }
                },
                {
                    key: 'carefulWager',
                    label: '稳押',
                    description: '失去当前生命 12%，换取 45 金币',
                    effect: {
                        type: 'hpForGold',
                        hpCostRatio: 0.12,
                        goldGain: 45
                    }
                }
            ]
        },
        {
            key: 'healingFountain',
            name: '疗愈泉眼',
            description: '恢复生命，获得稳态优势',
            type: 'healing',
            choices: [
                {
                    key: 'vitalSurge',
                    label: '活泉灌注',
                    description: '恢复 55% 最大生命',
                    effect: {
                        type: 'restoreHp',
                        hpGainRatio: 0.55
                    }
                },
                {
                    key: 'purifyingSip',
                    label: '净泉啜饮',
                    description: '恢复 30% 最大生命，并净化当前负面状态',
                    effect: {
                        type: 'restoreHpAndCleanse',
                        hpGainRatio: 0.3,
                        cleanseNegativeStatuses: true
                    }
                }
            ]
        },
        {
            key: 'bloodContract',
            name: '血契祭坛',
            description: '签订血契，换取本局增伤与更高承伤',
            type: 'riskBuff',
            choices: [
                {
                    key: 'crimsonEdge',
                    label: '猩红锋契',
                    description: '本局伤害 +35%，承伤 +18%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerDamageMultiplier: 1.35,
                            playerDamageTakenMultiplier: 1.18
                        }
                    }
                },
                {
                    key: 'temperedPact',
                    label: '稳契余烬',
                    description: '本局伤害 +18%，承伤 +8%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerDamageMultiplier: 1.18,
                            playerDamageTakenMultiplier: 1.08
                        }
                    }
                }
            ]
        },
        {
            key: 'supplyCache',
            name: '战备商柜',
            description: '花费金币，换取能立刻装入背包的战备消耗品',
            type: 'trade',
            choices: [
                {
                    key: 'fieldTonic',
                    label: '战地净化包',
                    description: '支付 45 金币，获得 1 瓶净化药剂',
                    effect: {
                        type: 'goldForItems',
                        goldCost: 45,
                        items: {
                            cleanseTonic: 1
                        },
                        itemLabels: {
                            cleanseTonic: '净化药剂'
                        }
                    }
                },
                {
                    key: 'berserkerKit',
                    label: '狂战补给',
                    description: '支付 60 金币，获得 1 瓶狂战油',
                    effect: {
                        type: 'goldForItems',
                        goldCost: 60,
                        items: {
                            berserkerOil: 1
                        },
                        itemLabels: {
                            berserkerOil: '狂战油'
                        }
                    }
                }
            ]
        },
        {
            key: 'prayerShrine',
            name: '祈愿圣坛',
            description: '向圣坛祈愿，换取不同方向的本局祝福',
            type: 'blessing',
            choices: [
                {
                    key: 'renewalPrayer',
                    label: '复苏祷言',
                    description: '本局体力恢复 +35%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerStaminaRegenMultiplier: 1.35
                        }
                    }
                },
                {
                    key: 'tempoPrayer',
                    label: '迅击祷言',
                    description: '本局特攻冷却 -22%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerSpecialCooldownMultiplier: 0.78
                        }
                    }
                }
            ]
        }
    ];

    const DEFAULT_SAVE_DATA = {
        inventory: {},
        gold: 0,
        defeatedBosses: [],
        sinSeals: [],
        weaponLevels: { ...DEFAULT_WEAPON_LEVELS },
        unlockedWeapons: ['sword'],
        selectedWeaponKey: 'sword',
        runModifiers: [],
        runEventRoom: null,
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
            selectedWeaponKey: DEFAULT_SAVE_DATA.selectedWeaponKey,
            runModifiers: [],
            runEventRoom: null,
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

    function clampRatio(value, fallback) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.min(1, Math.max(0, n));
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

    function getStatusEffectDef(statusKey) {
        return STATUS_EFFECT_DEFS[statusKey] || null;
    }

    function getRunModifierByKey(modifierKey, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_MODIFIER_POOL;
        return pool.find(modifier => modifier && modifier.key === modifierKey) || null;
    }

    function normalizeRunModifiers(runModifiers, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_MODIFIER_POOL;
        const allowed = new Set(pool.map(mod => mod.key).filter(key => typeof key === 'string'));
        const source = sanitizeStringArray(runModifiers);
        const out = [];
        source.forEach((key) => {
            if (!allowed.has(key)) return;
            if (!out.includes(key)) out.push(key);
        });
        return out;
    }

    function getRunEventRoomByKey(eventKey, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_EVENT_ROOM_POOL;
        return pool.find(event => event && event.key === eventKey) || null;
    }

    function normalizeRunEventRoomChoices(choices) {
        if (!Array.isArray(choices)) return [];
        return choices
            .filter(choice => choice && typeof choice.key === 'string')
            .map(choice => ({
                key: choice.key,
                label: typeof choice.label === 'string' ? choice.label : choice.key,
                description: typeof choice.description === 'string' ? choice.description : '',
                effect: choice.effect && typeof choice.effect === 'object'
                    ? { ...choice.effect }
                    : null
            }));
    }

    function normalizeEffectItemChanges(effect) {
        if (!effect || typeof effect !== 'object') return [];
        const itemLabels = effect.itemLabels && typeof effect.itemLabels === 'object'
            ? effect.itemLabels
            : {};
        return Object.entries(normalizeInventory(effect.items))
            .map(([itemKey, count]) => ({
                itemKey,
                count,
                label: typeof itemLabels[itemKey] === 'string' ? itemLabels[itemKey] : itemKey
            }));
    }

    function getRunEventRoomChoices(eventRoomOrKey, poolOverride) {
        const eventKey = typeof eventRoomOrKey === 'string'
            ? eventRoomOrKey
            : (eventRoomOrKey && typeof eventRoomOrKey.key === 'string' ? eventRoomOrKey.key : '');
        if (!eventKey) return [];
        const event = getRunEventRoomByKey(eventKey, poolOverride);
        if (!event) return [];
        return normalizeRunEventRoomChoices(event.choices);
    }

    function normalizeRunEventRoom(runEventRoom, poolOverride) {
        if (!runEventRoom || typeof runEventRoom !== 'object') return null;
        const key = typeof runEventRoom.key === 'string' ? runEventRoom.key : '';
        const base = getRunEventRoomByKey(key, poolOverride);
        if (!base) return null;
        const choices = getRunEventRoomChoices(base.key, poolOverride);
        const selectedChoiceKey = typeof runEventRoom.selectedChoiceKey === 'string'
            ? runEventRoom.selectedChoiceKey
            : null;
        const selectedChoice = choices.find(choice => choice.key === selectedChoiceKey) || null;
        return {
            key: base.key,
            name: base.name,
            description: base.description,
            type: base.type,
            discovered: !!runEventRoom.discovered,
            resolved: !!runEventRoom.resolved,
            selectedChoiceKey: selectedChoice ? selectedChoice.key : null,
            selectedChoiceLabel: selectedChoice
                ? (
                    typeof runEventRoom.selectedChoiceLabel === 'string' && runEventRoom.selectedChoiceLabel.trim()
                        ? runEventRoom.selectedChoiceLabel
                        : selectedChoice.label
                )
                : null,
            resolutionText: selectedChoice && typeof runEventRoom.resolutionText === 'string'
                ? runEventRoom.resolutionText
                : ''
        };
    }

    function pickRunEventRoom(randomFn, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_EVENT_ROOM_POOL;
        if (!Array.isArray(pool) || pool.length === 0) return null;
        const rng = typeof randomFn === 'function' ? randomFn : Math.random;
        const raw = Number(rng());
        const normalized = Number.isFinite(raw) ? Math.min(0.999999, Math.max(0, raw)) : 0;
        const index = Math.floor(normalized * pool.length);
        const picked = pool[index] || pool[0];
        return {
            key: picked.key,
            name: picked.name,
            description: picked.description,
            type: picked.type,
            discovered: false,
            resolved: false,
            selectedChoiceKey: null,
            selectedChoiceLabel: null,
            resolutionText: ''
        };
    }

    function resolveRunEventRoomChoice(state, runEventRoom, choiceKey, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom) {
            return { ok: false, reason: 'invalid_event_room', eventRoom: null, choice: null, nextState: null, itemChanges: [] };
        }
        if (normalizedRoom.resolved) {
            return { ok: false, reason: 'already_resolved', eventRoom: normalizedRoom, choice: null, nextState: null, itemChanges: [] };
        }

        const choice = getRunEventRoomChoices(normalizedRoom.key, poolOverride).find(item => item.key === choiceKey) || null;
        if (!choice) {
            return { ok: false, reason: 'invalid_choice', eventRoom: normalizedRoom, choice: null, nextState: null, itemChanges: [] };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const playerMaxHp = Math.max(1, clampInt(safeState.playerMaxHp, 1, Number.MAX_SAFE_INTEGER, 100));
        const currentHp = clampInt(safeState.playerHp, 1, playerMaxHp, playerMaxHp);
        const currentGold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const currentInventory = normalizeInventory(safeState.inventory);
        const effect = choice.effect && typeof choice.effect === 'object' ? choice.effect : {};

        let hpLoss = 0;
        let hpGain = 0;
        let goldGain = 0;
        let cleanseNegativeStatuses = false;
        let nextInventory = null;
        let itemChanges = [];

        if (effect.type === 'hpForGold') {
            const ratio = Number(effect.hpCostRatio);
            const normalizedRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
            goldGain = clampInt(effect.goldGain, 0, Number.MAX_SAFE_INTEGER, 0);
            hpLoss = Math.floor(currentHp * normalizedRatio);
            hpLoss = Math.min(Math.max(0, hpLoss), Math.max(0, currentHp - 1));
        } else if (effect.type === 'restoreHp' || effect.type === 'restoreHpAndCleanse') {
            const ratio = Number(effect.hpGainRatio);
            const normalizedRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
            hpGain = Math.floor(playerMaxHp * normalizedRatio);
            hpGain = Math.min(Math.max(0, hpGain), Math.max(0, playerMaxHp - currentHp));
            cleanseNegativeStatuses = effect.type === 'restoreHpAndCleanse' || !!effect.cleanseNegativeStatuses;
        } else if (effect.type === 'goldForItems') {
            const goldCost = clampInt(effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0);
            itemChanges = normalizeEffectItemChanges(effect);
            if (currentGold < goldCost) {
                return {
                    ok: false,
                    reason: 'insufficient_gold',
                    eventRoom: normalizedRoom,
                    choice,
                    nextState: null,
                    itemChanges
                };
            }
            goldGain = -goldCost;
            nextInventory = { ...currentInventory };
            itemChanges.forEach(({ itemKey, count }) => {
                nextInventory[itemKey] = (nextInventory[itemKey] || 0) + count;
            });
        }

        const nextState = {
            ...safeState,
            gold: currentGold + goldGain,
            playerHp: Math.min(playerMaxHp, Math.max(1, currentHp - hpLoss + hpGain)),
            playerMaxHp,
            cleanseNegativeStatuses
        };
        if (nextInventory) nextState.inventory = nextInventory;

        let resolutionText = choice.description;
        if (effect.type === 'hpForGold') {
            resolutionText = `失去 ${hpLoss} 生命，获得 ${goldGain} 金币`;
        } else if (effect.type === 'restoreHpAndCleanse') {
            resolutionText = `恢复 ${hpGain} 生命，并净化负面状态`;
        } else if (effect.type === 'restoreHp') {
            resolutionText = `恢复 ${hpGain} 生命`;
        } else if (effect.type === 'goldForItems') {
            const itemSummary = itemChanges.map(({ label, count }) => `${label} x${count}`).join('，');
            resolutionText = `支付 ${Math.abs(goldGain)} 金币，获得 ${itemSummary}`;
        } else if (effect.type === 'runEffectBuff') {
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            resolutionText = describeRunEffectSummary(runEffects);
        }

        return {
            ok: true,
            reason: null,
            choice,
            nextState,
            itemChanges,
            eventRoom: {
                ...normalizedRoom,
                discovered: true,
                resolved: true,
                selectedChoiceKey: choice.key,
                selectedChoiceLabel: choice.label,
                resolutionText
            }
        };
    }

    function buildRunEventRoomEffects(runEventRoom, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        const effects = { ...DEFAULT_RUN_EFFECTS };
        if (!normalizedRoom || !normalizedRoom.resolved || !normalizedRoom.selectedChoiceKey) return effects;

        const choice = getRunEventRoomChoices(normalizedRoom.key, poolOverride)
            .find(item => item.key === normalizedRoom.selectedChoiceKey) || null;
        if (!choice || !choice.effect || choice.effect.type !== 'runEffectBuff') return effects;

        const runEffects = choice.effect.runEffects && typeof choice.effect.runEffects === 'object'
            ? choice.effect.runEffects
            : {};
        Object.entries(runEffects).forEach(([effectKey, value]) => {
            const n = Number(value);
            if (!Number.isFinite(n) || n <= 0 || effects[effectKey] == null) return;
            effects[effectKey] *= n;
        });
        return effects;
    }

    function getRunEventRoomTypeLabel(type) {
        const typeLabels = {
            trade: '交易',
            healing: '治疗',
            riskBuff: '风险增益',
            blessing: '祝福'
        };
        const key = typeof type === 'string' ? type.trim() : '';
        return typeLabels[key] || '未知';
    }

    function formatRoutePercentDelta(multiplier, fallbackLabel) {
        const safe = Number.isFinite(Number(multiplier)) ? Number(multiplier) : 1;
        if (safe === 1) return fallbackLabel || '';
        return `${formatPercentDelta(safe)}`;
    }

    function describeRunEventChoiceRoute(choice) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};

        if (effect.type === 'hpForGold') {
            const hpCostRatio = Math.max(0, Number(effect.hpCostRatio) || 0);
            const goldGain = clampInt(effect.goldGain, 0, Number.MAX_SAFE_INTEGER, 0);
            return `生命-${Math.round(hpCostRatio * 100)}%, 金币+${goldGain}`;
        }

        if (effect.type === 'restoreHp' || effect.type === 'restoreHpAndCleanse') {
            const hpGainRatio = Math.max(0, Number(effect.hpGainRatio) || 0);
            const parts = [`生命+${Math.round(hpGainRatio * 100)}%`];
            if (effect.type === 'restoreHpAndCleanse' || effect.cleanseNegativeStatuses) {
                parts.push('净化');
            }
            return parts.join(', ');
        }

        if (effect.type === 'goldForItems') {
            const parts = [`金币-${clampInt(effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0)}`];
            normalizeEffectItemChanges(effect).forEach(({ label, count }) => {
                parts.push(`${label}x${count}`);
            });
            return parts.join(', ');
        }

        if (effect.type === 'runEffectBuff') {
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            const defs = [
                ['playerDamageMultiplier', '伤害'],
                ['playerDamageTakenMultiplier', '承伤'],
                ['goldDropMultiplier', '金币掉落'],
                ['extraDropRateMultiplier', '额外掉落率'],
                ['playerStaminaRegenMultiplier', '体力恢复'],
                ['playerSpecialCooldownMultiplier', '特攻冷却'],
                ['enemySpeedMultiplier', '敌人速度'],
                ['enemyHpMultiplier', '敌人生命']
            ];
            const parts = defs
                .filter(([key]) => Number.isFinite(Number(runEffects[key])) && Number(runEffects[key]) > 0 && Number(runEffects[key]) !== 1)
                .map(([key, label]) => `${label}${formatRoutePercentDelta(runEffects[key])}`);
            return parts.length > 0 ? parts.join(', ') : (typeof safeChoice.description === 'string' ? safeChoice.description : '');
        }

        return typeof safeChoice.description === 'string' ? safeChoice.description : '';
    }

    function buildCompactRunEventResolutionText(runEventRoom, choice) {
        const normalizedRoom = runEventRoom && typeof runEventRoom === 'object' ? runEventRoom : {};
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};
        const source = typeof normalizedRoom.resolutionText === 'string' ? normalizedRoom.resolutionText.trim() : '';
        if (!source) return '';

        if (effect.type === 'hpForGold') {
            const match = source.match(/失去\s*(\d+)\s*生命，获得\s*(\d+)\s*金币/);
            if (match) return `生命-${match[1]}, 金币+${match[2]}`;
        }

        if (effect.type === 'restoreHpAndCleanse') {
            const match = source.match(/恢复\s*(\d+)\s*生命(?:，并净化负面状态)?/);
            if (match) return `生命+${match[1]}, 净化`;
        }

        if (effect.type === 'restoreHp') {
            const match = source.match(/恢复\s*(\d+)\s*生命/);
            if (match) return `生命+${match[1]}`;
        }

        if (effect.type === 'goldForItems') {
            const match = source.match(/支付\s*(\d+)\s*金币，获得\s*(.+)$/);
            if (match) {
                const itemSummary = match[2]
                    .replace(/\s*x(\d+)/g, 'x$1')
                    .replace(/，\s*/g, ', ');
                return `金币-${match[1]}, ${itemSummary}`;
            }
        }

        if (effect.type === 'runEffectBuff') {
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            const defs = [
                ['playerDamageMultiplier', '伤害'],
                ['playerDamageTakenMultiplier', '承伤'],
                ['goldDropMultiplier', '金币掉落'],
                ['extraDropRateMultiplier', '额外掉落率'],
                ['playerStaminaRegenMultiplier', '体力恢复'],
                ['playerSpecialCooldownMultiplier', '特攻冷却'],
                ['enemySpeedMultiplier', '敌人速度'],
                ['enemyHpMultiplier', '敌人生命']
            ];
            const parts = defs
                .filter(([key]) => Number.isFinite(Number(runEffects[key])) && Number(runEffects[key]) > 0 && Number(runEffects[key]) !== 1)
                .map(([key, label]) => `${label}${formatRoutePercentDelta(runEffects[key])}`);
            if (parts.length > 0) return parts.join(', ');
        }

        return source
            .replace(/本局/g, '')
            .replace(/，/g, ', ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildRunEventRoomHudSummary(runEventRoom, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom) {
            return {
                visible: false,
                name: '',
                statusLabel: '',
                metaLabel: '',
                typeLabel: '',
                routeLines: [],
                routeSummary: '',
                resolutionText: ''
            };
        }

        const allChoices = getRunEventRoomChoices(normalizedRoom.key, poolOverride);
        const selectedChoice = normalizedRoom.selectedChoiceKey
            ? allChoices.find(choice => choice.key === normalizedRoom.selectedChoiceKey) || null
            : null;
        const stateLabel = normalizedRoom.resolved ? '已触发' : (normalizedRoom.discovered ? '已发现' : '未发现');
        const visibleChoices = normalizedRoom.resolved && selectedChoice
            ? [selectedChoice]
            : allChoices.slice(0, 2);
        const routeLines = visibleChoices.map((choice) => {
            const prefix = normalizedRoom.resolved ? '已选 ' : '';
            return `${prefix}${choice.label}: ${describeRunEventChoiceRoute(choice)}`.trim();
        });
        const routeSummary = routeLines.join('\n');
        const resolutionText = normalizedRoom.resolved && selectedChoice
            ? buildCompactRunEventResolutionText(normalizedRoom, selectedChoice)
            : (normalizedRoom.resolutionText || '');

        return {
            visible: true,
            name: normalizedRoom.name,
            statusLabel: stateLabel,
            metaLabel: `${getRunEventRoomTypeLabel(normalizedRoom.type)} · ${stateLabel}`,
            typeLabel: `类型 ${getRunEventRoomTypeLabel(normalizedRoom.type)}`,
            routeLines,
            routeSummary,
            resolutionText
        };
    }

    function pickRunModifiers(randomFn, count, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_MODIFIER_POOL;
        const uniquePool = pool.filter((mod, idx) => (
            mod &&
            typeof mod.key === 'string' &&
            pool.findIndex(other => other && other.key === mod.key) === idx
        ));
        const safeCount = clampInt(
            count == null ? 3 : count,
            0,
            uniquePool.length,
            Math.min(3, uniquePool.length)
        );
        const rng = typeof randomFn === 'function' ? randomFn : Math.random;
        const bag = uniquePool.slice();
        for (let i = bag.length - 1; i > 0; i--) {
            const r = Number(rng());
            const normalized = Number.isFinite(r) ? Math.min(0.999999, Math.max(0, r)) : 0;
            const j = Math.floor(normalized * (i + 1));
            const temp = bag[i];
            bag[i] = bag[j];
            bag[j] = temp;
        }
        return bag.slice(0, safeCount).map(mod => mod.key);
    }

    function buildRunModifierEffects(runModifiers, poolOverride) {
        const pool = Array.isArray(poolOverride) ? poolOverride : RUN_MODIFIER_POOL;
        const validKeys = normalizeRunModifiers(runModifiers, pool);
        const effects = { ...DEFAULT_RUN_EFFECTS };

        validKeys.forEach((modifierKey) => {
            const modifier = getRunModifierByKey(modifierKey, pool);
            if (!modifier || !modifier.effects || typeof modifier.effects !== 'object') return;
            Object.entries(modifier.effects).forEach(([effectKey, value]) => {
                const n = Number(value);
                if (!Number.isFinite(n) || n <= 0) return;
                if (effects[effectKey] == null) effects[effectKey] = 1;
                effects[effectKey] *= n;
            });
        });
        return effects;
    }

    function computeStatusTickDamage(statusKey, sourceDamage, multiplierOverride) {
        const def = getStatusEffectDef(statusKey);
        if (!def || !def.tickMs || def.tickMs <= 0) return 0;
        const base = Number(sourceDamage);
        const safeBase = Number.isFinite(base) ? Math.max(0, base) : 0;
        const bonusMultiplier = Number(multiplierOverride);
        const safeMultiplier = Number.isFinite(bonusMultiplier) ? bonusMultiplier : 1;
        const raw = Math.round(safeBase * def.damageMultiplier * safeMultiplier);
        return clampInt(raw, def.minTickDamage, def.maxTickDamage, def.minTickDamage);
    }

    function formatPercentDelta(multiplier) {
        const safe = Number.isFinite(Number(multiplier)) ? Number(multiplier) : 1;
        const delta = Math.round((safe - 1) * 100);
        if (delta === 0) return '0%';
        return `${delta > 0 ? '+' : ''}${delta}%`;
    }

    function describeRunEffectSummary(runEffects) {
        const safe = runEffects && typeof runEffects === 'object' ? runEffects : {};
        const defs = [
            ['playerDamageMultiplier', '本局伤害'],
            ['playerDamageTakenMultiplier', '承伤'],
            ['goldDropMultiplier', '金币掉落'],
            ['extraDropRateMultiplier', '额外掉落率'],
            ['playerStaminaRegenMultiplier', '体力恢复'],
            ['playerSpecialCooldownMultiplier', '特攻冷却'],
            ['enemySpeedMultiplier', '敌人速度'],
            ['enemyHpMultiplier', '敌人生命']
        ];
        const parts = defs
            .filter(([key]) => Number.isFinite(Number(safe[key])) && Number(safe[key]) > 0 && Number(safe[key]) !== 1)
            .map(([key, label]) => `${label} ${formatPercentDelta(safe[key])}`);
        return parts.length > 0 ? parts.join('，') : '本局效果已变更';
    }

    function resolveConsumableUse(item, actorState) {
        const safeItem = item && typeof item === 'object' ? item : {};
        const safeState = actorState && typeof actorState === 'object' ? actorState : {};
        const nextVitals = {
            hp: Math.max(0, Number.isFinite(Number(safeState.hp)) ? Number(safeState.hp) : 0),
            maxHp: Math.max(1, Number.isFinite(Number(safeState.maxHp)) ? Number(safeState.maxHp) : 1),
            stamina: Math.max(0, Number.isFinite(Number(safeState.stamina)) ? Number(safeState.stamina) : 0),
            maxStamina: Math.max(1, Number.isFinite(Number(safeState.maxStamina)) ? Number(safeState.maxStamina) : 1)
        };

        if (safeItem.type !== 'consumable' || typeof safeItem.effect !== 'string') {
            return {
                ok: false,
                consume: false,
                reason: 'item',
                effect: null,
                recoveredAmount: 0,
                feedbackText: '',
                nextVitals
            };
        }

        if (safeItem.effect === 'healHp') {
            const newHp = Math.min(nextVitals.maxHp, nextVitals.hp + Math.max(0, Number(safeItem.value) || 0));
            const recoveredAmount = Math.max(0, Math.round(newHp - nextVitals.hp));
            if (recoveredAmount <= 0) {
                return {
                    ok: false,
                    consume: false,
                    reason: 'full',
                    effect: 'healHp',
                    recoveredAmount: 0,
                    feedbackText: '生命已满',
                    nextVitals
                };
            }
            return {
                ok: true,
                consume: true,
                reason: null,
                effect: 'healHp',
                recoveredAmount,
                feedbackText: `+${recoveredAmount} HP`,
                nextVitals: {
                    ...nextVitals,
                    hp: newHp
                }
            };
        }

        if (safeItem.effect === 'healStamina') {
            const newStamina = Math.min(nextVitals.maxStamina, nextVitals.stamina + Math.max(0, Number(safeItem.value) || 0));
            const recoveredAmount = Math.max(0, Math.round(newStamina - nextVitals.stamina));
            if (recoveredAmount <= 0) {
                return {
                    ok: false,
                    consume: false,
                    reason: 'full',
                    effect: 'healStamina',
                    recoveredAmount: 0,
                    feedbackText: '体力已满',
                    nextVitals
                };
            }
            return {
                ok: true,
                consume: true,
                reason: null,
                effect: 'healStamina',
                recoveredAmount,
                feedbackText: `+${recoveredAmount} ST`,
                nextVitals: {
                    ...nextVitals,
                    stamina: newStamina
                }
            };
        }

        if (safeItem.effect === 'cleanseWard' || safeItem.effect === 'battleFocus') {
            return {
                ok: true,
                consume: true,
                reason: null,
                effect: safeItem.effect,
                recoveredAmount: 0,
                feedbackText: '',
                nextVitals
            };
        }

        return {
            ok: false,
            consume: false,
            reason: 'unsupported_effect',
            effect: safeItem.effect,
            recoveredAmount: 0,
            feedbackText: '',
            nextVitals
        };
    }

    function buildStatusHudSummary(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const debuffs = [];
        const buffs = [];
        const activeStatuses = Array.isArray(safe.activeStatuses) ? safe.activeStatuses : [];

        activeStatuses.forEach((entry, index) => {
            if (!entry || typeof entry !== 'object') return;
            const def = getStatusEffectDef(entry.key);
            if (!def) return;
            const remainingMs = Math.max(0, clampInt(entry.remainingMs, 0, Number.MAX_SAFE_INTEGER, 0));
            if (remainingMs <= 0) return;
            debuffs.push({
                label: `${def.label} ${Math.max(1, Math.ceil(remainingMs / 1000))}s`,
                remainingMs,
                order: index
            });
        });

        const controlInvertMs = Math.max(0, clampInt(safe.controlInvertMs, 0, Number.MAX_SAFE_INTEGER, 0));
        if (controlInvertMs > 0) {
            debuffs.push({
                label: `控制反转 ${Math.max(1, Math.ceil(controlInvertMs / 1000))}s`,
                remainingMs: controlInvertMs,
                order: -1
            });
        }

        const statusResistanceMs = Math.max(0, clampInt(safe.statusResistanceMs, 0, Number.MAX_SAFE_INTEGER, 0));
        if (statusResistanceMs > 0) {
            buffs.push({
                label: `状态抗性 ${Math.max(1, Math.ceil(statusResistanceMs / 1000))}s`,
                remainingMs: statusResistanceMs,
                order: 0
            });
        }

        const damageBuffMs = Math.max(0, clampInt(safe.damageBuffMs, 0, Number.MAX_SAFE_INTEGER, 0));
        if (damageBuffMs > 0) {
            buffs.push({
                label: `增伤 ${formatPercentDelta(safe.damageBuffMultiplier)} ${Math.max(1, Math.ceil(damageBuffMs / 1000))}s`,
                remainingMs: damageBuffMs,
                order: 1
            });
        }

        const sorter = (a, b) => {
            if (a.remainingMs !== b.remainingMs) return a.remainingMs - b.remainingMs;
            if (a.order !== b.order) return a.order - b.order;
            return a.label.localeCompare(b.label, 'zh-Hans-CN');
        };

        debuffs.sort(sorter);
        buffs.sort(sorter);

        return {
            debuffs: debuffs.map(entry => entry.label),
            buffs: buffs.map(entry => entry.label)
        };
    }

    function advanceBossHpAfterimage(previousRatio, targetRatio, stepRatio) {
        const safePrevious = clampRatio(previousRatio, 1);
        const safeTarget = clampRatio(targetRatio, 0);
        const safeStep = Math.max(0, Number(stepRatio) || 0);
        if (safeTarget >= safePrevious) return safeTarget;
        return Math.max(safeTarget, safePrevious - safeStep);
    }

    function buildBossTelegraphHudSummary(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const attackLabel = typeof safe.attackLabel === 'string' ? safe.attackLabel.trim() : '';
        const attackTypeLabel = typeof safe.attackTypeLabel === 'string' ? safe.attackTypeLabel.trim() : '';
        const counterHint = typeof safe.counterHint === 'string' ? safe.counterHint.trim() : '';
        const counterWindowMs = Math.max(0, clampInt(safe.counterWindowMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const telegraphDurationMs = Math.max(1, clampInt(safe.telegraphDurationMs, 1, Number.MAX_SAFE_INTEGER, 1));
        const remainingMs = Math.max(0, clampInt(safe.remainingMs, 0, Number.MAX_SAFE_INTEGER, 0));

        if (!attackLabel) {
            return {
                visible: false,
                attackLabel: '',
                typeLabel: '',
                counterWindowLabel: '',
                hintLabel: '',
                progressRatio: 0
            };
        }

        return {
            visible: true,
            attackLabel,
            typeLabel: attackTypeLabel ? `类型 ${attackTypeLabel}` : '',
            counterWindowLabel: counterWindowMs > 0
                ? `反制窗口 ${Math.max(1, Math.round(counterWindowMs / 100) / 10)}s`
                : '',
            hintLabel: counterHint,
            progressRatio: clampRatio(remainingMs / telegraphDurationMs, 0)
        };
    }

    function buildBossPhaseHudSummary(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const phases = Array.isArray(safe.phases) ? safe.phases : [];
        const totalPhases = Math.max(1, phases.length);
        const currentPhase = clampInt(safe.currentPhase, 0, totalPhases - 1, 0);
        const thresholdMarkers = phases
            .map(phase => clampRatio(phase && phase.hpPercent, -1))
            .filter(ratio => ratio > 0 && ratio < 1);
        const nextPhase = currentPhase + 1 < phases.length ? phases[currentPhase + 1] : null;
        const nextThreshold = nextPhase ? clampRatio(nextPhase.hpPercent, -1) : -1;

        return {
            phaseLabel: `Phase ${currentPhase + 1}/${totalPhases}`,
            nextThresholdLabel: nextThreshold >= 0 ? `下阶段 ${Math.round(nextThreshold * 100)}%` : '',
            thresholdMarkers
        };
    }

    function buildBossStatusHighlightSummary(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const hpRatio = clampRatio(safe.hpRatio, 0);
        const breakMs = Math.max(0, clampInt(safe.breakMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const activeStatuses = Array.isArray(safe.activeStatuses) ? safe.activeStatuses : [];
        const controlStatusLabels = [];
        const controlStatusMap = {
            slow: '减速'
        };

        activeStatuses.forEach((statusKey) => {
            if (typeof statusKey !== 'string') return;
            const label = controlStatusMap[statusKey];
            if (!label || controlStatusLabels.includes(label)) return;
            controlStatusLabels.push(label);
        });

        const segments = [];
        if (breakMs > 0) {
            segments.push({
                key: 'break',
                label: '破招窗口',
                ratio: hpRatio,
                color: 0xFFD36B,
                alpha: 0.45
            });
        }
        if (controlStatusLabels.length > 0) {
            segments.push({
                key: 'control',
                label: `受控: ${controlStatusLabels.join(' / ')}`,
                ratio: hpRatio,
                color: 0x78E6FF,
                alpha: 0.34
            });
        }

        return { segments };
    }

    function getCraftingRecipe(recipeKey) {
        return CRAFTING_RECIPES[recipeKey] || null;
    }

    function canCraftRecipe(state, recipeKey) {
        const recipe = getCraftingRecipe(recipeKey);
        if (!recipe) {
            return { ok: false, reason: 'recipe', recipe: null };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const gold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        if (gold < recipe.gold) {
            return { ok: false, reason: 'gold', recipe };
        }

        const inventory = normalizeInventory(safeState.inventory);
        const materials = recipe.materials || {};
        for (const [itemKey, requiredCountRaw] of Object.entries(materials)) {
            const requiredCount = clampInt(requiredCountRaw, 1, Number.MAX_SAFE_INTEGER, 1);
            const count = inventory[itemKey] || 0;
            if (count < requiredCount) {
                return {
                    ok: false,
                    reason: 'material',
                    recipe,
                    missingItemKey: itemKey,
                    requiredCount,
                    currentCount: count
                };
            }
        }

        return { ok: true, reason: null, recipe };
    }

    function applyCraftRecipe(state, recipeKey) {
        const check = canCraftRecipe(state, recipeKey);
        if (!check.ok || !check.recipe) {
            return { ...check, nextState: null };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const inventory = normalizeInventory(safeState.inventory);
        const nextState = {
            ...safeState,
            inventory,
            gold: clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0)
        };

        nextState.gold -= check.recipe.gold;
        Object.entries(check.recipe.materials || {}).forEach(([itemKey, requiredCountRaw]) => {
            const requiredCount = clampInt(requiredCountRaw, 1, Number.MAX_SAFE_INTEGER, 1);
            const left = (nextState.inventory[itemKey] || 0) - requiredCount;
            if (left > 0) nextState.inventory[itemKey] = left;
            else delete nextState.inventory[itemKey];
        });
        nextState.inventory[check.recipe.itemKey] = (nextState.inventory[check.recipe.itemKey] || 0) + check.recipe.count;

        return {
            ok: true,
            reason: null,
            recipe: check.recipe,
            producedItemKey: check.recipe.itemKey,
            producedCount: check.recipe.count,
            nextState
        };
    }

    function normalizeSaveData(data) {
        if (!data || typeof data !== 'object') return createDefaultSaveData();
        const unlocked = sanitizeStringArray(data.unlockedWeapons);
        const validUnlocked = unlocked.length > 0 ? unlocked : ['sword'];
        const selectedWeaponKey = (
            typeof data.selectedWeaponKey === 'string' &&
            validUnlocked.includes(data.selectedWeaponKey)
        )
            ? data.selectedWeaponKey
            : validUnlocked[0];
        return {
            inventory: normalizeInventory(data.inventory),
            gold: clampInt(data.gold, 0, Number.MAX_SAFE_INTEGER, 0),
            defeatedBosses: sanitizeStringArray(data.defeatedBosses),
            sinSeals: sanitizeStringArray(data.sinSeals),
            weaponLevels: normalizeWeaponLevels(data.weaponLevels),
            unlockedWeapons: validUnlocked,
            selectedWeaponKey,
            runModifiers: normalizeRunModifiers(data.runModifiers),
            runEventRoom: normalizeRunEventRoom(data.runEventRoom),
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
        STATUS_EFFECT_DEFS,
        RUN_MODIFIER_POOL,
        DEFAULT_RUN_EFFECTS,
        CRAFTING_RECIPES,
        RUN_EVENT_ROOM_POOL,
        DEFAULT_SAVE_DATA,
        AUDIO_SETTINGS_STORAGE_KEY,
        DEFAULT_AUDIO_SETTINGS,
        normalizeAudioSettings,
        audioSettingsToGain,
        normalizeSaveData,
        serializeSaveData,
        deserializeSaveData,
        getStatusEffectDef,
        computeStatusTickDamage,
        resolveConsumableUse,
        buildStatusHudSummary,
        advanceBossHpAfterimage,
        buildBossTelegraphHudSummary,
        buildBossPhaseHudSummary,
        buildBossStatusHighlightSummary,
        getRunModifierByKey,
        normalizeRunModifiers,
        pickRunModifiers,
        buildRunModifierEffects,
        buildRunEventRoomEffects,
        buildRunEventRoomHudSummary,
        getRunEventRoomByKey,
        getRunEventRoomChoices,
        normalizeRunEventRoom,
        pickRunEventRoom,
        resolveRunEventRoomChoice,
        getWeaponLevel,
        getScaledWeaponStats,
        getUpgradeCostForLevel,
        getRequiredMaterialForWeapon,
        canUpgradeWeapon,
        applyWeaponUpgrade,
        getCraftingRecipe,
        canCraftRecipe,
        applyCraftRecipe
    };
});
