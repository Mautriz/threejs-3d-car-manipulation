import * as T from "three";

export function generateAnimator(updateFn: Function) {
	let stop = false;
	const stopAnimation = () => (stop = true);
	const startAnimation = () => {
		if (stop) return;
		requestAnimationFrame(startAnimation);
		updateFn();
	};

	return { startAnimation, stopAnimation };
}
