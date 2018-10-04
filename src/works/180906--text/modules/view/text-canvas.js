import WebFont from 'webfontloader';
import { getPosition } from '../../../../modules/model/coordinates';
import { createEvent } from '../../../../modules/utility/event';

class TextCanvas {
  /**
   * @return {Object}
   */
  static get _defOpts() {
    return {
      canvasCls: 'js-text-canvas',
      fieldCls: 'js-text-canvas-field',
      fontFamily: 'Anton',
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

    this._positions = []; // x, y
    this._colors = []; // r, g, b, a
    this._fontFamily = fontFamily;
    this._fontSize = fontSize;
    this._width = this._$canvas.clientWidth;
    this._height = this._$canvas.clientHeight;

    this._ctx.fillStyle = 'rgb(0, 0, 0)';
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
   * @property {Object}
   */
  get texture() {
    return this._texture;
  }

  /**
   * @return {Object}
   * @property {Array<number>}
   */
  get positions() {
    return this._positions;
  }

  /**
   * @return {Object}
   * @property {Array<number>}
   */
  get colors() {
    return this._colors;
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
    this._positions = [];
    this._colors = [];
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

    const _texture = this._ctx.getImageData(0, 0, this._width, this._height);

    this._setVertices(_texture.data, _texture.width, _texture.height);
  }

  /**
   *
   * @param {Uint8ClampedArray} data
   * @param {number} width - [0,inf)
   * @param {number} height - [0,inf)
   */
  _setVertices(data, width, height) {
    for (let i = 0; data.length > i; i += 4) {
      const _a = data[i + 3];
      if (_a === 0) continue;
      const _p = getPosition(width, i / 4);
      const _x = _p[0] / width;
      const _y = _p[1] / height;
      const _r = data[i];
      const _g = data[i + 1];
      const _b = data[i + 2];
      this._positions.push(_x, _y);
      this._colors.push(_r, _g, _b, _a);
    }
  }
}

export { TextCanvas as default };
