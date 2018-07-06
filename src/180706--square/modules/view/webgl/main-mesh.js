import {
  createShader,
  createProgram,
  useProgram,
  createVbo,
  createIbo,
  enableAttribute,
} from '../../../../modules/utility/webgl/util';
import { square } from '../../../../modules/utility/webgl/model';
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
    this._uniLocs = [
      gl.getUniformLocation(this._prg, 'mvpMatrix'),
      gl.getUniformLocation(this._prg, 'time'),
      gl.getUniformLocation(this._prg, 'mouse'),
    ];

    // pre vertex
    const _vartexAtts = [];
    const _attLen = this._attStrides.reduce((p, c) => p + c);

    // create mesh
    const _mesh = square(0.5, 0.5, 1, 1, {
      color: [0.7, 0.7, 0.7, 1],
    });

    // set attribute
    for (let i = 0; _mesh.p.length / 3 > i; i++) {
      const _attCnt = _attLen * i;

      // set positoin
      _vartexAtts[_attCnt + 0] = _mesh.p[3 * i + 0];
      _vartexAtts[_attCnt + 1] = _mesh.p[3 * i + 1];
      _vartexAtts[_attCnt + 2] = _mesh.p[3 * i + 2];

      // set color
      _vartexAtts[_attCnt + 3] = _mesh.c[4 * i + 0];
      _vartexAtts[_attCnt + 4] = _mesh.c[4 * i + 1];
      _vartexAtts[_attCnt + 5] = _mesh.c[4 * i + 2];
      _vartexAtts[_attCnt + 6] = _mesh.c[4 * i + 3];
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

    // draw
    _gl.drawElements(_gl.TRIANGLES, _mesh.indexLen, _gl.UNSIGNED_SHORT, 0);
  }
}

export { MainMesh as default };
