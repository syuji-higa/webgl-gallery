import 'babel-polyfill';
import HeightFitter from '../../modules/view/height-fitter';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import WebGL from './modules/view/webgl';

new HeightFitter().add();

const webGL = new WebGL();
webGL.start();
webGL.object('main', 'start');

// dispatch document 'resize' & 'windowSizeTypeChange'
WindowSizeObserver.getInstance().resize();
