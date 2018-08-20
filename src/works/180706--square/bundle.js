import 'babel-polyfill';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import HeightFitter from '../../modules/view/height-fitter';
import WebGL from './modules/view/webgl';

WindowSizeObserver.getInstance()
  .add()
  .resize();

const webGL = new WebGL();
webGL.start().object('main', 'start');

new HeightFitter().on().resize();
