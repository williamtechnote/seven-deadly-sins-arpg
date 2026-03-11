const GAME_CONFIG = {
    TILE_WIDTH: 64,
    TILE_HEIGHT: 32,
    PLAYER: {
        speed: 150,
        maxHp: 100,
        maxStamina: 100,
        staminaRegen: 15,
        dodgeStaminaCost: 25,
        dodgeDuration: 300,
        dodgeCooldown: 1000,
        dodgeSpeed: 300,
        iframeDuration: 300
    }
};

const WEAPONS = {
    sword: {
        name: '长剑', damage: 20, attackSpeed: 500, range: 55, staminaCost: 10,
        specialStaminaCost: 30, specialCooldown: 3000, description: '均衡的近战武器',
        type: 'melee', attackPattern: 'sweep'
    },
    dualBlades: {
        name: '双刃', damage: 12, attackSpeed: 250, range: 40, staminaCost: 7,
        specialStaminaCost: 25, specialCooldown: 4000, description: '快速连击',
        type: 'melee', attackPattern: 'thrust'
    },
    hammer: {
        name: '大锤', damage: 40, attackSpeed: 1000, range: 55, staminaCost: 18,
        specialStaminaCost: 40, specialCooldown: 5000, description: '沉重的一击',
        type: 'melee', attackPattern: 'slam'
    },
    bow: {
        name: '弓箭', damage: 15, attackSpeed: 600, range: 250, staminaCost: 8,
        specialStaminaCost: 35, specialCooldown: 6000, description: '远程射击',
        type: 'ranged', attackPattern: 'projectile'
    },
    staff: {
        name: '法杖', damage: 25, attackSpeed: 800, range: 200, staminaCost: 15,
        specialStaminaCost: 45, specialCooldown: 5000, description: '魔法攻击',
        type: 'ranged', attackPattern: 'magic'
    }
};

const BOSSES = {
    pride: {
        name: '堕天骑士', sin: '傲慢', hp: 380, damage: 25, speed: 120,
        area: '天空神殿', color: 0xFFD700,
        phases: [
            { hpPercent: 1.0, attacks: ['slash', 'charge'] },
            { hpPercent: 0.6, attacks: ['slash', 'charge', 'mirror'] },
            { hpPercent: 0.3, attacks: ['slash', 'charge', 'mirror', 'divineStrike', 'bladeOrbit'] }
        ],
        defeatDialog: [
            { speaker: '堕天骑士', text: '我曾是最耀眼的光……傲慢蒙蔽了我的双眼。' },
            { speaker: '堕天骑士', text: '拿走这枚印记吧……愿你不要重蹈我的覆辙。' }
        ],
        drops: { sinSeal: 'pride', material: 'prideEssence', gold: 200, weapon: 'dualBlades' }
    },
    envy: {
        name: '影形者', sin: '嫉妒', hp: 340, damage: 20, speed: 140,
        area: '毒沼迷宫', color: 0x2ECC40,
        phases: [
            { hpPercent: 1.0, attacks: ['poisonSpit', 'lunge'] },
            { hpPercent: 0.6, attacks: ['poisonSpit', 'lunge', 'copyWeapon'] },
            { hpPercent: 0.3, attacks: ['poisonSpit', 'lunge', 'copyWeapon', 'shapeShift'] }
        ],
        defeatDialog: [
            { speaker: '影形者', text: '我只是……想成为别人。任何人都好。' },
            { speaker: '影形者', text: '原来做自己……才是最难的事。' }
        ],
        drops: { sinSeal: 'envy', material: 'envyEssence', gold: 200, weapon: 'bow' }
    },
    wrath: {
        name: '炎魔将军', sin: '暴怒', hp: 460, damage: 30, speed: 100,
        area: '熔岩锻炉', color: 0xFF4136,
        phases: [
            { hpPercent: 1.0, attacks: ['firePunch', 'groundSlam'] },
            { hpPercent: 0.6, attacks: ['firePunch', 'groundSlam', 'flameBreath', 'magmaRing'] },
            { hpPercent: 0.3, attacks: ['firePunch', 'groundSlam', 'flameBreath', 'magmaRing', 'berserk'] }
        ],
        defeatDialog: [
            { speaker: '炎魔将军', text: '怒火……终于平息了。' },
            { speaker: '炎魔将军', text: '这把火烧了我一千年……谢谢你让它熄灭。' }
        ],
        drops: { sinSeal: 'wrath', material: 'wrathEssence', gold: 250, weapon: 'hammer' }
    },
    sloth: {
        name: '梦境蛛后', sin: '懒惰', hp: 360, damage: 15, speed: 60,
        area: '沉睡森林', color: 0xB10DC9,
        phases: [
            { hpPercent: 1.0, attacks: ['webShot', 'summonSpider'] },
            { hpPercent: 0.6, attacks: ['webShot', 'summonSpider', 'sleepFog'] },
            { hpPercent: 0.3, attacks: ['webShot', 'summonSpider', 'sleepFog', 'nightmare'] }
        ],
        defeatDialog: [
            { speaker: '梦境蛛后', text: '梦醒了……这漫长的沉睡，终于结束了。' },
            { speaker: '梦境蛛后', text: '去吧，勇者……别让安逸夺走你的意志。' }
        ],
        drops: { sinSeal: 'sloth', material: 'slothEssence', gold: 180, weapon: 'staff' }
    },
    greed: {
        name: '黄金龙王', sin: '贪婪', hp: 420, damage: 22, speed: 110,
        area: '宝藏地窟', color: 0xFFDC00,
        phases: [
            { hpPercent: 1.0, attacks: ['tailSwipe', 'goldBreath'] },
            { hpPercent: 0.6, attacks: ['tailSwipe', 'goldBreath', 'coinTrap'] },
            { hpPercent: 0.3, attacks: ['tailSwipe', 'goldBreath', 'coinTrap', 'treasureStorm'] }
        ],
        defeatDialog: [
            { speaker: '黄金龙王', text: '这些金子……一枚都带不走吗？' },
            { speaker: '黄金龙王', text: '我守了这些宝藏一万年……却从未享受过一天。' }
        ],
        drops: { sinSeal: 'greed', material: 'greedEssence', gold: 999, bonusItems: { hpPotion: 5, staminaPotion: 5 } }
    },
    gluttony: {
        name: '深渊巨口', sin: '暴食', hp: 440, damage: 28, speed: 80,
        area: '腐烂宴厅', color: 0x85144b,
        phases: [
            { hpPercent: 1.0, attacks: ['bite', 'vomit'] },
            { hpPercent: 0.6, attacks: ['bite', 'vomit', 'devour'] },
            { hpPercent: 0.3, attacks: ['bite', 'vomit', 'devour', 'consume'] }
        ],
        defeatDialog: [
            { speaker: '深渊巨口', text: '还是……好饿……永远填不满……' },
            { speaker: '深渊巨口', text: '也许……空虚本身就是惩罚。' }
        ],
        drops: { sinSeal: 'gluttony', material: 'gluttonyEssence', gold: 400, bonusItems: { hpPotion: 8 } }
    },
    lust: {
        name: '魅惑女妖', sin: '色欲', hp: 350, damage: 18, speed: 150,
        area: '幻梦花园', color: 0xF012BE,
        phases: [
            { hpPercent: 1.0, attacks: ['charmBolt', 'dash'] },
            { hpPercent: 0.6, attacks: ['charmBolt', 'dash', 'reverseControl'] },
            {
                hpPercent: 0.3,
                attacks: ['charmBolt', 'reverseControl', 'dash', 'illusion', 'charmBolt', 'mirageDance', 'dash'],
                phaseLocalCooldownMs: {
                    reverseControl: 12000,
                    illusion: 13500
                }
            }
        ],
        defeatDialog: [
            { speaker: '魅惑女妖', text: '你……竟不为所动？' },
            { speaker: '魅惑女妖', text: '真正的爱……原来不是控制。我明白了。' }
        ],
        drops: { sinSeal: 'lust', material: 'lustEssence', gold: 350, bonusItems: { staminaPotion: 8 } }
    },
    final: {
        name: '原罪之主', sin: '原罪', hp: 700, damage: 35, speed: 130,
        area: '虚无深渊', color: 0xFFFFFF, isFinal: true,
        phases: [
            { hpPercent: 1.0, attacks: ['slash', 'groundSlam', 'firePunch'] },
            { hpPercent: 0.75, attacks: ['slash', 'flameBreath', 'shapeShift', 'coinTrap'] },
            { hpPercent: 0.50, attacks: ['poisonSpit', 'reverseControl', 'summonSpider', 'goldBreath'] },
            { hpPercent: 0.25, attacks: ['illusion', 'sleepFog', 'flameBreath', 'divineStrike'] }
        ],
        defeatDialog: [
            { speaker: '原罪之主', text: '七枚印记的力量……终于将我封印了。' },
            { speaker: '原罪之主', text: '但记住……罪恶不会消亡，它只会等待下一次觉醒。' },
            { speaker: '???', text: '勇者，你做到了。七宗罪已被封印。' },
            { speaker: '???', text: '这个世界暂时安全了……感谢你。' }
        ],
        drops: { gold: 1000 }
    }
};

const ENEMIES = {
    // Wrath — 熔岩锻炉
    wrathSoldier: { name: '炎魔战士', hp: 48, damage: 10, speed: 66, color: 0xFF6347, sprite: 'orc_warrior', drops: { gold: [5, 15] } },
    wrathArcher: {
        name: '炎魔射手', hp: 52, damage: 12, speed: 56, color: 0xFF4500, sprite: 'skeleton_mage',
        onHitStatus: { key: 'burn', durationMs: 1800 },
        drops: { gold: [8, 20] }
    },
    wrathBrute: { name: '炎魔狂战', hp: 72, damage: 18, speed: 47, color: 0xDC143C, sprite: 'orc_rogue', drops: { gold: [10, 25] } },
    // Pride — 天空神殿
    prideKnight: { name: '天使骑士', hp: 52, damage: 12, speed: 71, color: 0xFFD700, sprite: 'orc_warrior', drops: { gold: [8, 20] } },
    prideArcher: { name: '光翼射手', hp: 50, damage: 14, speed: 61, color: 0xFFC107, sprite: 'skeleton_mage', drops: { gold: [10, 22] } },
    prideSentinel: { name: '圣殿卫兵', hp: 78, damage: 20, speed: 52, color: 0xDAA520, sprite: 'orc_rogue', drops: { gold: [12, 28] } },
    // Envy — 毒沼迷宫
    envyCrawler: { name: '沼泽爬行者', hp: 46, damage: 11, speed: 75, color: 0x2ECC40, sprite: 'orc_warrior', drops: { gold: [6, 16] } },
    envyMimic: { name: '拟态怪', hp: 56, damage: 15, speed: 66, color: 0x27AE60, sprite: 'skeleton_mage', drops: { gold: [9, 21] } },
    envyShifter: {
        name: '变形虫', hp: 62, damage: 16, speed: 56, color: 0x1E8449, sprite: 'orc_rogue',
        onHitStatus: { key: 'bleed', durationMs: 2100 },
        drops: { gold: [11, 26] }
    },
    // Sloth — 沉睡森林
    slothSpider: {
        name: '睡蛛', hp: 40, damage: 8, speed: 47, color: 0xB10DC9, sprite: 'orc_warrior',
        onHitStatus: { key: 'slow', durationMs: 1800 },
        drops: { gold: [5, 14] }
    },
    slothDreamer: { name: '梦游者', hp: 46, damage: 10, speed: 38, color: 0x9B59B6, sprite: 'skeleton_mage', drops: { gold: [7, 18] } },
    slothCocoon: { name: '蛛茧守卫', hp: 64, damage: 14, speed: 33, color: 0x8E44AD, sprite: 'orc_rogue', drops: { gold: [9, 22] } },
    // Greed — 宝藏地窟
    greedGolem: { name: '黄金魔像', hp: 58, damage: 14, speed: 52, color: 0xFFDC00, sprite: 'orc_warrior', drops: { gold: [15, 35] } },
    greedThief: { name: '宝库盗贼', hp: 50, damage: 11, speed: 85, color: 0xF1C40F, sprite: 'skeleton_mage', drops: { gold: [20, 40] } },
    greedGuardian: { name: '金库守卫', hp: 82, damage: 20, speed: 42, color: 0xD4AC0D, sprite: 'orc_rogue', drops: { gold: [18, 45] } },
    // Gluttony — 腐烂宴厅
    gluttonySlime: { name: '腐烂粘液', hp: 54, damage: 12, speed: 38, color: 0x85144b, sprite: 'orc_warrior', drops: { gold: [7, 18] } },
    gluttonyMaw: { name: '小嘴兽', hp: 60, damage: 16, speed: 56, color: 0xA93226, sprite: 'skeleton_mage', drops: { gold: [9, 22] } },
    gluttonyBloat: { name: '膨胀体', hp: 88, damage: 22, speed: 28, color: 0x641E16, sprite: 'orc_rogue', drops: { gold: [11, 26] } },
    // Lust — 幻梦花园
    lustFairy: { name: '魅影精灵', hp: 44, damage: 10, speed: 89, color: 0xF012BE, sprite: 'orc_warrior', drops: { gold: [6, 16] } },
    lustCharm: { name: '迷惑花', hp: 52, damage: 13, speed: 56, color: 0xE91E8C, sprite: 'skeleton_mage', drops: { gold: [8, 20] } },
    lustGuard: { name: '花园守卫', hp: 68, damage: 17, speed: 66, color: 0xC2185B, sprite: 'orc_rogue', drops: { gold: [10, 24] } }
};

const AREA_ENEMIES = {
    wrath: ['wrathSoldier', 'wrathArcher', 'wrathBrute'],
    pride: ['prideKnight', 'prideArcher', 'prideSentinel'],
    envy: ['envyCrawler', 'envyMimic', 'envyShifter'],
    sloth: ['slothSpider', 'slothDreamer', 'slothCocoon'],
    greed: ['greedGolem', 'greedThief', 'greedGuardian'],
    gluttony: ['gluttonySlime', 'gluttonyMaw', 'gluttonyBloat'],
    lust: ['lustFairy', 'lustCharm', 'lustGuard']
};

const ITEMS = {
    hpPotion: { name: '生命药水', type: 'consumable', effect: 'healHp', value: 30, price: 20, description: '恢复30点HP' },
    staminaPotion: { name: '体力药水', type: 'consumable', effect: 'healStamina', value: 40, price: 15, description: '恢复40点体力' },
    cleanseTonic: { name: '净化药剂', type: 'consumable', effect: 'cleanseWard', value: 0, description: '清除负面状态并获得4秒状态抗性' },
    berserkerOil: { name: '狂战油', type: 'consumable', effect: 'battleFocus', value: 0, description: '8秒内玩家伤害提升25%' },
    prideEssence: { name: '傲慢之精华', type: 'material', price: 70, description: '堕天骑士身上散落的光之碎片' },
    envyEssence: { name: '嫉妒之精华', type: 'material', price: 70, description: '影形者残留的变异物质' },
    wrathEssence: { name: '暴怒之精华', type: 'material', price: 80, description: '炎魔将军燃烧殆尽后的余烬' },
    slothEssence: { name: '懒惰之精华', type: 'material', price: 75, description: '梦境蛛后织出的沉睡丝线' },
    greedEssence: { name: '贪婪之精华', type: 'material', price: 90, description: '黄金龙王最珍贵的一枚鳞片' },
    gluttonyEssence: { name: '暴食之精华', type: 'material', price: 95, description: '深渊巨口未消化的力量核心' },
    lustEssence: { name: '色欲之精华', type: 'material', price: 85, description: '魅惑女妖凋落的蝴蝶翅膀' }
};

const HUB_NPCS = {
    blacksmith: {
        name: '铁匠 格雷',
        dialog: [
            { speaker: '铁匠 格雷', text: '需要强化武器或制作战斗药剂吗？把材料和金币带来。' }
        ]
    },
    merchant: {
        name: '商人 莉娜',
        dialog: [
            { speaker: '商人 莉娜', text: '欢迎光临！药水和少量精华都能买到。' }
        ]
    },
    sage: {
        name: '贤者 艾尔德',
        dialog: [
            { speaker: '贤者 艾尔德', text: '七宗罪的封印正在崩坏……只有集齐七枚罪之印记，才能封住那扇门。' },
            { speaker: '贤者 艾尔德', text: '每一个罪，都是一面镜子。你准备好面对自己了吗？' }
        ]
    }
};
