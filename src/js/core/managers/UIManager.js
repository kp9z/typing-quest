export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.targetWordElement = document.getElementById('target-word');
        this.inputField = document.getElementById('input-field');
        this.combo = 0;
        this.comboTimeout = null;
    }

    updateScore(score) {
        this.scoreElement.textContent = `Score: ${Math.floor(score)}`;
    }

    updateCombo(combo) {
        this.combo = combo;
        
        // Clear existing timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }

        // Show combo text
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        comboText.textContent = `${combo}x Combo!`;
        comboText.style.position = 'fixed';
        comboText.style.top = '50%';
        comboText.style.left = '50%';
        comboText.style.transform = 'translate(-50%, -50%)';
        comboText.style.color = '#00ff00';
        comboText.style.fontSize = '32px';
        comboText.style.fontFamily = 'Courier New, monospace';
        comboText.style.textAlign = 'center';
        comboText.style.textShadow = '0 0 10px #00ff00';
        comboText.style.opacity = '0';
        comboText.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(comboText);

        // Fade in
        setTimeout(() => {
            comboText.style.opacity = '1';
        }, 10);

        // Set timeout to remove combo text
        this.comboTimeout = setTimeout(() => {
            comboText.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(comboText);
            }, 300);
        }, 1000);
    }

    showGameOver(score) {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.innerHTML = `
            <h1>Game Over!</h1>
            <p>Final Score: ${Math.floor(score)}</p>
            <button id="replay-button">Play Again</button>
        `;
        
        // Style the game over screen
        Object.assign(gameOverScreen.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontFamily: 'Courier New, monospace',
            fontSize: '24px',
            zIndex: '1000'
        });

        // Style the heading
        const heading = gameOverScreen.querySelector('h1');
        Object.assign(heading.style, {
            color: '#ff0000',
            marginBottom: '20px',
            fontSize: '48px'
        });

        // Style the score
        const score_p = gameOverScreen.querySelector('p');
        Object.assign(score_p.style, {
            color: '#00ff00',
            marginBottom: '30px',
            fontSize: '36px'
        });

        // Style the replay button
        const replayButton = gameOverScreen.querySelector('#replay-button');
        Object.assign(replayButton.style, {
            padding: '15px 30px',
            fontSize: '24px',
            backgroundColor: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        });

        // Add hover effect
        replayButton.addEventListener('mouseover', () => {
            replayButton.style.backgroundColor = '#00cc00';
            replayButton.style.transform = 'scale(1.1)';
        });

        replayButton.addEventListener('mouseout', () => {
            replayButton.style.backgroundColor = '#00ff00';
            replayButton.style.transform = 'scale(1)';
        });

        // Add click handler for replay BEFORE appending to document
        replayButton.addEventListener('click', () => {
            window.location.reload();  // Use window.location.reload() instead
        });

        // Append to document body
        document.body.appendChild(gameOverScreen);

        // Cancel any ongoing animations
        if (this.game && this.game.animate) {
            cancelAnimationFrame(this.game.animationFrameId);
        }
    }

    showLevelComplete(level) {
        const levelCompleteScreen = document.createElement('div');
        levelCompleteScreen.className = 'level-complete';
        levelCompleteScreen.innerHTML = `
            <h1>Level ${level} Complete!</h1>
            <p>Get ready for the next challenge...</p>
        `;
        levelCompleteScreen.style.position = 'fixed';
        levelCompleteScreen.style.top = '0';
        levelCompleteScreen.style.left = '0';
        levelCompleteScreen.style.width = '100%';
        levelCompleteScreen.style.height = '100%';
        levelCompleteScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        levelCompleteScreen.style.display = 'flex';
        levelCompleteScreen.style.flexDirection = 'column';
        levelCompleteScreen.style.justifyContent = 'center';
        levelCompleteScreen.style.alignItems = 'center';
        levelCompleteScreen.style.color = '#00ff00';
        levelCompleteScreen.style.fontFamily = 'Courier New, monospace';
        levelCompleteScreen.style.zIndex = '1000';

        document.body.appendChild(levelCompleteScreen);

        // Remove screen after 3 seconds
        setTimeout(() => {
            document.body.removeChild(levelCompleteScreen);
        }, 3000);
    }
} 