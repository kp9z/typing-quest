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
        this.mesh = new THREE.Group();

        // Body (blue overalls) - made shorter and slightly wider
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 1.6, 1),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );

        // Shirt (red) - adjusted to match body
        const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.8, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        shirt.position.y = 0.4;

        // Head (skin tone) - made slightly larger relative to body
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.4, 1.4),
            new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        head.position.y = 1.2;

        // Main cap part (red) - moved forward
        const capTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 1.3),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        capTop.position.set(0, 1.7, 0.3); // Added Z offset

        // Cap brim (red) - extended more forward
        const capBrim = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.2, 1.6),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        capBrim.position.set(0, 1.5, 0.5); // Increased Z offset

        // White circle for M logo - moved forward with the cap
        const logo = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        logo.position.set(0, 1.7, 0.96); // Adjusted to be on the front of cap
        logo.rotation.x = -Math.PI * 0.1;

        // Arms (red) - made shorter
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        leftArm.position.set(-1.1, 0.2, 0);
        
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 1, 0.4),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        rightArm.position.set(1.1, 0.2, 0);

        // Legs (blue) - made shorter and slightly thicker
        const leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.6),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        leftLeg.position.set(-0.5, -1.2, 0);

        const rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.6),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        rightLeg.position.set(0.5, -1.2, 0);

        // Add all parts to the group
        this.mesh.add(body);
        this.mesh.add(shirt);
        this.mesh.add(head);
        this.mesh.add(capTop);
        this.mesh.add(capBrim);
        this.mesh.add(logo);
        this.mesh.add(leftArm);
        this.mesh.add(rightArm);
        this.mesh.add(leftLeg);
        this.mesh.add(rightLeg);

        // Position the player
        this.mesh.position.set(-5, -3, 0);
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