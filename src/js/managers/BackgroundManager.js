import * as THREE from 'three';

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgrounds = [];
        this.backgroundLayers = [
            { color: 0x87CEEB, speed: 0.01, width: 100, y: 0 },    // Sky
            { color: 0x98FB98, speed: 0.02, width: 60, y: -2 },    // Far hills
            { color: 0x90EE90, speed: 0.03, width: 40, y: -3 }     // Near hills
        ];
        
        this.createBackgroundLayers();
    }

    createBackgroundLayers() {
        this.backgroundLayers.forEach(layer => {
            const geometry = new THREE.PlaneGeometry(layer.width, 20);
            const material = new THREE.MeshBasicMaterial({ color: layer.color });
            
            // Create two meshes for infinite scrolling
            const mesh1 = new THREE.Mesh(geometry, material);
            const mesh2 = new THREE.Mesh(geometry, material);
            
            mesh1.position.z = -5;
            mesh2.position.z = -5;
            mesh1.position.y = layer.y;
            mesh2.position.y = layer.y;
            
            // Position the second mesh right after the first
            mesh1.position.x = 0;
            mesh2.position.x = layer.width;
            
            this.scene.add(mesh1);
            this.scene.add(mesh2);
            
            this.backgrounds.push({
                meshes: [mesh1, mesh2],
                width: layer.width,
                speed: layer.speed
            });
        });
    }

    update() {
        this.backgrounds.forEach(bg => {
            bg.meshes.forEach(mesh => {
                mesh.position.x -= bg.speed;
                
                // If mesh has scrolled completely off screen, move it to the end
                if (mesh.position.x <= -bg.width) {
                    mesh.position.x += bg.width * 2;
                }
            });
        });
    }
} 