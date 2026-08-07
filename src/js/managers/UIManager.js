export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.targetWordElement = document.getElementById('target-word');
        this.promptElement = document.getElementById('typing-prompt');
        this.typingPanel = document.getElementById('typing-ui');
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        this.feedbackTimeout = null;
    }

    bindStart(onStart) {
        this.startButton?.addEventListener('click', () => {
            this.startScreen.hidden = true;
            onStart();
        }, { once: true });
    }

    updateScore(score) {
        this.scoreElement.textContent = Math.floor(score).toString().padStart(4, '0');
    }

    updateLevel(level) {
        if (this.levelElement) this.levelElement.textContent = String(level);
    }

    setTarget(letter) {
        this.targetWordElement.textContent = letter || '·';
        this.targetWordElement.setAttribute('aria-label', letter ? `Type ${letter}` : 'Waiting for next letter');
        if (!this.typingPanel?.dataset.feedback && this.promptElement) {
            this.promptElement.textContent = letter ? 'Type the next key' : 'Scanning the trail…';
        }
    }

    showTypingFeedback(type, typed) {
        if (!this.typingPanel) return;
        this.typingPanel.dataset.feedback = type;
        this.promptElement.textContent = type === 'hit' ? 'Perfect hit' : `${typed} missed · try again`;
        window.clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = window.setTimeout(() => {
            delete this.typingPanel.dataset.feedback;
            this.promptElement.textContent = this.targetWordElement.textContent === '·'
                ? 'Scanning the trail…'
                : 'Type the next key';
        }, 360);
    }

    showGameOver(score) {
        const gameOverScreen = document.createElement('section');
        gameOverScreen.className = 'overlay game-over';
        gameOverScreen.setAttribute('aria-labelledby', 'game-over-title');
        gameOverScreen.innerHTML = `
            <div class="overlay-card">
                <p class="eyebrow">Trail complete</p>
                <h1 id="game-over-title">Good run.<br>Go again?</h1>
                <p class="final-score">Final score<strong>${Math.floor(score).toString().padStart(4, '0')}</strong></p>
                <button id="replay-button" type="button">Play again <span aria-hidden="true">↻</span></button>
            </div>
        `;
        gameOverScreen.querySelector('#replay-button').addEventListener('click', () => window.location.reload());
        document.body.appendChild(gameOverScreen);
        gameOverScreen.querySelector('#replay-button').focus();
    }
}
