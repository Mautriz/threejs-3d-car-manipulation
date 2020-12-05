import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { generateCube } from "./three-helpers/generators";
import { generateAnimator } from "./three-helpers/animate";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AmbientLight, AxesHelper, GridHelper, Object3D } from "three";

let carRotation = 0;
const horizontalMaxSpeed = 6;
const verticalMaxSpeed = 70;
const cameraDistance = 7;

async function main() {
	const loader = new GLTFLoader();

	const renderer = new T.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x333333, 1.0);
	const width = window.innerWidth;
	const height = window.innerHeight;
	const aspect = width / height;

	const camera = new T.PerspectiveCamera(75, aspect, 0.1, 75);
	const scene = new T.Scene();

	new OrbitControls(camera, renderer.domElement);

	const body = document.body;

	renderer.setSize(width, height);
	body.appendChild(renderer.domElement);

	const items = {
		cube: generateCube(),
		car: null as T.Group,
	};
	scene.add(items.cube);
	// scene.add(model.scene);
	scene.add(new AmbientLight());

	const update = { w: 0, s: 0, a: 0, d: 0 };

	body.addEventListener("keydown", (e) => {
		update[e.key] = 0.5;
	});
	body.addEventListener("click", () => {});
	body.addEventListener("keyup", (e) => {
		update[e.key] = 0;
	});

	camera.position.z = 5;
	loader.load("http://localhost:8080/models/porsche/scene.gltf", (gltf) => {
		scene.add(gltf.scene);
		items.car = gltf.scene;
	});
	// const composer = new EffectComposer(renderer);
	// composer.addPass(new RenderPass(scene, camera));
	const speed = {
		vertical: 1,
		horizontal: 0,
	};
	addFloor(scene);

	const updateFn = () => {
		const speedHorizontalModifier = Math.min(Math.abs(speed.vertical / 30), 1);
		const verticalDelta = update.w || -update.s;
		const horizontalDelta = (update.a || -update.d) * 0.4;

		if (verticalDelta) {
			const newSpeed = speed.vertical + verticalDelta;
			if (verticalDelta < 0) speed.vertical = newSpeed;
			speed.vertical = Math.sign(newSpeed) * Math.min(Math.abs(newSpeed), verticalMaxSpeed);
		} else speed.vertical *= 0.9;
		if (horizontalDelta) speed.horizontal = speed.horizontal + horizontalDelta;
		else speed.horizontal *= 0.85;

		if (Math.abs(speed.horizontal) > horizontalMaxSpeed)
			speed.horizontal = Math.sign(speed.horizontal) * horizontalMaxSpeed;
		speed.horizontal *= speedHorizontalModifier;

		if (items.car) {
			const pos = items.car.position;
			camera.position.lerp(
				new T.Vector3(
					pos.x + cameraDistance * Math.sin(carRotation),
					pos.y + 3,
					pos.z + cameraDistance * Math.cos(carRotation)
				),
				1
			);
			camera.lookAt(items.car.position);
		}
		// items.cube.rotateY(0.01);
		items.car?.translateZ(-speed.vertical / 100);
		carRotation += speed.horizontal / 100;
		items.car?.setRotationFromEuler(new T.Euler(0, carRotation));
		renderer.render(scene, camera);
	};

	const { startAnimation, stopAnimation } = generateAnimator(updateFn);

	startAnimation();
}

function addFloor(scene: T.Scene) {
	scene.add(new GridHelper(100)).add(new AxesHelper(100));
}

main().then();
