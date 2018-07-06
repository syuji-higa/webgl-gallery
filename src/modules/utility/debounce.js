/**
 * debounce
 */

/**
 * @param {number} [interval] - int[0,inf)
 * @return {function(fn: function)}
 */
export const debounce = function debounce(interval = 50) {
  let _timer = 0;

  return fn => {
    clearTimeout(_timer);
    _timer = setTimeout(() => {
      fn();
      _timer = 0;
    }, interval);
  };
};
