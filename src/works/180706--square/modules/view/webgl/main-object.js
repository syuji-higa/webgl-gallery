import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
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
    };

    // create object status
    this._objectStatus = {
      color: [0, 164, 151, 1],
      fluctuationPower: 0.1,
      fluctuationSpeed: 0.2,
      sparklePower: 0.2,
      sparkleSpeed: 0.2,
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
      const _fSparkle = _gui.addFolder('Sparkle');
      // sparkle
      _fSparkle.add(this._objectStatus, 'sparklePower', 0, 0.5);
      _fSparkle.add(this._objectStatus, 'sparkleSpeed', 0.1, 1);
      _fSparkle.open();
      // color
      _gui.addColor(this._objectStatus, 'color');
      // wireframe
      _gui.add(this._objectStatus, 'wireframe');
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
      gl.getUniformLocation(this._prg, 'sparkle'),
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

  start() {
    if (this._status.isDrawing) return;
    this._status.isDrawing = true;
  }

  stop() {
    if (!this._status.isDrawing) return;
    this._status.isDrawing = false;
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
    _gl.uniform2fv(_ul[5], [os.sparklePower, os.sparkleSpeed]); // sparkle

    // draw
    const _primitive = os.wireframe ? 'LINES' : 'TRIANGLES';
    _gl.drawElements(_gl[_primitive], od.indexLen, _gl.UNSIGNED_SHORT, 0);
  }
}

export { MainObject as default };
