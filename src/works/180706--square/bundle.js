import 'babel-polyfill';
import HeightFitter from '../../modules/view/height-fitter';
import ResizeObserver from '../../modules/observer/resize-observer';
import WebGL from './modules/view/webgl';

new HeightFitter().add();

const webGL = new WebGL();
webGL.start();
webGL.mesh('main', 'start');

// dispatch document 'resize' & 'windowSizeTypeChange'
ResizeObserver.getInstance().resize();
