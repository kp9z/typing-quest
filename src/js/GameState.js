export class GameState {
    constructor() {
        this.score = 0;
        this.isGameOver = false;
        this.isTypingCorrect = false;
        this.lastTime = Date.now();
    }

    reset() {
        this.score = 0;
        this.isGameOver = false;
        this.isTypingCorrect = false;
        this.lastTime = Date.now();
    }

    updateScore(points) {
        this.score += points;
    }
} 