import 'babel-polyfill';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import HeightFitter from '../../modules/view/height-fitter';
import WebGL from './modules/view/webgl';

WindowSizeObserver.getInstance()
  .add()
  .resize();

const webGL = new WebGL();

(async () => {
  await webGL.object('main', 'load', '../images/photo-2.jpg');
  webGL.start().object('main', 'start');

  new HeightFitter().on().resize();
})();
