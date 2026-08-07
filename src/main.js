import { Game } from './js/Game.js';

window.addEventListener('load', () => {
    const game = new Game();
    game.init();
    if (import.meta.env.DEV) window.__TYPEQUEST__ = game;
});
