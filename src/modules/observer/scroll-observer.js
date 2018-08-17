import Singleton from '../pattern/singleton';
import EventObserver from './event-observer';
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

    this.add().scrolled();
  }

  /**
   * @return {Instance}
   */
  add() {
    this._scrollEvt.add();
    return this;
  }

  /**
   * @return {Instance}
   */
  remove() {
    this._scrollEvt.remove();
    return this;
  }

  /**
   * @return {Instance}
   */
  scrolled() {
    this._status.x = window.pageXOffset;
    this._status.y = window.pageYOffset;
    return this;
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

  _onScroll() {
    this._scrollThrottle(this.scrolled.bind(this));
  }
}

export { ScrollObserver as default };
