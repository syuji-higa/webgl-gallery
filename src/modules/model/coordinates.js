/**
 * coordinates
 */

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
