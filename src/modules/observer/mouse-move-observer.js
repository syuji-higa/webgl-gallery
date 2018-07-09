import Singleton from '../pattern/singleton';
import WindowSizeObserver from './window-size-observer';
import EventObserver from './event-observer';
import { throttle } from '../utility/throttle';

class MouseMoveObserver extends Singleton {
  constructor() {
    super();

    this._status = {
      x: 0,
      y: 0,
    };

    this._windowSizeObserver = WindowSizeObserver.getInstance();

    this._mousemoveThrottle = throttle(100);

    this._mousemoveEvt = EventObserver.getInstance().create(
      window,
      'mousemove',
      this._onMousemove.bind(this),
    );

    this.add();
  }

  add() {
    this._mousemoveEvt.add();
  }

  remove() {
    this._mousemoveEvt.remove();
  }

  /**
   * @param {Object}
   * @property {number} x - float [-1,1]
   * @property {number} y - float [-1,1]
   */
  get position() {
    return {
      x: this._status.x,
      y: this._status.y,
    };
  }

  /**
   * @param {Event} e
   */
  _onMousemove(e) {
    this._mousemoveThrottle(this._mousemoved.bind(this, e));
  }

  _mousemoved(e) {
    const { width, height } = this._windowSizeObserver.size;

    this._status.x = (e.pageX / width) * 2 - 1;
    this._status.y = (e.pageY / height) * 2 - 1;
  }
}

export { MouseMoveObserver as default };
