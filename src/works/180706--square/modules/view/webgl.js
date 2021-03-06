import bowser from 'bowser';
import EventObserver from '../../../../modules/observer/event-observer';
import MouseMoveObserver from '../../../../modules/observer/mouse-move-observer';
import DeviceOrientationObserver from '../../../../modules/observer/device-orientation-observer';
import ScrollObserver from '../../../../modules/observer/scroll-observer';
import {
  normalizeOverRatio,
  normalizeUnderRatio,
} from '../../../../modules/model/ratio';
import RequestAnimationFramer from '../../../../modules/utility/request-animation-framer';
import MatIV from '../../../../modules/utility/webgl/matrix';
import MainObject from './webgl/main-object';

class WebGL {
  /**
   * @return {Object}
   */
  static get _defOpts() {
    return {
      selfCls: 'js-webgl',
      isDisableCls: 'is-webgl-disable',
      fps: 70,
    };
  }

  /**
   * @param {Object}
   * @property {Object} [opts]
   * @property {string} [opts.selfCls]
   * @property {string} [opts.isDisableCls]
   * @property {number} [opts.fps]
   */
  constructor(opts = {}) {
    const { selfCls, isDisableCls, fps } = Object.assign(WebGL._defOpts, opts);

    // prettier-ignore
    this._status = {
      w: 0, h: 0,
      wr: 0, hr: 0,
      wor: 0, hor: 0,
      wur: 0, hur: 0,
      dox: 0, doy: 0,
      povx: 0, povy: 0,
    };

    this._isMobileDevice = bowser.mobile || bowser.tablet;
    this._dpr = devicePixelRatio || 1;
    this._fps = fps;
    this._povAccel = 0.02;
    this._offsetAccel = 0.02;
    this._matIV = new MatIV();
    this._rAF = RequestAnimationFramer.getInstance();
    this._scrollObserver = ScrollObserver.getInstance();
    if (this._isMobileDevice) {
      this._deviceOrientationObserver = DeviceOrientationObserver.getInstance();
    } else {
      this._mouseMoveObserver = MouseMoveObserver.getInstance();
    }

    // create matrix
    const _m = this._matIV;
    this._mMat = _m.identity(_m.create());
    this._vMat = _m.identity(_m.create());
    this._pMat = _m.identity(_m.create());
    this._tmpMat = _m.identity(_m.create());
    this._mvpMat = _m.identity(_m.create());

    // element
    this._$el = document.getElementsByClassName(selfCls)[0];
    this._$canvas = document.createElement('canvas');
    this._$el.appendChild(this._$canvas);

    // get webGL context
    const _webglOpts = {
      // stencil: true,
    };
    this._gl =
      this._$canvas.getContext('webgl', _webglOpts) ||
      this._$canvas.getContext('experimental-webgl', _webglOpts);

    // not find webGL context
    if (!this._gl) {
      CMN.elements.$html.classList.add(isDisableCls);
      return;
    }

    // create object
    this._objects = {
      main: new MainObject(this._gl, this._matIV, this._dpr),
    };

    // clear
    this._gl.clearColor(1, 1, 1, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);

    // culling
    this._gl.enable(this._gl.CULL_FACE);

    // depth test
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.depthFunc(this._gl.LEQUAL);

    // blend mode
    // this._gl.enable(this._gl.BLEND);

    // event listener
    this._resizeEvt = EventObserver.getInstance().create(
      document,
      'resize',
      this._resize.bind(this),
    );
    this._heightResizeEvt = EventObserver.getInstance().create(
      document,
      'heightResize',
      this._resize.bind(this),
    );
  }

  /**
   * @return {Instance}
   */
  start() {
    if (this._gl === 'undefined') {
      throw new Error('Not find WebGL context.');
    }

    this._startedTime = new Date().getTime();

    this._rAF.add(this, this._render.bind(this), this._fps);
    this._resizeEvt.add();
    this._heightResizeEvt.add();

    return this;
  }

  /**
   * @return {Instance}
   */
  stop() {
    if (this._gl === 'undefined') {
      throw new Error('Not find WebGL context.');
    }

    this._rAF.remove(this);
    this._resizeEvt.remove();
    this._heightResizeEvt.remove();

    return this;
  }

  /**
   * @param {string} id
   * @param {string} method
   * @param {?*} arg
   * @return {Promise}
   */
  async object(id, method, ...arg) {
    if (this._gl === 'undefined') {
      throw new Error('Not find WebGL context.');
    }

    if (!(id in this._objects)) {
      throw new Error(`Not find "${id}" id.`);
    }

    const _object = this._objects[id];

    if (!(method in _object)) {
      throw new Error(`Not find "${method}" method.`);
    }

    await _object[method](...arg);
  }

  _resize() {
    const { width, height } = this._$el.getBoundingClientRect();

    const _w = width * this._dpr;
    const _h = height * this._dpr;
    const _overRatio = normalizeOverRatio(width, height);
    const _underRatio = normalizeUnderRatio(width, height);

    // set size status
    this._status.w = _w;
    this._status.h = _h;
    this._status.wr = _w / _h;
    this._status.hr = _h / _w;
    this._status.wor = _overRatio.width;
    this._status.hor = _overRatio.height;
    this._status.wur = _underRatio.width;
    this._status.hur = _underRatio.height;

    // set canvas size
    this._$canvas.width = _w;
    this._$canvas.height = _h;
    this._$canvas.style.width = `${width}px`;
    this._$canvas.style.height = `${height}px`;

    // set gebGL viewport
    this._gl.viewport(0, 0, _w, _h);
  }

  _render() {
    // prettier-ignore
    const {
      w, h, wr, hr, wor, hor, wur, hur,
      dox, doy, povx, povy,
    } = this._status;

    const _t = new Date().getTime();

    // point of view
    let _povx = 0;
    let _povy = 0;
    if (this._isMobileDevice) {
      const { beta, gamma } = this._deviceOrientationObserver.orientation;
      _povx = gamma;
      _povy = beta;
    } else {
      const { x, y } = this._mouseMoveObserver.position;
      _povx = x;
      _povy = y;
    }
    this._status.povx += (_povx - povx) * this._povAccel;
    this._status.povy += (_povy - povy) * this._povAccel;

    // scroll
    const { x: ox, y: oy } = this._scrollObserver.offset;
    this._status.dox += (ox - dox) * this._scrollAccel;
    this._status.doy += (oy - doy) * this._scrollAccel;

    // clear blend mode
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);

    // init view
    this._matIV.lookAt(
      [-povx, povy, 1],
      [povx, -povy, 0],
      [0, 1, 0],
      this._vMat,
    );
    this._matIV.perspective(90, w / h, 0.1, 100, this._pMat);
    this._matIV.multiply(this._pMat, this._vMat, this._tmpMat);

    // draw object
    for (const object of Object.values(this._objects)) {
      // prettier-ignore
      object.draw({
        w, h, wr, hr, wor, hor, wur, hur,
        povx: this._status.povx,
        povy: this._status.povy,
        ox: this._status.dox,
        oy: this._status.doy,
        time: _t,
        mMat: this._mMat,
        vMat: this._vMat,
        pMat: this._pMat,
        tmpMat: this._tmpMat,
        mvpMat: this._mvpMat
      });
    }

    // flush
    this._gl.flush();
  }
}

export { WebGL as default };
