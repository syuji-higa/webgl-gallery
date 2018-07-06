/**
 * event
 */

/**
 * @param {Window|Element} target
 * @param {string} eventType
 * @param {function} listener
 * @param {boolean|Object} [opt]
 * @return {Object}
 */
export const createEvent = (target, eventType, listener, opt = false) => {
  return {
    handleEvent: e => {
      listener(e);
    },
    add: function() {
      target.addEventListener(eventType, this, opt);
    },
    remove: function() {
      target.removeEventListener(eventType, this, opt);
    },
  };
};

/**
 * @param {Array} opts
 * @param {Window|Element} opts[0] - dispatc target
 * @param {string} opts[1] - eventType
 * @param {Object} [opts[2]] - event detail
 * @param {Event} event
 *
 * @example
 *   onDispatchEvent.bind(this, [window, 'resize'], e);
 */
export const onDispatchEvent = (opts, event) => {
  const [target, eventType, detail] = opts;

  const _detail = (() => {
    const _obj = {
      status: event,
    };
    if (detail) Object.assign(_obj, detail);
    return _obj;
  })();

  target.dispatchEvent(
    new CustomEvent(eventType, {
      detail: _detail,
    }),
  );
};
