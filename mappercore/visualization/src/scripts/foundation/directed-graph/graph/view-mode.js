define(function (require) {

  const Mode = require('./mode');

  class ViewMode extends Mode {

    destroy() {
      console.log('destroy');
    }
  }

  return ViewMode;
});
