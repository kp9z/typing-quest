import * as THREE from 'three';

export class TypingManager {
    constructor(game) {
        this.game = game;
        this.currentLetter = '';
        this.targetLetter = '';
        this.currentBox = null;  // Track current box
        this.targetWordDisplay = document.getElementById('target-word');
        this.mobileInput = document.getElementById('mobile-input');
        this.init();
        this.setupMobileInput();
    }

    init() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        this.updateTargetLetter();
    }

    setupMobileInput() {
        const typingUI = document.getElementById('typing-ui');
        
        // Show keyboard when typing UI is tapped
        typingUI.addEventListener('click', () => {
            // Focus and scroll into view for iOS
            this.mobileInput.focus();
            this.mobileInput.scrollIntoView(false);
            
            // Add a small delay to ensure proper scrolling on iOS
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 100);
        });
        
        // Handle mobile input
        this.mobileInput.addEventListener('input', (event) => {
            const key = event.target.value.slice(-1);
            if (key) {
                this.onKeyDown({ key: key });
                this.mobileInput.value = '';
            }
        });

        // Prevent zoom on focus (iOS)
        this.mobileInput.setAttribute('style', 'font-size: 16px');  // Prevents zoom on iOS
    }

    handleTyping(typed) {
        console.log('Typed:', typed, 'Target:', this.targetLetter);
        
        this.targetWordDisplay.textContent = typed;

        if (typed === this.targetLetter && this.currentBox) {
            // Add distance check to ensure box is within reasonable range
            const distanceToBox = this.currentBox.box.position.x - this.game.player.mesh.position.x;
            
            // Only allow typing if box is within reasonable range (e.g., between 0 and 15 units)
            if (distanceToBox > 0 && distanceToBox < 15) {
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
            }
        }
        this.targetWordDisplay.style.color = '#ff0000';
    }

    onKeyDown(event) {
        const typed = event.key.toUpperCase();
        this.handleTyping(typed);
    }

    updateTargetLetter() {
        // Find the first uncompleted box that hasn't been passed and is within range
        const nextBox = this.game.boxes.find(box => {
            const distance = box.box.position.x - this.game.player.mesh.position.x;
            return !box.completed && 
                   distance > 0 && 
                   distance < 15;
        });
        
        if (nextBox) {
            this.targetLetter = nextBox.character;
            this.currentBox = nextBox;
            this.targetWordDisplay.textContent = this.targetLetter;
            console.log('Next target letter:', this.targetLetter, 'Distance:', nextBox.distance);
        } else {
            // No valid box found, clear the target
            this.targetLetter = '';
            this.currentBox = null;
            this.targetWordDisplay.textContent = '';
        }
    }
} 