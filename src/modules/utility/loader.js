/**
 * loader
 */

/**
 * @param {string} src
 * @param {Object} [opts]
 * @param {funciton} [opts.done]
 * @param {funciton} [opts.fail]
 * @param {funciton} [opts.always]
 * @param {funciton} [opts.crossOrigin]
 * @return {Promise}
 */
export const imageLoader = (src, opts = {}) => {
  const { done, fail, always, crossOrigin } = opts;

  return new Promise(resolve => {
    const _img = new Image();

    if (crossOrigin) {
      _img.crossOrigin = crossOrigin;
    }

    const _always = img => {
      if (always) always(img);
      resolve(img);
    };

    _img.onload = () => {
      if (done) done(_img);
      _always(_img);
    };
    _img.onerror = () => {
      if (fail) fail(_img);
      _always(_img);
    };

    _img.src = src;
  });
};

/**
 * @param {string} file
 * @param {Object} [opts]
 * @param {funciton} [opts.done]
 * @param {funciton} [opts.fail]
 * @param {funciton} [opts.always]
 * @return {Promise}
 */
export const fileLoader = (file, opts = {}) => {
  const { done, fail, always } = opts;

  return new Promise(resolve => {
    const _reader = new FileReader();

    const _always = file_ => {
      if (always) always(file_);
      resolve(file);
    };

    _reader.onload = file_ => {
      if (done) done(file_);
      _always(file_);
    };
    _reader.onerror = file => {
      if (fail) fail(file_);
      _always(file_);
    };

    _reader.readAsDataURL(file);
  });
};
