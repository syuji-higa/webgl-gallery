import bowser from 'bowser';
import EventObserver from '../observer/event-observer';

import { wait } from './wait';

const eventObserver = EventObserver.getInstance();

let _width = window.innerWidth;
let _height = window.innerHeight;

const onOrientationchange = async () => {
  if (window.innerWidth === window.innerHeight) return;

  await wait(100, () => {
    return _width !== window.innerWidth && _height !== window.innerHeight;
  });

  _width = window.innerWidth;
  _height = window.innerHeight;

  window.dispatchEvent(new CustomEvent('orientationresize'));
};

eventObserver.create(window, 'orientationchange', onOrientationchange).add();

/**
 * createResizeEvent
 */

/**
 * @param {function} listener
 * @param {boolean|Object} [opt]
 * @return {Object}
 * @property {functon} add
 * @property {functon} remove
 */
export const createResizeEvent = (listener, opt = false) => {
  const { mobile, tablet } = bowser;
  const _eventType = mobile || tablet ? 'orientationresize' : 'resize';

  return eventObserver.create(window, _eventType, listener, opt);
};
