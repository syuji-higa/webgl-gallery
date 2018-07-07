import 'babel-polyfill';
import HeightFitter from '../../modules/view/height-fitter';
import ResizeObserver from '../../modules/observer/resize-observer';
import Webgl from './modules/view/webgl';

new HeightFitter().add();

const webgl = new Webgl();
webgl.start();
webgl.mesh('main', 'start');

// dispatch document 'resize' & 'windowSizeTypeChange'
ResizeObserver.getInstance().resize();
