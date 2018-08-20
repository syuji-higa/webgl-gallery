import bowser from 'bowser';
import Singleton from '../pattern/singleton';
import EventObserver from '../observer/event-observer';
import { debounce } from '../utility/debounce';

class WindowSizeObserver extends Singleton {
  /**
   * @return {Array<number>} - int[0,inf)
   */
  get _breakPoint() {
    return [768, 1024];
  }

  constructor() {
    super();

    this._status = {
      type: '',
      width: 0,
      height: 0,
    };

    this._isMobileDevice = bowser.mobile || bowser.tablet;

    this._resizeDebounce = debounce(200);

    this._resizeEvt = EventObserver.getInstance().create(
      window,
      'resize',
      this._onResize.bind(this),
    );
  }

  /**
   * @return {Instance}
   */
  add() {
    this._resizeEvt.add();
    return this;
  }

  /**
   * @return {Instance}
   */
  remove() {
    this._resizeEvt.remove();
    return this;
  }

  /**
   * @return {Instance}
   */
  resize() {
    const { _status } = this;

    _status.width = window.innerWidth;
    _status.height = window.innerHeight;

    if (this._breakPoint[0] > _status.width) {
      if (_status.type !== 'sp') {
        _status.type = 'sp';
        this._dispatchEvent();
      }
    } else if (this._breakPoint[1] > _status.width) {
      if (_status.type !== 'tb') {
        _status.type = 'tb';
        this._dispatchEvent();
      }
    } else {
      if (_status.type !== 'pc') {
        _status.type = 'pc';
        this._dispatchEvent();
      }
    }

    document.dispatchEvent(new CustomEvent('resize'));

    return this;
  }

  /**
   * @param {string}
   */
  get type() {
    return this._status.type;
  }

  /**
   * @param {Object}
   * @property {number} width - float [0,inf)
   * @property {number} height - float [0,inf)
   */
  get size() {
    return {
      width: this._status.width,
      height: this._status.height,
    };
  }

  _onResize() {
    if (!this._isMobileDevice || this._status.width !== window.innerWidth) {
      this._resizeDebounce(this.resize.bind(this));
    }
  }

  _dispatchEvent() {
    document.dispatchEvent(new CustomEvent('typeChange'));
  }
}

export { WindowSizeObserver as default };
