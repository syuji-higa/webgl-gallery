import WebFont from 'webfontloader';
import { createEvent } from '../../../../modules/utility/event';

class TextCanvas {
  /**
   * @return {Object}
   */
  static get _defOpts() {
    return {
      canvasCls: 'js-text-canvas',
      fieldCls: 'js-text-canvas-field',
      fontFamily: 'Ubuntu',
      fontSize: 100,
    };
  }

  /**
   * @param {Object}
   * @property {Object} [opts]
   * @property {string} [opts.canvasCls]
   * @property {string} [opts.fieldCls]
   * @property {string} [opts.fontSize]
   */
  constructor(opts = {}) {
    const { canvasCls, fieldCls, fontFamily, fontSize } = Object.assign(
      TextCanvas._defOpts,
      opts,
    );

    this._$canvas = document.getElementsByClassName(canvasCls)[0];
    this._$field = document.getElementsByClassName(fieldCls)[0];

    this._ctx = this._$canvas.getContext('2d');

    this._fontFamily = fontFamily;
    this._fontSize = fontSize;
    this._width = this._$canvas.clientWidth;
    this._height = this._$canvas.clientHeight;

    this._ctx.fillStyle = 'rgb(255, 255, 255)';
    this._ctx.font = `${fontSize}px ${fontFamily}`;
    this._ctx.textAlign = 'center';

    this._inputEvt = createEvent(
      this._$field,
      'input',
      this._onInput.bind(this),
    );
  }

  /**
   * @return {Object}
   * @property {Element}
   */
  get canvas() {
    return this._$canvas;
  }

  /**
   * @return {Promise}
   */
  load() {
    return new Promise(resolve => {
      WebFont.load({
        google: {
          families: [this._fontFamily],
        },
        active: () => {
          this._setTexture();
          resolve();
        },
        inactive: resolve,
      });
    });
  }

  /**
   * @return {Instance}
   */
  on() {
    this._inputEvt.add();
    return this;
  }

  /**
   * @return {Instance}
   */
  off() {
    this._inputEvt.remove();
    return this;
  }

  _onInput() {
    this._setTexture();
    document.dispatchEvent(new Event('updateTextCanvas'));
  }

  _setTexture() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    const _txt = this._$field.value;
    this._ctx.fillText(
      _txt,
      this._width / 2,
      this._height / 2 + this._fontSize / 2,
    );
  }
}

export { TextCanvas as default };
