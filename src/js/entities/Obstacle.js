import * as THREE from 'three';
import { OBSTACLE_CONSTANTS } from '../utils/Constants.js';

export class Obstacle {
    constructor(scene, position, letter) {
        this.scene = scene;
        this.letter = letter;
        this.isCompleted = false;
        
        this.createMesh(position);
        this.createLetterMesh(position);
    }

    createMesh(position) {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xcd853f });
        this.box = new THREE.Mesh(geometry, material);
        this.box.position.copy(position);
        this.scene.add(this.box);
    }

    createLetterMesh(position) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        
        this.letterMesh = new THREE.Mesh(geometry, material);
        this.letterMesh.position.copy(position);
        this.letterMesh.position.z = 0.1;
        this.scene.add(this.letterMesh);
    }

    update(scrollSpeed) {
        this.box.position.x -= scrollSpeed;
        this.letterMesh.position.x -= scrollSpeed;
        this.box.position.y = 2 + Math.sin(Date.now() * 0.002) * 0.1;
        this.letterMesh.position.y = this.box.position.y;
    }

    destroy() {
        this.scene.remove(this.box);
        this.scene.remove(this.letterMesh);
    }
} 