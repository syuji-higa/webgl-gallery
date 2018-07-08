import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  enableAttribute,
} from '../../../../../modules/utility/webgl/util';
import { square } from '../../../../../modules/utility/webgl/model';
import DatGUI from '../datgui';
import { vShader, fShader } from './main-shader';

class MainMesh {
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

    // create mesh status
    this._meshStatus = {
      color: [0, 164, 151, 1],
      fluctuationPower: 0.1,
      fluctuationSpeed: 0.2,
      sparklePower: 0.2,
      sparkleSpeed: 0.2,
      wireframe: false,
    };

    // GUI
    const _gui = DatGUI.getInstance().gui;
    _gui.remember(this._meshStatuse);
    // fluctuation
    const _fFluctuation = _gui.addFolder('Fluctuation');
    _fFluctuation.add(this._meshStatus, 'fluctuationPower', 0, 0.5);
    _fFluctuation.add(this._meshStatus, 'fluctuationSpeed', 0.1, 1);
    _fFluctuation.open();
    const _fSparkle = _gui.addFolder('Sparkle');
    // sparkle
    _fSparkle.add(this._meshStatus, 'sparklePower', 0, 0.5);
    _fSparkle.add(this._meshStatus, 'sparkleSpeed', 0.1, 1);
    _fSparkle.open();
    // color
    _gui.addColor(this._meshStatus, 'color');
    // wireframe
    _gui.add(this._meshStatus, 'wireframe');

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
      gl.getUniformLocation(this._prg, 'mouse'),
      gl.getUniformLocation(this._prg, 'color'),
      gl.getUniformLocation(this._prg, 'fluctuation'),
      gl.getUniformLocation(this._prg, 'sparkle'),
    ];

    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // create mesh
    const _mesh = square(0.5, 0.5, 20, 20);

    // set attribute
    for (let i = 0; _mesh.p.length / 3 > i; i++) {
      const _attCnt = _attLen * i;

      // set positoin
      _vartexAtts[_attCnt + 0] = _mesh.p[3 * i + 0];
      _vartexAtts[_attCnt + 1] = _mesh.p[3 * i + 1];
      _vartexAtts[_attCnt + 2] = _mesh.p[3 * i + 2];
    }

    // set byteLen & offset
    let _byteCnt = 0;
    const _offsets = [];
    for (const stride of this._attStrides) {
      const _byteLen = stride * 4; // gl.FLOAT -> 32bit === 4byte
      _offsets.push(_byteCnt);
      _byteCnt += _byteLen;
    }

    // create mesh data
    this._mesh = {
      vbo: createVbo(gl, new Float32Array(_vartexAtts)),
      ibo: createIbo(gl, _mesh.i),
      attLocs: this._attLocs,
      attStrides: this._attStrides,
      offsets: _offsets,
      byteLen: _byteCnt,
      indexLen: _mesh.i.length,
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
   * @param {number} data.mx - float[-1,1]
   * @param {number} data.my - float[-1,1]
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
    const { _gl, _matIV: _m, _uniLocs: _ul, _mesh } = this;

    // use program
    useProgram(_gl, this._prg);

    // bind ibo
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _mesh.ibo);

    // set attribute
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _mesh.vbo);
    for (let i = 0; _mesh.attLocs.length > i; i++) {
      enableAttribute(_gl, _mesh.attLocs[i], _mesh.attStrides[i], {
        stride: _mesh.byteLen,
        offset: _mesh.offsets[i],
      });
    }
    _gl.bindBuffer(_gl.ARRAY_BUFFER, null);

    // matrix transform
    _m.identity(data.mMat);
    _m.multiply(data.tmpMat, data.mMat, data.mvpMat);

    // set uniform
    _gl.uniformMatrix4fv(_ul[0], false, data.mvpMat); // mvpMatrix
    _gl.uniform1f(_ul[1], _time); // time
    _gl.uniform2fv(_ul[2], [data.mx, data.my]); // mouse
    _gl.uniform4fv(_ul[3], [
      this._meshStatus.color[0] / 255, // r
      this._meshStatus.color[1] / 255, // g
      this._meshStatus.color[2] / 255, // b
      this._meshStatus.color[3], // a
    ]); // color
    _gl.uniform2fv(_ul[4], [
      this._meshStatus.fluctuationPower,
      this._meshStatus.fluctuationSpeed,
    ]); // fluctuation
    _gl.uniform2fv(_ul[5], [
      this._meshStatus.sparklePower,
      this._meshStatus.sparkleSpeed,
    ]); // sparkle

    // draw
    const _primitive = this._meshStatus.wireframe ? 'LINES' : 'TRIANGLES';
    _gl.drawElements(_gl[_primitive], _mesh.indexLen, _gl.UNSIGNED_SHORT, 0);
  }
}

export { MainMesh as default };
