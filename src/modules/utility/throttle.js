/**
 * throttle
 */

/**
 * @param {Object} [opts]
 * @param {number} [opts.interval]
 * @param {boolean} [opts.isLastRun]
 * @return {function(fn: function)}
 */
export const throttle = (opts = {}) => {
  const { interval, isLastRun } = Object.assign(
    { interval: 100, isLastRun: true },
    opts,
  );

  let _lastTime = new Date().getTime() - interval;
  let _timer = 0;

  return fn => {
    if (_lastTime + interval <= new Date().getTime()) {
      _lastTime = new Date().getTime();
      fn();
    }
    if (isLastRun) {
      clearTimeout(_timer);
      _timer = setTimeout(() => {
        fn();
        _timer = 0;
      }, interval);
    }
  };
};
