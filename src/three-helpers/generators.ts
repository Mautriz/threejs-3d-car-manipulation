import * as T from "three";

export function generateCube() {
	const geometry = new T.BoxGeometry();
	const material = new T.MeshBasicMaterial({ color: "red" });
	const cube = new T.Mesh(geometry, material);
	return cube;
}
