import * as THREE from 'three';

export class Player {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.mesh = null;
        this.position = new THREE.Vector3();
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.jumpForce = 0.4; // Increased for more satisfying jumps
        this.gravity = -0.022; // Increased gravity for snappier falls
        this.forwardSpeed = 0.05;
        
        // New animation properties
        this.squashStretch = {
            normal: new THREE.Vector3(1, 1, 1),
            jump: new THREE.Vector3(0.8, 1.2, 0.8),
            land: new THREE.Vector3(1.2, 0.8, 1.2),
            current: new THREE.Vector3(1, 1, 1)
        };
        this.animationState = 'idle';
        this.walkCycle = 0;
        
        this.init();
    }

    init() {
        this.mesh = new THREE.Group();

        // Body (blue overalls) - made rounder and deeper for side view
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.6, 1.8),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        body.position.z = 0;

        // Shirt (red) - adjusted to be slightly larger and offset forward
        const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.8, 1.9), // Slightly larger than body
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        shirt.position.set(0, 0.4, 0.05); // Moved slightly forward in z-axis

        // Belly (blue overalls)
        const belly = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        belly.position.set(0, -0.2, 0.2);

        // Head (skin tone) - more oval for side view
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        head.position.y = 1.2;
        head.scale.set(1, 1, 0.8); // Slightly squashed front-to-back

        // Nose (skin tone) - characteristic Mario nose
        const nose = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        nose.position.set(0, 1.2, 0.7); // Positioned on face
        nose.scale.set(0.8, 0.8, 1); // Elongated forward

        // Main cap part (red)
        const capTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.75, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        capTop.position.set(0, 1.7, 0);
        capTop.scale.set(1, 0.5, 1);

        // Cap brim (red)
        const capBrim = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.1, 0.8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        capBrim.position.set(0, 1.5, 0.7);

        // White circle for M logo
        const logo = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        logo.position.set(0, 1.6, 0.76);
        logo.rotation.x = 0; // Flat against cap front

        // Arms (red) - shorter and rounder
        const leftArm = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.2, 0.6, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        leftArm.position.set(-0.8, 0.2, 0);
        leftArm.rotation.z = -0.2;
        
        const rightArm = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.2, 0.6, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        rightArm.position.set(0.8, 0.2, 0);
        rightArm.rotation.z = 0.2;

        // Legs (blue) - shorter and rounder
        const leftLeg = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 0.4, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        leftLeg.position.set(-0.4, -1.2, 0);
        leftLeg.name = 'leftLeg';

        const rightLeg = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 0.4, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        rightLeg.position.set(0.4, -1.2, 0);
        rightLeg.name = 'rightLeg';

        // Add all parts to the group
        this.mesh.add(body);
        this.mesh.add(belly);
        this.mesh.add(shirt);
        this.mesh.add(head);
        this.mesh.add(nose);
        this.mesh.add(capTop);
        this.mesh.add(capBrim);
        this.mesh.add(logo);
        this.mesh.add(leftArm);
        this.mesh.add(rightArm);
        this.mesh.add(leftLeg);
        this.mesh.add(rightLeg);

        // Position the player and rotate for side view
        this.mesh.position.set(-5, -3, 0);
        this.mesh.rotation.y = Math.PI / 2; // Rotate 90 degrees to face right
        this.scene.add(this.mesh);
    }

    update() {
        const deltaTime = 1/60; // Assuming 60fps

        if (this.isJumping) {
            // Apply gravity with proper time-based physics
            this.jumpVelocity += this.gravity * deltaTime * 60;
            this.mesh.position.y += this.jumpVelocity;

            // Squash and stretch during jump
            if (this.jumpVelocity > 0) {
                this.animateSquashStretch(this.squashStretch.jump, 0.15);
            } else {
                this.animateSquashStretch(this.squashStretch.normal, 0.15);
            }

            // Ground collision with bounce recovery
            if (this.mesh.position.y <= -3) {
                this.mesh.position.y = -3;
                this.isJumping = false;
                this.jumpVelocity = 0;
                this.animationState = 'landing';
                this.animateSquashStretch(this.squashStretch.land, 0.1);
            }
        } else {
            // Idle animation with improved bounce and leg movement
            if (this.animationState === 'idle') {
                const bounceHeight = Math.sin(Date.now() * 0.003) * 0.1;
                this.mesh.position.y = -3 + bounceHeight;
                
                // Subtle body rotation
                this.mesh.rotation.z = Math.sin(Date.now() * 0.002) * 0.02;
                
                // Animate legs opposite to the bounce
                this.mesh.children.forEach(child => {
                    if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                        child.position.y = -1.2 + bounceHeight * 0.3;
                    }
                });
            }
        }

        // Recovery from landing squash
        if (this.animationState === 'landing') {
            this.animateSquashStretch(this.squashStretch.normal, 0.2);
            if (this.mesh.scale.distanceTo(this.squashStretch.normal) < 0.05) {
                this.animationState = 'idle';
            }
        }
    }

    // New helper method for squash and stretch
    animateSquashStretch(targetScale, speed) {
        this.mesh.scale.lerp(targetScale, speed);
    }

    moveForward() {
        this.mesh.position.x += this.forwardSpeed;
        
        // Add running animation
        this.walkCycle += 0.2;
        const legAngle = Math.sin(this.walkCycle) * 0.3;
        
        this.mesh.children.forEach(child => {
            if (child.name === 'leftLeg') {
                child.rotation.x = legAngle;
            } else if (child.name === 'rightLeg') {
                child.rotation.x = -legAngle;
            }
        });
        
        // Slight tilt while running
        this.mesh.rotation.z = -0.1;
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