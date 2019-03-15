"use strict";

/**
 * Base class for a graph behavior.
 */
define(() => {

  const { _, b: { Events } } = window;

  return class Plugin {

    constructor() {
      this.paused = false;
      this.events = _.extend({}, Events);

      // this.graph and this.workspace is available after mount
      this.graph = undefined;
      this.app = undefined;

      // please override method `initialize`
      // rather than `constructor` to set name
      this.name = undefined;

      this.initialize();
    }

    initialize() {
    }

    willMount() {
    }

    didMount() {
    }

    listenTo() {
      this.events.listenTo(...arguments);
    }

    pause() {
      this.paused = true;
      console.log('[' + this.constructor.name + '] paused');
    }

    resume() {
      this.paused = false;
      console.log('[' + this.constructor.name + '] resume');
    }
  }
});
