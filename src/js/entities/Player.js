import * as THREE from 'three';
import { ParticleSystem } from '../effects/ParticleSystem.js';

export class Player {
    constructor(scene, game) {
        // ... existing constructor code ...
        this.particleSystem = new ParticleSystem(scene);
    }

    jumpAndBreak(box) {
        // ... existing jump code ...
        this.particleSystem.createBreakParticles(box.box.position);
    }
} 