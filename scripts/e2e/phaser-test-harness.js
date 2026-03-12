(function initSdsTestHarness(global) {
    'use strict';

    const params = new URLSearchParams((global.location && global.location.search) || '');
    const enabled = params.get('testMode') === '1';
    if (!enabled) return;

    const rawSeed = Number(params.get('seed') || Date.now());
    const seed = Number.isFinite(rawSeed) ? (rawSeed >>> 0) : 1;
    const scenario = params.get('testScenario') || 'default';

    function resolveScenarioFlags(name) {
        if (name === 'smoke') {
            return {
                playerDamageMultiplier: 2.2,
                playerDamageTakenMultiplier: 0.45,
                enemyHpMultiplier: 0.7,
                enemySpeedMultiplier: 0.9,
                goldDropMultiplier: 1.25,
                extraDropRateMultiplier: 1.5,
                resetStorage: true
            };
        }
        if (name === 'combat') {
            return {
                playerDamageMultiplier: 4.5,
                playerDamageTakenMultiplier: 0.2,
                enemyHpMultiplier: 0.32,
                enemySpeedMultiplier: 0.82,
                goldDropMultiplier: 1.5,
                extraDropRateMultiplier: 8,
                resetStorage: true
            };
        }
        if (name === 'longrun') {
            return {
                playerDamageMultiplier: 4,
                playerDamageTakenMultiplier: 0.2,
                enemyHpMultiplier: 0.35,
                enemySpeedMultiplier: 0.82,
                goldDropMultiplier: 1.5,
                extraDropRateMultiplier: 8,
                resetStorage: true
            };
        }
        return {
            playerDamageMultiplier: 1,
            playerDamageTakenMultiplier: 1,
            enemyHpMultiplier: 1,
            enemySpeedMultiplier: 1,
            goldDropMultiplier: 1,
            extraDropRateMultiplier: 1,
            resetStorage: true
        };
    }

    const flags = Object.assign(
        {},
        resolveScenarioFlags(scenario),
        {
            boss: params.get('boss') || '',
            resetStorage: params.get('resetStorage') === '0' ? false : resolveScenarioFlags(scenario).resetStorage
        }
    );

    function mulberry32(value) {
        let state = value >>> 0;
        return function next() {
            state = (state + 0x6D2B79F5) >>> 0;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const startedAt = global.performance && typeof global.performance.now === 'function'
        ? global.performance.now()
        : Date.now();
    const rng = mulberry32(seed || 1);
    const events = [];
    const inputLog = [];
    const consoleErrors = [];
    let snapshotProvider = function defaultSnapshotProvider() {
        return null;
    };
    let sequence = 0;

    function now() {
        const current = global.performance && typeof global.performance.now === 'function'
            ? global.performance.now()
            : Date.now();
        return Math.round(current - startedAt);
    }

    function safeSerialize(value) {
        if (value == null) return value;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (_err) {
            return { unserializable: true, type: typeof value };
        }
    }

    function clipPush(list, item, maxLength) {
        list.push(item);
        if (list.length > maxLength) {
            list.splice(0, list.length - maxLength);
        }
    }

    function recordEvent(type, payload) {
        clipPush(events, {
            seq: ++sequence,
            t: now(),
            type: String(type || 'event'),
            payload: safeSerialize(payload || null)
        }, 1200);
    }

    function recordConsoleError(source, args) {
        clipPush(consoleErrors, {
            t: now(),
            source,
            args: safeSerialize(args)
        }, 400);
    }

    function recordInput(type, payload) {
        clipPush(inputLog, {
            seq: ++sequence,
            t: now(),
            type,
            payload: safeSerialize(payload || null)
        }, 4000);
    }

    if (flags.resetStorage && global.localStorage) {
        try {
            global.localStorage.removeItem('sevenSinsSave');
            global.localStorage.removeItem('sevenSins_helpSeen');
        } catch (_err) {
            recordConsoleError('localStorage', ['failed to clear test storage']);
        }
    }

    const originalRandom = Math.random.bind(Math);
    Math.random = function patchedRandom() {
        return rng();
    };

    const originalConsoleError = global.console && typeof global.console.error === 'function'
        ? global.console.error.bind(global.console)
        : null;
    if (originalConsoleError) {
        global.console.error = function patchedConsoleError() {
            recordConsoleError('console.error', Array.from(arguments));
            return originalConsoleError.apply(global.console, arguments);
        };
    }

    global.addEventListener('error', function onError(event) {
        recordConsoleError('window.error', [
            event.message || '',
            event.filename || '',
            event.lineno || 0,
            event.colno || 0
        ]);
    });
    global.addEventListener('unhandledrejection', function onUnhandledRejection(event) {
        const reason = event && event.reason && event.reason.message
            ? event.reason.message
            : String((event && event.reason) || 'unknown');
        recordConsoleError('unhandledrejection', [reason]);
    });

    global.addEventListener('keydown', function onKeyDown(event) {
        recordInput('keydown', { key: event.key, code: event.code, repeat: !!event.repeat });
    }, true);
    global.addEventListener('keyup', function onKeyUp(event) {
        recordInput('keyup', { key: event.key, code: event.code });
    }, true);
    global.addEventListener('mousedown', function onMouseDown(event) {
        recordInput('mousedown', { button: event.button, clientX: event.clientX, clientY: event.clientY });
    }, true);
    global.addEventListener('mouseup', function onMouseUp(event) {
        recordInput('mouseup', { button: event.button, clientX: event.clientX, clientY: event.clientY });
    }, true);
    global.addEventListener('click', function onClick(event) {
        recordInput('click', { button: event.button, clientX: event.clientX, clientY: event.clientY });
    }, true);

    recordEvent('test-harness:ready', {
        seed,
        scenario,
        flags
    });

    function getPhaserGame() {
        if (global.__SDS_GAME__) return global.__SDS_GAME__;
        if (!global.Phaser || !Array.isArray(global.Phaser.GAMES) || global.Phaser.GAMES.length === 0) {
            return null;
        }
        return global.Phaser.GAMES[0] || null;
    }

    function getActiveSceneKey() {
        const game = getPhaserGame();
        if (!game || !game.scene || typeof game.scene.getScenes !== 'function') return null;
        const scenes = game.scene.getScenes(true) || [];
        const active = scenes.find((scene) => scene && scene.sys && scene.sys.settings && scene.sys.settings.active !== false);
        return active && active.sys && active.sys.settings ? active.sys.settings.key : null;
    }

    function tryStartNewGame() {
        const game = getPhaserGame();
        if (!game || !game.scene || typeof game.scene.getScene !== 'function') return false;
        const titleScene = game.scene.getScene('TitleScene');
        if (!titleScene || !titleScene.scene) return false;
        try {
            if (global.GameState && typeof global.GameState.reset === 'function') {
                global.GameState.reset();
                if (typeof global.GameState.addItem === 'function') {
                    global.GameState.addItem('hpPotion', 3);
                }
            }
            titleScene.scene.start('HubScene');
            recordEvent('test-harness:auto-start', { ok: true, from: 'TitleScene', to: 'HubScene' });
            return true;
        } catch (error) {
            recordConsoleError('test-harness:auto-start-failed', [error && error.message ? error.message : String(error)]);
            return false;
        }
    }

    function stopOverlayScenes(game) {
        const keys = ['InventoryScene', 'HelpScene', 'PauseScene', 'DialogScene', 'ShopScene', 'BlacksmithScene'];
        keys.forEach((key) => {
            try {
                if (game.scene && typeof game.scene.isActive === 'function' && game.scene.isActive(key)) {
                    game.scene.stop(key);
                }
            } catch (_err) {
                // ignore
            }
        });
    }

    function startLevelScene(bossKey) {
        const game = getPhaserGame();
        if (!game || !game.scene || typeof game.scene.getScene !== 'function') return false;
        const hubScene = game.scene.getScene('HubScene');
        if (!hubScene || !hubScene.scene) return false;
        try {
            stopOverlayScenes(game);
            hubScene.scene.start('LevelScene', { bossKey: bossKey || 'wrath' });
            recordEvent('test-harness:scene-jump', { from: 'HubScene', to: 'LevelScene', bossKey: bossKey || 'wrath' });
            return true;
        } catch (error) {
            recordConsoleError('test-harness:start-level-failed', [error && error.message ? error.message : String(error)]);
            return false;
        }
    }

    function startBossScene(bossKey) {
        const game = getPhaserGame();
        if (!game || !game.scene || typeof game.scene.getScene !== 'function') return false;
        const levelScene = game.scene.getScene('LevelScene');
        if (!levelScene || !levelScene.scene) return false;
        try {
            stopOverlayScenes(game);
            levelScene.scene.stop('UIScene');
            levelScene.scene.start('BossScene', { bossKey: bossKey || 'wrath' });
            recordEvent('test-harness:scene-jump', { from: 'LevelScene', to: 'BossScene', bossKey: bossKey || 'wrath' });
            return true;
        } catch (error) {
            recordConsoleError('test-harness:start-boss-failed', [error && error.message ? error.message : String(error)]);
            return false;
        }
    }

    function returnHubScene() {
        const game = getPhaserGame();
        if (!game || !game.scene || typeof game.scene.getScene !== 'function') return false;
        const bossScene = game.scene.getScene('BossScene') || game.scene.getScene('LevelScene');
        if (!bossScene || !bossScene.scene) return false;
        try {
            stopOverlayScenes(game);
            bossScene.scene.stop('UIScene');
            bossScene.scene.start('HubScene');
            recordEvent('test-harness:scene-jump', { from: bossScene.sys.settings.key, to: 'HubScene' });
            return true;
        } catch (error) {
            recordConsoleError('test-harness:return-hub-failed', [error && error.message ? error.message : String(error)]);
            return false;
        }
    }

    const api = {
        enabled: true,
        getSeed: function getSeed() {
            return seed;
        },
        getScenario: function getScenario() {
            return scenario;
        },
        getFlags: function getFlags() {
            return safeSerialize(flags);
        },
        getNow: function getNow() {
            return now();
        },
        getEvents: function getEvents() {
            return safeSerialize(events);
        },
        getInputLog: function getInputLog() {
            return safeSerialize(inputLog);
        },
        getConsoleErrors: function getConsoleErrors() {
            return safeSerialize(consoleErrors);
        },
        recordEvent: recordEvent,
        setSnapshotProvider: function setSnapshotProvider(provider) {
            snapshotProvider = typeof provider === 'function' ? provider : snapshotProvider;
        },
        getSnapshot: function getSnapshot() {
            const snapshot = snapshotProvider ? snapshotProvider() : null;
            const safeSnapshot = safeSerialize(snapshot) || {};
            const scene = getActiveSceneKey();
            if (!safeSnapshot.scene) safeSnapshot.scene = scene;
            const game = getPhaserGame();
            if (game && game.scene && typeof game.scene.getScene === 'function') {
                const levelScene = game.scene.getScene('LevelScene');
                const hubScene = game.scene.getScene('HubScene');
                const activeScene = levelScene && levelScene.sys && levelScene.sys.settings && levelScene.sys.settings.active
                    ? levelScene
                    : (hubScene && hubScene.sys && hubScene.sys.settings && hubScene.sys.settings.active ? hubScene : null);
                if (activeScene && activeScene.player) {
                    safeSnapshot.player = {
                        x: Math.round(activeScene.player.x || 0),
                        y: Math.round(activeScene.player.y || 0),
                        hp: Math.round(activeScene.player.hp || 0),
                        stamina: Math.round(activeScene.player.stamina || 0)
                    };
                }
            }
            safeSnapshot.seed = seed;
            safeSnapshot.scenario = scenario;
            safeSnapshot.flags = safeSerialize(flags);
            safeSnapshot.events = safeSerialize(events);
            safeSnapshot.consoleErrors = safeSerialize(consoleErrors);
            safeSnapshot.inputLogLength = inputLog.length;
            return safeSnapshot;
        },
        startNewGame: function startNewGame() {
            return tryStartNewGame();
        },
        startLevel: function startLevel(bossKey) {
            return startLevelScene(bossKey);
        },
        startBoss: function startBoss(bossKey) {
            return startBossScene(bossKey);
        },
        returnHub: function returnHub() {
            return returnHubScene();
        },
        openScene: function openScene(sceneKey, data) {
            const game = getPhaserGame();
            if (!game || !game.scene || typeof game.scene.start !== 'function') return false;
            try {
                game.scene.start(sceneKey, data || {});
                recordEvent('test-harness:scene-open', { sceneKey, mode: 'start', data: data || null });
                return true;
            } catch (error) {
                recordConsoleError('test-harness:open-scene-failed', [sceneKey, error && error.message ? error.message : String(error)]);
                return false;
            }
        },
        launchScene: function launchScene(sceneKey, data, parentSceneKey) {
            const game = getPhaserGame();
            if (!game || !game.scene || typeof game.scene.getScene !== 'function') return false;
            const parentKey = parentSceneKey || 'HubScene';
            const parentScene = game.scene.getScene(parentKey);
            if (!parentScene || !parentScene.scene || typeof parentScene.scene.launch !== 'function') return false;
            try {
                parentScene.scene.launch(sceneKey, data || {});
                recordEvent('test-harness:scene-open', { sceneKey, mode: 'launch', parentSceneKey: parentKey, data: data || null });
                return true;
            } catch (error) {
                recordConsoleError('test-harness:launch-scene-failed', [sceneKey, error && error.message ? error.message : String(error)]);
                return false;
            }
        },
        restoreRandom: function restoreRandom() {
            Math.random = originalRandom;
        }
    };

    global.__SDS_TEST_INTERNALS__ = api;
    global.__SDS_TEST__ = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
