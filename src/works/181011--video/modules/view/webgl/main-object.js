import bowser from 'bowser';
import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  setVideoTexture,
  setTexParameteri,
  enableAttribute,
} from '../../../../../modules/utility/webgl/util';
import { square } from '../../../../../modules/utility/webgl/model-2d';
import { vShader, fShader } from './main-shader';
import DatGUI from '../datgui';

class MainObject {
  /**
   * @param {WebGLRenderingContext} gl
   * @param {Instance} matIV
   * @param {number} dpr - float
   */
  constructor(gl, matIV, dpr) {
    this._isMobileDevice = bowser.mobile || bowser.tablet;

    // create status
    this._status = {
      isDrawing: false,
      startTime: null,
      texture: null,
      textureNaturalWidth: 0,
      textureNaturalHeight: 0,
      videoTexture: null,
      videoOrg: null,
      video: null,
      videoWidth: 0,
      videoHeight: 0,
      videoCanvasCtx: null,
      isVideoCanvasPlaying: false,
    };

    // create object status
    this._objectStatus = {
      fluctuationPower: 0.1,
      fluctuationSpeed: 0.2,
      wireframe: false,
    };

    /**
     * GUI
     */
    {
      const _gui = DatGUI.getInstance().gui;
      _gui.remember(this._objectStatuse);
      // fluctuation
      const _fFluctuation = _gui.addFolder('Fluctuation');
      _fFluctuation.add(this._objectStatus, 'fluctuationPower', 0, 0.5);
      _fFluctuation.add(this._objectStatus, 'fluctuationSpeed', 0.1, 1);
      _fFluctuation.open();
      // wireframe
      _gui.add(this._objectStatus, 'wireframe');
    }

    // webGL items
    this._gl = gl;
    this._matIV = matIV;
    this._dpr = dpr;
    this._videoTexture = null;

    // create program
    const _vs = createShader(gl, 'vertex', vShader);
    const _fs = createShader(gl, 'fragment', fShader);
    this._prg = createProgram(gl, _vs, _fs);

    // attribute location
    this._attLocs = [
      gl.getAttribLocation(this._prg, 'position'),
      gl.getAttribLocation(this._prg, 'coord'),
    ];
    this._attStrides = [3, 2];

    // uniform location
    this._uniLocs = [
      gl.getUniformLocation(this._prg, 'mvpMatrix'),
      gl.getUniformLocation(this._prg, 'time'),
      gl.getUniformLocation(this._prg, 'pov'),
      gl.getUniformLocation(this._prg, 'fluctuation'),
      gl.getUniformLocation(this._prg, 'texture'),
    ];

    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // create model
    const _model = square(0.5, 0.5, 20, 20);

    // set attribute
    for (let i = 0; _model.p.length / 3 > i; i++) {
      const _attCnt = _attLen * i;

      // set positoin
      _vartexAtts[_attCnt + 0] = _model.p[3 * i + 0];
      _vartexAtts[_attCnt + 1] = _model.p[3 * i + 1];
      _vartexAtts[_attCnt + 2] = _model.p[3 * i + 2];

      // set coord
      _vartexAtts[_attCnt + 3] = _model.t[2 * i + 0];
      _vartexAtts[_attCnt + 4] = _model.t[2 * i + 1];
    }

    // set byteLen & offset
    let _byteCnt = 0;
    const _offsets = [];
    for (const stride of this._attStrides) {
      const _byteLen = stride * 4; // gl.FLOAT -> 32bit === 4byte
      _offsets.push(_byteCnt);
      _byteCnt += _byteLen;
    }

    // create object data
    this._objectData = {
      vbo: createVbo(gl, new Float32Array(_vartexAtts)),
      ibo: createIbo(gl, _model.i),
      attLocs: this._attLocs,
      attStrides: this._attStrides,
      offsets: _offsets,
      byteLen: _byteCnt,
      indexLen: _model.i.length,
    };
  }

  /**
   * @return {Instance}
   */
  start() {
    if (this._status.isDrawing) return;
    this._status.isDrawing = true;
    return this;
  }

  /**
   * @return {Instance}
   */
  stop() {
    if (!this._status.isDrawing) return;
    this._status.isDrawing = false;
    return this;
  }

  /**
   * @param {Element} $video
   * @return {Instance}
   */
  setVideo($video) {
    this._status.videoOrg = $video;
    this._status.videoWidth = $video.videoWidth;
    this._status.videoHeight = $video.videoHeight;
    // if (this._isMobileDevice) {
    if (true) {
      this._createVideoCanvas();
    } else {
      this._status.video = $video;
    }
    return this;
  }

  /**
   * @return {Instance}
   */
  createVideoTexture() {
    this._videoTexture = this._gl.createTexture();
    this._setTexture(this._status.video);
    setTexParameteri(this._gl);
    return this;
  }

  /**
   * @param {Object} data
   * @param {number} data.w - int[0,inf)
   * @param {number} data.h - int[0,inf)
   * @param {number} data.wr - float[0,inf)
   * @param {number} data.hr - float[0,inf)
   * @param {number} data.wor - float[1,inf)
   * @param {number} data.hor - float[1,inf)
   * @param {number} data.wur - float[0,1]
   * @param {number} data.hur - float[0,1]
   * @param {number} data.povx - float[-1,1]
   * @param {number} data.povy - float[-1,1]
   * @param {number} data.ox - float[0,inf)
   * @param {number} data.oy - float[0,inf)
   * @param {number} data.time - int[0,inf)
   * @param {Float32Array} data.mMat
   * @param {Float32Array} data.vMat
   * @param {Float32Array} data.pMat
   * @param {Float32Array} data.tmpMat
   * @param {Float32Array} data.mvpMat
   * @return {Instance}
   */
  draw(data) {
    const { _status } = this;

    if (!_status.isDrawing) return;

    // set time
    if (_status.startTime === null) {
      _status.startTime = data.time;
    }
    const _time = data.time - _status.startTime;

    // variables
    const {
      _gl,
      _matIV: _m,
      _uniLocs: _ul,
      _objectData: od,
      _objectStatus: os,
    } = this;

    // use program
    useProgram(_gl, this._prg);

    // bind ibo
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, od.ibo);

    // set attribute
    _gl.bindBuffer(_gl.ARRAY_BUFFER, od.vbo);
    for (let i = 0; od.attLocs.length > i; i++) {
      enableAttribute(_gl, od.attLocs[i], od.attStrides[i], {
        stride: od.byteLen,
        offset: od.offsets[i],
      });
    }
    _gl.bindBuffer(_gl.ARRAY_BUFFER, null);

    // update video canavs
    if (_status.isVideoCanvasPlaying) {
      // _status.videoOrg.currentTime += 0.02;
      // if (_status.videoOrg.duration <= _status.videoOrg.currentTime) {
      //   _status.videoOrg.currentTime = 0;
      // }
      this._updateVideoCanvas();
    }

    // bind texture
    this._setTexture(_status.video);

    // matrix transform
    _m.identity(data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);

    // set uniform
    _gl.uniformMatrix4fv(_ul[0], false, data.mvpMat); // mvpMatrix
    _gl.uniform1f(_ul[1], _time); // time
    _gl.uniform2fv(_ul[2], [data.povx, data.povy]); // point of view
    _gl.uniform2fv(_ul[3], [os.fluctuationPower, os.fluctuationSpeed]); // fluctuation
    _gl.uniform1i(_ul[4], this._status.texture); // texture

    // draw
    const _primitive = os.wireframe ? 'LINES' : 'TRIANGLES';
    _gl.drawElements(_gl[_primitive], od.indexLen, _gl.UNSIGNED_SHORT, 0);

    return this;
  }

  playVideo() {
    if ('play' in this._status.video) {
      this._status.video.play();
    } else {
      this._status.videoOrg.play();
      this._status.isVideoCanvasPlaying = true;
    }
  }

  pauseVideo() {
    if ('pause' in this._status.video) {
      this._status.video.pause();
    } else {
      this._status.videoOrg.pause();
      this._status.isVideoCanvasPlaying = false;
    }
  }

  /**
   * @param {Element} $video
   */
  _setTexture($video) {
    this._status.texture = setVideoTexture(
      this._gl,
      this._videoTexture,
      $video,
    );
  }

  /**
   * @param {number} width - int
   * @param {number} height - int
   * @return {Element}
   */
  _createVideoCanvas() {
    const _$canvas = document.createElement('canvas');
    _$canvas.width = this._status.videoWidth;
    _$canvas.height = this._status.videoHeight;
    this._status.videoCanvasCtx = _$canvas.getContext('2d');
    this._updateVideoCanvas();
    // document.body.appendChild(this._status.videoOrg); // dev
    // document.body.appendChild(_$canvas); // dev
    this._status.video = _$canvas;
  }

  _updateVideoCanvas() {
    this._status.videoCanvasCtx.drawImage(
      this._status.videoOrg,
      0,
      0,
      this._status.videoWidth,
      this._status.videoHeight,
    );
  }
}

export { MainObject as default };
