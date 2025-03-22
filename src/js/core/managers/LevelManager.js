import * as THREE from 'three';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 0;
        this.obstacles = [];
        this.letters = ['F', 'G', 'H', 'J', 'K', 'L']; // Letters to type
        this.currentLetterIndex = 0;
        
        this.init();
    }

    init() {
        // Create blue sky background
        this.game.scene.background = new THREE.Color(0x87CEEB);

        // Create sun
        const sunGeometry = new THREE.CircleGeometry(5, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(15, 10, -10);
        this.game.scene.add(sun);

        // Create ground/road
        const roadGeometry = new THREE.PlaneGeometry(1000, 10);
        const roadMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xA0522D,
            side: THREE.DoubleSide
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = Math.PI / 2;
        road.position.y = -1;
        this.game.scene.add(road);

        // Create initial obstacles with letters
        this.createObstacles();
    }

    createObstacles() {
        // Clear existing obstacles
        this.obstacles.forEach(obstacle => {
            this.game.scene.remove(obstacle.mesh);
            if (obstacle.textMesh) this.game.scene.remove(obstacle.textMesh);
        });
        this.obstacles = [];

        // Create new obstacles with letters
        for (let i = 0; i < this.letters.length; i++) {
            // Create box obstacle
            const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
            const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xCD853F }); // Wooden box color
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(i * 8 + 10, 1, 0); // Space obstacles evenly ahead

            // Create text for letter
            const letter = this.letters[i];
            const textGeometry = new THREE.TextGeometry(letter, {
                size: 1,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false
            });
            const textMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(i * 8 + 9.5, 1, 1); // Position text on box

            this.obstacles.push({
                mesh: box,
                textMesh: textMesh,
                letter: letter
            });

            this.game.scene.add(box);
            this.game.scene.add(textMesh);
        }
    }

    update(delta) {
        // Move camera and player together
        if (this.game.player.isMoving) {
            // Move obstacles towards player (simulating forward movement)
            this.obstacles.forEach(obstacle => {
                obstacle.mesh.position.x -= this.game.player.forwardSpeed * delta;
                if (obstacle.textMesh) {
                    obstacle.textMesh.position.x -= this.game.player.forwardSpeed * delta;
                }
            });
        }
    }
} 