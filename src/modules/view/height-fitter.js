import EventObserver from '../observer/event-observer';
import ReizeObserver from '../observer/resize-observer';

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

    this._reizeObserver = ReizeObserver.getInstance();

    this._resizeEvt = EventObserver.getInstance().create(
      document,
      'resize',
      this.resize.bind(this),
    );
  }

  add() {
    this._resizeEvt.add();
  }

  remove() {
    this._resizeEvt.remove();
  }

  resize() {
    this._winHeight = this._reizeObserver.size.height;

    Array.from(this._$$el, $el => {
      $el.style.height = `${this._winHeight}px`;
      $el.dispatchEvent(new CustomEvent('heightResize'));
    });

    document.dispatchEvent(new CustomEvent('heightResize'));
  }
}

export { HeightFitter as default };
