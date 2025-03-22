import { Obstacle } from '../entities/Obstacle.js';
import { OBSTACLE_CONSTANTS } from '../utils/Constants.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.obstacles = [];
        this.letterSets = [
            ['F', 'J'],                           // Level 1
            ['F', 'J', 'D', 'K'],                // Level 2
            ['F', 'J', 'D', 'K', 'S', 'L'],      // Level 3
            ['F', 'J', 'D', 'K', 'S', 'L', 'A'], // Level 4
            OBSTACLE_CONSTANTS.POSSIBLE_LETTERS    // Level 5
        ];
        
        this.spawnRates = [2000, 1800, 1500, 1200, 1000]; // ms between spawns
        this.scrollSpeeds = [0.02, 0.025, 0.03, 0.035, 0.04];
    }

    createObstacle() {
        const letter = OBSTACLE_CONSTANTS.POSSIBLE_LETTERS[
            Math.floor(Math.random() * OBSTACLE_CONSTANTS.POSSIBLE_LETTERS.length)
        ];
        
        const lastObstacle = this.obstacles[this.obstacles.length - 1];
        const startX = lastObstacle 
            ? lastObstacle.box.position.x + OBSTACLE_CONSTANTS.BASE_DISTANCE 
            : 10;
        
        const position = new THREE.Vector3(startX, OBSTACLE_CONSTANTS.HEIGHT, 0);
        const obstacle = new Obstacle(this.game.scene, position, letter);
        
        this.obstacles.push(obstacle);
    }

    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            if (!obstacle.isCompleted) {
                obstacle.update(this.game.GAME_CONSTANTS.SCROLL_SPEED);
            }
        });

        // Clean up off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.box.position.x < -20) {
                obstacle.destroy();
                return false;
            }
            return true;
        });
    }

    getNextUncompletedObstacle() {
        return this.obstacles.find(obstacle => 
            !obstacle.isCompleted && 
            obstacle.box.position.x > this.game.player.mesh.position.x
        );
    }

    reset() {
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
    }

    increaseLevel() {
        if (this.currentLevel < this.letterSets.length) {
            this.currentLevel++;
            this.game.spawnInterval = this.spawnRates[this.currentLevel - 1];
            this.game.scrollSpeed = this.scrollSpeeds[this.currentLevel - 1];
            this.game.uiManager.showLevelComplete(this.currentLevel);
        }
    }

    getCurrentLetterSet() {
        return this.letterSets[this.currentLevel - 1];
    }

    checkLevelProgress() {
        // Increase level every 1000 points
        if (this.game.score > 0 && this.game.score % 1000 === 0) {
            this.increaseLevel();
        }
    }
} 