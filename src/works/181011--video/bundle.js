import 'babel-polyfill';
import '../../modules/polyfill/event-listener';
import WindowSizeObserver from '../../modules/observer/window-size-observer';
import { loadVideo } from '../../modules/utility/loader';
import HeightFitter from '../../modules/view/height-fitter';
import WebGL from './modules/view/webgl';

WindowSizeObserver.getInstance()
  .add()
  .resize();

const webGL = new WebGL();

(async () => {
  const _$video = document.createElement('video');
  _$video.src = '../videos/video-1.mp4';
  _$video.preload = 'none';
  _$video.loop = true;
  _$video.muted = true;
  _$video.playsInline = true;
  await loadVideo(_$video);

  webGL.object('main', 'setVideo', _$video);
  webGL.object('main', 'createVideoTexture');
  webGL.start().object('main', 'start');

  document.getElementById('start').addEventListener('click', () => {
    webGL.object('main', 'playVideo');
  });

  document.getElementById('stop').addEventListener('click', () => {
    webGL.object('main', 'pauseVideo');
  });

  new HeightFitter().on().resize();
})();
