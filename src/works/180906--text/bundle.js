import 'babel-polyfill';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import HeightFitter from '../../modules/view/height-fitter';
import TextCanvas from './modules/view/text-canvas';
import WebGL from './modules/view/webgl';

WindowSizeObserver.getInstance()
	.add()
	.resize();

const textCanvas = new TextCanvas();
const webGL = new WebGL();

window.addEventListener('DOMContentLoaded', () => {
	(async () => {
		await textCanvas.load();
		textCanvas.on();
		webGL.start().object('main', 'create', textCanvas.positions);
		webGL.object('main', 'start');

		document.addEventListener('updateTextCanvas', () => {
			webGL.object('main', 'create', textCanvas.positions);
		});

		new HeightFitter().on().resize();
	})();
});
