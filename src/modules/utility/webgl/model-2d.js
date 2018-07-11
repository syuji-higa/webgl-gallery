import { pointColor } from '../../model/coordinates';
import { baseFromHyAn, heightFromHyAn } from '../../model/math-trig';

/**
 * webgl model 2D
 */

/**
 * @param {Array<number>} start - float(-inf,inf)
 * @param {Array<number>} end - float(-inf,inf)
 * @param {number} num - int[1,inf)
 * @param {Object} [opt]
 * @param {number} [opt.startIndex] - int[0,inf)
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} i - index int[0,inf)
 */
export const line = (x1, y1, x2, y2, num, opts = {}) => {
  const { startIndex } = Object.assign(
    {
      startIndex: 0,
    },
    opts,
  );

  const _pos = [];
  const _idx = [];

  const _w = x1 - x2;
  const _h = y1 - y2;
  const _wos = _w / num; // width one size
  const _hos = _h / num; // height one size

  for (let i = 0; num >= i; i++) {
    // prettier-ignore
    _pos.push(
      x1 - (_wos * i),
      y1 - (_hos * i),
      0,
    );
    if (i) {
      _idx.push(startIndex + i - 1);
    }
  }

  return { p: _pos, i: _idx };
};

/**
 * @param {number} width - float[0,inf)
 * @param {number} height - float[0,inf)
 * @param {number} row - int[0,inf)
 * @param {number} col - int[0,inf)
 * @param {Object} [opt]
 * @param {Array<number>} [opt.offset] - float(-inf,inf)
 * @param {?Array<number|Array<number>>} [opts.color] - float[0,1]
 * @param {number} [opt.startIndex] - int[0,inf)
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} t - texture float[0,1]
 * @property {Array<number>} c - color float[0,1]
 * @property {Array<number>} i - index int[0,inf)
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
 * @param {Array<number>} [opt.offset] - float[0,inf)
 * @param {Array<number>} [opt.ratio] - float[0,inf)
 * @param {Array<number>} [opts.color] - float[0,1]
 * @param {number} [opt.startIndex] - int[0,inf)
 * @return {Object}
 * @property {Array<number>} p - position float(-inf,inf)
 * @property {Array<number>} t - texture float[0,1]
 * @property {Array<number>} c - color float[0,1]
 * @property {Array<number>} i - index int[0,inf)
 */
export const circle = (rad, num, opts = {}) => {
  const { rotate, offset, ratio, color, startIndex } = Object.assign(
    {
      rotate: 0,
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
    const _a = _ang * i + ((Math.PI * 2) / 360) * rotate;
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
