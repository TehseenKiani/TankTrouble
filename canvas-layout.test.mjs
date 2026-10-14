import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_VIEWPORT, PLAYER_PANEL_VIEWPORT, fitGameLayout, updateCanvasViewport } from './src/js/tt/ui/canvaslayout.js';

test('game and player panel retain proportions and fit short and wide windows', () => {
    for (const [width, height] of [[1040, 950], [1040, 520], [1366, 650], [390, 700], [844, 280]]) {
        const layout = fitGameLayout(width, height);
        assert(layout.width <= width);
        assert(layout.gameHeight + layout.panelHeight + 8 <= height + 0.001);
        assert(Math.abs(layout.gameHeight / layout.width - 0.75) < 0.001);
        assert(Math.abs(layout.panelHeight / layout.width - 0.1875) < 0.001);
    }
});

test('display scaling and pixel density change rendered size without changing logical UI proportions', () => {
    for (const viewport of [GAME_VIEWPORT, PLAYER_PANEL_VIEWPORT]) {
        for (const pixelRatio of [2, 2.5, 3]) {
            const calls = [];
            const game = { width: 0, height: 0, scale: {
                setUserScale(x, y) { calls.push([x, y]); },
                setGameSize(width, height) { game.width = width; game.height = height; }
            } };
            for (const displayWidth of [480, 720, 960]) {
                updateCanvasViewport(game, { width: displayWidth, height: displayWidth * viewport.height / viewport.width }, viewport, pixelRatio);
                assert.equal(game.width / pixelRatio, viewport.width);
                assert.equal(game.height / pixelRatio, viewport.height);
                const [x, y] = calls.at(-1);
                assert.equal(x, y);
                assert(Math.abs(game.width * x - displayWidth) < 0.001);
            }
        }
    }
});
