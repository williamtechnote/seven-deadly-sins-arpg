/**
 * BootScene - Generates placeholder textures and shows loading bar
 */

const Core = typeof GameCore !== 'undefined' ? GameCore : null;
if (!Core) {
    throw new Error('GameCore is required. Ensure shared/game-core.js is loaded before game.js');
}

const TestHarness = typeof globalThis !== 'undefined' && globalThis.__SDS_TEST_INTERNALS__
    ? globalThis.__SDS_TEST_INTERNALS__
    : null;

function isTestModeEnabled() {
    return !!(TestHarness && TestHarness.enabled);
}

function getTestFlags() {
    return TestHarness && typeof TestHarness.getFlags === 'function'
        ? TestHarness.getFlags()
        : null;
}

function getTestFlagValue(key, fallbackValue) {
    const flags = getTestFlags();
    if (!flags || !Object.prototype.hasOwnProperty.call(flags, key)) return fallbackValue;
    const value = Number(flags[key]);
    return Number.isFinite(value) && value > 0 ? value : fallbackValue;
}

function recordTestEvent(type, payload) {
    if (TestHarness && typeof TestHarness.recordEvent === 'function') {
        TestHarness.recordEvent(type, payload || null);
    }
}

const {
    WEAPON_SCALING,
    DEFAULT_WEAPON_LEVELS,
    DEFAULT_SAVE_DATA,
    STATUS_EFFECT_DEFS,
    RUN_MODIFIER_POOL,
    DEFAULT_RUN_EFFECTS,
    CRAFTING_RECIPES,
    RUN_EVENT_ROOM_POOL,
    AUDIO_SETTINGS_STORAGE_KEY,
    DEFAULT_AUDIO_SETTINGS,
    normalizeAudioSettings,
    audioSettingsToGain,
    resolveKeyboardAimState,
    formatAimDirectionLabel,
    buildCombatActionReadiness,
    buildPlayerHudLayout,
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
    getHudSidebarViewportTier,
    getHudSidebarLineCap,
    getHudSidebarOverflowPolicy,
    getRunModifierHeadingBadgeLayout,
    getRunModifierHeadingPresentation,
    buildVerticalTextStackLayout,
    buildPriorityTextStackLayout,
    getQuickSlotAutoAssignIndex,
    normalizeSaveData,
    serializeSaveData,
    deserializeSaveData,
    getWeaponLevel: getCoreWeaponLevel,
    getScaledWeaponStats: getCoreScaledWeaponStats,
    getStatusEffectDef,
    computeStatusTickDamage,
    resolveConsumableUse,
    buildStatusHudSummary,
    advanceBossHpAfterimage,
    buildBossTelegraphHudSummary,
    buildBossTelegraphTextLayout,
    buildBossPhaseHudSummary,
    buildBossStatusHighlightSummary,
    getRunModifierByKey,
    normalizeRunModifiers,
    pickRunModifiers,
    buildRunModifierEffects,
    buildRunEventRoomEffects,
    buildRunEventRoomChoicePanelPreview,
    buildRunChallengeCompletedFeedbackText,
    buildRunChallengeSidebarLines,
    getRunChallengeSidebarBadgeAppearance,
    buildRunEventRoomHudLines,
    buildRunEventRoomWorldLabel,
    buildRunEventRoomPromptLabel,
    getRunEventRoomByKey,
    getRunEventRoomChoices,
    normalizeRunEventRoom,
    pickRunEventRoom,
    resolveRunEventRoomChoice,
    getRunEventRoomChoiceAffordabilityLabel,
    getRunEventRoomChoiceFailureMessage,
    getUpgradeCostForLevel,
    getRequiredMaterialForWeapon,
    canUpgradeWeapon,
    applyWeaponUpgrade,
    canCraftRecipe,
    applyCraftRecipe
} = Core;

function cloneDefaultSaveData() {
    return {
        inventory: { ...(DEFAULT_SAVE_DATA.inventory || {}) },
        gold: DEFAULT_SAVE_DATA.gold || 0,
        defeatedBosses: [...(DEFAULT_SAVE_DATA.defeatedBosses || [])],
        sinSeals: [...(DEFAULT_SAVE_DATA.sinSeals || [])],
        weaponLevels: { ...(DEFAULT_SAVE_DATA.weaponLevels || DEFAULT_WEAPON_LEVELS) },
        unlockedWeapons: [...(DEFAULT_SAVE_DATA.unlockedWeapons || ['sword'])],
        selectedWeaponKey: DEFAULT_SAVE_DATA.selectedWeaponKey || 'sword',
        runModifiers: [...(DEFAULT_SAVE_DATA.runModifiers || [])],
        runEventRoom: DEFAULT_SAVE_DATA.runEventRoom || null,
        quickSlots: [...(DEFAULT_SAVE_DATA.quickSlots || [null, null, null, null])]
    };
}

const initialSaveData = cloneDefaultSaveData();

const STATUS_COLOR_MAP = {
    burn: 0xFF8C42,
    bleed: 0xE74C3C,
    slow: 0x66CCFF
};

const AREA_TO_MATERIAL_ITEM = {
    pride: 'prideEssence',
    envy: 'envyEssence',
    wrath: 'wrathEssence',
    sloth: 'slothEssence',
    greed: 'greedEssence',
    gluttony: 'gluttonyEssence',
    lust: 'lustEssence'
};

const BOSS_SPRITE_MAP = {
    pride: 'orc_warrior',
    envy: 'skeleton_rogue',
    wrath: 'orc_base',
    sloth: 'skeleton_base',
    greed: 'orc_shaman',
    gluttony: 'orc_rogue',
    lust: 'skeleton_mage',
    final: 'orc_base'
};

const ENEMY_EXTRA_DROP_CHANCE = {
    hpPotion: 0.08,
    staminaPotion: 0.08,
    material: 0.07
};

const RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT = '按 1/2 选择，按 F 或 Esc 取消';
const RUN_EVENT_CHOICE_PANEL_FOOTER_COLORS = {
    default: '#9fb0c4',
    blocked: '#ffb3a7'
};

const RUN_CHALLENGE_POOL = [
    { key: 'enemySlayer', label: '挑战: 本局击败 30 个敌人', target: 30, rewardGold: 90 }
];

const ATTACK_DISPLAY_NAMES = {
    firePunch: '烈焰冲拳',
    groundSlam: '震地冲击',
    flameBreath: '烈焰吐息',
    magmaRing: '熔火围城',
    divineStrike: '神罚坠击',
    bladeOrbit: '圣剑环阵',
    mirror: '镜像突袭',
    shapeShift: '形态裂变',
    mirageDance: '魅影连舞',
    reverseControl: '混乱逆转',
    illusion: '幻影风暴',
    sleepFog: '沉眠迷雾',
    coinTrap: '贪金陷阱',
    treasureStorm: '宝藏风暴',
    consume: '吞噬暴走',
    nightmare: '梦魇压制',
    goldBreath: '灼金币息',
    bite: '深渊啃咬'
};

const ATTACK_COUNTER_HINTS = {
    flameBreath: '反制: 侧向移动，别贪刀',
    magmaRing: '反制: 保持在火环安全带内，等收束后再贴近',
    divineStrike: '反制: 看到预警圈后立刻翻滚',
    bladeOrbit: '反制: 先绕 Boss 小步走位，再穿过飞剑空档',
    mirror: '反制: 先清镜像再贴身输出',
    shapeShift: '反制: 保持中距离，观察变身后出手',
    mirageDance: '反制: 观察真身换位节奏，留翻滚躲最后逆转波',
    reverseControl: '反制: 停止冲刺，短步修正方向',
    illusion: '反制: 先躲弹幕，再找本体',
    sleepFog: '反制: 迅速离开雾区，避免持续减速',
    coinTrap: '反制: 不要站角落，留翻滚路径',
    treasureStorm: '反制: 沿边绕圈，等待间隙反打',
    consume: '反制: 远离正面并保留一次翻滚',
    nightmare: '反制: 先保命，等压制结束再输出',
    goldBreath: '反制: 横向拉开，避免直线灼烧',
    bite: '反制: 贴身诱导后反向闪避'
};

const ATTACK_COUNTER_WINDOW_MS = {
    flameBreath: 1800,
    magmaRing: 1600,
    divineStrike: 1200,
    bladeOrbit: 1500,
    mirror: 1400,
    shapeShift: 1200,
    mirageDance: 1600,
    reverseControl: 1500,
    illusion: 1700,
    sleepFog: 1800,
    coinTrap: 1400,
    treasureStorm: 1700,
    consume: 1300,
    nightmare: 1600,
    goldBreath: 1700,
    bite: 1000
};

const ATTACK_COUNTER_WINDOW_START_OFFSET_MS = {
    flameBreath: 0,
    magmaRing: 0,
    divineStrike: 0,
    bladeOrbit: 0,
    mirror: 0,
    shapeShift: 0,
    mirageDance: 0,
    reverseControl: 0,
    illusion: 0,
    sleepFog: 0,
    coinTrap: 0,
    treasureStorm: 0,
    consume: 0,
    nightmare: 0,
    goldBreath: 0,
    bite: 0
};

const BOSS_TELEGRAPH_TYPE_LABELS = {
    DASH: '突进',
    AOE: '范围',
    CONE: '扇形',
    SPECIAL: '特殊',
    BUFF: '强化',
    HAZARD: '机制'
};

const BOSS_TELEGRAPH_TYPE_COLORS = {
    DASH: 0xF28F6B,
    AOE: 0xFFB347,
    CONE: 0xFF7C7C,
    SPECIAL: 0xD39BFF,
    BUFF: 0xFFE28A,
    HAZARD: 0x7FE4A8
};

const BOSS_ATTACK_STATUS_ON_HIT = {
    flameBreath: { key: 'burn', durationMs: 2600 },
    goldBreath: { key: 'burn', durationMs: 2200 },
    bite: { key: 'bleed', durationMs: 2400 },
    firePunch: { key: 'burn', durationMs: 1600 },
    sleepFog: { key: 'slow', durationMs: 2200 },
    magmaRing: { key: 'burn', durationMs: 2400 }
};

const UI_WARNING_THRESHOLDS = {
    lowHpRatio: 0.3,
    lowStaminaRatio: 0.2
};

const BOSS_HUD_AFTERIMAGE_STEP_PER_SECOND = 0.42;
const BOSS_COUNTER_BREAK_STAGGER_MS = 900;
const BOSS_PHASE_ALERT_DURATION_MS = 1800;

const MAJOR_BOSS_PHASE_ATTACKS = new Set([
    'flameBreath',
    'magmaRing',
    'divineStrike',
    'bladeOrbit',
    'mirror',
    'shapeShift',
    'mirageDance',
    'illusion',
    'coinTrap',
    'sleepFog',
    'treasureStorm',
    'consume',
    'nightmare'
]);

const WEAPON_SPECIAL_STATUS = {
    sword: { key: 'bleed', durationMs: 2800 },
    dualBlades: { key: 'bleed', durationMs: 3200 },
    hammer: { key: 'slow', durationMs: 2600 },
    bow: { key: 'bleed', durationMs: 2500 },
    staff: { key: 'burn', durationMs: 3200 }
};

function formatPct(multiplier) {
    const delta = Math.round((multiplier - 1) * 100);
    if (delta === 0) return '0%';
    return (delta > 0 ? '+' : '') + delta + '%';
}

function getStatusLabel(statusKey) {
    const def = getStatusEffectDef(statusKey);
    return def ? def.label : statusKey;
}

function getStatusColor(statusKey) {
    return STATUS_COLOR_MAP[statusKey] || 0xFFFFFF;
}

function getWeaponSpecialStatus(weaponKey) {
    return WEAPON_SPECIAL_STATUS[weaponKey] || null;
}

function getAreaKeyFromEnemyKey(enemyKey) {
    if (typeof enemyKey !== 'string') return null;
    const prefixes = Object.keys(AREA_TO_MATERIAL_ITEM);
    const match = prefixes.find(prefix => enemyKey.startsWith(prefix));
    return match || null;
}

function showFloatingCombatText(scene, x, y, text, color, duration) {
    if (!scene || !scene.add || !text) return;
    const t = scene.add.text(x, y, text, {
        fontSize: '14px',
        fill: color || '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(35);
    scene.tweens.add({
        targets: t,
        y: t.y - 26,
        alpha: 0,
        duration: duration || 700,
        onComplete: () => t.destroy()
    });
}

function showHitImpactPulse(scene, x, y, color, radius) {
    if (!scene || !scene.add || !scene.tweens) return;
    const pulse = scene.add.graphics();
    pulse.setDepth(34);
    pulse.lineStyle(2, color || 0xFFD27A, 0.95);
    pulse.strokeCircle(x, y, radius || 10);
    scene.tweens.add({
        targets: pulse,
        alpha: 0,
        duration: 180,
        onUpdate: () => {
            pulse.scaleX += 0.035;
            pulse.scaleY += 0.035;
        },
        onComplete: () => pulse.destroy()
    });
}

function handleQuickSlotUse(scene, player, index) {
    if (!scene || !player || player.hp <= 0) return null;
    const result = GameState.useQuickSlot(index, player);
    if (result && result.feedbackText) {
        showFloatingCombatText(
            scene,
            player.x,
            player.y - 48,
            result.feedbackText,
            result.feedbackColor || '#ffffff',
            result.feedbackDuration || 700
        );
    }
    return result;
}

function formatWeaponStatsLine(weaponKey) {
    const weapon = WEAPONS[weaponKey];
    if (!weapon) return weaponKey + ': -';
    const level = getCoreWeaponLevel(GameState.weaponLevels, weaponKey);
    const scaled = getCoreScaledWeaponStats(WEAPONS, weaponKey, level, WEAPON_SCALING) || weapon;
    return [
        weapon.name + ' Lv.' + level,
        '伤害 ' + scaled.damage,
        '攻速 ' + scaled.attackSpeed + 'ms',
        '特攻冷却 ' + scaled.specialCooldown + 'ms'
    ].join(' | ');
}

function openPauseMenu(scene) {
    if (!scene || !scene.scene) return;
    if (scene.scene.isActive('PauseScene')) return;
    scene.scene.pause();
    scene.scene.launch('PauseScene', { parentScene: scene.scene.key });
}

const AudioSystem = {
    _ctx: null,
    _master: null,
    _settings: { ...DEFAULT_AUDIO_SETTINGS },

    _ensureContext() {
        if (this._ctx) return true;
        if (typeof window === 'undefined') return false;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this._ctx = new AudioCtx();
        this._master = this._ctx.createGain();
        this._master.gain.value = audioSettingsToGain(this._settings, 0.18);
        this._master.connect(this._ctx.destination);
        return true;
    },

    _saveSettings() {
        try {
            localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(this._settings));
        } catch (e) {
            // Ignore localStorage write failures.
        }
    },

    _applySettings() {
        if (!this._master) return;
        this._master.gain.value = audioSettingsToGain(this._settings, 0.18);
    },

    loadSettings() {
        try {
            const raw = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
            if (!raw) {
                this._settings = { ...DEFAULT_AUDIO_SETTINGS };
            } else {
                this._settings = normalizeAudioSettings(JSON.parse(raw));
            }
        } catch (e) {
            this._settings = { ...DEFAULT_AUDIO_SETTINGS };
        }
        this._applySettings();
    },

    getSettings() {
        return { ...this._settings };
    },

    setMuted(muted) {
        this._settings.muted = !!muted;
        this._applySettings();
        this._saveSettings();
    },

    toggleMuted() {
        this.setMuted(!this._settings.muted);
    },

    setVolume(volume) {
        this._settings.volume = Math.max(0, Math.min(100, Math.round(Number(volume) || 0)));
        this._applySettings();
        this._saveSettings();
    },

    _resume() {
        if (!this._ensureContext()) return;
        if (this._ctx.state === 'suspended') {
            this._ctx.resume().catch(() => {});
        }
    },

    bindSceneInput(scene) {
        if (!scene || !scene.input || scene._audioBound) return;
        scene._audioBound = true;
        scene.input.once('pointerdown', () => this._resume());
        scene.input.keyboard.once('keydown', () => this._resume());
    },

    _playTone(freq, durationMs, type, gain) {
        if (!this._ensureContext() || !this._master || this._settings.muted) return;
        const now = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const g = this._ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gain || 0.05, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs || 120) / 1000);
        osc.connect(g);
        g.connect(this._master);
        osc.start(now);
        osc.stop(now + (durationMs || 120) / 1000 + 0.02);
    },

    playUi(kind) {
        if (kind === 'error') this._playTone(180, 180, 'sawtooth', 0.045);
        else if (kind === 'pickup') this._playTone(760, 120, 'triangle', 0.04);
        else if (kind === 'dodge') this._playTone(520, 90, 'square', 0.035);
        else this._playTone(620, 100, 'triangle', 0.035);
    },

    playAttack(isSpecial) {
        this._playTone(isSpecial ? 420 : 300, isSpecial ? 160 : 120, 'square', isSpecial ? 0.05 : 0.04);
    },

    playHit() {
        this._playTone(220, 140, 'sawtooth', 0.05);
    }
};

const GameState = {
    inventory: {},
    gold: 0,
    defeatedBosses: [],
    sinSeals: [],
    weaponLevels: { sword: 1, dualBlades: 1, hammer: 1, bow: 1, staff: 1 },
    unlockedWeapons: ['sword'],
    selectedWeaponKey: 'sword',
    runModifiers: [],
    runEffects: { ...DEFAULT_RUN_EFFECTS },
    runEventRoom: null,
    runChallenge: null,
    quickSlots: [null, null, null, null],

    addItem(itemKey, count) {
        this.inventory[itemKey] = (this.inventory[itemKey] || 0) + (count || 1);
    },
    removeItem(itemKey, count) {
        if (!this.inventory[itemKey]) return false;
        this.inventory[itemKey] -= (count || 1);
        if (this.inventory[itemKey] <= 0) delete this.inventory[itemKey];
        return true;
    },
    hasItem(itemKey, count) {
        return (this.inventory[itemKey] || 0) >= (count || 1);
    },
    addGold(amount) { this.gold += amount; },
    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        return true;
    },
    useQuickSlot(index, player) {
        const itemKey = this.quickSlots[index];
        if (!itemKey || !this.hasItem(itemKey)) return null;
        const item = ITEMS[itemKey];
        if (!item || item.type !== 'consumable') return null;

        const resolution = resolveConsumableUse(item, player);
        if (!resolution || (!resolution.ok && !resolution.feedbackText)) return resolution || null;
        if (!resolution.ok) {
            return {
                ...resolution,
                itemKey,
                feedbackColor: resolution.reason === 'full' ? '#ffd27a' : '#ffffff',
                feedbackDuration: 700
            };
        }

        player.hp = resolution.nextVitals.hp;
        player.stamina = resolution.nextVitals.stamina;

        if (resolution.effect === 'cleanseWard' && player.applyCleanseWard) {
            player.applyCleanseWard(4000);
        } else if (resolution.effect === 'battleFocus' && player.applyBattleFocus) {
            player.applyBattleFocus(8000, 1.25);
        }

        this.removeItem(itemKey);
        AudioSystem.playUi('ui');
        return {
            ...resolution,
            itemKey,
            feedbackColor: resolution.effect === 'healHp'
                ? '#7CFFB2'
                : (resolution.effect === 'healStamina' ? '#7AD7FF' : '#ffffff'),
            feedbackDuration: resolution.effect === 'healHp' || resolution.effect === 'healStamina'
                ? 800
                : 0
        };
    },
    rollRunModifiers() {
        this.runModifiers = pickRunModifiers(Math.random, 3, RUN_MODIFIER_POOL);
        this.refreshRunEffects();
    },
    ensureRunModifiers() {
        this.runModifiers = normalizeRunModifiers(this.runModifiers, RUN_MODIFIER_POOL);
        if (this.runModifiers.length === 0) {
            this.rollRunModifiers();
            return;
        }
        this.refreshRunEffects();
    },
    rollRunEventRoom() {
        this.runEventRoom = pickRunEventRoom(Math.random, RUN_EVENT_ROOM_POOL);
        this.refreshRunEffects();
    },
    ensureRunEventRoom() {
        this.runEventRoom = normalizeRunEventRoom(this.runEventRoom, RUN_EVENT_ROOM_POOL);
        if (!this.runEventRoom) this.rollRunEventRoom();
        else this.refreshRunEffects();
    },
    discoverRunEventRoom() {
        this.ensureRunEventRoom();
        if (this.runEventRoom) this.runEventRoom.discovered = true;
    },
    resolveRunEventRoom() {
        this.ensureRunEventRoom();
        if (this.runEventRoom) this.runEventRoom.resolved = true;
    },
    getRunEventRoomSummary() {
        this.ensureRunEventRoom();
        if (!this.runEventRoom) return null;
        return {
            key: this.runEventRoom.key,
            name: this.runEventRoom.name,
            description: this.runEventRoom.description,
            type: this.runEventRoom.type,
            discovered: !!this.runEventRoom.discovered,
            resolved: !!this.runEventRoom.resolved,
            selectedChoiceKey: this.runEventRoom.selectedChoiceKey || null,
            selectedChoiceLabel: this.runEventRoom.selectedChoiceLabel || '',
            resolutionText: this.runEventRoom.resolutionText || ''
        };
    },
    rollRunChallenge() {
        const seed = Math.floor(Math.random() * RUN_CHALLENGE_POOL.length);
        const picked = RUN_CHALLENGE_POOL[seed] || RUN_CHALLENGE_POOL[0];
        this.runChallenge = {
            key: picked.key,
            label: picked.label,
            target: picked.target,
            progress: 0,
            rewardGold: picked.rewardGold,
            rewardLabel: picked.rewardLabel || '',
            completed: false
        };
    },
    onEnemyDefeated() {
        if (!this.runChallenge || this.runChallenge.completed) return false;
        this.runChallenge.progress += 1;
        recordTestEvent('challenge:progress', {
            progress: this.runChallenge.progress,
            target: this.runChallenge.target,
            label: this.runChallenge.label
        });
        if (this.runChallenge.progress >= this.runChallenge.target) {
            this.runChallenge.completed = true;
            this.addGold(this.runChallenge.rewardGold || 0);
            recordTestEvent('challenge:completed', this.getRunChallengeSummary());
            return true;
        }
        return false;
    },
    getRunChallengeSummary() {
        if (!this.runChallenge) return null;
        const c = this.runChallenge;
        return {
            label: c.label,
            progress: c.progress,
            target: c.target,
            completed: !!c.completed,
            rewardGold: c.rewardGold || 0,
            rewardLabel: c.rewardLabel || ''
        };
    },
    refreshRunEffects() {
        const modifierEffects = buildRunModifierEffects(this.runModifiers, RUN_MODIFIER_POOL);
        const eventRoomEffects = buildRunEventRoomEffects(this.runEventRoom, RUN_EVENT_ROOM_POOL);
        const testOverrides = getTestRunEffectOverrides();
        this.runEffects = combineRunEffects(modifierEffects, eventRoomEffects, testOverrides);
    },
    reset() {
        const base = cloneDefaultSaveData();
        this.inventory = base.inventory;
        this.gold = 50;
        this.defeatedBosses = [];
        this.sinSeals = [];
        this.weaponLevels = { sword: 1, dualBlades: 1, hammer: 1, bow: 1, staff: 1 };
        this.unlockedWeapons = ['sword'];
        this.selectedWeaponKey = 'sword';
        this.rollRunModifiers();
        this.rollRunEventRoom();
        this.rollRunChallenge();
        this.quickSlots = [null, null, null, null];
        recordTestEvent('gamestate:reset', {
            gold: this.gold,
            runModifiers: this.runModifiers,
            runEventRoom: this.getRunEventRoomSummary ? this.getRunEventRoomSummary() : null,
            runChallenge: this.getRunChallengeSummary ? this.getRunChallengeSummary() : null
        });
    },
    ensureSelectedWeapon() {
        const unlocked = Array.isArray(this.unlockedWeapons) && this.unlockedWeapons.length > 0
            ? this.unlockedWeapons
            : ['sword'];
        if (!this.selectedWeaponKey || !unlocked.includes(this.selectedWeaponKey)) {
            this.selectedWeaponKey = unlocked[0];
        }
        return this.selectedWeaponKey;
    },
    save() {
        const raw = serializeSaveData({
            inventory: this.inventory,
            gold: this.gold,
            defeatedBosses: this.defeatedBosses,
            sinSeals: this.sinSeals,
            weaponLevels: this.weaponLevels,
            unlockedWeapons: this.unlockedWeapons,
            selectedWeaponKey: this.selectedWeaponKey,
            runModifiers: this.runModifiers,
            runEventRoom: this.runEventRoom,
            quickSlots: this.quickSlots
        });
        localStorage.setItem('sevenSinsSave', raw);
    },
    load() {
        const raw = localStorage.getItem('sevenSinsSave');
        if (!raw) return false;
        try {
            const data = deserializeSaveData(raw);
            this.inventory = data.inventory || {};
            this.gold = data.gold || 0;
            this.defeatedBosses = data.defeatedBosses || [];
            this.sinSeals = data.sinSeals || [];
            this.weaponLevels = data.weaponLevels || { sword: 1, dualBlades: 1, hammer: 1, bow: 1, staff: 1 };
            this.unlockedWeapons = data.unlockedWeapons || ['sword'];
            this.selectedWeaponKey = data.selectedWeaponKey || this.unlockedWeapons[0] || 'sword';
            this.runModifiers = data.runModifiers || [];
            this.ensureRunModifiers();
            this.runEventRoom = data.runEventRoom || null;
            this.ensureRunEventRoom();
            this.quickSlots = data.quickSlots || [null, null, null, null];
            this.ensureSelectedWeapon();
            if (!this.runChallenge) this.rollRunChallenge();
            recordTestEvent('gamestate:load', {
                gold: this.gold,
                defeatedBosses: this.defeatedBosses,
                sinSeals: this.sinSeals
            });
            return true;
        } catch (e) {
            return false;
        }
    }
};

function applyPlayerWeaponState(player) {
    const unlocked = Array.isArray(GameState.unlockedWeapons) && GameState.unlockedWeapons.length > 0
        ? GameState.unlockedWeapons.slice()
        : ['sword'];
    const selected = GameState.ensureSelectedWeapon();
    player.setWeapons(unlocked, selected);
}

function getRunModifierLabel(modifierKey) {
    const modifier = getRunModifierByKey(modifierKey, RUN_MODIFIER_POOL);
    return modifier ? modifier.name : modifierKey;
}

function getRunModifierDescription(modifierKey) {
    const modifier = getRunModifierByKey(modifierKey, RUN_MODIFIER_POOL);
    return modifier ? modifier.description : '';
}

function getRunModifierHelpLines() {
    const keys = Array.isArray(GameState.runModifiers) ? GameState.runModifiers : [];
    if (keys.length === 0) return ['无'];
    return keys.map((key, index) => `${index + 1}. ${getRunModifierLabel(key)}: ${getRunModifierDescription(key)}`);
}

function combineRunEffects(...effectGroups) {
    const combined = { ...DEFAULT_RUN_EFFECTS };
    effectGroups.forEach((group) => {
        if (!group || typeof group !== 'object') return;
        Object.keys(combined).forEach((effectKey) => {
            const value = Number(group[effectKey]);
            if (!Number.isFinite(value) || value <= 0) return;
            combined[effectKey] *= value;
        });
    });
    return combined;
}

function getTestRunEffectOverrides() {
    if (!isTestModeEnabled()) return null;
    return {
        enemySpeedMultiplier: getTestFlagValue('enemySpeedMultiplier', 1),
        enemyHpMultiplier: getTestFlagValue('enemyHpMultiplier', 1),
        playerDamageMultiplier: getTestFlagValue('playerDamageMultiplier', 1),
        playerDamageTakenMultiplier: getTestFlagValue('playerDamageTakenMultiplier', 1),
        goldDropMultiplier: getTestFlagValue('goldDropMultiplier', 1),
        extraDropRateMultiplier: getTestFlagValue('extraDropRateMultiplier', 1),
        playerStaminaRegenMultiplier: getTestFlagValue('playerStaminaRegenMultiplier', 1),
        playerSpecialCooldownMultiplier: getTestFlagValue('playerSpecialCooldownMultiplier', 1)
    };
}

const UI_DEBUG_FLAGS = {
    showSavedWeaponInHUD: false
};
AudioSystem.loadSettings();

const PIXEL_TILE_STYLES = {
    default: {
        tileSize: 16,
        seed: 13,
        baseColor: 0x2a2a2a,
        shadeColor: 0x202020,
        highlightColor: 0x363636,
        accentColor: 0x3f3f3f,
        shadeChance: 0.24,
        highlightChance: 0.12,
        accentChance: 0.08,
        stripeInterval: 5
    },
    hub: {
        tileSize: 16,
        seed: 29,
        baseColor: 0x3a332a,
        shadeColor: 0x2f281f,
        highlightColor: 0x4a4236,
        accentColor: 0x5a5142,
        shadeChance: 0.22,
        highlightChance: 0.1,
        accentChance: 0.07,
        stripeInterval: 6
    },
    pride: { tileSize: 16, seed: 41, baseColor: 0x5a4f2a, shadeColor: 0x443a1d, highlightColor: 0x7c6a38, accentColor: 0xa07f38, shadeChance: 0.21, highlightChance: 0.12, accentChance: 0.1, stripeInterval: 7 },
    envy: { tileSize: 16, seed: 53, baseColor: 0x23412a, shadeColor: 0x1a331f, highlightColor: 0x2f5a39, accentColor: 0x3f7648, shadeChance: 0.24, highlightChance: 0.09, accentChance: 0.08, stripeInterval: 5 },
    wrath: { tileSize: 16, seed: 67, baseColor: 0x4a2522, shadeColor: 0x391a17, highlightColor: 0x66312b, accentColor: 0x8a3c33, shadeChance: 0.25, highlightChance: 0.11, accentChance: 0.1, stripeInterval: 4 },
    sloth: { tileSize: 16, seed: 71, baseColor: 0x3a2a47, shadeColor: 0x2d2038, highlightColor: 0x4e395e, accentColor: 0x66467d, shadeChance: 0.2, highlightChance: 0.12, accentChance: 0.09, stripeInterval: 6 },
    greed: { tileSize: 16, seed: 79, baseColor: 0x4d4724, shadeColor: 0x3a351a, highlightColor: 0x69622f, accentColor: 0x8a7f3a, shadeChance: 0.22, highlightChance: 0.12, accentChance: 0.1, stripeInterval: 5 },
    gluttony: { tileSize: 16, seed: 89, baseColor: 0x3f262e, shadeColor: 0x2f1b21, highlightColor: 0x55323d, accentColor: 0x6f3d4e, shadeChance: 0.24, highlightChance: 0.1, accentChance: 0.08, stripeInterval: 5 },
    lust: { tileSize: 16, seed: 97, baseColor: 0x47243f, shadeColor: 0x351b2f, highlightColor: 0x5f3155, accentColor: 0x7f3d73, shadeChance: 0.21, highlightChance: 0.13, accentChance: 0.1, stripeInterval: 6 },
    final: { tileSize: 16, seed: 109, baseColor: 0x2e2e34, shadeColor: 0x222228, highlightColor: 0x3d3d47, accentColor: 0x5a5a68, shadeChance: 0.24, highlightChance: 0.12, accentChance: 0.09, stripeInterval: 4 }
};

function resolvePixelStyleKey(styleKey) {
    return PIXEL_TILE_STYLES[styleKey] ? styleKey : 'default';
}

function getPixelNoise(x, y, seed) {
    let n = (x * 374761393 + y * 668265263 + seed * 1442695041) >>> 0;
    n ^= n >>> 13;
    n = Math.imul(n, 1274126177) >>> 0;
    n ^= n >>> 16;
    return n / 4294967296;
}

function ensurePixelTileTexture(scene, styleKey) {
    const resolved = resolvePixelStyleKey(styleKey);
    const textureKey = 'pixel_tile_' + resolved;
    if (scene.textures.exists(textureKey)) return textureKey;

    const style = PIXEL_TILE_STYLES[resolved];
    const size = style.tileSize || 16;
    const gfx = scene.make.graphics({ add: false });

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const noise = getPixelNoise(x, y, style.seed || 0);
            let color = style.baseColor;
            if (noise < style.shadeChance) {
                color = style.shadeColor;
            } else if (noise > 1 - style.highlightChance) {
                color = style.highlightColor;
            } else if ((x + y + (style.seed || 0)) % style.stripeInterval === 0 && noise < style.accentChance) {
                color = style.accentColor;
            }
            gfx.fillStyle(color, 1);
            gfx.fillRect(x, y, 1, 1);
        }
    }

    // Slight per-tile edge contrast to reinforce pixel tile boundaries.
    gfx.fillStyle(style.shadeColor, 0.35);
    gfx.fillRect(0, 0, size, 1);
    gfx.fillRect(0, 0, 1, size);
    gfx.fillStyle(style.highlightColor, 0.25);
    gfx.fillRect(0, size - 1, size, 1);
    gfx.fillRect(size - 1, 0, 1, size);

    gfx.generateTexture(textureKey, size, size);
    gfx.destroy();
    return textureKey;
}

function drawPixelTiledRect(scene, x, y, w, h, styleKey, depth) {
    const key = ensurePixelTileTexture(scene, styleKey);
    return scene.add.tileSprite(x, y, w, h, key).setOrigin(0, 0).setDepth(depth || 0);
}

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRect(width / 2 - 150, height / 2 - 15, 300, 30);
        const bar = this.add.graphics();
        const loadingText = this.add.text(width / 2, height / 2 - 40, '加载中...', {
            fontSize: '20px', fill: '#ffffff'
        }).setOrigin(0.5);
        this.load.on('progress', (v) => {
            bar.clear();
            bar.fillStyle(0x4a90d9, 1);
            bar.fillRect(width / 2 - 145, height / 2 - 10, 290 * v, 20);
        });
        this.load.on('complete', () => loadingText.setText('完成!'));

        this._loadFailed = [];
        this.load.on('loaderror', (file) => {
            console.warn('[BootScene] Failed to load:', file.key, file.url);
            this._loadFailed.push(file.key);
        });

        const P = 'assets/sprites/';

        const playerAnims = [
            'idle_down', 'idle_side', 'idle_up',
            'walk_down', 'walk_side', 'walk_up',
            'attack_down', 'attack_side', 'attack_up',
            'hit_down', 'death_down'
        ];
        playerAnims.forEach(k => {
            this.load.spritesheet('player_' + k, P + 'player/' + k + '.png',
                { frameWidth: 64, frameHeight: 64 });
        });

        const enemyTypes = [
            'skeleton_rogue', 'skeleton_warrior', 'skeleton_mage', 'skeleton_base',
            'orc_rogue', 'orc_warrior', 'orc_shaman', 'orc_base'
        ];
        enemyTypes.forEach(k => {
            this.load.spritesheet('enemy_' + k, P + 'enemies/' + k + '_idle.png',
                { frameWidth: 32, frameHeight: 32 });
        });

        ['knight', 'rogue', 'wizard'].forEach(k => {
            this.load.spritesheet('npc_' + k, P + 'npcs/' + k + '_idle.png',
                { frameWidth: 32, frameHeight: 32 });
        });
    }

    create() {
        const gfx = this.make.graphics({ add: false });
        const gen = (key, color, w, h) => {
            gfx.clear();
            gfx.fillStyle(color, 1);
            gfx.fillRect(0, 0, w, h);
            gfx.generateTexture(key, w, h);
        };
        gen('projectile', 0xFFD700, 10, 10);
        gen('hp_fill', 0xE74C3C, 100, 8);
        gen('stamina_fill', 0x3498DB, 100, 8);

        gfx.clear();
        gfx.fillStyle(0x2a1a3a, 1);
        gfx.fillCircle(24, 24, 24);
        gfx.fillStyle(0x6a3a8a, 0.8);
        gfx.fillCircle(24, 24, 18);
        gfx.fillStyle(0xaa5acc, 0.6);
        gfx.fillCircle(24, 24, 12);
        gfx.fillStyle(0xeeddff, 0.5);
        gfx.fillCircle(24, 24, 5);
        gfx.generateTexture('portal', 48, 48);

        // Generate fallback textures for any failed loads
        const failed = this._loadFailed || [];
        if (failed.length > 0) {
            console.warn('[BootScene] Generating fallback textures for', failed.length, 'failed assets');
        }
        const fallbacks = {
            player: { color: 0x4a90d9, w: 64, h: 64 },
            enemy: { color: 0xFF6347, w: 32, h: 32 },
            npc: { color: 0x2ECC40, w: 32, h: 32 }
        };
        failed.forEach(key => {
            let fb = null;
            if (key.startsWith('player_')) fb = fallbacks.player;
            else if (key.startsWith('enemy_')) fb = fallbacks.enemy;
            else if (key.startsWith('npc_')) fb = fallbacks.npc;
            if (fb) {
                gfx.clear();
                gfx.fillStyle(fb.color, 1);
                gfx.fillRect(0, 0, fb.w, fb.h);
                gfx.generateTexture(key, fb.w, fb.h);
            }
        });

        const mkAnim = (key, texture, start, end, rate, repeat) => {
            if (!this.textures.exists(texture)) return;
            const frameCount = this.textures.get(texture).frameTotal - 1;
            const safeEnd = Math.min(end, frameCount - 1);
            if (safeEnd < start) return;
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers(texture, { start, end: safeEnd }),
                frameRate: rate || 8,
                repeat: repeat !== undefined ? repeat : -1
            });
        };

        mkAnim('player_idle_down', 'player_idle_down', 0, 3, 6);
        mkAnim('player_idle_side', 'player_idle_side', 0, 3, 6);
        mkAnim('player_idle_up', 'player_idle_up', 0, 3, 6);
        mkAnim('player_walk_down', 'player_walk_down', 0, 5, 10);
        mkAnim('player_walk_side', 'player_walk_side', 0, 5, 10);
        mkAnim('player_walk_up', 'player_walk_up', 0, 5, 10);
        mkAnim('player_attack_down', 'player_attack_down', 0, 7, 16, 0);
        mkAnim('player_attack_side', 'player_attack_side', 0, 7, 16, 0);
        mkAnim('player_attack_up', 'player_attack_up', 0, 7, 16, 0);
        mkAnim('player_hit_down', 'player_hit_down', 0, 3, 12, 0);
        mkAnim('player_death_down', 'player_death_down', 0, 7, 8, 0);

        const enemyTypes = [
            'skeleton_rogue', 'skeleton_warrior', 'skeleton_mage', 'skeleton_base',
            'orc_rogue', 'orc_warrior', 'orc_shaman', 'orc_base'
        ];
        enemyTypes.forEach(k => {
            mkAnim('enemy_' + k + '_idle', 'enemy_' + k, 0, 3, 6);
        });

        ['knight', 'rogue', 'wizard'].forEach(k => {
            mkAnim('npc_' + k + '_idle', 'npc_' + k, 0, 3, 6);
        });

        this.scene.start('TitleScene');
    }
}

/**
 * TitleScene - Main menu with title and buttons
 */
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        AudioSystem.bindSceneInput(this);

        const overlayScenes = ['InventoryScene', 'HelpScene', 'PauseScene', 'DialogScene', 'ShopScene', 'BlacksmithScene'];
        overlayScenes.forEach((sceneKey) => {
            if (this.scene.isActive(sceneKey)) {
                this.scene.stop(sceneKey);
            }
        });

        GameState.ensureRunModifiers();

        this.add.text(width / 2, height / 2 - 80, '七宗罪', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 30, 'SEVEN DEADLY SINS', {
            fontSize: '20px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        const hasSave = !!localStorage.getItem('sevenSinsSave');

        const startBtn = this.add.text(width / 2, height / 2 + 40, '[ 开始游戏 ]', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const continueBtn = this.add.text(width / 2, height / 2 + 90, '[ 继续游戏 ]', {
            fontSize: '24px',
            fill: hasSave ? '#ffffff' : '#555555'
        }).setOrigin(0.5).setInteractive({ useHandCursor: hasSave });

        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#ff4444' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#ffffff' }));
        startBtn.on('pointerdown', () => {
            AudioSystem.playUi('ui');
            GameState.reset();
            GameState.addItem('hpPotion', 3);
            this.scene.start('HubScene');
        });

        if (hasSave) {
            continueBtn.on('pointerover', () => continueBtn.setStyle({ fill: '#ff4444' }));
            continueBtn.on('pointerout', () => continueBtn.setStyle({ fill: '#ffffff' }));
            continueBtn.on('pointerdown', () => {
                AudioSystem.playUi('ui');
                GameState.load();
                this.scene.start('HubScene');
            });
        }

        const guideBtn = this.add.text(width / 2, height / 2 + 140, '[ 操作指引 ]', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        guideBtn.on('pointerover', () => guideBtn.setStyle({ fill: '#ff4444' }));
        guideBtn.on('pointerout', () => guideBtn.setStyle({ fill: '#ffffff' }));
        guideBtn.on('pointerdown', () => {
            AudioSystem.playUi('ui');
            this.scene.pause();
            this.scene.launch('HelpScene', { parentScene: 'TitleScene' });
        });
    }
}

/**
 * Player - Character with movement, combat, dodge, and weapon system
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        const tex = scene.textures.exists('player_idle_down') ? 'player_idle_down' : '__DEFAULT';
        super(scene, x, y, tex);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const cfg = GAME_CONFIG.PLAYER;
        this.hp = cfg.maxHp;
        this.maxHp = cfg.maxHp;
        this.stamina = cfg.maxStamina;
        this.maxStamina = cfg.maxStamina;
        this.weapons = ['sword'];
        this.currentWeaponIndex = 0;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.isDodging = false;
        this.dodgeLockoutMsRemaining = 0;
        this.dodgeCooldownTimer = 0;
        this.isInvincible = false;
        this.isAttacking = false;
        this.knockbackTimer = 0;
        this.controlInvertTimer = 0;
        this._controlInvertFx = false;
        this.facingAngle = 0;
        this._invincibleTimer = 0;
        this._damageAppliedThisHit = false;
        this.activeStatusEffects = {};
        this.statusResistanceUntil = 0;
        this.damageBuffUntil = 0;
        this.damageBuffMultiplier = 1;
        this._animDir = 'down';
        this._animState = 'idle';
        this._weaponVisualDirty = true;

        this.setScale(1.5);
        this.body.setSize(20, 24);
        this.body.setOffset(22, 36);
        this.setCollideWorldBounds(true);
        this.setDepth(10);
        this._wasdKeys = scene.input.keyboard.addKeys('W,A,S,D');
        this._aimKeys = scene.input.keyboard.addKeys('I,J,K,L');
        this.weaponVisual = scene.add.graphics();
        this.weaponVisual.setDepth(11);
        this.statusAura = scene.add.graphics();
        this.statusAura.setDepth(12);
        this.play('player_idle_down');
    }

    get currentWeaponKey() {
        return this.weapons[this.currentWeaponIndex];
    }

    get currentWeapon() {
        if (!Array.isArray(this.weapons) || this.weapons.length === 0) return WEAPONS.sword;
        if (this.currentWeaponIndex < 0 || this.currentWeaponIndex >= this.weapons.length) {
            this.currentWeaponIndex = 0;
        }
        const key = this.weapons[this.currentWeaponIndex];
        const level = getCoreWeaponLevel(GameState.weaponLevels, key);
        const scaled = getCoreScaledWeaponStats(WEAPONS, key, level, WEAPON_SCALING);
        return scaled || WEAPONS[key] || WEAPONS.sword;
    }

    setWeapons(weaponKeys, preferredWeaponKey) {
        const normalized = (Array.isArray(weaponKeys) ? weaponKeys : [])
            .filter(k => !!WEAPONS[k]);
        this.weapons = normalized.length > 0 ? normalized : ['sword'];
        const wanted = preferredWeaponKey && this.weapons.includes(preferredWeaponKey)
            ? preferredWeaponKey
            : this.weapons[0];
        this.currentWeaponIndex = this.weapons.indexOf(wanted);
        this._syncSelectedWeapon();
        this._weaponVisualDirty = true;
    }

    _syncSelectedWeapon() {
        if (!Array.isArray(this.weapons) || this.weapons.length === 0) return;
        GameState.selectedWeaponKey = this.weapons[this.currentWeaponIndex] || this.weapons[0];
        this._weaponVisualDirty = true;
    }

    _drawWeaponVisual() {
        if (!this.weaponVisual || !this.weaponVisual.active) return;
        const weaponKey = this.weapons[this.currentWeaponIndex] || 'sword';
        const weapon = WEAPONS[weaponKey] || WEAPONS.sword;
        const angle = this.facingAngle || 0;
        const r = 16;
        const hx = this.x + Math.cos(angle) * r;
        const hy = this.y + Math.sin(angle) * r;
        this.weaponVisual.clear();
        this.weaponVisual.setPosition(hx, hy);
        this.weaponVisual.setRotation(angle);

        // Lightweight in-world UI for equipped weapon.
        if (weapon.attackPattern === 'projectile') {
            this.weaponVisual.fillStyle(0xC8B27A, 1);
            this.weaponVisual.fillRect(-7, -1, 12, 2);
            this.weaponVisual.fillStyle(0xF0E6C8, 1);
            this.weaponVisual.fillTriangle(5, -2, 5, 2, 9, 0);
        } else if (weapon.attackPattern === 'magic') {
            this.weaponVisual.fillStyle(0xA675D1, 1);
            this.weaponVisual.fillCircle(0, 0, 4);
            this.weaponVisual.fillStyle(0xE9D4FF, 0.8);
            this.weaponVisual.fillCircle(0, 0, 2);
        } else if (weapon.attackPattern === 'slam') {
            this.weaponVisual.fillStyle(0x8D8D95, 1);
            this.weaponVisual.fillRect(-4, -2, 8, 4);
            this.weaponVisual.fillStyle(0xB8B8C2, 1);
            this.weaponVisual.fillRect(2, -1, 6, 2);
        } else if (weapon.attackPattern === 'thrust') {
            this.weaponVisual.fillStyle(0xD8D8D8, 1);
            this.weaponVisual.fillRect(-8, -1, 7, 2);
            this.weaponVisual.fillRect(1, -1, 7, 2);
        } else {
            this.weaponVisual.fillStyle(0xE6E6E6, 1);
            this.weaponVisual.fillRect(-7, -1, 14, 2);
        }

        this._weaponVisualDirty = false;
    }

    _playAnim(state, dir) {
        if (state === this._animState && dir === this._animDir) return;
        const key = 'player_' + state + '_' + dir;
        if (this.scene.anims.exists(key)) {
            this._animState = state;
            this._animDir = dir;
            this.play(key, true);
        }
    }

    _getDirection() {
        const angle = this.facingAngle;
        const deg = Phaser.Math.RadToDeg(angle);
        if (deg > -45 && deg <= 45) { this.setFlipX(false); return 'side'; }
        if (deg > 45 && deg <= 135) return 'down';
        if (deg > -135 && deg <= -45) return 'up';
        this.setFlipX(true);
        return 'side';
    }

    update(time, delta) {
        const cfg = GAME_CONFIG.PLAYER;
        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const dt = delta / 1000;

        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.specialCooldown > 0) this.specialCooldown -= delta;
        if (this.dodgeLockoutMsRemaining > 0) this.dodgeLockoutMsRemaining = Math.max(0, this.dodgeLockoutMsRemaining - delta);
        if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer -= delta;
        if (this.knockbackTimer > 0) this.knockbackTimer -= delta;
        if (this.controlInvertTimer > 0) {
            this.controlInvertTimer -= delta;
            if (this.controlInvertTimer <= 0) {
                this.controlInvertTimer = 0;
                if (this._controlInvertFx) {
                    this.clearTint();
                    this._controlInvertFx = false;
                }
            }
        }

        if (this._invincibleTimer !== undefined && this._invincibleTimer > 0) {
            this._invincibleTimer -= delta;
            if (this._invincibleTimer <= 0) this.isInvincible = false;
        }

        this._updateStatusEffects(time);

        const aimState = resolveKeyboardAimState({
            up: this._aimKeys.I.isDown,
            down: this._aimKeys.K.isDown,
            left: this._aimKeys.J.isDown,
            right: this._aimKeys.L.isDown,
            fallbackAngle: this.facingAngle
        });
        this.facingAngle = aimState.angle;

        let moving = false;
        if (!this.isDodging && this.knockbackTimer <= 0) {
            let vx = 0, vy = 0;
            if (this._wasdKeys.W.isDown) vy -= 1;
            if (this._wasdKeys.S.isDown) vy += 1;
            if (this._wasdKeys.A.isDown) vx -= 1;
            if (this._wasdKeys.D.isDown) vx += 1;
            if (this.controlInvertTimer > 0) {
                vx *= -1;
                vy *= -1;
                if (!this._controlInvertFx) {
                    this.setTint(0xF8A5FF);
                    this._controlInvertFx = true;
                }
            }
            if (vx !== 0 && vy !== 0) {
                const norm = 0.707;
                vx *= norm;
                vy *= norm;
            }
            const speedScale = this._getMoveSpeedMultiplier(time);
            this.setVelocity(vx * cfg.speed * speedScale, vy * cfg.speed * speedScale);
            moving = vx !== 0 || vy !== 0;
        }

        const dir = this._getDirection();
        if (!this.isAttacking) {
            this._playAnim(moving ? 'walk' : 'idle', dir);
        }

        if (this._weaponVisualDirty || moving || this.isAttacking || this.isDodging) {
            this._drawWeaponVisual();
        }

        if (!this.isAttacking && !this.isDodging) {
            const regenScale = runEffects.playerStaminaRegenMultiplier || 1;
            this.stamina = Math.min(this.maxStamina, this.stamina + cfg.staminaRegen * regenScale * dt);
        }
    }

    tryDodge() {
        const cfg = GAME_CONFIG.PLAYER;
        if (this.isDodging || this.dodgeCooldownTimer > 0 || this.stamina < cfg.dodgeStaminaCost) return;
        this.stamina -= cfg.dodgeStaminaCost;
        AudioSystem.playUi('dodge');
        this.isDodging = true;
        this.dodgeLockoutMsRemaining = cfg.dodgeDuration;
        this.isInvincible = true;
        this.setAlpha(0.5);
        const vx = Math.cos(this.facingAngle) * cfg.dodgeSpeed;
        const vy = Math.sin(this.facingAngle) * cfg.dodgeSpeed;
        this.setVelocity(vx, vy);
        this.scene.time.delayedCall(cfg.iframeDuration, () => {
            if (this.isInvincible && this.isDodging) this.isInvincible = false;
        });
        this.scene.time.delayedCall(cfg.dodgeDuration, () => {
            this.isDodging = false;
            this.dodgeLockoutMsRemaining = 0;
            this.setAlpha(1);
            this.setVelocity(0, 0);
            this.dodgeCooldownTimer = cfg.dodgeCooldown;
        });
    }

    freezeForDeath() {
        this.setVelocity(0, 0);
        if (this.body) this.body.setVelocity(0, 0);
        this.isDodging = false;
        this.dodgeLockoutMsRemaining = 0;
        this.isAttacking = false;
        this.isInvincible = false;
        this._invincibleTimer = 0;
        this.knockbackTimer = 0;
        this.setAlpha(1);
        if (this._controlInvertFx) {
            this.clearTint();
            this._controlInvertFx = false;
        }

        // Ensure visual state cannot remain in a stale walk/attack animation after death.
        if (this.scene && this.scene.anims && this.scene.anims.exists('player_death_down')) {
            this._animState = 'death';
            this._animDir = 'down';
            this.play('player_death_down', true);
        } else {
            this._animState = 'idle';
            this._animDir = 'down';
            this._playAnim('idle', 'down');
        }
    }

    freezeForCinematic() {
        this.freezeForDeath();
        if (this.weaponVisual && this.weaponVisual.active) this.weaponVisual.clear();
        if (this.statusAura && this.statusAura.active) this.statusAura.clear();
    }

    tryAttack() {
        const weapon = this.currentWeapon;
        if (!weapon) return null;
        if (this.attackCooldown > 0 || this.stamina < weapon.staminaCost || this.isDodging) return null;
        this.stamina -= weapon.staminaCost;
        this.attackCooldown = weapon.attackSpeed;
        this.isAttacking = true;
        const dir = this._getDirection();
        this._playAnim('attack', dir);
        this.scene.time.delayedCall(250, () => { this.isAttacking = false; });
        AudioSystem.playAttack(false);
        const damage = Math.round(weapon.damage * this.getDamageMultiplier());
        return this._spawnHitbox(damage, 1, false);
    }

    trySpecialAttack() {
        const weapon = this.currentWeapon;
        if (!weapon) return null;
        if (this.specialCooldown > 0 || this.stamina < weapon.specialStaminaCost || this.isDodging) return null;
        this.stamina -= weapon.specialStaminaCost;
        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const specialCdScale = runEffects.playerSpecialCooldownMultiplier || 1;
        this.specialCooldown = Math.max(450, Math.round(weapon.specialCooldown * specialCdScale));
        this.isAttacking = true;
        const dir = this._getDirection();
        this._playAnim('attack', dir);
        this.scene.time.delayedCall(250, () => { this.isAttacking = false; });
        AudioSystem.playAttack(true);
        const damage = Math.round(weapon.damage * 2 * this.getDamageMultiplier());
        return this._spawnHitbox(damage, 2, true);
    }

    _spawnHitbox(damage, scale, isSpecial) {
        const weapon = this.currentWeapon;
        const weaponKey = this.currentWeaponKey || 'sword';
        const specialStatus = isSpecial ? getWeaponSpecialStatus(weaponKey) : null;
        const statusPayload = specialStatus
            ? {
                key: specialStatus.key,
                durationMs: specialStatus.durationMs,
                sourceDamage: damage
            }
            : null;
        const offset = weapon.range * 0.5;
        const angle = this.facingAngle;
        const hx = this.x + Math.cos(angle) * offset;
        const hy = this.y + Math.sin(angle) * offset;

        if (weapon.attackPattern === 'projectile') {
            // Bow: fast single arrow
            const arrow = this.scene.add.graphics();
            arrow.fillStyle(0xCCBB88, 1);
            arrow.fillRect(-12, -2, 24, 4);
            arrow.fillStyle(0xFFFFFF, 1);
            arrow.fillTriangle(12, -4, 12, 4, 18, 0);
            arrow.setPosition(this.x, this.y);
            arrow.setRotation(angle);
            arrow.setDepth(5);
            arrow.damage = damage;
            arrow.hitRadius = 10 * scale;
            arrow.isSpecial = !!isSpecial;
            arrow.statusEffect = statusPayload;
            this.scene.physics.add.existing(arrow);
            arrow.body.setVelocity(Math.cos(angle) * 450, Math.sin(angle) * 450);
            this.scene.time.delayedCall(800, () => { if (arrow.active) arrow.destroy(); });
            return arrow;
        } else if (weapon.attackPattern === 'magic') {
            // Staff: slower, larger magic orb that pierces
            const orb = this.scene.add.graphics();
            const orbScale = isSpecial ? 1.5 : 1;
            orb.fillStyle(0x9B59B6, 0.8);
            orb.fillCircle(0, 0, 10 * orbScale);
            orb.fillStyle(0xE8DAEF, 0.6);
            orb.fillCircle(0, 0, 5 * orbScale);
            orb.setPosition(this.x, this.y);
            orb.setDepth(5);
            orb.damage = damage;
            orb.hitRadius = 12 * orbScale;
            orb.isSpecial = !!isSpecial;
            orb._pierceHits = [];
            orb.statusEffect = statusPayload;
            this.scene.physics.add.existing(orb);
            orb.body.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
            this.scene.time.delayedCall(1200, () => { if (orb.active) orb.destroy(); });
            return orb;
        } else if (weapon.attackPattern === 'slam') {
            // Hammer: short range ground slam with larger area
            const slam = this.scene.add.graphics();
            slam.fillStyle(0x888888, 0.5);
            slam.fillCircle(0, 0, 40 * scale);
            slam.setPosition(hx, hy);
            slam.setDepth(5);
            slam.damage = damage;
            slam.hitRadius = 40 * scale;
            slam.isSpecial = !!isSpecial;
            slam.x = hx;
            slam.y = hy;
            slam.statusEffect = statusPayload;
            this.scene.cameras.main.shake(100, 0.01);
            this.scene.time.delayedCall(200, () => { if (slam.active) slam.destroy(); });
            return slam;
        } else if (weapon.attackPattern === 'thrust') {
            // Dual blades: two quick hitboxes in rapid succession
            const hitbox = this.scene.add.graphics();
            hitbox.fillStyle(0xCCCCCC, 0.7);
            hitbox.fillRect(-4, -15, 8, 30);
            hitbox.setPosition(hx, hy);
            hitbox.setRotation(angle);
            hitbox.setDepth(5);
            hitbox.damage = damage;
            hitbox.hitRadius = 14 * scale;
            hitbox.isSpecial = !!isSpecial;
            hitbox.x = hx;
            hitbox.y = hy;
            hitbox.statusEffect = statusPayload;
            this.scene.time.delayedCall(100, () => { if (hitbox.active) hitbox.destroy(); });
            // Second hit shortly after
            this.scene.time.delayedCall(120, () => {
                const hx2 = this.x + Math.cos(angle) * offset * 1.2;
                const hy2 = this.y + Math.sin(angle) * offset * 1.2;
                const h2 = this.scene.add.graphics();
                h2.fillStyle(0xCCCCCC, 0.7);
                h2.fillRect(-4, -15, 8, 30);
                h2.setPosition(hx2, hy2);
                h2.setRotation(angle);
                h2.setDepth(5);
                h2.damage = Math.floor(damage * 0.6);
                h2.hitRadius = 14 * scale;
                h2.isSpecial = !!isSpecial;
                h2.x = hx2;
                h2.y = hy2;
                h2.statusEffect = statusPayload
                    ? { ...statusPayload, sourceDamage: h2.damage }
                    : null;
                this.scene.time.delayedCall(100, () => { if (h2.active) h2.destroy(); });
            });
            return hitbox;
        } else {
            // Sword (sweep): default melee arc
            const hitbox = this.scene.add.sprite(hx, hy, 'projectile');
            hitbox.setScale(scale);
            hitbox.damage = damage;
            hitbox.hitRadius = 18 * scale;
            hitbox.isSpecial = !!isSpecial;
            hitbox.statusEffect = statusPayload;
            hitbox.setDepth(5);
            this.scene.time.delayedCall(150, () => { if (hitbox.active) hitbox.destroy(); });
            return hitbox;
        }
    }

    takeDamage(amount, options) {
        const opts = options || {};
        this._damageAppliedThisHit = false;
        if (this.isInvincible && !opts.ignoreInvincibility) return false;

        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const incomingScale = opts.ignoreRunModifier ? 1 : (runEffects.playerDamageTakenMultiplier || 1);
        const finalDamage = Math.max(1, Math.round((Number(amount) || 0) * incomingScale));
        this.hp = Math.max(0, this.hp - finalDamage);
        this._damageAppliedThisHit = true;

        if (!opts.silent) {
            AudioSystem.playHit();
            showFloatingCombatText(this.scene, this.x, this.y - 34, '-' + finalDamage, '#ff8a8a', 520);
        }
        if (!opts.noIframes && !opts.ignoreInvincibility) {
            this.isInvincible = true;
            this._invincibleTimer = 200;
            this.knockbackTimer = 200;
        }
        if (!opts.noFlash) {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                duration: 50,
                yoyo: true,
                repeat: 1,
                onComplete: () => this.setAlpha(1)
            });
        }
        return this.hp <= 0;
    }

    getDamageMultiplier() {
        const now = this.scene.time.now;
        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        let mult = runEffects.playerDamageMultiplier || 1;
        if (now < this.damageBuffUntil) mult *= this.damageBuffMultiplier || 1;
        return mult;
    }

    _getMoveSpeedMultiplier(now) {
        let speedMult = 1;
        Object.entries(this.activeStatusEffects).forEach(([statusKey, state]) => {
            if (!state || now >= state.expiresAt) return;
            const def = getStatusEffectDef(statusKey);
            if (def && Number.isFinite(def.speedMultiplier) && def.speedMultiplier > 0) {
                speedMult = Math.min(speedMult, def.speedMultiplier);
            }
        });
        return Math.max(0.45, speedMult);
    }

    _updateStatusEffects(now) {
        const keys = Object.keys(this.activeStatusEffects || {});
        this.statusAura.clear();
        if (keys.length === 0) return;

        let ringIndex = 0;
        keys.forEach((statusKey) => {
            const state = this.activeStatusEffects[statusKey];
            if (!state) return;
            if (now >= state.expiresAt) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            const def = getStatusEffectDef(statusKey);
            if (!def) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            if (def.tickMs > 0 && now >= state.nextTickAt) {
                const tickDamage = computeStatusTickDamage(statusKey, state.sourceDamage || 0, 1);
                if (tickDamage > 0) {
                    this.takeDamage(tickDamage, {
                        ignoreInvincibility: true,
                        noIframes: true,
                        noFlash: true,
                        silent: true,
                        ignoreRunModifier: true
                    });
                    showFloatingCombatText(
                        this.scene,
                        this.x,
                        this.y - 46,
                        '-' + tickDamage + ' ' + getStatusLabel(statusKey),
                        '#' + getStatusColor(statusKey).toString(16).padStart(6, '0'),
                        500
                    );
                }
                state.nextTickAt = now + def.tickMs;
            }

            const color = getStatusColor(statusKey);
            this.statusAura.lineStyle(2, color, 0.65);
            this.statusAura.strokeCircle(this.x, this.y - 6, 18 + ringIndex * 4);
            ringIndex++;
        });
    }

    applyStatusEffect(statusKey, opts) {
        const now = this.scene.time.now;
        if (now < this.statusResistanceUntil) {
            showFloatingCombatText(this.scene, this.x, this.y - 54, '抗性', '#9effd6', 500);
            return false;
        }
        const def = getStatusEffectDef(statusKey);
        if (!def) return false;
        const options = opts || {};
        const duration = Math.max(600, Math.round(options.durationMs || def.durationMs || 1200));
        const existing = this.activeStatusEffects[statusKey];
        const sourceDamage = Math.max(1, Math.round(options.sourceDamage || this.currentWeapon.damage || 10));
        this.activeStatusEffects[statusKey] = {
            key: statusKey,
            expiresAt: now + duration,
            nextTickAt: existing && existing.nextTickAt ? existing.nextTickAt : now + (def.tickMs || 0),
            sourceDamage
        };
        showFloatingCombatText(
            this.scene,
            this.x,
            this.y - 58,
            getStatusLabel(statusKey),
            '#' + getStatusColor(statusKey).toString(16).padStart(6, '0'),
            700
        );
        return true;
    }

    clearStatusEffects() {
        this.activeStatusEffects = {};
        this.statusAura.clear();
    }

    applyCleanseWard(durationMs) {
        this.clearStatusEffects();
        this.controlInvertTimer = 0;
        if (this._controlInvertFx) {
            this.clearTint();
            this._controlInvertFx = false;
        }
        const duration = Math.max(1000, durationMs || 4000);
        this.statusResistanceUntil = Math.max(this.statusResistanceUntil, this.scene.time.now + duration);
        showFloatingCombatText(this.scene, this.x, this.y - 54, '净化护佑', '#9effd6', 900);
    }

    applyBattleFocus(durationMs, multiplier) {
        this.damageBuffUntil = Math.max(this.damageBuffUntil, this.scene.time.now + (durationMs || 8000));
        this.damageBuffMultiplier = Math.max(1, Number(multiplier) || 1.2);
        showFloatingCombatText(this.scene, this.x, this.y - 54, '战意高涨', '#ffcf66', 900);
    }

    getStatusSummary() {
        const summary = this.getStatusHudSummary();
        return [...summary.debuffs, ...summary.buffs];
    }

    getStatusHudSummary() {
        const now = this.scene.time.now;
        const activeStatuses = Object.entries(this.activeStatusEffects).map(([statusKey, state]) => ({
            key: statusKey,
            remainingMs: state && Number.isFinite(state.expiresAt) ? state.expiresAt - now : 0
        }));
        return buildStatusHudSummary({
            activeStatuses,
            controlInvertMs: this.controlInvertTimer,
            statusResistanceMs: Math.max(0, this.statusResistanceUntil - now),
            damageBuffMs: Math.max(0, this.damageBuffUntil - now),
            damageBuffMultiplier: this.damageBuffMultiplier
        });
    }

    applyReverseControl(durationMs) {
        const duration = Math.max(300, durationMs || 2200);
        const wasActive = this.controlInvertTimer > 0;
        this.controlInvertTimer = Math.max(this.controlInvertTimer, duration);
        if (!this._controlInvertFx) {
            this.setTint(0xF8A5FF);
            this._controlInvertFx = true;
        }
        if (!wasActive) {
            const text = this.scene.add.text(this.x, this.y - 60, '控制反转!', {
                fontSize: '16px',
                fill: '#ff77ff'
            }).setOrigin(0.5).setDepth(30);
            this.scene.tweens.add({
                targets: text,
                y: text.y - 30,
                alpha: 0,
                duration: 900,
                onComplete: () => text.destroy()
            });
        }
    }

    switchWeaponLeft() {
        this.currentWeaponIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
        this._syncSelectedWeapon();
        this._drawWeaponVisual();
    }

    switchWeaponRight() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        this._syncSelectedWeapon();
        this._drawWeaponVisual();
    }

    destroy(fromScene) {
        if (this.weaponVisual && this.weaponVisual.active) this.weaponVisual.destroy();
        if (this.statusAura && this.statusAura.active) this.statusAura.destroy();
        super.destroy(fromScene);
    }
}

/**
 * Enemy - AI-driven enemy with patrol/chase/attack states and HP bar
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, configKey) {
        const config = ENEMIES[configKey];
        if (!config) throw new Error('Unknown enemy config: ' + configKey);

        const spriteKey = config.sprite || 'skeleton_base';
        const textureKey = 'enemy_' + spriteKey;
        const tex = scene.textures.exists(textureKey) ? textureKey : '__DEFAULT';
        super(scene, x, y, tex);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.configKey = configKey;
        this.spriteKey = spriteKey;
        this.setScale(2);
        this.body.setSize(16, 20);
        this.body.setOffset(8, 10);
        this.setTint(config.color);
        this.setDepth(9);

        const animKey = 'enemy_' + spriteKey + '_idle';
        if (scene.anims.exists(animKey)) this.play(animKey);

        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const hpScale = runEffects.enemyHpMultiplier || 1;
        const speedScale = runEffects.enemySpeedMultiplier || 1;
        this.hp = Math.max(1, Math.round(config.hp * hpScale));
        this.maxHp = this.hp;
        this.damage = config.damage;
        this.speed = Math.max(20, Math.round(config.speed * speedScale));
        this.baseSpeed = this.speed;
        this.drops = config.drops || {};
        this.onHitStatus = config.onHitStatus || null;
        this.activeStatusEffects = {};

        this.state = 'patrol';
        this.detectionRange = 200;
        this.attackRange = 40;
        this.patrolTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.attackCooldown = 0;
        this.attackCooldownMs = 1000;
        this.isAlive = true;

        // HP bar: background (30×4, 0x333333) and fill (30×4, red)
        this.hpBarBg = scene.add.graphics();
        this.hpBarBg.fillStyle(0x333333, 1);
        this.hpBarBg.fillRect(-15, -28, 30, 4);
        this.hpBarBg.setDepth(9);

        this.hpBarFill = scene.add.graphics();
        this.hpBarFill.fillStyle(0xE74C3C, 1);
        this.hpBarFill.fillRect(-15, -28, 30, 4);
        this.hpBarFill.setDepth(9);
        this.statusAura = scene.add.graphics();
        this.statusAura.setDepth(8);

        this.setCollideWorldBounds(true);
    }

    update(time, delta, playerSprite) {
        if (this.state === 'dead') return;

        // Update attack cooldown
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        const moveScale = this._updateStatusEffects(time);

        if (this.state === 'dead') return;

        const dist = playerSprite
            ? Phaser.Math.Distance.Between(this.x, this.y, playerSprite.x, playerSprite.y)
            : Infinity;

        const cooldownReady = this.attackCooldown <= 0;

        if (dist < this.attackRange && cooldownReady) {
            this.state = 'attack';
        } else if (dist < this.detectionRange) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        if (this.state === 'patrol') {
            this.patrolTimer -= delta;
            if (this.patrolTimer <= 0) {
                this.patrolTimer = 2000;
                const r = 80;
                this.targetX = this.x + (Math.random() - 0.5) * 2 * r;
                this.targetY = this.y + (Math.random() - 0.5) * 2 * r;
            }
            const patrolSpeed = this.speed * 0.3 * moveScale;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
            this.setVelocity(Math.cos(angle) * patrolSpeed, Math.sin(angle) * patrolSpeed);
        } else if (this.state === 'chase') {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, playerSprite.x, playerSprite.y);
            this.setVelocity(Math.cos(angle) * this.speed * moveScale, Math.sin(angle) * this.speed * moveScale);
        } else if (this.state === 'attack') {
            this.setVelocity(0, 0);
            this.attackCooldown = this.attackCooldownMs;
        }

        this.hpBarBg.setPosition(this.x, this.y);
        this.hpBarFill.setPosition(this.x, this.y);
        const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
        this.hpBarFill.clear();
        this.hpBarFill.fillStyle(0xE74C3C, 1);
        this.hpBarFill.fillRect(-15, -28, 30 * hpRatio, 4);
        if (this.statusAura) this.statusAura.setPosition(this.x, this.y);

        return this.state === 'attack';
    }

    _updateStatusEffects(now) {
        let moveMult = 1;
        if (!this.statusAura) return moveMult;
        this.statusAura.clear();
        let ringIndex = 0;
        Object.entries(this.activeStatusEffects).forEach(([statusKey, state]) => {
            if (!this.isAlive) return;
            if (!state || now >= state.expiresAt) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            const def = getStatusEffectDef(statusKey);
            if (!def) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            if (def.tickMs > 0 && now >= state.nextTickAt) {
                const tickDamage = computeStatusTickDamage(statusKey, state.sourceDamage || 0, 1);
                if (tickDamage > 0) {
                    const drops = this.takeDamage(tickDamage, { silent: true, noFlash: true });
                    if (drops) this._statusDrops = drops;
                }
                if (!this.isAlive) return;
                state.nextTickAt = now + def.tickMs;
            }
            if (def.speedMultiplier && def.speedMultiplier > 0) {
                moveMult = Math.min(moveMult, def.speedMultiplier);
            }
            if (this.statusAura) {
                this.statusAura.lineStyle(2, getStatusColor(statusKey), 0.7);
                this.statusAura.strokeCircle(0, -6, 18 + ringIndex * 4);
            }
            ringIndex++;
        });
        return Math.max(0.45, moveMult);
    }

    applyStatusEffect(statusKey, opts) {
        const def = getStatusEffectDef(statusKey);
        if (!def || !this.isAlive) return false;
        const now = this.scene.time.now;
        const options = opts || {};
        const duration = Math.max(600, Math.round(options.durationMs || def.durationMs || 1200));
        this.activeStatusEffects[statusKey] = {
            key: statusKey,
            expiresAt: now + duration,
            nextTickAt: now + (def.tickMs || 0),
            sourceDamage: Math.max(1, Math.round(options.sourceDamage || 8))
        };
        showFloatingCombatText(
            this.scene,
            this.x,
            this.y - 34,
            getStatusLabel(statusKey),
            '#' + getStatusColor(statusKey).toString(16).padStart(6, '0'),
            650
        );
        return true;
    }

    takeDamage(amount, options) {
        const opts = options || {};
        this.hp = Math.max(0, this.hp - amount);
        if (!opts.silent) AudioSystem.playHit();

        if (!opts.noFlash) {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                duration: 50,
                yoyo: true,
                repeat: 3,
                onComplete: () => this.setAlpha(1)
            });
        }

        if (this.hp <= 0) {
            this.state = 'dead';
            this.body.enable = false;
            this.setVisible(false);
            this.hpBarBg.destroy();
            this.hpBarFill.destroy();
            if (this.statusAura) {
                this.statusAura.clear();
                this.statusAura.destroy();
                this.statusAura = null;
            }
            this.isAlive = false;

            const drops = { gold: 0, items: [] };
            const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
            const goldScale = runEffects.goldDropMultiplier || 1;
            if (this.drops.gold != null) {
                if (Array.isArray(this.drops.gold) && this.drops.gold.length === 2) {
                    drops.gold = Math.round(Phaser.Math.Between(this.drops.gold[0], this.drops.gold[1]) * goldScale);
                } else {
                    drops.gold = Math.round(this.drops.gold * goldScale);
                }
            }
            drops.items.push(...this._rollExtraDrops());
            return drops;
        }
        return null;
    }

    _rollExtraDrops() {
        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const dropScale = runEffects.extraDropRateMultiplier || 1;
        const items = [];
        if (Math.random() < Math.min(0.95, ENEMY_EXTRA_DROP_CHANCE.hpPotion * dropScale)) items.push({ key: 'hpPotion', count: 1 });
        if (Math.random() < Math.min(0.95, ENEMY_EXTRA_DROP_CHANCE.staminaPotion * dropScale)) items.push({ key: 'staminaPotion', count: 1 });

        const areaKey = getAreaKeyFromEnemyKey(this.configKey);
        const materialKey = areaKey ? AREA_TO_MATERIAL_ITEM[areaKey] : null;
        if (materialKey && Math.random() < Math.min(0.9, ENEMY_EXTRA_DROP_CHANCE.material * dropScale)) {
            items.push({ key: materialKey, count: 1 });
        }
        return items;
    }

    destroy() {
        if (this.hpBarBg && this.hpBarBg.active) this.hpBarBg.destroy();
        if (this.hpBarFill && this.hpBarFill.active) this.hpBarFill.destroy();
        if (this.statusAura && this.statusAura.active) this.statusAura.destroy();
        super.destroy();
    }
}

/**
 * HubScene - Playable hub area
 */
class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        AudioSystem.bindSceneInput(this);
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = true;
            if (typeof this.input.keyboard.resetKeys === 'function') {
                this.input.keyboard.resetKeys();
            }
        }

        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.physics.world.setBounds(-500, -500, 2500, 2300);

        drawPixelTiledRect(this, -500, -500, 2500, 2300, 'hub', 0);

        const floorGfx = this.add.graphics();
        floorGfx.setDepth(1);
        floorGfx.lineStyle(1, 0x4a4236, 0.18);
        for (let y = -500; y < 1800; y += 64) {
            floorGfx.lineBetween(-500, y, 2000, y);
        }
        for (let x = -500; x < 2000; x += 64) {
            floorGfx.lineBetween(x, -500, x, 1800);
        }

        const centerX = 750;
        const centerY = 650;
        this.player = new Player(this, centerX, centerY);
        applyPlayerWeaponState(this.player);
        GameState.ensureRunEventRoom();

        this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
        this.cameras.main.setBounds(-500, -500, 2500, 2300);

        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => this.player.tryDodge());

        this.input.keyboard.on('keydown-Q', () => this.player.switchWeaponLeft());
        this.input.keyboard.on('keydown-E', () => this.player.switchWeaponRight());
        this.input.keyboard.on('keydown-ONE', () => handleQuickSlotUse(this, this.player, 0));
        this.input.keyboard.on('keydown-TWO', () => handleQuickSlotUse(this, this.player, 1));
        this.input.keyboard.on('keydown-THREE', () => handleQuickSlotUse(this, this.player, 2));
        this.input.keyboard.on('keydown-FOUR', () => handleQuickSlotUse(this, this.player, 3));
        this.input.keyboard.on('keydown-TAB', (event) => {
            event.preventDefault();
            if (this.scene.isActive('InventoryScene')) this.scene.stop('InventoryScene');
            else this.scene.launch('InventoryScene');
        });
        this.input.keyboard.on('keydown-ESC', () => openPauseMenu(this));

        this.input.on('pointerdown', (pointer) => {
            if (pointer.button === 0) this.player.tryAttack();
            else if (pointer.button === 2) this.player.trySpecialAttack();
        });
        this.input.keyboard.on('keydown-U', () => this.player.tryAttack());
        this.input.keyboard.on('keydown-O', () => this.player.trySpecialAttack());
        this.input.keyboard.on('keydown-H', () => {
            if (!this.scene.isActive('HelpScene')) {
                this.scene.pause();
                this.scene.launch('HelpScene', { parentScene: 'HubScene' });
            }
        });

        const bossKeys = ['pride', 'envy', 'wrath', 'sloth', 'greed', 'gluttony', 'lust'];
        this.portalGroup = this.physics.add.group({ allowGravity: false });
        this.portals = [];
        bossKeys.forEach((key, i) => {
            const angle = Math.PI + (Math.PI / (bossKeys.length - 1)) * i;
            const px = 750 + Math.cos(angle) * 300;
            const py = 650 + Math.sin(angle) * 300;

            const portal = this.physics.add.sprite(px, py, 'portal');
            portal.setTint(BOSSES[key].color);
            portal.setDepth(5);
            portal.body.setCircle(24);
            portal.body.moves = false;
            portal.body.setImmovable(true);

            const label = this.add.text(px, py - 35, BOSSES[key].sin + ' ' + BOSSES[key].area, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0.5).setDepth(5);

            portal.bossKey = key;
            portal.label = label;
            this.portals.push(portal);
            this.portalGroup.add(portal);
        });

        this._portalTransitioning = false;
        this._pendingPortalBossKey = null;
        this.physics.add.overlap(this.player, this.portalGroup, (_player, portal) => {
            if (this._portalTransitioning) return;
            const bossKey = portal && portal.bossKey;
            if (!bossKey) return;
            this._portalTransitioning = true;
            this._pendingPortalBossKey = bossKey;
        });

        this.portals.forEach(portal => {
            const defeated = GameState.defeatedBosses.includes(portal.bossKey);
            if (defeated) {
                portal.setTint(0x666666);
                portal.label.setText(BOSSES[portal.bossKey].sin + ' ' + BOSSES[portal.bossKey].area + ' ✓');
            }
        });

        // Final Boss portal — appears when all 7 seals collected
        if (GameState.sinSeals.length >= 7 && BOSSES.final) {
            const fpx = 750;
            const fpy = 350;
            const finalPortal = this.physics.add.sprite(fpx, fpy, 'portal');
            finalPortal.setTint(0xFFFFFF);
            finalPortal.setScale(1.5);
            finalPortal.setDepth(6);
            finalPortal.body.setCircle(24);
            finalPortal.body.moves = false;
            finalPortal.body.setImmovable(true);
            finalPortal.bossKey = 'final';

            const finalLabel = this.add.text(fpx, fpy - 45, '⚠ 原罪 · 虚无深渊', {
                fontSize: '16px',
                fill: '#FFD700',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(6);
            finalPortal.label = finalLabel;

            this.portalGroup.add(finalPortal);
            this.portals.push(finalPortal);

            // Pulsing animation for the final portal
            this.tweens.add({
                targets: finalPortal,
                scaleX: 1.8,
                scaleY: 1.8,
                alpha: 0.6,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            if (GameState.defeatedBosses.includes('final')) {
                finalPortal.setTint(0x666666);
                finalLabel.setText('原罪 · 虚无深渊 ✓');
            }
        }

        const npcPositions = [
            { key: 'blacksmith', x: 600, y: 500, sprite: 'knight' },
            { key: 'merchant', x: 750, y: 500, sprite: 'rogue' },
            { key: 'sage', x: 900, y: 500, sprite: 'wizard' }
        ];
        this.npcs = [];
        npcPositions.forEach(({ key, x, y, sprite }) => {
            const npcData = HUB_NPCS[key];
            const texKey = 'npc_' + sprite;
            const actualTex = this.textures.exists(texKey) ? texKey : '__DEFAULT';
            const npc = this.add.sprite(x, y, actualTex);
            npc.setScale(2);
            npc.setDepth(8);
            npc.npcKey = key;
            const animKey = 'npc_' + sprite + '_idle';
            if (this.anims.exists(animKey)) npc.play(animKey);

            const label = this.add.text(x, y - 35, npcData.name, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0.5).setDepth(8);

            const indicator = this.add.text(x, y - 55, '按F交互', {
                fontSize: '12px',
                fill: '#FFD700'
            }).setOrigin(0.5).setDepth(8).setVisible(false);

            this.physics.add.existing(npc);
            npc.body.setCircle(20);
            npc.body.setAllowGravity(false);
            npc.body.moves = false;
            npc.body.setImmovable(true);

            npc.label = label;
            npc.indicator = indicator;
            this.npcs.push(npc);
        });

        this.nearestNpc = null;
        this.input.keyboard.on('keydown-F', () => {
            if (this.scene.isActive('ShopScene') || this.scene.isActive('BlacksmithScene') || this.scene.isActive('DialogScene')) return;
            if (this.nearestNpc) {
                const key = this.nearestNpc.npcKey;
                if (key === 'sage') {
                    this.scene.launch('DialogScene', {
                        dialog: HUB_NPCS.sage.dialog,
                        onComplete: () => this.scene.stop('DialogScene')
                    });
                } else if (key === 'merchant') {
                    this.scene.launch('ShopScene');
                } else if (key === 'blacksmith') {
                    this.scene.launch('BlacksmithScene');
                }
            }
        });

        this._createMiniMap();
        this.scene.launch('UIScene');

        GameState.save();
        const saveText = this.add.text(this.cameras.main.width / 2, 40, '已保存', {
            fontSize: '20px',
            fill: '#4a90d9'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        this.tweens.add({
            targets: saveText,
            alpha: 0,
            duration: 500,
            delay: 1500,
            onComplete: () => saveText.destroy()
        });

        if (!localStorage.getItem('sevenSins_helpSeen')) {
            localStorage.setItem('sevenSins_helpSeen', '1');
            const hint = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height - 40,
                '按 H 查看操作指引',
                { fontSize: '18px', fill: '#FFD700' }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);
            this.tweens.add({
                targets: hint,
                alpha: 1,
                duration: 600,
                onComplete: () => {
                    this.tweens.add({
                        targets: hint,
                        alpha: 0,
                        duration: 1000,
                        delay: 5000,
                        onComplete: () => hint.destroy()
                    });
                }
            });
        }
    }

    _createMiniMap() {
        const cam = this.cameras.main;
        const mapW = 190;
        const mapH = 132;
        const x = cam.width - mapW - 16;
        const y = 48;

        this._miniMap = { x, y, w: mapW, h: mapH };
        this._miniMapStatic = this.add.graphics().setScrollFactor(0).setDepth(95);
        this._miniMapDynamic = this.add.graphics().setScrollFactor(0).setDepth(96);

        this._miniMapStatic.fillStyle(0x05070a, 0.8);
        this._miniMapStatic.fillRoundedRect(x, y, mapW, mapH, 6);
        this._miniMapStatic.lineStyle(1, 0x7f8fa6, 0.9);
        this._miniMapStatic.strokeRoundedRect(x, y, mapW, mapH, 6);

        const room = { x: 450, y: 350, w: 600, h: 600 };
        const topLeft = this._toMiniMap(room.x, room.y);
        const bottomRight = this._toMiniMap(room.x + room.w, room.y + room.h);
        this._miniMapStatic.fillStyle(0x2d3a4a, 0.7);
        this._miniMapStatic.fillRect(
            Math.min(topLeft.x, bottomRight.x),
            Math.min(topLeft.y, bottomRight.y),
            Math.abs(bottomRight.x - topLeft.x),
            Math.abs(bottomRight.y - topLeft.y)
        );

        this.portals.forEach(portal => {
            const p = this._toMiniMap(portal.x, portal.y);
            this._miniMapStatic.fillStyle(portal.tintTopLeft || 0xbb88ff, 1);
            this._miniMapStatic.fillCircle(p.x, p.y, 3);
        });

        this.npcs.forEach(npc => {
            const p = this._toMiniMap(npc.x, npc.y);
            this._miniMapStatic.fillStyle(0xffffff, 0.9);
            this._miniMapStatic.fillRect(p.x - 2, p.y - 2, 4, 4);
        });

        this.add.text(x + 8, y - 16, 'Hub MiniMap', {
            fontSize: '11px',
            fill: '#c9d6df'
        }).setScrollFactor(0).setDepth(96);
    }

    _toMiniMap(worldX, worldY) {
        const bounds = this.physics.world.bounds;
        const mm = this._miniMap;
        if (!mm) return { x: 0, y: 0 };
        const nx = (worldX - bounds.x) / bounds.width;
        const ny = (worldY - bounds.y) / bounds.height;
        const px = mm.x + Phaser.Math.Clamp(nx, 0, 1) * mm.w;
        const py = mm.y + Phaser.Math.Clamp(ny, 0, 1) * mm.h;
        return { x: px, y: py };
    }

    _updateMiniMap() {
        if (!this._miniMapDynamic || !this.player) return;
        this._miniMapDynamic.clear();
        const playerPos = this._toMiniMap(this.player.x, this.player.y);
        this._miniMapDynamic.fillStyle(0x00e5ff, 1);
        this._miniMapDynamic.fillCircle(playerPos.x, playerPos.y, 3.5);
        this._miniMapDynamic.lineStyle(1, 0x00e5ff, 0.8);
        this._miniMapDynamic.strokeCircle(playerPos.x, playerPos.y, 6);
    }

    _flushPortalTransition() {
        if (!this._portalTransitioning || !this._pendingPortalBossKey) return false;
        const bossKey = this._pendingPortalBossKey;
        this._pendingPortalBossKey = null;
        try {
            if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
            if (bossKey === 'final') {
                this.scene.start('BossScene', { bossKey: 'final' });
            } else {
                GameState.discoverRunEventRoom();
                this.scene.start('LevelScene', { bossKey });
            }
            return true;
        } catch (err) {
            console.error('[HubScene] Portal transition failed:', err);
            this._portalTransitioning = false;
            if (!this.scene.isActive('UIScene')) this.scene.launch('UIScene');
            return false;
        }
    }

    update(time, delta) {
        if (this._flushPortalTransition()) return;
        this.player.update(time, delta);

        const INTERACT_DIST = 80;
        let nearest = null;
        let nearestDist = INTERACT_DIST;
        this.npcs.forEach(npc => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            npc.indicator.setVisible(d < INTERACT_DIST);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = npc;
            }
        });
        this.nearestNpc = nearest;
        this._updateMiniMap();

        const ui = this.scene.get('UIScene');
        if (ui && ui.updateHUD) ui.updateHUD(this.player, '净罪庇护所');
    }
}

/**
 * LevelScene - Procedural level with rooms, enemies, and boss door
 */
class LevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelScene' });
    }

    create(data) {
        const bossKey = data.bossKey || 'wrath';
        const boss = BOSSES[bossKey];
        this.bossKey = bossKey;
        AudioSystem.bindSceneInput(this);
        GameState.ensureRunModifiers();

        // Room layout
        const rooms = [
            { x: 100, y: 200, w: 700, h: 500 },
            { x: 1000, y: 150, w: 750, h: 550 },
            { x: 1950, y: 100, w: 800, h: 600 }
        ];
        const corridors = [
            { x: 800, y: 350, w: 200, h: 150 },
            { x: 1750, y: 300, w: 200, h: 150 }
        ];

        // Darker background tint from boss color
        const cr = (boss.color >> 16) & 0xFF;
        const cg = (boss.color >> 8) & 0xFF;
        const cb = boss.color & 0xFF;
        const dark = ((cr >> 2) << 16) | ((cg >> 2) << 8) | (cb >> 2);
        this.cameras.main.setBackgroundColor('#' + dark.toString(16).padStart(6, '0'));

        this.physics.world.setBounds(0, 0, 2800, 800);

        // Draw pixel-tiled floors and borders
        const floorStyleKey = resolvePixelStyleKey(bossKey);
        const borderColor = Phaser.Display.Color.GetColor(
            Math.max(0, cr - 40),
            Math.max(0, cg - 40),
            Math.max(0, cb - 40)
        );

        const allAreas = [...rooms, ...corridors];
        allAreas.forEach(area => {
            drawPixelTiledRect(this, area.x, area.y, area.w, area.h, floorStyleKey, 0);
        });
        const borderGfx = this.add.graphics();
        borderGfx.setDepth(1);
        borderGfx.lineStyle(3, borderColor, 1);
        allAreas.forEach(area => {
            borderGfx.strokeRect(area.x, area.y, area.w, area.h);
        });

        this._walkableAreas = allAreas;

        // Spawn player at left of Room 1
        this.player = new Player(this, 200, 450);
        applyPlayerWeaponState(this.player);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 2800, 800);

        const enemyPool = (typeof AREA_ENEMIES !== 'undefined' && AREA_ENEMIES[bossKey])
            ? AREA_ENEMIES[bossKey]
            : ['wrathSoldier', 'wrathArcher', 'wrathBrute'];

        const pick = () => enemyPool[Math.floor(Math.random() * enemyPool.length)];

        this.enemies = [];
        const spawnInRoom = (room, count) => {
            for (let i = 0; i < count; i++) {
                const ex = room.x + 80 + Math.random() * (room.w - 160);
                const ey = room.y + 80 + Math.random() * (room.h - 160);
                const enemy = new Enemy(this, ex, ey, pick());
                this.enemies.push(enemy);
            }
        };
        spawnInRoom(rooms[0], 3);
        spawnInRoom(rooms[1], 4);
        spawnInRoom(rooms[2], 2);

        this.room3Enemies = this.enemies.filter((_, i) => i >= 7);

        // Boss door at far right of Room 3
        const room3 = rooms[2];
        const doorX = room3.x + room3.w - 80;
        const doorY = room3.y + room3.h / 2;
        this.bossDoor = this.add.sprite(doorX, doorY, 'portal');
        this.bossDoor.setTint(boss.color);
        this.bossDoor.setDepth(8);
        this.bossDoorLabel = this.add.text(doorX, doorY - 40, 'Boss: ' + boss.name, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(8);

        this.physics.add.existing(this.bossDoor);
        this.bossDoor.body.setCircle(30);
        this.bossDoor.body.setAllowGravity(false);
        this.bossDoor.body.moves = false;
        this.bossDoor.body.setImmovable(true);
        this.bossDoor.setAlpha(0.5);

        this.physics.add.overlap(this.player, this.bossDoor, () => {
            const room3AllDead = this.room3Enemies.every(e => !e.isAlive);
            if (!room3AllDead) return;
            AudioSystem.playUi('ui');
            this.scene.stop('UIScene');
            this.scene.stop('LevelScene');
            this.scene.start('BossScene', { bossKey: this.bossKey });
        });

        this.activeHitboxes = [];
        this.pickups = this.physics.add.group({ allowGravity: false, immovable: true });
        this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => this._collectPickup(pickup));
        this.playerDead = false;
        this.deathText = null;
        this.nearestRunEventRoom = null;
        this._runEventChoiceOpen = false;
        this._runEventChoiceOptions = [];
        this._levelTextWidthCache = new Map();
        this._levelTextMeasureNodes = {};
        this._createRunEventEncounter(rooms[1]);

        // Input
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => {
            if (this._runEventChoiceOpen) return;
            this.player.tryDodge();
        });
        this.input.keyboard.on('keydown-Q', () => {
            if (this._runEventChoiceOpen) return;
            this.player.switchWeaponLeft();
        });
        this.input.keyboard.on('keydown-E', () => {
            if (this._runEventChoiceOpen) return;
            this.player.switchWeaponRight();
        });
        this.input.keyboard.on('keydown-ONE', () => {
            if (this._handleRunEventChoiceHotkey(0)) return;
            handleQuickSlotUse(this, this.player, 0);
        });
        this.input.keyboard.on('keydown-TWO', () => {
            if (this._handleRunEventChoiceHotkey(1)) return;
            handleQuickSlotUse(this, this.player, 1);
        });
        this.input.keyboard.on('keydown-THREE', () => {
            if (this._runEventChoiceOpen) return;
            handleQuickSlotUse(this, this.player, 2);
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            if (this._runEventChoiceOpen) return;
            handleQuickSlotUse(this, this.player, 3);
        });
        this.input.keyboard.on('keydown-TAB', () => {
            if (this._runEventChoiceOpen) return;
            if (this.scene.isActive('InventoryScene')) this.scene.stop('InventoryScene');
            else this.scene.launch('InventoryScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            if (this._runEventChoiceOpen) {
                this._closeRunEventChoicePanel();
                return;
            }
            openPauseMenu(this);
        });
        this.input.keyboard.on('keydown-F', () => {
            if (this._runEventChoiceOpen) {
                this._closeRunEventChoicePanel();
                return;
            }
            this._openRunEventChoicePanel();
        });

        this.input.on('pointerdown', (pointer) => {
            if (this.playerDead || this._runEventChoiceOpen) return;
            let hitbox = null;
            if (pointer.button === 0) hitbox = this.player.tryAttack();
            else if (pointer.button === 2) hitbox = this.player.trySpecialAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-U', () => {
            if (this.playerDead || this._runEventChoiceOpen) return;
            const hitbox = this.player.tryAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-O', () => {
            if (this.playerDead || this._runEventChoiceOpen) return;
            const hitbox = this.player.trySpecialAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-H', () => {
            if (this._runEventChoiceOpen) return;
            if (!this.scene.isActive('HelpScene')) {
                this.scene.pause();
                this.scene.launch('HelpScene', { parentScene: 'LevelScene' });
            }
        });

        this.scene.launch('UIScene');
    }

    _isInWalkable(x, y) {
        return this._walkableAreas.some(a =>
            x >= a.x && x <= a.x + a.w &&
            y >= a.y && y <= a.y + a.h
        );
    }

    _clampToWalkable(px, py) {
        const PAD = 4;
        let bestDist = Infinity, bx = px, by = py;
        for (const a of this._walkableAreas) {
            const cx = Phaser.Math.Clamp(px, a.x + PAD, a.x + a.w - PAD);
            const cy = Phaser.Math.Clamp(py, a.y + PAD, a.y + a.h - PAD);
            const d = Phaser.Math.Distance.Squared(px, py, cx, cy);
            if (d < bestDist) { bestDist = d; bx = cx; by = cy; }
        }
        return { x: bx, y: by };
    }

    _spawnDropPickups(x, y, drops) {
        if (!drops) return;
        if (drops.gold && drops.gold > 0) {
            this._createPickup(x, y, {
                kind: 'gold',
                amount: drops.gold,
                color: 0xFFD700,
                label: '金币 +' + drops.gold
            });
        }
        const items = Array.isArray(drops.items) ? drops.items : [];
        items.forEach((itemDrop, index) => {
            if (!itemDrop || !itemDrop.key || !itemDrop.count) return;
            const item = ITEMS[itemDrop.key];
            if (!item) return;
            this._createPickup(x + 10 + index * 8, y + 8, {
                kind: 'item',
                itemKey: itemDrop.key,
                amount: itemDrop.count,
                color: item.type === 'material' ? 0x8E44AD : 0x2ECC71,
                label: `${item.name} x${itemDrop.count}`
            });
        });
    }

    _createPickup(x, y, data) {
        const pickup = this.physics.add.sprite(x, y, 'projectile');
        pickup.setDepth(8);
        pickup.setScale(data.kind === 'gold' ? 1.1 : 0.9);
        pickup.setTint(data.color || 0xFFFFFF);
        pickup.body.setAllowGravity(false);
        pickup.body.setImmovable(true);
        pickup.body.moves = false;
        pickup.dropData = data;
        pickup.setAlpha(0.95);
        this.pickups.add(pickup);
        this.tweens.add({
            targets: pickup,
            y: pickup.y - 6,
            duration: 450,
            yoyo: true,
            repeat: -1
        });
        this.time.delayedCall(12000, () => {
            if (pickup.active) pickup.destroy();
        });
    }

    _collectPickup(pickup) {
        if (!pickup || !pickup.active || pickup._collected) return;
        pickup._collected = true;
        const data = pickup.dropData || {};
        if (data.kind === 'gold') {
            GameState.addGold(data.amount || 0);
            this._showFloatingText(pickup.x, pickup.y - 10, '+' + (data.amount || 0) + ' gold', '#FFD700');
        } else if (data.kind === 'item' && data.itemKey) {
            GameState.addItem(data.itemKey, data.amount || 1);
            const item = ITEMS[data.itemKey];
            const name = item ? item.name : data.itemKey;
            this._showFloatingText(pickup.x, pickup.y - 10, name + ' +' + (data.amount || 1), '#80ffcf');
        }
        AudioSystem.playUi('pickup');
        pickup.destroy();
    }

    _showFloatingText(x, y, text, color) {
        const txt = this.add.text(x, y, text, {
            fontSize: '15px',
            fill: color || '#ffffff'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
            targets: txt,
            y: txt.y - 32,
            alpha: 0,
            duration: 900,
            onComplete: () => txt.destroy()
        });
    }

    _getRunEventRoomVisualConfig(eventRoom) {
        const type = eventRoom && typeof eventRoom.type === 'string' ? eventRoom.type : 'trade';
        if (type === 'healing') {
            return {
                activeTint: 0x63D7B0,
                resolvedTint: 0x6D8A88,
                labelColor: '#d7fff1',
                resolvedLabelColor: '#a6bbb6',
                accentColor: '#7CFFB2'
            };
        }
        if (type === 'riskBuff') {
            return {
                activeTint: 0xD46A7B,
                resolvedTint: 0x7F6670,
                labelColor: '#ffd5de',
                resolvedLabelColor: '#baa5ab',
                accentColor: '#ff9fad'
            };
        }
        if (type === 'blessing') {
            return {
                activeTint: 0x7A8DFF,
                resolvedTint: 0x707893,
                labelColor: '#dee4ff',
                resolvedLabelColor: '#b0b8cf',
                accentColor: '#b7c3ff'
            };
        }
        return {
            activeTint: 0xF6C86C,
            resolvedTint: 0x7D8694,
            labelColor: '#ffe6a3',
            resolvedLabelColor: '#b0b7c2',
            accentColor: '#FFD27A'
        };
    }

    _createRunEventEncounter(anchorRoom) {
        const eventRoom = GameState.getRunEventRoomSummary ? GameState.getRunEventRoomSummary() : null;
        if (!eventRoom || !anchorRoom) return;
        const style = this._getRunEventRoomVisualConfig(eventRoom);

        const altarX = anchorRoom.x + anchorRoom.w / 2;
        const altarY = anchorRoom.y + anchorRoom.h / 2;
        const shrine = this.physics.add.sprite(altarX, altarY, 'portal');
        shrine.setTint(style.activeTint);
        shrine.setScale(0.85);
        shrine.setDepth(8);
        shrine.body.setCircle(24);
        shrine.body.setAllowGravity(false);
        shrine.body.moves = false;
        shrine.body.setImmovable(true);

        const label = this.add.text(altarX, altarY - 42, eventRoom.name, {
            fontSize: '16px',
            fill: style.labelColor,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(9);

        const indicator = this.add.text(altarX, altarY - 64, buildRunEventRoomPromptLabel(eventRoom, RUN_EVENT_ROOM_POOL), {
            fontSize: '12px',
            fill: style.accentColor
        }).setOrigin(0.5).setDepth(9).setVisible(false);

        this.runEventRoomShrine = shrine;
        this.runEventRoomLabel = label;
        this.runEventRoomIndicator = indicator;
        this._createRunEventChoicePanel();
        this._refreshRunEventEncounterState();
    }

    _getLevelTextMeasureNode(styleKey) {
        if (!this._levelTextMeasureNodes) {
            this._levelTextMeasureNodes = {};
        }
        const cached = this._levelTextMeasureNodes[styleKey];
        if (cached && !cached.active) {
            this._levelTextMeasureNodes[styleKey] = null;
        }
        if (!this._levelTextMeasureNodes[styleKey]) {
            let style = { fontSize: '14px', fill: '#ffffff' };
            if (styleKey === 'runEventPrompt') {
                style = { fontSize: '12px', fill: '#FFD27A' };
            } else if (styleKey === 'runEventWorldLabel') {
                style = { fontSize: '16px', fill: '#ffe6a3', fontStyle: 'bold' };
            }
            this._levelTextMeasureNodes[styleKey] = this.add.text(-1000, -1000, '', style)
                .setVisible(false)
                .setDepth(0);
        }
        return this._levelTextMeasureNodes[styleKey];
    }

    _measureLevelTextWidth(text, styleKey) {
        const safeText = typeof text === 'string' ? text : '';
        if (!safeText) return 0;
        if (!this._levelTextWidthCache) {
            this._levelTextWidthCache = new Map();
        }
        const cacheKey = `${styleKey}:${safeText}`;
        if (this._levelTextWidthCache.has(cacheKey)) {
            return this._levelTextWidthCache.get(cacheKey);
        }
        const measureText = this._getLevelTextMeasureNode(styleKey);
        measureText.setText(safeText);
        const width = measureText.width;
        this._levelTextWidthCache.set(cacheKey, width);
        return width;
    }

    _fitLevelTextToWidth(text, maxWidth, styleKey) {
        return clampTextToWidth(text, maxWidth, {
            measureGlyphWidth: glyph => this._measureLevelTextWidth(glyph, styleKey),
            measurementCache: new Map()
        });
    }

    _refreshRunEventPromptPosition() {
        if (!this.runEventRoomShrine || !this.runEventRoomIndicator) return;
        this.runEventRoomIndicator.setY(this.runEventRoomShrine.y - 64);
        const text = this.runEventRoomIndicator.text || '';
        if (!text) {
            this.runEventRoomIndicator.setX(this.runEventRoomShrine.x);
            return;
        }
        const promptWidth = this._measureLevelTextWidth(text, 'runEventPrompt');
        const clampedX = getViewportTextClampX(this.runEventRoomShrine.x, promptWidth, this.cameras.main.width, 12, this.cameras.main.worldView.x);
        this.runEventRoomIndicator.setX(clampedX);
    }

    _refreshRunEventWorldLabelPosition(text) {
        if (!this.runEventRoomShrine || !this.runEventRoomLabel) return;
        this.runEventRoomLabel.setY(this.runEventRoomShrine.y - 42);
        if (!text) {
            this.runEventRoomLabel.setText('');
            this.runEventRoomLabel.setX(this.runEventRoomShrine.x);
            return;
        }
        const maxWidth = Math.max(0, this.cameras.main.width - 24);
        const fittedLabel = this._fitLevelTextToWidth(text, maxWidth, 'runEventWorldLabel');
        this.runEventRoomLabel.setText(fittedLabel);
        const labelWidth = this._measureLevelTextWidth(fittedLabel, 'runEventWorldLabel');
        const clampedX = getViewportCenteredTextClampX(this.runEventRoomShrine.x, labelWidth, this.cameras.main.width, 12, this.cameras.main.worldView.x);
        this.runEventRoomLabel.setX(clampedX);
    }

    _createRunEventChoicePanel() {
        const cam = this.cameras.main;
        const cx = cam.width / 2;
        const cy = cam.height / 2;
        const overlay = this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(120)
            .setVisible(false)
            .setInteractive();
        const panel = this.add.rectangle(cx, cy, 560, 300, 0x161922, 0.96)
            .setScrollFactor(0)
            .setDepth(121)
            .setStrokeStyle(2, 0xF6C86C)
            .setVisible(false);
        const title = this.add.text(cx, cy - 108, '', {
            fontSize: '24px',
            fill: '#ffe6a3',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(122).setVisible(false);
        const description = this.add.text(cx, cy - 74, '', {
            fontSize: '14px',
            fill: '#d6dde7',
            align: 'center',
            wordWrap: { width: 460 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(122).setVisible(false);
        const optionTexts = [0, 1].map((index) => this.add.text(cx, cy - 2 + index * 78, '', {
            fontSize: '16px',
            fill: '#fff6cf',
            align: 'center',
            wordWrap: { width: 470 },
            lineSpacing: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(122).setVisible(false));
        const footer = this.add.text(cx, cy + 120, RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT, {
            fontSize: '13px',
            fill: RUN_EVENT_CHOICE_PANEL_FOOTER_COLORS.default
        }).setOrigin(0.5).setScrollFactor(0).setDepth(122).setVisible(false);

        this.runEventChoicePanel = { overlay, panel, title, description, optionTexts, footer };
    }

    _setRunEventChoicePanelFooter(message, tone) {
        if (!this.runEventChoicePanel || !this.runEventChoicePanel.footer) return;
        const footer = this.runEventChoicePanel.footer;
        const nextTone = tone === 'blocked' ? 'blocked' : 'default';
        footer.setText(message || RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT);
        footer.setColor(RUN_EVENT_CHOICE_PANEL_FOOTER_COLORS[nextTone]);
    }

    _refreshRunEventEncounterState() {
        if (!this.runEventRoomShrine) return;
        const eventRoom = GameState.getRunEventRoomSummary ? GameState.getRunEventRoomSummary() : null;
        const resolved = !eventRoom || !!eventRoom.resolved;
        const style = this._getRunEventRoomVisualConfig(eventRoom);
        const worldLabelText = eventRoom ? buildRunEventRoomWorldLabel(eventRoom, RUN_EVENT_ROOM_POOL) : '';
        this.runEventRoomShrine.setTint(resolved ? style.resolvedTint : style.activeTint);
        this.runEventRoomShrine.setAlpha(resolved ? 0.55 : 1);
        if (this.runEventRoomLabel) {
            this.runEventRoomLabel.setColor(resolved ? style.resolvedLabelColor : style.labelColor);
            this._refreshRunEventWorldLabelPosition(worldLabelText);
        }
        if (this.runEventRoomIndicator) {
            this.runEventRoomIndicator.setVisible(false);
            this.runEventRoomIndicator.setColor(style.accentColor);
            this.runEventRoomIndicator.setText(buildRunEventRoomPromptLabel(eventRoom, RUN_EVENT_ROOM_POOL));
            this._refreshRunEventPromptPosition();
        }
    }

    _updateRunEventEncounterHint() {
        this.nearestRunEventRoom = null;
        if (!this.runEventRoomShrine || !this.runEventRoomIndicator) return;
        const eventRoom = GameState.getRunEventRoomSummary ? GameState.getRunEventRoomSummary() : null;
        const worldLabelText = eventRoom ? buildRunEventRoomWorldLabel(eventRoom, RUN_EVENT_ROOM_POOL) : '';
        const available = !!eventRoom && !eventRoom.resolved;
        const inRange = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.runEventRoomShrine.x,
            this.runEventRoomShrine.y
        ) <= 92;
        this.nearestRunEventRoom = available && inRange ? this.runEventRoomShrine : null;
        this.runEventRoomIndicator.setText(buildRunEventRoomPromptLabel(eventRoom, RUN_EVENT_ROOM_POOL));
        this._refreshRunEventPromptPosition();
        this._refreshRunEventWorldLabelPosition(worldLabelText);
        this.runEventRoomIndicator.setVisible(available && inRange && !this._runEventChoiceOpen);
    }

    _openRunEventChoicePanel() {
        const eventRoom = GameState.getRunEventRoomSummary ? GameState.getRunEventRoomSummary() : null;
        if (!eventRoom || eventRoom.resolved || !this.nearestRunEventRoom || !this.runEventChoicePanel) return;
        const choices = getRunEventRoomChoices(eventRoom.key, RUN_EVENT_ROOM_POOL);
        if (choices.length < 2) return;

        this._runEventChoiceOptions = choices.slice(0, 2);
        this._runEventChoiceOpen = true;
        this.player.setVelocity(0, 0);
        const style = this._getRunEventRoomVisualConfig(eventRoom);

        this.runEventChoicePanel.title.setText(eventRoom.name);
        this.runEventChoicePanel.title.setStyle({ fill: style.labelColor });
        this.runEventChoicePanel.description.setText(eventRoom.description);
        this.runEventChoicePanel.panel.setStrokeStyle(2, style.activeTint);
        this._setRunEventChoicePanelFooter(RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT, 'default');
        this.runEventChoicePanel.optionTexts.forEach((textNode, index) => {
            const choice = this._runEventChoiceOptions[index];
            if (!choice) {
                textNode.setText('');
                textNode.setVisible(false);
                return;
            }
            const previewState = {
                gold: GameState.gold,
                playerHp: this.player.hp,
                playerMaxHp: this.player.maxHp
            };
            const affordabilityLabel = getRunEventRoomChoiceAffordabilityLabel(choice, previewState);
            const previewText = buildRunEventRoomChoicePanelPreview(choice, previewState);
            textNode.setText(`${index + 1}. ${previewText}${affordabilityLabel ? ` · ${affordabilityLabel}` : ''}`);
            textNode.setVisible(true);
        });
        Object.values(this.runEventChoicePanel).forEach((node) => {
            if (node && node.setVisible) node.setVisible(true);
        });
    }

    _closeRunEventChoicePanel() {
        this._runEventChoiceOpen = false;
        this._runEventChoiceOptions = [];
        if (!this.runEventChoicePanel) return;
        this._setRunEventChoicePanelFooter(RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT, 'default');
        Object.values(this.runEventChoicePanel).forEach((node) => {
            if (node && node.setVisible) node.setVisible(false);
        });
        this.runEventChoicePanel.optionTexts.forEach((textNode) => textNode.setVisible(false));
    }

    _clearPlayerNegativeStates() {
        this.player.clearStatusEffects();
        this.player.controlInvertTimer = 0;
        if (this.player._controlInvertFx) {
            this.player.clearTint();
            this.player._controlInvertFx = false;
        }
    }

    _showRunEventSettlementFeedback(settlement, startGold, startHp) {
        if (!this.runEventRoomShrine) return;
        const style = this._getRunEventRoomVisualConfig(settlement.eventRoom);
        const goldDelta = (settlement.nextState.gold || 0) - startGold;
        const hpDelta = (settlement.nextState.playerHp || startHp) - startHp;
        const lines = [{ text: settlement.choice.label, color: style.accentColor }];

        if (goldDelta !== 0) {
            lines.push({
                text: `${goldDelta > 0 ? '+' : ''}${goldDelta} 金币`,
                color: goldDelta > 0 ? '#FFD27A' : '#FF9A9A'
            });
        }
        if (hpDelta !== 0) {
            lines.push({
                text: `${hpDelta > 0 ? '+' : ''}${hpDelta} HP`,
                color: hpDelta > 0 ? '#7CFFB2' : '#FF9A9A'
            });
        }
        if (settlement.nextState.cleanseNegativeStatuses) {
            lines.push({ text: '净化负面状态', color: '#9EFFE1' });
        }
        if (Array.isArray(settlement.itemChanges) && settlement.itemChanges.length > 0) {
            settlement.itemChanges.forEach(({ itemKey, count }) => {
                if (!itemKey || !count) return;
                const item = ITEMS[itemKey];
                lines.push({
                    text: `${item ? item.name : itemKey} +${count}`,
                    color: '#9EFFE1'
                });
            });
        }
        if (lines.length === 1 && settlement.eventRoom && settlement.eventRoom.resolutionText) {
            lines.push({ text: settlement.eventRoom.resolutionText, color: '#f7d9df' });
        }

        lines.forEach((line, index) => {
            this._showFloatingText(
                this.runEventRoomShrine.x,
                this.runEventRoomShrine.y - 20 + index * 24,
                line.text,
                line.color
            );
        });
    }

    _handleRunEventChoiceHotkey(choiceIndex) {
        if (!this._runEventChoiceOpen) return false;
        const choice = this._runEventChoiceOptions[choiceIndex];
        if (!choice) return true;

        const startGold = GameState.gold || 0;
        const startHp = this.player.hp;
        const settlement = resolveRunEventRoomChoice({
            gold: startGold,
            playerHp: this.player.hp,
            playerMaxHp: this.player.maxHp
        }, GameState.runEventRoom, choice.key, RUN_EVENT_ROOM_POOL);
        if (!settlement.ok) {
            AudioSystem.playUi('ui');
            this._setRunEventChoicePanelFooter(getRunEventRoomChoiceFailureMessage(settlement), 'blocked');
            return true;
        }

        GameState.gold = settlement.nextState.gold;
        if (settlement.nextState.inventory) {
            GameState.inventory = settlement.nextState.inventory;
        }
        GameState.runEventRoom = settlement.eventRoom;
        GameState.refreshRunEffects();
        this.player.hp = Math.max(1, Math.min(this.player.maxHp, settlement.nextState.playerHp));
        if (settlement.nextState.cleanseNegativeStatuses) {
            this._clearPlayerNegativeStates();
        }
        GameState.save();

        this._closeRunEventChoicePanel();
        this._refreshRunEventEncounterState();
        this.cameras.main.flash(150, 255, 215, 120, false);
        AudioSystem.playUi('pickup');

        this._showRunEventSettlementFeedback(settlement, startGold, startHp);
        return true;
    }

    update(time, delta) {
        if (this.playerDead) return;

        this._updateRunEventEncounterHint();
        this.player.update(time, delta);

        if (!this._isInWalkable(this.player.x, this.player.y)) {
            const clamped = this._clampToWalkable(this.player.x, this.player.y);
            this.player.setPosition(clamped.x, clamped.y);
            this.player.setVelocity(0, 0);
        }

        const ui = this.scene.get('UIScene');
        if (ui && ui.updateHUD) ui.updateHUD(this.player, BOSSES[this.bossKey].area);
        if (this._runEventChoiceOpen) {
            this.player.setVelocity(0, 0);
            return;
        }

        const defaultHitboxRadius = 45;
        for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
            const hb = this.activeHitboxes[i];
            if (!hb.active) {
                this.activeHitboxes.splice(i, 1);
                continue;
            }
            const hbRadius = hb.hitRadius || defaultHitboxRadius;
            for (const enemy of this.enemies) {
                if (!enemy.isAlive) continue;
                const d = Phaser.Math.Distance.Between(hb.x, hb.y, enemy.x, enemy.y);
                if (d < hbRadius && hb.damage) {
                    const canPierce = Array.isArray(hb._pierceHits);
                    if (canPierce && hb._pierceHits.includes(enemy)) continue;
                    const hitDamage = hb.damage;
                    const drops = enemy.takeDamage(hitDamage);
                    if (hb.statusEffect && enemy.applyStatusEffect) {
                        enemy.applyStatusEffect(hb.statusEffect.key, {
                            durationMs: hb.statusEffect.durationMs,
                            sourceDamage: hb.statusEffect.sourceDamage || hitDamage
                        });
                    }
                    if (canPierce) hb._pierceHits.push(enemy);
                    else hb.damage = 0;
                    if (hb.isSpecial) {
                        showHitImpactPulse(this, enemy.x, enemy.y, 0xFF9F6A, 12);
                        showFloatingCombatText(this, enemy.x, enemy.y - 16, '重击', '#ffd27a', 500);
                        showFloatingCombatText(this, enemy.x, enemy.y - 34, '-' + hitDamage, '#ffb37a', 520);
                    } else {
                        showHitImpactPulse(this, enemy.x, enemy.y, 0xFFD27A, 9);
                        showFloatingCombatText(this, enemy.x, enemy.y - 28, '-' + hitDamage, '#fff2c2', 450);
                    }
                    if (drops) {
                        this._spawnDropPickups(enemy.x, enemy.y, drops);
                        const challengeCompleted = GameState.onEnemyDefeated();
                        if (challengeCompleted) {
                            showFloatingCombatText(
                                this,
                                enemy.x,
                                enemy.y - 24,
                                buildRunChallengeCompletedFeedbackText(GameState.getRunChallengeSummary() || GameState.runChallenge),
                                '#7CFFB2',
                                1200
                            );
                        }
                    }
                }
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            if (!this._isInWalkable(enemy.x, enemy.y)) {
                const clamped = this._clampToWalkable(enemy.x, enemy.y);
                enemy.setPosition(clamped.x, clamped.y);
                enemy.setVelocity(0, 0);
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            const attacking = enemy.update(time, delta, this.player);
            if (!this._isInWalkable(enemy.x, enemy.y)) {
                const clamped = this._clampToWalkable(enemy.x, enemy.y);
                enemy.setPosition(clamped.x, clamped.y);
                enemy.setVelocity(0, 0);
            }
            if (enemy._statusDrops) {
                this._spawnDropPickups(enemy.x, enemy.y, enemy._statusDrops);
                const challengeCompleted = GameState.onEnemyDefeated();
                if (challengeCompleted) {
                    showFloatingCombatText(
                        this,
                        enemy.x,
                        enemy.y - 24,
                        buildRunChallengeCompletedFeedbackText(GameState.getRunChallengeSummary() || GameState.runChallenge),
                        '#7CFFB2',
                        1200
                    );
                }
                enemy._statusDrops = null;
            }
            if (attacking) {
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                if (d < enemy.attackRange + 20) {
                    const died = this.player.takeDamage(enemy.damage);
                    if (this.player._damageAppliedThisHit && enemy.onHitStatus) {
                        this.player.applyStatusEffect(enemy.onHitStatus.key, {
                            durationMs: enemy.onHitStatus.durationMs,
                            sourceDamage: enemy.damage
                        });
                    }
                    if (died) {
                        this.player.freezeForDeath();
                        this.playerDead = true;
                        this.deathText = this.add.text(
                            this.cameras.main.scrollX + 512,
                            this.cameras.main.scrollY + 384,
                            '死亡',
                            { fontSize: '48px', fill: '#ff0000' }
                        ).setOrigin(0.5).setScrollFactor(0);
                        this.time.delayedCall(2000, () => {
                            this.scene.stop('UIScene');
                            this.scene.start('HubScene');
                        });
                        return;
                    }
                }
            }
        }

        // Boss door activation when all Room 3 enemies dead
        const room3AllDead = this.room3Enemies.every(e => !e.isAlive);
        if (room3AllDead) this.bossDoor.setAlpha(1);
    }
}

/**
 * Boss - Manages boss entity with phase system and attack patterns (plain class, not extending Sprite)
 */
const BOSS_ATTACK_TYPES = {
    DASH: ['firePunch', 'slash', 'poisonSpit', 'bite', 'charmBolt', 'webShot', 'tailSwipe', 'devour'],
    AOE: ['groundSlam', 'vomit', 'goldBreath'],
    CONE: ['flameBreath', 'charge', 'lunge', 'dash'],
    SPECIAL: ['mirror', 'copyWeapon', 'shapeShift', 'reverseControl', 'illusion', 'bladeOrbit', 'mirageDance'],
    BUFF: ['berserk', 'nightmare', 'treasureStorm', 'consume', 'divineStrike'],
    HAZARD: ['summonSpider', 'coinTrap', 'sleepFog', 'magmaRing']
};

function getAttackType(attackName) {
    for (const [type, attacks] of Object.entries(BOSS_ATTACK_TYPES)) {
        if (attacks.includes(attackName)) return type;
    }
    return 'DASH';
}

class Boss {
    constructor(scene, x, y, bossKey) {
        this.scene = scene;
        this.bossKey = bossKey;
        this.config = BOSSES[bossKey];
        if (!this.config) throw new Error('Unknown boss: ' + bossKey);

        const bossTexture = 'enemy_' + (BOSS_SPRITE_MAP[bossKey] || 'orc_base');
        const bossTex = scene.textures.exists(bossTexture) ? bossTexture : '__DEFAULT';
        this.sprite = scene.physics.add.sprite(x, y, bossTex);
        this.sprite.setScale(4);
        this.sprite.body.setSize(16, 20);
        this.sprite.body.setOffset(8, 10);
        this.sprite.setTint(this.config.color);
        this.sprite.setDepth(10);
        this.sprite.body.setAllowGravity(false);
        this.sprite.setCollideWorldBounds(true);
        const bossAnimKey = 'enemy_' + (BOSS_SPRITE_MAP[bossKey] || 'orc_base') + '_idle';
        if (scene.anims.exists(bossAnimKey)) this.sprite.play(bossAnimKey);

        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const hpScale = runEffects.enemyHpMultiplier || 1;
        const speedScale = runEffects.enemySpeedMultiplier || 1;
        this.hp = Math.max(1, Math.round(this.config.hp * hpScale));
        this.maxHp = this.hp;
        this.damage = this.config.damage;
        this.speed = Math.max(30, Math.round(this.config.speed * speedScale));
        this.baseSpeed = this.speed;
        this.currentPhase = 0;
        this.phaseTransitioned = this.config.phases.map(() => false);
        this.attackTimer = 0;
        this.currentAttack = null;
        this.attackState = 'idle';
        this.isAlive = true;
        this.invincibleUntil = 0;
        this.berserkApplied = false;

        this.attackIndex = 0;
        this.lastCompletedAttack = null;
        this.windUpStart = 0;
        this.attackStart = 0;
        this.cooldownStart = 0;
        this.attackData = {};
        this.attackWindupDelay = 0;
        this.phaseMajorAttackQueue = new Set();
        this.phaseAttackCooldownExpires = {};
        this.phaseAttackGroupRecoveryExpires = {};
        this.phaseBreatherChainRemaining = 0;
        this.activeStatusEffects = {};
        this._statusSpeedMultiplier = 1;
        this.phaseAlertUntil = 0;
        this.breakHighlightUntil = 0;
        this.staggerUntil = 0;
        this.activeTelegraph = null;
        this.statusAura = scene.add.graphics();
        this.statusAura.setDepth(9);
    }

    getPhase() {
        return this.config.phases[this.currentPhase] || this.config.phases[0];
    }

    _pickPhaseAttack(attacks) {
        if (!Array.isArray(attacks) || attacks.length === 0) return null;
        const phase = this.getPhase();
        const phaseLocalCooldownMs = phase && phase.phaseLocalCooldownMs ? phase.phaseLocalCooldownMs : {};
        const sharedAttackRecoveryMs = phase && phase.sharedAttackRecoveryMs ? phase.sharedAttackRecoveryMs : {};
        const sharedAttackRecoveryGroups = phase && phase.sharedAttackRecoveryGroups ? phase.sharedAttackRecoveryGroups : {};
        const postMajorBreatherChain = phase && phase.postMajorBreatherChain ? phase.postMajorBreatherChain : null;
        const triggerAttacks = postMajorBreatherChain && Array.isArray(postMajorBreatherChain.triggerAttacks) ? postMajorBreatherChain.triggerAttacks : [];
        const breatherAttacks = postMajorBreatherChain && Array.isArray(postMajorBreatherChain.breatherAttacks) ? postMajorBreatherChain.breatherAttacks : [];
        const requiredBreatherCount = postMajorBreatherChain && postMajorBreatherChain.requiredCount > 0 ? postMajorBreatherChain.requiredCount : 0;
        const postAttackBreatherGuards = phase && phase.postAttackBreatherGuards ? phase.postAttackBreatherGuards : {};
        const now = this.scene.time.now;
        let selectedAttack = attacks[this.attackIndex % attacks.length];
        let selectedRawIndex = this.attackIndex;
        for (let offset = 0; offset < attacks.length; offset++) {
            const rawIndex = this.attackIndex + offset;
            const candidate = attacks[rawIndex % attacks.length];
            const candidateCooldownExpiresAt = phaseLocalCooldownMs[candidate] > 0 ? (this.phaseAttackCooldownExpires[candidate] || 0) : 0;
            if (candidateCooldownExpiresAt > now && attacks.some(attack => attack !== candidate)) {
                continue;
            }
            const candidateSharedGroupKey = Object.keys(sharedAttackRecoveryGroups).find(groupKey => Array.isArray(sharedAttackRecoveryGroups[groupKey]) && sharedAttackRecoveryGroups[groupKey].includes(candidate));
            const sharedRecoveryExpiresAt = candidateSharedGroupKey ? (this.phaseAttackGroupRecoveryExpires[candidateSharedGroupKey] || 0) : 0;
            if (sharedRecoveryExpiresAt > now && attacks.some(attack => !sharedAttackRecoveryGroups[candidateSharedGroupKey].includes(attack))) {
                continue;
            }
            if (this.phaseBreatherChainRemaining > 0 && triggerAttacks.includes(candidate) && breatherAttacks.length > 0 && attacks.some(attack => breatherAttacks.includes(attack))) {
                continue;
            }
            const blockedAfterLastAttack = Array.isArray(postAttackBreatherGuards[this.lastCompletedAttack]) ? postAttackBreatherGuards[this.lastCompletedAttack] : null;
            if (blockedAfterLastAttack && blockedAfterLastAttack.includes(candidate) && attacks.some(attack => !blockedAfterLastAttack.includes(attack))) {
                continue;
            }
            const lastAttackWasMajor = MAJOR_BOSS_PHASE_ATTACKS.has(this.lastCompletedAttack);
            const candidateIsMajor = MAJOR_BOSS_PHASE_ATTACKS.has(candidate);
            if (lastAttackWasMajor && candidateIsMajor) {
                const hasBreatherAttack = attacks.some(attack => !MAJOR_BOSS_PHASE_ATTACKS.has(attack));
                if (hasBreatherAttack) continue;
            }
            selectedAttack = candidate;
            selectedRawIndex = rawIndex;
            break;
        }
        this.attackIndex = selectedRawIndex + 1;
        return selectedAttack;
    }

    getTelegraphHudSummary(now) {
        if (!this.activeTelegraph) return buildBossTelegraphHudSummary();
        const remainingMs = Math.max(0, this.activeTelegraph.expiresAt - now);
        return buildBossTelegraphHudSummary({
            attackLabel: this.activeTelegraph.attackLabel,
            attackTypeLabel: this.activeTelegraph.attackTypeLabel,
            counterWindowMs: this.activeTelegraph.counterWindowMs,
            counterHint: this.activeTelegraph.counterHint,
            telegraphDurationMs: this.activeTelegraph.telegraphDurationMs,
            remainingMs
        });
    }

    getStatusHighlightSummary(now) {
        return buildBossStatusHighlightSummary({
            hpRatio: this.maxHp > 0 ? (this.hp / this.maxHp) : 0,
            breakMs: Math.max(0, (this.breakHighlightUntil || 0) - now),
            activeStatuses: Object.keys(this.activeStatusEffects || {})
        });
    }

    update(time, delta, player) {
        if (!this.isAlive) return;

        this.attackTimer += delta;
        this._statusSpeedMultiplier = this._updateStatusEffects(time);
        if (this.activeTelegraph && time >= this.activeTelegraph.expiresAt) {
            this.activeTelegraph = null;
        }

        if (this.attackState === 'staggered') {
            this.sprite.setAlpha(1);
            if (this.sprite.body) this.sprite.body.setVelocity(0, 0);
            if (time >= this.staggerUntil) {
                this.attackState = 'cooldown';
                this.cooldownStart = time;
            }
            return;
        }

        if (time < this.invincibleUntil) return;

        const hpPercent = this.hp / this.maxHp;
        for (let i = this.config.phases.length - 1; i >= 0; i--) {
            if (hpPercent <= this.config.phases[i].hpPercent && !this.phaseTransitioned[i]) {
                this._enterPhase(i, time);
                break;
            }
        }

        const phase = this.getPhase();
        const attacks = phase.attacks || [];

        if (this.attackState === 'idle') {
            if (attacks.length > 0) {
                this.currentAttack = this._pickPhaseAttack(attacks);
                this.attackState = 'winding';
                this.windUpStart = time;
                const attackName = ATTACK_DISPLAY_NAMES[this.currentAttack] || this.currentAttack;
                const attackType = getAttackType(this.currentAttack);
                const hint = ATTACK_COUNTER_HINTS[this.currentAttack];
                const windowMs = ATTACK_COUNTER_WINDOW_MS[this.currentAttack] || 0;
                const windowStartOffsetMs = ATTACK_COUNTER_WINDOW_START_OFFSET_MS[this.currentAttack] || 0;
                if (this.phaseMajorAttackQueue.has(this.currentAttack)) {
                    this.attackWindupDelay = 450;
                    this.phaseMajorAttackQueue.delete(this.currentAttack);
                    const windowLabel = '反制窗口≈' + Math.max(1, Math.round(windowMs / 100) / 10) + 's';
                    this._showTelegraph(
                        hint ? (`⚠ ${attackName}\n${hint}\n${windowLabel}`) : (`⚠ ${attackName}\n${windowLabel}`),
                        '#FFD700',
                        hint ? 1300 : 1000
                    );
                } else {
                    this.attackWindupDelay = 0;
                }
                if (hint || windowMs > 0) {
                    const telegraphDuration = 500 + this.attackWindupDelay;
                    this.activeTelegraph = {
                        attackLabel: attackName,
                        attackTypeLabel: BOSS_TELEGRAPH_TYPE_LABELS[attackType] || attackType,
                        counterHint: hint || '',
                        counterWindowMs: windowMs,
                        counterWindowStartOffsetMs: windowStartOffsetMs,
                        telegraphDurationMs: telegraphDuration,
                        expiresAt: time + telegraphDuration,
                        typeKey: attackType
                    };
                } else {
                    this.activeTelegraph = null;
                }
            }
            this._moveTowardPlayer(player, 0.5);
        } else if (this.attackState === 'winding') {
            const flash = Math.floor((time - this.windUpStart) / 100) % 2;
            this.sprite.setAlpha(flash === 0 ? 1 : 0.5);
            if (time - this.windUpStart >= 500 + this.attackWindupDelay) {
                this.sprite.setAlpha(1);
                this.activeTelegraph = null;
                this.attackState = 'attacking';
                this.attackStart = time;
                this.attackData = {};
            }
        } else if (this.attackState === 'attacking') {
            this._executeAttack(time, delta, player);
        } else if (this.attackState === 'cooldown') {
            if (time - this.cooldownStart >= 500 + Math.random() * 500) {
                this.attackState = 'idle';
            }
        }
    }

    _enterPhase(phaseIndex, time) {
        this.phaseTransitioned[phaseIndex] = true;
        this.currentPhase = phaseIndex;
        this.phaseAlertUntil = time + BOSS_PHASE_ALERT_DURATION_MS;
        this.scene.cameras.main.flash(200, 255, 255, 255);
        this.invincibleUntil = time + 1000;
        this.speed *= 1.2;
        this.phaseAttackCooldownExpires = {};
        this.phaseAttackGroupRecoveryExpires = {};
        this.phaseBreatherChainRemaining = 0;
        const phase = this.config.phases[phaseIndex];
        const prevAttacks = phaseIndex > 0
            ? (this.config.phases[phaseIndex - 1].attacks || [])
            : [];
        const currentAttacks = phase ? (phase.attacks || []) : [];
        const newlyUnlocked = currentAttacks.filter(a => !prevAttacks.includes(a));
        newlyUnlocked
            .filter(a => MAJOR_BOSS_PHASE_ATTACKS.has(a))
            .forEach(a => this.phaseMajorAttackQueue.add(a));
        const phaseLabel = '阶段 ' + (phaseIndex + 1) + '!';
        const unlockedLabel = newlyUnlocked.length > 0
            ? '新招式: ' + newlyUnlocked.map(a => ATTACK_DISPLAY_NAMES[a] || a).join(' / ')
            : 'Boss 进入强化状态';
        const counterHints = newlyUnlocked
            .map(a => {
                const hint = ATTACK_COUNTER_HINTS[a];
                const win = ATTACK_COUNTER_WINDOW_MS[a];
                if (!hint) return '';
                return win ? (hint + `（窗口≈${Math.max(1, Math.round(win / 100) / 10)}s）`) : hint;
            })
            .filter(Boolean)
            .slice(0, 2);
        const hintLabel = counterHints.length > 0 ? ('反制提示: ' + counterHints.join(' ｜ ')) : '';
        this._showTelegraph(
            hintLabel ? (phaseLabel + '\n' + unlockedLabel + '\n' + hintLabel) : (phaseLabel + '\n' + unlockedLabel),
            '#ffef9f',
            hintLabel ? 1700 : 1300
        );
        if (phase && phase.attacks && phase.attacks.includes('berserk')) {
            if (!this.berserkApplied) {
                this.berserkApplied = true;
                this.damage *= 1.5;
                this.scene.cameras.main.shake(300, 0.02);
            }
        }
        const berserkTypes = ['berserk', 'nightmare', 'treasureStorm', 'consume', 'divineStrike'];
        if (phase && phase.attacks && phase.attacks.some(a => berserkTypes.includes(a))) {
            if (!this.berserkApplied) {
                this.berserkApplied = true;
                this.damage *= 1.5;
                this.scene.cameras.main.shake(300, 0.02);
            }
        }
    }

    _moveTowardPlayer(player, factor) {
        if (!player || !player.active) return;
        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
        const v = this._getEffectiveSpeed(factor);
        this.sprite.body.setVelocity(Math.cos(angle) * v, Math.sin(angle) * v);
    }

    _getEffectiveSpeed(scale) {
        return this.speed * (this._statusSpeedMultiplier || 1) * (scale || 1);
    }

    tryCounterBreak(durationMs) {
        if (!this.isAlive) return false;
        if (this.scene.time.now < this.invincibleUntil) return false;
        if (this.attackState !== 'winding') return false;
        if (!ATTACK_COUNTER_HINTS[this.currentAttack] && !ATTACK_COUNTER_WINDOW_MS[this.currentAttack]) return false;
        const now = this.scene.time.now;
        const staggerMs = Math.max(300, Math.round(durationMs || BOSS_COUNTER_BREAK_STAGGER_MS));
        this.attackState = 'staggered';
        this.staggerUntil = now + staggerMs;
        this.attackData = {};
        this.activeTelegraph = null;
        this.breakHighlightUntil = Math.max(this.breakHighlightUntil, now + staggerMs);
        this.sprite.setAlpha(1);
        if (this.sprite.body) this.sprite.body.setVelocity(0, 0);
        return true;
    }

    _showTelegraph(text, color, duration) {
        if (!text) return;
        const msg = this.scene.add.text(512, 120, text, {
            fontSize: '24px',
            fill: color || '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(70);
        this.scene.tweens.add({
            targets: msg,
            y: msg.y - 18,
            alpha: 0,
            duration: duration || 900,
            onComplete: () => msg.destroy()
        });
    }

    _updateStatusEffects(now) {
        let moveMult = 1;
        this.statusAura.clear();
        let ringIndex = 0;
        Object.entries(this.activeStatusEffects).forEach(([statusKey, state]) => {
            if (!state || now >= state.expiresAt) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            const def = getStatusEffectDef(statusKey);
            if (!def) {
                delete this.activeStatusEffects[statusKey];
                return;
            }
            if (def.tickMs > 0 && now >= state.nextTickAt) {
                const tickDamage = computeStatusTickDamage(statusKey, state.sourceDamage || 0, 1.2);
                if (tickDamage > 0) this.hp = Math.max(0, this.hp - tickDamage);
                state.nextTickAt = now + def.tickMs;
                showFloatingCombatText(
                    this.scene,
                    this.sprite.x,
                    this.sprite.y - 70,
                    '-' + tickDamage,
                    '#' + getStatusColor(statusKey).toString(16).padStart(6, '0'),
                    450
                );
                if (this.hp <= 0) this.isAlive = false;
            }
            if (def.speedMultiplier && def.speedMultiplier > 0) {
                moveMult = Math.min(moveMult, def.speedMultiplier);
            }
            this.statusAura.lineStyle(3, getStatusColor(statusKey), 0.75);
            this.statusAura.strokeCircle(this.sprite.x, this.sprite.y - 8, 38 + ringIndex * 6);
            ringIndex++;
        });
        return Math.max(0.5, moveMult);
    }

    applyStatusEffect(statusKey, opts) {
        const def = getStatusEffectDef(statusKey);
        if (!def || !this.isAlive) return false;
        const now = this.scene.time.now;
        const options = opts || {};
        const duration = Math.max(700, Math.round(options.durationMs || def.durationMs || 1200));
        this.activeStatusEffects[statusKey] = {
            key: statusKey,
            expiresAt: now + duration,
            nextTickAt: now + (def.tickMs || 0),
            sourceDamage: Math.max(1, Math.round(options.sourceDamage || 14))
        };
        showFloatingCombatText(
            this.scene,
            this.sprite.x,
            this.sprite.y - 78,
            getStatusLabel(statusKey),
            '#' + getStatusColor(statusKey).toString(16).padStart(6, '0'),
            700
        );
        return true;
    }

    _dealDamageToPlayer(player, amount, attackName, extraOnHit) {
        if (!player || !player.active) return false;
        const died = player.takeDamage(amount);
        if (player._damageAppliedThisHit) {
            const status = BOSS_ATTACK_STATUS_ON_HIT[attackName];
            if (status && player.applyStatusEffect) {
                player.applyStatusEffect(status.key, {
                    durationMs: status.durationMs,
                    sourceDamage: amount
                });
            }
            if (typeof extraOnHit === 'function') extraOnHit();
        }
        return died;
    }

    _executeAttack(time, delta, player) {
        const atk = this.currentAttack;
        const type = getAttackType(atk);

        if (type === 'DASH') {
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.attackData.targetX = player.x;
                this.attackData.targetY = player.y;
                const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                this.sprite.body.setVelocity(Math.cos(angle) * this._getEffectiveSpeed(3), Math.sin(angle) * this._getEffectiveSpeed(3));
            }
            if (time - this.attackStart >= 300) {
                this.sprite.body.setVelocity(0, 0);
                this._finishAttack(time);
            } else {
                const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                if (d < 60 && !player.isInvincible && !this.attackData.dashHit) {
                    this.attackData.dashHit = true;
                    this._dealDamageToPlayer(player, this.damage, atk);
                }
            }
        } else if (type === 'AOE') {
            if (!this.attackData.circle) {
                this.attackData.circle = this.scene.add.graphics();
                this.attackData.circle.setDepth(8);
                this.sprite.body.setVelocity(0, 0);
            }
            const elapsed = time - this.attackStart;
            const radius = Math.min(150, (elapsed / 500) * 150);
            this.attackData.circle.clear();
            this.attackData.circle.fillStyle(this.config.color, 0.4);
            this.attackData.circle.fillCircle(this.sprite.x, this.sprite.y, radius);
            if (elapsed >= 500) {
                const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                if (d < 150 && !player.isInvincible) this._dealDamageToPlayer(player, this.damage, atk);
                if (this.attackData.circle) this.attackData.circle.destroy();
                this._finishAttack(time);
            }
        } else if (type === 'CONE') {
            if (!this.attackData.cone) {
                this.attackData.cone = this.scene.add.graphics();
                this.attackData.cone.setDepth(8);
                this.sprite.body.setVelocity(0, 0);
                const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                this.attackData.angle = angle;
                this.attackData.cx = this.sprite.x;
                this.attackData.cy = this.sprite.y;
            }
            const elapsed = time - this.attackStart;
            this.attackData.cone.clear();
            this.attackData.cone.fillStyle(this.config.color, 0.5);
            const a = this.attackData.angle;
            const cx = this.attackData.cx;
            const cy = this.attackData.cy;
            const w = 200;
            const h = 80;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            const pts = [
                [cx, cy],
                [cx + cos * w - sin * (h / 2), cy + sin * w + cos * (h / 2)],
                [cx + cos * w + sin * (h / 2), cy + sin * w - cos * (h / 2)]
            ];
            this.attackData.cone.fillTriangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
            const px = player.x;
            const py = player.y;
            const relX = (px - cx) * cos + (py - cy) * sin;
            const relY = -(px - cx) * sin + (py - cy) * cos;
            if (elapsed < 800 && relX > 0 && relX < w && Math.abs(relY) < h / 2 && !player.isInvincible && !this.attackData.coneHit) {
                this.attackData.coneHit = true;
                this._dealDamageToPlayer(player, this.damage, atk);
            }
            if (elapsed >= 800) {
                if (this.attackData.cone) this.attackData.cone.destroy();
                this._finishAttack(time);
            }
        } else if (type === 'SPECIAL') {
            this._execSpecial(atk, time, delta, player);
        } else if (type === 'BUFF') {
            if (!this.attackData.applied && !this.berserkApplied) {
                this.attackData.applied = true;
                this.berserkApplied = true;
                this.scene.cameras.main.shake(300, 0.02);
                this.damage *= 1.5;
                this.speed *= 1.2;
            }
            this._finishAttack(time);
        } else if (type === 'HAZARD') {
            this._execHazard(atk, time, delta, player);
        } else {
            this._finishAttack(time);
        }
    }

    _execSpecial(atk, time, delta, player) {
        const elapsed = time - this.attackStart;

        if (atk === 'mirror' || atk === 'shapeShift') {
            // Teleport + shadow clones that chase player
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.sprite.setVisible(false);
                const newX = 600 + (Math.random() - 0.5) * 600;
                const newY = 250 + (Math.random() - 0.5) * 280;
                this.sprite.setPosition(newX, newY);
                const cloneCount = atk === 'shapeShift' ? 3 : 2;
                this.attackData.shadows = [];
                for (let i = 0; i < cloneCount; i++) {
                    const sx = 600 + (Math.random() - 0.5) * 400;
                    const sy = 250 + (Math.random() - 0.5) * 200;
                    const tex = this.sprite.texture.key;
                    const shadow = this.scene.add.sprite(sx, sy, tex);
                    shadow.setScale(this.sprite.scaleX);
                    shadow.setTint(this.config.color);
                    shadow.setAlpha(0.5);
                    shadow.setDepth(9);
                    const ax = player.x - sx, ay = player.y - sy;
                    const len = Math.sqrt(ax * ax + ay * ay) || 1;
                    shadow.vx = (ax / len) * this._getEffectiveSpeed(2);
                    shadow.vy = (ay / len) * this._getEffectiveSpeed(2);
                    shadow.hit = false;
                    this.attackData.shadows.push(shadow);
                }
            }
            if (this.attackData.shadows) {
                const wb = this.scene.physics.world.bounds;
                for (const sh of this.attackData.shadows) {
                    if (sh.active) {
                        sh.x += sh.vx * delta / 1000;
                        sh.y += sh.vy * delta / 1000;
                        sh.x = Phaser.Math.Clamp(sh.x, wb.x, wb.right);
                        sh.y = Phaser.Math.Clamp(sh.y, wb.y, wb.bottom);
                        const d = Phaser.Math.Distance.Between(sh.x, sh.y, player.x, player.y);
                        if (d < 50 && !player.isInvincible && !sh.hit) {
                            sh.hit = true;
                            this._dealDamageToPlayer(player, this.damage * 0.5, atk);
                        }
                    }
                }
            }
            if (elapsed >= 1000) {
                this.sprite.setVisible(true);
                if (this.attackData.shadows) {
                    for (const sh of this.attackData.shadows) if (sh.active) sh.destroy();
                }
                if (!this.attackData.realDash) {
                    this.attackData.realDash = true;
                    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                    this.sprite.body.setVelocity(Math.cos(angle) * this._getEffectiveSpeed(2), Math.sin(angle) * this._getEffectiveSpeed(2));
                    this.attackData.dashEnd = time + 400;
                }
            }
            if (this.attackData.realDash && !this.attackData.realHit) {
                const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                if (d < 60 && !player.isInvincible) {
                    this.attackData.realHit = true;
                    this._dealDamageToPlayer(player, this.damage, atk);
                }
            }
            if (this.attackData.dashEnd && time >= this.attackData.dashEnd) {
                this.sprite.body.setVelocity(0, 0);
                this._finishAttack(time);
            }
        } else if (atk === 'reverseControl') {
            // Ring of projectiles expanding outward from boss, then contracting toward player
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.projectiles = [];
                const count = 8;
                for (let i = 0; i < count; i++) {
                    const a = (Math.PI * 2 / count) * i;
                    const g = this.scene.add.graphics();
                    g.fillStyle(this.config.color, 0.8);
                    g.fillCircle(0, 0, 10);
                    g.setDepth(9);
                    g.setPosition(this.sprite.x, this.sprite.y);
                    this.attackData.projectiles.push({ g, angle: a, dist: 0, hit: false });
                }
            }
            const phase1 = elapsed < 600;
            for (const p of this.attackData.projectiles) {
                if (!p.g.active) continue;
                if (phase1) {
                    p.dist = (elapsed / 600) * 200;
                    p.g.setPosition(
                        this.sprite.x + Math.cos(p.angle) * p.dist,
                        this.sprite.y + Math.sin(p.angle) * p.dist
                    );
                } else {
                    const t = (elapsed - 600) / 800;
                    const sx = this.sprite.x + Math.cos(p.angle) * 200;
                    const sy = this.sprite.y + Math.sin(p.angle) * 200;
                    p.g.setPosition(
                        sx + (player.x - sx) * Math.min(1, t),
                        sy + (player.y - sy) * Math.min(1, t)
                    );
                    const d = Phaser.Math.Distance.Between(p.g.x, p.g.y, player.x, player.y);
                    if (d < 30 && !player.isInvincible && !p.hit) {
                        p.hit = true;
                        this._dealDamageToPlayer(player, this.damage * 0.4, atk, () => player.applyReverseControl(2500));
                    }
                }
            }
            const recoveryMs = 1320;
            if (elapsed >= 1400 && !this.attackData.recoveryStarted) {
                this.attackData.recoveryStarted = true;
                for (const p of this.attackData.projectiles) if (p.g.active) p.g.destroy();
            }
            if (elapsed >= 1400 + recoveryMs) {
                this._finishAttack(time);
            }
        } else if (atk === 'illusion') {
            // Spawn 4 illusion bosses that wander randomly; only touching the real boss hurts
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.sprite.setAlpha(0.7);
                this.attackData.illusions = [];
                for (let i = 0; i < 4; i++) {
                    const ix = 200 + Math.random() * 800;
                    const iy = 200 + Math.random() * 400;
                    const tex = this.sprite.texture.key;
                    const ill = this.scene.add.sprite(ix, iy, tex);
                    ill.setScale(this.sprite.scaleX);
                    ill.setTint(this.config.color);
                    ill.setAlpha(0.7);
                    ill.setDepth(9);
                    ill.vx = (Math.random() - 0.5) * this._getEffectiveSpeed(1);
                    ill.vy = (Math.random() - 0.5) * this._getEffectiveSpeed(1);
                    this.attackData.illusions.push(ill);
                }
            }
            for (const ill of this.attackData.illusions) {
                if (ill.active) {
                    ill.x += ill.vx * delta / 1000;
                    ill.y += ill.vy * delta / 1000;
                    if (ill.x < 200 || ill.x > 1000) ill.vx *= -1;
                    if (ill.y < 150 || ill.y > 650) ill.vy *= -1;
                }
            }
            const recoveryMs = 1680;
            if (elapsed >= 3000 && !this.attackData.recoveryStarted) {
                this.attackData.recoveryStarted = true;
                this.sprite.setAlpha(1);
                for (const ill of this.attackData.illusions) if (ill.active) ill.destroy();
            }
            if (elapsed >= 3000 + recoveryMs) {
                this._finishAttack(time);
            }
        } else if (atk === 'mirageDance') {
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.sprite.setAlpha(0.82);
                this.attackData.beatCount = 3;
                this.attackData.beatDelays = [240, 340, 460];
                this.attackData.completedBeats = 0;
                this.attackData.nextBeatAt = time + this.attackData.beatDelays[0];
                this.attackData.lastHitBeat = -1;
                this.attackData.finisherStartedAt = 0;
                this.attackData.finisherDelayMs = 320;
                this.attackData.finisherRecoveryMs = 760;
                this.attackData.finisherQueuedAt = 0;
                this.attackData.finisherCleanupDone = false;
                this.attackData.projectiles = [];
                this.attackData.illusions = [];
                const tex = this.sprite.texture.key;
                for (let i = 0; i < 3; i++) {
                    const ill = this.scene.add.sprite(this.sprite.x, this.sprite.y, tex);
                    ill.setScale(this.sprite.scaleX);
                    ill.setTint(this.config.color);
                    ill.setAlpha(0.42);
                    ill.setDepth(9);
                    this.attackData.illusions.push(ill);
                }
            }
            const wb = this.scene.physics.world.bounds;
            const orbitBaseAngle = elapsed / 420;
            const orbitRadius = 118 - Math.min(24, this.attackData.completedBeats * 10);
            for (let i = 0; i < this.attackData.illusions.length; i++) {
                const ill = this.attackData.illusions[i];
                if (!ill.active) continue;
                const angle = orbitBaseAngle + (Math.PI * 2 / this.attackData.illusions.length) * i;
                ill.setPosition(
                    Phaser.Math.Clamp(player.x + Math.cos(angle) * orbitRadius, wb.x + 40, wb.right - 40),
                    Phaser.Math.Clamp(player.y + Math.sin(angle) * (orbitRadius * 0.72), wb.y + 40, wb.bottom - 40)
                );
            }
            while (this.attackData.completedBeats < this.attackData.beatCount && time >= this.attackData.nextBeatAt) {
                const beatIndex = this.attackData.completedBeats;
                this.attackData.completedBeats++;
                const nextBeatDelay = this.attackData.beatDelays[this.attackData.completedBeats] || 0;
                this.attackData.nextBeatAt += nextBeatDelay;
                const anchorAngle = -Math.PI / 2 + beatIndex * 0.95;
                const anchorRadius = 140 - beatIndex * 18;
                const targetX = Phaser.Math.Clamp(player.x + Math.cos(anchorAngle) * anchorRadius, wb.x + 36, wb.right - 36);
                const targetY = Phaser.Math.Clamp(player.y + Math.sin(anchorAngle) * Math.max(72, anchorRadius - 24), wb.y + 36, wb.bottom - 36);
                this.sprite.setPosition(targetX, targetY);
                showHitImpactPulse(this.scene, targetX, targetY, this.config.color, beatIndex === this.attackData.beatCount - 1 ? 22 : 16);
                const distToPlayer = Phaser.Math.Distance.Between(targetX, targetY, player.x, player.y);
                if (distToPlayer < 92 && !player.isInvincible && this.attackData.lastHitBeat !== beatIndex) {
                    this.attackData.lastHitBeat = beatIndex;
                    this._dealDamageToPlayer(player, this.damage * 0.45, atk);
                }
                if (beatIndex === this.attackData.beatCount - 1) {
                    this.attackData.finisherQueuedAt = time + this.attackData.finisherDelayMs;
                }
            }
            if (!this.attackData.finisherStartedAt && this.attackData.finisherQueuedAt && time >= this.attackData.finisherQueuedAt) {
                this.attackData.finisherStartedAt = time;
                this.attackData.finisherLockX = player.x;
                this.attackData.finisherLockY = player.y;
                const count = 6;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    const g = this.scene.add.graphics();
                    g.fillStyle(this.config.color, 0.72);
                    g.fillCircle(0, 0, 8);
                    g.setDepth(9);
                    g.setPosition(this.sprite.x, this.sprite.y);
                    this.attackData.projectiles.push({ g, angle, hit: false });
                }
            }
            if (this.attackData.finisherStartedAt) {
                const finisherElapsed = time - this.attackData.finisherStartedAt;
                const expandMs = 180;
                const collapseMs = 760;
                const totalFinisherMs = expandMs + collapseMs + this.attackData.finisherRecoveryMs;
                for (const p of this.attackData.projectiles) {
                    if (!p.g.active) continue;
                    if (finisherElapsed < expandMs) {
                        const dist = (finisherElapsed / expandMs) * 118;
                        p.g.setPosition(
                            this.sprite.x + Math.cos(p.angle) * dist,
                            this.sprite.y + Math.sin(p.angle) * dist
                        );
                    } else {
                        const t = Math.min(1, (finisherElapsed - expandMs) / collapseMs);
                        const sx = this.sprite.x + Math.cos(p.angle) * 118;
                        const sy = this.sprite.y + Math.sin(p.angle) * 118;
                        p.g.setPosition(
                            sx + (this.attackData.finisherLockX - sx) * t,
                            sy + (this.attackData.finisherLockY - sy) * t
                        );
                        const d = Phaser.Math.Distance.Between(p.g.x, p.g.y, player.x, player.y);
                        if (d < 32 && !player.isInvincible && !p.hit) {
                            p.hit = true;
                            this._dealDamageToPlayer(player, this.damage * 0.35, atk, () => player.applyReverseControl(1800));
                        }
                    }
                }
                if (finisherElapsed >= expandMs + collapseMs && !this.attackData.finisherCleanupDone) {
                    this.attackData.finisherCleanupDone = true;
                    this.sprite.setAlpha(1);
                    for (const p of this.attackData.projectiles) if (p.g.active) p.g.destroy();
                    for (const ill of this.attackData.illusions) if (ill.active) ill.destroy();
                }
                if (finisherElapsed >= totalFinisherMs) {
                    this._finishAttack(time);
                }
            }
        } else if (atk === 'copyWeapon') {
            // Rapid projectile barrage toward player
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.projectiles = [];
                this.attackData.nextShot = time;
                this.attackData.shotCount = 0;
            }
            if (time >= this.attackData.nextShot && this.attackData.shotCount < 6) {
                this.attackData.shotCount++;
                this.attackData.nextShot = time + 200;
                const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                const g = this.scene.add.graphics();
                g.fillStyle(this.config.color, 0.9);
                g.fillCircle(0, 0, 8);
                g.setDepth(9);
                g.setPosition(this.sprite.x, this.sprite.y);
                this.attackData.projectiles.push({
                    g, vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350, hit: false
                });
            }
            for (const p of this.attackData.projectiles) {
                if (!p.g.active) continue;
                p.g.x += p.vx * delta / 1000;
                p.g.y += p.vy * delta / 1000;
                const d = Phaser.Math.Distance.Between(p.g.x, p.g.y, player.x, player.y);
                if (d < 25 && !player.isInvincible && !p.hit) {
                    p.hit = true;
                    this._dealDamageToPlayer(player, this.damage * 0.3, atk);
                }
            }
            if (elapsed >= 2000) {
                for (const p of this.attackData.projectiles) if (p.g.active) p.g.destroy();
                this._finishAttack(time);
            }
        } else if (atk === 'bladeOrbit') {
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.blades = [];
                this.attackData.spinRadius = 96;
                const bladeCount = 5;
                for (let i = 0; i < bladeCount; i++) {
                    const angle = (Math.PI * 2 / bladeCount) * i;
                    const g = this.scene.add.graphics();
                    g.setDepth(9);
                    this.attackData.blades.push({
                        g,
                        angle,
                        launched: false,
                        hit: false,
                        launchAt: 700 + i * 120,
                        vx: 0,
                        vy: 0
                    });
                }
            }
            for (const blade of this.attackData.blades) {
                if (!blade.g.active) continue;
                blade.g.clear();
                blade.g.fillStyle(0xFFF0B8, blade.launched ? 0.9 : 0.78);
                if (!blade.launched) {
                    blade.angle += (delta / 1000) * 2.4;
                    blade.x = this.sprite.x + Math.cos(blade.angle) * this.attackData.spinRadius;
                    blade.y = this.sprite.y + Math.sin(blade.angle) * this.attackData.spinRadius;
                    if (elapsed >= blade.launchAt) {
                        blade.launched = true;
                        blade.vx = Math.cos(blade.angle) * 320;
                        blade.vy = Math.sin(blade.angle) * 320;
                    }
                } else {
                    blade.x += blade.vx * delta / 1000;
                    blade.y += blade.vy * delta / 1000;
                }
                blade.g.fillTriangle(
                    blade.x,
                    blade.y - 12,
                    blade.x - 6,
                    blade.y + 10,
                    blade.x + 6,
                    blade.y + 10
                );
                const d = Phaser.Math.Distance.Between(blade.x, blade.y, player.x, player.y);
                if (d < 24 && !player.isInvincible && !blade.hit) {
                    blade.hit = true;
                    this._dealDamageToPlayer(player, this.damage * 0.35, atk);
                }
            }
            if (elapsed >= 1900) {
                for (const blade of this.attackData.blades) if (blade.g.active) blade.g.destroy();
                this._finishAttack(time);
            }
        } else {
            // Fallback: simple teleport + dash
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
                this.sprite.body.setVelocity(Math.cos(angle) * this._getEffectiveSpeed(3), Math.sin(angle) * this._getEffectiveSpeed(3));
            }
            if (elapsed >= 400) {
                this.sprite.body.setVelocity(0, 0);
                this._finishAttack(time);
            }
        }
    }

    _execHazard(atk, time, delta, player) {
        const elapsed = time - this.attackStart;

        if (atk === 'summonSpider') {
            // Spawn small spiders that chase the player
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.minions = [];
                const count = 3 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    const sx = this.sprite.x + (Math.random() - 0.5) * 200;
                    const sy = this.sprite.y + (Math.random() - 0.5) * 200;
                    const g = this.scene.add.graphics();
                    g.fillStyle(this.config.color, 0.8);
                    g.fillCircle(0, 0, 12);
                    g.fillStyle(0x000000, 1);
                    g.fillCircle(-4, -3, 3);
                    g.fillCircle(4, -3, 3);
                    g.setPosition(sx, sy);
                    g.setDepth(8);
                    this.attackData.minions.push({ g, x: sx, y: sy, hit: false, hp: 2 });
                }
            }
            const wb = this.scene.physics.world.bounds;
            for (const m of this.attackData.minions) {
                if (!m.g.active) continue;
                const a = Phaser.Math.Angle.Between(m.x, m.y, player.x, player.y);
                m.x += Math.cos(a) * 100 * delta / 1000;
                m.y += Math.sin(a) * 100 * delta / 1000;
                m.x = Phaser.Math.Clamp(m.x, wb.x, wb.right);
                m.y = Phaser.Math.Clamp(m.y, wb.y, wb.bottom);
                m.g.setPosition(m.x, m.y);
                const d = Phaser.Math.Distance.Between(m.x, m.y, player.x, player.y);
                if (d < 30 && !player.isInvincible && !m.hit) {
                    m.hit = true;
                    this._dealDamageToPlayer(player, this.damage * 0.3, atk);
                    m.g.destroy();
                }
            }
            if (elapsed >= 4000) {
                for (const m of this.attackData.minions) if (m.g.active) m.g.destroy();
                this._finishAttack(time);
            }
        } else if (atk === 'coinTrap') {
            // Gold circles that blink then explode
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.coins = [];
                const count = 5 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const cx = 200 + Math.random() * 800;
                    const cy = 200 + Math.random() * 400;
                    const g = this.scene.add.graphics();
                    g.setDepth(7);
                    this.attackData.coins.push({ g, x: cx, y: cy, exploded: false, spawnTime: time + i * 300 });
                }
            }
            for (const c of this.attackData.coins) {
                if (!c.g.active || c.exploded) continue;
                const coinElapsed = time - c.spawnTime;
                if (coinElapsed < 0) continue;
                c.g.clear();
                if (coinElapsed < 1500) {
                    const blink = Math.floor(coinElapsed / 150) % 2;
                    c.g.fillStyle(0xFFD700, blink ? 0.9 : 0.4);
                    c.g.fillCircle(c.x, c.y, 25);
                } else {
                    c.exploded = true;
                    c.g.fillStyle(0xFF4500, 0.7);
                    c.g.fillCircle(c.x, c.y, 60);
                    const d = Phaser.Math.Distance.Between(c.x, c.y, player.x, player.y);
                    if (d < 60 && !player.isInvincible) {
                        this._dealDamageToPlayer(player, this.damage * 0.6, atk);
                    }
                    this.scene.time.delayedCall(300, () => { if (c.g.active) c.g.destroy(); });
                }
            }
            if (elapsed >= 5000) {
                for (const c of this.attackData.coins) if (c.g.active) c.g.destroy();
                this._finishAttack(time);
            }
        } else if (atk === 'sleepFog') {
            // Slow-moving fog clouds
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.fogs = [];
                for (let i = 0; i < 4; i++) {
                    const fx = 200 + Math.random() * 800;
                    const fy = 200 + Math.random() * 400;
                    const g = this.scene.add.graphics();
                    g.setDepth(7);
                    this.attackData.fogs.push({
                        g, x: fx, y: fy,
                        vx: (Math.random() - 0.5) * 60,
                        vy: (Math.random() - 0.5) * 60,
                        lastHit: 0, radius: 50 + Math.random() * 30
                    });
                }
            }
            for (const f of this.attackData.fogs) {
                if (!f.g.active) continue;
                f.x += f.vx * delta / 1000;
                f.y += f.vy * delta / 1000;
                if (f.x < 150 || f.x > 1050) f.vx *= -1;
                if (f.y < 150 || f.y > 650) f.vy *= -1;
                f.g.clear();
                f.g.fillStyle(this.config.color, 0.3);
                f.g.fillCircle(f.x, f.y, f.radius);
                f.g.fillStyle(this.config.color, 0.15);
                f.g.fillCircle(f.x + 15, f.y - 10, f.radius * 0.7);
                const d = Phaser.Math.Distance.Between(f.x, f.y, player.x, player.y);
                if (d < f.radius && !player.isInvincible && time - f.lastHit > 800) {
                    f.lastHit = time;
                    this._dealDamageToPlayer(player, this.damage * 0.25, atk);
                }
            }
            if (elapsed >= 5000) {
                for (const f of this.attackData.fogs) if (f.g.active) f.g.destroy();
                this._finishAttack(time);
            }
        } else if (atk === 'magmaRing') {
            if (!this.attackData.started) {
                this.attackData.started = true;
                this.sprite.body.setVelocity(0, 0);
                this.attackData.ring = this.scene.add.graphics();
                this.attackData.ring.setDepth(8);
                this.attackData.outerRadius = 230;
                this.attackData.innerRadius = 90;
                this.attackData.thickness = 34;
                this.attackData.lastHit = 0;
            }
            const ratio = Math.min(1, elapsed / 1800);
            const ringRadius = Phaser.Math.Linear(this.attackData.outerRadius, this.attackData.innerRadius, ratio);
            this.attackData.ring.clear();
            this.attackData.ring.lineStyle(this.attackData.thickness, this.config.color, 0.55);
            this.attackData.ring.strokeCircle(this.sprite.x, this.sprite.y, ringRadius);
            this.attackData.ring.lineStyle(2, 0xFFD27A, 0.9);
            this.attackData.ring.strokeCircle(this.sprite.x, this.sprite.y, Math.max(12, ringRadius - this.attackData.thickness / 2));
            const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y);
            const dangerBand = this.attackData.thickness / 2 + 8;
            if (
                Math.abs(d - ringRadius) <= dangerBand
                && !player.isInvincible
                && time - this.attackData.lastHit >= 450
            ) {
                this.attackData.lastHit = time;
                this._dealDamageToPlayer(player, this.damage * 0.32, atk);
            }
            if (elapsed >= 1900) {
                if (this.attackData.ring && this.attackData.ring.active) this.attackData.ring.destroy();
                this._finishAttack(time);
            }
        } else {
            // Default: static hazard zones
            if (!this.attackData.zones) {
                this.attackData.zones = [];
                const count = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const zx = 600 + (Math.random() - 0.5) * 600;
                    const zy = 400 + (Math.random() - 0.5) * 400;
                    const g = this.scene.add.graphics();
                    g.fillStyle(this.config.color, 0.6);
                    g.fillCircle(zx, zy, 60);
                    g.setDepth(7);
                    this.attackData.zones.push({ g, x: zx, y: zy, lastHit: 0 });
                }
                this.sprite.body.setVelocity(0, 0);
            }
            for (const z of this.attackData.zones) {
                if (z.g.active) {
                    const d = Phaser.Math.Distance.Between(z.x, z.y, player.x, player.y);
                    if (d < 60 && !player.isInvincible && time - z.lastHit > 500) {
                        z.lastHit = time;
                        this._dealDamageToPlayer(player, this.damage * 0.5, atk);
                    }
                }
            }
            if (elapsed >= 5000) {
                for (const z of this.attackData.zones) if (z.g.active) z.g.destroy();
                this._finishAttack(time);
            }
        }
    }

    _finishAttack(time) {
        const phase = this.getPhase();
        const phaseLocalCooldownMs = phase && phase.phaseLocalCooldownMs ? phase.phaseLocalCooldownMs : {};
        const sharedAttackRecoveryMs = phase && phase.sharedAttackRecoveryMs ? phase.sharedAttackRecoveryMs : {};
        const sharedAttackRecoveryGroups = phase && phase.sharedAttackRecoveryGroups ? phase.sharedAttackRecoveryGroups : {};
        const postMajorBreatherChain = phase && phase.postMajorBreatherChain ? phase.postMajorBreatherChain : null;
        const triggerAttacks = postMajorBreatherChain && Array.isArray(postMajorBreatherChain.triggerAttacks) ? postMajorBreatherChain.triggerAttacks : [];
        const breatherAttacks = postMajorBreatherChain && Array.isArray(postMajorBreatherChain.breatherAttacks) ? postMajorBreatherChain.breatherAttacks : [];
        const requiredBreatherCount = postMajorBreatherChain && postMajorBreatherChain.requiredCount > 0 ? postMajorBreatherChain.requiredCount : 0;
        const finishedAttackCooldownMs = phaseLocalCooldownMs[this.currentAttack] || 0;
        if (finishedAttackCooldownMs > 0) {
            this.phaseAttackCooldownExpires[this.currentAttack] = time + finishedAttackCooldownMs;
        }
        Object.entries(sharedAttackRecoveryGroups).forEach(([groupKey, groupAttacks]) => {
            if (!Array.isArray(groupAttacks) || !groupAttacks.includes(this.currentAttack)) return;
            const sharedRecoveryMs = sharedAttackRecoveryMs[groupKey] || 0;
            if (sharedRecoveryMs <= 0) return;
            this.phaseAttackGroupRecoveryExpires[groupKey] = time + sharedRecoveryMs;
        });
        if (requiredBreatherCount > 0 && triggerAttacks.includes(this.currentAttack)) {
            this.phaseBreatherChainRemaining = requiredBreatherCount;
        } else if (this.phaseBreatherChainRemaining > 0 && breatherAttacks.includes(this.currentAttack)) {
            this.phaseBreatherChainRemaining = Math.max(0, this.phaseBreatherChainRemaining - 1);
        }
        this.lastCompletedAttack = this.currentAttack;
        this.attackState = 'cooldown';
        this.cooldownStart = time;
    }

    takeDamage(amount) {
        if (this.scene.time.now < this.invincibleUntil) return;
        this.hp = Math.max(0, this.hp - amount);
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => this.sprite.setAlpha(1)
        });
        if (this.hp <= 0) this.isAlive = false;
    }

    clearAttackVisuals() {
        this.activeTelegraph = null;
        this.attackState = 'idle';
        this.currentAttack = null;
        this.attackData = this.attackData || {};
        if (this.sprite && this.sprite.active) {
            this.sprite.setAlpha(0);
            this.sprite.setVisible(false);
            if (this.sprite.body) this.sprite.body.setVelocity(0, 0);
        }
        if (this.statusAura && this.statusAura.active) this.statusAura.clear();

        const destroyIfActive = (obj) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
                obj.forEach(destroyIfActive);
                return;
            }
            if (obj.g && obj.g.active && obj.g.destroy) {
                obj.g.destroy();
                return;
            }
            if (obj.active && obj.destroy) {
                obj.destroy();
            }
        };

        destroyIfActive(this.attackData.circle);
        destroyIfActive(this.attackData.cone);
        destroyIfActive(this.attackData.shadows);
        destroyIfActive(this.attackData.projectiles);
        destroyIfActive(this.attackData.blades);
        destroyIfActive(this.attackData.illusions);
        destroyIfActive(this.attackData.minions);
        destroyIfActive(this.attackData.coins);
        destroyIfActive(this.attackData.fogs);
        destroyIfActive(this.attackData.ring);
        destroyIfActive(this.attackData.zones);
        this.attackData = {};
    }

    destroy() {
        this.clearAttackVisuals();
        if (this.sprite && this.sprite.active) this.sprite.destroy();
        if (this.statusAura && this.statusAura.active) this.statusAura.destroy();
    }
}

/**
 * BossScene - Full boss fight with phase system and attack patterns
 */
class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    create(data) {
        this._bossHudMeasureNodes = {};
        this._bossHudTextWidthCache = new Map();

        const bossKey = data.bossKey || 'wrath';
        const bossConfig = BOSSES[bossKey];
        if (!bossConfig) throw new Error('Unknown boss: ' + bossKey);
        AudioSystem.bindSceneInput(this);
        GameState.ensureRunModifiers();

        this.bossKey = bossKey;
        this.playerDead = false;
        this.bossDead = false;
        this.victoryShown = false;
        this._bossHudLayoutApplied = false;
        this._victoryRequestedAtMs = 0;
        this._victorySequenceStarted = false;
        this._victoryTransitionInFlight = false;
        this._victoryRetryTimer = null;
        this._victoryRetryCount = 0;
        this.activeHitboxes = [];

        const arenaW = 1000;
        const arenaH = 700;
        const arenaX = 100 + (1200 - arenaW) / 2;
        const arenaY = 100 + (900 - arenaH) / 2;
        this._arenaRect = { x: arenaX, y: arenaY, w: arenaW, h: arenaH };
        this.physics.world.setBounds(arenaX, arenaY, arenaW, arenaH);

        const cr = (bossConfig.color >> 16) & 0xFF;
        const cg = (bossConfig.color >> 8) & 0xFF;
        const cb = bossConfig.color & 0xFF;
        const borderColor = Phaser.Display.Color.GetColor(
            Math.min(255, cr + 40),
            Math.min(255, cg + 40),
            Math.min(255, cb + 40)
        );

        drawPixelTiledRect(this, arenaX, arenaY, arenaW, arenaH, this.bossKey, 0);
        const gfx = this.add.graphics();
        gfx.lineStyle(4, borderColor, 1);
        gfx.strokeRect(arenaX, arenaY, arenaW, arenaH);
        gfx.setDepth(1);

        this.player = new Player(this, 600, 750);
        applyPlayerWeaponState(this.player);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
        this.cameras.main.setBounds(arenaX, arenaY, arenaW, arenaH);

        this.boss = new Boss(this, 600, 250, bossKey);

        const barW = 500;
        const barH = 24;
        const barX = 512 - barW / 2;
        const barY = 8;
        this._bossHpBarRect = { x: barX, y: barY, w: barW, h: barH, pad: 4 };
        this.bossHpBarBg = this.add.graphics();
        this.bossHpBarBg.setScrollFactor(0);
        this.bossHpBarAfterimage = this.add.graphics();
        this.bossHpBarAfterimage.setScrollFactor(0);
        this.bossHpBarFill = this.add.graphics();
        this.bossHpBarFill.setScrollFactor(0);
        this.bossHpBarStatus = this.add.graphics();
        this.bossHpBarStatus.setScrollFactor(0);
        this.bossHpBarMarkers = this.add.graphics();
        this.bossHpBarMarkers.setScrollFactor(0);
        this.bossHpBarFrame = this.add.graphics();
        this.bossHpBarFrame.setScrollFactor(0);
        const bossLabelY = barY + barH + 4;
        this.bossHpLabel = this.add.text(512, bossLabelY, bossConfig.sin + ' ' + bossConfig.name, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5, 0).setScrollFactor(0);
        const phaseLabelY = bossLabelY + 18;
        this.bossPhaseText = this.add.text(barX, phaseLabelY, '', {
            fontSize: '12px',
            fill: '#ffd27a',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setScrollFactor(0);
        this.bossPhaseThresholdText = this.add.text(barX + barW, phaseLabelY, '', {
            fontSize: '12px',
            fill: '#ffe8b2'
        }).setOrigin(1, 0).setScrollFactor(0);
        const telegraphY = phaseLabelY + 18;
        this._bossTelegraphRect = { x: barX, y: telegraphY, w: barW, h: 12 };
        this.bossTelegraphBarBg = this.add.graphics();
        this.bossTelegraphBarBg.setScrollFactor(0);
        this.bossTelegraphBarFill = this.add.graphics();
        this.bossTelegraphBarFill.setScrollFactor(0);
        this.bossTelegraphWindowGuard = this.add.graphics();
        this.bossTelegraphWindowGuard.setScrollFactor(0);
        this.bossTelegraphText = this.add.text(barX, telegraphY - 4, '', {
            fontSize: '11px',
            fill: '#fff6da',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setScrollFactor(0);
        this.bossTelegraphWindowText = this.add.text(barX + barW, telegraphY - 4, '', {
            fontSize: '11px',
            fill: '#ffe1a1',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0);
        this.bossTelegraphHintText = this.add.text(512, telegraphY + 16, '', {
            fontSize: '10px',
            fill: '#ffdcb3',
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0);
        this.bossHpTrailRatio = 1;

        this.scene.launch('UIScene');

        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => this.player.tryDodge());
        this.input.keyboard.on('keydown-Q', () => this.player.switchWeaponLeft());
        this.input.keyboard.on('keydown-E', () => this.player.switchWeaponRight());
        this.input.keyboard.on('keydown-ONE', () => handleQuickSlotUse(this, this.player, 0));
        this.input.keyboard.on('keydown-TWO', () => handleQuickSlotUse(this, this.player, 1));
        this.input.keyboard.on('keydown-THREE', () => handleQuickSlotUse(this, this.player, 2));
        this.input.keyboard.on('keydown-FOUR', () => handleQuickSlotUse(this, this.player, 3));
        this.input.keyboard.on('keydown-TAB', () => {
            if (this.scene.isActive('InventoryScene')) this.scene.stop('InventoryScene');
            else this.scene.launch('InventoryScene');
        });
        this.input.keyboard.on('keydown-ESC', () => openPauseMenu(this));
        this.input.on('pointerdown', (pointer) => {
            if (this.playerDead || this.bossDead) return;
            let hitbox = null;
            if (pointer.button === 0) hitbox = this.player.tryAttack();
            else if (pointer.button === 2) hitbox = this.player.trySpecialAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-U', () => {
            if (this.playerDead || this.bossDead) return;
            const hitbox = this.player.tryAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-O', () => {
            if (this.playerDead || this.bossDead) return;
            const hitbox = this.player.trySpecialAttack();
            if (hitbox) this.activeHitboxes.push(hitbox);
        });
        this.input.keyboard.on('keydown-H', () => {
            if (!this.scene.isActive('HelpScene')) {
                this.scene.pause();
                this.scene.launch('HelpScene', { parentScene: 'BossScene' });
            }
        });
    }

    _getBossHudMeasureNode(styleKey) {
        if (!this._bossHudMeasureNodes) {
            this._bossHudMeasureNodes = {};
        }
        const cached = this._bossHudMeasureNodes[styleKey];
        if (cached && !cached.active) {
            this._bossHudMeasureNodes[styleKey] = null;
        }
        if (!this._bossHudMeasureNodes[styleKey]) {
            let style = { fontSize: '11px', fill: '#fff6da' };
            if (styleKey === 'bossTelegraphMain') {
                style = { fontSize: '11px', fill: '#fff6da', fontStyle: 'bold' };
            } else if (styleKey === 'bossTelegraphWindow') {
                style = { fontSize: '11px', fill: '#ffe1a1', fontStyle: 'bold' };
            } else if (styleKey === 'bossTelegraphHint') {
                style = { fontSize: '10px', fill: '#ffdcb3', align: 'center' };
            }
            this._bossHudMeasureNodes[styleKey] = this.add.text(-1000, -1000, '', style)
                .setVisible(false)
                .setScrollFactor(0)
                .setDepth(0);
        }
        return this._bossHudMeasureNodes[styleKey];
    }

    _measureBossHudTextWidth(text, styleKey) {
        const safeText = typeof text === 'string' ? text : '';
        if (!safeText) return 0;
        if (!this._bossHudTextWidthCache) {
            this._bossHudTextWidthCache = new Map();
        }
        const cacheKey = `${styleKey}:${safeText}`;
        if (this._bossHudTextWidthCache.has(cacheKey)) {
            return this._bossHudTextWidthCache.get(cacheKey);
        }
        const measureText = this._getBossHudMeasureNode(styleKey);
        measureText.setText(safeText);
        const width = measureText.width;
        this._bossHudTextWidthCache.set(cacheKey, width);
        return width;
    }

    _fitBossHudTextToWidth(text, maxWidth, styleKey) {
        return clampTextToWidth(text, maxWidth, {
            measureGlyphWidth: glyph => this._measureBossHudTextWidth(glyph, styleKey),
            measurementCache: new Map()
        });
    }

    _clampToArena(sprite) {
        if (!sprite || !sprite.active || !this._arenaRect) return;
        const rect = this._arenaRect;
        const bodyWidth = sprite.body && sprite.body.width ? sprite.body.width : 0;
        const bodyHeight = sprite.body && sprite.body.height ? sprite.body.height : 0;
        const padX = Math.max(4, bodyWidth / 2);
        const padY = Math.max(4, bodyHeight / 2);
        const cx = Phaser.Math.Clamp(sprite.x, rect.x + padX, rect.x + rect.w - padX);
        const cy = Phaser.Math.Clamp(sprite.y, rect.y + padY, rect.y + rect.h - padY);
        if (cx !== sprite.x || cy !== sprite.y) {
            sprite.setPosition(cx, cy);
            if (sprite.body && sprite.body.velocity) sprite.body.setVelocity(0, 0);
        }
    }

    update(time, delta) {
        if (this.playerDead) return;
        if (this.bossDead) {
            this._watchVictoryFlow();
            return;
        }

        this.player.update(time, delta);
        this._clampToArena(this.player);
        this.boss.update(time, delta, this.player);
        this._clampToArena(this.boss.sprite);

        const defaultHitboxRadius = 50;
        for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
            const hb = this.activeHitboxes[i];
            if (!hb.active) {
                this.activeHitboxes.splice(i, 1);
                continue;
            }
            const hbRadius = hb.hitRadius || defaultHitboxRadius;
            if (this.boss.isAlive && this.boss.sprite.active) {
                const d = Phaser.Math.Distance.Between(hb.x, hb.y, this.boss.sprite.x, this.boss.sprite.y);
                if (d < hbRadius + 30 && hb.damage) {
                    this.boss.takeDamage(hb.damage);
                    if (hb.isSpecial) {
                        const counterBroken = this.boss.tryCounterBreak(BOSS_COUNTER_BREAK_STAGGER_MS);
                        showHitImpactPulse(
                            this,
                            this.boss.sprite.x,
                            this.boss.sprite.y,
                            counterBroken ? 0xFFD36B : 0xFF6B4A,
                            counterBroken ? 18 : 16
                        );
                        showFloatingCombatText(
                            this,
                            this.boss.sprite.x,
                            this.boss.sprite.y - 26,
                            counterBroken ? '破招' : '破势',
                            counterBroken ? '#ffe39f' : '#ffcf85',
                            650
                        );
                        showFloatingCombatText(this, this.boss.sprite.x, this.boss.sprite.y - 46, '-' + hb.damage, '#ff9f7a', 620);
                    } else {
                        showHitImpactPulse(this, this.boss.sprite.x, this.boss.sprite.y, 0xFF9F6A, 12);
                        showFloatingCombatText(this, this.boss.sprite.x, this.boss.sprite.y - 40, '-' + hb.damage, '#ffe6bf', 500);
                    }
                    if (hb.statusEffect && this.boss.applyStatusEffect) {
                        this.boss.applyStatusEffect(hb.statusEffect.key, {
                            durationMs: hb.statusEffect.durationMs,
                            sourceDamage: hb.statusEffect.sourceDamage || hb.damage
                        });
                    }
                    hb.damage = 0;
                }
            }
        }

        this._renderBossHud(delta);

        const ui = this.scene.get('UIScene');
        if (ui && ui.setBossHudLayout && !this._bossHudLayoutApplied) {
            ui.setBossHudLayout(true);
            this._bossHudLayoutApplied = true;
        }
        if (ui && ui.updateHUD) ui.updateHUD(this.player, BOSSES[this.bossKey].area);

        if (!this.boss.isAlive && !this.bossDead) {
            this.bossDead = true;
            this._victoryRequestedAtMs = this._getWallClockMs();
            try {
                this.player.freezeForCinematic();
                this.boss.clearAttackVisuals();
                this.activeHitboxes.forEach((hb) => {
                    if (hb && hb.active && hb.destroy) hb.destroy();
                });
                this.activeHitboxes = [];
                const bossConfig = BOSSES[this.bossKey] || {};
                const drops = bossConfig.drops || {};
                if (!Array.isArray(GameState.sinSeals)) GameState.sinSeals = [];
                if (!Array.isArray(GameState.unlockedWeapons)) GameState.unlockedWeapons = ['sword'];
                if (!Array.isArray(GameState.defeatedBosses)) GameState.defeatedBosses = [];

                if (drops.gold) GameState.addGold(drops.gold);
                if (drops.material) GameState.addItem(drops.material, 1);
                GameState.resolveRunEventRoom();
                if (drops.sinSeal && !GameState.sinSeals.includes(drops.sinSeal)) {
                    GameState.sinSeals.push(drops.sinSeal);
                }
                if (drops.weapon && !GameState.unlockedWeapons.includes(drops.weapon)) {
                    GameState.unlockedWeapons.push(drops.weapon);
                    this._weaponUnlockName = WEAPONS[drops.weapon] ? WEAPONS[drops.weapon].name : drops.weapon;
                }
                if (drops.bonusItems && typeof drops.bonusItems === 'object') {
                    this._bonusItemNames = [];
                    for (const [itemKey, count] of Object.entries(drops.bonusItems)) {
                        GameState.addItem(itemKey, count);
                        const itemName = ITEMS[itemKey] ? ITEMS[itemKey].name : itemKey;
                        this._bonusItemNames.push(itemName + ' x' + count);
                    }
                }
                if (!GameState.defeatedBosses.includes(this.bossKey)) {
                    GameState.defeatedBosses.push(this.bossKey);
                }
                try {
                    GameState.save();
                } catch (e) {
                    // Keep victory flow moving even if persistence is unavailable.
                }
            } catch (e) {
                // Prevent reward/cleanup exceptions from blocking victory transition.
            } finally {
                try {
                    this._victorySequence();
                } catch (e) {
                    this._forceVictoryTransition();
                }
            }
        }

        if (this.player.hp <= 0 && !this.playerDead) {
            this.player.freezeForDeath();
            this.playerDead = true;
            this._deathSequence();
        }
    }

    _renderBossHud(delta) {
        if (!this._bossHpBarRect || !this.boss) return;
        const rect = this._bossHpBarRect;
        const hpRatio = Math.max(0, Math.min(1, this.boss.hp / this.boss.maxHp));
        const afterimageStep = Math.max(0.008, (Math.max(0, delta) / 1000) * BOSS_HUD_AFTERIMAGE_STEP_PER_SECOND);
        this.bossHpTrailRatio = advanceBossHpAfterimage(this.bossHpTrailRatio, hpRatio, afterimageStep);
        const phaseHud = buildBossPhaseHudSummary({
            phases: this.boss.config.phases,
            currentPhase: this.boss.currentPhase
        });
        const telegraphHud = this.boss.getTelegraphHudSummary(this.time.now);
        const statusHud = this.boss.getStatusHighlightSummary(this.time.now);
        const phaseAlertActive = this.time.now < (this.boss.phaseAlertUntil || 0);
        const blinkOn = Math.floor(this.time.now / 120) % 2 === 0;
        const frameColor = phaseAlertActive
            ? (blinkOn ? 0xFFE08A : 0xFF8A5B)
            : 0x5B657A;
        const phaseTextColor = phaseAlertActive
            ? (blinkOn ? '#fff3c4' : '#ffcf85')
            : '#ffd27a';
        const innerX = rect.x + rect.pad;
        const innerY = rect.y + rect.pad;
        const innerW = rect.w - rect.pad * 2;
        const innerH = rect.h - rect.pad * 2;

        this.bossHpBarBg.clear();
        this.bossHpBarBg.fillStyle(0x2A2430, 1);
        this.bossHpBarBg.fillRect(rect.x, rect.y, rect.w, rect.h);

        this.bossHpBarMarkers.clear();
        this.bossHpBarMarkers.lineStyle(2, 0xFFF3C2, 0.65);
        phaseHud.thresholdMarkers.forEach((ratio) => {
            const markerX = innerX + innerW * ratio;
            this.bossHpBarMarkers.lineBetween(markerX, rect.y + 2, markerX, rect.y + rect.h - 2);
        });

        this.bossHpBarAfterimage.clear();
        this.bossHpBarAfterimage.fillStyle(0xF5B58A, 0.78);
        this.bossHpBarAfterimage.fillRect(innerX, innerY, innerW * this.bossHpTrailRatio, innerH);

        this.bossHpBarFill.clear();
        this.bossHpBarFill.fillStyle(this.boss.config.color, 1);
        this.bossHpBarFill.fillRect(innerX, innerY, innerW * hpRatio, innerH);

        this.bossHpBarStatus.clear();
        if (statusHud.segments.length > 0) {
            const laneGap = 1;
            const laneHeight = Math.max(3, Math.floor((innerH - laneGap * (statusHud.segments.length - 1)) / statusHud.segments.length));
            statusHud.segments.forEach((segment, index) => {
                const laneY = innerY + index * (laneHeight + laneGap);
                this.bossHpBarStatus.fillStyle(segment.color, segment.alpha);
                this.bossHpBarStatus.fillRect(innerX, laneY, innerW * segment.ratio, laneHeight);
            });
        }

        this.bossHpBarFrame.clear();
        this.bossHpBarFrame.lineStyle(phaseAlertActive ? 3 : 2, frameColor, 1);
        this.bossHpBarFrame.strokeRect(rect.x, rect.y, rect.w, rect.h);

        this.bossHpLabel.setText(this.boss.config.sin + ' ' + this.boss.config.name);
        this.bossHpLabel.setStyle({ fill: phaseAlertActive ? phaseTextColor : '#ffffff' });
        this.bossPhaseText.setText(phaseHud.phaseLabel);
        this.bossPhaseText.setStyle({ fill: phaseTextColor });
        this.bossPhaseThresholdText.setText(phaseHud.nextThresholdLabel);
        this.bossPhaseThresholdText.setStyle({ fill: phaseAlertActive ? '#ffe7ad' : '#ffe8b2' });

        this.bossTelegraphBarBg.clear();
        this.bossTelegraphBarFill.clear();
        this.bossTelegraphWindowGuard.clear();
        if (telegraphHud.visible) {
            const telegraphRect = this._bossTelegraphRect;
            const typeKey = this.boss.activeTelegraph ? this.boss.activeTelegraph.typeKey : 'DASH';
            const telegraphColor = BOSS_TELEGRAPH_TYPE_COLORS[typeKey] || 0xF5B58A;
            const telegraphMainText = telegraphHud.typeLabel
                ? `${telegraphHud.typeLabel} | ${telegraphHud.attackLabel}`
                : telegraphHud.attackLabel;
            const telegraphLayout = buildBossTelegraphTextLayout({
                telegraphWidth: telegraphRect.w,
                mainText: telegraphMainText,
                windowText: telegraphHud.counterWindowLabel,
                hintText: telegraphHud.hintLabel || '',
                measureTextWidth: (text, styleKey) => this._measureBossHudTextWidth(text, styleKey)
            });
            this.bossTelegraphBarBg.fillStyle(0x261F2D, 0.92);
            this.bossTelegraphBarBg.fillRoundedRect(telegraphRect.x, telegraphRect.y, telegraphRect.w, telegraphRect.h, 4);
            this.bossTelegraphBarFill.fillStyle(telegraphColor, 0.9);
            this.bossTelegraphBarFill.fillRoundedRect(
                telegraphRect.x,
                telegraphRect.y,
                telegraphRect.w * telegraphHud.progressRatio,
                telegraphRect.h,
                4
            );
            if (telegraphLayout.windowAccentVisible) {
                this.bossTelegraphWindowGuard.fillStyle(0x3E2B18, 0.88);
                this.bossTelegraphWindowGuard.fillRoundedRect(
                    telegraphRect.x,
                    telegraphRect.y + telegraphLayout.windowAccentYOffset,
                    telegraphRect.w,
                    telegraphLayout.windowAccentHeight,
                    4
                );
            }
            this.bossTelegraphText.setY(telegraphRect.y + telegraphLayout.mainYOffset);
            this.bossTelegraphWindowText.setX(telegraphRect.x + telegraphLayout.windowX);
            this.bossTelegraphWindowText.setOrigin(telegraphLayout.windowOriginX, 0);
            this.bossTelegraphWindowText.setY(telegraphRect.y + telegraphLayout.windowYOffset);
            this.bossTelegraphText.setText(this._fitBossHudTextToWidth(telegraphMainText, telegraphLayout.mainMaxWidth, 'bossTelegraphMain'));
            this.bossTelegraphWindowText.setText(this._fitBossHudTextToWidth(telegraphHud.counterWindowLabel, telegraphLayout.windowMaxWidth, 'bossTelegraphWindow'));
            this.bossTelegraphHintText.setY(telegraphRect.y + telegraphLayout.hintYOffset);
            this.bossTelegraphHintText.setText(this._fitBossHudTextToWidth(telegraphHud.hintLabel || '', telegraphRect.w, 'bossTelegraphHint'));
        } else {
            const telegraphRect = this._bossTelegraphRect;
            this.bossTelegraphText.setY(telegraphRect.y - 4);
            this.bossTelegraphWindowText.setX(telegraphRect.x + telegraphRect.w);
            this.bossTelegraphWindowText.setOrigin(1, 0);
            this.bossTelegraphWindowText.setY(telegraphRect.y - 4);
            this.bossTelegraphHintText.setY(telegraphRect.y + 16);
            this.bossTelegraphText.setText('');
            this.bossTelegraphWindowText.setText('');
            this.bossTelegraphHintText.setText('');
        }
    }

    _victorySequence() {
        this._victoryTransitionDone = false;
        this._victorySequenceStarted = true;
        if (this._victoryFailSafeTimer) {
            this._victoryFailSafeTimer.remove(false);
            this._victoryFailSafeTimer = null;
        }
        if (this._victoryBrowserFailSafeTimer && typeof window !== 'undefined' && window.clearTimeout) {
            window.clearTimeout(this._victoryBrowserFailSafeTimer);
            this._victoryBrowserFailSafeTimer = null;
        }
        if (this._victoryRetryTimer && typeof window !== 'undefined' && window.clearTimeout) {
            window.clearTimeout(this._victoryRetryTimer);
            this._victoryRetryTimer = null;
        }
        try {
            const finishVictoryTransition = () => {
                // Defer scene transition to next frame to avoid stopping/starting
                // scenes from within a Phaser keyboard event handler (DialogScene
                // keydown → advance → onComplete), which corrupts keyboard state.
                if (typeof window !== 'undefined' && window.setTimeout) {
                    window.setTimeout(() => this._forceVictoryTransition(), 0);
                } else {
                    this._forceVictoryTransition();
                }
            };
            this._victoryFailSafeTimer = this.time.delayedCall(12000, () => {
                finishVictoryTransition();
            });
            if (typeof window !== 'undefined' && window.setTimeout) {
                this._victoryBrowserFailSafeTimer = window.setTimeout(() => {
                    finishVictoryTransition();
                }, 14000);
            }
            this.boss.sprite.setAlpha(0);
            this.cameras.main.flash(300, 255, 255, 255);
            const lines = ['Victory!'];
            if (this._weaponUnlockName) {
                lines.push('解锁新武器: ' + this._weaponUnlockName);
            }
            if (this._bonusItemNames && this._bonusItemNames.length > 0) {
                lines.push('获得: ' + this._bonusItemNames.join(', '));
            }
            const bossDrops = BOSSES[this.bossKey] && BOSSES[this.bossKey].drops;
            if (bossDrops && bossDrops.gold) {
                lines.push('金币 +' + bossDrops.gold);
            }
            const sealCount = Array.isArray(GameState.sinSeals) ? GameState.sinSeals.length : 0;
            lines.push('罪之印记: ' + sealCount + '/7');

            this.victoryText = this.add.text(512, 360, lines[0], {
                fontSize: '48px',
                fill: '#FFD700'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(50);

            if (lines.length > 1) {
                this.victoryDetailText = this.add.text(512, 420, lines.slice(1).join('\n'), {
                    fontSize: '22px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5).setScrollFactor(0).setDepth(50);
            }

            this.time.delayedCall(2500, () => {
                try {
                    const bossConfig = BOSSES[this.bossKey] || {};
                    const rewardDialog = lines.slice(1).map(text => ({ speaker: '系统', text }));
                    const dialog = rewardDialog.concat(bossConfig.defeatDialog || []);
                    if (this.victoryText && this.victoryText.active) this.victoryText.destroy();
                    if (this.victoryDetailText && this.victoryDetailText.active) this.victoryDetailText.destroy();
                    if (dialog.length > 0) {
                        this.scene.launch('DialogScene', {
                            dialog: dialog,
                            onComplete: () => {
                                finishVictoryTransition();
                            }
                        });
                    } else {
                        finishVictoryTransition();
                    }
                } catch (e) {
                    finishVictoryTransition();
                }
            });
        } catch (e) {
            this._forceVictoryTransition();
        }
    }

    _getWallClockMs() {
        if (typeof performance !== 'undefined' && performance.now) return performance.now();
        return Date.now();
    }

    _watchVictoryFlow() {
        if (this._victoryTransitionDone) return;
        if (!this._victoryRequestedAtMs) this._victoryRequestedAtMs = this._getWallClockMs();
        const elapsed = this._getWallClockMs() - this._victoryRequestedAtMs;
        const dialogActive = this.scene.isActive('DialogScene');
        if (!this._victorySequenceStarted && elapsed >= 1000) {
            this._forceVictoryTransition();
            return;
        }
        if (!dialogActive && elapsed >= 18000) {
            this._forceVictoryTransition();
        }
    }

    _forceVictoryTransition() {
        if (this._victoryTransitionDone || this._victoryTransitionInFlight) return;
        this._victoryTransitionInFlight = true;
        if (this._victoryFailSafeTimer) {
            this._victoryFailSafeTimer.remove(false);
            this._victoryFailSafeTimer = null;
        }
        if (this._victoryBrowserFailSafeTimer && typeof window !== 'undefined' && window.clearTimeout) {
            window.clearTimeout(this._victoryBrowserFailSafeTimer);
            this._victoryBrowserFailSafeTimer = null;
        }
        if (this._victoryRetryTimer && typeof window !== 'undefined' && window.clearTimeout) {
            window.clearTimeout(this._victoryRetryTimer);
            this._victoryRetryTimer = null;
        }
        if (this.victoryText && this.victoryText.active) this.victoryText.destroy();
        if (this.victoryDetailText && this.victoryDetailText.active) this.victoryDetailText.destroy();
        let started = false;
        try {
            if (this.scene.isActive('DialogScene')) this.scene.stop('DialogScene');
            this.scene.stop('UIScene');
            if (this._bossHudLayoutApplied) this._bossHudLayoutApplied = false;
            const bossCfg = BOSSES[this.bossKey];
            if (bossCfg && bossCfg.isFinal) {
                this.scene.start('CreditsScene');
            } else {
                this.scene.start('HubScene');
            }
            started = true;
        } catch (e) {
            // Retry is scheduled below.
        } finally {
            this._victoryTransitionInFlight = false;
        }
        if (started) {
            this._victoryTransitionDone = true;
            return;
        }
        this._victoryTransitionDone = false;
        this._victoryRetryCount = (this._victoryRetryCount || 0) + 1;
        const retryDelay = Math.min(600, 80 * this._victoryRetryCount);
        if (typeof window !== 'undefined' && window.setTimeout) {
            this._victoryRetryTimer = window.setTimeout(() => {
                this._forceVictoryTransition();
            }, retryDelay);
        }
    }

    _returnToHub() {
        if (this._bossHudLayoutApplied) this._bossHudLayoutApplied = false;
        this.scene.stop('UIScene');
        this.scene.start('HubScene');
    }

    _deathSequence() {
        this.deathText = this.add.text(512, 384, '死亡', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5).setScrollFactor(0);
        this.time.delayedCall(2000, () => {
            this.scene.stop('UIScene');
            this.scene.start('HubScene');
        });
    }
}

const DIALOG_PORTRAIT_CATALOG = {
    系统: { texture: 'npc_wizard', scale: 2, tint: 0xD9E6FF },
    黑市商人: { texture: 'npc_rogue', scale: 2, tint: 0xE8D0A0 },
    铁匠: { texture: 'npc_knight', scale: 2, tint: 0xC5CFDF },
    先知: { texture: 'npc_wizard', scale: 2, tint: 0xC6B5FF },
    Pride: { texture: 'enemy_orc_warrior', scale: 2, tint: 0xE4BA63 },
    Envy: { texture: 'enemy_skeleton_rogue', scale: 2, tint: 0x9BE5B7 },
    Wrath: { texture: 'enemy_orc_base', scale: 2, tint: 0xFF8D8D },
    Sloth: { texture: 'enemy_skeleton_base', scale: 2, tint: 0xC2B9F6 },
    Greed: { texture: 'enemy_orc_shaman', scale: 2, tint: 0xF3DA8A },
    Gluttony: { texture: 'enemy_orc_rogue', scale: 2, tint: 0xD9A5A5 },
    Lust: { texture: 'enemy_skeleton_mage', scale: 2, tint: 0xE4A7F1 },
    原罪: { texture: 'enemy_orc_base', scale: 2, tint: 0xFFFFFF }
};

function getPortraitConfigBySpeaker(speaker) {
    if (!speaker || typeof speaker !== 'string') return null;
    if (DIALOG_PORTRAIT_CATALOG[speaker]) return DIALOG_PORTRAIT_CATALOG[speaker];
    const lower = speaker.toLowerCase();
    if (lower.includes('merchant')) return DIALOG_PORTRAIT_CATALOG['黑市商人'];
    if (lower.includes('smith')) return DIALOG_PORTRAIT_CATALOG['铁匠'];
    if (lower.includes('sage')) return DIALOG_PORTRAIT_CATALOG['先知'];
    if (lower.includes('system')) return DIALOG_PORTRAIT_CATALOG['系统'];
    return null;
}

/**
 * DialogScene - Overlay dialog with typewriter effect and portrait display
 */
class DialogScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DialogScene' });
    }

    create(data) {
        this.dialogData = data.dialog || [];
        this.onComplete = data.onComplete || null;
        this.currentIndex = 0;
        this.isTyping = false;
        this.fullText = '';
        this.displayedText = '';
        this.charIndex = 0;
        this.typeTimer = null;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Semi-transparent black overlay (depth 1000)
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.6);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        // Dialog box: bottom 1/3 (y=500 to y=768)
        const boxY = 500;
        const boxH = height - boxY;
        const box = this.add.graphics();
        box.fillStyle(0x1a1a2e, 0.95);
        box.fillRect(0, boxY, width, boxH);
        box.lineStyle(2, 0x4a4a6a, 1);
        box.lineBetween(0, boxY, width, boxY);
        box.setScrollFactor(0);
        box.setDepth(1001);

        // Portrait placeholder (80x80, left side)
        const portraitX = 80;
        const portraitY = boxY + boxH / 2;
        this._portraitBox = { x: 40, y: portraitY - 40, w: 80, h: 80 };
        this.portraitFrame = this.add.graphics();
        this.portraitFrame.fillStyle(0x0f1320, 1);
        this.portraitFrame.fillRoundedRect(this._portraitBox.x - 3, this._portraitBox.y - 3, this._portraitBox.w + 6, this._portraitBox.h + 6, 4);
        this.portraitFrame.lineStyle(1, 0x8ea2c6, 1);
        this.portraitFrame.strokeRoundedRect(this._portraitBox.x - 3, this._portraitBox.y - 3, this._portraitBox.w + 6, this._portraitBox.h + 6, 4);
        this.portraitFrame.setScrollFactor(0);
        this.portraitFrame.setDepth(1002);
        this.portraitRect = this.add.graphics();
        this.portraitRect.setScrollFactor(0);
        this.portraitRect.setDepth(1002);
        this.portraitSprite = this.add.sprite(portraitX, portraitY, '__DEFAULT');
        this.portraitSprite.setScrollFactor(0);
        this.portraitSprite.setDepth(1003);
        this.portraitSprite.setVisible(false);

        // Speaker name (yellow/gold, 16px)
        this.speakerText = this.add.text(180, boxY + 24, '', {
            fontSize: '16px',
            fill: '#FFD700'
        }).setScrollFactor(0).setDepth(1002);

        // Dialog text area (white, 18px, max width ~700px)
        this.dialogText = this.add.text(180, boxY + 52, '', {
            fontSize: '18px',
            fill: '#ffffff',
            wordWrap: { width: 700 }
        }).setScrollFactor(0).setDepth(1002);

        // Input handlers
        this.input.on('pointerdown', () => this.advance());
        this.input.keyboard.on('keydown', () => this.advance());

        if (this.dialogData.length > 0) {
            this.showEntry(0);
        } else {
            this._finish();
        }
    }

    _portraitColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return (hash & 0xFFFFFF) | 0x404040;
    }

    _renderFallbackPortrait(speaker) {
        const color = this._portraitColor(speaker || '?');
        this.portraitSprite.setVisible(false);
        this.portraitRect.clear();
        this.portraitRect.fillStyle(color, 1);
        this.portraitRect.fillRect(this._portraitBox.x, this._portraitBox.y, this._portraitBox.w, this._portraitBox.h);
    }

    _setPortrait(speaker) {
        const portraitCfg = getPortraitConfigBySpeaker(speaker);
        if (!portraitCfg || !this.textures.exists(portraitCfg.texture)) {
            this._renderFallbackPortrait(speaker);
            return;
        }

        this.portraitRect.clear();
        this.portraitRect.fillStyle(0x1b2233, 1);
        this.portraitRect.fillRect(this._portraitBox.x, this._portraitBox.y, this._portraitBox.w, this._portraitBox.h);
        this.portraitSprite.setTexture(portraitCfg.texture);
        this.portraitSprite.setScale(portraitCfg.scale || 2);
        this.portraitSprite.setTint(portraitCfg.tint != null ? portraitCfg.tint : 0xFFFFFF);
        this.portraitSprite.setVisible(true);
    }

    showEntry(index) {
        if (index >= this.dialogData.length) {
            this._finish();
            return;
        }

        const entry = this.dialogData[index];
        const speaker = entry.speaker || '';
        this.fullText = entry.text || '';
        this.displayedText = '';
        this.charIndex = 0;
        this.isTyping = true;

        this._setPortrait(speaker);

        this.speakerText.setText(speaker);
        this.dialogText.setText('');

        if (this.fullText.length === 0) {
            this.isTyping = false;
            return;
        }

        this.typeTimer = this.time.addEvent({
            delay: 30,
            callback: () => {
                if (this.charIndex < this.fullText.length) {
                    this.displayedText += this.fullText[this.charIndex];
                    this.dialogText.setText(this.displayedText);
                    this.charIndex++;
                } else {
                    this.typeTimer.destroy();
                    this.typeTimer = null;
                    this.isTyping = false;
                }
            },
            repeat: this.fullText.length
        });
    }

    advance() {
        if (this.isTyping) {
            if (this.typeTimer) {
                this.typeTimer.destroy();
                this.typeTimer = null;
            }
            this.displayedText = this.fullText;
            this.dialogText.setText(this.displayedText);
            this.isTyping = false;
        } else {
            this.currentIndex++;
            if (this.currentIndex >= this.dialogData.length) {
                this._finish();
            } else {
                this.showEntry(this.currentIndex);
            }
        }
    }

    _finish() {
        if (this.onComplete) this.onComplete();
    }
}

/**
 * InventoryScene - Overlay inventory with tabs (Tab/Esc to close)
 */
class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(0);

        this.add.text(width / 2, 40, '背包', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        const tabLabels = ['武器', '消耗品', '材料', '关键道具'];
        const tabY = 85;
        const tabW = 120;
        this.tabs = [];
        for (let i = 0; i < 4; i++) {
            const x = width / 2 - 2 * tabW - 30 + i * (tabW + 20);
            const tab = this.add.text(x, tabY, tabLabels[i], {
                fontSize: '18px',
                fill: i === 0 ? '#FFD700' : '#aaaaaa'
            }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(1);
            tab.tabIndex = i;
            tab.on('pointerover', () => tab.setStyle({ fill: '#ffffff' }));
            tab.on('pointerout', () => tab.setStyle({ fill: this.activeTab === i ? '#FFD700' : '#aaaaaa' }));
            tab.on('pointerdown', () => this._switchTab(i));
            this.tabs.push(tab);
        }
        this.activeTab = 0;

        this.gridContainer = this.add.container(0, 0);
        this.gridContainer.setScrollFactor(0).setDepth(1);

        this.goldText = this.add.text(width / 2, height - 40, '金币: 0', {
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        this.autoAssignMessageText = this.add.text(width / 2, height - 76, '', {
            fontSize: '18px',
            fill: '#7dffb3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1).setVisible(false);
        this._quickSlotNoticeMeasureText = this.add.text(-1000, -1000, '', {
            fontSize: '18px',
            fill: '#7dffb3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(0).setVisible(false);
        this._autoAssignMessageTimer = null;

        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);

        this.input.keyboard.on('keydown-TAB', () => this._close());
        this.input.keyboard.on('keydown-ESC', () => this._close());

        this._buildGrid();
    }

    _switchTab(index) {
        this.activeTab = index;
        this.tabs.forEach((t, i) => t.setStyle({ fill: i === index ? '#FFD700' : '#aaaaaa' }));
        this._buildGrid();
    }

    _buildGrid() {
        this.gridContainer.removeAll(true);
        const width = this.cameras.main.width;
        const startY = 130;
        const cellW = 100;
        const cellH = 70;
        const cols = 6;
        const gap = 8;

        if (this.activeTab === 0) {
            const weapons = GameState.unlockedWeapons || [];
            weapons.forEach((key, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = width / 2 - (cols * (cellW + gap) - gap) / 2 + col * (cellW + gap) + cellW / 2 + gap / 2;
                const y = startY + row * (cellH + gap) + cellH / 2 + gap / 2;
                const w = WEAPONS[key];
                const level = (GameState.weaponLevels || {})[key] || 1;
                const label = w ? w.name + ' Lv.' + level : key;
                const box = this.add.graphics();
                box.fillStyle(0x4a4a6a, 1);
                box.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 4);
                box.setPosition(x, y);
                const txt = this.add.text(x, y, label, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
                this.gridContainer.add([box, txt]);
            });
        } else if (this.activeTab === 1) {
            const items = Object.entries(GameState.inventory || {}).filter(([k]) => ITEMS[k] && ITEMS[k].type === 'consumable');
            items.forEach(([key, count], i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = width / 2 - (cols * (cellW + gap) - gap) / 2 + col * (cellW + gap) + cellW / 2 + gap / 2;
                const y = startY + row * (cellH + gap) + cellH / 2 + gap / 2;
                const item = ITEMS[key];
                const box = this.add.graphics();
                box.fillStyle(0x2d5a27, 1);
                box.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 4);
                box.setPosition(x, y);
                const txt = this.add.text(x, y - 8, item.name, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
                const cnt = this.add.text(x, y + 12, 'x' + count, { fontSize: '12px', fill: '#aaaaaa' }).setOrigin(0.5);
                const zone = this.add.zone(x, y, cellW, cellH).setInteractive();
                zone.itemKey = key;
                zone.itemDesc = item.description || '';
                zone.on('pointerover', () => this._showTooltip(zone.itemDesc, x, y + cellH / 2 + 10));
                zone.on('pointerout', () => this._hideTooltip());
                zone.on('pointerdown', () => {
                    const didOverwrite = !GameState.quickSlots.some(slotKey => !slotKey);
                    const slot = getQuickSlotAutoAssignIndex(GameState.quickSlots);
                    const replacedItemKey = didOverwrite ? GameState.quickSlots[slot] : null;
                    const assignedItemName = item && item.name;
                    const replacedItemName = replacedItemKey && ITEMS[replacedItemKey]
                        ? ITEMS[replacedItemKey].name
                        : '';
                    GameState.quickSlots[slot] = key;
                    this._showAutoAssignMessage(buildQuickSlotAutoAssignNotice(slot, {
                        didOverwrite,
                        assignedItemKey: key,
                        assignedItemName,
                        replacedItemKey,
                        replacedItemName,
                        measureLabelWidth: label => this._measureQuickSlotNoticeLabel(label)
                    }));
                    this._buildGrid();
                });
                this.gridContainer.add([box, txt, cnt, zone]);
            });
        } else if (this.activeTab === 2) {
            const items = Object.entries(GameState.inventory || {}).filter(([k]) => ITEMS[k] && ITEMS[k].type === 'material');
            items.forEach(([key, count], i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = width / 2 - (cols * (cellW + gap) - gap) / 2 + col * (cellW + gap) + cellW / 2 + gap / 2;
                const y = startY + row * (cellH + gap) + cellH / 2 + gap / 2;
                const item = ITEMS[key];
                const box = this.add.graphics();
                box.fillStyle(0x5a3d2d, 1);
                box.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 4);
                box.setPosition(x, y);
                const txt = this.add.text(x, y - 8, item.name, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
                const cnt = this.add.text(x, y + 12, 'x' + count, { fontSize: '12px', fill: '#aaaaaa' }).setOrigin(0.5);
                const zone = this.add.zone(x, y, cellW, cellH).setInteractive();
                zone.itemDesc = item.description || '';
                zone.on('pointerover', () => this._showTooltip(zone.itemDesc, x, y + cellH / 2 + 10));
                zone.on('pointerout', () => this._hideTooltip());
                this.gridContainer.add([box, txt, cnt, zone]);
            });
        } else {
            const seals = GameState.sinSeals || [];
            seals.forEach((key, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = width / 2 - (cols * (cellW + gap) - gap) / 2 + col * (cellW + gap) + cellW / 2 + gap / 2;
                const y = startY + row * (cellH + gap) + cellH / 2 + gap / 2;
                const boss = BOSSES[key];
                const label = boss ? boss.sin + '之印记' : key + '之印记';
                const box = this.add.graphics();
                box.fillStyle(0x4a2d5a, 1);
                box.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 4);
                box.setPosition(x, y);
                const txt = this.add.text(x, y, label, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
                this.gridContainer.add([box, txt]);
            });
        }

        this.goldText.setText('金币: ' + (GameState.gold || 0));
    }

    _close() {
        this.scene.stop('InventoryScene');
    }

    _showAutoAssignMessage(text) {
        this.autoAssignMessageText.setText(text);
        this.autoAssignMessageText.setVisible(true);
        if (this._autoAssignMessageTimer) {
            this._autoAssignMessageTimer.remove(false);
        }
        this._autoAssignMessageTimer = this.time.delayedCall(1400, () => {
            this.autoAssignMessageText.setVisible(false);
            this._autoAssignMessageTimer = null;
        });
    }

    _showTooltip(text, anchorX, anchorY) {
        if (!this.tooltip) return;
        this.tooltip.setText(text);
        if (!text) {
            this.tooltip.setVisible(false);
            return;
        }
        const tooltipX = getInventoryTooltipClampX(anchorX, this.tooltip.width, this.cameras.main.width);
        this.tooltip.setPosition(tooltipX, anchorY);
        this.tooltip.setVisible(true);
    }

    _hideTooltip() {
        if (this.tooltip) this.tooltip.setVisible(false);
    }

    _measureQuickSlotNoticeLabel(label) {
        if (!this._quickSlotNoticeMeasureText) return 0;
        this._quickSlotNoticeMeasureText.setText(label);
        return this._quickSlotNoticeMeasureText.width;
    }
}

/**
 * ShopScene - Merchant overlay for buying consumables
 */
class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(0);

        const npc = HUB_NPCS.merchant;
        this.add.text(width / 2, 50, '商店 - ' + npc.name, {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        this.goldText = this.add.text(width / 2, 90, '金币: ' + GameState.gold, {
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        const buyableItems = Object.entries(ITEMS)
            .filter(([, v]) => v.price != null && (v.type === 'consumable' || v.type === 'material'))
            .sort((a, b) => {
                if (a[1].type === b[1].type) return a[1].price - b[1].price;
                return a[1].type === 'consumable' ? -1 : 1;
            });
        let y = 150;
        buyableItems.forEach(([key, item]) => {
            const count = GameState.inventory[key] || 0;
            const typeTag = item.type === 'material' ? '[材料]' : '[消耗品]';
            const row = this.add.text(width / 2 - 200, y, `${typeTag} ${item.name} — ${item.price}金币  拥有: ${count}`, {
                fontSize: '18px',
                fill: '#ffffff'
            }).setScrollFactor(0).setDepth(1);

            const buyBtn = this.add.text(width / 2 + 120, y, '[购买]', {
                fontSize: '16px',
                fill: '#4a90d9'
            }).setOrigin(0, 0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(1);
            buyBtn.itemKey = key;
            buyBtn.rowY = y;
            buyBtn.on('pointerover', () => buyBtn.setStyle({ fill: '#6ab0ff' }));
            buyBtn.on('pointerout', () => buyBtn.setStyle({ fill: '#4a90d9' }));
            buyBtn.on('pointerdown', () => this._tryBuy(key, item, row, buyBtn));
            y += 45;
        });

        this.flashText = this.add.text(width / 2, height - 80, '', {
            fontSize: '20px',
            fill: '#ff4444'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1).setVisible(false);

        this.input.keyboard.on('keydown-ESC', () => this._close());
        this.input.keyboard.on('keydown-F', () => this._close());
    }

    _tryBuy(itemKey, item, rowText, buyBtn) {
        if (GameState.gold < item.price) {
            AudioSystem.playUi('error');
            this.flashText.setText('金币不足!');
            this.flashText.setVisible(true);
            this.time.delayedCall(1500, () => this.flashText.setVisible(false));
            return;
        }
        AudioSystem.playUi('ui');
        GameState.spendGold(item.price);
        GameState.addItem(itemKey);
        this.goldText.setText('金币: ' + GameState.gold);
        const count = GameState.inventory[itemKey] || 0;
        const typeTag = item.type === 'material' ? '[材料]' : '[消耗品]';
        rowText.setText(`${typeTag} ${item.name} — ${item.price}金币  拥有: ${count}`);
    }

    _close() {
        this.scene.stop('ShopScene');
    }
}

/**
 * BlacksmithScene - Blacksmith overlay for weapon upgrades
 */
class BlacksmithScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BlacksmithScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.sceneWidth = width;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(0);

        const npc = HUB_NPCS.blacksmith;
        this.add.text(width / 2, 50, '铁匠铺 - ' + npc.name, {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        this.goldText = this.add.text(width / 2, 90, '金币: ' + GameState.gold, {
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1);

        const weaponKeys = Object.keys(WEAPONS);
        this.weaponRows = [];
        let y = 150;
        weaponKeys.forEach((key, i) => {
            const weapon = WEAPONS[key];
            const unlocked = GameState.unlockedWeapons.includes(key);
            const level = (GameState.weaponLevels || {})[key] || 1;

            const displayName = unlocked ? weapon.name + ' Lv.' + level : '???';
            const rowText = this.add.text(width / 2 - 250, y, displayName, {
                fontSize: '18px',
                fill: unlocked ? '#ffffff' : '#666666'
            }).setScrollFactor(0).setDepth(1);

            let upgradeBtn = null;
            if (unlocked && level < 3) {
                const config = this._buildUpgradeConfig(key, level);
                if (config) {
                    upgradeBtn = this._createUpgradeButton(key, rowText, y, config);
                }
            }
            this.weaponRows.push({ key, rowText, upgradeBtn });
            y += 45;
        });

        y += 12;
        this.add.text(width / 2 - 250, y, '实用药剂制作', {
            fontSize: '18px',
            fill: '#ffd27a',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(1);
        y += 34;
        this.craftRows = [];
        Object.keys(CRAFTING_RECIPES).forEach((recipeKey) => {
            const rowText = this.add.text(width / 2 - 250, y, this._buildCraftLabel(recipeKey), {
                fontSize: '16px',
                fill: '#ffffff'
            }).setScrollFactor(0).setDepth(1);
            const craftBtn = this._createCraftButton(recipeKey, rowText, y);
            this.craftRows.push({ recipeKey, rowText, craftBtn });
            y += 40;
        });

        this.messageText = this.add.text(width / 2, height - 80, '', {
            fontSize: '18px',
            fill: '#44ff44'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1).setVisible(false);

        this.input.keyboard.on('keydown-ESC', () => this._close());
        this.input.keyboard.on('keydown-F', () => this._close());
    }

    _buildUpgradeConfig(weaponKey, level) {
        const cost = getUpgradeCostForLevel(level);
        const requiredMaterialKey = getRequiredMaterialForWeapon(weaponKey);
        if (!cost || !requiredMaterialKey) return null;
        const requiredMaterialName = ITEMS[requiredMaterialKey] ? ITEMS[requiredMaterialKey].name : requiredMaterialKey;
        return {
            cost,
            requiredMaterialKey,
            requiredMaterialName,
            label: '[强化] ' + cost.gold + '金+' + cost.essence + requiredMaterialName
        };
    }

    _createUpgradeButton(weaponKey, rowText, y, config) {
        const upgradeBtn = this.add.text(this.sceneWidth / 2 + 80, y, config.label, {
            fontSize: '14px',
            fill: '#4a90d9'
        }).setOrigin(0, 0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(1);
        upgradeBtn.weaponKey = weaponKey;
        upgradeBtn.cost = config.cost;
        upgradeBtn.requiredMaterialKey = config.requiredMaterialKey;
        upgradeBtn.requiredMaterialName = config.requiredMaterialName;
        upgradeBtn.rowText = rowText;
        upgradeBtn.on('pointerover', () => upgradeBtn.setStyle({ fill: '#6ab0ff' }));
        upgradeBtn.on('pointerout', () => upgradeBtn.setStyle({ fill: '#4a90d9' }));
        upgradeBtn.on('pointerdown', () => this._tryUpgrade(upgradeBtn));
        return upgradeBtn;
    }

    _buildCraftLabel(recipeKey) {
        const recipe = CRAFTING_RECIPES[recipeKey];
        if (!recipe) return recipeKey;
        const item = ITEMS[recipe.itemKey];
        const itemName = item ? item.name : recipe.itemKey;
        const owned = GameState.inventory[recipe.itemKey] || 0;
        const matText = Object.entries(recipe.materials || {})
            .map(([key, count]) => {
                const matName = ITEMS[key] ? ITEMS[key].name : key;
                return count + matName;
            })
            .join(' + ');
        return `${itemName} — ${recipe.gold}金 + ${matText}  拥有:${owned}`;
    }

    _createCraftButton(recipeKey, rowText, y) {
        const craftBtn = this.add.text(this.sceneWidth / 2 + 180, y, '[制作]', {
            fontSize: '14px',
            fill: '#4a90d9'
        }).setOrigin(0, 0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(1);
        craftBtn.recipeKey = recipeKey;
        craftBtn.rowText = rowText;
        craftBtn.on('pointerover', () => craftBtn.setStyle({ fill: '#6ab0ff' }));
        craftBtn.on('pointerout', () => craftBtn.setStyle({ fill: '#4a90d9' }));
        craftBtn.on('pointerdown', () => this._tryCraft(craftBtn));
        return craftBtn;
    }

    _refreshCraftRows() {
        if (!Array.isArray(this.craftRows)) return;
        this.craftRows.forEach((row) => {
            if (!row || !row.rowText || !row.rowText.active) return;
            row.rowText.setText(this._buildCraftLabel(row.recipeKey));
        });
    }

    _tryUpgrade(btn) {
        const { weaponKey, rowText } = btn;
        const check = canUpgradeWeapon(GameState, weaponKey);
        if (!check.ok && check.reason === 'gold') {
            AudioSystem.playUi('error');
            this._showMessage('金币不足!', '#ff4444');
            return;
        }
        if (!check.ok && check.reason === 'material') {
            AudioSystem.playUi('error');
            const materialName = ITEMS[check.requiredMaterialKey]
                ? ITEMS[check.requiredMaterialKey].name
                : check.requiredMaterialKey;
            this._showMessage('材料不足! 需要' + check.cost.essence + '个' + materialName, '#ff4444');
            return;
        }
        if (!check.ok) {
            AudioSystem.playUi('error');
            const reason = check.reason === 'max_level' ? '该武器已达最高等级' : '该武器缺少强化材料绑定';
            this._showMessage(reason, '#ff4444');
            return;
        }
        const applied = applyWeaponUpgrade(GameState, weaponKey);
        if (!applied.ok || !applied.nextState) {
            AudioSystem.playUi('error');
            this._showMessage('强化失败，请重试', '#ff4444');
            return;
        }

        AudioSystem.playUi('ui');
        GameState.gold = applied.nextState.gold;
        GameState.inventory = applied.nextState.inventory;
        GameState.weaponLevels = applied.nextState.weaponLevels;
        this.goldText.setText('金币: ' + GameState.gold);
        this._refreshCraftRows();
        const level = GameState.weaponLevels[weaponKey];
        rowText.setText(WEAPONS[weaponKey].name + ' Lv.' + level);
        btn.destroy();
        if (level < 3) {
            const newConfig = this._buildUpgradeConfig(weaponKey, level);
            if (newConfig) this._createUpgradeButton(weaponKey, rowText, btn.y, newConfig);
        }
        const materialName = ITEMS[applied.requiredMaterialKey]
            ? ITEMS[applied.requiredMaterialKey].name
            : applied.requiredMaterialKey;
        this._showMessage('强化成功! 消耗' + applied.cost.essence + '个' + materialName, '#44ff44');
    }

    _tryCraft(btn) {
        const recipeKey = btn.recipeKey;
        const check = canCraftRecipe(GameState, recipeKey);
        if (!check.ok && check.reason === 'gold') {
            AudioSystem.playUi('error');
            this._showMessage('金币不足!', '#ff4444');
            return;
        }
        if (!check.ok && check.reason === 'material') {
            AudioSystem.playUi('error');
            const materialName = ITEMS[check.missingItemKey] ? ITEMS[check.missingItemKey].name : check.missingItemKey;
            this._showMessage('材料不足: ' + materialName, '#ff4444');
            return;
        }
        if (!check.ok) {
            AudioSystem.playUi('error');
            this._showMessage('配方不可用', '#ff4444');
            return;
        }

        const crafted = applyCraftRecipe(GameState, recipeKey);
        if (!crafted.ok || !crafted.nextState) {
            AudioSystem.playUi('error');
            this._showMessage('制作失败，请重试', '#ff4444');
            return;
        }

        AudioSystem.playUi('ui');
        GameState.gold = crafted.nextState.gold;
        GameState.inventory = crafted.nextState.inventory;
        this.goldText.setText('金币: ' + GameState.gold);
        this._refreshCraftRows();
        const itemName = ITEMS[crafted.producedItemKey] ? ITEMS[crafted.producedItemKey].name : crafted.producedItemKey;
        this._showMessage('制作成功: ' + itemName + ' x' + crafted.producedCount, '#44ff44');
    }

    _showMessage(text, color) {
        this.messageText.setText(text);
        this.messageText.setStyle({ fill: color });
        this.messageText.setVisible(true);
        this.time.delayedCall(1500, () => this.messageText.setVisible(false));
    }

    _close() {
        this.scene.stop('BlacksmithScene');
    }
}

/**
 * UIScene - HUD overlay running in parallel with game scenes
 */
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this._hudSidebarMeasureNodes = {};
        this._hudSidebarTextWidthCache = new Map();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this._hudWidth = width;
        this._hudHeight = height;
        this._bossLayoutEnabled = false;
        this._hudLayout = this._buildHudLayout(false);
        const pad = this._hudLayout.pad;
        const bottomPad = this._hudLayout.bottomPad;
        const hpBarY = this._hudLayout.hpBarY;

        // Top-left: HP bar
        this.hpLabel = this.add.text(pad, hpBarY, 'HP', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(0);
        this.hpBarBg = this.add.graphics();
        this.hpBarBg.setScrollFactor(0);
        this.hpBarFill = this.add.graphics();
        this.hpBarFill.setScrollFactor(0);
        this.hpText = this.add.text(pad + 28 + 200 + 8, hpBarY + 4, '0/0', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setScrollFactor(0);

        // Stamina bar below HP
        const stY = this._hudLayout.staminaBarY;
        this.stLabel = this.add.text(pad, stY, 'ST', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setScrollFactor(0);
        this.staminaBarBg = this.add.graphics();
        this.staminaBarBg.setScrollFactor(0);
        this.staminaBarFill = this.add.graphics();
        this.staminaBarFill.setScrollFactor(0);
        this.staminaText = this.add.text(pad + 28 + 200 + 8, stY + 2, '0/0', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setScrollFactor(0);

        // Bottom-left: weapon display
        this.aimText = this.add.text(bottomPad, height - 80, '当前瞄准: 右 [IJKL]', {
            fontSize: '14px',
            fill: '#8fdcff'
        }).setScrollFactor(0);
        this.weaponText = this.add.text(bottomPad, height - 58, '⚔ - [Q/E 切换]', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setScrollFactor(0);
        this.actionText = {
            attack: this.add.text(bottomPad, height - 36, '普攻 U: 就绪', {
                fontSize: '13px',
                fill: '#cfd8e6'
            }).setScrollFactor(0),
            special: this.add.text(bottomPad, height - 36, '特攻 O: 就绪', {
                fontSize: '13px',
                fill: '#cfd8e6'
            }).setScrollFactor(0),
            dodge: this.add.text(bottomPad, height - 36, '闪避 Space: 就绪', {
                fontSize: '13px',
                fill: '#cfd8e6'
            }).setScrollFactor(0)
        };
        this.actionTextReadyFlashUntil = {
            attack: 0,
            special: 0,
            dodge: 0
        };
        this._lastCombatActionReadiness = null;
        this.savedWeaponDebugText = this.add.text(bottomPad, height - 102, '', {
            fontSize: '12px',
            fill: '#66ccff'
        }).setScrollFactor(0).setVisible(UI_DEBUG_FLAGS.showSavedWeaponInHUD);

        // Debug HUD toggle: F8
        this.input.keyboard.on('keydown-F8', () => {
            UI_DEBUG_FLAGS.showSavedWeaponInHUD = !UI_DEBUG_FLAGS.showSavedWeaponInHUD;
            this.savedWeaponDebugText.setVisible(UI_DEBUG_FLAGS.showSavedWeaponInHUD);
        });

        // Bottom-right: 4 quick slot boxes (40×40)
        const slotSize = 40;
        const slotGap = 4;
        const quickSlotPad = this._hudLayout.bottomPad;
        const slotsStartX = width - quickSlotPad - (4 * slotSize + 3 * slotGap);
        const slotsY = height - quickSlotPad - slotSize;
        this.quickSlots = [];
        for (let i = 0; i < 4; i++) {
            const x = slotsStartX + i * (slotSize + slotGap);
            const box = this.add.graphics();
            box.fillStyle(0x333333, 1);
            box.fillRect(x, slotsY, slotSize, slotSize);
            box.setScrollFactor(0);
            const numLabel = this.add.text(x + slotSize / 2, slotsY - 8, String(i + 1), {
                fontSize: '12px',
                fill: '#aaaaaa'
            }).setOrigin(0.5).setScrollFactor(0);
            const itemText = this.add.text(x + slotSize / 2, slotsY + slotSize / 2, '-', {
                fontSize: '11px',
                fill: '#888888'
            }).setOrigin(0.5).setScrollFactor(0);
            this.quickSlots.push({ box, numLabel, itemText });
        }

        // Top-right: area name
        this.areaNameText = this.add.text(width - pad, this._hudLayout.sidePanelStartY, '', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0);

        this.runModifierTitle = this.add.text(width - pad, this._hudLayout.sidePanelStartY + 26, '本局词缀', {
            fontSize: '12px',
            fill: '#ffd27a'
        }).setOrigin(1, 0).setScrollFactor(0);
        this.runModifierBadgeText = this.add.text(width - pad, this._hudLayout.sidePanelStartY + 26, '', {
            fontSize: '10px',
            fill: '#b7c2d9'
        }).setOrigin(1, 0).setScrollFactor(0).setAlpha(0.72).setVisible(false);
        this.runModifierText = this.add.text(width - pad, this._hudLayout.sidePanelStartY + 42, '', {
            fontSize: '11px',
            fill: '#d7e6ff',
            align: 'right',
            lineSpacing: 2
        }).setOrigin(1, 0).setScrollFactor(0);

        this.challengeText = this.add.text(width - pad, this._hudLayout.sidePanelStartY + 98, '', {
            fontSize: '11px',
            fill: '#7CFFB2',
            align: 'right',
            lineSpacing: 2
        }).setOrigin(1, 0).setScrollFactor(0);

        this.eventRoomText = this.add.text(width - pad, this._hudLayout.sidePanelStartY + 150, '', {
            fontSize: '11px',
            fill: '#ffd27a',
            align: 'right',
            lineSpacing: 2,
            wordWrap: { width: 320, useAdvancedWrap: true }
        }).setOrigin(1, 0).setScrollFactor(0);

        this.debuffStatusText = this.add.text(width / 2, height - 128, '', {
            fontSize: '14px',
            fill: '#ffb0a8',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);

        this.buffStatusText = this.add.text(width / 2, height - 104, '', {
            fontSize: '14px',
            fill: '#b8ffd5',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);

        this.lowHpWarningText = this.add.text(width / 2, 58, '⚠ 生命值过低', {
            fontSize: '22px',
            fill: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

        this.lowStaminaWarningText = this.add.text(width / 2, 86, '⚠ 体力不足', {
            fontSize: '18px',
            fill: '#ffd27a',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

        this._applyHudLayout();
    }

    _buildHudLayout(isBossLayout) {
        const width = this._hudWidth || this.cameras.main.width;
        return buildPlayerHudLayout({
            width,
            isBossLayout
        });
    }

    _applyHudLayout() {
        const layout = this._hudLayout || this._buildHudLayout(false);
        const pad = layout.pad;
        this.hpLabel.setPosition(pad, layout.hpBarY);
        this.hpText.setPosition(pad + 28 + 200 + 8, layout.hpBarY + 4);
        this.stLabel.setPosition(pad, layout.staminaBarY);
        this.staminaText.setPosition(pad + 28 + 200 + 8, layout.staminaBarY + 2);
        const showSidePanel = !!layout.showSidePanel;
        const sidebarLayout = this._layoutHudSidebarBlocks();
        this._applyHudSidebarVisibility(showSidePanel, sidebarLayout);
        this.hpBarBg.clear();
        this.hpBarBg.fillStyle(0x8B0000, 1);
        this.hpBarBg.fillRect(pad + 28, layout.hpBarY, 200, 20);
        this.staminaBarBg.clear();
        this.staminaBarBg.fillStyle(0x8B8B00, 1);
        this.staminaBarBg.fillRect(pad + 28, layout.staminaBarY, 200, 14);
    }

    _getHudSidebarMeasureNode(styleKey) {
        if (!this._hudSidebarMeasureNodes) {
            this._hudSidebarMeasureNodes = {};
        }
        const cached = this._hudSidebarMeasureNodes[styleKey];
        if (cached && !cached.active) {
            this._hudSidebarMeasureNodes[styleKey] = null;
        }
        if (!this._hudSidebarMeasureNodes[styleKey]) {
            let style = {
                fontSize: '11px',
                fill: '#d7e6ff',
                align: 'right',
                lineSpacing: 2
            };
            if (styleKey === 'runModifierSidebar') {
                style = {
                    fontSize: '11px',
                    fill: '#d7e6ff',
                    align: 'right',
                    lineSpacing: 2
                };
            } else if (styleKey === 'sidebarSectionTitle') {
                style = {
                    fontSize: '12px',
                    fill: '#ffd27a'
                };
            } else if (styleKey === 'sidebarChallengeBadge') {
                style = {
                    fontSize: '10px',
                    fill: '#b7c2d9'
                };
            } else if (styleKey === 'challengeSidebar') {
                style = {
                    fontSize: '11px',
                    fill: '#7CFFB2',
                    align: 'right',
                    lineSpacing: 2
                };
            } else if (styleKey === 'areaNameSidebar') {
                style = {
                    fontSize: '18px',
                    fill: '#ffffff'
                };
            } else if (styleKey === 'eventRoomSidebar') {
                style = {
                    fontSize: '11px',
                    fill: '#ffd27a',
                    align: 'right',
                    lineSpacing: 2
                };
            }
            this._hudSidebarMeasureNodes[styleKey] = this.add.text(-1000, -1000, '', style)
                .setVisible(false)
                .setScrollFactor(0)
                .setDepth(0);
        }
        return this._hudSidebarMeasureNodes[styleKey];
    }

    _measureHudSidebarTextWidth(text, styleKey) {
        const safeText = typeof text === 'string' ? text : '';
        if (!safeText) return 0;
        if (!this._hudSidebarTextWidthCache) {
            this._hudSidebarTextWidthCache = new Map();
        }
        const cacheKey = `${styleKey}:${safeText}`;
        if (this._hudSidebarTextWidthCache.has(cacheKey)) {
            return this._hudSidebarTextWidthCache.get(cacheKey);
        }
        const measureText = this._getHudSidebarMeasureNode(styleKey);
        measureText.setText(safeText);
        const width = measureText.width;
        this._hudSidebarTextWidthCache.set(cacheKey, width);
        return width;
    }

    _fitHudSidebarTextLine(text, maxWidth, styleKey) {
        return clampTextToWidth(text, maxWidth, {
            measureGlyphWidth: glyph => this._measureHudSidebarTextWidth(glyph, styleKey),
            measurementCache: new Map()
        });
    }

    _fitHudSidebarTextLines(lines, maxWidth, styleKey) {
        return clampTextLinesToWidth(lines, maxWidth, {
            measureGlyphWidth: glyph => this._measureHudSidebarTextWidth(glyph, styleKey),
            measurementCache: new Map()
        });
    }

    _isCompactHudSidebarViewport() {
        return this._getHudSidebarViewportTier() !== 'regular';
    }

    _getHudSidebarResponsiveMetrics() {
        const layout = this._hudLayout || this._buildHudLayout(false);
        const viewportWidth = Number.isFinite(layout.width) && layout.width > 0
            ? layout.width
            : this.cameras.main.width;
        const viewportHeight = this.cameras && this.cameras.main
            ? this.cameras.main.height
            : 0;
        const displaySize = this.scale && this.scale.displaySize ? this.scale.displaySize : null;
        return getHudSidebarResponsiveMetrics(
            displaySize && Number.isFinite(displaySize.width) ? displaySize.width : 0,
            displaySize && Number.isFinite(displaySize.height) ? displaySize.height : 0,
            viewportWidth,
            viewportHeight
        );
    }

    _getHudSidebarViewportTier() {
        return this._getHudSidebarResponsiveMetrics().viewportTier;
    }

    _getHudSidebarLineCap(sectionKey) {
        return getHudSidebarLineCap(sectionKey, this._getHudSidebarViewportTier());
    }

    _getHudSidebarOverflowPolicy() {
        return getHudSidebarOverflowPolicy(this._getHudSidebarViewportTier());
    }

    _fitHudSidebarTextBlock(lines, maxWidth, styleKey, sectionKey) {
        const lineCap = this._getHudSidebarLineCap(sectionKey);
        if (lineCap > 0) {
            return clampTextLinesToWidthAndCount(lines, maxWidth, lineCap, {
                measureGlyphWidth: glyph => this._measureHudSidebarTextWidth(glyph, styleKey),
                measurementCache: new Map()
            });
        }
        return clampTextLinesToWidth(lines, maxWidth, {
            measureGlyphWidth: glyph => this._measureHudSidebarTextWidth(glyph, styleKey),
            measurementCache: new Map()
        });
    }

    _getHudSidebarMaxWidth() {
        return this._getHudSidebarResponsiveMetrics().maxWidth;
    }

    _getRunModifierBadgeMaxWidth(maxWidth) {
        const badgeLayout = getRunModifierHeadingBadgeLayout(maxWidth, { viewportTier: this._getHudSidebarViewportTier() });
        return badgeLayout.maxWidth;
    }

    _getRunModifierBadgeGap(maxWidth) {
        const badgeLayout = getRunModifierHeadingBadgeLayout(maxWidth, { viewportTier: this._getHudSidebarViewportTier() });
        return badgeLayout.gap;
    }

    _updateRunModifierHeading(badgeAppearance) {
        const layout = this._hudLayout || this._buildHudLayout(false);
        const anchorX = layout.width - layout.pad;
        const maxWidth = this._getHudSidebarMaxWidth();
        const titleY = Number.isFinite(this.runModifierTitle.y) ? this.runModifierTitle.y : layout.sidePanelStartY;
        const safeBadgeAppearance = badgeAppearance && typeof badgeAppearance === 'object'
            ? badgeAppearance
            : { text: '', fill: '', alpha: 1 };
        const headingPresentation = getRunModifierHeadingPresentation(maxWidth, safeBadgeAppearance, {
            viewportTier: this._getHudSidebarViewportTier(),
            fitTitle: (text, titleWidth) => this._fitHudSidebarTextLine(text, titleWidth, 'sidebarSectionTitle'),
            fitBadge: (text, badgeWidth) => this._fitHudSidebarTextLine(text, badgeWidth, 'sidebarChallengeBadge'),
            measureBadgeWidth: text => this._measureHudSidebarTextWidth(text, 'sidebarChallengeBadge')
        });
        if (!headingPresentation.badgeVisible) {
            this.runModifierTitle.setPosition(anchorX, titleY);
            this.runModifierTitle.setText(headingPresentation.titleText);
            this.runModifierBadgeText.setText('');
            this.runModifierBadgeText.setStyle({ fill: '', alpha: 1 });
            this.runModifierBadgeText.setAlpha(1);
            this.runModifierBadgeText.setVisible(false);
            return;
        }

        this.runModifierBadgeText.setText(headingPresentation.badgeText);
        this.runModifierBadgeText.setStyle({ fill: headingPresentation.badgeFill, alpha: headingPresentation.badgeAlpha });
        this.runModifierBadgeText.setAlpha(headingPresentation.badgeAlpha);
        this.runModifierBadgeText.setPosition(anchorX, titleY);
        this.runModifierBadgeText.setVisible(headingPresentation.badgeVisible);
        this.runModifierTitle.setPosition(anchorX - headingPresentation.badgeWidth - headingPresentation.badgeGap, titleY);
        this.runModifierTitle.setText(headingPresentation.titleText);
    }

    _getHudSidebarMaxBottom() {
        const layout = this._hudLayout || this._buildHudLayout(false);
        const sidebarPolicy = this._getHudSidebarOverflowPolicy();
        const viewportHeight = this.cameras && this.cameras.main
            ? this.cameras.main.height
            : 0;
        return Math.max(layout.sidePanelStartY + 120, viewportHeight - layout.pad - sidebarPolicy.maxBottomInset);
    }

    _applyHudSidebarVisibility(showSidePanel, sidebarLayout) {
        const visibility = {
            areaNameText: showSidePanel && !!sidebarLayout.visibility.areaNameText,
            runModifierTitle: showSidePanel && !!sidebarLayout.visibility.runModifierTitle,
            runModifierBadgeText: showSidePanel && !!sidebarLayout.visibility.runModifierTitle && !!(this.runModifierBadgeText && this.runModifierBadgeText.text),
            runModifierText: showSidePanel && !!sidebarLayout.visibility.runModifierText,
            challengeText: showSidePanel && !!sidebarLayout.visibility.challengeText,
            eventRoomText: showSidePanel && !!sidebarLayout.visibility.eventRoomText
        };
        this.areaNameText.setVisible(visibility.areaNameText);
        this.runModifierTitle.setVisible(visibility.runModifierTitle);
        this.runModifierBadgeText.setVisible(visibility.runModifierBadgeText);
        this.runModifierText.setVisible(visibility.runModifierText);
        this.challengeText.setVisible(visibility.challengeText);
        this.eventRoomText.setVisible(visibility.eventRoomText);
    }

    _layoutHudSidebarBlocks() {
        const layout = this._hudLayout || this._buildHudLayout(false);
        const sidebarPolicy = this._getHudSidebarOverflowPolicy();
        const anchorX = layout.width - layout.pad;
        const hasAreaName = !!(this.areaNameText && this.areaNameText.text);
        const hasModifierLines = !!(this.runModifierText && this.runModifierText.text);
        const hasChallenge = !!(this.challengeText && this.challengeText.text);
        const hasEventRoom = !!(this.eventRoomText && this.eventRoomText.text);
        const sidebarLayout = buildPriorityTextStackLayout([
            {
                key: 'areaNameText',
                height: hasAreaName ? this.areaNameText.height : 0,
                gapAfter: sidebarPolicy.gaps.areaNameText,
                active: hasAreaName,
                droppable: false
            },
            {
                key: 'runModifierTitle',
                height: this.runModifierTitle.height,
                gapAfter: sidebarPolicy.gaps.runModifierTitle,
                active: true,
                droppable: false
            },
            {
                key: 'runModifierText',
                height: hasModifierLines ? this.runModifierText.height : 0,
                gapAfter: sidebarPolicy.gaps.runModifierText,
                active: hasModifierLines,
                droppable: !!sidebarPolicy.droppable.runModifierText,
                collapsePriority: sidebarPolicy.collapsePriority.runModifierText
            },
            {
                key: 'challengeText',
                height: hasChallenge ? this.challengeText.height : 0,
                gapAfter: sidebarPolicy.gaps.challengeText,
                active: hasChallenge,
                droppable: !!sidebarPolicy.droppable.challengeText,
                collapsePriority: sidebarPolicy.collapsePriority.challengeText
            },
            {
                key: 'eventRoomText',
                height: hasEventRoom ? this.eventRoomText.height : 0,
                gapAfter: sidebarPolicy.gaps.eventRoomText,
                active: hasEventRoom,
                droppable: !!sidebarPolicy.droppable.eventRoomText,
                collapsePriority: sidebarPolicy.collapsePriority.eventRoomText
            }
        ], layout.sidePanelStartY, {
            maxBottom: this._getHudSidebarMaxBottom()
        });
        this.areaNameText.setPosition(anchorX, sidebarLayout.positions.areaNameText || layout.sidePanelStartY);
        this.runModifierTitle.setPosition(anchorX, sidebarLayout.positions.runModifierTitle || layout.sidePanelStartY);
        this.runModifierText.setPosition(anchorX, sidebarLayout.positions.runModifierText || sidebarLayout.positions.runModifierTitle || layout.sidePanelStartY);
        this.challengeText.setPosition(anchorX, sidebarLayout.positions.challengeText || sidebarLayout.positions.runModifierText || sidebarLayout.positions.runModifierTitle || layout.sidePanelStartY);
        this.eventRoomText.setPosition(anchorX, sidebarLayout.positions.eventRoomText || sidebarLayout.positions.challengeText || sidebarLayout.positions.runModifierText || sidebarLayout.positions.runModifierTitle || layout.sidePanelStartY);
        return sidebarLayout;
    }

    setBossHudLayout(enabled) {
        const desired = !!enabled;
        if (this._bossLayoutEnabled === desired && this._hudLayout) return;
        this._bossLayoutEnabled = desired;
        this._hudLayout = this._buildHudLayout(desired);
        this._applyHudLayout();
    }

    updateHUD(player, areaName) {
        if (!player) return;
        const layout = this._hudLayout || this._buildHudLayout(false);
        const bottomPad = Number.isFinite(layout.bottomPad) && layout.bottomPad >= 0 ? layout.bottomPad : layout.pad;
        const hpBarX = layout.pad + 28;
        const hpBarY = layout.hpBarY;
        const stBarX = layout.pad + 28;
        const stY = layout.staminaBarY;

        for (let i = 0; i < 4; i++) {
            const slot = this.quickSlots[i];
            const itemKey = GameState.quickSlots[i];
            const itemCount = itemKey ? (GameState.inventory[itemKey] || 0) : 0;
            slot.itemText.setText(buildQuickSlotItemLabel(itemKey, itemCount));
        }

        // HP bar
        const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
        this.hpBarFill.clear();
        const hpColor = hpRatio <= UI_WARNING_THRESHOLDS.lowHpRatio ? 0xFF4D4D : (hpRatio <= 0.6 ? 0xFF8A65 : 0xE74C3C);
        this.hpBarFill.fillStyle(hpColor, 1);
        this.hpBarFill.fillRect(hpBarX, hpBarY, 200 * hpRatio, 20);
        this.hpText.setText(Math.floor(player.hp) + '/' + player.maxHp);
        this.hpText.setStyle({ fill: hpRatio <= UI_WARNING_THRESHOLDS.lowHpRatio ? '#ffb3b3' : '#ffffff' });

        if (hpRatio <= UI_WARNING_THRESHOLDS.lowHpRatio && player.hp > 0) {
            this.lowHpWarningText.setVisible(true);
            const blink = Math.floor(this.time.now / 220) % 2;
            this.lowHpWarningText.setStyle({ fill: blink === 0 ? '#ff6b6b' : '#ffd1d1' });
            this.lowHpWarningText.setText(`⚠ 生命值过低 (${Math.max(1, Math.round(hpRatio * 100))}%)`);
        } else {
            this.lowHpWarningText.setVisible(false);
        }

        // Stamina bar
        const stRatio = Math.max(0, Math.min(1, player.stamina / player.maxStamina));
        this.staminaBarFill.clear();
        const stColor = stRatio <= UI_WARNING_THRESHOLDS.lowStaminaRatio ? 0xFF9F43 : (stRatio <= 0.45 ? 0xF1C40F : 0xB9E769);
        this.staminaBarFill.fillStyle(stColor, 1);
        this.staminaBarFill.fillRect(stBarX, stY, 200 * stRatio, 14);
        this.staminaText.setText(Math.floor(player.stamina) + '/' + player.maxStamina);
        this.staminaText.setStyle({ fill: stRatio <= UI_WARNING_THRESHOLDS.lowStaminaRatio ? '#ffe0ad' : '#ffffff' });

        if (stRatio <= UI_WARNING_THRESHOLDS.lowStaminaRatio && player.hp > 0) {
            this.lowStaminaWarningText.setVisible(true);
            const blink = Math.floor(this.time.now / 240) % 2;
            this.lowStaminaWarningText.setStyle({ fill: blink === 0 ? '#ffd27a' : '#fff1c7' });
            this.lowStaminaWarningText.setText(`⚠ 体力不足 (${Math.max(1, Math.round(stRatio * 100))}%)`);
        } else {
            this.lowStaminaWarningText.setVisible(false);
        }

        // Weapon display
        const weapon = player.currentWeapon;
        const weaponName = weapon ? weapon.name : '-';
        const weaponKey = player.weapons && player.weapons[player.currentWeaponIndex]
            ? player.weapons[player.currentWeaponIndex]
            : 'sword';
        const runEffects = GameState.runEffects || DEFAULT_RUN_EFFECTS;
        const staminaRegenPerSecond = GAME_CONFIG.PLAYER.staminaRegen * (runEffects.playerStaminaRegenMultiplier || 1);
        this.aimText.setText('当前瞄准: ' + formatAimDirectionLabel(player.facingAngle) + ' [IJKL]');
        this.weaponText.setText('⚔ ' + weaponName + ' (' + weaponKey + ') [Q/E 切换]');
        const actionHudState = {
            isDodging: player.isDodging,
            dodgeLockoutMs: player.dodgeLockoutMsRemaining,
            dodgePostLockoutCooldownMs: GAME_CONFIG.PLAYER.dodgeCooldown,
            attackCooldownMs: player.attackCooldown,
            specialCooldownMs: player.specialCooldown,
            dodgeCooldownMs: player.dodgeCooldownTimer,
            stamina: player.stamina,
            staminaRegenPerSecond,
            attackStaminaCost: weapon ? weapon.staminaCost : 0,
            specialStaminaCost: weapon ? weapon.specialStaminaCost : 0,
            dodgeStaminaCost: GAME_CONFIG.PLAYER.dodgeStaminaCost
        };
        const actionHudSegments = buildCombatActionHudSegments(actionHudState);
        const actionHudReadiness = buildCombatActionReadiness(actionHudState);
        const previousActionReadiness = this._lastCombatActionReadiness;
        if (previousActionReadiness) {
            Object.keys(actionHudReadiness).forEach(key => {
                if (actionHudReadiness[key] && !previousActionReadiness[key]) {
                    this.actionTextReadyFlashUntil[key] = this.time.now + 220;
                }
            });
        }
        this._lastCombatActionReadiness = actionHudReadiness;
        actionHudSegments.forEach(segment => {
            const actionTextNode = this.actionText[segment.key];
            const actionHighlightActive = this.actionTextReadyFlashUntil[segment.key] > this.time.now;
            actionTextNode.setStyle({ fill: actionHighlightActive ? '#fff4b3' : '#cfd8e6' });
            actionTextNode.setText(segment.text);
        });
        const actionLayout = buildCombatActionHudLayout(
            actionHudSegments.map(segment => ({
                key: segment.key,
                width: this.actionText[segment.key].width
            })),
            {
                startX: bottomPad,
                maxWidth: Math.max(0, this.quickSlots[0].box.x - bottomPad - 12),
                gap: 18,
                rowGap: 22
            }
        );
        const actionClusterLift = Math.max(0, actionLayout.rowCount - 1) * 22;
        this.aimText.setPosition(bottomPad, this.cameras.main.height - 80 - actionClusterLift);
        this.weaponText.setPosition(bottomPad, this.cameras.main.height - 58 - actionClusterLift);
        this.savedWeaponDebugText.setPosition(bottomPad, this.cameras.main.height - 102 - actionClusterLift);
        actionLayout.placements.forEach(placement => {
            const actionTextNode = this.actionText[placement.key];
            actionTextNode.setPosition(placement.x, this.cameras.main.height - 36 - actionClusterLift + placement.y);
        });
        if (UI_DEBUG_FLAGS.showSavedWeaponInHUD) {
            const savedWeaponKey = GameState.ensureSelectedWeapon();
            const savedWeapon = WEAPONS[savedWeaponKey];
            this.savedWeaponDebugText.setText('[DEBUG] 保存武器: ' + (savedWeapon ? savedWeapon.name : savedWeaponKey));
        }

        // Area name
        this.areaNameText.setText(this._fitHudSidebarTextLine(areaName || '', this._getHudSidebarMaxWidth(), 'areaNameSidebar'));
        this.runModifierTitle.setText(this._fitHudSidebarTextLine('本局词缀', this._getHudSidebarMaxWidth(), 'sidebarSectionTitle'));
        this.runModifierBadgeText.setText('');
        this.runModifierBadgeText.setVisible(false);

        const modifierLines = (GameState.runModifiers || []).map((key, idx) => `${idx + 1}. ${getRunModifierLabel(key)}`);
        this.runModifierText.setText(this._fitHudSidebarTextBlock(modifierLines, this._getHudSidebarMaxWidth(), 'runModifierSidebar', 'runModifierSidebar').join('\n'));

        const challenge = GameState.getRunChallengeSummary ? GameState.getRunChallengeSummary() : null;
        if (challenge) {
            const challengeLines = buildRunChallengeSidebarLines(challenge, {
                viewportTier: this._getHudSidebarViewportTier(),
                maxLineWidth: this._getHudSidebarMaxWidth(),
                measureLabelWidth: text => this._measureHudSidebarTextWidth(text, 'challengeSidebar')
            });
            this.challengeText.setText(this._fitHudSidebarTextBlock(challengeLines, this._getHudSidebarMaxWidth(), 'challengeSidebar', 'challengeSidebar').join('\n'));
            this.challengeText.setStyle({ fill: challenge.completed ? '#9effd6' : '#7CFFB2' });
        } else {
            this.challengeText.setText('');
        }

        const eventRoom = GameState.getRunEventRoomSummary ? GameState.getRunEventRoomSummary() : null;
        if (eventRoom) {
            const lines = buildRunEventRoomHudLines(eventRoom, RUN_EVENT_ROOM_POOL);
            this.eventRoomText.setText(this._fitHudSidebarTextBlock(lines, this._getHudSidebarMaxWidth(), 'eventRoomSidebar', 'eventRoomSidebar').join('\n'));
            this.eventRoomText.setStyle({ fill: eventRoom.resolved ? '#9fa8b3' : '#ffd27a' });
        } else {
            this.eventRoomText.setText('');
        }
        const sidebarLayout = this._layoutHudSidebarBlocks();
        const badgeMaxWidth = this._getRunModifierBadgeMaxWidth(this._getHudSidebarMaxWidth());
        const challengeBadgeAppearance = challenge ? getRunChallengeSidebarBadgeAppearance(challenge, {
            viewportTier: this._getHudSidebarViewportTier(),
            hidden: !(!layout.showSidePanel || sidebarLayout.visibility.challengeText),
            runModifierHidden: !sidebarLayout.visibility.runModifierText,
            maxBadgeWidth: badgeMaxWidth,
            measureLabelWidth: text => this._measureHudSidebarTextWidth(text, 'sidebarChallengeBadge')
        }) : { text: '', fill: '', alpha: 1 };
        this._updateRunModifierHeading(challengeBadgeAppearance);
        this._applyHudSidebarVisibility(!!layout.showSidePanel, sidebarLayout);

        const statusSummary = player.getStatusHudSummary
            ? player.getStatusHudSummary()
            : { debuffs: [], buffs: [] };
        if (statusSummary.debuffs.length > 0) {
            this.debuffStatusText.setVisible(true);
            this.debuffStatusText.setText('负面: ' + statusSummary.debuffs.join('  |  '));
        } else {
            this.debuffStatusText.setVisible(false);
            this.debuffStatusText.setText('');
        }
        if (statusSummary.buffs.length > 0) {
            this.buffStatusText.setVisible(true);
            this.buffStatusText.setText('增益: ' + statusSummary.buffs.join('  |  '));
        } else {
            this.buffStatusText.setVisible(false);
            this.buffStatusText.setText('');
        }
    }
}

/**
 * PauseScene - Overlay pause menu for runtime scenes
 */
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(data) {
        this.parentScene = data.parentScene || 'HubScene';
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.72);
        overlay.setInteractive();

        this.add.rectangle(w / 2, h / 2, 620, 520, 0x111827, 0.95).setStrokeStyle(2, 0x5e81ac);
        this.add.text(w / 2, h / 2 - 190, '暂停菜单', {
            fontSize: '34px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(w / 2, h / 2 - 152, `当前场景: ${this.parentScene}`, {
            fontSize: '14px',
            fill: '#9fb3c8'
        }).setOrigin(0.5);

        this._infoVisible = false;
        this.infoText = this.add.text(w / 2, h / 2 + 76, '', {
            fontSize: '14px',
            fill: '#dfe6f0',
            align: 'left',
            wordWrap: { width: 520 }
        }).setOrigin(0.5, 0).setVisible(false);

        this.messageText = this.add.text(w / 2, h / 2 + 228, '', {
            fontSize: '16px',
            fill: '#88c0d0'
        }).setOrigin(0.5).setVisible(false);
        this._messageTimer = null;

        this._createButton(w / 2, h / 2 - 102, '继续游戏', () => this._continue());
        this._createButton(w / 2, h / 2 - 58, '背包', () => this._toggleInventory());
        this._createButton(w / 2, h / 2 - 14, '武器信息', () => this._toggleWeaponInfo());
        this.muteButton = this._createButton(w / 2, h / 2 + 30, '', () => this._toggleMute());
        this.volumeText = this.add.text(w / 2, h / 2 + 74, '', {
            fontSize: '20px',
            fill: '#d8dee9'
        }).setOrigin(0.5);
        this.volumeDownButton = this._createButton(w / 2 - 110, h / 2 + 118, '音量 -10', () => this._changeVolume(-10), '18px');
        this.volumeUpButton = this._createButton(w / 2 + 110, h / 2 + 118, '音量 +10', () => this._changeVolume(10), '18px');
        this.backToTitleButton = this._createButton(w / 2, h / 2 + 170, '返回标题', () => this._backToTitle());
        this._refreshAudioUi();

        this.input.keyboard.on('keydown-ESC', () => this._continue());
        this.input.keyboard.on('keydown-ENTER', () => this._continue());
    }

    _createButton(x, y, label, onClick, fontSize = '22px') {
        const btn = this.add.text(x, y, `[ ${label} ]`, {
            fontSize,
            fill: '#d8dee9'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setStyle({ fill: '#88c0d0' }));
        btn.on('pointerout', () => btn.setStyle({ fill: '#d8dee9' }));
        btn.on('pointerdown', () => {
            AudioSystem.playUi('ui');
            onClick();
        });
        return btn;
    }

    _continue() {
        if (this.scene.isActive('InventoryScene')) this.scene.stop('InventoryScene');
        this.scene.stop('PauseScene');
        if (this.scene.isPaused(this.parentScene)) this.scene.resume(this.parentScene);
    }

    _toggleInventory() {
        if (this.scene.isActive('InventoryScene')) this.scene.stop('InventoryScene');
        else this.scene.launch('InventoryScene');
    }

    _toggleWeaponInfo() {
        this._infoVisible = !this._infoVisible;
        this._setWeaponInfoLayout(this._infoVisible);
        this.infoText.setVisible(this._infoVisible);
        if (!this._infoVisible) return;
        const unlocked = GameState.unlockedWeapons || [];
        if (unlocked.length === 0) {
            this.infoText.setText('暂无可用武器。');
            return;
        }
        const lines = ['武器当前属性：', ''];
        unlocked.forEach(key => lines.push(formatWeaponStatsLine(key)));
        this.infoText.setText(lines.join('\n'));
    }

    _setWeaponInfoLayout(visible) {
        const showControls = !visible;
        if (this.muteButton) this.muteButton.setVisible(showControls);
        if (this.volumeText) this.volumeText.setVisible(showControls);
        if (this.volumeDownButton) this.volumeDownButton.setVisible(showControls);
        if (this.volumeUpButton) this.volumeUpButton.setVisible(showControls);
        if (this.backToTitleButton) this.backToTitleButton.setVisible(showControls);
    }

    _refreshAudioUi() {
        const settings = AudioSystem.getSettings();
        this.muteButton.setText(`[ 主静音: ${settings.muted ? '开' : '关'} ]`);
        this.volumeText.setText('主音量: ' + settings.volume + '%');
    }

    _showTransientMessage(text) {
        this.messageText.setText(text);
        this.messageText.setVisible(true);
        if (this._messageTimer) this._messageTimer.remove(false);
        this._messageTimer = this.time.delayedCall(1200, () => {
            this.messageText.setVisible(false);
            this._messageTimer = null;
        });
    }

    _toggleMute() {
        AudioSystem.toggleMuted();
        const settings = AudioSystem.getSettings();
        this._refreshAudioUi();
        this._showTransientMessage(settings.muted ? '主音频已静音' : '主音频已开启');
    }

    _changeVolume(delta) {
        const settings = AudioSystem.getSettings();
        const nextVolume = Math.max(0, Math.min(100, settings.volume + delta));
        if (nextVolume === settings.volume) return;
        AudioSystem.setVolume(nextVolume);
        this._refreshAudioUi();
        this._showTransientMessage('主音量已调整到 ' + nextVolume + '%');
    }

    _backToTitle() {
        GameState.save();
        const cleanup = ['InventoryScene', 'DialogScene', 'HelpScene', 'ShopScene', 'BlacksmithScene', 'UIScene', this.parentScene];
        cleanup.forEach(key => {
            if (this.scene.isActive(key) || this.scene.isPaused(key)) this.scene.stop(key);
        });
        this.scene.start('TitleScene');
    }
}

/**
 * HelpScene - In-game controls guide overlay
 */
class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75);
        overlay.setInteractive();

        const panelW = 520;
        const panelH = 620;
        const px = w / 2;
        const py = h / 2;

        this.add.rectangle(px, py, panelW, panelH, 0x1a1a2e, 0.95)
            .setStrokeStyle(2, 0x555555);

        this.add.text(px, py - panelH / 2 + 30, '操作指引', {
            fontSize: '28px', fill: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        const runModifierLines = getRunModifierHelpLines();
        const challengeRegularBodyDedupHelpLine = 'regular 三行挑战摘要的正文行若遇到上游已带“本局挑战：”/“挑战：”前缀的标签，也会先去重，避免与标题行重复同一前缀';
        const challengeDecoratorCleanupHelpLine = `若上游标签重复混入“本局”/“挑战：”这类 plain-text 前缀，会继续循环去重直到收敛成真正目标；各类 decorator wrapper（如“【本局挑战】”/“[挑战]”、“［挑战］”/“［本局挑战］”、“(挑战)”/“（本局挑战）”、“{挑战}”/“｛本局挑战｝”、“<挑战>”/“＜本局挑战＞”、“《挑战》”/“〈本局挑战〉”、“「挑战」”/“『本局挑战』”、“｢挑战｣”/“｢本局挑战｣”、“﹁挑战﹂”/“﹃本局挑战﹄”、“〝挑战〞”/“〝本局挑战〞”、“〝挑战〟”/“〝本局挑战〟”、“〘挑战〙”/“〘本局挑战〙”、“〚挑战〛”/“〚本局挑战〛”、““挑战””/“‘本局挑战’”、“"挑战"”/“\'本局挑战\'”、“〔挑战〕”/“〖本局挑战〗”，以及“【「挑战」】”/“《〔本局挑战〕》”、“【（挑战）】”/“（［本局挑战］）”、“【｛挑战｝】”/“｛［本局挑战］｝”、“【＜挑战＞】”/“＜［本局挑战］＞”、“【《挑战》】”/“〈［本局挑战］〉”、“【『挑战』】”/“『［本局挑战］』”、“【｢挑战｣】”/“｢［本局挑战］｣”、“【〖挑战〗】”/“〖［本局挑战］〗”、“【“挑战”】”/““［本局挑战］””、“【‘挑战’】”/“‘［本局挑战］’”与“【'挑战'】”/“'［本局挑战］'”这类 nested mixed）也会先逐层剥离，再继续做同一轮“本局”/“挑战”去重；“【"挑战"】”/“《\'本局挑战\'》”这类 nested ASCII straight-quote mixed wrapper 也沿用同一条 decorator 剥离与前缀去重链；“【﹁挑战﹂】”/“﹃［本局挑战］﹄”、“【〝挑战〞】”/“〝［本局挑战］〞”、“【〝挑战〟】”/“〝［本局挑战］〟”、“【〘挑战〙】”/“〘［本局挑战］〙”、“【〚挑战〛】”/“〚［本局挑战］〛”、“【〔挑战〕】”/“〔［本局挑战］〕”、“【〖挑战〗】”/“〖［本局挑战］〗”、“【“挑战”】”/““［本局挑战］””、“【‘挑战’】”/“‘［本局挑战］’”与“【'挑战'】”/“'［本局挑战］'”这类 nested quote/bracket-family mixed wrapper 也沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链；“【［挑战］】”/“［【本局挑战】］”、“【[挑战]】”/“[【本局挑战】]”与“［【挑战】］”/“【［本局挑战］】”这类 nested square-family mixed wrapper 也沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链；“［[挑战]］”/“[［本局挑战］]”、“［｛挑战｝］”/“｛［本局挑战］｝”、“［（挑战）］”/“（［本局挑战］）”、“［＜挑战＞］”/“＜［本局挑战］＞”、“［《挑战》］”/“《［本局挑战］》”、“［〈挑战〉］”/“〈［本局挑战］〉”、“［「挑战」］”/“「［本局挑战］」”、“［"挑战"］”/“"［本局挑战］"”、“［〚挑战〛］”/“〚［本局挑战］〛”、“［〔挑战〕］”/“〔［本局挑战］〕”、“［〖挑战〗］”/“〖［本局挑战］〗”、“［“挑战”］”/““［本局挑战］””、“［『挑战』］”/“『［本局挑战］』”、“［｢挑战｣］”/“｢［本局挑战］｣”、“［〝挑战〞］”/“〝［本局挑战］〞”、“［〝挑战〟］”/“〝［本局挑战］〟”、“［‘挑战’］”/“‘［本局挑战］’”与“［'挑战'］”/“'［本局挑战］'”这类 nested full-width square-family mixed wrapper 也沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链；“［〘挑战〙］”/“〘［本局挑战］〙”与“［﹁挑战﹂］”/“﹃［本局挑战］﹄”这类补充 nested full-width square-family mixed wrapper 也沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链；“〈［挑战］〉”/“［〈本局挑战〉］”、“〈[挑战]〉”/“[〈本局挑战〉]”、“〈【挑战】〉”/“【〈本局挑战〉】”、“〈〘挑战〙〉”/“〘〈本局挑战〉〙”、“〈〚挑战〛〉”/“〚〈本局挑战〉〛”、“〈〔挑战〕〉”/“〔〈本局挑战〉〕”、“〈〖挑战〗〉”/“〖〈本局挑战〉〗”、“〈“挑战”〉”/““〈本局挑战〉””、“〈‘挑战’〉”/“‘〈本局挑战〉’”、“〈"挑战"〉”/“"〈本局挑战〉"”、“〈'挑战'〉”/“'〈本局挑战〉'”、“〈｢挑战｣〉”/“｢〈本局挑战〉｣”、“〈﹁挑战﹂〉”/“﹃〈本局挑战〉﹄”、“〈〝挑战〞〉”/“〝〈本局挑战〉〞”、“〈〝挑战〟〉”/“〝〈本局挑战〉〟”与“[〈挑战〉]”/“〈[本局挑战]〉”这类补充 nested corner-angle mixed wrapper 也沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链；“〈〈挑战〉〉”/“［［本局挑战］］”这类同类双层异形括号 stack、“""挑战""”/“''本局挑战''”这类同类双层对称引号 stack，以及“〝〝挑战〞〟”/“〝〝本局挑战〟〟”、“〝〝挑战〟〞”/“〝〝本局挑战〟〞”这类 shared opener “〝” 的 mixed-closing ornamental quote stack，现在也会继续沿用同一条逐层 decorator 剥离、前缀去重与“未知挑战”回退链`;
        const challengeSeparatorCleanupHelpLine = 'wrapper 内部的 separator 家族现在按分组统一做 token 规范化：leading / orphan separators（如“：挑战”/“-本局挑战”/standalone “：”/“-”，以及“【：】”/“《-》”这类 separator-only payload）、full-width pipe / slash（“｜”/“／”）、ASCII pipe / slash / backslash（“|”/“/”/“\\\\”）、middle-dot / bullet（“·”/“•”）、comma / semicolon / sentence punctuation（“、”/“，”/“；”/“。”/“!”/“?”/“！”/“？”）、tilde / ellipsis（“~”/“～”/“…”/“⋯”）、dash（“—”/“–”）；这些脏分隔符都会先被清掉，再继续做同一轮“本局”/“挑战”去重；若去重后已无剩余正文，则 regular / compact 摘要统一回退为“未知挑战”';
        const challengeRegularThirdLineFallbackHelpLine = '当 regular 第三行宽度预算继续吃紧时，进行中与完成态也会先沿用“进度:12/30  奖励:+90金 -> 进度:12/30 -> 12/30”/“进度:30/30  奖励:+90金 -> 进度:30/30 -> 30/30”这条语义回退链，而不是直接退化成通用省略；若当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“进度:12/30 -> 12/30”/“进度:30/30 -> 30/30”这条 progress-only 回退梯子，不会伪造“奖励:+0金”/“奖励:未知”这类占位奖励；若 regular 第三行的奖励短句未来扩展到“+9999金 +净化”这类复合形式，进行中 / 完成态也都会继续沿用同一条进度优先回退链；若前缀去重后的正文回退为“未知挑战”且当前 challenge 没有奖励短句，则 regular 三行摘要会继续保留“未知挑战”正文，并沿用“进度:12/30 -> 12/30”/“进度:30/30 -> 30/30”这条 no-reward progress-only 回退链';
        const sections = [
            { title: '移动', items: ['WASD  —  八方向移动'] },
            { title: '瞄准', items: ['I / J / K / L  —  键盘双轴瞄准（保留上次朝向）', '当前瞄准会显示在 HUD 左下角'] },
            { title: '战斗', items: ['U / 鼠标左键  —  普通攻击', 'O / 鼠标右键  —  特殊攻击', '左下角行动行会显示冷却；若只差体力，则会显示“差2体/0.1s”这类自然回复 ETA；若冷却转好后仍差体力，则会预告“0.3s后差8体/0.5s”；若正处于翻滚锁定，则会继续预告“翻滚中 -> 就绪”这类翻滚后的下一状态；当任一动作刚切进“就绪”时，只有对应那一项会短促闪亮一下；若 Boss 战切到专用 HUD，则顶部血条会收紧，但左下角当前瞄准 / 武器 / 行动行与右下快捷栏仍保持稳定底边留白'] },
            { title: '防御', items: ['Space  —  闪避翻滚（无敌帧）'] },
            { title: '武器', items: ['Q / E  —  切换武器'] },
            { title: '道具', items: ['1-4  —  使用快捷栏道具', '点击背包消耗品会自动装入快捷栏首个空位，并提示“快捷栏N：+<短名>”；若临时拿不到显式短名则会沿用道具名生成“快捷栏N：+生命”这类短句；提示现在会优先按 Phaser 文本实际宽度钳制，因此“快捷栏N：+HP恢复”这类混排会尽量保留更多有效信息；若当前环境拿不到真实测量结果则回退为宽度权重估算；若道具名词干过长则会截成“快捷栏N：+圣疗秘…”这类省略短句；快捷栏已满时会覆盖 1 号槽位，并提示“快捷栏1：<旧短名>→<新短名>”；若新旧短名相同则压缩为“快捷栏1：同类 <短名>”；若拿不到显式短名则改用“快捷栏1：狂战→净化”这类道具名短句；若这些道具名过长则同样会截成“快捷栏1：古代狂…→神圣净…”这类省略短句', '背包悬停说明也会按实际文本宽度贴边，因此靠近屏幕右缘时不会继续沿用固定 200px 估算', '净化药剂/狂战油可在铁匠制作'] },
            { title: '状态', items: ['灼烧/流血会持续掉血', '减速会降低移动速度'] },
            { title: '本局词缀', items: runModifierLines },
            {
                title: '交互/界面',
                items: [
                    'F — NPC / 事件房交互',
                    '事件房祭坛靠近提示也会按 Phaser 文本实际宽度贴在当前视口内，因此贴近屏幕边缘时不会被裁出画面',
                    '右侧固定侧栏里的章节标题、区域名、本局词缀、本局挑战与事件房摘要会优先按 Phaser 文本实际宽度钳制，并按实际文本高度动态纵向排布，避免长标题 / 长路线结算继续互相顶出 HUD',
                    '这些 compact / ultra-compact / ultra-tight 分档会按实际显示尺寸触发，而不再只依赖固定逻辑画布尺寸',
                    challengeRegularBodyDedupHelpLine,
                    challengeDecoratorCleanupHelpLine,
                    challengeSeparatorCleanupHelpLine,
                    challengeRegularThirdLineFallbackHelpLine,
                    '若前缀去重后的正文回退为“未知挑战”但当前 challenge 仍有奖励短句，则 regular 三行摘要会继续保留“未知挑战”正文，并沿用“进度:12/30  奖励:+90金”/“进度:30/30  奖励:+90金”这条 reward-bearing 第三行语义，不额外插入新的中间短句',
                    '若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“进行中  奖励:+90金 -> 进行中”这组状态优先回退，不再输出误导性的“进度:0/0”/“0/0”；compact 标题也会改为“本局挑战：进行中”，继续保留第二行目标 / 奖励短句',
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“已完成  奖励:+90金 -> 已完成”这组 completed-state 回退，不再误退回“进行中”；即使正文已因前缀去重回退成“未知挑战”，第三行也会继续保留 completed-state 语义',
                    '若视口进入 compact 档位，则本局词缀与事件房摘要会额外收敛为有限行数，并在最后一行补省略号',
                    'compact 双行挑战摘要里的进行中与完成态都会在第二行继续显式暴露共享奖励短句；若上游挑战标题仍带“本局挑战：”/“挑战：”前缀，compact 第二行也会先去重再拼接奖励短句，避免紧凑摘要重复“挑战”标题；当 compact 进行中摘要的第二行宽度预算继续吃紧时，也会先沿用“击败 30 个敌人 · +90金 -> 击败 30 个敌人 -> 击败30个敌人”这条语义回退链，而不是直接退化成通用省略；完成态的第二行宽度预算继续吃紧时，也会沿用同一条“击败 30 个敌人 · +90金 -> 击败 30 个敌人 -> 击败30个敌人”语义回退链；若当前 challenge 没有奖励短句，则 compact 第二行会继续沿用“击败 30 个敌人 -> 击败30个敌人”这条 label-only 回退梯子，不补“+0金”/“奖励:未知”这类占位；若这条 compact 第二行的奖励短句未来扩展到“+9999金 +净化”这类复合形式，进行中 / 完成态也都会继续沿用同一条回退链；若前缀去重后的正文回退为“未知挑战”且当前 challenge 没有奖励短句，则 compact 第二行也会继续保留“未知挑战”这条 label-only 回退，不补“+0金”/“奖励:未知”这类占位',
                    '若前缀去重后的正文回退为“未知挑战”且当前 challenge 仍有奖励短句，则 compact 第二行也会继续保留“未知挑战 · +90金”这条 reward-bearing 回退，不额外插入新的中间短句',
                    '若视口进一步进入 ultra-compact 档位，则会先进一步收紧各区块间距与底边缓冲，本局词缀会压到 1 行、事件房摘要压到 2 行、本局挑战压到单行进度摘要；当这条可见摘要的宽度预算继续吃紧时，即使奖励数值扩大到“+9999金”这类长度，进行中态也会继续沿用“挑战 12/30 · +90金 -> 挑战 12/30 -> 12/30”这条语义回退链，完成态则继续沿用“挑战完成 · +90金 -> 挑战完成 -> 完成”，而不会额外插入新的中间短句；若当前 challenge 没有奖励短句，则 ultra-compact 单行摘要也会继续沿用“挑战 12/30 -> 12/30”/“挑战完成 -> 完成”这条 no-reward 回退梯子，不补“+0金”/“奖励:未知”这类占位；若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，则 ultra-compact 单行摘要会改为沿用“挑战进行中 · +90金 -> 挑战进行中 -> 进行中”这组状态优先回退；隐藏后的轻量 in-progress badge 则保持静默，不输出“挑战 0/0”/“进0/0”/“0/0”',
                    '若这条可见摘要的奖励短句未来扩展到“+9999金 +净化”这类复合形式，也会继续沿用同一条可见摘要与完成徽记回退链；即使上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，ultra-compact 这条单行摘要也仍会保持同一组“挑战 12/30 · +90金 -> 挑战 12/30 -> 12/30”/“挑战完成 · +90金 -> 挑战完成 -> 完成”语义短句，不额外插入“未知挑战”这类中间短句；若未来异常数据把 completed challenge 的“target”压成 0 或更低，且上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，ultra-compact 这条单行摘要也仍会继续沿用“挑战完成 · +90金 -> 挑战完成 -> 完成”这组 completed-state 回退链，不额外插入“未知挑战”；即使上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，若奖励短句未来扩展到“+9999金 +净化”这类显式复合形式，ultra-compact 这条单行摘要也仍会继续沿用同一组“挑战 12/30 · +9999金 +净化 -> 挑战 12/30 -> 12/30”/“挑战完成 · +9999金 +净化 -> 挑战完成 -> 完成”语义短句，不额外插入“未知挑战”这类中间短句；regular / compact 分档里凡是仍会显示奖励的路径，也会复用同一奖励短句 helper，避免与 ultra-compact 回退链出现文案漂移；共享 challenge 标签与显式奖励短句 helper 也会压缩异常半角 / 全角空白，并把“+ 9999金”/“+ 净化”与“＋ 9999金”/“＋ 净化”这类 additive token 空白 / full-width plus 规整成“+9999金 +净化”，避免正文间距或复合奖励文案因脏输入而提前挤爆各分档宽度预算；若该挑战摘要与本局词缀正文都因溢出被隐藏，则会在挑战起步后把“进12/30”/“完成”压成挂在“本局词缀”标题后的轻量徽记；若标题预算进一步吃紧，则进行中态还会继续压成“12/30”；若进入 ultra-tight 更紧预算，则会再回退为“进12”这类无省略最终短句；若连进行中态的“进12”都放不下，则也会静默隐藏 badge，把同一行预算完全还给标题；完成态还会先从“完成+90金”这类奖励短句回退为“完成”；若连完成态的“完成”都放不下，则会静默隐藏 badge，把同一行预算完全还给标题；若当前 challenge 没有奖励短句，则隐藏后的轻量挑战徽记也会继续沿用“进12/30 -> 12/30 -> 进12 -> 静默隐藏”/“完成 -> 静默隐藏”这组 no-reward 回退链，不补“+0金”/“奖励:未知”这类占位；即使上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量挑战徽记也仍会继续沿用“进12/30 -> 12/30 -> 进12 -> 静默隐藏”/“完成 -> 静默隐藏”这组 no-reward 回退链，不额外插入“未知挑战”/“+0金”/“奖励:未知”这类中间占位；即使上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用“完成+90金 -> 完成 -> 静默隐藏”这组回退链，不额外插入“未知挑战”这类中间短句；即使上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，若隐藏后的轻量 completed challenge badge 奖励短句未来扩展到“+9999金 +净化”这类显式复合形式，也会继续沿用“完成+9999金 +净化 -> 完成 -> 静默隐藏”同一语义回退链，不额外插入“未知挑战”这类中间短句',
                    '该轻量徽记会拆成独立弱化色阶，并进一步下调字级与透明度后再与“本局词缀”标题分开贴边；若标题预算继续压窄，则会按更紧预算分档继续下调 badge 宽度占比、最小宽度与固定 gap，优先把更多横向空间留给标题正文',
                    '若侧栏总高度仍超出安全范围，则会优先隐藏事件房摘要，其次再隐藏本局词缀正文，最后才隐藏本局挑战摘要',
                    'Tab — 背包',
                    'Esc — 暂停',
                    'H — 操作指引'
                ]
            },
        ];

        const interfaceSection = sections.find(section => section && section.title === '交互/界面');
        if (interfaceSection && Array.isArray(interfaceSection.items)) {
            const inProgressInvalidTargetIndex = interfaceSection.items.indexOf('若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“进行中  奖励:+90金 -> 进行中”这组状态优先回退，不再输出误导性的“进度:0/0”/“0/0”；compact 标题也会改为“本局挑战：进行中”，继续保留第二行目标 / 奖励短句');
            if (inProgressInvalidTargetIndex >= 0) {
                interfaceSection.items.splice(
                    inProgressInvalidTargetIndex + 1,
                    0,
                    '若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“进行中”；compact 标题继续保留“本局挑战：进行中”且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用“挑战进行中 -> 进行中”这组 no-reward 状态回退，不补“0/0”/“奖励:+0金”/“奖励:未知”这类占位；这三档可见摘要现在会显式复用同一组 in-progress 状态 helper，避免未来文案漂移',
                    '若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular / compact / ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing in-progress helper，统一收敛“进行中  奖励:+90金”/“击败 30 个敌人 · +90金”/“挑战进行中 · +90金”这条状态优先语义，避免未来文案漂移',
                    '若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且前缀去重后的正文已回退为“未知挑战”，compact 第二行也会继续沿用“未知挑战 · +90金”/“未知挑战”这组 detail fallback，不补“0/0”/“进度:0/0”这类误导性占位',
                    '即使当前 challenge 仍有奖励短句，且上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 in-progress challenge badge 也仍会继续沿用“进12/30 -> 12/30 -> 进12 -> 静默隐藏”这组 progress-only 回退链，不额外插入“未知挑战”/“+90金”/“奖励:未知”这类中间占位',
                    '若未来异常数据把 in-progress challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，隐藏后的轻量 in-progress challenge badge 也会继续保持静默，不输出“挑战 0/0”/“进0/0”/“0/0”',
                    '对应的轻量 badge appearance 也会回退为空文案并清空弱化 tint/alpha，避免标题行残留旧着色',
                    'run-modifier heading 在 hidden challenge badge 静默路径下也会同步回收标题宽度预算；即使 badge 输入在最终拟合后被压成空文案或只剩空白，也会清空残留样式，避免“本局词缀”标题继续沿用旧缩窄布局'
                );
            }
            const completedInvalidTargetIndex = interfaceSection.items.indexOf('若未来异常数据把 completed challenge 的“target”压成 0 或更低，则 regular 第三行会改为沿用“已完成  奖励:+90金 -> 已完成”这组 completed-state 回退，不再误退回“进行中”；即使正文已因前缀去重回退成“未知挑战”，第三行也会继续保留 completed-state 语义');
            if (completedInvalidTargetIndex >= 0) {
                interfaceSection.items.splice(
                    completedInvalidTargetIndex + 1,
                    0,
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则 regular 第三行会继续沿用“已完成”；compact 标题继续保留“本局挑战：已完成”且第二行保留目标正文；ultra-compact 单行摘要也会继续沿用“挑战完成 -> 完成”这组 completed-state / no-reward 回退链，不误退回“进行中”，也不补“奖励:+0金”/“奖励:未知”；这三档可见摘要现在会显式复用同一组 completed-state helper，避免未来文案漂移',
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 仍有奖励短句，则 regular / compact / ultra-compact 这三档可见摘要也会继续显式复用同一组 reward-bearing completed helper，统一收敛“已完成  奖励:+90金”/“击败 30 个敌人 · +90金”/“挑战完成 · +90金”这条 completed-state 语义，避免未来文案漂移',
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，且前缀去重后的正文已回退为“未知挑战”，compact 第二行也会继续沿用“未知挑战 · +90金”/“未知挑战”这组 completed detail fallback，不误退回“进行中”'
                );
                interfaceSection.items.splice(
                    completedInvalidTargetIndex + 2,
                    0,
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，且上游挑战标签在 regular / compact 路径里因前缀去重而回退成“未知挑战”，隐藏后的轻量 completed challenge badge 在仍有奖励短句时也会继续沿用“完成+90金 -> 完成 -> 静默隐藏”这组 completed-state 回退链，不额外插入“未知挑战”这类中间短句',
                    '若未来异常数据把 completed challenge 的“target”压成 0 或更低，且当前 challenge 没有奖励短句，则隐藏后的轻量 completed challenge badge 也会继续沿用“完成 -> 静默隐藏”这组 no-reward 回退链，不补“+0金”/“奖励:未知”这类占位'
                );
            }
        }

        let curY = py - panelH / 2 + 72;
        for (const sec of sections) {
            this.add.text(px - panelW / 2 + 40, curY, sec.title, {
                fontSize: '16px', fill: '#ff4444', fontStyle: 'bold'
            });
            curY += 24;
            for (const item of sec.items) {
                this.add.text(px - panelW / 2 + 60, curY, item, {
                    fontSize: '14px', fill: '#cccccc'
                });
                curY += 22;
            }
            curY += 8;
        }

        this.add.text(px, py + panelH / 2 - 25, '按 H / Esc 关闭', {
            fontSize: '14px', fill: '#888888'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-H', () => this._close());
        this.input.keyboard.on('keydown-ESC', () => this._close());
        overlay.on('pointerdown', () => this._close());
    }

    _close() {
        this.scene.resume(this.scene.settings.data?.parentScene || 'HubScene');
        this.scene.stop();
    }
}

class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const lines = [
            { text: '七 宗 罪', size: '48px', color: '#FFD700', y: h + 60 },
            { text: 'SEVEN DEADLY SINS', size: '20px', color: '#aaaaaa', y: h + 110 },
            { text: '', size: '16px', color: '#ffffff', y: h + 160 },
            { text: '—— 感谢游玩 ——', size: '28px', color: '#ffffff', y: h + 200 },
            { text: '', size: '16px', color: '#ffffff', y: h + 240 },
            { text: '你击败了七位罪之化身', size: '20px', color: '#cccccc', y: h + 280 },
            { text: '封印了原罪之主', size: '20px', color: '#cccccc', y: h + 310 },
            { text: '这个世界得以暂时安宁', size: '20px', color: '#cccccc', y: h + 340 },
            { text: '', size: '16px', color: '#ffffff', y: h + 380 },
            { text: '—— 七宗罪 ——', size: '22px', color: '#FFD700', y: h + 430 },
            { text: '傲慢 · 堕天骑士', size: '18px', color: '#FFD700', y: h + 470 },
            { text: '嫉妒 · 影形者', size: '18px', color: '#2ECC40', y: h + 500 },
            { text: '暴怒 · 炎魔将军', size: '18px', color: '#FF4136', y: h + 530 },
            { text: '懒惰 · 梦境蛛后', size: '18px', color: '#B10DC9', y: h + 560 },
            { text: '贪婪 · 黄金龙王', size: '18px', color: '#FFDC00', y: h + 590 },
            { text: '暴食 · 深渊巨口', size: '18px', color: '#85144b', y: h + 620 },
            { text: '色欲 · 魅惑女妖', size: '18px', color: '#F012BE', y: h + 650 },
            { text: '', size: '16px', color: '#ffffff', y: h + 690 },
            { text: '原罪 · 原罪之主', size: '22px', color: '#FFFFFF', y: h + 730 },
            { text: '', size: '16px', color: '#ffffff', y: h + 780 },
            { text: '按任意键返回标题', size: '18px', color: '#888888', y: h + 850 }
        ];

        this._texts = [];
        for (const line of lines) {
            const t = this.add.text(w / 2, line.y, line.text, {
                fontSize: line.size,
                fill: line.color,
                fontFamily: 'sans-serif'
            }).setOrigin(0.5);
            this._texts.push(t);
        }

        this.tweens.add({
            targets: this._texts,
            y: '-=' + (h + 200),
            duration: 15000,
            ease: 'Linear',
            onComplete: () => {
                this._showReturn();
            }
        });

        this.input.on('pointerdown', () => this._returnToTitle());
        this.input.keyboard.on('keydown', () => this._returnToTitle());
    }

    _showReturn() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.text(w / 2, h / 2, '按任意键返回标题', {
            fontSize: '24px',
            fill: '#FFD700'
        }).setOrigin(0.5);
    }

    _returnToTitle() {
        this.scene.start('TitleScene');
    }
}

/**
 * Phaser Game Configuration
 */
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    pixelArt: true,
    disableContextMenu: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, TitleScene, HubScene, LevelScene, BossScene, DialogScene, InventoryScene, ShopScene, BlacksmithScene, UIScene, PauseScene, HelpScene, CreditsScene]
};

const game = new Phaser.Game(config);

if (typeof globalThis !== 'undefined') {
    globalThis.__SDS_GAME__ = game;
    if (isTestModeEnabled()) {
        globalThis.GameState = GameState;
    }
}

if (isTestModeEnabled() && TestHarness && typeof TestHarness.setSnapshotProvider === 'function') {
    TestHarness.setSnapshotProvider(() => {
        const scenes = game && game.scene && typeof game.scene.getScenes === 'function'
            ? game.scene.getScenes(true)
            : [];
        const activeScenes = scenes
            .filter(scene => scene && scene.sys && scene.sys.settings && scene.sys.settings.active !== false)
            .map(scene => scene.sys.settings.key);

        const pickScene = (...keys) => keys.find(key => activeScenes.includes(key)) || activeScenes[0] || null;
        const primaryScene = pickScene('BossScene', 'LevelScene', 'HubScene', 'TitleScene', 'DialogScene', 'InventoryScene', 'ShopScene', 'BlacksmithScene', 'PauseScene', 'HelpScene');

        const levelScene = game.scene.getScene('LevelScene');
        const bossScene = game.scene.getScene('BossScene');
        const hubScene = game.scene.getScene('HubScene');

        return {
            scene: primaryScene,
            activeScenes,
            gameState: {
                gold: GameState.gold,
                defeatedBosses: Array.isArray(GameState.defeatedBosses) ? [...GameState.defeatedBosses] : [],
                sinSeals: Array.isArray(GameState.sinSeals) ? [...GameState.sinSeals] : [],
                inventoryKeys: Object.keys(GameState.inventory || {}),
                selectedWeaponKey: GameState.selectedWeaponKey || null
            },
            level: levelScene && levelScene.sys && levelScene.sys.settings && levelScene.sys.settings.active
                ? {
                    bossKey: levelScene.bossKey || null,
                    enemiesAlive: Array.isArray(levelScene.enemies) ? levelScene.enemies.filter(e => e && e.isAlive).length : 0,
                    playerDead: !!levelScene.playerDead
                }
                : null,
            boss: bossScene && bossScene.sys && bossScene.sys.settings && bossScene.sys.settings.active
                ? {
                    bossKey: bossScene.bossKey || null,
                    bossHp: bossScene.boss && Number.isFinite(bossScene.boss.hp) ? bossScene.boss.hp : null,
                    bossAlive: !!(bossScene.boss && bossScene.boss.isAlive),
                    playerDead: !!bossScene.playerDead
                }
                : null,
            hub: hubScene && hubScene.sys && hubScene.sys.settings && hubScene.sys.settings.active
                ? {
                    portalCount: Array.isArray(hubScene.portals) ? hubScene.portals.length : 0,
                    nearestNpc: hubScene.nearestNpc ? hubScene.nearestNpc.npcKey : null
                }
                : null
        };
    });
}
