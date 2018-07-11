/**
 * math coordinate
 */

/**
 * @param {number} pos1X - float(-inf,inf)
 * @param {number} pos1Y - float(-inf,inf)
 * @param {number} pos2X - float(-inf,inf)
 * @param {number} pos2Y - float(-inf,inf)
 * @return {number}
 */
export const distanceFromTwoPoint = (pos1X, pos1Y, pos2X, pos2Y) => {
  return Math.sqrt(Math.pow(pos1X - pos2X, 2) + Math.pow(pos1Y - pos2Y, 2));
};
