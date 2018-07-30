import Singleton from '../pattern/singleton';

class RequestAnimationFramer extends Singleton {
  constructor() {
    super();

    this._animes = new Map();
    this._animateHandle = 0;
  }

  /**
   * @param {Object} key
   * @return {number} float[0,inf)
   */
  getTime(key) {
    return this._animes.get(key).time;
  }

  /**
   * @param {Object} key
   * @param {function} fn
   * @param {number} fps - int
   * @param {number} [interval] - int
   * @return {Instance}
   */
  add(key, fn, fps, interval = 0) {
    this._animes.set(key, {
      startTime: new Date().getTime(),
      time: 0,
      frameStartTime: 0,
      ms: fps === 'auto' ? 0 : Math.floor(1000 / fps),
      time: 0,
      count: 0,
      interval: interval + 1,
      fn: fn,
    });

    if (!this._animateHandle) this._start();

    return this;
  }

  /**
   * @param {Object} key
   * @return {Instance}
   */
  remove(key) {
    this._animes.delete(key);
    if (!this._animes.size) this._stop();

    return this;
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

    this._animes.forEach(({ frameStartTime, ms, count, interval, fn }, key) => {
      const _anime = this._animes.get(key);
      _anime.count++;
      _anime.time = _time - _anime.startTime;
      if (count % interval || ms > _time - frameStartTime) return;
      _anime.frameStartTime = _time;
      fn();
    });
  }
}

export { RequestAnimationFramer as default };
