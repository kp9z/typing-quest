import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
    }

    createBreakParticles(position) {
        const particles = new THREE.Group();
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle(position);
            particles.add(particle);
        }
        
        this.scene.add(particles);
        this.animateParticles(particles);
    }

    createParticle(position) {
        const geometry = new THREE.PlaneGeometry(0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: 0xcd853f });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.set(
            position.x + (Math.random() - 0.5) * 0.5,
            position.y + (Math.random() - 0.5) * 0.5,
            position.z
        );
        
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.2,
            y: Math.random() * 0.2,
            z: (Math.random() - 0.5) * 0.2
        };
        
        return particle;
    }

    animateParticles(particles) {
        const animate = () => {
            let allGone = true;
            
            particles.children.forEach(particle => {
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.userData.velocity.y -= 0.01;
                particle.rotation.z += 0.1;
                particle.scale.multiplyScalar(0.95);
                
                if (particle.scale.x > 0.01) allGone = false;
            });
            
            if (!allGone) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animate();
    }
} 