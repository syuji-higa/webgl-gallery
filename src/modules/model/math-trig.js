/**
 * mathTrig
 */

/**
 * @param {number} base
 * @param {number} angle
 * @return {number}
 */
export const hypotenuseFromBaAn = (base, angle) => {
  return base / Math.sin(angle);
};

/**
 * @param {number} height
 * @param {number} angle
 * @return {number}
 */
export const hypotenuseFromHeAn = (height, angle) => {
  return height / Math.sin(angle);
};

/**
 * @param {number} base
 * @param {number} height
 * @return {number}
 */
export const hypotenuseFromBaHe = (base, height) => {
  return Math.sqrt(Math.pow(base, 2) + Math.pow(height, 2));
};

/**
 * @param {number} base
 * @param {number} angle
 * @return {number}
 */
export const heightFromBaAn = (base, angle) => {
  return base * Math.tan(angle);
};

/**
 * @param {number} hypotenuse
 * @param {number} angle
 * @return {number}
 */
export const heightFromHyAn = (hypotenuse, angle) => {
  return hypotenuse * Math.sin(angle);
};

/**
 * @param {number} base
 * @param {number} hypotenuse
 * @return {number}
 */
export const heightFromBaHy = (base, hypotenuse) => {
  return Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(base, 2));
};

/**
 * @param {number} height
 * @param {number} angle
 * @return {number}
 */
export const baseFromHeAn = (height, angle) => {
  return height / Math.tan(angle);
};

/**
 * @param {number} hypotenuse
 * @param {number} angle
 * @return {number}
 */
export const baseFromHyAn = (hypotenuse, angle) => {
  return hypotenuse * Math.cos(angle);
};

/**
 * @param {number} height
 * @param {number} hypotenuse
 * @return {number}
 */
export const baseFromHeHy = (height, hypotenuse) => {
  return Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(height, 2));
};

/**
 * @param {number} base
 * @param {number} height
 * @return {number}
 */
export const angleFromBaHe = (base, height) => {
  return Math.atan2(height, base);
};

/**
 * @param {number} base
 * @param {number} hypotenuse
 * @return {number}
 */
export const angleFromBaHy = (base, hypotenuse) => {
  return Math.acos(base / hypotenuse);
};

/**
 * @param {number} height
 * @param {number} hypotenuse
 * @return {number}
 */
export const angleFromHeHy = (height, hypotenuse) => {
  return Math.asin(height / hypotenuse);
};
