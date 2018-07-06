import Singleton from '../pattern/singleton';
import EventObserver from '../observer/event-observer';
import { throttle } from '../utility/throttle';

class ScrollObserver extends Singleton {
  constructor() {
    super();

    this._status = {
      x: 0,
      y: 0,
    };

    this._scrollThrottle = throttle(200);

    this._scrollEvt = EventObserver.getInstance().create(
      window,
      'scroll',
      this._onScroll.bind(this),
    );

    this.add();
  }

  add() {
    this._scrollEvt.add();
  }

  remove() {
    this._scrollEvt.remove();
  }

  /**
   * @param {Object}
   * @property {number} x - float [0,inf)
   * @property {number} y - float [0,inf)
   */
  get offset() {
    return {
      x: this._status.x,
      y: this._status.y,
    };
  }

  /**
   * @param {Event} e
   */
  _onScroll(e) {
    this._scrollThrottle(this._scrolled.bind(this, e));
  }

  _scrolled() {
    this._status.x = window.pageXOffset;
    this._status.y = window.pageYOffset;
  }
}

export { ScrollObserver as default };
