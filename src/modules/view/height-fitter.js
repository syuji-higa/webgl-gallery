import EventObserver from '../observer/event-observer';
import WindowSizeObserver from '../observer/window-size-observer';

class HeightFitter {
  /**
   * @return {Object}
   */
  static get _defOpts() {
    return {
      selfCls: 'js-height-fitter',
    };
  }

  /**
   * @param {Object} [opts]
   * @param {string} [opts.selfCls]
   */
  constructor(opts = {}) {
    const { selfCls } = Object.assign(HeightFitter._defOpts, opts);

    this._$$el = document.getElementsByClassName(selfCls);

    this._winHeight = 0;

    this._windowSizeObserver = WindowSizeObserver.getInstance();

    this._resizeEvt = EventObserver.getInstance().create(
      document,
      'resize',
      this.resize.bind(this),
    );
  }

  /**
   * @return {Instance}
   */
  on() {
    this._resizeEvt.add();
    return this;
  }

  /**
   * @return {Instance}
   */
  off() {
    this._resizeEvt.remove();
    return this;
  }

  /**
   * @return {Instance}
   */
  resize() {
    this._winHeight = this._windowSizeObserver.size.height;

    Array.from(this._$$el, $el => {
      $el.style.height = `${this._winHeight}px`;
      $el.dispatchEvent(new CustomEvent('heightResize'));
    });

    document.dispatchEvent(new CustomEvent('heightResize'));

    return this;
  }
}

export { HeightFitter as default };
