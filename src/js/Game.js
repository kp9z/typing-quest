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
        this.hasStarted = false;
        
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
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Create background manager
        this.backgroundManager = new BackgroundManager(this.scene);


        // Create player with game reference
        this.player = new Player(this.scene, this);
        
        // Add typing manager
        this.typingManager = new TypingManager(this);
        this.uiManager.bindStart(() => this.start());

        // Start animation loop
        this.animate();

        window.addEventListener('resize', this.handleResize);
    }

    createNewObstacle() {
        // Randomly choose F or J
        const letter = this.possibleLetters[Math.floor(Math.random() * this.possibleLetters.length)];
        
        // Create box
        const boxGeometry = new THREE.PlaneGeometry(2, 2);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x172044 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Generate fixed distance between obstacles
        const distance = 8; // You can adjust this value
        
        // Position box relative to the last box or starting position
        const lastBox = this.boxes[this.boxes.length - 1];
        const startX = lastBox ? lastBox.box.position.x + distance : 10; // Start closer
        box.position.set(startX, -1.8, 0);

        // Create letter
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        context.fillStyle = '#c9f27b';
        context.font = '900 82px ui-monospace, monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter, 64, 66);

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
                    canvas.width = 128;
                    canvas.height = 128;
                    context.fillStyle = '#c9f27b';
                    context.font = '900 82px ui-monospace, monospace';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(newLetter, 64, 66);
                    
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
        if (!this.hasStarted || document.hidden) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        const currentTime = Date.now();

        // Check if it's time to spawn a new obstacle
        if (currentTime > this.nextSpawnTime) {
            this.createNewObstacle();
            this.nextSpawnTime = currentTime + this.spawnInterval;
        }
        
        if (this.player) {
            this.player.update();
            
            const screenPosition = this.player.mesh.position.x - this.camera.position.x;
            if (screenPosition < -15) {
                this.gameOver();
                return;
            }
            
            if (!this.isTypingCorrect) {
                // Move everything left when not typing correctly
                this.boxes.forEach(box => {
                    box.box.position.x -= this.scrollSpeed;
                    box.letter.position.x -= this.scrollSpeed;
                    box.box.position.y = -1.8 + Math.sin(Date.now() * 0.002) * 0.08;
                    box.letter.position.y = box.box.position.y;
                });
                
                // Move player with scene
                this.player.mesh.position.x -= this.scrollSpeed;
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
            if (box.box.position.x - this.camera.position.x < -20) {
                this.scene.remove(box.box);
                this.scene.remove(box.letter);
                return false;
            }
            return true;
        });

        // Update background positions
        this.backgroundManager.update(this.camera.position.x);

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

    start() {
        if (this.hasStarted) return;
        this.hasStarted = true;
        this.lastTime = Date.now();
        this.nextSpawnTime = 0;
        this.typingManager.focusInput();
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