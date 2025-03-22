import * as THREE from 'three';

export class TypingManager {
    constructor(game) {
        this.game = game;
        this.currentLetter = '';
        this.targetLetter = '';
        this.currentBox = null;  // Track current box
        this.targetWordDisplay = document.getElementById('target-word');
        this.init();
    }

    init() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        this.updateTargetLetter();
    }

    updateTargetLetter() {
        // Find the first uncompleted box that hasn't been passed
        const nextBox = this.game.boxes.find(box => 
            !box.completed && box.box.position.x > this.game.player.mesh.position.x
        );
        
        if (nextBox) {
            this.targetLetter = nextBox.character;
            this.currentBox = nextBox;
            this.targetWordDisplay.textContent = this.targetLetter;
            console.log('Next target letter:', this.targetLetter, 'Distance:', nextBox.distance);
        }
    }

    onKeyDown(event) {
        const typed = event.key.toUpperCase();
        console.log('Typed:', typed, 'Target:', this.targetLetter);
        
        this.targetWordDisplay.textContent = typed;

        if (typed === this.targetLetter && this.currentBox) {
            console.log('Correct letter typed!');
            this.game.isTypingCorrect = true;
            this.targetWordDisplay.style.color = '#00ff00';
            
            // Increase score
            this.game.score += 100;
            this.game.uiManager.updateScore(this.game.score);
            
            // Call updateDifficulty after updating score
            this.game.updateDifficulty();
            
            const targetX = this.currentBox.box.position.x;
            const currentX = this.game.player.mesh.position.x;
            const distance = targetX - currentX;
            
            this.currentBox.completed = true;

            // Create animation loop for smooth movement
            let progress = 0;
            const moveInterval = setInterval(() => {
                const moveStep = 0.1;
                progress += moveStep;
                
                this.game.player.mesh.position.x += moveStep * distance;

                if (progress >= 1) {
                    clearInterval(moveInterval);
                    this.game.player.mesh.position.x = targetX;
                    
                    // Trigger jump and box breaking after reaching the position
                    this.game.player.jumpAndBreak(this.currentBox);
                    
                    this.game.isTypingCorrect = false;
                    this.targetWordDisplay.style.color = '#ffffff';
                    this.updateTargetLetter();
                }
            }, 16);
        } else {
            this.targetWordDisplay.style.color = '#ff0000';
            // Optionally: Decrease score for wrong letters
            // this.game.score = Math.max(0, this.game.score - 50);  // Prevent negative scores
            // this.game.uiManager.updateScore(this.game.score);
        }
    }
} 