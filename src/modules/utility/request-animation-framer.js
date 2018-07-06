import Singleton from '../pattern/singleton';

class RequestAnimationFramer extends Singleton {
  constructor() {
    super();

    this._animes = new Map();
    this._animateHandle = 0;
  }

  /**
   * @param {Object} key
   * @param {function} fn
   * @param {number} fps - int
   * @param {number} [interval] - int
   */
  add(key, fn, fps, interval = 0) {
    this._animes.set(key, {
      startTime: 0,
      ms: fps === 'auto' ? 0 : Math.floor(1000 / fps),
      count: 0,
      interval: interval + 1,
      fn: fn,
    });

    if (!this._animateHandle) this._start();
  }

  /**
   * @param {Object} key
   */
  remove(key) {
    this._animes.delete(key);
    if (!this._animes.size) this._stop();
  }

  _start() {
    if (this._animateHandle) return;
    this._animate();
  }

  _stop() {
    cancelAnimationFrame(this._animateHandle);
    this._animateHandle = 0;
  }

  _animate() {
    this._animateHandle = requestAnimationFrame(this._animate.bind(this));

    const _time = new Date().getTime();

    this._animes.forEach(({ startTime, ms, count, interval, fn }, key) => {
      this._animes.get(key).count++;
      if (count % interval || ms > _time - startTime) return;
      this._animes.get(key).startTime = _time;
      fn();
    });
  }
}

export { RequestAnimationFramer as default };
