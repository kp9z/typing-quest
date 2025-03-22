import * as THREE from 'three';

export class Player {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.mesh = null;
        this.position = new THREE.Vector3();
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.jumpForce = 0.3;
        this.gravity = -0.015;
        this.forwardSpeed = 0.05; // Speed for forward movement
        
        this.init();
    }

    init() {
        // Create a group for the player
        this.mesh = new THREE.Group();

        // Create Mario's body parts using simple shapes
        // Body (blue overalls)
        const body = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );

        // Shirt (red)
        const shirt = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        shirt.position.y = 0.5;

        // Head (skin tone)
        const head = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 1.2),
            new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        head.position.y = 1.5;

        // Cap (red)
        const cap = new THREE.Mesh(
            new THREE.PlaneGeometry(1.4, 0.7),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        cap.position.y = 2;

        // Add all parts to the group
        this.mesh.add(body);
        this.mesh.add(shirt);
        this.mesh.add(head);
        this.mesh.add(cap);

        // Position the player
        this.mesh.position.set(-5, -3, 0); // Start on the left side of screen
        this.scene.add(this.mesh);

        // Set up keyboard controls
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(event) {
        if (event.code === 'Space' && !this.isJumping) {
            this.jump();
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpForce;
        }
    }

    update() {
        if (this.isJumping) {
            // Apply gravity to jump velocity
            this.jumpVelocity += this.gravity;
            this.mesh.position.y += this.jumpVelocity;

            // Check for ground collision
            if (this.mesh.position.y <= -3) {
                this.mesh.position.y = -3;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Add a small bounce animation when idle
        if (!this.isJumping) {
            this.mesh.position.y = -3 + Math.sin(Date.now() * 0.003) * 0.1;
        }
    }

    // Method to move player when correct letter is typed
    moveForward() {
        // Move player forward more significantly
        this.mesh.position.x += this.forwardSpeed;
    }

    jumpAndBreak(box) {
        this.isJumping = true;
        this.jumpVelocity = this.jumpForce * 1.5; // Higher jump for breaking
        
        // Create breaking animation
        const breakingAnimation = () => {
            // Scale down the box and letter
            box.box.scale.x *= 0.9;
            box.box.scale.y *= 0.9;
            box.letter.scale.x *= 0.9;
            box.letter.scale.y *= 0.9;
            
            // Move pieces upward and outward
            box.box.position.y += 0.1;
            box.letter.position.y += 0.1;
            
            // Rotate for effect
            box.box.rotation.z += 0.1;
            box.letter.rotation.z += 0.1;
            
            // Check if animation should continue
            if (box.box.scale.x > 0.1) {
                requestAnimationFrame(breakingAnimation);
            } else {
                // Remove the box and letter from scene
                this.scene.remove(box.box);
                this.scene.remove(box.letter);
                
                // Remove from game's boxes array
                const index = this.game.boxes.indexOf(box);
                if (index > -1) {
                    this.game.boxes.splice(index, 1);
                }
            }
        };
        
        // Start the breaking animation
        breakingAnimation();
        
        // Add particle effect
        this.createBreakParticles(box.box.position);
    }

    createBreakParticles(position) {
        const particleCount = 20;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.PlaneGeometry(0.2, 0.2),
                new THREE.MeshBasicMaterial({ color: 0xcd853f })
            );
            
            // Random initial position near the box
            particle.position.set(
                position.x + (Math.random() - 0.5) * 0.5,
                position.y + (Math.random() - 0.5) * 0.5,
                position.z
            );
            
            // Random velocity
            particle.userData.velocity = {
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.2,
                z: (Math.random() - 0.5) * 0.2
            };
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate particles
        const animateParticles = () => {
            let allGone = true;
            particles.children.forEach(particle => {
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.userData.velocity.y -= 0.01; // Gravity
                particle.rotation.z += 0.1;
                particle.scale.multiplyScalar(0.95);
                
                if (particle.scale.x > 0.01) allGone = false;
            });
            
            if (!allGone) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animateParticles();
    }
} 