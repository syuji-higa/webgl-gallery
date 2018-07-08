import Singleton from '../../../../modules/pattern/singleton';
import dat from 'dat.gui';

class DatGUI extends Singleton {
  constructor() {
    super();

    this._gui = new dat.GUI();
  }

  get gui() {
    return this._gui;
  }
}

export { DatGUI as default };
