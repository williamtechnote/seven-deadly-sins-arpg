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
        playerLowHpDamageMultiplier: 1,
        playerLowHpThresholdRatio: 0,
        playerHighHpDamageTakenMultiplier: 1,
        playerHighHpThresholdRatio: 0,
        playerBurnStatusDurationMultiplier: 1,
        playerBurnStatusDamageMultiplier: 1,
        playerBleedStatusDurationMultiplier: 1,
        playerBleedStatusDamageMultiplier: 1,
        playerSlowStatusDurationMultiplier: 1,
        playerDamageVsSlowedMultiplier: 1,
        goldDropMultiplier: 1,
        extraDropRateMultiplier: 1,
        playerStaminaRegenMultiplier: 1,
        playerSpecialCooldownMultiplier: 1,
        playerAttackCooldownMultiplier: 1,
        playerMeleeAttackCooldownMultiplier: 1,
        playerDodgeCooldownMultiplier: 1,
        playerDodgeStaminaCostMultiplier: 1,
        playerRangedSpecialCooldownMultiplier: 1,
        playerAttackHitStaminaGain: 0,
        playerAttackHitSpecialCooldownReductionMs: 0,
        playerPostDodgeAttackDamageMultiplier: 1,
        playerPostDodgeAttackWindowMs: 0,
        playerPostDodgeSpecialDamageMultiplier: 1,
        playerPostDodgeSpecialWindowMs: 0,
        playerSpecialHitDodgeCooldownReductionMs: 0,
        playerSpecialHitStaminaGain: 0
    };

    const ADDITIVE_RUN_EFFECT_KEYS = new Set([
        'playerLowHpThresholdRatio',
        'playerHighHpThresholdRatio',
        'playerAttackHitStaminaGain',
        'playerPostDodgeSpecialWindowMs',
        'playerPostDodgeAttackWindowMs',
        'playerAttackHitSpecialCooldownReductionMs',
        'playerSpecialHitDodgeCooldownReductionMs',
        'playerSpecialHitStaminaGain'
    ]);

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
        },
        {
            key: 'combatDisciplineShrine',
            name: '战技圣坛',
            description: '选择更凶狠的普攻节奏，或更轻快的闪避经济',
            type: 'blessing',
            choices: [
                {
                    key: 'flurryLesson',
                    label: '连斩修习',
                    description: '本局普攻冷却 -18%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerAttackCooldownMultiplier: 0.82
                        }
                    }
                },
                {
                    key: 'ghostStepLesson',
                    label: '游步修习',
                    description: '本局闪避冷却 -20%，闪避体力消耗 -18%',
                    effect: {
                        type: 'runEffectBuff',
                        runEffects: {
                            playerDodgeCooldownMultiplier: 0.8,
                            playerDodgeStaminaCostMultiplier: 0.82
                        }
                    }
                }
            ]
        },
        {
            key: 'weaponRoutingShrine',
            name: '武备圣坛',
            description: '选择把路线压进近战压阵，或导向远程离弦节奏',
            type: 'blessing',
            choices: [
                {
                    key: 'vanguardLesson',
                    label: '压阵修习',
                    description: '本局近战武器普攻冷却 -18%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '近战武器普攻冷却-18%',
                        resolutionText: '近战武器普攻冷却 -18%',
                        runEffects: {
                            playerMeleeAttackCooldownMultiplier: 0.82
                        }
                    }
                },
                {
                    key: 'longshotLesson',
                    label: '离弦修习',
                    description: '本局远程武器特攻冷却 -22%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '远程武器特攻冷却-22%',
                        resolutionText: '远程武器特攻冷却 -22%',
                        runEffects: {
                            playerRangedSpecialCooldownMultiplier: 0.78
                        }
                    }
                }
            ]
        },
        {
            key: 'riskRewardShrine',
            name: '命途圣坛',
            description: '选择把血线压进绝境爆发，或守住高血量的稳态减伤',
            type: 'blessing',
            choices: [
                {
                    key: 'desperationLesson',
                    label: '绝境修习',
                    description: '本局生命低于 45% 时，伤害 +40%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '生命<45%时伤害+40%',
                        resolutionText: '生命低于 45% 时伤害 +40%',
                        runEffects: {
                            playerLowHpDamageMultiplier: 1.4,
                            playerLowHpThresholdRatio: 0.45
                        }
                    }
                },
                {
                    key: 'composureLesson',
                    label: '守心修习',
                    description: '本局生命高于 70% 时，承伤 -18%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '生命>70%时承伤-18%',
                        resolutionText: '生命高于 70% 时承伤 -18%',
                        runEffects: {
                            playerHighHpDamageTakenMultiplier: 0.82,
                            playerHighHpThresholdRatio: 0.7
                        }
                    }
                }
            ]
        },
        {
            key: 'statusRoutingShrine',
            name: '烙痕圣坛',
            description: '选择把特攻压进灼烧路线，或导向流血路线的异常状态强化',
            type: 'blessing',
            choices: [
                {
                    key: 'emberLesson',
                    label: '余烬修习',
                    description: '本局灼烧持续时间 +45%，灼烧伤害 +30%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '灼烧持续时间+45%, 灼烧伤害+30%',
                        resolutionText: '灼烧持续时间 +45%，灼烧伤害 +30%',
                        runEffects: {
                            playerBurnStatusDurationMultiplier: 1.45,
                            playerBurnStatusDamageMultiplier: 1.3
                        }
                    }
                },
                {
                    key: 'bloodtraceLesson',
                    label: '血痕修习',
                    description: '本局流血持续时间 +40%，流血伤害 +25%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '流血持续时间+40%, 流血伤害+25%',
                        resolutionText: '流血持续时间 +40%，流血伤害 +25%',
                        runEffects: {
                            playerBleedStatusDurationMultiplier: 1.4,
                            playerBleedStatusDamageMultiplier: 1.25
                        }
                    }
                }
            ]
        },
        {
            key: 'controlRoutingShrine',
            name: '镇压圣坛',
            description: '选择把锤类特攻压成更长减速，或把受控目标转成更强爆发兑现',
            type: 'blessing',
            choices: [
                {
                    key: 'crushingLesson',
                    label: '镇步修习',
                    description: '本局减速持续时间 +45%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '减速持续时间+45%',
                        resolutionText: '减速持续时间 +45%',
                        runEffects: {
                            playerSlowStatusDurationMultiplier: 1.45
                        }
                    }
                },
                {
                    key: 'executionLesson',
                    label: '破势修习',
                    description: '本局对减速目标伤害 +28%，Boss 破招窗口中的减速目标会进入终结兑现',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '对减速目标伤害+28%, Boss破招窗口终结',
                        resolutionText: '对减速目标伤害 +28%，Boss 破招窗口中的减速目标会进入终结兑现',
                        runEffects: {
                            playerDamageVsSlowedMultiplier: 1.28
                        }
                    }
                }
            ]
        },
        {
            key: 'combatFlowShrine',
            name: '战势圣坛',
            description: '选择把命中转成续航，或把闪避转成短时爆发',
            type: 'blessing',
            choices: [
                {
                    key: 'breathingLesson',
                    label: '回息修习',
                    description: '本局普攻命中回体 +4',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '普攻命中回体+4',
                        resolutionText: '普攻命中回体 +4',
                        runEffects: {
                            playerAttackHitStaminaGain: 4
                        }
                    }
                },
                {
                    key: 'momentumLesson',
                    label: '借势修习',
                    description: '本局闪避后 1.6s 内特攻伤害 +35%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '闪避后1.6s内特攻伤害+35%',
                        resolutionText: '闪避后 1.6s 内特攻伤害 +35%',
                        runEffects: {
                            playerPostDodgeSpecialDamageMultiplier: 1.35,
                            playerPostDodgeSpecialWindowMs: 1600
                        }
                    }
                }
            ]
        },
        {
            key: 'comboLinkShrine',
            name: '连携圣坛',
            description: '选择把普攻串进特攻节奏，或把特攻命中转回闪避机动',
            type: 'blessing',
            choices: [
                {
                    key: 'sharpeningLesson',
                    label: '催锋修习',
                    description: '本局普攻命中特攻冷却 -200ms',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '普攻命中特攻冷却-200ms',
                        resolutionText: '普攻命中特攻冷却 -200ms',
                        runEffects: {
                            playerAttackHitSpecialCooldownReductionMs: 200
                        }
                    }
                },
                {
                    key: 'reversalStepLesson',
                    label: '回身修习',
                    description: '本局特攻命中闪避冷却 -300ms',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '特攻命中闪避冷却-300ms',
                        resolutionText: '特攻命中闪避冷却 -300ms',
                        runEffects: {
                            playerSpecialHitDodgeCooldownReductionMs: 300
                        }
                    }
                }
            ]
        },
        {
            key: 'counterattackShrine',
            name: '反击圣坛',
            description: '选择把闪避转成追猎普攻，或把特攻命中转成体力回流',
            type: 'blessing',
            choices: [
                {
                    key: 'pursuitLesson',
                    label: '追猎修习',
                    description: '本局闪避后 1.4s 内普攻伤害 +28%',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '闪避后1.4s内普攻伤害+28%',
                        resolutionText: '闪避后 1.4s 内普攻伤害 +28%',
                        runEffects: {
                            playerPostDodgeAttackDamageMultiplier: 1.28,
                            playerPostDodgeAttackWindowMs: 1400
                        }
                    }
                },
                {
                    key: 'focusLesson',
                    label: '调息修习',
                    description: '本局特攻命中回体 +6',
                    effect: {
                        type: 'runEffectBuff',
                        routeSummary: '特攻命中回体+6',
                        resolutionText: '特攻命中回体 +6',
                        runEffects: {
                            playerSpecialHitStaminaGain: 6
                        }
                    }
                }
            ]
        }
    ];

    const RUN_EVENT_ENCOUNTER_PROFILES = Object.freeze({
        breather: Object.freeze({
            key: 'breather',
            previewLabel: '下间缓冲',
            encounterLabel: '缓冲战',
            enemySpeedMultiplier: 0.88,
            enemyHpMultiplier: 0.9,
            enemyGoldMultiplier: 1
        }),
        pressure: Object.freeze({
            key: 'pressure',
            previewLabel: '下间高压',
            encounterLabel: '高压战',
            enemySpeedMultiplier: 1.12,
            enemyHpMultiplier: 1.1,
            enemyGoldMultiplier: 1
        }),
        windfall: Object.freeze({
            key: 'windfall',
            previewLabel: '下间淘金',
            encounterLabel: '淘金战',
            enemySpeedMultiplier: 1.05,
            enemyHpMultiplier: 1,
            enemyGoldMultiplier: 1.5
        })
    });

    const RUN_EVENT_EXPLICIT_PROFILE_KEYS = Object.freeze({
        vanguardLesson: 'pressure',
        bloodtraceLesson: 'pressure',
        flurryLesson: 'pressure',
        momentumLesson: 'pressure',
        sharpeningLesson: 'pressure',
        longshotLesson: 'windfall',
        executionLesson: 'windfall',
        pursuitLesson: 'windfall',
        emberLesson: 'breather',
        ghostStepLesson: 'breather',
        crushingLesson: 'breather',
        breathingLesson: 'breather',
        reversalStepLesson: 'breather',
        focusLesson: 'breather'
    });

    const RUN_EVENT_BASELINE_ROUTE_FEEDBACK = Object.freeze({
        renewalPrayer: Object.freeze({
            profileKey: 'breather',
            echo: '复苏回拍',
            sourceCue: '复苏回拍',
            sourceCueMoment: 'stabilize'
        }),
        tempoPrayer: Object.freeze({
            profileKey: 'pressure',
            echo: '迅击抢拍',
            sourceCue: '迅击抢拍',
            sourceCueMoment: 'engage'
        }),
        highStakeWager: Object.freeze({
            profileKey: 'windfall',
            echo: '豪赌追赏',
            sourceCue: '豪赌追赏',
            sourceCueMoment: 'bounty'
        }),
        carefulWager: Object.freeze({
            profileKey: 'windfall',
            echo: '稳押收赏',
            sourceCue: '稳押收赏',
            sourceCueMoment: 'bounty'
        }),
        fieldTonic: Object.freeze({
            profileKey: 'breather',
            echo: '净包稳场',
            sourceCue: '净包稳场',
            sourceCueMoment: 'stabilize'
        }),
        berserkerKit: Object.freeze({
            profileKey: 'pressure',
            echo: '狂油抢势',
            sourceCue: '狂油抢势',
            sourceCueMoment: 'engage'
        }),
        flurryLesson: Object.freeze({
            profileKey: 'pressure',
            echo: '连斩抢拍',
            sourceCue: '连斩抢拍',
            sourceCueMoment: 'engage'
        }),
        ghostStepLesson: Object.freeze({
            profileKey: 'breather',
            echo: '游步整拍',
            sourceCue: '游步整拍',
            sourceCueMoment: 'stabilize'
        }),
        crushingLesson: Object.freeze({
            profileKey: 'breather',
            echo: '镇步控场',
            sourceCue: '镇步控场',
            sourceCueMoment: 'stabilize'
        }),
        executionLesson: Object.freeze({
            profileKey: 'windfall',
            echo: '破势追杀',
            sourceCue: '破势追杀',
            sourceCueMoment: 'bounty'
        }),
        breathingLesson: Object.freeze({
            profileKey: 'breather',
            echo: '回息稳场',
            sourceCue: '回息稳场',
            sourceCueMoment: 'stabilize'
        }),
        momentumLesson: Object.freeze({
            profileKey: 'pressure',
            echo: '借势重击',
            sourceCue: '借势重击',
            sourceCueMoment: 'engage'
        }),
        sharpeningLesson: Object.freeze({
            profileKey: 'pressure',
            echo: '催锋连段',
            sourceCue: '催锋连段',
            sourceCueMoment: 'engage'
        }),
        reversalStepLesson: Object.freeze({
            profileKey: 'breather',
            echo: '回身整拍',
            sourceCue: '回身整拍',
            sourceCueMoment: 'stabilize'
        }),
        pursuitLesson: Object.freeze({
            profileKey: 'windfall',
            echo: '追猎追赏',
            sourceCue: '追猎追赏',
            sourceCueMoment: 'bounty'
        }),
        focusLesson: Object.freeze({
            profileKey: 'breather',
            echo: '调息回线',
            sourceCue: '调息回线',
            sourceCueMoment: 'stabilize'
        })
    });

    const WEAPON_STATUS_EFFECTS = {
        sword: { key: 'bleed' },
        dualBlades: { key: 'bleed' },
        hammer: { key: 'slow' },
        bow: { key: 'bleed' },
        staff: { key: 'burn' }
    };

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
        lastRunSummary: null,
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
            lastRunSummary: null,
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

    function normalizeLastRunSummary(summary) {
        if (!summary || typeof summary !== 'object') return null;
        const bossLabel = typeof summary.bossLabel === 'string' ? summary.bossLabel.trim() : '';
        const routeRecap = typeof summary.routeRecap === 'string' ? summary.routeRecap.trim() : '';
        const choiceLabel = typeof summary.choiceLabel === 'string' ? summary.choiceLabel.trim() : '';
        const recommendationReason = typeof summary.recommendationReason === 'string'
            ? summary.recommendationReason.trim()
            : '';
        if (!bossLabel && !routeRecap && !choiceLabel && !recommendationReason) return null;
        return {
            bossLabel,
            routeRecap,
            choiceLabel,
            recommendationReason
        };
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
        const attackStatusPrefix = typeof safe.attackStatusLabel === 'string' && safe.attackStatusLabel.trim()
            ? `${safe.attackStatusLabel.trim()} `
            : '';
        const specialStatusPrefix = typeof safe.specialStatusLabel === 'string' && safe.specialStatusLabel.trim()
            ? `${safe.specialStatusLabel.trim()} `
            : '';
        const dodgeStatusPrefix = typeof safe.dodgeStatusLabel === 'string' && safe.dodgeStatusLabel.trim()
            ? `${safe.dodgeStatusLabel.trim()} `
            : '';
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
                { key: 'attack', text: `普攻 U: 翻滚中 -> ${attackStatusPrefix}${attackPreviewState.label}`, isReady: false },
                { key: 'special', text: `特攻 O: 翻滚中 -> ${specialStatusPrefix}${specialPreviewState.label}`, isReady: false },
                { key: 'dodge', text: `闪避 Space: 翻滚中 -> ${dodgeStatusPrefix}${dodgePreviewState.label}`, isReady: false }
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
            { key: 'attack', text: `普攻 U: ${attackStatusPrefix}${attackState.label}`, isReady: attackState.isReady },
            { key: 'special', text: `特攻 O: ${specialStatusPrefix}${specialState.label}`, isReady: specialState.isReady },
            { key: 'dodge', text: `闪避 Space: ${dodgeStatusPrefix}${dodgeState.label}`, isReady: dodgeState.isReady }
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

    function getStaminaPayoffPulsePresentation(now, activeUntil) {
        const safeNow = Number(now) || 0;
        const safeActiveUntil = Number(activeUntil) || 0;
        const remainingMs = Math.max(0, safeActiveUntil - safeNow);
        if (remainingMs <= 0) {
            return {
                active: false,
                fillColor: null,
                textColor: null,
                overlayColor: null,
                overlayAlpha: 0,
                overlayExtraWidth: 0,
                overlayExtraHeight: 0
            };
        }

        const normalizedRemaining = Math.min(1, remainingMs / 220);
        const overlayStrength = Math.pow(normalizedRemaining, 0.72);
        return {
            active: true,
            fillColor: 0xE8FF9A,
            textColor: '#fff6c7',
            overlayColor: 0xFFF4AE,
            overlayAlpha: Number((0.18 + 0.42 * overlayStrength).toFixed(3)),
            overlayExtraWidth: Math.max(2, Math.round(10 * overlayStrength)),
            overlayExtraHeight: Math.max(1, Math.round(4 * overlayStrength))
        };
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

    const QUICK_SLOT_NOTICE_LABEL_OVERRIDES = {
        cleanseTonic: '净化',
        berserkerOil: '狂战'
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
        return QUICK_SLOT_NOTICE_LABEL_OVERRIDES[itemKey]
            || QUICK_SLOT_SHORT_LABELS[itemKey]
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

    function buildQuickSlotAutoAssignResult(quickSlots, assignedItemKey, itemCatalog, options) {
        const safeQuickSlots = normalizeQuickSlots(quickSlots);
        const safeAssignedItemKey = typeof assignedItemKey === 'string' ? assignedItemKey.trim() : '';
        const slotIndex = getQuickSlotAutoAssignIndex(safeQuickSlots);
        const didOverwrite = safeQuickSlots.every(slot => !!slot);
        const replacedItemKey = didOverwrite ? safeQuickSlots[slotIndex] : null;
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const assignedItemName = safeAssignedItemKey
            && safeItemCatalog[safeAssignedItemKey]
            && typeof safeItemCatalog[safeAssignedItemKey].name === 'string'
            ? safeItemCatalog[safeAssignedItemKey].name
            : '';
        const replacedItemName = replacedItemKey
            && safeItemCatalog[replacedItemKey]
            && typeof safeItemCatalog[replacedItemKey].name === 'string'
            ? safeItemCatalog[replacedItemKey].name
            : '';
        const nextQuickSlots = safeQuickSlots.slice();
        if (safeAssignedItemKey) {
            nextQuickSlots[slotIndex] = safeAssignedItemKey;
        }
        return {
            slotIndex,
            didOverwrite,
            replacedItemKey,
            assignedItemKey: safeAssignedItemKey || null,
            assignedItemName,
            replacedItemName,
            nextQuickSlots,
            notice: buildQuickSlotAutoAssignNotice(slotIndex, {
                didOverwrite,
                assignedItemKey: safeAssignedItemKey,
                assignedItemName,
                replacedItemKey,
                replacedItemName,
                measureLabelWidth: options && options.measureLabelWidth
            })
        };
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
        const assignedItemDerivedLabel = (assignedItemKey
            ? QUICK_SLOT_NOTICE_LABEL_OVERRIDES[assignedItemKey]
            : '')
            || deriveQuickSlotNoticeLabelFromName(assignedItemName, { measureLabelWidth, measurementCache })
            || QUICK_SLOT_SHORT_LABELS[assignedItemKey];
        const replacedItemDerivedLabel = (replacedItemKey
            ? QUICK_SLOT_NOTICE_LABEL_OVERRIDES[replacedItemKey]
            : '')
            || deriveQuickSlotNoticeLabelFromName(replacedItemName, { measureLabelWidth, measurementCache })
            || QUICK_SLOT_SHORT_LABELS[replacedItemKey];
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
        const persistedRecommendationReason = typeof runEventRoom.selectedChoiceRecommendationReason === 'string'
            ? runEventRoom.selectedChoiceRecommendationReason.trim()
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
            selectedChoiceRecommendationReason: runEventRoom.resolved ? persistedRecommendationReason : '',
            resolutionText: runEventRoom.resolved ? persistedResolutionText : '',
            encounterProfilePending: !!runEventRoom.encounterProfilePending && !!runEventRoom.resolved
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
            selectedChoiceRecommendationReason: '',
            resolutionText: '',
            encounterProfilePending: false
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
        const recommendationDecision = getRunEventRoomChoiceRecommendationDecision(
            getRunEventRoomChoices(normalizedRoom.key, poolOverride),
            safeState
        );
        const selectedChoiceRecommendationReason = recommendationDecision && recommendationDecision.choiceKey === choice.key
            ? recommendationDecision.reason
            : '';

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
            resolutionText = typeof effect.resolutionText === 'string' && effect.resolutionText.trim()
                ? effect.resolutionText.trim()
                : describeRunEffectSummary(runEffects);
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
                selectedChoiceRecommendationReason,
                resolutionText,
                encounterProfilePending: true
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
            if (ADDITIVE_RUN_EFFECT_KEYS.has(effectKey)) {
                effects[effectKey] += n;
                return;
            }
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
            if (typeof effect.routeSummary === 'string' && effect.routeSummary.trim()) {
                return effect.routeSummary.trim();
            }
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            const defs = [
                ['playerDamageMultiplier', '伤害'],
                ['playerDamageTakenMultiplier', '承伤'],
                ['goldDropMultiplier', '金币掉落'],
                ['extraDropRateMultiplier', '额外掉落率'],
                ['playerStaminaRegenMultiplier', '体力恢复'],
                ['playerAttackCooldownMultiplier', '普攻冷却'],
                ['playerMeleeAttackCooldownMultiplier', '近战武器普攻冷却'],
                ['playerSpecialCooldownMultiplier', '特攻冷却'],
                ['playerRangedSpecialCooldownMultiplier', '远程武器特攻冷却'],
                ['playerDodgeCooldownMultiplier', '闪避冷却'],
                ['playerDodgeStaminaCostMultiplier', '闪避体力消耗'],
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

    function getRunEventRoomChoiceIntentTags(choice) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};

        if (effect.type === 'hpForGold') {
            const hpCostRatio = Math.max(0, Number(effect.hpCostRatio) || 0);
            return ['经济', hpCostRatio >= 0.2 ? '冒险' : '稳健'];
        }

        if (effect.type === 'restoreHpAndCleanse') {
            return ['续航', '净化'];
        }

        if (effect.type === 'restoreHp') {
            return ['续航', '稳健'];
        }

        if (effect.type === 'goldForItems') {
            const items = normalizeEffectItemChanges(effect);
            if (items.some(({ itemKey }) => itemKey === 'cleanseTonic')) {
                return ['补给', '净化'];
            }
            if (items.some(({ itemKey }) => itemKey === 'berserkerOil')) {
                return ['补给', '爆发'];
            }
            return ['补给'];
        }

        if (effect.type === 'runEffectBuff') {
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            const playerDamageMultiplier = Number(runEffects.playerDamageMultiplier) || 1;
            const playerDamageTakenMultiplier = Number(runEffects.playerDamageTakenMultiplier) || 1;
            const playerLowHpDamageMultiplier = Number(runEffects.playerLowHpDamageMultiplier) || 1;
            const playerHighHpDamageTakenMultiplier = Number(runEffects.playerHighHpDamageTakenMultiplier) || 1;
            const playerSpecialCooldownMultiplier = Number(runEffects.playerSpecialCooldownMultiplier) || 1;
            const playerStaminaRegenMultiplier = Number(runEffects.playerStaminaRegenMultiplier) || 1;

            if (playerDamageMultiplier > 1) {
                return ['爆发', playerDamageTakenMultiplier > 1.1 ? '冒险' : '稳健'];
            }
            if (playerLowHpDamageMultiplier > 1) {
                return ['爆发', '冒险'];
            }
            if (playerHighHpDamageTakenMultiplier > 0 && playerHighHpDamageTakenMultiplier < 1) {
                return ['续航', '稳健'];
            }
            if (playerSpecialCooldownMultiplier > 0 && playerSpecialCooldownMultiplier < 1) {
                return ['节奏', '爆发'];
            }
            if (playerStaminaRegenMultiplier > 1) {
                return ['节奏', '续航'];
            }
        }

        return [];
    }

    function formatRunEventRoomChoiceIntentTags(choice) {
        const tags = getRunEventRoomChoiceIntentTags(choice)
            .filter(tag => typeof tag === 'string' && tag.trim())
            .slice(0, 2);
        return tags.length > 0 ? ` [${tags.join('/')}]` : '';
    }

    function getRunEventRoomChoiceExplicitEncounterProfileKey(choice) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const choiceKey = typeof safeChoice.key === 'string' ? safeChoice.key.trim() : '';
        if (!choiceKey) return '';
        return RUN_EVENT_EXPLICIT_PROFILE_KEYS[choiceKey] || '';
    }

    function getRunEventRoomChoiceEncounterProfile(choice) {
        const explicitProfileKey = getRunEventRoomChoiceExplicitEncounterProfileKey(choice);
        if (explicitProfileKey && RUN_EVENT_ENCOUNTER_PROFILES[explicitProfileKey]) {
            return RUN_EVENT_ENCOUNTER_PROFILES[explicitProfileKey];
        }
        const tags = getRunEventRoomChoiceIntentTags(choice);
        if (tags.includes('经济')) return RUN_EVENT_ENCOUNTER_PROFILES.windfall;
        if (tags.includes('爆发') || tags.includes('节奏') || tags.includes('冒险')) {
            return RUN_EVENT_ENCOUNTER_PROFILES.pressure;
        }
        if (tags.includes('续航') || tags.includes('净化') || tags.includes('稳健') || tags.includes('补给')) {
            return RUN_EVENT_ENCOUNTER_PROFILES.breather;
        }
        return null;
    }

    function getRunEventEncounterEnemyPressureScore(enemyDef) {
        const safeDef = enemyDef && typeof enemyDef === 'object' ? enemyDef : {};
        const hp = Math.max(0, Number(safeDef.hp) || 0);
        const damage = Math.max(0, Number(safeDef.damage) || 0);
        const speed = Math.max(0, Number(safeDef.speed) || 0);
        const statusBonus = safeDef.onHitStatus ? 18 : 0;
        return damage * 12 + speed + hp * 0.35 + statusBonus;
    }

    function getRunEventEncounterEnemyGoldScore(enemyDef) {
        const drops = enemyDef && typeof enemyDef === 'object' && enemyDef.drops && typeof enemyDef.drops === 'object'
            ? enemyDef.drops
            : {};
        const gold = drops.gold;
        if (Array.isArray(gold) && gold.length >= 2) {
            return ((Number(gold[0]) || 0) + (Number(gold[1]) || 0)) / 2;
        }
        return Math.max(0, Number(gold) || 0);
    }

    function buildRunEventEncounterRoster(profile, enemyPool, enemyDefs) {
        const safePool = Array.isArray(enemyPool)
            ? enemyPool.filter((key, index, arr) => typeof key === 'string' && key.trim() && arr.indexOf(key) === index)
            : [];
        const safeEnemyDefs = enemyDefs && typeof enemyDefs === 'object' ? enemyDefs : {};
        const availablePool = safePool.filter(key => safeEnemyDefs[key] && typeof safeEnemyDefs[key] === 'object');
        if (availablePool.length === 0) return [];

        const byPressureAscending = availablePool.slice().sort((leftKey, rightKey) => {
            const pressureDelta = getRunEventEncounterEnemyPressureScore(safeEnemyDefs[leftKey]) - getRunEventEncounterEnemyPressureScore(safeEnemyDefs[rightKey]);
            if (pressureDelta !== 0) return pressureDelta;
            return availablePool.indexOf(leftKey) - availablePool.indexOf(rightKey);
        });
        const byPressureDescending = byPressureAscending.slice().reverse();
        const byGoldDescending = availablePool.slice().sort((leftKey, rightKey) => {
            const goldDelta = getRunEventEncounterEnemyGoldScore(safeEnemyDefs[rightKey]) - getRunEventEncounterEnemyGoldScore(safeEnemyDefs[leftKey]);
            if (goldDelta !== 0) return goldDelta;
            return availablePool.indexOf(leftKey) - availablePool.indexOf(rightKey);
        });

        const profileKey = profile && typeof profile === 'object' && typeof profile.key === 'string'
            ? profile.key
            : '';
        if (profileKey === 'pressure') return byPressureDescending.slice(0, Math.min(3, byPressureDescending.length));
        if (profileKey === 'windfall') return byGoldDescending.slice(0, Math.min(2, byGoldDescending.length));
        if (profileKey === 'breather') return byPressureAscending.slice(0, Math.min(2, byPressureAscending.length));
        return availablePool.slice(0, Math.min(2, availablePool.length));
    }

    function buildRunEventEncounterFormationSlots(profile, rosterKeys) {
        const safeRoster = Array.isArray(rosterKeys)
            ? rosterKeys.filter((key, index, arr) => typeof key === 'string' && key.trim() && arr.indexOf(key) === index)
            : [];
        if (safeRoster.length === 0) return [];

        const profileKey = profile && typeof profile === 'object' && typeof profile.key === 'string'
            ? profile.key
            : '';

        if (profileKey === 'breather') {
            const templates = [
                { laneRatio: 0.64, depthBand: 'back', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                { laneRatio: 0.82, depthBand: 'back', flankOffset: 1, engageDelayMs: 700, goldDropMultiplier: 1, bountyLabel: '' }
            ];
            return safeRoster.slice(0, templates.length).map((enemyKey, index) => ({
                enemyKey,
                ...templates[index]
            }));
        }

        if (profileKey === 'pressure') {
            const templates = [
                { laneRatio: 0.3, depthBand: 'front', flankOffset: 0, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                { laneRatio: 0.42, depthBand: 'front', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                { laneRatio: 0.54, depthBand: 'front', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' }
            ];
            return safeRoster.slice(0, templates.length).map((enemyKey, index) => ({
                enemyKey,
                ...templates[index]
            }));
        }

        if (profileKey === 'windfall') {
            const prioritizedRoster = safeRoster.length >= 2
                ? [safeRoster[1], safeRoster[0], ...safeRoster.slice(2)]
                : safeRoster;
            const templates = [
                { laneRatio: 0.46, depthBand: 'front', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 0.7, bountyLabel: '' },
                { laneRatio: 0.78, depthBand: 'back', flankOffset: -1, engageDelayMs: 900, goldDropMultiplier: 1.3, bountyLabel: '赏金' }
            ];
            return prioritizedRoster.slice(0, templates.length).map((enemyKey, index) => ({
                enemyKey,
                ...templates[index]
            }));
        }

        const fallbackTemplates = safeRoster.length <= 1
            ? [{ laneRatio: 0.5, depthBand: 'mid', flankOffset: 0, goldDropMultiplier: 1, bountyLabel: '' }]
            : (safeRoster.length === 2
                ? [
                    { laneRatio: 0.4, depthBand: 'mid', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                    { laneRatio: 0.6, depthBand: 'mid', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' }
                ]
                : [
                    { laneRatio: 0.34, depthBand: 'mid', flankOffset: -1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                    { laneRatio: 0.5, depthBand: 'mid', flankOffset: 0, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' },
                    { laneRatio: 0.66, depthBand: 'mid', flankOffset: 1, engageDelayMs: 0, goldDropMultiplier: 1, bountyLabel: '' }
                ]);
        return safeRoster.slice(0, fallbackTemplates.length).map((enemyKey, index) => ({
            enemyKey,
            ...fallbackTemplates[index]
        }));
    }

    function buildRunEventEncounterPayoffPresentation(slot, goldAmount) {
        const safeSlot = slot && typeof slot === 'object' ? slot : {};
        const bountyLabel = typeof safeSlot.bountyLabel === 'string' ? safeSlot.bountyLabel.trim() : '';
        const goldDropMultiplier = Math.max(0.2, Number(safeSlot.goldDropMultiplier) || 1);
        const gold = Math.max(0, Math.round(Number(goldAmount) || 0));
        if (!bountyLabel || gold <= 0 || goldDropMultiplier <= 1) return null;
        return {
            receiptLabel: `${bountyLabel}+${gold}`,
            receiptColor: '#fff0a6',
            pulseColor: 0xFFE27A,
            pickupTint: 0xFFD27A,
            pickupScale: 1.35
        };
    }

    function formatRunEventRoomChoiceEncounterPreview(choice, options) {
        const profile = getRunEventRoomChoiceEncounterProfile(choice);
        return buildRunEventEncounterObjectivePreview(profile, options);
    }

    function buildRunEventRoomChoicePreview(choice) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const label = typeof safeChoice.label === 'string' ? safeChoice.label.trim() : '';
        const route = describeRunEventChoiceRoute(safeChoice).trim();
        const intentTags = formatRunEventRoomChoiceIntentTags(safeChoice);
        if (label && route) return `${label}${intentTags}: ${route}`;
        return label || route || '';
    }

    function getWeaponSpecialStatus(weaponKey) {
        const safeWeaponKey = typeof weaponKey === 'string' ? weaponKey.trim() : '';
        return WEAPON_STATUS_EFFECTS[safeWeaponKey] || null;
    }

    function getRunModifierTagBias(runModifiers) {
        const safeRunModifiers = Array.isArray(runModifiers) ? runModifiers : [];
        const bias = new Set();
        safeRunModifiers.forEach((modifier) => {
            const effects = modifier && typeof modifier === 'object' && modifier.effects && typeof modifier.effects === 'object'
                ? modifier.effects
                : {};
            if ((Number(effects.playerDamageMultiplier) || 1) > 1 || (Number(effects.playerLowHpDamageMultiplier) || 1) > 1) {
                bias.add('爆发');
            }
            if ((Number(effects.goldDropMultiplier) || 1) > 1 || (Number(effects.extraDropRateMultiplier) || 1) > 1) {
                bias.add('经济');
            }
            if ((Number(effects.playerAttackCooldownMultiplier) || 1) < 1
                || (Number(effects.playerSpecialCooldownMultiplier) || 1) < 1
                || (Number(effects.playerMeleeAttackCooldownMultiplier) || 1) < 1
                || (Number(effects.playerRangedSpecialCooldownMultiplier) || 1) < 1
                || (Number(effects.playerStaminaRegenMultiplier) || 1) > 1) {
                bias.add('节奏');
            }
            if ((Number(effects.playerDamageTakenMultiplier) || 1) < 1 || (Number(effects.playerHighHpDamageTakenMultiplier) || 1) < 1) {
                bias.add('稳健');
            }
            if (Array.isArray(modifier.tags)) {
                modifier.tags.forEach((tag) => {
                    if (typeof tag === 'string' && ['爆发', '经济', '节奏', '稳健', '补给'].includes(tag)) bias.add(tag);
                });
            }
        });
        return bias;
    }

    function buildRunEventRoomChoicePanelPreview(choice, state) {
        const basePreview = buildRunEventRoomChoicePreview(choice);
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const effect = safeChoice.effect && typeof safeChoice.effect === 'object' ? safeChoice.effect : {};
        const safeState = state && typeof state === 'object' ? state : {};
        const playerMaxHp = Math.max(1, clampInt(safeState.playerMaxHp, 1, Number.MAX_SAFE_INTEGER, 100));
        const currentHp = clampInt(safeState.playerHp, 1, playerMaxHp, playerMaxHp);
        const currentHpRatio = playerMaxHp > 0 ? (currentHp / playerMaxHp) : 1;
        const currentGold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const selectedWeaponKey = typeof safeState.selectedWeaponKey === 'string' ? safeState.selectedWeaponKey : '';
        const weaponStatus = getWeaponSpecialStatus(selectedWeaponKey);
        const inventory = normalizeInventory(safeState.inventory);
        const runModifierBias = getRunModifierTagBias(safeState.runModifiers);
        const negativeStatuses = Array.isArray(safeState.negativeStatuses) ? safeState.negativeStatuses : [];

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

        const notes = [];
        if (hpDelta) {
            notes.push(`预估生命${hpDelta > 0 ? '+' : ''}${hpDelta}`);
        }
        if ((effect.type === 'restoreHp' || effect.type === 'restoreHpAndCleanse') && hpDelta <= 0 && currentHpRatio >= 0.85) {
            notes.push('高血收益低');
        }
        if (effect.type === 'restoreHpAndCleanse') {
            notes.push(negativeStatuses.length > 0 ? `可净化${negativeStatuses.length}层` : '无负面可净化');
        }

        if (effect.type === 'goldForItems') {
            const goldCost = clampInt(effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0);
            const shortfall = Math.max(0, goldCost - currentGold);
            if (shortfall > 0) {
                notes.push(shortfall <= 25 ? `仅差${shortfall}金` : '金币紧张');
            }
            const itemChanges = normalizeEffectItemChanges(effect);
            const duplicateItem = itemChanges.find(({ itemKey }) => clampInt(inventory[itemKey], 0, Number.MAX_SAFE_INTEGER, 0) > 0);
            if (duplicateItem) {
                const ownedCount = clampInt(inventory[duplicateItem.itemKey], 0, Number.MAX_SAFE_INTEGER, 0);
                notes.push(`背包已有${ownedCount}`);
            }
            if (runModifierBias.has('补给')) {
                notes.push('当前局已偏补给');
            }
        }

        if (effect.type === 'hpForGold' && runModifierBias.has('经济')) {
            notes.push('当前局已偏经济');
        }

        if (effect.type === 'runEffectBuff') {
            const runEffects = effect.runEffects && typeof effect.runEffects === 'object' ? effect.runEffects : {};
            const lowHpThresholdRatio = Number(runEffects.playerLowHpThresholdRatio);
            const highHpThresholdRatio = Number(runEffects.playerHighHpThresholdRatio);
            if (Number.isFinite(lowHpThresholdRatio) && lowHpThresholdRatio > 0) {
                if (currentHpRatio <= lowHpThresholdRatio) {
                    notes.push('已处绝境线');
                } else if (currentHpRatio <= (lowHpThresholdRatio + 0.1)) {
                    notes.push('已临近绝境');
                }
            }
            if (Number.isFinite(highHpThresholdRatio) && highHpThresholdRatio > 0) {
                if (currentHpRatio >= highHpThresholdRatio) {
                    notes.push('高血稳定');
                } else if (currentHpRatio >= (highHpThresholdRatio - 0.1)) {
                    notes.push('接近守心线');
                }
            }
            const burnRoute = Number(runEffects.playerBurnStatusDurationMultiplier) > 1 || Number(runEffects.playerBurnStatusDamageMultiplier) > 1;
            const bleedRoute = Number(runEffects.playerBleedStatusDurationMultiplier) > 1 || Number(runEffects.playerBleedStatusDamageMultiplier) > 1;
            const slowRoute = Number(runEffects.playerSlowStatusDurationMultiplier) > 1 || Number(runEffects.playerDamageVsSlowedMultiplier) > 1;
            if (burnRoute) {
                notes.push(weaponStatus && weaponStatus.key === 'burn' ? '当前武器可触发' : '需切至灼烧武器');
            } else if (bleedRoute) {
                notes.push(weaponStatus && weaponStatus.key === 'bleed' ? '当前武器可触发' : '需切至流血武器');
            } else if (slowRoute) {
                notes.push(weaponStatus && weaponStatus.key === 'slow' ? '当前武器可触发' : '需切至减速武器');
            }
            const choicePreview = basePreview;
            if ((choicePreview.includes('[爆发') || choicePreview.includes('/爆发]') || choicePreview.includes('猩红锋契')) && runModifierBias.has('爆发')) {
                notes.push('当前局已偏爆发');
            } else if ((choicePreview.includes('[节奏') || choicePreview.includes('/节奏]') || choicePreview.includes('复苏祷言') || choicePreview.includes('迅击祷言')) && runModifierBias.has('节奏')) {
                notes.push('当前局已偏节奏');
            } else if ((choicePreview.includes('[稳健') || choicePreview.includes('/稳健]') || choicePreview.includes('守心修习')) && runModifierBias.has('稳健')) {
                notes.push('当前局已偏稳健');
            }
        }

        if (notes.length === 0) return basePreview;
        return `${basePreview} · ${notes.join(' · ')}`;
    }

    function getCombatActionReadyRecoveryMs(cooldownMs, stamina, staminaCost, staminaRegenPerSecond) {
        const remainingCooldownMs = Math.max(0, Number(cooldownMs) || 0);
        const currentStamina = Math.max(0, Number(stamina) || 0);
        const requiredStamina = Math.max(0, Number(staminaCost) || 0);
        const safeStaminaRegenPerSecond = Math.max(0, Number(staminaRegenPerSecond) || 0);
        if (requiredStamina <= currentStamina) return remainingCooldownMs;
        if (safeStaminaRegenPerSecond <= 0) return Number.POSITIVE_INFINITY;
        const staminaRecoveryMs = Math.ceil(((requiredStamina - currentStamina) / safeStaminaRegenPerSecond) * 1000);
        return Math.max(remainingCooldownMs, staminaRecoveryMs);
    }

    function getRunEventRoomChoiceRecommendationActionState(state) {
        const safeState = state && typeof state === 'object' ? state : {};
        const hasActionSignals = [
            'attackCooldownMs',
            'specialCooldownMs',
            'dodgeCooldownMs',
            'stamina',
            'staminaRegenPerSecond'
        ].some(key => safeState[key] != null);
        if (!hasActionSignals) return null;

        const isDodging = !!safeState.isDodging;
        const dodgeLockoutMs = Math.max(0, Number(safeState.dodgeLockoutMs) || 0);
        const stamina = Math.max(0, Number(safeState.stamina) || 0);
        const staminaRegenPerSecond = Math.max(0, Number(safeState.staminaRegenPerSecond) || 0);
        const adjustCooldownMs = (value) => {
            const safeCooldownMs = Math.max(0, Number(value) || 0);
            return isDodging ? Math.max(0, safeCooldownMs - dodgeLockoutMs) : safeCooldownMs;
        };
        const attackCooldownMs = adjustCooldownMs(safeState.attackCooldownMs);
        const specialCooldownMs = adjustCooldownMs(safeState.specialCooldownMs);
        const dodgeCooldownMs = isDodging
            ? Math.max(0, Number(safeState.dodgePostLockoutCooldownMs) || 0)
            : Math.max(0, Number(safeState.dodgeCooldownMs) || 0);
        const attackStaminaCost = Math.max(0, Number(safeState.attackStaminaCost) || 0);
        const specialStaminaCost = Math.max(0, Number(safeState.specialStaminaCost) || 0);
        const dodgeStaminaCost = Math.max(0, Number(safeState.dodgeStaminaCost) || 0);
        const buildMetrics = (cooldownMs, staminaCost) => {
            const readyState = resolveCombatActionReadyState(
                cooldownMs,
                stamina,
                staminaCost,
                staminaRegenPerSecond
            );
            return {
                recoveryMs: getCombatActionReadyRecoveryMs(cooldownMs, stamina, staminaCost, staminaRegenPerSecond),
                missingStamina: Math.max(0, Math.ceil(staminaCost - stamina)),
                isReady: readyState.isReady
            };
        };

        return {
            attack: buildMetrics(attackCooldownMs, attackStaminaCost),
            special: buildMetrics(specialCooldownMs, specialStaminaCost),
            dodge: buildMetrics(dodgeCooldownMs, dodgeStaminaCost),
            stamina
        };
    }

    function getRunEventRoomChoiceRecommendationDecision(choices, state) {
        const safeChoices = Array.isArray(choices)
            ? choices.filter(choice => choice && typeof choice === 'object').slice(0, 2)
            : [];
        if (safeChoices.length < 2) return null;

        const safeState = state && typeof state === 'object' ? state : {};
        const playerMaxHp = Math.max(1, clampInt(safeState.playerMaxHp, 1, Number.MAX_SAFE_INTEGER, 100));
        const currentHp = clampInt(safeState.playerHp, 1, playerMaxHp, playerMaxHp);
        const currentHpRatio = playerMaxHp > 0 ? (currentHp / playerMaxHp) : 1;
        const missingHp = Math.max(0, playerMaxHp - currentHp);
        const currentGold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const selectedWeaponKey = typeof safeState.selectedWeaponKey === 'string' ? safeState.selectedWeaponKey : '';
        const weaponStatus = getWeaponSpecialStatus(selectedWeaponKey);
        const inventory = normalizeInventory(safeState.inventory);
        const runModifierBias = getRunModifierTagBias(safeState.runModifiers);
        const negativeStatuses = Array.isArray(safeState.negativeStatuses)
            ? safeState.negativeStatuses.filter(status => typeof status === 'string' && status.trim())
            : [];
        const actionState = getRunEventRoomChoiceRecommendationActionState(safeState);
        const byKey = new Map(safeChoices.map((choice, index) => [choice.key, { choice, index }]));
        const hasChoice = (key) => byKey.has(key);
        const buildRecommendation = (key, reason) => {
            const entry = byKey.get(key);
            if (!entry) return null;
            const label = typeof entry.choice.label === 'string' ? entry.choice.label.trim() : '';
            if (!label) return null;
            const safeReason = typeof reason === 'string' ? reason.trim() : '';
            return {
                choiceKey: entry.choice.key,
                index: entry.index,
                label,
                reason: safeReason,
                message: `建议 ${entry.index + 1}：${label}${safeReason ? ` · ${safeReason}` : ''}`
            };
        };
        const isMeleeLoadout = selectedWeaponKey === 'sword'
            || selectedWeaponKey === 'hammer'
            || selectedWeaponKey === 'dualBlades';
        const isRangedLoadout = selectedWeaponKey === 'bow'
            || selectedWeaponKey === 'staff';
        const wantsPressureCadence = !!actionState
            && actionState.attack.recoveryMs >= 900
            && actionState.attack.recoveryMs >= actionState.special.recoveryMs + 400;
        const wantsWindfallChase = !!actionState
            && actionState.special.recoveryMs >= 900
            && actionState.special.recoveryMs >= actionState.attack.recoveryMs + 500
            && actionState.dodge.recoveryMs <= 450;
        const wantsBreatherStabilize = !!actionState
            && (
                currentHpRatio <= 0.7
                || actionState.dodge.recoveryMs >= 900
                || actionState.attack.missingStamina > 0
                || actionState.dodge.missingStamina > 0
            );
        const supportsPressureFollowup = !!actionState
            && currentHpRatio >= 0.75
            && actionState.attack.recoveryMs <= 450
            && actionState.dodge.recoveryMs <= 450;

        if (hasChoice('vitalSurge') && hasChoice('purifyingSip')) {
            const cleanseCount = negativeStatuses.length;
            if (cleanseCount > 0) {
                return buildRecommendation('purifyingSip', `可净化${cleanseCount}层`);
            }
            const vitalHeal = Math.min(Math.max(0, Math.floor(playerMaxHp * 0.55)), missingHp);
            const purifyingHeal = Math.min(Math.max(0, Math.floor(playerMaxHp * 0.3)), missingHp);
            if (vitalHeal > purifyingHeal && missingHp >= Math.max(42, purifyingHeal + 18)) {
                return buildRecommendation('vitalSurge', '缺口更大');
            }
            return null;
        }

        if (hasChoice('desperationLesson') && hasChoice('composureLesson')) {
            if (currentHpRatio <= 0.45) {
                return buildRecommendation('desperationLesson', '已处绝境线');
            }
            if (currentHpRatio >= 0.7) {
                return buildRecommendation('composureLesson', '高血稳定');
            }
            return null;
        }

        if (hasChoice('renewalPrayer') && hasChoice('tempoPrayer')) {
            if (runModifierBias.has('节奏')) {
                return buildRecommendation('tempoPrayer', '当前局已偏节奏');
            }
            return null;
        }

        if (hasChoice('vanguardLesson') && hasChoice('longshotLesson')) {
            if (isMeleeLoadout && wantsPressureCadence) {
                return buildRecommendation('vanguardLesson', '近战更宜压线');
            }
            if (isRangedLoadout && wantsWindfallChase) {
                return buildRecommendation('longshotLesson', '远程更宜追赏');
            }
            return null;
        }

        if (hasChoice('emberLesson') && hasChoice('bloodtraceLesson')) {
            if (weaponStatus && weaponStatus.key === 'burn' && wantsBreatherStabilize) {
                return buildRecommendation('emberLesson', '灼烧更宜稳场');
            }
            if (weaponStatus && weaponStatus.key === 'bleed' && supportsPressureFollowup) {
                return buildRecommendation('bloodtraceLesson', '挂血更宜抢势');
            }
            return null;
        }

        if (actionState && hasChoice('flurryLesson') && hasChoice('ghostStepLesson')) {
            if (actionState.attack.recoveryMs >= 900
                && actionState.attack.recoveryMs >= actionState.dodge.recoveryMs + 400) {
                return buildRecommendation('flurryLesson', '普攻卡拍');
            }
            if (actionState.dodge.recoveryMs >= 900
                && actionState.dodge.recoveryMs >= actionState.attack.recoveryMs + 400) {
                return buildRecommendation('ghostStepLesson', '闪避卡拍');
            }
            return null;
        }

        if (actionState && hasChoice('crushingLesson') && hasChoice('executionLesson')) {
            if (weaponStatus && weaponStatus.key === 'slow') {
                if (currentHpRatio <= 0.6 || actionState.dodge.recoveryMs >= 900) {
                    return buildRecommendation('crushingLesson', '当前更宜控场');
                }
                if (currentHpRatio >= 0.78
                    && actionState.attack.recoveryMs <= 400
                    && actionState.dodge.recoveryMs <= 400) {
                    return buildRecommendation('executionLesson', '当前可追终结');
                }
            }
            return null;
        }

        if (actionState && hasChoice('breathingLesson') && hasChoice('momentumLesson')) {
            if (actionState.attack.missingStamina > 0
                || actionState.dodge.missingStamina > 0
                || actionState.special.missingStamina >= 6) {
                return buildRecommendation('breathingLesson', '当前更缺回线');
            }
            if (actionState.dodge.isReady && actionState.special.recoveryMs >= 900) {
                return buildRecommendation('momentumLesson', '特攻待借势');
            }
            return null;
        }

        if (actionState && hasChoice('sharpeningLesson') && hasChoice('reversalStepLesson')) {
            if (actionState.attack.isReady && actionState.special.recoveryMs >= 1000) {
                return buildRecommendation('sharpeningLesson', '特攻待连段');
            }
            if (actionState.special.isReady && actionState.dodge.recoveryMs >= 1000) {
                return buildRecommendation('reversalStepLesson', '闪避待回身');
            }
            return null;
        }

        if (actionState && hasChoice('pursuitLesson') && hasChoice('focusLesson')) {
            if (actionState.dodge.isReady
                && actionState.attack.isReady
                && actionState.special.recoveryMs <= 500
                && actionState.special.missingStamina <= 0) {
                return buildRecommendation('pursuitLesson', '可立即追猎');
            }
            if (actionState.special.missingStamina > 0
                || (actionState.special.recoveryMs <= 500 && actionState.stamina <= 10)) {
                return buildRecommendation('focusLesson', '当前更缺回体');
            }
            return null;
        }

        if (hasChoice('highStakeWager') && hasChoice('carefulWager')) {
            if (currentHpRatio >= 0.85) {
                return buildRecommendation('highStakeWager', '当前血线更能承受');
            }
            if (currentHpRatio <= 0.55) {
                return buildRecommendation('carefulWager', '当前更宜稳押');
            }
            return null;
        }

        if (hasChoice('fieldTonic') && hasChoice('berserkerKit')) {
            const fieldTonicCost = clampInt(byKey.get('fieldTonic').choice.effect && byKey.get('fieldTonic').choice.effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0);
            const berserkerKitCost = clampInt(byKey.get('berserkerKit').choice.effect && byKey.get('berserkerKit').choice.effect.goldCost, 0, Number.MAX_SAFE_INTEGER, 0);
            const fieldTonicOwned = clampInt(inventory.cleanseTonic, 0, Number.MAX_SAFE_INTEGER, 0);
            if (negativeStatuses.length > 0 && currentGold >= fieldTonicCost && fieldTonicOwned <= 0) {
                return buildRecommendation('fieldTonic', `可净化${negativeStatuses.length}层`);
            }
            if (currentGold >= fieldTonicCost && currentGold < berserkerKitCost) {
                return buildRecommendation('fieldTonic', '当前可负担');
            }
            return null;
        }

        return null;
    }

    function buildRunEventRoomChoiceRecommendation(choices, state) {
        const decision = getRunEventRoomChoiceRecommendationDecision(choices, state);
        return decision ? decision.message : '';
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

    function getRunEventEncounterProfile(runEventRoom, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom || !normalizedRoom.resolved || !normalizedRoom.selectedChoiceKey) return null;
        const choice = getRunEventRoomChoices(normalizedRoom.key, poolOverride)
            .find(item => item.key === normalizedRoom.selectedChoiceKey) || null;
        return choice ? getRunEventRoomChoiceEncounterProfile(choice) : null;
    }

    function getRunEventEncounterRecommendationFeedback(runEventRoom, profile, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom || !normalizedRoom.resolved || !normalizedRoom.selectedChoiceKey) return null;

        const recommendationReason = typeof normalizedRoom.selectedChoiceRecommendationReason === 'string'
            ? normalizedRoom.selectedChoiceRecommendationReason.trim()
            : '';
        if (!recommendationReason) return null;

        const profileKey = profile && typeof profile === 'object' && typeof profile.key === 'string'
            ? profile.key.trim()
            : '';
        if (!profileKey) return null;

        if (profileKey === 'breather') {
            if ((normalizedRoom.selectedChoiceKey === 'purifyingSip' || normalizedRoom.selectedChoiceKey === 'fieldTonic')
                && /^可净化\d+层$/.test(recommendationReason)) {
                return {
                    echo: '净化后稳场',
                    sourceCue: '净化后稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'fieldTonic' && recommendationReason === '当前可负担') {
                return {
                    echo: '趁价备净',
                    sourceCue: '趁价备净',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'vitalSurge' && recommendationReason === '缺口更大') {
                return {
                    echo: '回线稳场',
                    sourceCue: '回线稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'ghostStepLesson' && recommendationReason === '闪避卡拍') {
                return {
                    echo: '游步回拍',
                    sourceCue: '游步回拍',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'crushingLesson' && recommendationReason === '当前更宜控场') {
                return {
                    echo: '先控稳场',
                    sourceCue: '先控稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'breathingLesson' && recommendationReason === '当前更缺回线') {
                return {
                    echo: '回线稳场',
                    sourceCue: '回线稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'reversalStepLesson' && recommendationReason === '闪避待回身') {
                return {
                    echo: '回身回拍',
                    sourceCue: '回身回拍',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'focusLesson' && recommendationReason === '当前更缺回体') {
                return {
                    echo: '回体稳线',
                    sourceCue: '回体稳线',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'composureLesson' && recommendationReason === '高血稳定') {
                return {
                    echo: '守心稳场',
                    sourceCue: '守心稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'emberLesson'
                && (recommendationReason === '当前武器可触发' || recommendationReason === '灼烧更宜稳场')) {
                return {
                    echo: '灼烧稳场',
                    sourceCue: '灼烧稳场',
                    sourceCueMoment: 'stabilize'
                };
            }
        }

        if (profileKey === 'pressure') {
            if (normalizedRoom.selectedChoiceKey === 'flurryLesson' && recommendationReason === '普攻卡拍') {
                return {
                    echo: '抢拍开刃',
                    sourceCue: '抢拍开刃',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'tempoPrayer' && recommendationReason === '当前局已偏节奏') {
                return {
                    echo: '顺势抢压',
                    sourceCue: '顺势抢压',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'desperationLesson' && recommendationReason === '已处绝境线') {
                return {
                    echo: '压线抢势',
                    sourceCue: '压线抢势',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'momentumLesson' && recommendationReason === '特攻待借势') {
                return {
                    echo: '借势抢压',
                    sourceCue: '借势抢压',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'sharpeningLesson' && recommendationReason === '特攻待连段') {
                return {
                    echo: '连段催锋',
                    sourceCue: '连段催锋',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'vanguardLesson'
                && (recommendationReason === '当前持近战' || recommendationReason === '近战更宜压线')) {
                return {
                    echo: '贴身压阵',
                    sourceCue: '贴身压阵',
                    sourceCueMoment: 'engage'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'bloodtraceLesson'
                && (recommendationReason === '当前武器可触发' || recommendationReason === '挂血更宜抢势')) {
                return {
                    echo: '挂血抢势',
                    sourceCue: '挂血抢势',
                    sourceCueMoment: 'engage'
                };
            }
        }

        if (profileKey === 'windfall') {
            if (normalizedRoom.selectedChoiceKey === 'executionLesson' && recommendationReason === '当前可追终结') {
                return {
                    echo: '破势收赏',
                    sourceCue: '破势收赏',
                    sourceCueMoment: 'bounty'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'highStakeWager' && recommendationReason === '当前血线更能承受') {
                return {
                    echo: '血线够追赏',
                    sourceCue: '血线够追赏',
                    sourceCueMoment: 'bounty'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'carefulWager' && recommendationReason === '当前更宜稳押') {
                return {
                    echo: '留本追赏',
                    sourceCue: '留本追赏',
                    sourceCueMoment: 'bounty'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'longshotLesson'
                && (recommendationReason === '当前持远程' || recommendationReason === '远程更宜追赏')) {
                return {
                    echo: '远程追赏',
                    sourceCue: '远程追赏',
                    sourceCueMoment: 'bounty'
                };
            }
            if (normalizedRoom.selectedChoiceKey === 'pursuitLesson' && recommendationReason === '可立即追猎') {
                return {
                    echo: '追猎收赏',
                    sourceCue: '追猎收赏',
                    sourceCueMoment: 'bounty'
                };
            }
        }

        return null;
    }

    function getRunEventEncounterBaselineRouteFeedback(choiceKey, profileKey) {
        const safeChoiceKey = typeof choiceKey === 'string' ? choiceKey.trim() : '';
        const safeProfileKey = typeof profileKey === 'string' ? profileKey.trim() : '';
        if (!safeChoiceKey || !safeProfileKey) return null;
        const feedback = RUN_EVENT_BASELINE_ROUTE_FEEDBACK[safeChoiceKey];
        if (!feedback || feedback.profileKey !== safeProfileKey) return null;
        return feedback;
    }

    function getRunEventEncounterFeedback(runEventRoom, profile, poolOverride) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom || !normalizedRoom.resolved || !normalizedRoom.selectedChoiceKey) return null;

        const profileKey = profile && typeof profile === 'object' && typeof profile.key === 'string'
            ? profile.key.trim()
            : '';
        if (!profileKey) return null;

        const recommendationFeedback = getRunEventEncounterRecommendationFeedback(normalizedRoom, profile, poolOverride);
        if (recommendationFeedback) return recommendationFeedback;
        return getRunEventEncounterBaselineRouteFeedback(normalizedRoom.selectedChoiceKey, profileKey);
    }

    function getRunEventEncounterPayoffMoment(profile, runEventRoom, poolOverride) {
        const feedback = getRunEventEncounterFeedback(runEventRoom, profile, poolOverride);
        const feedbackMoment = feedback && typeof feedback.sourceCueMoment === 'string'
            ? feedback.sourceCueMoment.trim()
            : '';
        if (feedbackMoment) return feedbackMoment;

        const profileKey = profile && typeof profile === 'object' && typeof profile.key === 'string'
            ? profile.key.trim()
            : '';
        if (profileKey === 'pressure') return 'engage';
        if (profileKey === 'breather') return 'stabilize';
        if (profileKey === 'windfall') return 'bounty';
        return '';
    }

    function formatRunEventEncounterPayoffTimingLabel(profile, runEventRoom, poolOverride) {
        const moment = getRunEventEncounterPayoffMoment(profile, runEventRoom, poolOverride);
        if (moment === 'engage') return '首拍兑现';
        if (moment === 'stabilize') return '稳场兑现';
        if (moment === 'bounty') return '追赏兑现';
        return '';
    }

    function formatRunEventRoomChoiceEncounterTiming(choice, poolOverride) {
        const safeChoice = choice && typeof choice === 'object' ? choice : {};
        const profile = getRunEventRoomChoiceEncounterProfile(safeChoice);
        if (!profile) return '';
        const profileKey = typeof profile.key === 'string' ? profile.key.trim() : '';
        const choiceKey = typeof safeChoice.key === 'string' ? safeChoice.key.trim() : '';
        const baselineFeedback = choiceKey && profileKey
            ? getRunEventEncounterBaselineRouteFeedback(choiceKey, profileKey)
            : null;
        const moment = baselineFeedback && typeof baselineFeedback.sourceCueMoment === 'string'
            ? baselineFeedback.sourceCueMoment.trim()
            : getRunEventEncounterPayoffMoment(profile, null, poolOverride);
        if (moment === 'engage') return '首拍兑现';
        if (moment === 'stabilize') return '稳场兑现';
        if (moment === 'bounty') return '追赏兑现';
        return '';
    }

    function getRunEventEncounterRecommendationEcho(runEventRoom, profile, poolOverride) {
        const feedback = getRunEventEncounterFeedback(runEventRoom, profile, poolOverride);
        return feedback && typeof feedback.echo === 'string' ? feedback.echo : '';
    }

    function buildRunEventEncounterSourceCue(profile, runEventRoom, moment, poolOverride) {
        const safeMoment = typeof moment === 'string' ? moment.trim() : '';
        if (!safeMoment) return '';
        const feedback = getRunEventEncounterFeedback(runEventRoom, profile, poolOverride);
        if (!feedback || feedback.sourceCueMoment !== safeMoment) return '';
        return typeof feedback.sourceCue === 'string' ? feedback.sourceCue : '';
    }

    function buildRunEventEncounterEntryPreview(profile, runEventRoom, poolOverride) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const baseProfile = profileKey && RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            ? RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            : null;
        const encounterLabel = typeof safeProfile.encounterLabel === 'string' && safeProfile.encounterLabel.trim()
            ? safeProfile.encounterLabel.trim()
            : (baseProfile && typeof baseProfile.encounterLabel === 'string' ? baseProfile.encounterLabel : '');
        const tacticalSuffix = profileKey === 'breather'
            ? '双拍缓冲'
            : (profileKey === 'pressure'
                ? '三向成压'
                : (profileKey === 'windfall' ? '后排赏金' : ''));
        if (!encounterLabel || !tacticalSuffix) return '';
        const recommendationEcho = getRunEventEncounterRecommendationEcho(runEventRoom, safeProfile, poolOverride);
        return `${encounterLabel} · ${tacticalSuffix}${recommendationEcho ? ` · ${recommendationEcho}` : ''}`;
    }

    function buildRunEventEncounterStagingReceipt(profile, runEventRoom, poolOverride) {
        const entryPreview = buildRunEventEncounterEntryPreview(profile, runEventRoom, poolOverride);
        return entryPreview ? `遭遇: ${entryPreview}` : '';
    }

    function buildRunEventEncounterObjectiveCue(profile) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        if (profileKey === 'breather') return '先稳前排';
        if (profileKey === 'pressure') return '先拆夹角';
        if (profileKey === 'windfall') return '先盯后排';
        return '';
    }

    function buildRunEventEncounterPreviewStagingAnchor(profile) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        if (profileKey === 'breather') return '双低压';
        if (profileKey === 'pressure') return '三敌齐压';
        if (profileKey === 'windfall') return '双赏金';
        return '';
    }

    function canRunEventEncounterPreviewFit(text, options) {
        const safeText = typeof text === 'string' ? text.trim() : '';
        const safeOptions = options && typeof options === 'object' ? options : {};
        const maxWidth = Number(safeOptions.maxWidth);
        const measureTextWidth = typeof safeOptions.measureTextWidth === 'function'
            ? safeOptions.measureTextWidth
            : null;
        if (!safeText || !Number.isFinite(maxWidth) || maxWidth <= 0 || !measureTextWidth) return true;
        return measureTextWidth(safeText) <= maxWidth;
    }

    function buildRunEventEncounterObjectivePreview(profile, options) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const safeOptions = options && typeof options === 'object' ? options : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const baseProfile = profileKey && RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            ? RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            : null;
        const previewLabel = typeof safeProfile.previewLabel === 'string' && safeProfile.previewLabel.trim()
            ? safeProfile.previewLabel.trim()
            : (baseProfile && typeof baseProfile.previewLabel === 'string' ? baseProfile.previewLabel : '');
        const objectiveCue = buildRunEventEncounterObjectiveCue(safeProfile);
        const previewStagingAnchor = buildRunEventEncounterPreviewStagingAnchor(safeProfile);
        if (!previewLabel || !objectiveCue) return '';
        const compactPreview = `${previewLabel} · ${objectiveCue}`;
        if (!safeOptions.includeStagingAnchor || !previewStagingAnchor) return compactPreview;
        const layeredPreview = `${previewLabel} · ${previewStagingAnchor} · ${objectiveCue}`;
        return canRunEventEncounterPreviewFit(layeredPreview, safeOptions)
            ? layeredPreview
            : compactPreview;
    }

    function buildRunEventEncounterClearRecap(profile, runEventRoom, poolOverride) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const baseProfile = profileKey && RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            ? RUN_EVENT_ENCOUNTER_PROFILES[profileKey]
            : null;
        const encounterLabel = typeof safeProfile.encounterLabel === 'string' && safeProfile.encounterLabel.trim()
            ? safeProfile.encounterLabel.trim()
            : (baseProfile && typeof baseProfile.encounterLabel === 'string' ? baseProfile.encounterLabel : '');
        const recapSuffix = profileKey === 'breather'
            ? '稳住出清'
            : (profileKey === 'pressure'
                ? '顶住成压'
                : (profileKey === 'windfall' ? '赏金到手' : ''));
        if (!encounterLabel || !recapSuffix) return '';
        const recommendationEcho = getRunEventEncounterRecommendationEcho(runEventRoom, safeProfile, poolOverride);
        return `${encounterLabel} · ${recapSuffix}${recommendationEcho ? ` · ${recommendationEcho}` : ''}`;
    }

    function buildRunEventEncounterBossDoorRecap(profile, runEventRoom, poolOverride) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const routeLabel = profileKey === 'breather'
            ? '缓冲路线'
            : (profileKey === 'pressure'
                ? '高压路线'
                : (profileKey === 'windfall' ? '淘金路线' : ''));
        const payoffMoment = getRunEventEncounterPayoffMoment(safeProfile, runEventRoom, poolOverride);
        const recapSuffix = payoffMoment === 'stabilize'
            ? '稳线迎战'
            : (payoffMoment === 'engage'
                ? '顶压迎战'
                : (payoffMoment === 'bounty' ? '带赏迎战' : ''));
        if (!routeLabel || !recapSuffix) return '';
        return `${routeLabel} · ${recapSuffix}`;
    }

    function buildRunEventEncounterBossOpeningEcho(profile, runEventRoom, poolOverride) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const routeLabel = profileKey === 'breather'
            ? '缓冲路线'
            : (profileKey === 'pressure'
                ? '高压路线'
                : (profileKey === 'windfall' ? '淘金路线' : ''));
        const payoffMoment = getRunEventEncounterPayoffMoment(safeProfile, runEventRoom, poolOverride);
        const openerSuffix = payoffMoment === 'stabilize'
            ? '稳线开局'
            : (payoffMoment === 'engage'
                ? '抢势开局'
                : (payoffMoment === 'bounty' ? '带赏开局' : ''));
        if (!routeLabel || !openerSuffix) return '';
        return `${routeLabel} · ${openerSuffix}`;
    }

    function buildRunEventEncounterBossVictoryRecap(profile, runEventRoom, poolOverride) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const profileKey = typeof safeProfile.key === 'string' ? safeProfile.key.trim() : '';
        const routeLabel = profileKey === 'breather'
            ? '缓冲路线'
            : (profileKey === 'pressure'
                ? '高压路线'
                : (profileKey === 'windfall' ? '淘金路线' : ''));
        const payoffMoment = getRunEventEncounterPayoffMoment(safeProfile, runEventRoom, poolOverride);
        const victorySuffix = payoffMoment === 'stabilize'
            ? '稳线收官'
            : (payoffMoment === 'engage'
                ? '顶压收官'
                : (payoffMoment === 'bounty' ? '带赏收官' : ''));
        if (!routeLabel || !victorySuffix) return '';
        return `${routeLabel} · ${victorySuffix}`;
    }

    function buildHubLastRunSummary(summary) {
        const normalizedSummary = normalizeLastRunSummary(summary);
        const lines = [];
        if (normalizedSummary && normalizedSummary.bossLabel) {
            lines.push(normalizedSummary.bossLabel);
        }
        if (normalizedSummary && normalizedSummary.routeRecap) {
            lines.push(normalizedSummary.routeRecap);
        }
        if (normalizedSummary && normalizedSummary.choiceLabel) {
            lines.push(`源于 ${normalizedSummary.choiceLabel}${normalizedSummary.recommendationReason ? ` · ${normalizedSummary.recommendationReason}` : ''}`);
        }
        return {
            visible: lines.length > 0,
            title: '上轮战报',
            lines
        };
    }

    function buildHubPortalChoiceSummary(summary, targetLabel) {
        const normalizedSummary = normalizeLastRunSummary(summary);
        const target = typeof targetLabel === 'string'
            ? targetLabel.trim()
            : (targetLabel && typeof targetLabel.label === 'string' ? targetLabel.label.trim() : '');
        if (!target || !normalizedSummary) {
            return {
                visible: false,
                title: '选门回顾',
                lines: []
            };
        }

        const lines = [`目标 ${target}`];
        const lastRunAnchor = normalizedSummary.routeRecap || normalizedSummary.bossLabel;
        if (lastRunAnchor) {
            lines.push(`上轮 ${lastRunAnchor}`);
        }
        if (normalizedSummary.choiceLabel) {
            lines.push(`源于 ${normalizedSummary.choiceLabel}${normalizedSummary.recommendationReason ? ` · ${normalizedSummary.recommendationReason}` : ''}`);
        }
        return {
            visible: lines.length > 1,
            title: '选门回顾',
            lines: lines.length > 1 ? lines : []
        };
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
                ['playerAttackCooldownMultiplier', '普攻冷却'],
                ['playerMeleeAttackCooldownMultiplier', '近战武器普攻冷却'],
                ['playerSpecialCooldownMultiplier', '特攻冷却'],
                ['playerRangedSpecialCooldownMultiplier', '远程武器特攻冷却'],
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

    function buildRunEventRoomHudSummary(runEventRoom, poolOverride, options) {
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        const safeOptions = options && typeof options === 'object' ? options : {};
        const encounterPreviewOptions = safeOptions.encounterPreviewOptions && typeof safeOptions.encounterPreviewOptions === 'object'
            ? safeOptions.encounterPreviewOptions
            : null;
        if (!normalizedRoom) {
            return {
                visible: false,
                name: '',
                statusLabel: '',
                metaLabel: '',
                typeLabel: '',
                routeLines: [],
                routeSummary: '',
                stagingLine: '',
                resolutionText: ''
            };
        }

        const allChoices = getRunEventRoomChoices(normalizedRoom.key, poolOverride);
        const selectedChoice = normalizedRoom.selectedChoiceKey
            ? allChoices.find(choice => choice.key === normalizedRoom.selectedChoiceKey) || null
            : null;
        const stateLabel = normalizedRoom.resolved ? '已触发' : (normalizedRoom.discovered ? '已发现' : '未发现');
        const resolvedPrefix = getRunEventRoomResolvedPrefix(normalizedRoom.type);
        const recommendationReason = typeof normalizedRoom.selectedChoiceRecommendationReason === 'string'
            ? normalizedRoom.selectedChoiceRecommendationReason.trim()
            : '';
        const forceHealingDoubleFallback = normalizedRoom.resolved
            && normalizedRoom.type === 'healing'
            && !normalizedRoom.selectedChoiceLabel
            && !normalizedRoom.resolutionText;
        const resolvedChoiceLabel = normalizedRoom.selectedChoiceLabel
            || (!forceHealingDoubleFallback && selectedChoice ? selectedChoice.label : '')
            || (normalizedRoom.resolved ? '未知选项' : '');
        const encounterPreview = normalizedRoom.resolved && selectedChoice
            ? formatRunEventRoomChoiceEncounterPreview(selectedChoice, encounterPreviewOptions)
            : '';
        const encounterProfile = normalizedRoom.resolved
            ? getRunEventEncounterProfile(normalizedRoom, poolOverride)
            : null;
        const encounterTiming = normalizedRoom.resolved && selectedChoice
            ? formatRunEventEncounterPayoffTimingLabel(
                encounterProfile,
                normalizedRoom,
                poolOverride
            )
            : '';
        const stagingLine = normalizedRoom.resolved
            ? buildRunEventEncounterStagingReceipt(encounterProfile, normalizedRoom, poolOverride)
            : '';
        const visibleChoices = normalizedRoom.resolved
            ? []
            : allChoices.slice(0, 2);
        const routeLines = normalizedRoom.resolved
            ? (
                resolvedChoiceLabel
                    ? [`${resolvedPrefix}: ${resolvedChoiceLabel}${recommendationReason ? ` · ${recommendationReason}` : ''}${stagingLine ? '' : (encounterPreview ? ` · ${encounterPreview}` : '')}${encounterTiming ? ` · ${encounterTiming}` : ''}`.trim()]
                    : []
            )
            : visibleChoices.map((choice) => {
                const preview = buildRunEventRoomChoicePreview(choice);
                const nextRoomPreview = formatRunEventRoomChoiceEncounterPreview(choice, encounterPreviewOptions);
                const nextRoomTiming = formatRunEventRoomChoiceEncounterTiming(choice, poolOverride);
                return `${preview}${nextRoomPreview ? ` · ${nextRoomPreview}` : ''}${nextRoomTiming ? ` · ${nextRoomTiming}` : ''}`.trim();
            });
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
            stagingLine,
            resolutionText
        };
    }

    function buildRunEventRoomHudLines(runEventRoom, poolOverride, options) {
        const summary = buildRunEventRoomHudSummary(runEventRoom, poolOverride, options);
        if (!summary.visible) return [];

        const lines = [
            `事件房: ${summary.name}`,
            summary.metaLabel || `${summary.typeLabel} · ${summary.statusLabel || ''}`.trim()
        ];

        if (summary.statusLabel === '已触发') {
            const selectedLine = Array.isArray(summary.routeLines) && summary.routeLines.length > 0
                ? summary.routeLines[0]
                : '';
            if (summary.stagingLine) {
                if (selectedLine) {
                    lines.push(selectedLine);
                }
                lines.push(summary.stagingLine);
                if (summary.resolutionText) {
                    lines.push(`结算: ${summary.resolutionText}`);
                }
                return lines;
            }
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
        const normalizedRoom = normalizeRunEventRoom(runEventRoom, poolOverride);
        if (!normalizedRoom || !normalizedRoom.resolved) return '';
        const allChoices = getRunEventRoomChoices(normalizedRoom.key, poolOverride);
        const selectedChoice = normalizedRoom.selectedChoiceKey
            ? allChoices.find(choice => choice.key === normalizedRoom.selectedChoiceKey) || null
            : null;
        const forceHealingDoubleFallback = normalizedRoom.type === 'healing'
            && !normalizedRoom.selectedChoiceLabel
            && !normalizedRoom.resolutionText;
        const resolvedChoiceLabel = normalizedRoom.selectedChoiceLabel
            || (!forceHealingDoubleFallback && selectedChoice ? selectedChoice.label : '')
            || '未知选项';
        const recommendationReason = typeof normalizedRoom.selectedChoiceRecommendationReason === 'string'
            ? normalizedRoom.selectedChoiceRecommendationReason.trim()
            : '';
        const encounterTiming = selectedChoice
            ? formatRunEventEncounterPayoffTimingLabel(
                getRunEventEncounterProfile(normalizedRoom, poolOverride),
                normalizedRoom,
                poolOverride
            )
            : '';
        return `${getRunEventRoomResolvedPrefix(normalizedRoom.type)}: ${resolvedChoiceLabel}${recommendationReason ? ` · ${recommendationReason}` : ''}${encounterTiming ? ` · ${encounterTiming}` : ''}`.trim();
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
                if (ADDITIVE_RUN_EFFECT_KEYS.has(effectKey)) {
                    effects[effectKey] += n;
                    return;
                }
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
            ['playerAttackCooldownMultiplier', '普攻冷却'],
            ['playerMeleeAttackCooldownMultiplier', '近战武器普攻冷却'],
            ['playerSpecialCooldownMultiplier', '特攻冷却'],
            ['playerRangedSpecialCooldownMultiplier', '远程武器特攻冷却'],
            ['playerDodgeCooldownMultiplier', '闪避冷却'],
            ['playerDodgeStaminaCostMultiplier', '闪避体力消耗'],
            ['playerSpecialHitStaminaGain', '特攻命中回体'],
            ['playerAttackHitSpecialCooldownReductionMs', '普攻命中特攻冷却'],
            ['playerSpecialHitDodgeCooldownReductionMs', '特攻命中闪避冷却'],
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
        const checkpointExpectedReturns = review.checkpoints.reduce((result, entry) => {
            if (!entry || typeof entry !== 'object') {
                return result;
            }
            const checkpointKey = typeof entry.key === 'string' ? entry.key.trim() : '';
            if (!checkpointKey) {
                return result;
            }
            result[checkpointKey] = {
                attack: typeof entry.expectedReturnAttack === 'string' ? entry.expectedReturnAttack.trim() : '',
                label: typeof entry.expectedReturnLabel === 'string' ? entry.expectedReturnLabel.trim() : ''
            };
            return result;
        }, {});
        if (
            sharedRecoverySource.checkpointExpectedReturns
            && typeof sharedRecoverySource.checkpointExpectedReturns === 'object'
        ) {
            Object.entries(sharedRecoverySource.checkpointExpectedReturns).forEach(([checkpointKey, target]) => {
                const normalizedCheckpointKey = typeof checkpointKey === 'string' ? checkpointKey.trim() : '';
                if (!normalizedCheckpointKey || !target || typeof target !== 'object') {
                    return;
                }
                checkpointExpectedReturns[normalizedCheckpointKey] = {
                    attack: typeof target.attack === 'string' ? target.attack.trim() : '',
                    label: typeof target.label === 'string' ? target.label.trim() : ''
                };
            });
        }
        const explicitCurrentCheckpointKey = typeof sharedRecoverySource.currentCheckpointKey === 'string'
            ? sharedRecoverySource.currentCheckpointKey.trim()
            : '';
        const explicitCurrentCheckpointStep = Number.isFinite(sharedRecoverySource.currentCheckpointStep)
            ? clampInt(sharedRecoverySource.currentCheckpointStep, 1, review.checkpoints.length, 0)
            : 0;
        const expectedReturnAttack = typeof sharedRecoverySource.expectedReturnAttack === 'string'
            ? sharedRecoverySource.expectedReturnAttack.trim()
            : '';
        const expectedReturnLabel = typeof sharedRecoverySource.expectedReturnLabel === 'string'
            ? sharedRecoverySource.expectedReturnLabel.trim()
            : '';
        const currentCheckpoint = (() => {
            if (review.checkpoints.length === 0) {
                return null;
            }

            const byKey = explicitCurrentCheckpointKey
                ? review.checkpoints.find(entry => entry && entry.key === explicitCurrentCheckpointKey)
                : null;
            const byStep = explicitCurrentCheckpointStep > 0
                ? review.checkpoints[explicitCurrentCheckpointStep - 1] || null
                : null;

            if (byKey && byStep && byKey === byStep) {
                return byKey;
            }
            if (byKey) {
                return byKey;
            }
            if (byStep) {
                return byStep;
            }

            const inferredMatches = review.checkpoints.filter((entry) => {
                if (!entry || typeof entry !== 'object') {
                    return false;
                }
                if (expectedReturnAttack && entry.expectedReturnAttack !== expectedReturnAttack) {
                    return false;
                }
                if (expectedReturnLabel && entry.expectedReturnLabel !== expectedReturnLabel) {
                    return false;
                }
                return Boolean(expectedReturnAttack || expectedReturnLabel);
            });
            return inferredMatches.length === 1 ? inferredMatches[0] : null;
        })();

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
                expectedReturnAttack,
                expectedReturnLabel,
                currentCheckpointKey: currentCheckpoint && typeof currentCheckpoint.key === 'string'
                    ? currentCheckpoint.key.trim()
                    : '',
                currentCheckpointStep: currentCheckpoint && Number.isInteger(currentCheckpoint.step)
                    ? Math.max(1, currentCheckpoint.step)
                    : 0,
                sharedRecoveryLabel: typeof sharedRecoverySource.sharedRecoveryLabel === 'string'
                    && sharedRecoverySource.sharedRecoveryLabel.trim()
                    ? sharedRecoverySource.sharedRecoveryLabel.trim()
                    : review.sharedRecoveryLabel,
                checkpointExpectedReturns
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
        const currentCountdownHeadMarkerShellCoreContrastMuted = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreWarmthMuted = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreSaturationMuted = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeSoftened = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced = currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowFinalWidthTrimmed = currentCountdownHeadMarkerLateGlowContained
            && currentCountdownHeadMarkerFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowOuterAlphaMuted = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowOuterWarmthMuted = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowOuterHeightTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerWidthTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerWarmthMuted = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerHeightTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerAlphaMuted = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
        const currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed = currentCountdownHeadMarkerLateGlowFinalWidthTrimmed;
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
                currentCountdownHeadMarkerLateGlowOuterAlphaMuted: false,
                currentCountdownHeadMarkerLateGlowOuterWarmthMuted: false,
                currentCountdownHeadMarkerLateGlowOuterHeightTrimmed: false,
                currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed: false,
                currentCountdownHeadMarkerLateGlowInnerWidthTrimmed: false,
                currentCountdownHeadMarkerLateGlowInnerWarmthMuted: false,
                currentCountdownHeadMarkerLateGlowInnerHeightTrimmed: false,
                currentCountdownHeadMarkerLateGlowInnerAlphaMuted: false,
                currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed: false,
                currentCountdownHeadMarkerInnerCoreFocused: false,
                currentCountdownHeadMarkerInnerCoreHeightTrimmed: false,
                currentCountdownHeadMarkerInnerCoreAlphaMuted: false,
                currentCountdownHeadMarkerFinalWidthTrimmed: false,
                currentCountdownHeadMarkerShellCoreContrastMuted: false,
                currentCountdownHeadMarkerShellCoreWarmthMuted: false,
                currentCountdownHeadMarkerShellCoreSaturationMuted: false,
                currentCountdownHeadMarkerShellCoreEdgeSoftened: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced: false,
                currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced: false,
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
            currentCountdownHeadMarkerLateGlowOuterAlphaMuted,
            currentCountdownHeadMarkerLateGlowOuterWarmthMuted,
            currentCountdownHeadMarkerLateGlowOuterHeightTrimmed,
            currentCountdownHeadMarkerLateGlowOuterRadiusTrimmed,
            currentCountdownHeadMarkerLateGlowInnerWidthTrimmed,
            currentCountdownHeadMarkerLateGlowInnerWarmthMuted,
            currentCountdownHeadMarkerLateGlowInnerHeightTrimmed,
            currentCountdownHeadMarkerLateGlowInnerAlphaMuted,
            currentCountdownHeadMarkerLateGlowInnerRadiusTrimmed,
            currentCountdownHeadMarkerInnerCoreFocused,
            currentCountdownHeadMarkerInnerCoreHeightTrimmed,
            currentCountdownHeadMarkerInnerCoreAlphaMuted,
            currentCountdownHeadMarkerFinalWidthTrimmed,
            currentCountdownHeadMarkerShellCoreContrastMuted,
            currentCountdownHeadMarkerShellCoreWarmthMuted,
            currentCountdownHeadMarkerShellCoreSaturationMuted,
            currentCountdownHeadMarkerShellCoreEdgeSoftened,
            currentCountdownHeadMarkerShellCoreEdgeHighlightFlattened,
            currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightWarmthBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightSaturationBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightFeatherBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightAlphaBalanced,
            currentCountdownHeadMarkerShellCoreEdgeHighlightWarmCoolAlphaBalanced,
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
        const finisherArmed = !!safe.finisherArmed;

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
        if (finisherArmed) {
            segments.push({
                key: 'finisher',
                label: '破势终结',
                ratio: hpRatio,
                color: 0x9FE3FF,
                alpha: 0.52
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

    function buildCraftRecipeAffordance(recipeKey, state, itemCatalog) {
        const recipe = getCraftingRecipe(recipeKey);
        if (!recipe) {
            return {
                label: '配方不可用',
                canCraft: false,
                maxCraftable: 0,
                blockedReason: 'recipe',
                missingItemKey: null
            };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const gold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const inventory = normalizeInventory(safeState.inventory);
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const goldCraftable = recipe.gold > 0
            ? Math.floor(gold / recipe.gold)
            : Number.MAX_SAFE_INTEGER;

        let materialCraftable = Number.MAX_SAFE_INTEGER;
        let firstMissingItemKey = null;
        let firstMissingCount = 0;

        Object.entries(recipe.materials || {}).forEach(([itemKey, requiredCountRaw]) => {
            const requiredCount = clampInt(requiredCountRaw, 1, Number.MAX_SAFE_INTEGER, 1);
            const currentCount = clampInt(inventory[itemKey], 0, Number.MAX_SAFE_INTEGER, 0);
            materialCraftable = Math.min(materialCraftable, Math.floor(currentCount / requiredCount));
            if (!firstMissingItemKey && currentCount < requiredCount) {
                firstMissingItemKey = itemKey;
                firstMissingCount = requiredCount - currentCount;
            }
        });

        const maxCraftable = Math.max(0, Math.min(goldCraftable, materialCraftable));
        if (maxCraftable > 0) {
            return {
                label: `可做x${maxCraftable}`,
                canCraft: true,
                maxCraftable,
                blockedReason: null,
                missingItemKey: null
            };
        }

        if (goldCraftable <= 0) {
            return {
                label: `差${Math.max(0, recipe.gold - gold)}金`,
                canCraft: false,
                maxCraftable: 0,
                blockedReason: 'gold',
                missingItemKey: null
            };
        }

        const missingItemName = firstMissingItemKey && safeItemCatalog[firstMissingItemKey] && typeof safeItemCatalog[firstMissingItemKey].name === 'string'
            ? safeItemCatalog[firstMissingItemKey].name
            : (firstMissingItemKey || '材料');
        return {
            label: `差${Math.max(1, firstMissingCount)}个${missingItemName}`,
            canCraft: false,
            maxCraftable: 0,
            blockedReason: 'material',
            missingItemKey: firstMissingItemKey
        };
    }

    function buildCraftRecipeQuickSlotPreview(recipeKey, state, itemCatalog, options) {
        const recipe = getCraftingRecipe(recipeKey);
        if (!recipe || typeof recipe.itemKey !== 'string' || !recipe.itemKey) {
            return {
                label: '',
                slotIndex: null,
                didOverwrite: false,
                assignedItemKey: null,
                replacedItemKey: null,
                notice: ''
            };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const craftedItem = safeItemCatalog[recipe.itemKey];
        if (craftedItem && craftedItem.type && craftedItem.type !== 'consumable') {
            return {
                label: '',
                slotIndex: null,
                didOverwrite: false,
                assignedItemKey: recipe.itemKey,
                replacedItemKey: null,
                notice: ''
            };
        }

        const autoAssign = buildQuickSlotAutoAssignResult(
            safeState.quickSlots,
            recipe.itemKey,
            safeItemCatalog,
            options
        );
        const slotIndex = clampInt(autoAssign.slotIndex, 0, 3, 0);
        return {
            label: buildCraftRecipeQuickSlotSummaryFromAutoAssignResult(autoAssign),
            slotIndex,
            didOverwrite: autoAssign.didOverwrite,
            assignedItemKey: autoAssign.assignedItemKey,
            replacedItemKey: autoAssign.replacedItemKey,
            notice: autoAssign.notice || ''
        };
    }

    function buildCraftRecipeQuickSlotSummaryFromAutoAssignResult(autoAssignResult) {
        const safeAutoAssignResult = autoAssignResult && typeof autoAssignResult === 'object'
            ? autoAssignResult
            : {};
        const slotIndex = clampInt(safeAutoAssignResult.slotIndex, 0, 3, 0);
        const slotNumber = slotIndex + 1;
        const noticePrefix = `快捷栏${slotNumber}：`;
        const previewTail = typeof safeAutoAssignResult.notice === 'string' && safeAutoAssignResult.notice.startsWith(noticePrefix)
            ? safeAutoAssignResult.notice.slice(noticePrefix.length).trim()
            : '';
        if (safeAutoAssignResult.didOverwrite) {
            return `覆盖${slotNumber}${previewTail ? `：${previewTail}` : ''}`;
        }
        if (!safeAutoAssignResult.assignedItemKey && !previewTail) {
            return '';
        }
        return `入${slotNumber}`;
    }

    function getCraftRecipeRowTextWidth(text, options) {
        const safeText = typeof text === 'string' ? text : '';
        if (!safeText) return 0;
        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        if (measureTextWidth) {
            const measuredWidth = Number(measureTextWidth(safeText));
            if (Number.isFinite(measuredWidth) && measuredWidth > 0) {
                return measuredWidth;
            }
        }
        return Array.from(safeText).reduce((sum, glyph) => sum + (getQuickSlotNoticeGlyphWidth(glyph) * 8), 0);
    }

    function buildCraftRecipeMaterialText(materials, itemCatalog, compact) {
        const safeMaterials = materials && typeof materials === 'object' ? materials : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        return Object.entries(safeMaterials)
            .map(([itemKey, countRaw]) => {
                const count = clampInt(countRaw, 1, Number.MAX_SAFE_INTEGER, 1);
                const itemName = safeItemCatalog[itemKey] && typeof safeItemCatalog[itemKey].name === 'string'
                    ? safeItemCatalog[itemKey].name
                    : itemKey;
                if (!compact) {
                    return `${count}${itemName}`;
                }
                const compactName = itemName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim();
                return `${compactName || itemName}x${count}`;
            })
            .join(' + ');
    }

    function buildCraftRecipeRowLabel(recipeKey, state, itemCatalog, options) {
        const recipe = getCraftingRecipe(recipeKey);
        if (!recipe) return recipeKey;

        const safeState = state && typeof state === 'object' ? state : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const item = safeItemCatalog[recipe.itemKey];
        const itemName = item && typeof item.name === 'string'
            ? item.name
            : recipe.itemKey;
        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        const inventory = normalizeInventory(safeState.inventory);
        const ownedCount = clampInt(inventory[recipe.itemKey], 0, Number.MAX_SAFE_INTEGER, 0);
        const fullMaterialsText = buildCraftRecipeMaterialText(recipe.materials, safeItemCatalog, false);
        const compactMaterialsText = buildCraftRecipeMaterialText(recipe.materials, safeItemCatalog, true);
        const fullCostText = fullMaterialsText ? `${recipe.gold}金 + ${fullMaterialsText}` : `${recipe.gold}金`;
        const compactCostText = compactMaterialsText ? `${recipe.gold}金 + ${compactMaterialsText}` : `${recipe.gold}金`;
        const affordance = buildCraftRecipeAffordance(recipeKey, safeState, safeItemCatalog);
        const quickSlotPreview = buildCraftRecipeQuickSlotPreview(recipeKey, safeState, safeItemCatalog, {
            measureLabelWidth: measureTextWidth
        });
        const affordanceLabel = affordance && typeof affordance.label === 'string' ? affordance.label : '';
        const previewLabel = quickSlotPreview && typeof quickSlotPreview.label === 'string' ? quickSlotPreview.label : '';
        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        const buildBaseVariants = () => {
            const candidates = [
                `${itemName} — ${fullCostText}  拥有:${ownedCount}`,
                `${itemName} — ${fullCostText}`,
                `${itemName} — ${compactCostText}`,
                `${itemName} — ${recipe.gold}金`
            ].filter(Boolean);
            return Array.from(new Set(candidates));
        };
        const buildSuffixVariants = () => {
            const candidates = [];
            if (affordanceLabel && previewLabel) {
                candidates.push({
                    suffix: ` · ${affordanceLabel} · ${previewLabel}`,
                    allowedBaseCount: 3,
                    allowBaseClamp: false
                });
            }
            if (affordanceLabel) {
                candidates.push({
                    suffix: ` · ${affordanceLabel}`,
                    allowedBaseCount: 4,
                    allowBaseClamp: true
                });
            } else if (previewLabel) {
                candidates.push({
                    suffix: ` · ${previewLabel}`,
                    allowedBaseCount: 3,
                    allowBaseClamp: true
                });
            }
            candidates.push({
                suffix: '',
                allowedBaseCount: 4,
                allowBaseClamp: true
            });
            return candidates;
        };
        const baseVariants = buildBaseVariants();
        const suffixVariants = buildSuffixVariants();
        const preferredClampBase = `${itemName} — ${compactCostText}`;

        if (maxWidth <= 0) {
            return `${baseVariants[0]}${suffixVariants[0] ? suffixVariants[0].suffix : ''}`;
        }

        for (const suffixVariant of suffixVariants) {
            const suffix = suffixVariant ? suffixVariant.suffix : '';
            const allowedBaseCount = suffixVariant && Number.isFinite(suffixVariant.allowedBaseCount)
                ? Math.max(1, suffixVariant.allowedBaseCount)
                : baseVariants.length;
            const allowBaseClamp = !(suffixVariant && suffixVariant.allowBaseClamp === false);
            const allowedBaseVariants = baseVariants.slice(0, allowedBaseCount);
            for (const base of allowedBaseVariants) {
                const label = `${base}${suffix}`;
                if (getCraftRecipeRowTextWidth(label, { measureTextWidth }) <= maxWidth) {
                    return label;
                }
            }
            if (suffix && allowBaseClamp) {
                const suffixWidth = getCraftRecipeRowTextWidth(suffix, { measureTextWidth });
                if (suffixWidth < maxWidth) {
                    const clampedBase = clampTextToWidth(preferredClampBase, maxWidth - suffixWidth, {
                        measureGlyphWidth,
                        measurementCache
                    });
                    if (clampedBase) {
                        return `${clampedBase}${suffix}`;
                    }
                }
            }
        }

        return clampTextToWidth(`${preferredClampBase}${affordanceLabel ? ` · ${affordanceLabel}` : ''}`, maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildCraftRecipeBatchReceipt(recipeKey, craftResult, itemCatalog) {
        const safeCraftResult = craftResult && typeof craftResult === 'object' ? craftResult : {};
        const producedCount = clampInt(safeCraftResult.producedCount, 0, Number.MAX_SAFE_INTEGER, 0);
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const producedItemKey = typeof safeCraftResult.producedItemKey === 'string'
            ? safeCraftResult.producedItemKey
            : '';
        const producedItemName = producedItemKey
            && safeItemCatalog[producedItemKey]
            && typeof safeItemCatalog[producedItemKey].name === 'string'
            ? safeItemCatalog[producedItemKey].name
            : (producedItemKey || '道具');
        const baseLabel = `${producedItemName}x${Math.max(1, producedCount)}`;
        const stopAffordance = buildCraftRecipeAffordance(recipeKey, safeCraftResult.nextState, safeItemCatalog);
        const stopLabel = stopAffordance
            && !stopAffordance.canCraft
            && typeof stopAffordance.label === 'string'
            && stopAffordance.label.startsWith('差')
            ? stopAffordance.label
            : '';
        return stopLabel ? `${baseLabel} · ${stopLabel}` : baseLabel;
    }

    function buildCraftRecipeFailureMessage(failure, itemCatalog, options) {
        const safeFailure = failure && typeof failure === 'object'
            ? failure
            : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const reason = typeof safeFailure.blockedReason === 'string' && safeFailure.blockedReason
            ? safeFailure.blockedReason
            : (typeof safeFailure.reason === 'string' ? safeFailure.reason : '');
        const rawLabel = typeof safeFailure.label === 'string' ? safeFailure.label.trim() : '';
        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        const missingItemKey = typeof safeFailure.missingItemKey === 'string'
            ? safeFailure.missingItemKey
            : '';
        const missingCount = Math.max(
            0,
            clampInt(
                safeFailure.missingCount,
                0,
                Number.MAX_SAFE_INTEGER,
                Math.max(
                    0,
                    clampInt(safeFailure.requiredCount, 0, Number.MAX_SAFE_INTEGER, 0)
                    - clampInt(safeFailure.currentCount, 0, Number.MAX_SAFE_INTEGER, 0)
                )
            )
        );
        const missingItemName = missingItemKey
            && safeItemCatalog[missingItemKey]
            && typeof safeItemCatalog[missingItemKey].name === 'string'
            ? safeItemCatalog[missingItemKey].name
            : missingItemKey;
        const compactMissingItemName = typeof missingItemName === 'string'
            ? missingItemName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim()
            : '';
        const genericReason = rawLabel
            ? rawLabel.split(/[：:，,]/u)[0].trim()
            : '';
        const variants = [];
        const pushVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || variants.includes(safeValue)) return;
            variants.push(safeValue);
        };

        if (reason === 'material' && missingItemName) {
            pushVariant(rawLabel || `材料不足: ${missingItemName}`);
            if (compactMissingItemName && compactMissingItemName !== missingItemName) {
                pushVariant(`材料不足: ${compactMissingItemName}`);
            }
            if (missingCount > 0) {
                pushVariant(`差${missingCount}个${missingItemName}`);
                if (compactMissingItemName && compactMissingItemName !== missingItemName) {
                    pushVariant(`差${missingCount}个${compactMissingItemName}`);
                }
            }
            pushVariant('材料不足');
            pushVariant('当前无法制作');
        } else if (reason === 'gold') {
            pushVariant(rawLabel || '金币不足!');
            pushVariant('金币不足');
            pushVariant('当前无法制作');
        } else if (reason === 'recipe') {
            pushVariant(rawLabel || '配方不可用');
            pushVariant('当前无法制作');
        } else if (reason === 'apply') {
            pushVariant(rawLabel || '制作失败，请重试');
            pushVariant(genericReason || '制作失败');
            pushVariant('当前无法制作');
        } else {
            pushVariant(rawLabel || '当前无法制作');
            if (genericReason && genericReason !== rawLabel) {
                pushVariant(genericReason);
            }
        }

        if (variants.length === 0) {
            return '当前无法制作';
        }
        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildCraftRecipeSuccessMessage(recipeKey, craftResult, autoAssignResult, itemCatalog, options) {
        const batchReceipt = buildCraftRecipeBatchReceipt(recipeKey, craftResult, itemCatalog);
        const safeAutoAssignResult = autoAssignResult && typeof autoAssignResult === 'object'
            ? autoAssignResult
            : {};
        const fullNotice = typeof safeAutoAssignResult.notice === 'string' ? safeAutoAssignResult.notice.trim() : '';
        const compactNotice = buildCraftRecipeQuickSlotSummaryFromAutoAssignResult(safeAutoAssignResult);
        if (!fullNotice && !compactNotice) {
            return batchReceipt;
        }

        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        if (maxWidth <= 0) {
            return `${batchReceipt} · ${fullNotice || compactNotice}`;
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        const suffixVariants = [];
        if (fullNotice) {
            suffixVariants.push(fullNotice);
        }
        if (compactNotice && compactNotice !== fullNotice) {
            suffixVariants.push(compactNotice);
        }
        suffixVariants.push('');

        for (const suffix of suffixVariants) {
            const label = suffix ? `${batchReceipt} · ${suffix}` : batchReceipt;
            if (getCraftRecipeRowTextWidth(label, { measureTextWidth }) <= maxWidth) {
                return label;
            }
        }

        return clampTextToWidth(batchReceipt, maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function applyCraftRecipe(state, recipeKey, options) {
        const check = canCraftRecipe(state, recipeKey);
        if (!check.ok || !check.recipe) {
            return { ...check, nextState: null };
        }

        const safeState = state && typeof state === 'object' ? state : {};
        const inventory = normalizeInventory(safeState.inventory);
        const maxCraftable = Math.max(1, buildCraftRecipeAffordance(recipeKey, safeState).maxCraftable || 1);
        const craftCount = Math.max(
            1,
            Math.min(
                maxCraftable,
                clampInt(options && options.count, 1, Number.MAX_SAFE_INTEGER, 1)
            )
        );
        const nextState = {
            ...safeState,
            inventory,
            gold: clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0)
        };

        nextState.gold -= check.recipe.gold * craftCount;
        Object.entries(check.recipe.materials || {}).forEach(([itemKey, requiredCountRaw]) => {
            const requiredCount = clampInt(requiredCountRaw, 1, Number.MAX_SAFE_INTEGER, 1);
            const left = (nextState.inventory[itemKey] || 0) - requiredCount * craftCount;
            if (left > 0) nextState.inventory[itemKey] = left;
            else delete nextState.inventory[itemKey];
        });
        nextState.inventory[check.recipe.itemKey] = (nextState.inventory[check.recipe.itemKey] || 0) + (check.recipe.count * craftCount);

        return {
            ok: true,
            reason: null,
            recipe: check.recipe,
            craftCount,
            producedItemKey: check.recipe.itemKey,
            producedCount: check.recipe.count * craftCount,
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
            lastRunSummary: normalizeLastRunSummary(data.lastRunSummary),
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
            weaponKey,
            level: check.level,
            nextLevel: check.level + 1,
            cost: check.cost,
            requiredMaterialKey: check.requiredMaterialKey,
            nextState
        };
    }

    function buildWeaponUpgradeAffordance(weaponKey, state, itemCatalog) {
        const safeState = state && typeof state === 'object' ? state : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const check = canUpgradeWeapon(safeState, weaponKey);
        if (check.ok) {
            return {
                label: '可强化',
                canUpgrade: true,
                blockedReason: null,
                missingItemKey: null,
                missingCount: 0
            };
        }

        const gold = clampInt(safeState.gold, 0, Number.MAX_SAFE_INTEGER, 0);
        const inventory = normalizeInventory(safeState.inventory);
        if (check.reason === 'gold' && check.cost) {
            return {
                label: `差${Math.max(0, check.cost.gold - gold)}金`,
                canUpgrade: false,
                blockedReason: 'gold',
                missingItemKey: null,
                missingCount: 0
            };
        }

        if (check.reason === 'material' && check.requiredMaterialKey) {
            const currentCount = clampInt(inventory[check.requiredMaterialKey], 0, Number.MAX_SAFE_INTEGER, 0);
            const requiredCount = clampInt(check.cost && check.cost.essence, 1, Number.MAX_SAFE_INTEGER, 1);
            const missingCount = Math.max(1, requiredCount - currentCount);
            const materialName = safeItemCatalog[check.requiredMaterialKey]
                && typeof safeItemCatalog[check.requiredMaterialKey].name === 'string'
                ? safeItemCatalog[check.requiredMaterialKey].name
                : check.requiredMaterialKey;
            return {
                label: `差${Math.max(1, missingCount)}个${materialName}`,
                canUpgrade: false,
                blockedReason: 'material',
                missingItemKey: check.requiredMaterialKey,
                missingCount
            };
        }

        return {
            label: '',
            canUpgrade: false,
            blockedReason: check.reason || 'unknown',
            missingItemKey: null,
            missingCount: 0
        };
    }

    function buildWeaponUpgradeBenefitSummary(weaponKey, fromLevel, toLevel, weapons, scalingOverride, options) {
        const safeWeapons = weapons && typeof weapons === 'object' ? weapons : {};
        const safeScaling = scalingOverride || WEAPON_SCALING;
        const safeFromLevel = clampInt(fromLevel, 1, 99, 1);
        const safeToLevel = clampInt(toLevel, safeFromLevel, 99, safeFromLevel);
        const currentStats = getScaledWeaponStats(safeWeapons, weaponKey, safeFromLevel, safeScaling);
        const nextStats = getScaledWeaponStats(safeWeapons, weaponKey, safeToLevel, safeScaling);
        if (!currentStats || !nextStats || safeToLevel <= safeFromLevel) {
            return '';
        }

        const damageDelta = Math.max(0, nextStats.damage - currentStats.damage);
        const specialCooldownDelta = Math.max(0, currentStats.specialCooldown - nextStats.specialCooldown);
        const staminaDelta = Math.max(
            0,
            currentStats.staminaCost - nextStats.staminaCost,
            currentStats.specialStaminaCost - nextStats.specialStaminaCost
        );
        const specialCooldownSeconds = Math.max(0.1, Math.round((specialCooldownDelta / 1000) * 10) / 10).toFixed(1);
        const variants = [];
        const pushVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || variants.includes(safeValue)) return;
            variants.push(safeValue);
        };

        const labelPrefix = options && typeof options.labelPrefix === 'string'
            ? options.labelPrefix.trim()
            : '';
        const withLabelPrefix = (value) => {
            const safeValue = typeof value === 'string' ? value.trim() : '';
            if (!safeValue) return '';
            return labelPrefix ? `${labelPrefix}${safeValue}` : safeValue;
        };

        if (damageDelta > 0 && specialCooldownDelta > 0 && staminaDelta > 0) {
            pushVariant(withLabelPrefix(`伤害+${damageDelta} / 特攻-${specialCooldownSeconds}s / 体耗-${staminaDelta}`));
        }
        if (damageDelta > 0 && specialCooldownDelta > 0) {
            pushVariant(withLabelPrefix(`伤害+${damageDelta} / 特攻-${specialCooldownSeconds}s`));
        }
        if (damageDelta > 0 && staminaDelta > 0) {
            pushVariant(withLabelPrefix(`伤害+${damageDelta} / 体耗-${staminaDelta}`));
        }
        if (damageDelta > 0) {
            pushVariant(withLabelPrefix(`伤害+${damageDelta}`));
        }
        if (specialCooldownDelta > 0) {
            pushVariant(withLabelPrefix(`特攻-${specialCooldownSeconds}s`));
        }
        if (staminaDelta > 0) {
            pushVariant(withLabelPrefix(`体耗-${staminaDelta}`));
        }
        if (variants.length === 0) {
            return '';
        }

        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildWeaponUpgradePreviewSummary(weaponKey, state, weapons, itemCatalog, scalingOverride, options) {
        const safeState = state && typeof state === 'object' ? state : {};
        const safeWeapons = weapons && typeof weapons === 'object' ? weapons : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const safeScaling = scalingOverride || WEAPON_SCALING;
        const baseWeapon = safeWeapons[weaponKey];
        if (!baseWeapon) return weaponKey;

        const level = getWeaponLevel(safeState.weaponLevels, weaponKey);
        const baseLabel = `${baseWeapon.name} Lv.${level}`;
        const affordance = buildWeaponUpgradeAffordance(weaponKey, safeState, safeItemCatalog);
        const isMaxLevel = affordance && affordance.blockedReason === 'max_level';
        const rawAffordanceLabel = affordance && typeof affordance.label === 'string'
            ? affordance.label.trim()
            : '';
        const affordanceVariants = [];
        const pushAffordanceVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || affordanceVariants.includes(safeValue)) return;
            affordanceVariants.push(safeValue);
        };
        pushAffordanceVariant(rawAffordanceLabel);
        if (isMaxLevel) {
            pushAffordanceVariant('已满级');
            pushAffordanceVariant('满阶');
            pushAffordanceVariant('满');
        }
        if (affordance && affordance.blockedReason === 'material' && affordance.missingItemKey) {
            const materialName = safeItemCatalog[affordance.missingItemKey]
                && typeof safeItemCatalog[affordance.missingItemKey].name === 'string'
                ? safeItemCatalog[affordance.missingItemKey].name
                : affordance.missingItemKey;
            const compactMaterialName = typeof materialName === 'string'
                ? materialName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim()
                : '';
            if (affordance.missingCount > 0 && compactMaterialName && compactMaterialName !== materialName) {
                pushAffordanceVariant(`差${affordance.missingCount}个${compactMaterialName}`);
            }
            if (affordance.missingCount > 0) {
                pushAffordanceVariant(`差${affordance.missingCount}个`);
            }
        }
        if (affordanceVariants.length === 0) {
            affordanceVariants.push('');
        }

        const nextBenefitSummary = isMaxLevel
            ? ''
            : buildWeaponUpgradeBenefitSummary(weaponKey, level, level + 1, safeWeapons, safeScaling, {
                labelPrefix: '本次',
                measureTextWidth: options && options.measureTextWidth,
                maxWidth: options && options.maxWidth
            });
        const cumulativeBenefitSummary = level > 1
            ? buildWeaponUpgradeBenefitSummary(weaponKey, 1, level, safeWeapons, safeScaling, {
                labelPrefix: '累计',
                measureTextWidth: options && options.measureTextWidth,
                maxWidth: options && options.maxWidth
            })
            : '';
        const benefitSummary = isMaxLevel ? cumulativeBenefitSummary : nextBenefitSummary;
        const benefitVariants = [];
        const pushBenefitVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || benefitVariants.includes(safeValue)) return;
            benefitVariants.push(safeValue);
        };
        pushBenefitVariant(benefitSummary);
        const benefitSegments = typeof benefitSummary === 'string'
            ? benefitSummary.split(' / ').map(segment => segment.trim()).filter(Boolean)
            : [];
        if (benefitSegments.length >= 2) {
            pushBenefitVariant(benefitSegments.slice(0, 2).join(' / '));
        }
        if (benefitSegments.length >= 1) {
            pushBenefitVariant(benefitSegments[0]);
        }

        const variants = [];
        const pushVariant = (parts) => {
            const safeParts = Array.isArray(parts) ? parts.filter(Boolean) : [];
            if (!safeParts.length) return;
            const label = safeParts.join(' · ');
            if (!variants.includes(label)) {
                variants.push(label);
            }
        };

        const layeredVariants = [];
        const pushLayeredVariant = (parts) => {
            const safeParts = Array.isArray(parts) ? parts.filter(Boolean) : [];
            if (!safeParts.length) return;
            const label = safeParts.join(' · ');
            if (!layeredVariants.includes(label)) {
                layeredVariants.push(label);
            }
        };
        const buildCompactLayerAnchor = (segment, anchorLabel) => {
            if (typeof segment !== 'string' || typeof anchorLabel !== 'string') {
                return '';
            }
            const safeSegment = segment.trim();
            const safeAnchorLabel = anchorLabel.trim();
            if (!safeSegment || !safeAnchorLabel) {
                return '';
            }
            const deltaMatch = safeSegment.match(/([+-].+)$/u);
            if (!deltaMatch || !deltaMatch[1]) {
                return '';
            }
            return `${safeAnchorLabel}${deltaMatch[1]}`;
        };
        if (!isMaxLevel && cumulativeBenefitSummary && nextBenefitSummary) {
            const cumulativeSegments = cumulativeBenefitSummary.split(' / ').map(segment => segment.trim()).filter(Boolean);
            const nextSegments = nextBenefitSummary.split(' / ').map(segment => segment.trim()).filter(Boolean);
            const cumulativePrimarySegment = cumulativeSegments[0] || '';
            const nextPrimarySegment = nextSegments[0] || '';
            const compactCumulativeAnchor = buildCompactLayerAnchor(cumulativePrimarySegment, '累计');
            const compactNextAnchor = buildCompactLayerAnchor(nextPrimarySegment, '下次');
            if (cumulativePrimarySegment && nextPrimarySegment) {
                pushLayeredVariant([baseLabel, '累计+下次', `${cumulativePrimarySegment} / ${nextPrimarySegment}`]);
                if (compactCumulativeAnchor && compactNextAnchor) {
                    pushLayeredVariant([baseLabel, `${compactCumulativeAnchor} / ${compactNextAnchor}`]);
                }
                pushLayeredVariant([baseLabel, `累计${level > 1 ? '已购' : ''}`, cumulativePrimarySegment, nextPrimarySegment]);
                pushLayeredVariant([baseLabel, `${cumulativePrimarySegment} / ${nextPrimarySegment}`]);
            }
        }
        layeredVariants.forEach(label => {
            if (!variants.includes(label)) {
                variants.push(label);
            }
        });
        if (benefitVariants.length > 0) {
            benefitVariants.forEach((benefit) => {
                affordanceVariants.forEach((affordanceLabel) => {
                    pushVariant([baseLabel, affordanceLabel, benefit]);
                });
            });
        }
        affordanceVariants.forEach((affordanceLabel) => {
            pushVariant([baseLabel, affordanceLabel]);
        });
        pushVariant([baseLabel]);

        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildWeaponUpgradeRowLabel(weaponKey, level, itemCatalog, options) {
        const cost = getUpgradeCostForLevel(level);
        const requiredMaterialKey = getRequiredMaterialForWeapon(weaponKey);
        if (!requiredMaterialKey) {
            return '[强化]';
        }

        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        const variants = [];
        const pushVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || variants.includes(safeValue)) return;
            variants.push(safeValue);
        };

        if (!cost) {
            pushVariant('已满级');
            pushVariant('满阶');
            pushVariant('满');
            if (maxWidth <= 0) {
                return variants[0];
            }

            const measureGlyphWidth = measureTextWidth
                ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
                : null;
            const measurementCache = measureGlyphWidth ? new Map() : null;
            for (const variant of variants) {
                if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                    return variant;
                }
            }

            return clampTextToWidth(variants[variants.length - 1], maxWidth, {
                measureGlyphWidth,
                measurementCache
            });
        }

        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const materialName = safeItemCatalog[requiredMaterialKey]
            && typeof safeItemCatalog[requiredMaterialKey].name === 'string'
            ? safeItemCatalog[requiredMaterialKey].name
            : requiredMaterialKey;
        const compactMaterialName = typeof materialName === 'string'
            ? materialName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim()
            : '';
        pushVariant(`[强化] ${cost.gold}金+${cost.essence}${materialName}`);
        if (compactMaterialName && compactMaterialName !== materialName) {
            pushVariant(`[强化] ${cost.gold}金+${cost.essence}${compactMaterialName}`);
        }
        pushVariant(`[强化] ${cost.gold}金+${cost.essence}个`);
        pushVariant(`[强化] ${cost.gold}金`);
        pushVariant('[强化]');

        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildWeaponUpgradeFailureMessage(result, itemCatalog, options) {
        const safeResult = result && typeof result === 'object'
            ? result
            : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const reason = typeof safeResult.reason === 'string' ? safeResult.reason : '';
        const rawLabel = typeof safeResult.label === 'string' ? safeResult.label.trim() : '';
        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        const requiredCount = Math.max(
            0,
            clampInt(
                safeResult.requiredCount,
                0,
                Number.MAX_SAFE_INTEGER,
                clampInt(
                    safeResult.cost && safeResult.cost.essence,
                    0,
                    Number.MAX_SAFE_INTEGER,
                    0
                )
            )
        );
        const requiredMaterialKey = typeof safeResult.requiredMaterialKey === 'string'
            ? safeResult.requiredMaterialKey
            : '';
        const materialName = requiredMaterialKey
            && safeItemCatalog[requiredMaterialKey]
            && typeof safeItemCatalog[requiredMaterialKey].name === 'string'
            ? safeItemCatalog[requiredMaterialKey].name
            : requiredMaterialKey;
        const compactMaterialName = typeof materialName === 'string'
            ? materialName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim()
            : '';
        const variants = [];
        const pushVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || variants.includes(safeValue)) return;
            variants.push(safeValue);
        };

        if (reason === 'material') {
            if (rawLabel) {
                pushVariant(rawLabel);
            } else if (requiredCount > 0 && materialName) {
                pushVariant(`材料不足! 需要${requiredCount}个${materialName}`);
            } else {
                pushVariant('材料不足!');
            }
            if (requiredCount > 0 && compactMaterialName && compactMaterialName !== materialName) {
                pushVariant(`材料不足! 需要${requiredCount}个${compactMaterialName}`);
            }
            if (requiredCount > 0) {
                pushVariant(`材料不足! 需要${requiredCount}个`);
            }
            pushVariant('材料不足!');
            pushVariant('当前无法强化');
        } else if (reason === 'gold') {
            pushVariant(rawLabel || '金币不足!');
            pushVariant('当前无法强化');
        } else if (reason === 'max_level') {
            pushVariant(rawLabel || '该武器已达最高等级');
            pushVariant('当前无法强化');
        } else if (reason === 'material_binding_missing') {
            pushVariant(rawLabel || '该武器缺少强化材料绑定');
            pushVariant('当前无法强化');
        } else {
            pushVariant(rawLabel || '当前无法强化');
        }

        if (variants.length === 0) {
            return '当前无法强化';
        }
        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
    }

    function buildWeaponUpgradeSuccessMessage(result, itemCatalog, weapons, scalingOverride, options) {
        const safeResult = result && typeof result === 'object'
            ? result
            : {};
        const safeItemCatalog = itemCatalog && typeof itemCatalog === 'object' ? itemCatalog : {};
        const safeWeapons = weapons && typeof weapons === 'object' ? weapons : {};
        const safeScaling = scalingOverride || WEAPON_SCALING;
        const rawLabel = typeof safeResult.label === 'string' ? safeResult.label.trim() : '';
        const measureTextWidth = options && typeof options.measureTextWidth === 'function'
            ? options.measureTextWidth
            : null;
        const maxWidth = Number.isFinite(options && options.maxWidth)
            ? Math.max(0, options.maxWidth)
            : 0;
        const spentCount = Math.max(
            0,
            clampInt(
                safeResult.cost && safeResult.cost.essence,
                0,
                Number.MAX_SAFE_INTEGER,
                0
            )
        );
        const requiredMaterialKey = typeof safeResult.requiredMaterialKey === 'string'
            ? safeResult.requiredMaterialKey
            : '';
        const materialName = requiredMaterialKey
            && safeItemCatalog[requiredMaterialKey]
            && typeof safeItemCatalog[requiredMaterialKey].name === 'string'
            ? safeItemCatalog[requiredMaterialKey].name
            : requiredMaterialKey;
        const compactMaterialName = typeof materialName === 'string'
            ? materialName.replace(/\s+/g, '').replace(/之精华$/u, '').replace(/精华$/u, '').trim()
            : '';
        const variants = [];
        const pushVariant = (value) => {
            if (typeof value !== 'string') return;
            const safeValue = value.trim();
            if (!safeValue || variants.includes(safeValue)) return;
            variants.push(safeValue);
        };

        const benefitSummary = buildWeaponUpgradeBenefitSummary(
            safeResult.weaponKey,
            safeResult.level,
            safeResult.nextLevel,
            safeWeapons,
            safeScaling,
            {
                labelPrefix: '本次'
            }
        );
        const fromLevel = clampInt(safeResult.level, 1, 99, 1);
        const toLevel = clampInt(safeResult.nextLevel, fromLevel, 99, fromLevel);
        const levelTransition = toLevel > fromLevel ? `Lv.${fromLevel}→Lv.${toLevel}` : '';
        const cumulativeBenefitSummary = toLevel > 2
            ? buildWeaponUpgradeBenefitSummary(
                safeResult.weaponKey,
                1,
                toLevel,
                safeWeapons,
                safeScaling,
                {
                    labelPrefix: '累计'
                }
            )
            : '';
        const cumulativeSegments = cumulativeBenefitSummary.split(' / ').map(segment => segment.trim()).filter(Boolean);
        const buildCompactLayerAnchor = (segment, anchorLabel) => {
            if (typeof segment !== 'string' || typeof anchorLabel !== 'string') {
                return '';
            }
            const safeSegment = segment.trim();
            const safeAnchorLabel = anchorLabel.trim();
            if (!safeSegment || !safeAnchorLabel) {
                return '';
            }
            const deltaMatch = safeSegment.match(/([+-].+)$/u);
            if (!deltaMatch || !deltaMatch[1]) {
                return '';
            }
            return `${safeAnchorLabel}${deltaMatch[1]}`;
        };
        const compactCumulativeAnchor = [
            buildCompactLayerAnchor(cumulativeSegments[0] || '', '累计'),
            cumulativeSegments[1] || ''
        ].filter(Boolean).join(' / ');
        const cumulativePrimaryAnchor = cumulativeSegments[0] || '';
        const fullSpendAnchor = spentCount > 0 && materialName
            ? `消耗${spentCount}个${materialName}`
            : '';
        const compactSpendAnchor = spentCount > 0 && compactMaterialName && compactMaterialName !== materialName
            ? `消耗${spentCount}个${compactMaterialName}`
            : '';
        if (benefitSummary) {
            const benefitSegments = benefitSummary.split(' / ').map(segment => segment.trim()).filter(Boolean);
            if (levelTransition && cumulativeBenefitSummary) {
                if (fullSpendAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${cumulativeBenefitSummary} · ${fullSpendAnchor}`);
                }
                if (compactSpendAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${cumulativeBenefitSummary} · ${compactSpendAnchor}`);
                }
                if (compactCumulativeAnchor) {
                    if (compactSpendAnchor) {
                        pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${compactCumulativeAnchor} · ${compactSpendAnchor}`);
                    }
                }
                if (cumulativePrimaryAnchor) {
                    if (compactSpendAnchor) {
                        pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${cumulativePrimaryAnchor} · ${compactSpendAnchor}`);
                    }
                }
                pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${cumulativeBenefitSummary}`);
                if (compactCumulativeAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${compactCumulativeAnchor}`);
                }
                if (cumulativePrimaryAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${cumulativePrimaryAnchor}`);
                }
            }
            if (levelTransition) {
                if (fullSpendAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${fullSpendAnchor}`);
                }
                if (compactSpendAnchor) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSummary} · ${compactSpendAnchor}`);
                }
                pushVariant(`强化成功! ${levelTransition} · ${benefitSummary}`);
            }
            if (benefitSegments.length >= 2) {
                if (levelTransition) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSegments.slice(0, 2).join(' / ')}`);
                }
            }
            if (benefitSegments.length >= 1) {
                if (levelTransition) {
                    pushVariant(`强化成功! ${levelTransition} · ${benefitSegments[0]}`);
                }
            }
            if (levelTransition) {
                pushVariant(`强化成功! ${levelTransition}`);
            }
            pushVariant(`强化成功! ${benefitSummary}`);
            if (benefitSegments.length >= 2) {
                pushVariant(`强化成功! ${benefitSegments.slice(0, 2).join(' / ')}`);
            }
            if (benefitSegments.length >= 1) {
                pushVariant(`强化成功! ${benefitSegments[0]}`);
            }
        }
        if (rawLabel) {
            pushVariant(rawLabel);
        } else if (spentCount > 0 && materialName) {
            pushVariant(`强化成功! 消耗${spentCount}个${materialName}`);
        } else {
            pushVariant('强化成功!');
        }
        if (spentCount > 0 && compactMaterialName && compactMaterialName !== materialName) {
            pushVariant(`强化成功! 消耗${spentCount}个${compactMaterialName}`);
        }
        if (spentCount > 0) {
            pushVariant(`强化成功! 消耗${spentCount}个`);
        }
        pushVariant('强化成功!');
        pushVariant('强化成功');

        if (maxWidth <= 0) {
            return variants[0];
        }

        const measureGlyphWidth = measureTextWidth
            ? glyph => getCraftRecipeRowTextWidth(glyph, { measureTextWidth })
            : null;
        const measurementCache = measureGlyphWidth ? new Map() : null;
        for (const variant of variants) {
            if (getCraftRecipeRowTextWidth(variant, { measureTextWidth }) <= maxWidth) {
                return variant;
            }
        }

        return clampTextToWidth(variants[variants.length - 1], maxWidth, {
            measureGlyphWidth,
            measurementCache
        });
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
        getStaminaPayoffPulsePresentation,
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
        buildRunEventRoomChoiceRecommendation,
        getRunEventRoomChoiceEncounterProfile,
        buildRunEventEncounterRoster,
        buildRunEventEncounterFormationSlots,
        buildRunEventEncounterPayoffPresentation,
        buildRunEventEncounterEntryPreview,
        buildRunEventEncounterStagingReceipt,
        buildRunEventEncounterObjectiveCue,
        buildRunEventEncounterObjectivePreview,
        buildRunEventEncounterSourceCue,
        buildRunEventEncounterClearRecap,
        buildRunEventEncounterBossDoorRecap,
        buildRunEventEncounterBossOpeningEcho,
        buildRunEventEncounterBossVictoryRecap,
        buildHubLastRunSummary,
        buildHubPortalChoiceSummary,
        formatRunEventEncounterPayoffTimingLabel,
        formatRunEventRoomChoiceEncounterPreview,
        formatRunEventRoomChoiceEncounterTiming,
        getRunEventRoomChoiceAffordabilityLabel,
        getRunEventRoomChoiceFailureMessage,
        getRunEventEncounterProfile,
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
        buildWeaponUpgradeAffordance,
        buildWeaponUpgradeBenefitSummary,
        buildWeaponUpgradePreviewSummary,
        buildWeaponUpgradeRowLabel,
        buildWeaponUpgradeFailureMessage,
        buildWeaponUpgradeSuccessMessage,
        getCraftingRecipe,
        canCraftRecipe,
        buildCraftRecipeAffordance,
        buildCraftRecipeRowLabel,
        buildCraftRecipeQuickSlotPreview,
        buildCraftRecipeBatchReceipt,
        buildCraftRecipeFailureMessage,
        buildCraftRecipeSuccessMessage,
        applyCraftRecipe
    };
});
