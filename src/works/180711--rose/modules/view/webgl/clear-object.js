import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  enableAttribute,
} from '../../../../../modules/utility/webgl/util';
import { square } from '../../../../../modules/utility/webgl/model-2d';
import { vShader, fShader } from './clear-shader';
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
    };

    // create object status
    this._objectStatus = {
      blur: 0.005,
    };

    /**
     * GUI
     */
    {
      const _gui = DatGUI.getInstance().gui;
      _gui.remember(this._objectStatuse);
      // blur
      _gui.add(this._objectStatus, 'blur', 0, 0.1);
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
      gl.getAttribLocation(this._prg, 'color'),
    ];
    this._attStrides = [3, 4];

    // uniform location
    this._uniLocs = [gl.getUniformLocation(this._prg, 'blur')];

    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // create model
    const _model = square(1, 1, 1, 1);

    // set attribute
    for (let i = 0; _model.p.length / 3 > i; i++) {
      const _attCnt = _attLen * i;

      // set positoin
      _vartexAtts[_attCnt + 0] = _model.p[3 * i + 0];
      _vartexAtts[_attCnt + 1] = _model.p[3 * i + 1];
      _vartexAtts[_attCnt + 2] = _model.p[3 * i + 2];

      // set color
      _vartexAtts[_attCnt + 3] = _model.c[4 * i + 0];
      _vartexAtts[_attCnt + 4] = _model.c[4 * i + 1];
      _vartexAtts[_attCnt + 5] = _model.c[4 * i + 2];
      _vartexAtts[_attCnt + 6] = _model.c[4 * i + 3];
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
    // const _time = data.time - _status.startTime;

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

    // set uniform
    _gl.uniform1f(_ul[0], os.blur); // blur

    // draw
    _gl.drawElements(_gl.TRIANGLES, od.indexLen, _gl.UNSIGNED_SHORT, 0);

    return this;
  }
}

export { MainObject as default };
