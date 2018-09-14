/**
 * coordinates
 */

/**
 * @param {number} col - int[0,inf)
 * @param {number} x - int[0,inf)
 * @param {number} y - int[0,inf)
 * @return {number}
 */
export const getIndex = (col, x, y) => {
  return col * y + x;
};

/**
 * @param {number} col - int[0,inf)
 * @param {number} index - int[0,inf)
 * @return {Array<number>}
 */
export const getPosition = (col, index) => {
  const x = index % col;
  const y = (index - x) / col;
  return [x, y];
};

/**
 * @param {Array<number>} c1 - float[0,1]
 * @param {Array<number>} c2 - float[0,1]
 * @param {Array<number>} c3 - float[0,1]
 * @param {Array<number>} c4 - float[0,1]
 * @param {number} xr - float[-1,1]
 * @param {number} yr - float[-1,1]
 * @return {Array<number>} - float[0,1]
 */
export const pointColor = (c1, c2, c3, c4, xr, yr) => {
  const _ct = c1.map((c, i) => {
    return c1[i] + (c2[i] - c1[i]) * xr;
  });
  const _cb = c3.map((c, i) => {
    return c3[i] + (c4[i] - c3[i]) * xr;
  });
  return _ct.map((c, i) => {
    return _ct[i] + (_cb[i] - _ct[i]) * yr;
  });
};
