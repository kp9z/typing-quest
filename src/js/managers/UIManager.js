export class UIManager {
    constructor(game) {
        this.game = game;
        this.setupUI();
    }

    setupUI() {
        this.scoreDisplay = document.getElementById('score');
        this.targetWordDisplay = document.getElementById('target-word');
    }

    updateScore(score) {
        this.scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
    }

    showGameOver(score) {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.innerHTML = `
            <h1>Game Over!</h1>
            <p>Final Score: ${Math.floor(score)}</p>
            <button id="replay-button">Play Again</button>
        `;
        
        this.styleGameOverScreen(gameOverScreen);
        this.setupReplayButton(gameOverScreen.querySelector('#replay-button'));
        
        document.body.appendChild(gameOverScreen);
    }

    styleGameOverScreen(screen) {
        Object.assign(screen.style, {
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

        const heading = screen.querySelector('h1');
        Object.assign(heading.style, {
            color: '#ff0000',
            marginBottom: '20px',
            fontSize: '48px'
        });

        const score = screen.querySelector('p');
        Object.assign(score.style, {
            color: '#00ff00',
            marginBottom: '30px',
            fontSize: '36px'
        });
    }

    setupReplayButton(button) {
        Object.assign(button.style, {
            padding: '15px 30px',
            fontSize: '24px',
            backgroundColor: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        });

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#00cc00';
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#00ff00';
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', () => {
            window.location.reload();
        });
    }
} 