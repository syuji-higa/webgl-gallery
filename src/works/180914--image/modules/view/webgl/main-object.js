import { imageLoader } from '../../../../../modules/utility/loader';
import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  createTexture,
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
    // create status
    this._status = {
      isDrawing: false,
      startTime: null,
      texture: null,
      textureNaturalWidth: 0,
      textureNaturalHeight: 0,
    };

    // create object status
    this._objectStatus = {
      power1: 1.0,
      power2: 1.0,
      speed: 1.0,
    };

    /**
     * GUI
     */
    {
      const _gui = DatGUI.getInstance().gui;
      _gui.remember(this._objectStatuse);
      _gui.add(this._objectStatus, 'power1', 0.0, 5.0);
      _gui.add(this._objectStatus, 'power2', -5.0, 5.0);
      _gui.add(this._objectStatus, 'speed', 0.0, 5.0);
    }

    // webGL items
    this._gl = gl;
    this._matIV = matIV;
    this._dpr = dpr;

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
      gl.getUniformLocation(this._prg, 'resolution'),
      gl.getUniformLocation(this._prg, 'size'),
      gl.getUniformLocation(this._prg, 'objectStatus'),
      gl.getUniformLocation(this._prg, 'texture'),
    ];

    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // create model
    const _model = square(1, 1, 20, 20);

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
   * @param {string} imgPath
   * @return {Promise}
   */
  async load(imgPath) {
    const _img = await imageLoader(imgPath);

    const { texture, NaturalWidth, NaturalHeight } = await createTexture(
      this._gl,
      _img,
      {
        dpr: this._dpr,
        maxSize: Math.max(window.innerWidth, window.innerHeight),
      },
    );

    // set texture
    this._status.texture = texture;
    this._status.textureNaturalWidth = NaturalWidth;
    this._status.textureNaturalHeight = NaturalHeight;
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

    // bind texture
    _gl.activeTexture(_gl.TEXTURE0);
    _gl.bindTexture(_gl.TEXTURE_2D, this._status.texture);

    // matrix transform
    _m.identity(data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);
    _m.scale(data.mMat, [data.wor, data.wor, 0], data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);

    // set uniform
    _gl.uniformMatrix4fv(_ul[0], false, data.mvpMat); // mvpMatrix
    _gl.uniform1f(_ul[1], _time); // time
    _gl.uniform2fv(_ul[2], [data.povx, -data.povy]); // point of view
    _gl.uniform2fv(_ul[3], [data.w, data.h]); // resolution
    _gl.uniform2fv(_ul[4], [data.wor, data.hor]); // size
    _gl.uniform3fv(_ul[5], [os.power1, os.power2, os.speed]); // object status
    _gl.uniform1i(_ul[6], this._status.texture); // texture

    // draw
    const _primitive = os.wireframe ? 'LINES' : 'TRIANGLES';
    _gl.drawElements(_gl[_primitive], od.indexLen, _gl.UNSIGNED_SHORT, 0);

    return this;
  }
}

export { MainObject as default };
