import { pointColor } from '../../model/coordinates';
import { baseFromHyAn, heightFromHyAn } from '../../model/math-trig';

/**
 * webgl model
 */

/**
 * @param {number} width - float
 * @param {number} height - float
 * @param {number} row - int
 * @param {number} col - int
 * @param {Object} [opt]
 * @param {Array<number>} [opt.offset] - float
 * @param {?Array<number|Array<number>>} [opts.color] - float
 * @param {number} [opt.startIndex]
 * @return {Object}
 * @property {Array<number>} p
 * @property {Array<number>} t
 * @property {Array<number>} c
 * @property {Array<number>} i
 */
export const square = (width, height, row, col, opts = {}) => {
  const { offset, color, startIndex } = Object.assign(
    {
      offset: [0, 0],
      color: [1, 1, 1, 1],
      startIndex: 0,
    },
    opts,
  );

  const _pos = [];
  const _st = [];
  const _clr = [];
  const _idx = [];
  const _pw = (width * 2) / col;
  const _ph = (height * 2) / row;
  const _tw = 1 / col;
  const _th = 1 / row;
  for (let y = 0; row >= y; y++) {
    for (let x = 0; col >= x; x++) {
      // prettier-ignore
      _pos.push(
        offset[0] + -width + _pw * x, // x
        offset[1] + height - _ph * y, // y
        0, // z
      );
      // prettier-ignore
      _st.push(
        _tw * x, // x
        _th * y, // y
      );
      const _xr = x / col;
      const _yr = y / row;
      if (Array.isArray(color[0])) {
        _clr.push(...pointColor(...color, _xr, _yr));
      } else {
        _clr.push(...color);
      }
    }
  }
  for (let y = 0; row > y; y++) {
    for (let x = 0; col > x; x++) {
      // prettier-ignore
      const _p = [
        startIndex + (y    ) * (col + 1) + x,
        startIndex + (y + 1) * (col + 1) + x,
        startIndex + (y    ) * (col + 1) + x + 1,
        startIndex + (y + 1) * (col + 1) + x + 1,
      ];
      // prettier-ignore
      _idx.push(
        _p[0], _p[1], _p[2],
        _p[1], _p[3], _p[2],
      );
    }
  }
  return { p: _pos, t: _st, c: _clr, i: _idx };
};

/**
 * @param {number} rad - float
 * @param {number} num - int
 * @param {Object} [opt]
 * @param {Array<number>} [opt.offset] - float
 * @param {Array<number>} [opt.ratio] - float
 * @param {Array<number>} [opts.color] - float
 * @param {number} [opt.startIndex]
 * @return {Object}
 * @property {Array<number>} p¸
 * @property {Array<number>} t
 * @property {Array<number>} i
 */
export const circle = (rad, num, opts = {}) => {
  const { offset, ratio, color, startIndex } = Object.assign(
    {
      offset: [0, 0],
      ratio: [1, 1],
      color: [1, 1, 1, 1],
      startIndex: 0,
    },
    opts,
  );

  const _pos = [];
  const _st = [];
  const _clr = [];
  const _idx = [];

  const _ang = (Math.PI * 2) / num;

  _pos.push(offset[0], offset[1], 0);
  _st.push(offset[0] + 0.5, offset[1] + 0.5);
  _clr.push(...color);

  for (let i = 0; num > i; i++) {
    const _a = _ang * i;
    const _x = baseFromHyAn(rad, _a);
    const _y = heightFromHyAn(rad, _a);
    // prettier-ignore
    _pos.push(
      offset[0] + _x * ratio[0],
      offset[1] + _y * ratio[1],
      0,
    );
    _clr.push(...color);
    // prettier-ignore
    _st.push(
      (_x + rad) * 0.5,
      (_y + rad) * 0.5,
    );
  }

  for (let i = 0; num > i; i++) {
    if (num - 1 > i) {
      // prettier-ignore
      _idx.push(
        startIndex,
        startIndex + 1 + i,
        startIndex + 2 + i,
      );
    } else {
      // prettier-ignore
      _idx.push(
        startIndex,
        startIndex + 1 + i,
        startIndex + 1,
      );
    }
  }

  return { p: _pos, t: _st, c: _clr, i: _idx };
};

/**
 * @param {number} row - int
 * @param {number} col - int
 * @param {number} irad - float
 * @param {number} orad - float
 * @param {Array<number>} color
 * @return {Object}
 * @property {Array<number>} p
 * @property {Array<number>} n
 * @property {Array<number>} c
 * @property {Array<number>} t
 * @property {Array<number>} i
 */
export const torus = (row, col, irad, orad, color) => {
  const _pos = [];
  const _nor = [];
  const _col = [];
  const _st = [];
  const _idx = [];
  for (let i = 0; i <= row; i++) {
    const _r = ((Math.PI * 2) / row) * i;
    const _rr = Math.cos(_r);
    const _ry = Math.sin(_r);
    for (let ii = 0; ii <= _col; ii++) {
      const _tr = ((Math.PI * 2) / _col) * ii;
      const _tx = (_rr * irad + orad) * Math.cos(_tr);
      const _ty = _ry * irad;
      const _tz = (_rr * irad + orad) * Math.sin(_tr);
      const _rx = _rr * Math.cos(_tr);
      const _rz = _rr * Math.sin(_tr);
      const _tc = color || hsva((360 / _col) * ii, 1, 1, 1);
      const _rs = (1 / _col) * ii;
      let _rt = (1 / row) * i + 0.5;
      if (_rt > 1.0) _rt -= 1.0;
      _rt = 1.0 - _rt;
      _pos.push(_tx, _ty, _tz);
      _nor.push(_rx, _ry, _rz);
      _col.push(_tc[0], _tc[1], _tc[2], _tc[3]);
      _st.push(_rs, _rt);
    }
  }
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < _col; ii++) {
      const _r = (_col + 1) * i + ii;
      // prettier-ignore
      _idx.push(
        _r           , _r + _col + 1, _r + 1,
        _r + _col + 1, _r + _col + 2, _r + 1,
      );
    }
  }
  return { p: _pos, n: _nor, c: _col, t: _st, i: _idx };
};

/**
 * @param {number} row - int
 * @param {number} col - int
 * @param {number} rad - float
 * @param {Array<number>} color
 * @return {Object}
 * @property {Array<number>} p¸
 * @property {Array<number>} n
 * @property {Array<number>} c
 * @property {Array<number>} t
 * @property {Array<number>} i
 */
export const sphere = (row, col, rad, color) => {
  const _pos = [];
  const _nor = [];
  const _col = [];
  const _st = [];
  const _idx = [];
  for (let i = 0; i <= row; i++) {
    const _r = (Math.PI / row) * i;
    const _ry = Math.cos(_r);
    const _rr = Math.sin(_r);
    for (let ii = 0; ii <= col; ii++) {
      const _tr = ((Math.PI * 2) / col) * ii;
      const _tx = _rr * rad * Math.cos(_tr);
      const _ty = _ry * rad;
      const _tz = _rr * rad * Math.sin(_tr);
      const _rx = _rr * Math.cos(_tr);
      const _rz = _rr * Math.sin(_tr);
      const _tc = color || hsva((360 / row) * i, 1, 1, 1);
      _pos.push(_tx, _ty, _tz);
      _nor.push(_rx, _ry, _rz);
      _col.push(_tc[0], _tc[1], _tc[2], _tc[3]);
      _st.push(1 - (1 / col) * ii, (1 / row) * i);
    }
  }
  let _r = 0;
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < col; ii++) {
      _r = (col + 1) * i + ii;
      // prettier-ignore
      _idx.push(
        _r, _r + 1      , _r + col + 2,
        _r, _r + col + 2, _r + col + 1,
      );
    }
  }
  return { p: _pos, n: _nor, c: _col, t: _st, i: _idx };
};

/**
 * @param {number} sample - int
 * @param {number} scale - float
 * @param {Array<number>} color - float[0~1]
 * @param {Object} [opts]
 * @param {Array<number>} [opts.color] - float[0~1]
 * @param {number} [opts.startIndex] - int
 * @param {number} [opts.vals] - int
 * @return {Object}
 * @property {Array<number>} p¸
 * @property {Array<number>} i
 */
export const fibonacciSphere = (sample, scale, opts = {}) => {
  const { color, startIndex, vals } = Object.assign(
    { color: [1, 1, 1, 1], startIndex: 0, vals: [3, 5, 1] },
    opts,
  );

  const _pos = [];
  const _clr = [];
  const _idx = [];

  const _offset = 2 / sample;
  // const _increment = Math.PI * (3 - Math.sqrt(5));
  const _increment = Math.PI * (vals[0] - Math.sqrt(vals[1])) * vals[2];
  const _face = sample - 2;

  for (let i = 0; sample > i; i++) {
    const _z = i * _offset - 1 + _offset / 2;
    const _r = Math.sqrt(1 - Math.pow(_z, 2));

    const phi = (i % sample) * _increment;

    const _x = Math.cos(phi) * _r;
    const _y = Math.sin(phi) * _r;

    _pos.push(_x * scale, _y * scale, _z * scale);
    _clr.push(...color);
  }

  for (let i = 0; _face > i; i++) {
    _idx.push(startIndex + i, startIndex + i + 1, startIndex + i + 2);
  }

  return { p: _pos, c: _clr, i: _idx };
};

/**
 * @param {number} side - float
 * @param {Array<number>} color - float
 * @return {Object}
 * @property {Array<number>} p
 * @property {Array<number>} n
 * @property {Array<number>} c
 * @property {Array<number>} t
 * @property {Array<number>} i
 */
export const cube = (side, color) => {
  const _hs = side * 0.5;
  // prettier-ignore
  const pos = [
		-_hs, -_hs,  _hs,  _hs, -_hs,  _hs,  _hs,  _hs,  _hs, -_hs,  _hs,  _hs,
		-_hs, -_hs, -_hs, -_hs,  _hs, -_hs,  _hs,  _hs, -_hs,  _hs, -_hs, -_hs,
		-_hs,  _hs, -_hs, -_hs,  _hs,  _hs,  _hs,  _hs,  _hs,  _hs,  _hs, -_hs,
		-_hs, -_hs, -_hs,  _hs, -_hs, -_hs,  _hs, -_hs,  _hs, -_hs, -_hs,  _hs,
		 _hs, -_hs, -_hs,  _hs,  _hs, -_hs,  _hs,  _hs,  _hs,  _hs, -_hs,  _hs,
		-_hs, -_hs, -_hs, -_hs, -_hs,  _hs, -_hs,  _hs,  _hs, -_hs,  _hs, -_hs,
  ];
  // prettier-ignore
  const _nor = [
		-1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0,
	];
  const _col = [];
  for (let i = 0; i < pos.length / 3; i++) {
    let _tc = color || hsva((360 / pos.length / 3) * i, 1, 1, 1);
    _col.push(_tc[0], _tc[1], _tc[2], _tc[3]);
  }
  // prettier-ignore
  const _st = [
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];
  // prettier-ignore
  const _idx = [
		 0,  1,  2,  0,  2,  3,
		 4,  5,  6,  4,  6,  7,
		 8,  9, 10,  8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23,
	];
  return { p: pos, n: _nor, c: _col, t: _st, i: _idx };
};
