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

    function resolveKeyboardAimState(input) {
        const safe = input && typeof input === 'object' ? input : {};
        const horizontal = (safe.right ? 1 : 0) - (safe.left ? 1 : 0);
        const vertical = (safe.down ? 1 : 0) - (safe.up ? 1 : 0);
        const fallbackAngle = Number.isFinite(safe.fallbackAngle) ? safe.fallbackAngle : 0;

        if (horizontal === 0 && vertical === 0) {
            return {
                x: Math.cos(fallbackAngle),
                y: Math.sin(fallbackAngle),
                angle: fallbackAngle,
                hasInput: false
            };
        }

        let x = horizontal;
        let y = vertical;
        if (x !== 0 && y !== 0) {
            const diagonalScale = Math.SQRT1_2;
            x *= diagonalScale;
            y *= diagonalScale;
        }

        return {
            x,
            y,
            angle: Math.atan2(y, x),
            hasInput: true
        };
    }

    function formatAimDirectionLabel(angle) {
        const safeAngle = Number.isFinite(angle) ? Math.atan2(Math.sin(angle), Math.cos(angle)) : 0;
        const degree = safeAngle * (180 / Math.PI);

        if (degree > -22.5 && degree <= 22.5) return '右';
        if (degree > 22.5 && degree <= 67.5) return '右下';
        if (degree > 67.5 && degree <= 112.5) return '下';
        if (degree > 112.5 && degree <= 157.5) return '左下';
        if (degree > 157.5 || degree <= -157.5) return '左';
        if (degree > -157.5 && degree <= -112.5) return '左上';
        if (degree > -112.5 && degree <= -67.5) return '上';
        return '右上';
    }

    function formatCooldownSecondsLabel(cooldownMs) {
        const ms = Math.max(0, Number(cooldownMs) || 0);
        if (ms <= 0) return '就绪';
        const seconds = Math.max(0.1, Math.round(ms / 100) / 10);
        return `${seconds.toFixed(1)}s`;
    }

    function formatStaminaRecoveryEtaLabel(missingStamina, staminaRegenPerSecond) {
        const safeMissingStamina = Math.max(0, Number(missingStamina) || 0);
        const safeStaminaRegenPerSecond = Math.max(0, Number(staminaRegenPerSecond) || 0);
        if (safeMissingStamina <= 0 || safeStaminaRegenPerSecond <= 0) return '';
        const seconds = Math.max(0.1, Math.round((safeMissingStamina / safeStaminaRegenPerSecond) * 10) / 10);
        return `${seconds.toFixed(1)}s`;
    }

    function formatCombatActionReadyLabel(cooldownMs, stamina, staminaCost, staminaRegenPerSecond) {
        const remainingCooldownMs = Math.max(0, Number(cooldownMs) || 0);
        const currentStamina = Math.max(0, Number(stamina) || 0);
        const requiredStamina = Math.max(0, Number(staminaCost) || 0);
        const safeStaminaRegenPerSecond = Math.max(0, Number(staminaRegenPerSecond) || 0);

        if (remainingCooldownMs > 0) {
            if (requiredStamina > 0 && currentStamina < requiredStamina) {
                const staminaRecoveredDuringCooldown = safeStaminaRegenPerSecond > 0
                    ? (safeStaminaRegenPerSecond * remainingCooldownMs) / 1000
                    : 0;
                const staminaAtCooldownEnd = currentStamina + staminaRecoveredDuringCooldown;
                if (staminaAtCooldownEnd + 1e-6 >= requiredStamina) {
                    return formatCooldownSecondsLabel(remainingCooldownMs);
                }

                const missingStaminaAfterCooldown = Math.max(1, Math.ceil(requiredStamina - staminaAtCooldownEnd));
                const recoveryEta = formatStaminaRecoveryEtaLabel(requiredStamina - staminaAtCooldownEnd, safeStaminaRegenPerSecond);
                return recoveryEta
                    ? `${formatCooldownSecondsLabel(remainingCooldownMs)}后差${missingStaminaAfterCooldown}体/${recoveryEta}`
                    : `${formatCooldownSecondsLabel(remainingCooldownMs)}后差${missingStaminaAfterCooldown}体`;
            }

            return formatCooldownSecondsLabel(remainingCooldownMs);
        }

        if (requiredStamina > 0 && currentStamina < requiredStamina) {
            const missingStamina = Math.max(1, Math.ceil(requiredStamina - currentStamina));
            const recoveryEta = formatStaminaRecoveryEtaLabel(missingStamina, safeStaminaRegenPerSecond);
            return recoveryEta ? `差${missingStamina}体/${recoveryEta}` : `差${missingStamina}体`;
        }

        return '就绪';
    }

    function resolveCombatActionReadyState(cooldownMs, stamina, staminaCost, staminaRegenPerSecond) {
        const label = formatCombatActionReadyLabel(cooldownMs, stamina, staminaCost, staminaRegenPerSecond);
        return {
            label,
            isReady: label === '就绪'
        };
    }

    function buildCombatActionHudSegments(input) {
        const safe = input && typeof input === 'object' ? input : {};
        if (safe.isDodging) {
            const remainingDodgeLockoutMs = Math.max(0, Number(safe.dodgeLockoutMs) || 0);
            const attackPreviewState = resolveCombatActionReadyState(
                Math.max(0, (Number(safe.attackCooldownMs) || 0) - remainingDodgeLockoutMs),
                safe.stamina,
                safe.attackStaminaCost,
                safe.staminaRegenPerSecond
            );
            const specialPreviewState = resolveCombatActionReadyState(
                Math.max(0, (Number(safe.specialCooldownMs) || 0) - remainingDodgeLockoutMs),
                safe.stamina,
                safe.specialStaminaCost,
                safe.staminaRegenPerSecond
            );
            const dodgePreviewState = resolveCombatActionReadyState(
                safe.dodgePostLockoutCooldownMs,
                safe.stamina,
                safe.dodgeStaminaCost,
                safe.staminaRegenPerSecond
            );
            return [
                { key: 'attack', text: `普攻 U: 翻滚中 -> ${attackPreviewState.label}`, isReady: false },
                { key: 'special', text: `特攻 O: 翻滚中 -> ${specialPreviewState.label}`, isReady: false },
                { key: 'dodge', text: `闪避 Space: 翻滚中 -> ${dodgePreviewState.label}`, isReady: false }
            ];
        }

        const attackState = resolveCombatActionReadyState(
            safe.attackCooldownMs,
            safe.stamina,
            safe.attackStaminaCost,
            safe.staminaRegenPerSecond
        );
        const specialState = resolveCombatActionReadyState(
            safe.specialCooldownMs,
            safe.stamina,
            safe.specialStaminaCost,
            safe.staminaRegenPerSecond
        );
        const dodgeState = resolveCombatActionReadyState(
            safe.dodgeCooldownMs,
            safe.stamina,
            safe.dodgeStaminaCost,
            safe.staminaRegenPerSecond
        );
        return [
            { key: 'attack', text: `普攻 U: ${attackState.label}`, isReady: attackState.isReady },
            { key: 'special', text: `特攻 O: ${specialState.label}`, isReady: specialState.isReady },
            { key: 'dodge', text: `闪避 Space: ${dodgeState.label}`, isReady: dodgeState.isReady }
        ];
    }

    function buildCombatActionReadiness(input) {
        return buildCombatActionHudSegments(input).reduce((result, segment) => {
            result[segment.key] = !!segment.isReady;
            return result;
        }, {});
    }

    function buildCombatActionHudSummary(input) {
        return buildCombatActionHudSegments(input).map(segment => segment.text).join('  ');
    }

    function buildCombatActionHudLayout(segments, options) {
        const safeSegments = Array.isArray(segments) ? segments : [];
        const safeOptions = options && typeof options === 'object' ? options : {};
        const startX = Number.isFinite(safeOptions.startX) ? safeOptions.startX : 0;
        const maxWidth = Number.isFinite(safeOptions.maxWidth) && safeOptions.maxWidth > 0
            ? safeOptions.maxWidth
            : Number.POSITIVE_INFINITY;
        const gap = Number.isFinite(safeOptions.gap) && safeOptions.gap >= 0 ? safeOptions.gap : 18;
        const rowGap = Number.isFinite(safeOptions.rowGap) && safeOptions.rowGap >= 0 ? safeOptions.rowGap : 22;
        const placements = [];
        let currentRow = 0;
        let currentRowWidth = 0;

        safeSegments.forEach((segment) => {
            const safeSegment = segment && typeof segment === 'object' ? segment : {};
            const width = Math.max(0, Number(safeSegment.width) || 0);
            const needsGap = currentRowWidth > 0;
            const proposedRowWidth = needsGap ? currentRowWidth + gap + width : width;
            if (needsGap && proposedRowWidth > maxWidth) {
                currentRow += 1;
                currentRowWidth = 0;
            }

            const offsetX = currentRowWidth > 0 ? currentRowWidth + gap : 0;
            placements.push({
                key: safeSegment.key || '',
                width,
                row: currentRow,
                x: startX + offsetX,
                y: currentRow * rowGap
            });
            currentRowWidth = offsetX + width;
        });

        return {
            rowCount: placements.length > 0 ? placements[placements.length - 1].row + 1 : 0,
            placements
        };
    }

    function buildPlayerHudLayout(options) {
        const safeOptions = options && typeof options === 'object' ? options : {};
        const isBossLayout = !!safeOptions.isBossLayout;
        const width = Number.isFinite(safeOptions.width) && safeOptions.width > 0 ? safeOptions.width : 0;
        const pad = isBossLayout ? 8 : 16;
        const bottomPad = 16;
        const hpBarY = pad;
        const staminaBarY = hpBarY + 20 + 8;
        return {
            pad,
            bottomPad,
            hpBarY,
            staminaBarY,
            sidePanelStartY: isBossLayout ? 112 : pad + 10,
            showSidePanel: !isBossLayout,
            width
        };
    }

    function getHudSidebarViewportTier(viewportWidth, viewportHeight) {
        const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0
            ? viewportWidth
            : Number.POSITIVE_INFINITY;
        const safeHeight = Number.isFinite(viewportHeight) && viewportHeight > 0
            ? viewportHeight
            : Number.POSITIVE_INFINITY;
        if (safeWidth <= 900 || safeHeight <= 680) {
            return 'ultraCompact';
        }
        if (safeWidth <= 1024 || safeHeight <= 768) {
            return 'compact';
        }
        return 'regular';
    }

    function getHudSidebarResponsiveMetrics(displayWidth, displayHeight, viewportWidth, viewportHeight) {
        const safeViewportWidth = Number.isFinite(viewportWidth) && viewportWidth > 0
            ? viewportWidth
            : Number.POSITIVE_INFINITY;
        const safeViewportHeight = Number.isFinite(viewportHeight) && viewportHeight > 0
            ? viewportHeight
            : Number.POSITIVE_INFINITY;
        const safeDisplayWidth = Number.isFinite(displayWidth) && displayWidth > 0
            ? displayWidth
            : safeViewportWidth;
        const safeDisplayHeight = Number.isFinite(displayHeight) && displayHeight > 0
            ? displayHeight
            : safeViewportHeight;
        return {
            displayWidth: safeDisplayWidth,
            displayHeight: safeDisplayHeight,
            viewportTier: getHudSidebarViewportTier(safeDisplayWidth, safeDisplayHeight),
            maxWidth: Math.max(96, Math.min(320, Math.floor(safeDisplayWidth - 96)))
        };
    }

    function getHudSidebarLineCap(sectionKey, viewportTier) {
        const safeSectionKey = typeof sectionKey === 'string' ? sectionKey : '';
        const safeTier = typeof viewportTier === 'string' ? viewportTier : 'regular';
        if (safeTier === 'ultraCompact') {
            if (safeSectionKey === 'challengeSidebar') return 1;
            if (safeSectionKey === 'runModifierSidebar') return 1;
            if (safeSectionKey === 'eventRoomSidebar') return 2;
            return 0;
        }
        if (safeTier === 'compact') {
            if (safeSectionKey === 'challengeSidebar') return 2;
            if (safeSectionKey === 'runModifierSidebar') return 2;
            if (safeSectionKey === 'eventRoomSidebar') return 3;
            return 0;
        }
        return 0;
    }

    function getHudSidebarOverflowPolicy(viewportTier) {
        const safeTier = typeof viewportTier === 'string' ? viewportTier : 'regular';
        const ultraCompact = safeTier === 'ultraCompact';
        return {
            maxBottomInset: ultraCompact ? 72 : 96,
            gaps: {
                areaNameText: ultraCompact ? 2 : 4,
                runModifierTitle: ultraCompact ? 1 : 2,
                runModifierText: ultraCompact ? 8 : 12,
                challengeText: ultraCompact ? 8 : 12,
                eventRoomText: 0
            },
            droppable: {
                runModifierText: true,
                challengeText: ultraCompact,
                eventRoomText: true
            },
            collapsePriority: {
                runModifierText: 2,
                challengeText: 1,
                eventRoomText: 3
            }
        };
    }

    function getRunModifierHeadingBadgeLayout(maxWidth, options) {
        const safeMaxWidth = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : 180;
        const viewportTier = options && typeof options.viewportTier === 'string'
            ? options.viewportTier
            : 'regular';
        const ultraCompact = viewportTier === 'ultraCompact';
        const tightTier = ultraCompact && safeMaxWidth <= 160;
        const finalTightTier = ultraCompact && safeMaxWidth <= 132;
        const ultraTightTier = ultraCompact && safeMaxWidth <= 108;
        const widthShare = ultraCompact
            ? (ultraTightTier ? 0.25 : (finalTightTier ? 0.28 : (tightTier ? 0.3 : 0.34)))
            : 0.42;
        return {
            maxWidth: Math.max(ultraCompact ? (ultraTightTier ? 28 : 40) : 44, Math.floor(safeMaxWidth * widthShare)),
            gap: ultraCompact ? (ultraTightTier ? 3 : (finalTightTier ? 4 : (tightTier ? 5 : 6))) : 8
        };
    }

    function getRunModifierHeadingPresentation(maxWidth, badgeAppearance, options) {
        const safeMaxWidth = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : 180;
        const safeBadgeAppearance = badgeAppearance && typeof badgeAppearance === 'object'
            ? badgeAppearance
            : { text: '', fill: '', alpha: 1 };
        const safeTitle = options && typeof options.title === 'string' && options.title
            ? options.title
            : '本局词缀';
        const viewportTier = options && typeof options.viewportTier === 'string'
            ? options.viewportTier
            : 'regular';
        const badgeLayout = getRunModifierHeadingBadgeLayout(safeMaxWidth, { viewportTier });
        const fitTitle = options && typeof options.fitTitle === 'function'
            ? options.fitTitle
            : (text => text);
        const fitBadge = options && typeof options.fitBadge === 'function'
            ? options.fitBadge
            : (text => text);
        const silentPresentation = {
            titleText: fitTitle(safeTitle, safeMaxWidth),
            titleMaxWidth: safeMaxWidth,
            badgeText: '',
            badgeVisible: false,
            badgeFill: '',
            badgeAlpha: 1,
            badgeWidth: 0,
            badgeGap: badgeLayout.gap
        };
        const normalizedBadgeText = normalizeInlineCopyWhitespace(safeBadgeAppearance.text);
        if (!normalizedBadgeText) return silentPresentation;

        const badgeText = normalizeInlineCopyWhitespace(fitBadge(normalizedBadgeText, badgeLayout.maxWidth));
        if (!badgeText) return silentPresentation;
        const badgeWidth = badgeText
            ? measureChallengeLabelWidth(badgeText, {
                measureLabelWidth: options && options.measureBadgeWidth,
                measureGlyphWidth: options && options.measureBadgeGlyphWidth
            })
            : 0;
        const titleMaxWidth = Math.max(48, safeMaxWidth - badgeWidth - badgeLayout.gap);
        return {
            titleText: fitTitle(safeTitle, titleMaxWidth),
            titleMaxWidth,
            badgeText,
            badgeVisible: !!badgeText,
            badgeFill: typeof safeBadgeAppearance.fill === 'string' ? safeBadgeAppearance.fill : '',
            badgeAlpha: Number.isFinite(safeBadgeAppearance.alpha) ? safeBadgeAppearance.alpha : 1,
            badgeWidth,
            badgeGap: badgeLayout.gap
        };
    }

    function getHudSidebarHeadingBadgeMetrics(displayWidth, displayHeight, viewportWidth, viewportHeight) {
        const responsiveMetrics = getHudSidebarResponsiveMetrics(displayWidth, displayHeight, viewportWidth, viewportHeight);
        const badgeLayout = getRunModifierHeadingBadgeLayout(responsiveMetrics.maxWidth, {
            viewportTier: responsiveMetrics.viewportTier
        });
        return {
            displayWidth: responsiveMetrics.displayWidth,
            displayHeight: responsiveMetrics.displayHeight,
            viewportTier: responsiveMetrics.viewportTier,
            maxWidth: responsiveMetrics.maxWidth,
            badgeMaxWidth: badgeLayout.maxWidth,
            badgeGap: badgeLayout.gap
        };
    }

    function normalizeInlineCopyWhitespace(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[\s\u3000]+/gu, ' ').trim();
    }

    const RUN_CHALLENGE_DECORATOR_PAIRS = [
        ['"', '"'],
        ['\'', '\''],
        ['<', '>'],
        ['＜', '＞'],
        ['[', ']'],
        ['［', '］'],
        ['【', '】'],
        ['(', ')'],
        ['（', '）'],
        ['{', '}'],
        ['｛', '｝'],
        ['「', '」'],
        ['｢', '｣'],
        ['『', '』'],
        ['《', '》'],
        ['〈', '〉'],
        ['﹁', '﹂'],
        ['﹃', '﹄'],
        ['〝', '〞'],
        ['〝', '〟'],
        ['〘', '〙'],
        ['〚', '〛'],
        ['〔', '〕'],
        ['〖', '〗'],
        ['“', '”'],
        ['‘', '’']
    ];
    const RUN_CHALLENGE_LEADING_SEPARATOR_RE = /^(?:(?:[:：;,；，、.。!?！？~～…⋯\-—–·•|/\\｜／])+[\s]*)+/u;
    const RUN_CHALLENGE_TRAILING_SEPARATOR_RE = /[：:;,；,，、.。!?！？~～…⋯\-—–·•|/\\｜／]+$/gu;

    function findRunChallengeDecoratorCloseIndex(label, open, close) {
        if (typeof label !== 'string' || !label || typeof open !== 'string' || typeof close !== 'string') {
            return -1;
        }
        if (open === close) {
            return label.indexOf(close, open.length);
        }
        let depth = 1;
        for (let index = open.length; index < label.length;) {
            if (label.startsWith(open, index)) {
                depth += 1;
                index += open.length;
                continue;
            }
            if (label.startsWith(close, index)) {
                depth -= 1;
                if (depth === 0) {
                    return index;
                }
                index += close.length;
                continue;
            }
            index += 1;
        }
        return -1;
    }

    function getRunChallengeDecoratorCloseVariants(open) {
        const closeVariants = [];
        for (const [candidateOpen, close] of RUN_CHALLENGE_DECORATOR_PAIRS) {
            if (candidateOpen === open && !closeVariants.includes(close)) {
                closeVariants.push(close);
            }
        }
        return closeVariants.sort((left, right) => right.length - left.length);
    }

    function findRepeatedRunChallengeDecoratorStackEnd(label, open) {
        if (typeof label !== 'string' || !label || typeof open !== 'string' || !open || !label.startsWith(open)) {
            return -1;
        }
        let repeatedOpenCount = 1;
        while (label.startsWith(open, repeatedOpenCount * open.length)) {
            repeatedOpenCount += 1;
        }
        if (repeatedOpenCount <= 1) {
            return -1;
        }
        const closeVariants = getRunChallengeDecoratorCloseVariants(open);
        if (closeVariants.length === 0) {
            return -1;
        }
        const leadingWidth = repeatedOpenCount * open.length;
        for (let closeIndex = leadingWidth; closeIndex < label.length; closeIndex += 1) {
            let cursor = closeIndex;
            let matchedCloseCount = 0;
            while (matchedCloseCount < repeatedOpenCount) {
                const matchedClose = closeVariants.find(close => label.startsWith(close, cursor));
                if (!matchedClose) {
                    break;
                }
                cursor += matchedClose.length;
                matchedCloseCount += 1;
            }
            if (matchedCloseCount !== repeatedOpenCount) {
                continue;
            }
            const innerText = label.slice(leadingWidth, closeIndex);
            if (isRunChallengePrefixToken(innerText)) {
                return cursor;
            }
        }
        return -1;
    }

    function stripRunChallengeSingleDecoratorPrefix(label) {
        if (typeof label !== 'string' || !label) return '';
        const attemptedRepeatedStackOpens = new Set();
        for (const [open, close] of RUN_CHALLENGE_DECORATOR_PAIRS) {
            if (!label.startsWith(open)) continue;
            if (!attemptedRepeatedStackOpens.has(open)) {
                attemptedRepeatedStackOpens.add(open);
                const repeatedStackEnd = findRepeatedRunChallengeDecoratorStackEnd(label, open);
                if (repeatedStackEnd > 0) {
                    return label.slice(repeatedStackEnd);
                }
            }
            const closeIndex = findRunChallengeDecoratorCloseIndex(label, open, close);
            if (closeIndex <= open.length) {
                continue;
            }
            const innerText = label.slice(open.length, closeIndex);
            return isRunChallengePrefixToken(innerText)
                ? label.slice(closeIndex + close.length)
                : label;
        }
        return label;
    }

    function isRunChallengePrefixToken(text) {
        const rawToken = normalizeInlineCopyWhitespace(text);
        const normalizedToken = stripRunChallengeLeadingSeparators(
            rawToken
        ).replace(RUN_CHALLENGE_TRAILING_SEPARATOR_RE, '');
        if (!normalizedToken) {
            return !!rawToken;
        }
        if (/^(?:本局\s*)?挑战$/u.test(normalizedToken) || /^本局$/u.test(normalizedToken)) {
            return true;
        }
        const strippedDecoratorToken = normalizeInlineCopyWhitespace(
            stripRunChallengeSingleDecoratorPrefix(normalizedToken)
        );
        return strippedDecoratorToken !== normalizedToken
            && (!strippedDecoratorToken || isRunChallengePrefixToken(strippedDecoratorToken));
    }

    function stripRunChallengeBracketedDecoratorPrefix(label) {
        if (typeof label !== 'string' || !label) return '';
        let strippedLabel = label;
        let previousLabel = null;
        while (strippedLabel && strippedLabel !== previousLabel) {
            previousLabel = strippedLabel;
            strippedLabel = stripRunChallengeSingleDecoratorPrefix(strippedLabel);
            strippedLabel = normalizeInlineCopyWhitespace(
                strippedLabel !== previousLabel
                    ? stripRunChallengeLeadingSeparators(strippedLabel)
                    : strippedLabel
            );
        }
        return strippedLabel;
    }

    function stripRunChallengeLeadingSeparators(label) {
        if (typeof label !== 'string' || !label) return '';
        return label.replace(RUN_CHALLENGE_LEADING_SEPARATOR_RE, '');
    }

    function normalizeRunChallengeSidebarLabel(label) {
        let normalizedLabel = normalizeInlineCopyWhitespace(label);
        if (!normalizedLabel) return '';
        let previousLabel = null;
        while (normalizedLabel && normalizedLabel !== previousLabel) {
            previousLabel = normalizedLabel;
            const strippedLabel = stripRunChallengeBracketedDecoratorPrefix(normalizedLabel)
                .replace(/^(?:本局)?挑战\s*[:：]?\s*/u, '')
                .replace(/^本局\s*[:：]?\s*/u, '')
                .replace(/^挑战\s*[:：]?\s*/u, '');
            normalizedLabel = normalizeInlineCopyWhitespace(
                strippedLabel !== normalizedLabel
                    ? stripRunChallengeLeadingSeparators(strippedLabel)
                    : strippedLabel
            );
        }
        return normalizedLabel;
    }

    function getRunChallengeSafeSidebarLabel(label) {
        return normalizeRunChallengeSidebarLabel(label) || '未知挑战';
    }

    function measureChallengeLabelWidth(text, options) {
        if (typeof text !== 'string' || !text) return 0;
        if (options && typeof options.measureLabelWidth === 'function') {
            const measuredWidth = Number(options.measureLabelWidth(text));
            if (Number.isFinite(measuredWidth) && measuredWidth > 0) {
                return measuredWidth;
            }
        }
        if (options && typeof options.measureGlyphWidth === 'function') {
            return Array.from(text).reduce((sum, glyph) => {
                const glyphWidth = Number(options.measureGlyphWidth(glyph));
                return sum + (Number.isFinite(glyphWidth) && glyphWidth > 0 ? glyphWidth : 0);
            }, 0);
        }
        return Array.from(text).reduce((sum, glyph) => {
            const codePoint = glyph.codePointAt(0);
            const isAscii = Number.isFinite(codePoint) && codePoint >= 0x20 && codePoint <= 0x7e;
            return sum + (isAscii ? 8 : 10);
        }, 0);
    }

    function pickChallengeLabelVariant(variants, options) {
        const safeVariants = Array.isArray(variants)
            ? variants.filter(text => typeof text === 'string' && text)
            : [];
        if (safeVariants.length === 0) return '';
        const maxWidth = Number(options && options.maxWidth);
        if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
            return safeVariants[0];
        }
        for (const variant of safeVariants) {
            if (measureChallengeLabelWidth(variant, options) <= maxWidth) {
                return variant;
            }
        }
        if (options && options.allowEmptyFallback) {
            return '';
        }
        return safeVariants[safeVariants.length - 1];
    }

    function formatRunChallengeRewardShortLabel(challenge) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const rewardLabel = normalizeInlineCopyWhitespace(safeChallenge.rewardLabel)
            .replace(/＋/gu, '+')
            .replace(/\+\s+/gu, '+');
        if (rewardLabel) {
            return rewardLabel;
        }
        const rewardGold = clampInt(safeChallenge.rewardGold, 0, Number.MAX_SAFE_INTEGER, 0);
        return rewardGold > 0 ? `+${rewardGold}金` : '';
    }

    function buildRunChallengeCompletedFeedbackText(challenge) {
        const rewardLabel = formatRunChallengeRewardShortLabel(challenge);
        return rewardLabel ? `挑战完成 ${rewardLabel}` : '挑战完成';
    }

    function getRunChallengeInProgressSummaryVariants(progressLabel, rewardLabel) {
        const safeProgressLabel = typeof progressLabel === 'string' ? progressLabel.trim() : '';
        if (safeProgressLabel) {
            if (rewardLabel) {
                return [`挑战 ${safeProgressLabel} · ${rewardLabel}`, `挑战 ${safeProgressLabel}`, safeProgressLabel];
            }
            return [`挑战 ${safeProgressLabel}`, safeProgressLabel];
        }
        return rewardLabel ? [`挑战进行中 · ${rewardLabel}`, '挑战进行中', '进行中'] : ['挑战进行中', '进行中'];
    }

    function getRunChallengeCompletedSummaryVariants(rewardLabel) {
        return rewardLabel ? [`挑战完成 · ${rewardLabel}`, '挑战完成', '完成'] : ['挑战完成', '完成'];
    }

    function getRunChallengeInProgressInvalidTargetVisibleFallbacks(rewardLabel, normalizedLabel) {
        return {
            compactTitle: '本局挑战：进行中',
            compactDetailVariants: getRunChallengeCompactInProgressDetailVariants(normalizedLabel, rewardLabel),
            regularDetailVariants: rewardLabel ? [`进行中  奖励:${rewardLabel}`, '进行中'] : ['进行中'],
            ultraCompactSummaryVariants: rewardLabel ? [`挑战进行中 · ${rewardLabel}`, '挑战进行中', '进行中'] : ['挑战进行中', '进行中']
        };
    }

    function getRunChallengeCompletedInvalidTargetVisibleFallbacks(rewardLabel, normalizedLabel) {
        return {
            compactTitle: '本局挑战：已完成',
            compactDetailVariants: getRunChallengeCompactCompletedDetailVariants(normalizedLabel, rewardLabel),
            regularDetailVariants: rewardLabel ? [`已完成  奖励:${rewardLabel}`, '已完成'] : ['已完成'],
            ultraCompactSummaryVariants: rewardLabel ? [`挑战完成 · ${rewardLabel}`, '挑战完成', '完成'] : ['挑战完成', '完成']
        };
    }

    function getRunChallengeUltraCompactInProgressSummaryVariants(progressLabel, rewardLabel) {
        const safeProgressLabel = typeof progressLabel === 'string' ? progressLabel.trim() : '';
        if (!safeProgressLabel) {
            return getRunChallengeInProgressInvalidTargetVisibleFallbacks(rewardLabel).ultraCompactSummaryVariants;
        }
        return getRunChallengeInProgressSummaryVariants(safeProgressLabel, rewardLabel);
    }

    function getRunChallengeUltraCompactCompletedSummaryVariants(rewardLabel) {
        return getRunChallengeCompletedSummaryVariants(rewardLabel);
    }

    function getRunChallengeUltraCompactSummaryVariants(challenge) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const target = clampInt(safeChallenge.target, 0, Number.MAX_SAFE_INTEGER, 0);
        const progress = clampInt(safeChallenge.progress, 0, target || Number.MAX_SAFE_INTEGER, 0);
        const rewardLabel = formatRunChallengeRewardShortLabel(safeChallenge);
        const progressLabel = target > 0 ? `${Math.min(progress, target)}/${target}` : '';
        // Visible ultra-compact copy stays progress/completion-first even if the body label collapses to 未知挑战.
        if (target <= 0) {
            return safeChallenge.completed
                ? getRunChallengeCompletedInvalidTargetVisibleFallbacks(rewardLabel).ultraCompactSummaryVariants
                : getRunChallengeInProgressInvalidTargetVisibleFallbacks(rewardLabel).ultraCompactSummaryVariants;
        }
        return safeChallenge.completed
            ? getRunChallengeUltraCompactCompletedSummaryVariants(rewardLabel)
            : getRunChallengeUltraCompactInProgressSummaryVariants(progressLabel, rewardLabel);
    }

    function getRunChallengeRegularDetailVariants(progressLabel, rewardLabel) {
        const safeProgressLabel = typeof progressLabel === 'string' ? progressLabel.trim() : '';
        if (!safeProgressLabel) {
            return getRunChallengeInProgressInvalidTargetVisibleFallbacks(rewardLabel).regularDetailVariants;
        }
        if (rewardLabel) {
            return [`进度:${safeProgressLabel}  奖励:${rewardLabel}`, `进度:${safeProgressLabel}`, safeProgressLabel];
        }
        return [`进度:${safeProgressLabel}`, safeProgressLabel];
    }

    function getRunChallengeRegularInProgressDetailVariants(progressLabel, rewardLabel) {
        return getRunChallengeRegularDetailVariants(progressLabel, rewardLabel);
    }

    function getRunChallengeRegularCompletedDetailVariants(progressLabel, rewardLabel) {
        const safeProgressLabel = typeof progressLabel === 'string' ? progressLabel.trim() : '';
        if (!safeProgressLabel) {
            return getRunChallengeCompletedInvalidTargetVisibleFallbacks(rewardLabel).regularDetailVariants;
        }
        return getRunChallengeRegularDetailVariants(safeProgressLabel, rewardLabel);
    }

    function getRunChallengeCompactDetailVariants(normalizedLabel, rewardLabel) {
        const safeLabel = typeof normalizedLabel === 'string' ? normalizedLabel.trim() : '';
        if (!safeLabel) return [];
        const variants = [];
        if (rewardLabel) {
            variants.push(`${safeLabel} · ${rewardLabel}`);
        }
        variants.push(safeLabel);
        const tightenedLabel = safeLabel.replace(/\s+/gu, '');
        if (tightenedLabel && tightenedLabel !== safeLabel) {
            variants.push(tightenedLabel);
        }
        return variants;
    }

    function getRunChallengeCompactInProgressDetailVariants(normalizedLabel, rewardLabel) {
        return getRunChallengeCompactDetailVariants(normalizedLabel, rewardLabel);
    }

    function getRunChallengeCompactCompletedDetailVariants(normalizedLabel, rewardLabel) {
        return getRunChallengeCompactDetailVariants(normalizedLabel, rewardLabel);
    }

    function buildRunChallengeSidebarLines(challenge, options) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const viewportTier = options && typeof options.viewportTier === 'string'
            ? options.viewportTier
            : ((options && options.ultraCompact) ? 'ultraCompact' : ((options && options.compact) ? 'compact' : 'regular'));
        const compact = viewportTier !== 'regular' || !!(options && options.compact);
        const ultraCompact = viewportTier === 'ultraCompact' || !!(options && options.ultraCompact);
        const target = clampInt(safeChallenge.target, 0, Number.MAX_SAFE_INTEGER, 0);
        const progress = clampInt(safeChallenge.progress, 0, target || Number.MAX_SAFE_INTEGER, 0);
        const rewardLabel = formatRunChallengeRewardShortLabel(safeChallenge);
        const completed = !!safeChallenge.completed;
        const normalizedLabel = getRunChallengeSafeSidebarLabel(safeChallenge.label);
        const progressLabel = target > 0 ? `${Math.min(progress, target)}/${target}` : '';
        const invalidTargetVisibleFallbacks = target <= 0
            ? (completed
                ? getRunChallengeCompletedInvalidTargetVisibleFallbacks(rewardLabel, normalizedLabel)
                : getRunChallengeInProgressInvalidTargetVisibleFallbacks(rewardLabel, normalizedLabel))
            : null;

        if (ultraCompact) {
            return [pickChallengeLabelVariant(
                getRunChallengeUltraCompactSummaryVariants(safeChallenge),
                {
                    maxWidth: Number(options && options.maxLineWidth),
                    measureLabelWidth: options && options.measureLabelWidth,
                    measureGlyphWidth: options && options.measureGlyphWidth
                }
            )];
        }

        if (compact) {
            if (completed) {
                const compactDetailLine = pickChallengeLabelVariant(
                    invalidTargetVisibleFallbacks
                        ? invalidTargetVisibleFallbacks.compactDetailVariants
                        : getRunChallengeCompactCompletedDetailVariants(normalizedLabel, rewardLabel),
                    {
                        maxWidth: Number(options && options.maxLineWidth),
                        measureLabelWidth: options && options.measureLabelWidth,
                        measureGlyphWidth: options && options.measureGlyphWidth
                    }
                );
                return [
                    invalidTargetVisibleFallbacks ? invalidTargetVisibleFallbacks.compactTitle : '本局挑战：已完成',
                    compactDetailLine
                ];
            }
            const compactDetailLine = pickChallengeLabelVariant(
                invalidTargetVisibleFallbacks
                    ? invalidTargetVisibleFallbacks.compactDetailVariants
                    : getRunChallengeCompactInProgressDetailVariants(normalizedLabel, rewardLabel),
                {
                    maxWidth: Number(options && options.maxLineWidth),
                    measureLabelWidth: options && options.measureLabelWidth,
                    measureGlyphWidth: options && options.measureGlyphWidth
                }
            );
            return [
                progressLabel ? `本局挑战 ${progressLabel}` : (invalidTargetVisibleFallbacks ? invalidTargetVisibleFallbacks.compactTitle : '本局挑战：进行中'),
                compactDetailLine
            ];
        }

        return [
            completed ? '本局挑战：已完成' : '本局挑战',
            normalizedLabel,
            pickChallengeLabelVariant(
                completed
                    ? getRunChallengeRegularCompletedDetailVariants(progressLabel, rewardLabel)
                    : getRunChallengeRegularInProgressDetailVariants(progressLabel, rewardLabel),
                {
                    maxWidth: Number(options && options.maxLineWidth),
                    measureLabelWidth: options && options.measureLabelWidth,
                    measureGlyphWidth: options && options.measureGlyphWidth
                }
            )
        ];
    }

    function buildRunChallengeSidebarBadge(challenge, options) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const viewportTier = options && typeof options.viewportTier === 'string'
            ? options.viewportTier
            : 'regular';
        const hidden = !!(options && options.hidden);
        const runModifierHidden = !!(options && options.runModifierHidden);
        if (viewportTier !== 'ultraCompact' || !hidden || !runModifierHidden) return '';
        const target = clampInt(safeChallenge.target, 0, Number.MAX_SAFE_INTEGER, 0);
        const progress = clampInt(safeChallenge.progress, 0, target || Number.MAX_SAFE_INTEGER, 0);
        // Hidden ultra-compact badges intentionally stay label-agnostic so the same
        // progress/completion fallback ladder survives even if the body label collapses to 未知挑战.
        if (safeChallenge.completed) {
            return pickChallengeLabelVariant(getRunChallengeHiddenCompletedBadgeVariants(safeChallenge), {
                maxWidth: Number(options && options.maxBadgeWidth),
                measureLabelWidth: options && options.measureLabelWidth,
                measureGlyphWidth: options && options.measureGlyphWidth,
                allowEmptyFallback: true
            });
        }
        if (target <= 0 || progress <= 0) return '';
        return pickChallengeLabelVariant(getRunChallengeHiddenInProgressBadgeVariants(safeChallenge), {
            maxWidth: Number(options && options.maxBadgeWidth),
            measureLabelWidth: options && options.measureLabelWidth,
            measureGlyphWidth: options && options.measureGlyphWidth,
            allowEmptyFallback: true
        });
    }

    function getRunChallengeInProgressBadgeVariants(challenge) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const target = clampInt(safeChallenge.target, 0, Number.MAX_SAFE_INTEGER, 0);
        const progress = clampInt(safeChallenge.progress, 0, target || Number.MAX_SAFE_INTEGER, 0);
        if (target <= 0 || progress <= 0) return [];
        const progressLabel = `${Math.min(progress, target)}/${target}`;
        const compactProgressLabel = `进${Math.min(progress, target)}`;
        return [`进${progressLabel}`, progressLabel, compactProgressLabel];
    }

    function getRunChallengeHiddenInProgressBadgeVariants(challenge) {
        // Hidden in-progress badges stay label- and reward-agnostic so the same
        // progress ladder survives unknown-label fallbacks without surfacing reward copy.
        return getRunChallengeInProgressBadgeVariants(challenge);
    }

    function getRunChallengeCompletedBadgeVariants(challenge) {
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        const rewardLabel = formatRunChallengeRewardShortLabel(safeChallenge);
        return rewardLabel ? [`完成${rewardLabel}`, '完成'] : ['完成'];
    }

    function getRunChallengeHiddenCompletedBadgeVariants(challenge) {
        // Hidden completed badges stay label-agnostic so unknown-label body fallbacks
        // do not alter the shared reward-to-complete ladder.
        return getRunChallengeCompletedBadgeVariants(challenge);
    }

    function getRunChallengeSidebarBadgeAppearance(challenge, options) {
        const text = buildRunChallengeSidebarBadge(challenge, options);
        if (!text) {
            return {
                text: '',
                fill: '',
                alpha: 1
            };
        }
        const safeChallenge = challenge && typeof challenge === 'object' ? challenge : {};
        return {
            text,
            fill: safeChallenge.completed ? '#8fb39a' : '#a8b3c7',
            alpha: safeChallenge.completed ? 0.78 : 0.72
        };
    }

    const QUICK_SLOT_SHORT_LABELS = {
        hpPotion: 'HP',
        staminaPotion: 'ST',
        cleanseTonic: '净',
        berserkerOil: '油'
    };
    const QUICK_SLOT_NOTICE_DERIVED_LABEL_MAX_WIDTH_UNITS = 6;
    const QUICK_SLOT_NOTICE_DERIVED_LABEL_MAX_MEASURED_WIDTH = 48;

    function getQuickSlotNoticeGlyphWidth(glyph) {
        if (typeof glyph !== 'string' || !glyph) return 0;
        const codePoint = glyph.codePointAt(0);
        if (!Number.isFinite(codePoint)) return 0;
        if ((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xff61 && codePoint <= 0xff9f)) {
            return 1;
        }
        return 2;
    }

    function getMeasuredQuickSlotNoticeGlyphWidth(glyph, measureLabelWidth, measurementCache) {
        const safeGlyph = typeof glyph === 'string' ? glyph : '';
        if (measurementCache instanceof Map && measurementCache.has(safeGlyph)) {
            return measurementCache.get(safeGlyph);
        }
        if (typeof measureLabelWidth === 'function') {
            const measuredWidth = Number(measureLabelWidth(glyph));
            if (Number.isFinite(measuredWidth) && measuredWidth > 0) {
                if (measurementCache instanceof Map) {
                    measurementCache.set(safeGlyph, measuredWidth);
                }
                return measuredWidth;
            }
        }
        const fallbackWidth = getQuickSlotNoticeGlyphWidth(glyph) * 8;
        if (measurementCache instanceof Map) {
            measurementCache.set(safeGlyph, fallbackWidth);
        }
        return fallbackWidth;
    }

    function clampQuickSlotNoticeLabel(label, options) {
        if (typeof label !== 'string') return '';
        const safeLabel = label.trim();
        if (!safeLabel) return '';
        const glyphs = Array.from(safeLabel);
        const measureLabelWidth = options && typeof options.measureLabelWidth === 'function'
            ? options.measureLabelWidth
            : null;
        const measurementCache = options && options.measurementCache instanceof Map
            ? options.measurementCache
            : null;
        if (measureLabelWidth) {
            let measuredWidth = 0;
            const keptGlyphs = [];
            for (const glyph of glyphs) {
                const nextWidth = getMeasuredQuickSlotNoticeGlyphWidth(glyph, measureLabelWidth, measurementCache);
                if ((measuredWidth + nextWidth) > QUICK_SLOT_NOTICE_DERIVED_LABEL_MAX_MEASURED_WIDTH) {
                    break;
                }
                keptGlyphs.push(glyph);
                measuredWidth += nextWidth;
            }
            if (keptGlyphs.length === glyphs.length) {
                return safeLabel;
            }
            return `${keptGlyphs.join('')}…`;
        }
        let widthUnits = 0;
        const keptGlyphs = [];
        for (const glyph of glyphs) {
            const nextWidth = getQuickSlotNoticeGlyphWidth(glyph);
            if ((widthUnits + nextWidth) > QUICK_SLOT_NOTICE_DERIVED_LABEL_MAX_WIDTH_UNITS) {
                break;
            }
            keptGlyphs.push(glyph);
            widthUnits += nextWidth;
        }
        if (keptGlyphs.length === glyphs.length) {
            return safeLabel;
        }
        return `${keptGlyphs.join('')}…`;
    }

    function deriveQuickSlotNoticeLabelFromName(itemName, options) {
        const safeItemName = typeof itemName === 'string'
            ? itemName.replace(/\s+/g, '').trim()
            : '';
        if (!safeItemName) return '';
        const stem = safeItemName.replace(/(药水|药剂|药|油)$/u, '');
        return clampQuickSlotNoticeLabel(stem || safeItemName, options);
    }

    function resolveQuickSlotNoticeLabel(itemKey, itemName) {
        return QUICK_SLOT_SHORT_LABELS[itemKey]
            || deriveQuickSlotNoticeLabelFromName(itemName)
            || '道具';
    }

    function buildQuickSlotItemLabel(itemKey, count) {
        if (!itemKey) return '-';
        const shortLabel = QUICK_SLOT_SHORT_LABELS[itemKey] || '道具';
        const safeCount = clampInt(count, 0, Number.MAX_SAFE_INTEGER, 0);
        return `${shortLabel} x${safeCount}`;
    }

    function getViewportTextClampX(anchorX, textWidth, viewportWidth, padding, viewportLeft) {
        const safePadding = clampInt(padding, 0, Number.MAX_SAFE_INTEGER, 10);
        const safeViewportLeft = Number.isFinite(viewportLeft) ? viewportLeft : 0;
        const safeAnchorX = Number.isFinite(anchorX) ? anchorX : (safeViewportLeft + safePadding);
        const safeTextWidth = Number.isFinite(textWidth) && textWidth > 0 ? textWidth : 0;
        const safeViewportWidth = Number.isFinite(viewportWidth) && viewportWidth > 0
            ? viewportWidth
            : (safePadding * 2) + safeTextWidth;
        const minX = safeViewportLeft + safePadding;
        const maxX = Math.max(minX, safeViewportLeft + safeViewportWidth - safeTextWidth - safePadding);
        return Math.min(Math.max(safeAnchorX, minX), maxX);
    }

    function getViewportCenteredTextClampX(anchorX, textWidth, viewportWidth, padding, viewportLeft) {
        const safePadding = clampInt(padding, 0, Number.MAX_SAFE_INTEGER, 10);
        const safeViewportLeft = Number.isFinite(viewportLeft) ? viewportLeft : 0;
        const safeTextWidth = Number.isFinite(textWidth) && textWidth > 0 ? textWidth : 0;
        const safeHalfWidth = safeTextWidth / 2;
        const safeViewportWidth = Number.isFinite(viewportWidth) && viewportWidth > 0
            ? viewportWidth
            : (safePadding * 2) + safeTextWidth;
        const safeAnchorX = Number.isFinite(anchorX)
            ? anchorX
            : (safeViewportLeft + safePadding + safeHalfWidth);
        const minX = safeViewportLeft + safePadding + safeHalfWidth;
        const maxX = Math.max(minX, safeViewportLeft + safeViewportWidth - safePadding - safeHalfWidth);
        return Math.min(Math.max(safeAnchorX, minX), maxX);
    }

    function getInventoryTooltipClampX(anchorX, tooltipWidth, viewportWidth, padding) {
        return getViewportTextClampX(anchorX, tooltipWidth, viewportWidth, padding, 0);
    }

    function clampTextToWidth(text, maxWidth, options) {
        if (typeof text !== 'string') return '';
        const safeText = text.trim();
        if (!safeText) return '';
        const safeMaxWidth = Number.isFinite(maxWidth) ? Math.max(0, maxWidth) : 0;
        if (safeMaxWidth <= 0) return '';
        const measureGlyphWidth = options && typeof options.measureGlyphWidth === 'function'
            ? options.measureGlyphWidth
            : null;
        const measurementCache = options && options.measurementCache instanceof Map
            ? options.measurementCache
            : null;
        const ellipsis = options && typeof options.ellipsis === 'string' && options.ellipsis
            ? options.ellipsis
            : '…';
        const glyphs = Array.from(safeText);
        const getGlyphWidth = (glyph) => (
            measureGlyphWidth
                ? getMeasuredQuickSlotNoticeGlyphWidth(glyph, measureGlyphWidth, measurementCache)
                : getQuickSlotNoticeGlyphWidth(glyph)
        );
        const totalWidth = glyphs.reduce((sum, glyph) => sum + getGlyphWidth(glyph), 0);
        if (totalWidth <= safeMaxWidth) {
            return safeText;
        }
        const ellipsisWidth = Array.from(ellipsis).reduce((sum, glyph) => sum + getGlyphWidth(glyph), 0);
        if (ellipsisWidth >= safeMaxWidth) {
            return ellipsis;
        }
        const availableWidth = safeMaxWidth - ellipsisWidth;
        let keptWidth = 0;
        const keptGlyphs = [];
        for (const glyph of glyphs) {
            const glyphWidth = getGlyphWidth(glyph);
            if ((keptWidth + glyphWidth) > availableWidth) {
                break;
            }
            keptGlyphs.push(glyph);
            keptWidth += glyphWidth;
        }
        if (keptGlyphs.length === 0) {
            return ellipsis;
        }
        return `${keptGlyphs.join('')}${ellipsis}`;
    }

    function clampTextLinesToWidth(lines, maxWidth, options) {
        const safeLines = Array.isArray(lines)
            ? lines
            : (typeof lines === 'string' ? lines.split('\n') : []);
        const measureGlyphWidth = options && typeof options.measureGlyphWidth === 'function'
            ? options.measureGlyphWidth
            : null;
        const measurementCache = options && options.measurementCache instanceof Map
            ? options.measurementCache
            : (measureGlyphWidth ? new Map() : null);
        return safeLines.map((line) => clampTextToWidth(line, maxWidth, {
            measureGlyphWidth,
            measurementCache,
            ellipsis: options && typeof options.ellipsis === 'string' ? options.ellipsis : undefined
        }));
    }

    function clampTextLinesToWidthAndCount(lines, maxWidth, maxLines, options) {
        const safeMaxLines = Number.isFinite(maxLines) ? Math.max(0, Math.floor(maxLines)) : 0;
        if (safeMaxLines <= 0) return [];
        const measureGlyphWidth = options && typeof options.measureGlyphWidth === 'function'
            ? options.measureGlyphWidth
            : null;
        const measurementCache = options && options.measurementCache instanceof Map
            ? options.measurementCache
            : (measureGlyphWidth ? new Map() : null);
        const ellipsis = options && typeof options.ellipsis === 'string' && options.ellipsis
            ? options.ellipsis
            : '…';
        const fittedLines = clampTextLinesToWidth(lines, maxWidth, {
            measureGlyphWidth,
            measurementCache,
            ellipsis
        });
        if (fittedLines.length <= safeMaxLines) {
            return fittedLines;
        }
        const visibleLines = fittedLines.slice(0, safeMaxLines);
        const lastVisibleLine = visibleLines[safeMaxLines - 1] || '';
        const normalizedLastVisibleLine = lastVisibleLine.endsWith(ellipsis)
            ? lastVisibleLine.slice(0, Math.max(0, lastVisibleLine.length - ellipsis.length))
            : lastVisibleLine;
        visibleLines[safeMaxLines - 1] = clampTextToWidth(`${normalizedLastVisibleLine}${ellipsis}`, maxWidth, {
            measureGlyphWidth,
            measurementCache,
            ellipsis
        });
        return visibleLines;
    }

    function buildVerticalTextStackLayout(blocks, startY) {
        const safeBlocks = Array.isArray(blocks) ? blocks : [];
        const safeStartY = Number.isFinite(startY) ? startY : 0;
        const positions = {};
        let currentY = safeStartY;
        safeBlocks.forEach((block) => {
            if (!block || typeof block.key !== 'string' || !block.key) return;
            positions[block.key] = currentY;
            const isActive = block.active !== false;
            if (!isActive) return;
            const height = Number.isFinite(block.height) ? Math.max(0, block.height) : 0;
            const gapAfter = Number.isFinite(block.gapAfter) ? Math.max(0, block.gapAfter) : 0;
            currentY += height + gapAfter;
        });
        return positions;
    }

    function buildPriorityTextStackLayout(blocks, startY, options) {
        const safeBlocks = Array.isArray(blocks)
            ? blocks.map((block) => ({ ...(block || {}) }))
            : [];
        const safeStartY = Number.isFinite(startY) ? startY : 0;
        const safeMaxBottom = options && Number.isFinite(options.maxBottom)
            ? options.maxBottom
            : Number.POSITIVE_INFINITY;
        const hiddenKeys = [];

        const computeBottom = (positions) => {
            let bottom = safeStartY;
            safeBlocks.forEach((block) => {
                if (!block || typeof block.key !== 'string' || !block.key || block.active === false) return;
                const height = Number.isFinite(block.height) ? Math.max(0, block.height) : 0;
                const top = Number.isFinite(positions[block.key]) ? positions[block.key] : safeStartY;
                bottom = Math.max(bottom, top + height);
            });
            return bottom;
        };

        let positions = buildVerticalTextStackLayout(safeBlocks, safeStartY);
        let bottom = computeBottom(positions);
        const droppableBlocks = safeBlocks
            .filter((block) => block && block.active !== false && block.droppable && typeof block.key === 'string' && block.key)
            .sort((a, b) => {
                const aPriority = Number.isFinite(a.collapsePriority) ? a.collapsePriority : 0;
                const bPriority = Number.isFinite(b.collapsePriority) ? b.collapsePriority : 0;
                return bPriority - aPriority;
            });

        while (bottom > safeMaxBottom && droppableBlocks.length > 0) {
            const droppedBlock = droppableBlocks.shift();
            if (!droppedBlock) break;
            droppedBlock.active = false;
            hiddenKeys.push(droppedBlock.key);
            positions = buildVerticalTextStackLayout(safeBlocks, safeStartY);
            bottom = computeBottom(positions);
        }

        const visibility = {};
        safeBlocks.forEach((block) => {
            if (!block || typeof block.key !== 'string' || !block.key) return;
            visibility[block.key] = block.active !== false;
        });

        return {
            positions,
            visibility,
            hiddenKeys,
            bottom
        };
    }

    function getQuickSlotAutoAssignIndex(quickSlots) {
        const safeQuickSlots = normalizeQuickSlots(quickSlots);
        const firstEmptyIndex = safeQuickSlots.findIndex(slot => !slot);
        return firstEmptyIndex >= 0 ? firstEmptyIndex : 0;
    }

    function buildQuickSlotAutoAssignNotice(slotIndex, options) {
        const safeSlotIndex = clampInt(slotIndex, 0, 3, 0);
        const didOverwrite = !!(options && options.didOverwrite);
        const assignedItemKey = options && options.assignedItemKey;
        const assignedItemName = options && options.assignedItemName;
        const replacedItemKey = options && options.replacedItemKey;
        const replacedItemName = options && options.replacedItemName;
        const measureLabelWidth = options && options.measureLabelWidth;
        const measurementCache = typeof measureLabelWidth === 'function' ? new Map() : null;
        const assignedItemDerivedLabel = QUICK_SLOT_SHORT_LABELS[assignedItemKey]
            || deriveQuickSlotNoticeLabelFromName(assignedItemName, { measureLabelWidth, measurementCache });
        const replacedItemDerivedLabel = QUICK_SLOT_SHORT_LABELS[replacedItemKey]
            || deriveQuickSlotNoticeLabelFromName(replacedItemName, { measureLabelWidth, measurementCache });
        const assignedItemShortLabel = assignedItemDerivedLabel || '道具';
        const replacedItemShortLabel = replacedItemDerivedLabel || '道具';
        const slotLabel = `快捷栏${safeSlotIndex + 1}：`;
        if (didOverwrite) {
            if (!assignedItemDerivedLabel) {
                return `${slotLabel}替换 ${replacedItemShortLabel}`;
            }
            if (assignedItemShortLabel === replacedItemShortLabel) {
                return `${slotLabel}同类 ${assignedItemShortLabel}`;
            }
            return `${slotLabel}${replacedItemShortLabel}→${assignedItemShortLabel}`;
        }
        return `${slotLabel}+${assignedItemShortLabel}`;
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
        const persistedChoiceLabel = typeof runEventRoom.selectedChoiceLabel === 'string'
            ? runEventRoom.selectedChoiceLabel.trim()
            : '';
        const persistedResolutionText = typeof runEventRoom.resolutionText === 'string'
            ? runEventRoom.resolutionText
            : '';
        const forceHealingDoubleFallback = !!runEventRoom.resolved
            && base.type === 'healing'
            && !persistedChoiceLabel
            && !persistedResolutionText;
        return {
            key: base.key,
            name: base.name,
            description: base.description,
            type: base.type,
            discovered: !!runEventRoom.discovered,
            resolved: !!runEventRoom.resolved,
            selectedChoiceKey: selectedChoice
                ? selectedChoice.key
                : (runEventRoom.resolved ? selectedChoiceKey : null),
            selectedChoiceLabel: selectedChoice
                ? (
                    persistedChoiceLabel
                        ? persistedChoiceLabel
                        : (forceHealingDoubleFallback ? '' : selectedChoice.label)
                )
                : (runEventRoom.resolved && persistedChoiceLabel ? persistedChoiceLabel : null),
            resolutionText: runEventRoom.resolved ? persistedResolutionText : ''
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

    function buildRunEventRoomChoicePreview(choice) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const label = typeof safeChoice.label === 'string' ? safeChoice.label.trim() : '';
        const route = describeRunEventChoiceRoute(safeChoice).trim();
        if (label && route) return `${label}: ${route}`;
        return label || route || '';
    }

    function buildRunEventRoomChoicePanelPreview(choice, state) {
        const basePreview = buildRunEventRoomChoicePreview(choice);
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};
        const safeState = state && typeof state === 'object' ? state : {};
        const playerMaxHp = Math.max(1, clampInt(safeState.playerMaxHp, 1, Number.MAX_SAFE_INTEGER, 100));
        const currentHp = clampInt(safeState.playerHp, 1, playerMaxHp, playerMaxHp);

        let hpDelta = 0;
        if (effect.type === 'hpForGold') {
            const ratio = Number(effect.hpCostRatio);
            const normalizedRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
            hpDelta = -Math.min(
                Math.max(0, Math.floor(currentHp * normalizedRatio)),
                Math.max(0, currentHp - 1)
            );
        } else if (effect.type === 'restoreHp' || effect.type === 'restoreHpAndCleanse') {
            const ratio = Number(effect.hpGainRatio);
            const normalizedRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
            hpDelta = Math.min(
                Math.max(0, Math.floor(playerMaxHp * normalizedRatio)),
                Math.max(0, playerMaxHp - currentHp)
            );
        }

        if (!hpDelta) return basePreview;
        return `${basePreview} · 预估生命${hpDelta > 0 ? '+' : ''}${hpDelta}`;
    }

    function getRunEventRoomChoiceAffordabilityLabel(choice, state) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};
        if (effect.type !== 'goldForItems') return '';

        const safeState = state && typeof state === 'object' ? state : {};
        const currentGold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const goldCost = clampInt(effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0);
        return currentGold >= goldCost ? '可负担' : '金币不足';
    }

    function getRunEventRoomChoiceFailureMessage(settlement) {
        const reason = settlement && typeof settlement.reason === 'string' ? settlement.reason : '';
        if (reason === 'insufficient_gold') return '金币不足，无法选择该路线';
        if (reason === 'already_resolved') return '该事件房已结算';
        if (reason === 'invalid_choice') return '该路线当前不可用';
        if (reason === 'invalid_event_room') return '事件房状态异常，请稍后重试';
        return '当前无法完成该选择';
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
            .replace(/\s*([+\-])\s*/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getRunEventRoomResolvedPrefix(type) {
        if (type === 'trade') return '交易';
        if (type === 'healing') return '治疗';
        if (type === 'riskBuff' || type === 'blessing') return '效果';
        return '已选';
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
        const resolvedPrefix = getRunEventRoomResolvedPrefix(normalizedRoom.type);
        const forceHealingDoubleFallback = normalizedRoom.resolved
            && normalizedRoom.type === 'healing'
            && !normalizedRoom.selectedChoiceLabel
            && !normalizedRoom.resolutionText;
        const resolvedChoiceLabel = normalizedRoom.selectedChoiceLabel
            || (!forceHealingDoubleFallback && selectedChoice ? selectedChoice.label : '')
            || (normalizedRoom.resolved ? '未知选项' : '');
        const visibleChoices = normalizedRoom.resolved
            ? []
            : allChoices.slice(0, 2);
        const routeLines = normalizedRoom.resolved
            ? (
                resolvedChoiceLabel
                    ? [`${resolvedPrefix}: ${resolvedChoiceLabel}`.trim()]
                    : []
            )
            : visibleChoices.map((choice) => `${choice.label}: ${describeRunEventChoiceRoute(choice)}`.trim());
        const routeSummary = routeLines.join('\n');
        const resolutionText = normalizedRoom.resolved
            ? (
                normalizedRoom.resolutionText
                    ? buildCompactRunEventResolutionText(normalizedRoom, selectedChoice)
                    : (resolvedChoiceLabel ? '结算待同步' : '')
            )
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

    function buildRunEventRoomHudLines(runEventRoom, poolOverride) {
        const summary = buildRunEventRoomHudSummary(runEventRoom, poolOverride);
        if (!summary.visible) return [];

        const lines = [
            `事件房: ${summary.name}`,
            summary.metaLabel || `${summary.typeLabel} · ${summary.statusLabel || ''}`.trim()
        ];

        if (summary.statusLabel === '已触发') {
            const selectedLine = Array.isArray(summary.routeLines) && summary.routeLines.length > 0
                ? summary.routeLines[0]
                : '';
            if (selectedLine && summary.resolutionText) {
                lines.push(`${selectedLine} · ${summary.resolutionText}`);
            } else if (selectedLine) {
                lines.push(selectedLine);
            } else if (summary.resolutionText) {
                lines.push(`结算: ${summary.resolutionText}`);
            }
            return lines;
        }

        if (Array.isArray(summary.routeLines) && summary.routeLines.length > 0) {
            lines.push(...summary.routeLines);
        } else if (summary.routeSummary) {
            lines.push(summary.routeSummary);
        }
        return lines;
    }

    function buildRunEventRoomWorldLabelRouteLine(runEventRoom, poolOverride) {
        const summary = buildRunEventRoomHudSummary(runEventRoom, poolOverride);
        if (!summary.visible || summary.statusLabel !== '已触发') return '';
        return Array.isArray(summary.routeLines) && summary.routeLines.length > 0
            ? summary.routeLines[0]
            : '';
    }

    function buildRunEventRoomWorldLabel(runEventRoom, poolOverride) {
        const persistedRoom = runEventRoom && typeof runEventRoom === 'object' ? runEventRoom : null;
        const persistedName = persistedRoom && typeof persistedRoom.name === 'string'
            ? persistedRoom.name.trim()
            : '';
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom) {
            if (!persistedName) return '';
            return persistedRoom && persistedRoom.resolved
                ? `${persistedName} · 已结算`
                : persistedName;
        }
        if (!normalizedRoom.resolved) return normalizedRoom.name;

        const selectedLine = buildRunEventRoomWorldLabelRouteLine(normalizedRoom, poolOverride);
        if (selectedLine) return `${normalizedRoom.name} · ${selectedLine}`;
        return `${normalizedRoom.name} · 已结算`;
    }

    function buildRunEventRoomPromptLabel(runEventRoom, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom) return '按F抉择';
        const prefix = getRunEventRoomResolvedPrefix(normalizedRoom.type);
        return prefix === '已选' ? '按F抉择' : `按F${prefix}`;
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

    function buildBossAttackCadenceTrace(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const attacks = Array.isArray(safe.attacks)
            ? safe.attacks
                .filter(attack => typeof attack === 'string' && attack.trim())
                .map(attack => attack.trim())
            : [];
        const majorAttacks = Array.isArray(safe.majorAttacks)
            ? safe.majorAttacks
                .filter((attack, index, list) => typeof attack === 'string' && attack.trim() && list.indexOf(attack) === index)
                .map(attack => attack.trim())
            : [];
        const bridgeAttackSet = new Set(
            Array.isArray(safe.bridgeAttacks)
                ? safe.bridgeAttacks
                    .filter(attack => typeof attack === 'string' && attack.trim())
                    .map(attack => attack.trim())
                : []
        );
        const majorAttackSet = new Set(majorAttacks);
        const majorEntries = [];

        attacks.forEach((attack, index) => {
            if (!majorAttackSet.has(attack)) return;
            if (majorEntries.some(entry => entry.attack === attack)) return;
            majorEntries.push({ attack, index });
        });

        const transitions = majorEntries.map((entry, index) => {
            const nextEntry = majorEntries[index + 1] || null;
            const bridgeAttacksInWindow = attacks.slice(entry.index + 1, nextEntry ? nextEntry.index : attacks.length);
            const bridgeStartIndex = bridgeAttacksInWindow.length > 0 ? entry.index + 1 : -1;
            const bridgeEndIndex = bridgeAttacksInWindow.length > 0 ? bridgeStartIndex + bridgeAttacksInWindow.length - 1 : -1;
            const bridgeTimeline = bridgeAttacksInWindow.map((attack, bridgeIndex) => `${bridgeStartIndex + bridgeIndex}:${attack}`);
            const offPatternAttacks = bridgeAttackSet.size > 0
                ? bridgeAttacksInWindow.filter(attack => !bridgeAttackSet.has(attack))
                : [];
            return {
                key: nextEntry ? `${entry.attack}->${nextEntry.attack}` : `${entry.attack}->loopback`,
                fromAttack: entry.attack,
                toAttack: nextEntry ? nextEntry.attack : 'loopback',
                fromIndex: entry.index,
                toIndex: nextEntry ? nextEntry.index : -1,
                bridgeStartIndex,
                bridgeEndIndex,
                bridgeCount: bridgeAttacksInWindow.length,
                bridgeAttacks: bridgeAttacksInWindow,
                bridgeTimeline,
                bridgePatternLabel: bridgeTimeline.join(' | '),
                offPatternAttacks
            };
        });

        const loopbackTransition = transitions.find(entry => entry.toAttack === 'loopback') || null;
        const previousTransitions = transitions.filter(entry => entry.toAttack !== 'loopback');
        const previousMaxBridgeCount = previousTransitions.length > 0
            ? Math.max(...previousTransitions.map(entry => entry.bridgeCount))
            : 0;
        const loopbackBridgeLead = loopbackTransition
            ? loopbackTransition.bridgeCount - previousMaxBridgeCount
            : 0;

        return {
            majorAttackOrder: majorEntries.map(entry => entry.attack),
            majorAnchors: majorEntries.map(entry => ({
                attack: entry.attack,
                index: entry.index
            })),
            transitions: transitions.map(entry => ({
                ...entry,
                bridgeAttacks: entry.bridgeAttacks.slice(),
                bridgeTimeline: entry.bridgeTimeline.slice(),
                offPatternAttacks: entry.offPatternAttacks.slice()
            })),
            loopbackBridgeLead,
            longestBridgeKey: transitions.reduce((selected, entry) => {
                if (!selected || entry.bridgeCount > selected.bridgeCount) return entry;
                return selected;
            }, null)?.key || '',
            hasOffPatternBridgeAttacks: transitions.some(entry => entry.offPatternAttacks.length > 0)
        };
    }

    function buildBossAttackCadenceReviewChecklist(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const trace = buildBossAttackCadenceTrace(safe);
        const attackLabels = safe.attackLabels && typeof safe.attackLabels === 'object'
            ? safe.attackLabels
            : {};
        const counterHints = safe.counterHints && typeof safe.counterHints === 'object'
            ? safe.counterHints
            : {};
        const sharedRecoveryMs = Math.max(0, clampInt(safe.sharedRecoveryMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const sharedRecoveryLabel = sharedRecoveryMs > 0
            ? `shared recovery≈${Math.max(1, Math.round(sharedRecoveryMs / 100) / 10)}s`
            : '';
        const bridgePaletteSource = Array.isArray(safe.bridgeAttacks) && safe.bridgeAttacks.length > 0
            ? safe.bridgeAttacks
            : trace.transitions.flatMap(entry => entry.bridgeAttacks);
        const bridgePaletteLabel = bridgePaletteSource
            .filter((attack, index, list) => typeof attack === 'string' && attack.trim() && list.indexOf(attack) === index)
            .join('/');
        const loopbackAttack = trace.majorAttackOrder[0] || '';

        const checkpoints = trace.transitions.map((entry, index) => {
            const expectedReturnAttack = entry.toAttack === 'loopback'
                ? loopbackAttack
                : entry.toAttack;
            const telegraphAttack = entry.fromAttack;
            const telegraphLabel = attackLabels[telegraphAttack] || telegraphAttack;
            const expectedReturnLabel = attackLabels[expectedReturnAttack] || expectedReturnAttack;
            const telegraphHint = counterHints[telegraphAttack] || '';
            const bridgeDescriptor = bridgePaletteLabel ? `${bridgePaletteLabel} ` : '';
            const spacingLabel = `${entry.bridgeCount}-step ${bridgeDescriptor}${entry.toAttack === 'loopback' ? 'loopback' : 'bridge'}`;
            const bridgeAttackCounts = entry.bridgeAttacks.reduce((counts, attack) => {
                if (typeof attack !== 'string' || !attack.trim()) {
                    return counts;
                }
                const normalizedAttack = attack.trim();
                counts[normalizedAttack] = (counts[normalizedAttack] || 0) + 1;
                return counts;
            }, {});
            const recordingFocusParts = [`HUD telegraph ${telegraphLabel}`];
            if (sharedRecoveryLabel) recordingFocusParts.push(sharedRecoveryLabel);
            recordingFocusParts.push(spacingLabel);
            if (expectedReturnLabel) recordingFocusParts.push(expectedReturnLabel);

            return {
                step: index + 1,
                key: entry.key,
                telegraphAttack,
                telegraphLabel,
                telegraphHint,
                expectedReturnAttack,
                expectedReturnLabel,
                sharedRecoveryMs,
                sharedRecoveryLabel,
                bridgeCount: entry.bridgeCount,
                bridgeAttackCounts,
                bridgeStartIndex: entry.bridgeStartIndex,
                bridgeEndIndex: entry.bridgeEndIndex,
                bridgeTimeline: entry.bridgeTimeline.slice(),
                bridgePatternLabel: entry.bridgePatternLabel,
                bridgePaletteLabel: bridgePaletteLabel || '',
                recordingFocusLabel: recordingFocusParts.join(' -> ')
            };
        });

        return {
            majorAttackOrder: trace.majorAttackOrder.slice(),
            sharedRecoveryMs,
            sharedRecoveryLabel,
            checkpoints
        };
    }

    function buildBossAttackCadenceArtifactBundle(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const review = buildBossAttackCadenceReviewChecklist(safe);
        const checkpointLines = review.checkpoints.map((entry, index) => {
            const suffix = entry.telegraphHint ? ` | ${entry.telegraphHint}` : '';
            return `${index + 1}. ${entry.recordingFocusLabel}${suffix}`;
        });
        const telegraphSource = safe.telegraphSnapshot && typeof safe.telegraphSnapshot === 'object'
            ? safe.telegraphSnapshot
            : {};
        const sharedRecoverySource = safe.sharedRecoverySnapshot && typeof safe.sharedRecoverySnapshot === 'object'
            ? safe.sharedRecoverySnapshot
            : {};

        return {
            review,
            checkpointLines,
            checkpointText: checkpointLines.join('\n'),
            telegraphSnapshot: {
                attackLabel: typeof telegraphSource.attackLabel === 'string' ? telegraphSource.attackLabel.trim() : '',
                counterHint: typeof telegraphSource.counterHint === 'string' ? telegraphSource.counterHint.trim() : '',
                counterWindowMs: Math.max(0, clampInt(telegraphSource.counterWindowMs, 0, Number.MAX_SAFE_INTEGER, 0)),
                counterWindowStartOffsetMs: clampInt(
                    telegraphSource.counterWindowStartOffsetMs,
                    Number.MIN_SAFE_INTEGER,
                    Number.MAX_SAFE_INTEGER,
                    0
                ),
                telegraphDurationMs: Math.max(0, clampInt(telegraphSource.telegraphDurationMs, 0, Number.MAX_SAFE_INTEGER, 0))
            },
            sharedRecoverySnapshot: {
                sharedRecoveryRemainingMs: Math.max(
                    0,
                    clampInt(sharedRecoverySource.sharedRecoveryRemainingMs, 0, Number.MAX_SAFE_INTEGER, 0)
                ),
                breatherRemaining: Math.max(
                    0,
                    clampInt(sharedRecoverySource.breatherRemaining, 0, Number.MAX_SAFE_INTEGER, 0)
                ),
                expectedReturnAttack: typeof sharedRecoverySource.expectedReturnAttack === 'string'
                    ? sharedRecoverySource.expectedReturnAttack.trim()
                    : '',
                expectedReturnLabel: typeof sharedRecoverySource.expectedReturnLabel === 'string'
                    ? sharedRecoverySource.expectedReturnLabel.trim()
                    : '',
                sharedRecoveryLabel: typeof sharedRecoverySource.sharedRecoveryLabel === 'string'
                    && sharedRecoverySource.sharedRecoveryLabel.trim()
                    ? sharedRecoverySource.sharedRecoveryLabel.trim()
                    : review.sharedRecoveryLabel
            }
        };
    }

    function buildBossAttackRhythmSummary(options) {
        const trace = buildBossAttackCadenceTrace(options);
        const transitionBridgeCounts = trace.transitions.map(entry => entry.bridgeCount);
        const maxBridgeCount = transitionBridgeCounts.length > 0 ? Math.max(...transitionBridgeCounts) : 0;
        const minBridgeCount = transitionBridgeCounts.length > 0 ? Math.min(...transitionBridgeCounts) : 0;
        const loopbackTransition = trace.transitions.find(entry => entry.toAttack === 'loopback') || null;
        const previousMaxBridgeCount = trace.transitions
            .filter(entry => entry.toAttack !== 'loopback')
            .reduce((maxCount, entry) => Math.max(maxCount, entry.bridgeCount), 0);

        return {
            majorAttackOrder: trace.majorAttackOrder.slice(),
            transitionBridgeCounts,
            transitionSummaries: trace.transitions.map(entry => ({
                key: entry.key,
                fromAttack: entry.fromAttack,
                toAttack: entry.toAttack,
                bridgeCount: entry.bridgeCount,
                bridgeAttacks: entry.bridgeAttacks.slice(),
                offPatternAttacks: entry.offPatternAttacks.slice()
            })),
            minBridgeCount,
            maxBridgeCount,
            longestBridgeKey: trace.longestBridgeKey,
            loopbackBridgeCount: loopbackTransition ? loopbackTransition.bridgeCount : 0,
            loopbackBridgeDeltaVsPreviousMax: trace.loopbackBridgeLead,
            secondLoopDensityWarning: !!loopbackTransition
                && previousMaxBridgeCount > 0
                && loopbackTransition.bridgeCount <= previousMaxBridgeCount,
            hasOffPatternBridgeAttacks: trace.hasOffPatternBridgeAttacks
        };
    }

    function formatBossTelegraphHintLabel(counterHint, options) {
        const safe = options && typeof options === 'object' ? options : {};
        const hintLabel = typeof counterHint === 'string' ? counterHint.trim() : '';
        if (!hintLabel) return '';

        if (!safe.counterWindowTailAfterglowActive) {
            return hintLabel;
        }

        const prefixMatch = /^(反制提示|反制)\s*:\s*/u.exec(hintLabel);
        if (!prefixMatch) {
            return hintLabel;
        }

        const hintBody = hintLabel.slice(prefixMatch[0].length).trim();
        if (!hintBody) {
            return '';
        }

        const prefersRecoveryLabel = /(收束后|结束后|之后|再|间隙|找本体|贴近|反打|输出)/u.test(hintBody);
        return `${prefersRecoveryLabel ? '收束后处理' : '闪避提示'}: ${hintBody}`;
    }

    function buildBossTelegraphHudSummary(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const attackLabel = typeof safe.attackLabel === 'string' ? safe.attackLabel.trim() : '';
        const attackTypeLabel = typeof safe.attackTypeLabel === 'string' ? safe.attackTypeLabel.trim() : '';
        const counterHint = typeof safe.counterHint === 'string' ? safe.counterHint.trim() : '';
        const counterWindowMs = Math.max(0, clampInt(safe.counterWindowMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const counterWindowStartOffsetMs = Math.max(0, clampInt(safe.counterWindowStartOffsetMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const telegraphDurationMs = Math.max(1, clampInt(safe.telegraphDurationMs, 1, Number.MAX_SAFE_INTEGER, 1));
        const remainingMs = Math.max(0, clampInt(safe.remainingMs, 0, Number.MAX_SAFE_INTEGER, 0));
        const counterWindowStartMarkerVisible = counterWindowMs > 0
            && counterWindowStartOffsetMs > 0
            && counterWindowStartOffsetMs < telegraphDurationMs;
        const counterWindowEndMs = counterWindowStartOffsetMs + counterWindowMs;
        const counterWindowOverflowMs = Math.max(0, counterWindowStartOffsetMs + counterWindowMs - telegraphDurationMs);
        const counterWindowClosureMarkerVisible = counterWindowMs > 0
            && counterWindowStartOffsetMs === 0
            && counterWindowEndMs < telegraphDurationMs;
        const counterWindowTailAfterglowVisible = counterWindowClosureMarkerVisible;
        const counterWindowSpanVisible = counterWindowMs > 0
            && counterWindowStartOffsetMs > 0
            && counterWindowEndMs < telegraphDurationMs;
        const counterWindowSpanMs = counterWindowSpanVisible ? counterWindowMs : 0;
        const counterWindowTailAfterglowMs = counterWindowTailAfterglowVisible
            ? Math.max(0, telegraphDurationMs - counterWindowEndMs)
            : 0;
        const counterWindowTailAfterglowActive = counterWindowTailAfterglowVisible
            && remainingMs <= counterWindowTailAfterglowMs;
        const attackLabelMuted = counterWindowTailAfterglowActive;
        const counterWindowLabelMuted = counterWindowTailAfterglowActive;
        const hintLabel = formatBossTelegraphHintLabel(counterHint, {
            counterWindowTailAfterglowActive
        });
        const hintLabelMuted = counterWindowTailAfterglowActive
            && hintLabel !== counterHint
            && !!hintLabel;
        const progressFillAlpha = attackLabelMuted && counterWindowLabelMuted && hintLabelMuted
            ? 0.62
            : 0.9;
        const progressRatio = clampRatio(remainingMs / telegraphDurationMs, 0);
        const currentCountdownHeadMarkerVisible = counterWindowTailAfterglowActive
            && progressFillAlpha < 0.9
            && progressRatio > 0;
        const currentCountdownHeadMarkerLateGlowVisible = currentCountdownHeadMarkerVisible
            && remainingMs > 0
            && remainingMs < 220;
        const currentCountdownHeadMarkerLateGlowTrimmed = currentCountdownHeadMarkerLateGlowVisible
            && remainingMs < 80;
        const currentCountdownHeadMarkerLateGlowContained = currentCountdownHeadMarkerLateGlowTrimmed
            && remainingMs < 40;
        const currentCountdownHeadMarkerInnerCoreFocused = currentCountdownHeadMarkerVisible
            && remainingMs > 0
            && remainingMs < 120;
        const currentCountdownHeadMarkerInnerCoreHeightTrimmed = currentCountdownHeadMarkerInnerCoreFocused
            && remainingMs < 20;
        const currentCountdownHeadMarkerInnerCoreAlphaMuted = currentCountdownHeadMarkerInnerCoreHeightTrimmed
            && remainingMs < 2;
        const currentCountdownHeadMarkerFinalWidthTrimmed = currentCountdownHeadMarkerInnerCoreAlphaMuted;
        const currentCountdownHeadMarkerLateGlowFinalWidthTrimmed = currentCountdownHeadMarkerLateGlowContained
            && currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerHeightTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerAlphaMuted = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCapTrimmed = currentCountdownHeadMarkerInnerCoreHeightTrimmed
            && remainingMs < 10;
        const currentCountdownHeadMarkerShellAlphaMuted = currentCountdownHeadMarkerShellCapTrimmed
            && remainingMs < 5;
        const currentCountdownHeadMarkerWarmFlashDurationMs = currentCountdownHeadMarkerVisible ? 120 : 0;

        if (!attackLabel) {
            return {
                visible: false,
                attackLabel: '',
                typeLabel: '',
                counterWindowLabel: '',
                hintLabel: '',
                progressRatio: 0,
                progressFillAlpha: 0.9,
                currentCountdownHeadMarkerVisible: false,
                currentCountdownHeadMarkerRatio: 0,
                currentCountdownHeadMarkerLateGlowVisible: false,
                currentCountdownHeadMarkerLateGlowTrimmed: false,
                currentCountdownHeadMarkerLateGlowContained: false,
                currentCountdownHeadMarkerLateGlowFinalWidthTrimmed: false,
                currentCountdownHeadMarkerLateGlowInnerHeightTrimmed: false,
                currentCountdownHeadMarkerLateGlowInnerAlphaMuted: false,
                currentCountdownHeadMarkerInnerCoreFocused: false,
                currentCountdownHeadMarkerInnerCoreHeightTrimmed: false,
                currentCountdownHeadMarkerInnerCoreAlphaMuted: false,
                currentCountdownHeadMarkerFinalWidthTrimmed: false,
                currentCountdownHeadMarkerShellCapTrimmed: false,
                currentCountdownHeadMarkerShellAlphaMuted: false,
                currentCountdownHeadMarkerWarmFlashDurationMs: 0,
                counterWindowStartMarkerVisible: false,
                counterWindowStartMarkerRatio: 0,
                counterWindowTailMarkerVisible: false,
                counterWindowOverflowMs: 0,
                counterWindowClosureMarkerVisible: false,
                counterWindowClosureMarkerRatio: 0,
                counterWindowTailAfterglowVisible: false,
                counterWindowTailAfterglowActive: false,
                counterWindowTailAfterglowStartRatio: 0,
                counterWindowTailAfterglowWidthRatio: 0,
                attackLabelMuted: false,
                counterWindowLabelMuted: false,
                hintLabelMuted: false,
                counterWindowSpanVisible: false,
                counterWindowSpanStartRatio: 0,
                counterWindowSpanWidthRatio: 0
            };
        }

        return {
            visible: true,
            attackLabel,
            typeLabel: attackTypeLabel ? `类型 ${attackTypeLabel}` : '',
            counterWindowLabel: counterWindowMs > 0
                ? (counterWindowTailAfterglowActive
                    ? '已收束提示'
                    : `反制窗口 ${Math.max(1, Math.round(counterWindowMs / 100) / 10)}s`)
                : '',
            hintLabel,
            progressRatio,
            progressFillAlpha,
            currentCountdownHeadMarkerVisible,
            currentCountdownHeadMarkerRatio: currentCountdownHeadMarkerVisible ? progressRatio : 0,
            currentCountdownHeadMarkerLateGlowVisible,
            currentCountdownHeadMarkerLateGlowTrimmed,
            currentCountdownHeadMarkerLateGlowContained,
            currentCountdownHeadMarkerLateGlowFinalWidthTrimmed,
            currentCountdownHeadMarkerLateGlowInnerHeightTrimmed,
            currentCountdownHeadMarkerLateGlowInnerAlphaMuted,
            currentCountdownHeadMarkerInnerCoreFocused,
            currentCountdownHeadMarkerInnerCoreHeightTrimmed,
            currentCountdownHeadMarkerInnerCoreAlphaMuted,
            currentCountdownHeadMarkerFinalWidthTrimmed,
            currentCountdownHeadMarkerShellCapTrimmed,
            currentCountdownHeadMarkerShellAlphaMuted,
            currentCountdownHeadMarkerWarmFlashDurationMs,
            counterWindowStartMarkerVisible,
            counterWindowStartMarkerRatio: counterWindowStartMarkerVisible
                ? clampRatio(counterWindowStartOffsetMs / telegraphDurationMs, 0)
                : 0,
            counterWindowTailMarkerVisible: counterWindowOverflowMs > 0,
            counterWindowOverflowMs,
            counterWindowClosureMarkerVisible,
            counterWindowClosureMarkerRatio: counterWindowClosureMarkerVisible
                ? clampRatio(counterWindowEndMs / telegraphDurationMs, 0)
                : 0,
            counterWindowTailAfterglowVisible,
            counterWindowTailAfterglowActive,
            counterWindowTailAfterglowStartRatio: counterWindowTailAfterglowVisible
                ? clampRatio(counterWindowEndMs / telegraphDurationMs, 0)
                : 0,
            counterWindowTailAfterglowWidthRatio: counterWindowTailAfterglowVisible
                ? clampRatio(counterWindowTailAfterglowMs / telegraphDurationMs, 0)
                : 0,
            attackLabelMuted,
            counterWindowLabelMuted,
            hintLabelMuted,
            counterWindowSpanVisible,
            counterWindowSpanStartRatio: counterWindowSpanVisible
                ? clampRatio(counterWindowStartOffsetMs / telegraphDurationMs, 0)
                : 0,
            counterWindowSpanWidthRatio: counterWindowSpanVisible
                ? clampRatio(counterWindowSpanMs / telegraphDurationMs, 0)
                : 0
        };
    }

    function buildBossTelegraphTextLayout(options) {
        const safe = options && typeof options === 'object' ? options : {};
        const telegraphWidth = Number.isFinite(safe.telegraphWidth) ? Math.max(0, safe.telegraphWidth) : 0;
        const mainText = typeof safe.mainText === 'string' ? safe.mainText.trim() : '';
        const windowText = typeof safe.windowText === 'string' ? safe.windowText.trim() : '';
        const hintText = typeof safe.hintText === 'string' ? safe.hintText.trim() : '';
        const measureTextWidth = typeof safe.measureTextWidth === 'function'
            ? safe.measureTextWidth
            : ((text) => (typeof text === 'string' ? text.length * 8 : 0));
        const inlineWindowMaxWidth = windowText ? Math.min(112, telegraphWidth) : 0;
        const inlineMainMaxWidth = windowText
            ? Math.max(0, telegraphWidth - inlineWindowMaxWidth - 8)
            : telegraphWidth;
        const mainWidth = mainText ? Math.max(0, measureTextWidth(mainText, 'bossTelegraphMain')) : 0;
        const windowWidth = windowText ? Math.max(0, measureTextWidth(windowText, 'bossTelegraphWindow')) : 0;
        const stacked = !!(
            hintText
            && windowText
            && telegraphWidth > 0
            && (mainWidth > inlineMainMaxWidth || windowWidth > inlineWindowMaxWidth)
        );

        return {
            stacked,
            lineCount: stacked && windowText ? 2 : 1,
            mainMaxWidth: stacked ? telegraphWidth : (inlineMainMaxWidth || telegraphWidth),
            windowMaxWidth: stacked ? telegraphWidth : inlineWindowMaxWidth,
            mainYOffset: -4,
            windowYOffset: stacked ? 8 : -4,
            hintYOffset: stacked ? 28 : 16,
            windowX: stacked ? 10 : telegraphWidth,
            windowOriginX: stacked ? 0 : 1,
            windowAccentVisible: stacked && !!windowText,
            windowAccentYOffset: stacked ? 5 : 0,
            windowAccentHeight: stacked ? 14 : 0
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
        resolveKeyboardAimState,
        formatAimDirectionLabel,
        buildCombatActionReadiness,
        buildPlayerHudLayout,
        buildCombatActionHudLayout,
        buildCombatActionHudSegments,
        buildCombatActionHudSummary,
        formatRunChallengeRewardShortLabel,
        buildRunChallengeCompletedFeedbackText,
        getRunChallengeSafeSidebarLabel,
        getRunChallengeInProgressInvalidTargetVisibleFallbacks,
        getRunChallengeCompletedInvalidTargetVisibleFallbacks,
        getRunChallengeUltraCompactSummaryVariants,
        getRunChallengeUltraCompactInProgressSummaryVariants,
        getRunChallengeUltraCompactCompletedSummaryVariants,
        getRunChallengeRegularInProgressDetailVariants,
        getRunChallengeRegularCompletedDetailVariants,
        getRunChallengeCompactInProgressDetailVariants,
        getRunChallengeCompactCompletedDetailVariants,
        buildRunChallengeSidebarLines,
        buildRunChallengeSidebarBadge,
        getRunChallengeInProgressBadgeVariants,
        getRunChallengeHiddenInProgressBadgeVariants,
        getRunChallengeCompletedBadgeVariants,
        getRunChallengeHiddenCompletedBadgeVariants,
        getRunChallengeSidebarBadgeAppearance,
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
        getRunModifierHeadingBadgeLayout,
        getRunModifierHeadingPresentation,
        buildVerticalTextStackLayout,
        buildPriorityTextStackLayout,
        getQuickSlotAutoAssignIndex,
        normalizeSaveData,
        serializeSaveData,
        deserializeSaveData,
        getStatusEffectDef,
        computeStatusTickDamage,
        resolveConsumableUse,
        buildStatusHudSummary,
        advanceBossHpAfterimage,
        buildBossAttackCadenceTrace,
        buildBossAttackCadenceReviewChecklist,
        buildBossAttackCadenceArtifactBundle,
        buildBossAttackRhythmSummary,
        buildBossTelegraphHudSummary,
        buildBossTelegraphTextLayout,
        buildBossPhaseHudSummary,
        buildBossStatusHighlightSummary,
        getRunModifierByKey,
        normalizeRunModifiers,
        pickRunModifiers,
        buildRunModifierEffects,
        buildRunEventRoomEffects,
        buildRunEventRoomChoicePreview,
        buildRunEventRoomChoicePanelPreview,
        getRunEventRoomChoiceAffordabilityLabel,
        getRunEventRoomChoiceFailureMessage,
        buildRunEventRoomHudSummary,
        buildRunEventRoomHudLines,
        buildRunEventRoomWorldLabelRouteLine,
        buildRunEventRoomWorldLabel,
        buildRunEventRoomPromptLabel,
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
