# Seven Sins Pixel ARPG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based pixel-art isometric action RPG with seven deadly sins themed boss battles, hub exploration, weapon switching, and item systems using Phaser.js.

**Architecture:** Single-file rapid prototype using Phaser 3 loaded via CDN. Game logic in `game.js`, data configuration in `data.js`, entry point in `index.html`. Phaser Scene system separates game states (Title, Hub, Level, Boss, Dialog, UI). Isometric tilemap rendering with 8-directional player movement and mouse-aimed combat.

**Tech Stack:** Phaser 3 (CDN), HTML5 Canvas, vanilla JavaScript, Tiled map editor (JSON export), localStorage for saves.

**Strategy:** Build a playable vertical slice first (Hub → one Level → one Boss → victory), then expand with remaining content.

---

## Phase 1: Project Foundation

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `game.js`
- Create: `data.js`

**Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>七宗罪 - Seven Deadly Sins</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
        canvas { image-rendering: pixelated; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
    <script src="data.js"></script>
    <script src="game.js"></script>
</body>
</html>
```

**Step 2: Create `data.js` with initial game configuration**

```javascript
const GAME_CONFIG = {
    TILE_WIDTH: 64,
    TILE_HEIGHT: 32,
    PLAYER: {
        speed: 150,
        maxHp: 100,
        maxStamina: 100,
        staminaRegen: 15, // per second
        dodgeStaminaCost: 25,
        dodgeDuration: 300, // ms
        dodgeCooldown: 1000, // ms
        dodgeSpeed: 300,
        iframeDuration: 300 // ms
    }
};

const WEAPONS = {
    sword: {
        name: '长剑',
        damage: 20,
        attackSpeed: 500, // ms between attacks
        range: 50,
        staminaCost: 10,
        specialStaminaCost: 30,
        specialCooldown: 3000,
        description: '均衡的近战武器',
        type: 'melee',
        attackPattern: 'sweep' // sweep, thrust, slam, projectile, magic
    },
    dualBlades: {
        name: '双刃',
        damage: 12,
        attackSpeed: 250,
        range: 40,
        staminaCost: 7,
        specialStaminaCost: 25,
        specialCooldown: 4000,
        description: '快速连击',
        type: 'melee',
        attackPattern: 'thrust'
    },
    hammer: {
        name: '大锤',
        damage: 40,
        attackSpeed: 1000,
        range: 55,
        staminaCost: 18,
        specialStaminaCost: 40,
        specialCooldown: 5000,
        description: '沉重的一击',
        type: 'melee',
        attackPattern: 'slam'
    },
    bow: {
        name: '弓箭',
        damage: 15,
        attackSpeed: 600,
        range: 250,
        staminaCost: 8,
        specialStaminaCost: 35,
        specialCooldown: 6000,
        description: '远程射击',
        type: 'ranged',
        attackPattern: 'projectile'
    },
    staff: {
        name: '法杖',
        damage: 25,
        attackSpeed: 800,
        range: 200,
        staminaCost: 15,
        specialStaminaCost: 45,
        specialCooldown: 5000,
        description: '魔法攻击',
        type: 'ranged',
        attackPattern: 'magic'
    }
};

const BOSSES = {
    pride: {
        name: '堕天骑士',
        sin: '傲慢',
        hp: 500,
        damage: 25,
        speed: 120,
        area: '天空神殿',
        color: 0xFFD700,
        phases: [
            { hpPercent: 1.0, attacks: ['slash', 'charge'] },
            { hpPercent: 0.6, attacks: ['slash', 'charge', 'mirror'] },
            { hpPercent: 0.3, attacks: ['slash', 'charge', 'mirror', 'divineStrike'] }
        ],
        defeatDialog: [
            { speaker: '堕天骑士', text: '我曾是最耀眼的光……傲慢蒙蔽了我的双眼。' },
            { speaker: '堕天骑士', text: '拿走这枚印记吧……愿你不要重蹈我的覆辙。' }
        ],
        drops: { sinSeal: 'pride', material: 'prideEssence', gold: 200 }
    },
    envy: {
        name: '影形者',
        sin: '嫉妒',
        hp: 450,
        damage: 20,
        speed: 140,
        area: '毒沼迷宫',
        color: 0x2ECC40,
        phases: [
            { hpPercent: 1.0, attacks: ['poisonSpit', 'lunge'] },
            { hpPercent: 0.6, attacks: ['poisonSpit', 'lunge', 'copyWeapon'] },
            { hpPercent: 0.3, attacks: ['poisonSpit', 'lunge', 'copyWeapon', 'shapeShift'] }
        ],
        defeatDialog: [
            { speaker: '影形者', text: '我只是……想成为别人。任何人都好。' },
            { speaker: '影形者', text: '原来做自己……才是最难的事。' }
        ],
        drops: { sinSeal: 'envy', material: 'envyEssence', gold: 200 }
    },
    wrath: {
        name: '炎魔将军',
        sin: '暴怒',
        hp: 600,
        damage: 30,
        speed: 100,
        area: '熔岩锻炉',
        color: 0xFF4136,
        phases: [
            { hpPercent: 1.0, attacks: ['firePunch', 'groundSlam'] },
            { hpPercent: 0.6, attacks: ['firePunch', 'groundSlam', 'flameBreath'] },
            { hpPercent: 0.3, attacks: ['firePunch', 'groundSlam', 'flameBreath', 'berserk'] }
        ],
        defeatDialog: [
            { speaker: '炎魔将军', text: '怒火……终于平息了。' },
            { speaker: '炎魔将军', text: '这把火烧了我一千年……谢谢你让它熄灭。' }
        ],
        drops: { sinSeal: 'wrath', material: 'wrathEssence', gold: 250 }
    },
    sloth: {
        name: '梦境蛛后',
        sin: '懒惰',
        hp: 400,
        damage: 15,
        speed: 60,
        area: '沉睡森林',
        color: 0xB10DC9,
        phases: [
            { hpPercent: 1.0, attacks: ['webShot', 'summonSpider'] },
            { hpPercent: 0.6, attacks: ['webShot', 'summonSpider', 'sleepFog'] },
            { hpPercent: 0.3, attacks: ['webShot', 'summonSpider', 'sleepFog', 'nightmare'] }
        ],
        defeatDialog: [
            { speaker: '梦境蛛后', text: '梦醒了……这漫长的沉睡，终于结束了。' },
            { speaker: '梦境蛛后', text: '去吧，勇者……别让安逸夺走你的意志。' }
        ],
        drops: { sinSeal: 'sloth', material: 'slothEssence', gold: 180 }
    },
    greed: {
        name: '黄金龙王',
        sin: '贪婪',
        hp: 550,
        damage: 22,
        speed: 110,
        area: '宝藏地窟',
        color: 0xFFDC00,
        phases: [
            { hpPercent: 1.0, attacks: ['tailSwipe', 'goldBreath'] },
            { hpPercent: 0.6, attacks: ['tailSwipe', 'goldBreath', 'coinTrap'] },
            { hpPercent: 0.3, attacks: ['tailSwipe', 'goldBreath', 'coinTrap', 'treasureStorm'] }
        ],
        defeatDialog: [
            { speaker: '黄金龙王', text: '这些金子……一枚都带不走吗？' },
            { speaker: '黄金龙王', text: '我守了这些宝藏一万年……却从未享受过一天。' }
        ],
        drops: { sinSeal: 'greed', material: 'greedEssence', gold: 500 }
    },
    gluttony: {
        name: '深渊巨口',
        sin: '暴食',
        hp: 650,
        damage: 28,
        speed: 80,
        area: '腐烂宴厅',
        color: 0x85144b,
        phases: [
            { hpPercent: 1.0, attacks: ['bite', 'vomit'] },
            { hpPercent: 0.6, attacks: ['bite', 'vomit', 'devour'] },
            { hpPercent: 0.3, attacks: ['bite', 'vomit', 'devour', 'consume'] }
        ],
        defeatDialog: [
            { speaker: '深渊巨口', text: '还是……好饿……永远填不满……' },
            { speaker: '深渊巨口', text: '也许……空虚本身就是惩罚。' }
        ],
        drops: { sinSeal: 'gluttony', material: 'gluttonyEssence', gold: 220 }
    },
    lust: {
        name: '魅惑女妖',
        sin: '色欲',
        hp: 420,
        damage: 18,
        speed: 150,
        area: '幻梦花园',
        color: 0xF012BE,
        phases: [
            { hpPercent: 1.0, attacks: ['charmBolt', 'dash'] },
            { hpPercent: 0.6, attacks: ['charmBolt', 'dash', 'reverseControl'] },
            { hpPercent: 0.3, attacks: ['charmBolt', 'dash', 'reverseControl', 'illusion'] }
        ],
        defeatDialog: [
            { speaker: '魅惑女妖', text: '你……竟不为所动？' },
            { speaker: '魅惑女妖', text: '真正的爱……原来不是控制。我明白了。' }
        ],
        drops: { sinSeal: 'lust', material: 'lustEssence', gold: 190 }
    }
};

const ENEMIES = {
    wrathSoldier: { name: '炎魔战士', hp: 40, damage: 10, speed: 70, color: 0xFF6347, drops: { gold: [5, 15] } },
    wrathArcher: { name: '炎魔射手', hp: 25, damage: 12, speed: 60, color: 0xFF4500, drops: { gold: [8, 20] } },
    wrathBrute: { name: '炎魔狂战', hp: 60, damage: 18, speed: 50, color: 0xDC143C, drops: { gold: [10, 25] } }
};

const ITEMS = {
    hpPotion: { name: '生命药水', type: 'consumable', effect: 'healHp', value: 30, price: 20, description: '恢复30点HP' },
    staminaPotion: { name: '体力药水', type: 'consumable', effect: 'healStamina', value: 40, price: 15, description: '恢复40点体力' },
    prideEssence: { name: '傲慢之精华', type: 'material', description: '堕天骑士身上散落的光之碎片' },
    envyEssence: { name: '嫉妒之精华', type: 'material', description: '影形者残留的变异物质' },
    wrathEssence: { name: '暴怒之精华', type: 'material', description: '炎魔将军燃烧殆尽后的余烬' },
    slothEssence: { name: '懒惰之精华', type: 'material', description: '梦境蛛后织出的沉睡丝线' },
    greedEssence: { name: '贪婪之精华', type: 'material', description: '黄金龙王最珍贵的一枚鳞片' },
    gluttonyEssence: { name: '暴食之精华', type: 'material', description: '深渊巨口未消化的力量核心' },
    lustEssence: { name: '色欲之精华', type: 'material', description: '魅惑女妖凋落的蝴蝶翅膀' }
};

const HUB_NPCS = {
    blacksmith: {
        name: '铁匠 格雷',
        dialog: [
            { speaker: '铁匠 格雷', text: '需要强化武器吗？拿Boss的材料来找我。' }
        ]
    },
    merchant: {
        name: '商人 莉娜',
        dialog: [
            { speaker: '商人 莉娜', text: '欢迎光临！需要补给吗？' }
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
```

**Step 3: Create `game.js` with Phaser config and placeholder scenes**

```javascript
// --- Boot Scene ---
class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        const { width, height } = this.cameras.main;
        const bar = this.add.rectangle(width / 2, height / 2, 300, 30, 0x333333);
        const fill = this.add.rectangle(width / 2 - 148, height / 2, 4, 26, 0x00ff00).setOrigin(0, 0.5);
        this.load.on('progress', (v) => { fill.width = 296 * v; });
        this.load.on('complete', () => { bar.destroy(); fill.destroy(); });

        // Placeholder: generate textures programmatically until real assets are added
        this.generatePlaceholderTextures();
    }

    generatePlaceholderTextures() {
        // Player
        const pg = this.make.graphics({ add: false });
        pg.fillStyle(0x3498db); pg.fillRect(0, 0, 32, 32);
        pg.fillStyle(0x2980b9); pg.fillRect(8, 4, 16, 12);
        pg.generateTexture('player', 32, 32); pg.destroy();

        // Enemy
        const eg = this.make.graphics({ add: false });
        eg.fillStyle(0xe74c3c); eg.fillRect(0, 0, 32, 32);
        eg.generateTexture('enemy', 32, 32); eg.destroy();

        // Boss
        const bg = this.make.graphics({ add: false });
        bg.fillStyle(0xff4136); bg.fillRect(0, 0, 64, 64);
        bg.fillStyle(0xff6347); bg.fillRect(12, 8, 40, 24);
        bg.generateTexture('boss', 64, 64); bg.destroy();

        // Projectiles
        const prg = this.make.graphics({ add: false });
        prg.fillStyle(0xf1c40f); prg.fillCircle(4, 4, 4);
        prg.generateTexture('projectile', 8, 8); prg.destroy();

        // NPC
        const ng = this.make.graphics({ add: false });
        ng.fillStyle(0x2ecc71); ng.fillRect(0, 0, 32, 32);
        ng.generateTexture('npc', 32, 32); ng.destroy();

        // Tiles
        const tg = this.make.graphics({ add: false });
        tg.fillStyle(0x555555); tg.fillRect(0, 0, 64, 32);
        tg.lineStyle(1, 0x666666); tg.strokeRect(0, 0, 64, 32);
        tg.generateTexture('tile_floor', 64, 32); tg.destroy();

        // Portal
        const portg = this.make.graphics({ add: false });
        portg.fillStyle(0x9b59b6); portg.fillCircle(24, 24, 24);
        portg.fillStyle(0x000000); portg.fillCircle(24, 24, 16);
        portg.generateTexture('portal', 48, 48); portg.destroy();

        // UI elements
        const hpg = this.make.graphics({ add: false });
        hpg.fillStyle(0xff0000); hpg.fillRect(0, 0, 4, 16);
        hpg.generateTexture('hp_fill', 4, 16); hpg.destroy();

        const stg = this.make.graphics({ add: false });
        stg.fillStyle(0xf1c40f); stg.fillRect(0, 0, 4, 12);
        stg.generateTexture('stamina_fill', 4, 12); stg.destroy();
    }

    create() {
        this.scene.start('Title');
    }
}

// --- Title Scene ---
class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }

    create() {
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, height / 3, '七 宗 罪', {
            fontSize: '64px', fontFamily: 'monospace', color: '#ff4444',
            stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 60, 'SEVEN DEADLY SINS', {
            fontSize: '18px', fontFamily: 'monospace', color: '#aaa'
        }).setOrigin(0.5);

        const startBtn = this.add.text(width / 2, height / 2 + 40, '[ 开始游戏 ]', {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const continueBtn = this.add.text(width / 2, height / 2 + 90, '[ 继续游戏 ]', {
            fontSize: '24px', fontFamily: 'monospace', color: '#888'
        }).setOrigin(0.5);

        const hasSave = localStorage.getItem('sevenSins_save') !== null;
        if (hasSave) {
            continueBtn.setColor('#fff').setInteractive({ useHandCursor: true });
            continueBtn.on('pointerover', () => continueBtn.setColor('#ff4444'));
            continueBtn.on('pointerout', () => continueBtn.setColor('#fff'));
            continueBtn.on('pointerdown', () => this.scene.start('Hub', { loadSave: true }));
        }

        startBtn.on('pointerover', () => startBtn.setColor('#ff4444'));
        startBtn.on('pointerout', () => startBtn.setColor('#fff'));
        startBtn.on('pointerdown', () => this.scene.start('Hub', { loadSave: false }));
    }
}

// --- Placeholder: Hub, Level, Boss, Dialog, UI scenes will be added in subsequent tasks ---

class HubScene extends Phaser.Scene {
    constructor() { super('Hub'); }
    create(data) {
        const { width, height } = this.cameras.main;
        this.add.text(width / 2, height / 2, 'Hub - 净罪庇护所\n(待实现)', {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff', align: 'center'
        }).setOrigin(0.5);
    }
}

// --- Phaser Game Config ---
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#111111',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [BootScene, TitleScene, HubScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
```

**Step 4: Verify — open `index.html` in browser**

Expected: Black screen → loading → Title screen with "七宗罪" title and start button.

**Step 5: Commit**

```bash
git add index.html game.js data.js
git commit -m "feat: project scaffold with Phaser 3, title screen, and game data"
```

---

### Task 2: Player Character — Movement & Rendering

**Files:**
- Modify: `game.js` (add Player class, modify HubScene)

**Step 1: Add Player class to `game.js`**

Add above HubScene:

```javascript
// --- Player Class ---
class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);

        // Stats
        this.hp = GAME_CONFIG.PLAYER.maxHp;
        this.maxHp = GAME_CONFIG.PLAYER.maxHp;
        this.stamina = GAME_CONFIG.PLAYER.maxStamina;
        this.maxStamina = GAME_CONFIG.PLAYER.maxStamina;

        // Weapons
        this.weapons = ['sword'];
        this.currentWeaponIndex = 0;
        this.attackCooldown = 0;
        this.specialCooldown = 0;

        // Dodge state
        this.isDodging = false;
        this.dodgeCooldownTimer = 0;
        this.isInvincible = false;

        // Combat state
        this.isAttacking = false;
        this.knockbackTimer = 0;
        this.facingAngle = 0;

        // Input
        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dodge: Phaser.Input.Keyboard.KeyCodes.SPACE,
            switchLeft: Phaser.Input.Keyboard.KeyCodes.Q,
            switchRight: Phaser.Input.Keyboard.KeyCodes.E,
            item1: Phaser.Input.Keyboard.KeyCodes.ONE,
            item2: Phaser.Input.Keyboard.KeyCodes.TWO,
            item3: Phaser.Input.Keyboard.KeyCodes.THREE,
            item4: Phaser.Input.Keyboard.KeyCodes.FOUR,
            inventory: Phaser.Input.Keyboard.KeyCodes.TAB
        });

        // Weapon switch keys
        scene.input.keyboard.on('keydown-Q', () => this.switchWeapon(-1));
        scene.input.keyboard.on('keydown-E', () => this.switchWeapon(1));
    }

    get currentWeapon() {
        return WEAPONS[this.weapons[this.currentWeaponIndex]];
    }

    get currentWeaponKey() {
        return this.weapons[this.currentWeaponIndex];
    }

    switchWeapon(direction) {
        if (this.weapons.length <= 1) return;
        this.currentWeaponIndex = (this.currentWeaponIndex + direction + this.weapons.length) % this.weapons.length;
    }

    update(time, delta) {
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= delta;
            return;
        }

        this.updateStamina(delta);
        this.updateCooldowns(delta);
        this.updateMovement();
        this.updateFacing();
    }

    updateStamina(delta) {
        if (this.stamina < this.maxStamina && !this.isAttacking && !this.isDodging) {
            this.stamina = Math.min(this.maxStamina, this.stamina + GAME_CONFIG.PLAYER.staminaRegen * (delta / 1000));
        }
    }

    updateCooldowns(delta) {
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.specialCooldown > 0) this.specialCooldown -= delta;
        if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer -= delta;
    }

    updateMovement() {
        if (this.isDodging) return;

        const speed = GAME_CONFIG.PLAYER.speed;
        let vx = 0, vy = 0;

        if (this.keys.left.isDown) vx = -1;
        if (this.keys.right.isDown) vx = 1;
        if (this.keys.up.isDown) vy = -1;
        if (this.keys.down.isDown) vy = 1;

        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.sprite.setVelocity(vx * speed, vy * speed);
    }

    updateFacing() {
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.facingAngle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, worldPoint.x, worldPoint.y
        );
    }

    dodge() {
        if (this.isDodging || this.dodgeCooldownTimer > 0) return;
        if (this.stamina < GAME_CONFIG.PLAYER.dodgeStaminaCost) return;

        this.stamina -= GAME_CONFIG.PLAYER.dodgeStaminaCost;
        this.isDodging = true;
        this.isInvincible = true;

        const dodgeAngle = this.facingAngle;
        this.sprite.setVelocity(
            Math.cos(dodgeAngle) * GAME_CONFIG.PLAYER.dodgeSpeed,
            Math.sin(dodgeAngle) * GAME_CONFIG.PLAYER.dodgeSpeed
        );

        this.sprite.setAlpha(0.5);

        this.scene.time.delayedCall(GAME_CONFIG.PLAYER.iframeDuration, () => {
            this.isInvincible = false;
        });

        this.scene.time.delayedCall(GAME_CONFIG.PLAYER.dodgeDuration, () => {
            this.isDodging = false;
            this.sprite.setAlpha(1);
            this.dodgeCooldownTimer = GAME_CONFIG.PLAYER.dodgeCooldown;
        });
    }

    attack() {
        const weapon = this.currentWeapon;
        if (this.attackCooldown > 0 || this.isDodging) return;
        if (this.stamina < weapon.staminaCost) return;

        this.stamina -= weapon.staminaCost;
        this.attackCooldown = weapon.attackSpeed;
        this.isAttacking = true;

        this.scene.time.delayedCall(200, () => { this.isAttacking = false; });

        return this.createAttackHitbox(weapon, this.facingAngle);
    }

    specialAttack() {
        const weapon = this.currentWeapon;
        if (this.specialCooldown > 0 || this.isDodging) return;
        if (this.stamina < weapon.specialStaminaCost) return;

        this.stamina -= weapon.specialStaminaCost;
        this.specialCooldown = weapon.specialCooldown;

        return this.createSpecialHitbox(weapon, this.facingAngle);
    }

    createAttackHitbox(weapon, angle) {
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;

        const hitbox = this.scene.physics.add.sprite(
            this.sprite.x + offsetX, this.sprite.y + offsetY, 'projectile'
        );
        hitbox.setAlpha(0.7);
        hitbox.damage = weapon.damage;
        hitbox.setCircle(weapon.range / 2);

        if (weapon.type === 'ranged') {
            hitbox.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            this.scene.time.delayedCall(1000, () => hitbox.destroy());
        } else {
            this.scene.time.delayedCall(150, () => hitbox.destroy());
        }

        return hitbox;
    }

    createSpecialHitbox(weapon, angle) {
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;

        const hitbox = this.scene.physics.add.sprite(
            this.sprite.x + offsetX, this.sprite.y + offsetY, 'projectile'
        );
        hitbox.setAlpha(0.9).setTint(0xff6600);
        hitbox.damage = weapon.damage * 2;
        hitbox.setScale(2);

        this.scene.time.delayedCall(300, () => hitbox.destroy());

        return hitbox;
    }

    takeDamage(amount) {
        if (this.isInvincible) return;

        this.hp = Math.max(0, this.hp - amount);
        this.isInvincible = true;
        this.knockbackTimer = 200;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.sprite.setAlpha(1);
                this.isInvincible = false;
            }
        });

        return this.hp <= 0;
    }
}
```

**Step 2: Update HubScene to use Player with movement**

Replace the placeholder HubScene:

```javascript
class HubScene extends Phaser.Scene {
    constructor() { super('Hub'); }

    create(data) {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        const { width, height } = this.cameras.main;

        // Ground tiles (simple grid)
        for (let x = -500; x < 1500; x += 64) {
            for (let y = -500; y < 1300; y += 32) {
                this.add.image(x, y, 'tile_floor').setAlpha(0.3);
            }
        }

        this.add.text(width / 2, 50, '净罪庇护所', {
            fontSize: '24px', fontFamily: 'monospace', color: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Player
        this.player = new Player(this, width / 2, height / 2);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
        this.physics.world.setBounds(-500, -500, 2000, 1800);

        // Input: dodge
        this.input.keyboard.on('keydown-SPACE', () => this.player.dodge());

        // Input: attack
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) this.player.attack();
            if (pointer.rightButtonDown()) this.player.specialAttack();
        });

        // Disable right-click context menu
        this.input.mouse.disableContextMenu();
    }

    update(time, delta) {
        this.player.update(time, delta);
    }
}
```

**Step 3: Verify — open in browser**

Expected: Title screen → click start → Hub scene with blue square (player) that moves with WASD, faces mouse, can dodge with Space, attacks with left click.

**Step 4: Commit**

```bash
git add game.js
git commit -m "feat: player character with movement, combat, dodge and weapon system"
```

---

### Task 3: UI/HUD Scene

**Files:**
- Modify: `game.js` (add UIScene, launch it from HubScene)

**Step 1: Add UIScene class to `game.js`**

Add after Player class:

```javascript
// --- UI Scene (runs in parallel) ---
class UIScene extends Phaser.Scene {
    constructor() { super('UI'); }

    create() {
        this.hpBarBg = this.add.rectangle(120, 30, 200, 20, 0x333333).setOrigin(0, 0.5);
        this.hpBarFill = this.add.rectangle(120, 30, 200, 20, 0xe74c3c).setOrigin(0, 0.5);
        this.add.text(20, 22, 'HP', { fontSize: '14px', fontFamily: 'monospace', color: '#ff4444' });

        this.staminaBarBg = this.add.rectangle(120, 55, 200, 14, 0x333333).setOrigin(0, 0.5);
        this.staminaBarFill = this.add.rectangle(120, 55, 200, 14, 0xf1c40f).setOrigin(0, 0.5);
        this.add.text(20, 48, 'ST', { fontSize: '14px', fontFamily: 'monospace', color: '#f1c40f' });

        this.hpText = this.add.text(225, 22, '', { fontSize: '12px', fontFamily: 'monospace', color: '#fff' });
        this.staminaText = this.add.text(225, 48, '', { fontSize: '12px', fontFamily: 'monospace', color: '#fff' });

        this.weaponText = this.add.text(20, 720, '', {
            fontSize: '16px', fontFamily: 'monospace', color: '#fff'
        });

        this.areaText = this.add.text(900, 20, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#aaa'
        });

        // Quick slot display
        this.slotTexts = [];
        for (let i = 0; i < 4; i++) {
            const slotBg = this.add.rectangle(860 + i * 44, 730, 40, 40, 0x333333, 0.7);
            const slotLabel = this.add.text(860 + i * 44, 710, `${i + 1}`, {
                fontSize: '10px', fontFamily: 'monospace', color: '#888'
            }).setOrigin(0.5);
            const slotText = this.add.text(860 + i * 44, 730, '-', {
                fontSize: '12px', fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            this.slotTexts.push(slotText);
        }
    }

    updateHUD(player, areaName) {
        if (!player) return;

        const hpPercent = player.hp / player.maxHp;
        this.hpBarFill.width = 200 * hpPercent;
        this.hpText.setText(`${Math.ceil(player.hp)}/${player.maxHp}`);

        const stPercent = player.stamina / player.maxStamina;
        this.staminaBarFill.width = 200 * stPercent;
        this.staminaText.setText(`${Math.ceil(player.stamina)}/${player.maxStamina}`);

        const weapon = player.currentWeapon;
        this.weaponText.setText(`⚔ ${weapon.name}  [Q/E 切换]`);

        if (areaName) this.areaText.setText(areaName);
    }
}
```

**Step 2: Launch UI scene from HubScene**

In HubScene's `create()`, add at the end:

```javascript
this.scene.launch('UI');
```

In HubScene's `update()`, add:

```javascript
const uiScene = this.scene.get('UI');
if (uiScene) uiScene.updateHUD(this.player, '净罪庇护所');
```

**Step 3: Register UIScene in game config**

Update the `scene` array in config:

```javascript
scene: [BootScene, TitleScene, HubScene, UIScene],
```

**Step 4: Verify**

Expected: HP bar (red) and Stamina bar (yellow) visible top-left. Stamina decreases on attack/dodge, regenerates. Weapon name shown bottom-left.

**Step 5: Commit**

```bash
git add game.js
git commit -m "feat: UI/HUD with HP bar, stamina bar, weapon display and quick slots"
```

---

### Task 4: Enemy System

**Files:**
- Modify: `game.js` (add Enemy class)

**Step 1: Add Enemy class to `game.js`**

Add after UIScene:

```javascript
// --- Enemy Class ---
class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy');
        this.sprite.setTint(config.color || 0xe74c3c);
        this.sprite.setDepth(9);

        this.hp = config.hp;
        this.maxHp = config.hp;
        this.damage = config.damage;
        this.speed = config.speed;
        this.drops = config.drops || {};

        // AI state
        this.state = 'patrol'; // patrol, chase, attack, hurt, dead
        this.patrolTarget = new Phaser.Math.Vector2(x + Phaser.Math.Between(-100, 100), y + Phaser.Math.Between(-100, 100));
        this.attackCooldown = 0;
        this.detectionRange = 200;
        this.attackRange = 40;
        this.patrolTimer = 0;

        // HP bar
        this.hpBarBg = scene.add.rectangle(x, y - 22, 30, 4, 0x333333).setDepth(11);
        this.hpBarFill = scene.add.rectangle(x, y - 22, 30, 4, 0xff0000).setOrigin(0, 0.5).setDepth(11);
        this.hpBarFill.x = x - 15;
    }

    update(time, delta, playerSprite) {
        if (this.state === 'dead') return;

        this.attackCooldown -= delta;

        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, playerSprite.x, playerSprite.y
        );

        if (dist < this.attackRange && this.attackCooldown <= 0) {
            this.state = 'attack';
        } else if (dist < this.detectionRange) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        switch (this.state) {
            case 'patrol': this.patrol(delta); break;
            case 'chase': this.chase(playerSprite); break;
            case 'attack': this.doAttack(playerSprite); break;
        }

        this.updateHpBar();
    }

    patrol(delta) {
        this.patrolTimer += delta;
        if (this.patrolTimer > 2000) {
            this.patrolTarget.set(
                this.sprite.x + Phaser.Math.Between(-100, 100),
                this.sprite.y + Phaser.Math.Between(-100, 100)
            );
            this.patrolTimer = 0;
        }
        this.scene.physics.moveToObject(this.sprite, this.patrolTarget, this.speed * 0.3);
    }

    chase(playerSprite) {
        this.scene.physics.moveToObject(this.sprite, playerSprite, this.speed);
    }

    doAttack(playerSprite) {
        if (this.attackCooldown > 0) return;
        this.attackCooldown = 1000;
        this.sprite.setVelocity(0, 0);
        return true; // signals that attack landed (caller handles damage)
    }

    takeDamage(amount) {
        this.hp -= amount;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3, duration: 80, yoyo: true,
            onComplete: () => this.sprite.setAlpha(1)
        });

        if (this.hp <= 0) {
            this.state = 'dead';
            this.sprite.setActive(false).setVisible(false);
            this.sprite.body.enable = false;
            this.hpBarBg.destroy();
            this.hpBarFill.destroy();
            return this.drops;
        }
        return null;
    }

    updateHpBar() {
        this.hpBarBg.setPosition(this.sprite.x, this.sprite.y - 22);
        this.hpBarFill.setPosition(this.sprite.x - 15, this.sprite.y - 22);
        this.hpBarFill.width = 30 * (this.hp / this.maxHp);
    }

    destroy() {
        this.sprite.destroy();
        if (this.hpBarBg.active) this.hpBarBg.destroy();
        if (this.hpBarFill.active) this.hpBarFill.destroy();
    }
}
```

**Step 2: Verify by spawning test enemies in HubScene**

Temporarily add 2-3 enemies to HubScene to test AI and combat interaction.

**Step 3: Commit**

```bash
git add game.js
git commit -m "feat: enemy system with patrol/chase/attack AI and HP bars"
```

---

### Task 5: Level Scene — First Area (Wrath)

**Files:**
- Modify: `game.js` (add LevelScene with room system, enemy spawning, and portal to Boss)

**Step 1: Implement LevelScene**

A generic level scene that takes a boss key as parameter, spawns themed enemies across 2-3 rooms, and has a door to the Boss room at the end. Rooms are simple rectangular areas connected by corridors. Enemies are spawned based on the boss area's enemy list.

Key elements:
- Room generation (3 connected rectangular areas)
- Enemy spawning per room
- Room transition triggers
- Door to Boss at end of final room
- Player-enemy collision/combat handling (player attacks damage enemies, enemy proximity damages player)

**Step 2: Add portal interactions in HubScene**

Place 7 portals in the Hub. Each portal is labeled with the sin name. Walking into one launches LevelScene with that boss key.

**Step 3: Verify**

Expected: Hub → walk into Wrath portal → LevelScene with enemies → clear rooms → reach Boss door.

**Step 4: Commit**

```bash
git add game.js
git commit -m "feat: level scene with room system, enemy spawning, and boss door"
```

---

### Task 6: Boss Scene — First Boss (Wrath)

**Files:**
- Modify: `game.js` (add BossScene with phase system and Wrath-specific attacks)

**Step 1: Implement BossScene**

A dedicated scene for boss fights with:
- Boss entity (larger sprite, HP bar at top of screen)
- Phase transitions based on HP thresholds
- Attack pattern state machine (cycles through phase-available attacks)
- Wrath-specific attacks: firePunch (melee dash), groundSlam (AOE around boss), flameBreath (cone), berserk (speed+damage up)
- Victory condition → trigger DialogScene for post-defeat dialog → return to Hub

**Step 2: Implement Boss attack patterns for Wrath**

Each attack is a timed sequence:
- `firePunch`: Dash toward player, deal damage on contact
- `groundSlam`: Pause, then AOE circle around boss
- `flameBreath`: Cone-shaped hazard toward player (phase 2+)
- `berserk`: Permanent speed/damage boost (phase 3)

**Step 3: Verify**

Expected: Enter Boss room → fight Wrath → 3 phases → defeat → dialog → return to Hub.

**Step 4: Commit**

```bash
git add game.js
git commit -m "feat: boss scene with Wrath boss, 3-phase system and attack patterns"
```

---

### Task 7: Dialog System

**Files:**
- Modify: `game.js` (add DialogScene as overlay)

**Step 1: Implement DialogScene**

An overlay scene that:
- Renders a dialog box in the bottom 1/3 of screen
- Shows speaker name and portrait placeholder (colored square)
- Typewriter text effect (letter by letter)
- Advances on any key press or click
- Supports dialog arrays from data.js
- Calls a callback when dialog ends (e.g., return to Hub)
- Can be launched from any scene via: `this.scene.launch('Dialog', { dialog: [...], onComplete: () => {} })`

**Step 2: Integrate with BossScene post-defeat and Hub NPCs**

**Step 3: Verify**

Expected: Defeat boss → dialog appears → typewriter text → advance → callback fires.

**Step 4: Commit**

```bash
git add game.js
git commit -m "feat: dialog system with typewriter effect and portrait display"
```

---

### Task 8: Item & Inventory System

**Files:**
- Modify: `game.js` (add inventory state, pickup logic, Tab inventory screen)
- Modify: `data.js` (already has item definitions)

**Step 1: Add global game state manager**

A simple object that persists across scenes:
- `inventory`: { itemKey: count }
- `gold`: number
- `defeatedBosses`: string[]
- `sinSeals`: string[]
- `weaponLevels`: { weaponKey: level }
- `equippedWeapons`: string[]
- `quickSlots`: [itemKey x4]

**Step 2: Implement inventory UI (Tab key)**

A fullscreen overlay with grid layout showing:
- Tabs: Weapons / Consumables / Materials / Key Items
- Grid of items with icons (colored squares) and counts
- Click to select, assign to quick slot

**Step 3: Implement item drops from enemies/bosses**

When enemy dies, spawn pickup sprites. Player walks over to collect.

**Step 4: Implement quick slot usage (1-4 keys)**

Pressing 1-4 uses the assigned consumable (e.g., HP potion heals 30 HP).

**Step 5: Verify**

Expected: Kill enemies → items drop → pick up → Tab shows inventory → assign to slot → use with number keys.

**Step 6: Commit**

```bash
git add game.js data.js
git commit -m "feat: inventory system with item drops, pickup, quick slots and Tab UI"
```

---

### Task 9: Hub NPCs and Shop

**Files:**
- Modify: `game.js` (add NPC interaction, shop UI, blacksmith upgrade UI)

**Step 1: Place NPCs in HubScene**

Three NPCs (merchant, blacksmith, sage) as green sprites with name labels. Pressing interact key (or clicking) when near opens their dialog or shop UI.

**Step 2: Implement shop UI**

Merchant sells HP/stamina potions for gold. Simple list UI with buy buttons.

**Step 3: Implement blacksmith upgrade UI**

Shows current weapon levels. Upgrade requires gold + boss material. Updates weaponLevels in game state.

**Step 4: Verify**

Expected: Talk to NPCs → shop opens → buy items → blacksmith upgrades weapons.

**Step 5: Commit**

```bash
git add game.js
git commit -m "feat: hub NPCs with shop, blacksmith, and dialog interactions"
```

---

### Task 10: Save System

**Files:**
- Modify: `game.js` (add save/load functions)

**Step 1: Implement save function**

Serialize game state to JSON and store in localStorage under key `sevenSins_save`. Called automatically when returning to Hub.

**Step 2: Implement load function**

Read from localStorage, deserialize, and restore game state. Called from TitleScene "Continue" button.

**Step 3: Verify**

Expected: Play → defeat boss → return to Hub (auto-save) → refresh page → Continue → state preserved.

**Step 4: Commit**

```bash
git add game.js
git commit -m "feat: localStorage save system with auto-save on Hub return"
```

---

## Phase 2: Remaining Content

### Task 11-16: Remaining 6 Bosses

One task per boss. Each adds:
- Boss-specific attack patterns in BossScene
- Area-themed enemies in data.js
- Boss area's visual theme (background color, tile tint)

Order: Pride → Envy → Sloth → Greed → Gluttony → Lust

### Task 17: Final Boss

- Unlocks when all 7 sin seals collected
- 8th portal appears in Hub
- Final boss combines mechanics from all 7 bosses
- Ending dialog and credits screen

---

## Phase 3: Polish

### Task 18: Sound Effects & Music

Add placeholder sounds using Phaser's audio system. Web Audio API for procedural SFX if no assets available.

### Task 19: Visual Polish

- Screen shake on hits
- Particle effects (hit sparks, boss phase transitions)
- Smooth camera transitions between rooms

### Task 20: Game Balance

- Playtest and adjust HP/damage/stamina values
- Ensure each boss is challenging but fair
- Balance item prices and drop rates

### Task 21: Replace Placeholder Art

Integrate free pixel art assets from itch.io:
- Player sprite sheet (8-direction walk + attack)
- Enemy sprite sheets
- Tileset for isometric maps
- UI elements and portraits
