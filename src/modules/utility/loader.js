/**
 * loader
 */

/**
 * @param {Element} $video
 * @return {Promise}
 */
export const loadVideo = $video => {
  return new Promise(resolve => {
    $video.load();
    $video.addEventListener(
      'canplaythrough',
      () => {
        resolve();
      },
      { once: true },
    );
  });
};

/**
 * @param {string} src
 * @param {Object} [opts]
 * @param {funciton} [opts.done]
 * @param {funciton} [opts.fail]
 * @param {funciton} [opts.always]
 * @return {Promise}
 */
export const loadImage = (src, opts = {}) => {
  const { done, fail, always } = opts;

  return new Promise(resolve => {
    const _img = new Image();

    const _always = (img, isSuccess) => {
      if (always) always(img);
      resolve(isSuccess);
    };

    _img.onload = () => {
      if (done) done(_img);
      _always(_img, true);
    };
    _img.onerror = () => {
      if (fail) fail(_img);
      _always(_img, false);
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
export const loadFile = (file, opts = {}) => {
  const { done, fail, always } = opts;

  return new Promise(resolve => {
    const _reader = new FileReader();

    const _always = (file_, isSuccess) => {
      if (always) always(file_);
      resolve(isSuccess);
    };

    _reader.onload = file_ => {
      if (done) done(file_);
      _always(file_, true);
    };
    _reader.onerror = file_ => {
      if (fail) fail(file_);
      _always(file_, false);
    };

    _reader.readAsDataURL(file);
  });
};
