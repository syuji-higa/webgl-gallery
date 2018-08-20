import 'babel-polyfill';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import HeightFitter from '../../modules/view/height-fitter';
import WebGL from './modules/view/webgl';

WindowSizeObserver.getInstance()
  .add()
  .resize();

const webGL = new WebGL();
webGL.start();
webGL.object('main', 'start');
webGL.object('clear', 'start');

new HeightFitter().on().resize();
