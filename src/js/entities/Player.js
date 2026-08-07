import * as THREE from 'three';

export class Player {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.mesh = null;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.jumpForce = 0.4;
        this.gravity = -0.022;
        this.forwardSpeed = 0.05;
        this.animationState = 'idle';
        this.walkCycle = 0;
        this.normalScale = new THREE.Vector3(1, 1, 1);
        this.jumpScale = new THREE.Vector3(0.86, 1.14, 1);
        this.landScale = new THREE.Vector3(1.12, 0.88, 1);
        this.init();
    }

    init() {
        this.mesh = new THREE.Group();

        const navy = new THREE.MeshBasicMaterial({ color: 0x172044 });
        const teal = new THREE.MeshBasicMaterial({ color: 0x56d6c9 });
        const cream = new THREE.MeshBasicMaterial({ color: 0xf8f5e7 });
        const orange = new THREE.MeshBasicMaterial({ color: 0xff9b62 });
        const pink = new THREE.MeshBasicMaterial({ color: 0xff709f });

        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.15, 0.6), pink);
        backpack.position.set(-0.62, 0.05, -0.04);
        backpack.rotation.z = 0.08;

        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 0.72, 6, 12), teal);
        body.position.y = 0.05;

        const chestBadge = new THREE.Mesh(new THREE.CircleGeometry(0.18, 20), cream);
        chestBadge.position.set(0.38, 0.18, 0.49);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.64, 20, 16), cream);
        head.position.y = 1.15;
        head.scale.set(1, 0.9, 0.92);

        const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), navy);
        visor.position.set(0.42, 1.17, 0.43);
        visor.rotation.z = Math.PI / 2;
        visor.scale.z = 0.25;

        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), orange);
        antenna.position.set(0, 1.86, 0);
        const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), orange);
        antennaTip.position.set(0, 2.08, 0);

        const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.45, 4, 8), teal);
        leftArm.position.set(-0.68, 0.18, 0);
        leftArm.rotation.z = -0.25;
        leftArm.name = 'leftArm';

        const rightArm = leftArm.clone();
        rightArm.position.x = 0.68;
        rightArm.rotation.z = 0.25;
        rightArm.name = 'rightArm';

        const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.38, 4, 8), navy);
        leftLeg.position.set(-0.3, -0.9, 0);
        leftLeg.name = 'leftLeg';

        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.3;
        rightLeg.name = 'rightLeg';

        this.mesh.add(backpack, body, chestBadge, head, visor, antenna, antennaTip, leftArm, rightArm, leftLeg, rightLeg);
        this.mesh.position.set(-5, -3, 0);
        this.scene.add(this.mesh);
    }

    update() {
        if (this.isJumping) {
            this.jumpVelocity += this.gravity;
            this.mesh.position.y += this.jumpVelocity;
            this.mesh.scale.lerp(this.jumpVelocity > 0 ? this.jumpScale : this.normalScale, 0.16);
            if (this.mesh.position.y <= -3) {
                this.mesh.position.y = -3;
                this.isJumping = false;
                this.jumpVelocity = 0;
                this.animationState = 'landing';
                this.mesh.scale.lerp(this.landScale, 0.3);
            }
        } else if (this.animationState === 'idle') {
            const bounce = Math.sin(performance.now() * 0.004) * 0.06;
            this.mesh.position.y = -3 + bounce;
            this.mesh.rotation.z = Math.sin(performance.now() * 0.002) * 0.015;
        }

        if (this.animationState === 'landing') {
            this.mesh.scale.lerp(this.normalScale, 0.2);
            if (this.mesh.scale.distanceTo(this.normalScale) < 0.025) this.animationState = 'idle';
        }
    }

    moveForward() {
        this.mesh.position.x += this.forwardSpeed;
        this.walkCycle += 0.22;
        const swing = Math.sin(this.walkCycle) * 0.35;
        this.mesh.children.forEach((child) => {
            if (child.name === 'leftLeg' || child.name === 'rightArm') child.rotation.x = swing;
            if (child.name === 'rightLeg' || child.name === 'leftArm') child.rotation.x = -swing;
        });
        this.mesh.rotation.z = -0.06;
    }

    jumpAndBreak(box) {
        this.isJumping = true;
        this.animationState = 'jumping';
        this.jumpVelocity = this.jumpForce * 1.5;
        this.createBreakParticles(box.box.position.clone());

        const breakBlock = () => {
            box.box.scale.multiplyScalar(0.84);
            box.letter.scale.multiplyScalar(0.84);
            box.box.rotation.z += 0.13;
            box.letter.rotation.z += 0.13;
            if (box.box.scale.x > 0.08) {
                requestAnimationFrame(breakBlock);
                return;
            }
            this.scene.remove(box.box, box.letter);
            box.box.geometry.dispose();
            box.box.material.dispose();
            box.letter.geometry.dispose();
            box.letter.material.map?.dispose();
            box.letter.material.dispose();
            const index = this.game.boxes.indexOf(box);
            if (index >= 0) this.game.boxes.splice(index, 1);
            this.game.typingManager.updateTargetLetter();
        };
        breakBlock();
    }

    createBreakParticles(position) {
        const particles = new THREE.Group();
        for (let i = 0; i < 14; i += 1) {
            const particle = new THREE.Mesh(
                new THREE.PlaneGeometry(0.18, 0.18),
                new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9b62 : 0xc9f27b })
            );
            particle.position.copy(position);
            particle.userData.velocity = {
                x: (Math.random() - 0.5) * 0.24,
                y: 0.08 + Math.random() * 0.2,
            };
            particles.add(particle);
        }
        this.scene.add(particles);

        const animateParticles = () => {
            let visible = false;
            particles.children.forEach((particle) => {
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.userData.velocity.y -= 0.012;
                particle.rotation.z += 0.12;
                particle.scale.multiplyScalar(0.93);
                if (particle.scale.x > 0.02) visible = true;
            });
            if (visible) {
                requestAnimationFrame(animateParticles);
                return;
            }
            particles.children.forEach((particle) => {
                particle.geometry.dispose();
                particle.material.dispose();
            });
            this.scene.remove(particles);
        };
        animateParticles();
    }
}
