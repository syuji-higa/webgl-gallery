/**
 * webgl model 3D
 */

/**
 * @param {number} row - int[0,inf)
 * @param {number} col - int[0,inf)
 * @param {number} irad - float[0,inf)
 * @param {number} orad - float[0,inf)
 * @param {Array<number>} color - float[0,1]
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} n - normal float(-inf,inf)
 * @property {Array<number>} t - texture float[0,1]
 * @property {Array<number>} c - color int[0,1]
 * @property {Array<number>} i - index int[0,inf)
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
    for (let ii = 0; ii <= col; ii++) {
      const _tr = ((Math.PI * 2) / col) * ii;
      const _tx = (_rr * irad + orad) * Math.cos(_tr);
      const _ty = _ry * irad;
      const _tz = (_rr * irad + orad) * Math.sin(_tr);
      const _rx = _rr * Math.cos(_tr);
      const _rz = _rr * Math.sin(_tr);
      const _tc = color || hsva((360 / col) * ii, 1, 1, 1);
      const _rs = (1 / col) * ii;
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
    for (let ii = 0; ii < col; ii++) {
      const _r = (col + 1) * i + ii;
      // prettier-ignore
      _idx.push(
        _r           , _r + col + 1, _r + 1,
        _r + col + 1, _r + col + 2, _r + 1,
      );
    }
  }
  return { p: _pos, n: _nor, c: _col, t: _st, i: _idx };
};

/**
 * @param {number} row - int[0,inf)
 * @param {number} col - int[0,inf)
 * @param {number} rad - float[0,inf)
 * @param {Array<number>} color - float[0,1]
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} n - normal float(-inf,inf)
 * @property {Array<number>} t - texture float[0,1]
 * @property {Array<number>} c - color int[0,1]
 * @property {Array<number>} i - index int[0,inf)
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
 * @param {number} sample - int[1,inf)
 * @param {number} scale - float[0,inf)
 * @param {Array<number>} color - float[0,1]
 * @param {Object} [opts]
 * @param {Array<number>} [opts.color] - float[0,1]
 * @param {number} [opts.startIndex] - int[0,inf)
 * @param {Array<number>} [opts.incrementOpts] - int [0,inf)
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} i - index int[0,inf)
 */
export const fibonacciSphere = (sample, scale, opts = {}) => {
  const { color, startIndex, incrementOpts } = Object.assign(
    { color: [1, 1, 1, 1], startIndex: 0, incrementOpts: [3, 5, 1] },
    opts,
  );

  const _pos = [];
  const _clr = [];
  const _idx = [];

  const _offset = 2 / sample;
  // const _increment = Math.PI * (3 - Math.sqrt(5));
  const _increment =
    Math.PI *
    (incrementOpts[0] - Math.sqrt(incrementOpts[1])) *
    incrementOpts[2];
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
 * @param {Array<number>} color - float[0,1]
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} n - normal float(-inf,inf)
 * @property {Array<number>} t - texture float[0,1]
 * @property {Array<number>} c - color int[0,1]
 * @property {Array<number>} i - index int[0,inf)
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
