import bowser from 'bowser';
import EventObserver from '../observer/event-observer';

const { mobile, tablet } = bowser;

let _width = window.innerWidth;

const onResize = () => {
  if (!((mobile || tablet) && _width !== window.innerWidth)) {
    document.dispatchEvent(new CustomEvent('resize'));
  }
  _width = window.innerWidth;
};

EventObserver.getInstance()
  .create(window, 'resize', onResize)
  .add();
