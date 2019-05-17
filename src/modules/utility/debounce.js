/**
 * debounce
 */

/**
 * @param {Object} [opts]
 * @param {number} [opts.interval]
 * @param {boolean} [opts.isFirstRun]
 * @return {function(fn: function)}
 */
export const debounce = (opts = {}) => {
  const { interval, isFirstRun } = Object.assign(
    { interval: 100, isFirstRun: false },
    opts,
  );
  let _timer = 0;
  let _firstRun = true;

  return fn => {
    if (isFirstRun && _firstRun) {
      fn();
      _firstRun = false;
    }
    clearTimeout(_timer);
    _timer = setTimeout(() => {
      fn();
      _timer = 0;
      if (isFirstRun) {
        _firstRun = true;
      }
    }, interval);
  };
};
