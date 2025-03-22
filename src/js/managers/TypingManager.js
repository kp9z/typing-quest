import { GAME_CONSTANTS } from '../utils/Constants.js';

export class TypingManager {
    constructor(game) {
        this.game = game;
        this.currentLetter = '';
        this.targetLetter = '';
        this.currentBox = null;
        this.targetWordDisplay = document.getElementById('target-word');
        this.init();
    }

    init() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        this.updateTargetLetter();
    }

    updateTargetLetter() {
        const nextBox = this.game.levelManager.getNextUncompletedObstacle();
        
        if (nextBox) {
            this.targetLetter = nextBox.letter;
            this.currentBox = nextBox;
            this.targetWordDisplay.textContent = this.targetLetter;
            console.log('Next target letter:', this.targetLetter);
        }
    }

    onKeyDown(event) {
        const typed = event.key.toUpperCase();
        this.targetWordDisplay.textContent = typed;

        if (typed === this.targetLetter && this.currentBox) {
            this.game.isTypingCorrect = true;
            this.targetWordDisplay.style.color = '#00ff00';
            
            this.game.scoreManager.addScore(GAME_CONSTANTS.SCORE_INCREMENT);
            
            const targetX = this.currentBox.box.position.x;
            const currentX = this.game.player.mesh.position.x;
            const distance = targetX - currentX;
            
            this.currentBox.isCompleted = true;
            this.movePlayerToObstacle(distance);
        } else {
            this.targetWordDisplay.style.color = '#ff0000';
        }
    }

    movePlayerToObstacle(distance) {
        let progress = 0;
        const moveInterval = setInterval(() => {
            const moveStep = 0.1;
            progress += moveStep;
            
            this.game.player.mesh.position.x += moveStep * distance;

            if (progress >= 1) {
                clearInterval(moveInterval);
                this.game.player.mesh.position.x = this.currentBox.box.position.x;
                this.game.player.jumpAndBreak(this.currentBox);
                
                this.game.isTypingCorrect = false;
                this.targetWordDisplay.style.color = '#ffffff';
                this.updateTargetLetter();
            }
        }, 16);
    }
} 