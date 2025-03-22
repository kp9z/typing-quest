import * as THREE from 'three';
import { SCENE_CONSTANTS } from '../utils/Constants.js';

export class Scene {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    init() {
        this.scene = new THREE.Scene();
        
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -10 * aspectRatio, 10 * aspectRatio,
            10, -10,
            0.1, 1000
        );
        this.camera.position.set(0, 0, 10);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        this.setupLighting();
        this.setupEventListeners();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            const aspectRatio = window.innerWidth / window.innerHeight;
            this.camera.left = -10 * aspectRatio;
            this.camera.right = 10 * aspectRatio;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
} 