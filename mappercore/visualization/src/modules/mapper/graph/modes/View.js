"use strict";

/**
 * A read only mode.
 */
define(function (require) {

  const Mode = require('../Mode');

  return class ViewMode extends Mode {

    initialize() {
      this.name = 'view';
      this.label = 'View';
    }

    didMount() {
      super.didMount();
      this.draggable = this.graph.behaviors.get('draggable');
    }

    willActivate() {
      super.willActivate();

      if (this.draggable) {
        this.draggable.resume();
      }
    }

    willDeactivate() {
      super.willDeactivate();

      if (this.draggable) {
        this.draggable.pause();
      }
    }
  };
});
