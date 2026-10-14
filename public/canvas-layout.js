// CSS controls available space; these logical sizes keep game UI proportions stable.
export const GAME_VIEWPORT = { width: 960, height: 720 };
export const PLAYER_PANEL_VIEWPORT = { width: 960, height: 180 };

export function fitGameLayout(availableWidth, availableHeight, gap = 8) {
    const combinedRatio = (GAME_VIEWPORT.height + PLAYER_PANEL_VIEWPORT.height) / GAME_VIEWPORT.width;
    const width = Math.max(0, Math.min(availableWidth, (availableHeight - gap) / combinedRatio));
    return {
        width,
        gameHeight: width * GAME_VIEWPORT.height / GAME_VIEWPORT.width,
        panelHeight: width * PLAYER_PANEL_VIEWPORT.height / PLAYER_PANEL_VIEWPORT.width
    };
}

export function updateCanvasViewport(game, parentBounds, viewport, pixelRatio) {
    const mobile = typeof document !== "undefined" && document.body.classList.contains("touch-mode");
    if (mobile && game.canvas?.parentElement) parentBounds = game.canvas.parentElement.getBoundingClientRect();
    const playing = game.state?.getCurrentState()?.getTankSprite;
    if (mobile && parentBounds.width > 0 && (playing || viewport === PLAYER_PANEL_VIEWPORT)) viewport = { width: 960, height: Math.max(48, 960 * parentBounds.height / parentBounds.width) };
    const displayScale = Math.max(0, Math.min(parentBounds.width / viewport.width, parentBounds.height / viewport.height));
    game.scale.setUserScale(displayScale / pixelRatio, displayScale / pixelRatio, 0, 0);
    const width = viewport.width * pixelRatio;
    const height = viewport.height * pixelRatio;
    if (game.width !== width || game.height !== height) game.scale.setGameSize(width, height);
}
