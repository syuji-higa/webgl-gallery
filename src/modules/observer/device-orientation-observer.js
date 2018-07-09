import Singleton from '../pattern/singleton';
import EventObserver from './event-observer';
import { throttle } from '../utility/throttle';

class DeviceOrientationObserver extends Singleton {
  constructor() {
    super();

    this._status = {
      alpha: 0, // float[0,1]
      beta: 0, // float[-1,1]
      gamma: 0, // float[-1,1]
    };

    this._deviceorientationThrottle = throttle(100);

    this._deviceorientationEvt = EventObserver.getInstance().create(
      window,
      'deviceorientation',
      this._onDeviceorientation.bind(this),
    );

    this.add();
  }

  add() {
    this._deviceorientationEvt.add();
  }

  remove() {
    this._deviceorientationEvt.remove();
  }

  /**
   * @param {Object}
   * @property {number} alpha - float[0,1]
   * @property {number} beta - float[-1,1]
   * @property {number} gamma - float[-1,1]
   */
  get orientation() {
    return {
      alpha: this._status.alpha,
      beta: this._status.beta,
      gamma: this._status.gamma,
    };
  }

  /**
   * @param {Event} e
   */
  _onDeviceorientation(e) {
    this._deviceorientationThrottle(this._deviceorientationed.bind(this, e));
  }

  _deviceorientationed(e) {
    this._status.alpha = e.alpha / 360;
    this._status.beta = (e.beta - 45) / 90;
    this._status.gamma = e.gamma / 90;
  }
}

export { DeviceOrientationObserver as default };
