import * as THREE from 'three';
import { Player } from './entities/Player.js';
import { TypingManager } from './managers/TypingManager.js';
import { UIManager } from './managers/UIManager.js';
import { BackgroundManager } from './managers/BackgroundManager.js';
import { LETTER_SETS, lettersForLevel, levelForScore } from './gameRules.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.possibleLetters = ['F', 'J']; // Starting letters
        this.boxes = [];
        this.scrollSpeed = 0.03; // Initial speed
        this.isTypingCorrect = false;
        this.nextSpawnTime = 0;
        this.spawnInterval = 2000;
        this.lastTime = Date.now();
        this.score = 0;
        this.uiManager = new UIManager();
        this.isGameOver = false;
        
        // Add new properties for difficulty scaling
        this.level = 1;
        this.blocksPassedInLevel = 0;
        this.baseScrollSpeed = 0.03;
        this.letterSets = LETTER_SETS;
        
        // Remove background properties from constructor
        this.backgrounds = null;
        this.backgroundLayers = null;
        
        this.handleResize = this.handleResize.bind(this);
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Set up camera
        const aspectRatio = window.innerWidth / window.innerHeight;
        let cameraSize = 10; // Base size for landscape
        
        if (aspectRatio < 1) { // Portrait mode
            cameraSize = 25; // Increased from 15 to 25 to show more of the road
        }
        
        this.camera = new THREE.OrthographicCamera(
            -cameraSize * aspectRatio,
            cameraSize * aspectRatio,
            cameraSize,
            -cameraSize,
            0.1,
            1000
        );
        
        // Adjust camera position for better view in portrait
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0); // Changed from (0, 2, 0) to (0, 0, 0) for better centering

        // Set up renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Create background manager
        this.backgroundManager = new BackgroundManager(this.scene);

        // Create ground (brown platform)
        const groundGeometry = new THREE.PlaneGeometry(50, 4);
        const groundMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8b4513  // Saddle brown color
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -5;
        this.scene.add(ground);

        // Create player with game reference
        this.player = new Player(this.scene, this);
        
        // Add typing manager
        this.typingManager = new TypingManager(this);

        // Start animation loop
        this.animate();

        window.addEventListener('resize', this.handleResize);
    }

    createNewObstacle() {
        // Randomly choose F or J
        const letter = this.possibleLetters[Math.floor(Math.random() * this.possibleLetters.length)];
        
        // Create box
        const boxGeometry = new THREE.PlaneGeometry(2, 2);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xcd853f });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Generate fixed distance between obstacles
        const distance = 8; // You can adjust this value
        
        // Position box relative to the last box or starting position
        const lastBox = this.boxes[this.boxes.length - 1];
        const startX = lastBox ? lastBox.box.position.x + distance : 10; // Start closer
        box.position.set(startX, 2, 0);

        // Create letter
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const letterGeometry = new THREE.PlaneGeometry(1, 1);
        const letterMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.copy(box.position);
        letterMesh.position.z = 0.1;

        this.scene.add(box);
        this.scene.add(letterMesh);

        this.boxes.push({
            box: box,
            letter: letterMesh,
            character: letter,
            distance: distance,  // Store the distance
            completed: false    // Track if this obstacle has been passed
        });

        if (this.typingManager) this.typingManager.updateTargetLetter();
    }

    updateDifficulty() {
        // Calculate what level we should be at based on score
        const shouldBeLevel = levelForScore(this.score);
        
        // If we should level up
        if (shouldBeLevel > this.level) {
            const oldLevel = this.level;
            this.level = shouldBeLevel;
            
            // Update scene colors for new level
            this.backgroundManager.changeSceneByLevel(this.level);
            
            // Update letters based on level
            this.possibleLetters = lettersForLevel(this.level);
            
            // Increase scroll speed with each level
            this.scrollSpeed = this.baseScrollSpeed * (1 + (this.level - 1) * 0.2);
            
            // Force-update next obstacle to use new letter set
            if (this.boxes.length > 0) {
                const lastIndex = this.boxes.length - 1;
                // Update the most recently created box if it's still far away
                if (this.boxes[lastIndex].box.position.x > 5) {
                    const newLetter = this.possibleLetters[Math.floor(Math.random() * this.possibleLetters.length)];
                    
                    // Update the letter text
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = 64;
                    canvas.height = 64;
                    context.fillStyle = 'white';
                    context.font = 'bold 48px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(newLetter, 32, 32);
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    this.boxes[lastIndex].letter.material.map = texture;
                    this.boxes[lastIndex].letter.material.needsUpdate = true;
                    this.boxes[lastIndex].character = newLetter;
                }
            }
            
            // Decrease spawn interval (minimum 1000ms)
            this.spawnInterval = Math.max(2000 - (this.level - 1) * 200, 1000);
            this.uiManager.updateLevel(this.level);
            
            // Notify player of level increase
            console.log(`Level up from ${oldLevel} to ${this.level}! Score: ${this.score}`);
            console.log(`New letters: ${this.possibleLetters.join(',')}`);
            console.log(`New speed: ${this.scrollSpeed.toFixed(3)}, New spawn interval: ${this.spawnInterval}ms`);
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        const currentTime = Date.now();

        // Check if it's time to spawn a new obstacle
        if (currentTime > this.nextSpawnTime) {
            this.createNewObstacle();
            this.nextSpawnTime = currentTime + this.spawnInterval;
        }
        
        if (this.player) {
            this.player.update();
            
            // Calculate the effective position considering scene movement
            const effectivePosition = this.player.mesh.position.x + 
                (Date.now() - this.lastTime) * this.scrollSpeed;
            
            // Check if player has fallen too far behind
            if (effectivePosition < -15) {  // Adjusted threshold
                this.gameOver();
                return;  // Stop animation loop
            }
            
            if (!this.isTypingCorrect) {
                // Move everything left when not typing correctly
                this.boxes.forEach(box => {
                    box.box.position.x -= this.scrollSpeed;
                    box.letter.position.x -= this.scrollSpeed;
                    box.box.position.y = 2 + Math.sin(Date.now() * 0.002) * 0.1;
                    box.letter.position.y = box.box.position.y;
                });
                
                // Move player with scene
                this.player.mesh.position.x -= this.scrollSpeed;
            } else {
                // Add this else block to move player forward when typing correctly
                this.player.moveForward();
            }

            // Update last time for next frame
            this.lastTime = Date.now();
        }

        // Add box cleanup and scoring logic
        this.boxes = this.boxes.filter(box => {
            if (!box.completed && box.box.position.x < this.player.mesh.position.x && this.isTypingCorrect) {
                box.completed = true;
                this.score++;
                this.updateDifficulty(); // Call difficulty update when passing a box correctly
                this.uiManager.updateScore(this.score);
            }
            
            // Remove boxes that are far behind
            if (box.box.position.x < -20) {
                this.scene.remove(box.box);
                this.scene.remove(box.letter);
                return false;
            }
            return true;
        });

        // Update background positions
        this.backgroundManager.update();

        this.renderer.render(this.scene, this.camera);
    }

    gameOver() {
        if (this.isGameOver) return; // Prevent multiple calls
        
        console.log("Game Over! Final score:", this.score);
        this.isGameOver = true;
        
        // Stop the animation loop
        cancelAnimationFrame(this.animationFrameId);
        
        this.typingManager?.destroy();
        window.removeEventListener('resize', this.handleResize);
        
        // Show game over screen
        this.uiManager.showGameOver(this.score);
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const size = aspectRatio < 1 ? 25 : 10;
        this.camera.left = -size * aspectRatio;
        this.camera.right = size * aspectRatio;
        this.camera.top = size;
        this.camera.bottom = -size;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleTyping(typedChar) {
        if (this.typingManager) {
            this.typingManager.handleTyping(typedChar);
        }
    }
} 