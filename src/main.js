import * as THREE from 'three';
import { Game } from './js/Game.js';

// Initialize the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
    game.init();
}); 