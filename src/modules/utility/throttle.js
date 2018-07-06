/**
 * throttle
 */

/**
 * @param {number} [interval]
 * @return {function(fn: function)}
 */
export const throttle = (interval = 50) => {
  let _lastTime = new Date().getTime() - interval;

  return (fn) => {
    if((_lastTime + interval) <= new Date().getTime()) {
      _lastTime = new Date().getTime();
      fn();
    }
  };
};
