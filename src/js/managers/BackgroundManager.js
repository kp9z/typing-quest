import * as THREE from 'three';

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgrounds = [];
        this.clouds = [];
        
        // Remove old background layers and create new distinct ones
        this.createSky();
        this.createScoreBar();
        this.createBackground();
        this.createGround();
        this.createClouds();
    }

    createSky() {
        const skyGeometry = new THREE.PlaneGeometry(100, 20);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB  // Sky blue
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.position.set(0, 0, -6);
        this.scene.add(sky);
    }

    createScoreBar() {
        // Create semi-transparent score bar at top
        const scoreBarGeometry = new THREE.PlaneGeometry(100, 2);
        const scoreBarMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.3
        });
        const scoreBar = new THREE.Mesh(scoreBarGeometry, scoreBarMaterial);
        scoreBar.position.set(0, 9, -5);
        this.scene.add(scoreBar);
    }

    createBackground() {
        // Main brown background
        const bgGeometry = new THREE.PlaneGeometry(100, 15);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B4513  // Saddle brown
        });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        background.position.set(0, -2, -4);
        this.scene.add(background);
    }

    createGround() {
        // Create main ground platform (darker brown)
        const groundGeometry = new THREE.PlaneGeometry(100, 6);
        const groundMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x654321  // Darker brown
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.set(0, -5, -3);
        this.scene.add(ground);

        // Create thin highlight line
        const lineGeometry = new THREE.PlaneGeometry(100, 0.2);
        const lineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B7355,  // Light brown
            transparent: true,
            opacity: 0.5
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, -2, -2.9);
        this.scene.add(line);
    }

    createClouds() {
        const numClouds = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numClouds; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create larger, more distinct clouds
            const numPuffs = 4 + Math.floor(Math.random() * 3);
            const baseSize = 2;
            
            for (let j = 0; j < numPuffs; j++) {
                const size = baseSize * (0.8 + Math.random() * 0.4);
                const cloudGeometry = new THREE.CircleGeometry(size, 32);
                const cloudMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.95
                });
                
                const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
                puff.position.x = j * (size * 0.7) - (numPuffs * size * 0.3);
                puff.position.y = Math.random() * size * 0.2;
                
                cloudGroup.add(puff);
            }
            
            // Position clouds higher in the sky
            cloudGroup.position.x = Math.random() * 100 - 50;
            cloudGroup.position.y = Math.random() * 3 + 4;  // Higher placement
            cloudGroup.position.z = -3.5;
            
            this.scene.add(cloudGroup);
            this.clouds.push({
                mesh: cloudGroup,
                speed: 0.02 + Math.random() * 0.01
            });
        }
    }

    update() {
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.mesh.position.x -= cloud.speed;
            
            if (cloud.mesh.position.x < -50) {
                cloud.mesh.position.x = 50;
                cloud.mesh.position.y = Math.random() * 3 + 4;
            }
        });
    }
} 