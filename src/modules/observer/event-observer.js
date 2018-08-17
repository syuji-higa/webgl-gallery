import Singleton from '../pattern/singleton';
import { createEvent } from '../utility/event';

class EventObserver extends Singleton {
  /**
   * @example
   *   import EventObserver from '../observer/event-observer';
   *   const eventObserver = EventObserver.getInstance();
   *   const listener = () => console.log('scrolled');
   *   const scrollEvt = eventObserver.create(window, 'scroll', listener);
   *   scrollEvt.add();
   */
  constructor() {
    super();

    this._events = [];
  }

  /**
   * @param {Element} target
   * @param {string} eventType
   * @param {function} listener
   * @param {boolean|Object} [opt]
   * @return {Object}
   * @property {functon} add
   * @property {functon} remove
   */
  create(target, eventType, listener, opt = false) {
    return {
      add: () => {
        this.add(target, eventType, listener, opt);
      },
      remove: () => {
        this.remove(target, eventType, listener);
      },
    };
  }

  /**
   * @param {Element} target
   * @param {string} eventType
   * @param {function} listener
   * @param {boolean|Object} [opt]
   * @return {Instance}
   */
  add(target, eventType, listener, opt = false) {
    let _hasEvent = false;

    for (const evt of this._events) {
      if (
        target === evt.target &&
        eventType === evt.eventType &&
        opt === evt.opt &&
        !evt.listeners.includes(listener)
      ) {
        evt.listeners.push(listener);
        _hasEvent = true;
        return;
      }
    }

    if (!_hasEvent) {
      const _listeners = [listener];
      this._events.push({
        target,
        eventType,
        opt,
        listeners: _listeners,
        event: this._addEvent(target, eventType, _listeners, opt),
      });
    }

    return this;
  }

  /**
   * @param {Element} target
   * @param {string} eventType
   * @param {function} listener
   * @return {Instance}
   */
  remove(target, eventType, listener) {
    this._events.forEach((evt, i) => {
      if (
        target === evt.target &&
        eventType === evt.eventType &&
        evt.listeners.includes(listener)
      ) {
        evt.listeners.splice(evt.listeners.indexOf(listener), 1);
        if (!evt.listeners.length) {
          this._removeEvent(i);
        }
        return;
      }
    });

    return this;
  }

  /**
   * @param {Element} target
   * @param {string} eventType
   * @param {Array<function>} listeners
   * @param {boolean|Object} opt
   * @return {Instance}
   */
  _addEvent(target, eventType, listeners, opt) {
    const _evt = createEvent(
      target,
      eventType,
      e => {
        for (const listener of listeners) {
          listener(e);
        }
      },
      opt,
    );
    _evt.add();
    return _evt;
  }

  /**
   * @param {number} index - int
   */
  _removeEvent(index) {
    this._events.splice(index, 1);
  }
}

export { EventObserver as default };
