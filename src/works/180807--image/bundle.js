import 'babel-polyfill';
import '../../modules/event/resize-event';
import HeightFitter from '../../modules/view/height-fitter';
import WebGL from './modules/view/webgl';

const webGL = new WebGL();

(async () => {
  await webGL.object('main', 'load', '../images/photo-1.jpg');
  webGL.start().object('main', 'start');

  new HeightFitter().on().resize();
})();
