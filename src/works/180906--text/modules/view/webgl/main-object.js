import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  enableAttribute,
} from '../../../../../modules/utility/webgl/util';
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
      color: [160, 39, 47, 1],
      scale: 1.5,
      fluctuationPower: 0.1,
      fluctuationSpeed: 0.2,
    };

    /**
     * GUI
     */
    {
      const _gui = DatGUI.getInstance().gui;
      _gui.remember(this._objectStatuse);
      // scale
      _gui.add(this._objectStatus, 'scale', 0.5, 5);
      // fluctuation
      const _fFluctuation = _gui.addFolder('Fluctuation');
      _fFluctuation.add(this._objectStatus, 'fluctuationPower', 0, 0.5);
      _fFluctuation.add(this._objectStatus, 'fluctuationSpeed', 0.1, 1);
      _fFluctuation.open();
      // color
      _gui.addColor(this._objectStatus, 'color');
    }

    // webGL items
    this._gl = gl;
    this._matIV = matIV;
    this._dpr = dpr;
    this._objectData = {};

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
      gl.getUniformLocation(this._prg, 'dpr'),
      gl.getUniformLocation(this._prg, 'pov'),
      gl.getUniformLocation(this._prg, 'color'),
      gl.getUniformLocation(this._prg, 'scale'),
      gl.getUniformLocation(this._prg, 'fluctuation'),
    ];
  }

  /**
   * @param {Array<number>} positions
   * @return {Instance}
   */
  create(positions) {
    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // set attribute
    for (let i = 0; 8 > i; i++) {
      for (let j = 0; positions.length / 2 > j; j++) {
        const _attCnt = _attLen * (positions.length / 2) * i + _attLen * j;

        // set positions
        _vartexAtts[_attCnt + 0] = positions[6 * j + 0] - 0.5;
        _vartexAtts[_attCnt + 1] = -positions[6 * j + 1] + 0.5;
        _vartexAtts[_attCnt + 2] = i * 0.015;
      }
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
      vbo: createVbo(this._gl, new Float32Array(_vartexAtts)),
      attLocs: this._attLocs,
      attStrides: this._attStrides,
      offsets: _offsets,
      byteLen: _byteCnt,
      positionLen: _vartexAtts.length / 3,
    };

    return this;
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

    // set attribute
    _gl.bindBuffer(_gl.ARRAY_BUFFER, od.vbo);
    for (let i = 0; od.attLocs.length > i; i++) {
      enableAttribute(_gl, od.attLocs[i], od.attStrides[i], {
        stride: od.byteLen,
        offset: od.offsets[i],
      });
    }
    _gl.bindBuffer(_gl.ARRAY_BUFFER, null);

    // change blend mode
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE);

    // matrix transform
    _m.identity(data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);

    // set uniform
    _gl.uniformMatrix4fv(_ul[0], false, data.mvpMat); // mvpMatrix
    _gl.uniform1f(_ul[1], _time); // time
    _gl.uniform1f(_ul[2], this._dpr); // dpr
    _gl.uniform2fv(_ul[3], [data.povx, data.povy]); // point of view
    _gl.uniform4fv(_ul[4], [
      os.color[0] / 255, // r
      os.color[1] / 255, // g
      os.color[2] / 255, // b
      os.color[3], // a
    ]); // color
    _gl.uniform1f(_ul[5], os.scale); // scale
    _gl.uniform2fv(_ul[6], [os.fluctuationPower, os.fluctuationSpeed]); // fluctuation

    // draw
    _gl.drawArrays(_gl.POINTS, 0, od.positionLen);

    return this;
  }
}

export { MainObject as default };
