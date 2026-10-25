
import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252b35);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(5, 4, 7);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.getElementById("app").appendChild(renderer.domElement);

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 10, 7);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
    color: 0x5c8dba
});

const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
scene.add(cube);

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
