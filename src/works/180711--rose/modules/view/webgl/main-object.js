import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  enableAttribute,
} from '../../../../../modules/utility/webgl/util';
import { line } from '../../../../../modules/utility/webgl/model-2d';
import { fibonacciSphere } from '../../../../../modules/utility/webgl/model-3d';
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
    };

    // create object status
    this._objectStatus = {
      color: [245, 20, 73, 1],
      fluctuationPower: 0.1,
      fluctuationSpeed: 0.2,
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
      const _fSparkle = _gui.addFolder('Sparkle');
      _fSparkle.open();
      // color
      _gui.addColor(this._objectStatus, 'color');
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
    this._attLocs = [gl.getAttribLocation(this._prg, 'position')];
    this._attStrides = [3];

    // uniform location
    this._uniLocs = [
      gl.getUniformLocation(this._prg, 'mvpMatrix'),
      gl.getUniformLocation(this._prg, 'time'),
      gl.getUniformLocation(this._prg, 'pov'),
      gl.getUniformLocation(this._prg, 'color'),
      gl.getUniformLocation(this._prg, 'fluctuation'),
    ];

    // pre vertex
    const _vartexAtts = [];
    const _indexes = [];

    const _linePos = [];
    const _spherePos = fibonacciSphere(1000, 0.8, { incrementOpts: [2, 5, 1] })
      .p;
    for (let i = 0; _spherePos.length / 3 > i; i++) {
      _linePos.push([
        _spherePos[3 * i],
        _spherePos[3 * i + 1],
        _spherePos[3 * i + 3],
        _spherePos[3 * i + 4],
      ]);
    }

    for (let i = 0; _linePos.length > i; i++) {
      // create model
      const _model = line(..._linePos[i], 1, {
        startIndex: _indexes.length,
      });

      // set attribute
      for (let j = 0; _model.p.length / 3 > j; j++) {
        _vartexAtts.push(
          // set positoin
          _model.p[3 * j + 0],
          _model.p[3 * j + 1],
          _model.p[3 * j + 2],
        );
      }

      _indexes.push(..._model.i);
    }

    // close line index
    _indexes.push(0);

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
      ibo: createIbo(gl, _indexes),
      attLocs: this._attLocs,
      attStrides: this._attStrides,
      offsets: _offsets,
      byteLen: _byteCnt,
      indexLen: _indexes.length,
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

    // matrix transform
    _m.identity(data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);

    // set uniform
    _gl.uniformMatrix4fv(_ul[0], false, data.mvpMat); // mvpMatrix
    _gl.uniform1f(_ul[1], _time); // time
    _gl.uniform2fv(_ul[2], [data.povx, data.povy]); // point of view
    _gl.uniform4fv(_ul[3], [
      os.color[0] / 255, // r
      os.color[1] / 255, // g
      os.color[2] / 255, // b
      os.color[3], // a
    ]); // color
    _gl.uniform2fv(_ul[4], [os.fluctuationPower, os.fluctuationSpeed]); // fluctuation

    // draw
    _gl.drawElements(_gl.LINES, od.indexLen, _gl.UNSIGNED_SHORT, 0);

    return this;
  }
}

export { MainObject as default };
