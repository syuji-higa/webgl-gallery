class Singleton {
  /**
   * @type {Object}
   */
  static _instance = {};

  /**
   * @type {Object}
   */
  static _isInternal = {};

  /**
   * @return {Instance}
   */
  static getInstance() {
    const _name = this.name;
    if (Singleton._instance[_name]) {
      return Singleton._instance[_name];
    }
    Singleton._isInternal[_name] = true;
    return new this();
  }

  constructor() {
    const _name = this.constructor.name;
    if (!Singleton._isInternal[_name]) {
      throw new Error(
        `Can't call new ${_name}(), use ${_name}.getInstance() instead.`,
      );
    }
    Singleton._isInternal[_name] = false;
    Singleton._instance[_name] = this;
  }
}

export { Singleton as default };
