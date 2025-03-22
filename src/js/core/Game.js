import * as THREE from 'three';
import { Scene } from './Scene.js';
import { TypingManager } from '../managers/TypingManager.js';
import { LevelManager } from '../managers/LevelManager.js';
import { UIManager } from '../managers/UIManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { Player } from '../entities/Player.js';
import { GAME_CONSTANTS } from '../utils/Constants.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.lastTime = Date.now();
        this.isGameOver = false;
        
        // Managers
        this.sceneManager = new Scene(this);
        this.typingManager = null;
        this.levelManager = null;
        this.uiManager = new UIManager(this);
        this.scoreManager = new ScoreManager(this);
        
        // Game state
        this.isTypingCorrect = false;
        this.nextSpawnTime = 0;
    }

    init() {
        this.sceneManager.init();
        this.scene = this.sceneManager.scene;
        this.camera = this.sceneManager.camera;
        this.renderer = this.sceneManager.renderer;
        
        this.player = new Player(this.scene, this);
        this.typingManager = new TypingManager(this);
        this.levelManager = new LevelManager(this);
        
        this.animate();
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        const currentTime = Date.now();

        if (currentTime > this.nextSpawnTime) {
            this.levelManager.createObstacle();
            this.nextSpawnTime = currentTime + GAME_CONSTANTS.SPAWN_INTERVAL;
        }

        if (this.player) {
            this.player.update();
            
            const effectivePosition = this.player.mesh.position.x + 
                (Date.now() - this.lastTime) * GAME_CONSTANTS.SCROLL_SPEED;
            
            if (effectivePosition < GAME_CONSTANTS.GAME_OVER_THRESHOLD) {
                this.gameOver();
                return;
            }
            
            if (!this.isTypingCorrect) {
                this.levelManager.updateObstacles();
                this.player.mesh.position.x -= GAME_CONSTANTS.SCROLL_SPEED;
            }

            this.lastTime = Date.now();
        }

        this.renderer.render(this.scene, this.camera);
    }

    gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        cancelAnimationFrame(this.animationFrameId);
        
        if (this.typingManager) {
            window.removeEventListener('keydown', this.typingManager.onKeyDown.bind(this.typingManager));
        }
        
        this.uiManager.showGameOver(this.scoreManager.getScore());
    }
} 