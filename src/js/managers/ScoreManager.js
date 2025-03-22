export class ScoreManager {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.scoreDisplay = document.getElementById('score');
    }

    addScore(points) {
        this.score += points;
        this.updateDisplay();
    }

    getScore() {
        return this.score;
    }

    updateDisplay() {
        this.scoreDisplay.textContent = `Score: ${Math.floor(this.score)}`;
    }

    reset() {
        this.score = 0;
        this.updateDisplay();
    }
} 