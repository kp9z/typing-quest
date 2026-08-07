import * as THREE from 'three';

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.root = new THREE.Group();
        this.scene.add(this.root);
        this.clouds = [];
        this.materials = {};
        this.scenePresets = [
            { sky: 0x5662a8, horizon: 0x8c77b2, ground: 0x25264f, trail: 0xff9b62 },
            { sky: 0x315f81, horizon: 0x5f91a8, ground: 0x193b52, trail: 0xc9f27b },
            { sky: 0x8c5878, horizon: 0xc17988, ground: 0x4d2848, trail: 0xffcc70 },
            { sky: 0x3e427c, horizon: 0x7b5f9b, ground: 0x20244d, trail: 0xff709f },
            { sky: 0x1b2145, horizon: 0x473b72, ground: 0x11152f, trail: 0xc9f27b },
        ];

        this.createBackdrop();
        this.createHills();
        this.createGround();
        this.createClouds();
    }

    createBackdrop() {
        const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x5662a8 });
        this.materials.sky = skyMaterial;
        const sky = new THREE.Mesh(new THREE.PlaneGeometry(120, 32), skyMaterial);
        sky.position.set(0, 2, -9);
        this.root.add(sky);

        const sun = new THREE.Mesh(
            new THREE.CircleGeometry(3.2, 48),
            new THREE.MeshBasicMaterial({ color: 0xffd98a })
        );
        sun.position.set(11, 5.5, -7.5);
        this.root.add(sun);

        const halo = new THREE.Mesh(
            new THREE.RingGeometry(3.8, 4, 48),
            new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.22 })
        );
        halo.position.copy(sun.position);
        halo.position.z = -7.6;
        this.root.add(halo);
    }

    createHills() {
        const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x8c77b2 });
        this.materials.horizon = horizonMaterial;
        [-22, -6, 11, 28].forEach((x, index) => {
            const hill = new THREE.Mesh(new THREE.CircleGeometry(10 + (index % 2) * 3, 40, 0, Math.PI), horizonMaterial);
            hill.rotation.z = Math.PI;
            hill.position.set(x, -1.6, -6.5);
            hill.scale.y = 0.55;
            this.root.add(hill);
        });
    }

    createGround() {
        const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x25264f });
        this.materials.ground = groundMaterial;
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 50), groundMaterial);
        ground.position.set(0, -27.85, -4);
        this.root.add(ground);

        const trailMaterial = new THREE.MeshBasicMaterial({ color: 0xff9b62 });
        this.materials.trail = trailMaterial;
        const trail = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.13), trailMaterial);
        trail.position.set(0, -2.85, -2.9);
        this.root.add(trail);

        for (let x = -55; x < 60; x += 5) {
            const dash = new THREE.Mesh(
                new THREE.PlaneGeometry(2.4, 0.09),
                new THREE.MeshBasicMaterial({ color: 0xf8f5e7, transparent: true, opacity: 0.18 })
            );
            dash.position.set(x, -4.25, -2.8);
            this.root.add(dash);
        }
    }

    createClouds() {
        const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xf8f5e7, transparent: true, opacity: 0.7 });
        [-26, -5, 21, 39].forEach((x, index) => {
            const cloud = new THREE.Group();
            [
                [-1.1, 0, 1.15],
                [0.2, 0.35, 1.45],
                [1.5, 0, 1],
            ].forEach(([px, py, radius]) => {
                const puff = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), cloudMaterial);
                puff.position.set(px, py, 0);
                cloud.add(puff);
            });
            cloud.position.set(x, 4 + (index % 2) * 2.2, -5.6);
            this.root.add(cloud);
            this.clouds.push({ mesh: cloud, speed: 0.008 + index * 0.002 });
        });
    }

    update(cameraX = 0) {
        this.root.position.x = cameraX;
        this.clouds.forEach((cloud) => {
            cloud.mesh.position.x -= cloud.speed;
            if (cloud.mesh.position.x < -35) cloud.mesh.position.x = 35;
        });
    }

    changeSceneByLevel(level) {
        const colors = this.scenePresets[Math.min(Math.max(level, 1), this.scenePresets.length) - 1];
        this.materials.sky.color.setHex(colors.sky);
        this.materials.horizon.color.setHex(colors.horizon);
        this.materials.ground.color.setHex(colors.ground);
        this.materials.trail.color.setHex(colors.trail);
    }
}
