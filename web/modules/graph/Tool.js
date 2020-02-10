"use strict";

/**
 * Base class for a graph mode.
 */
define(function () {

  const { _, b: { Events } } = window;

  return class Tool {

    constructor() {
      this.activated = false;
      this.events = _.extend({}, Events);

      // this.graph and this.workspace is available after mount
      this.graph = undefined;
      this.app = undefined;

      // please override method `initialize`
      // rather than `constructor` to set name and label
      this.name = undefined;
      this.label = undefined;

      this.initialize();
    }

    listenTo() {
      this.events.listenTo(...arguments);
    }

    stopListening() {
      this.events.stopListening();
    }

    // put your initialization codes here
    initialize() {
    }

    willMount() {
      if (!this.name || !this.label) {
        throw "A graph mode should have a name and a label.";
      }
      console.debug(`[${this.name}] willMount`);
    }

    didMount() {
      console.debug(`[${this.name}] didMount`);
    }

    willActivate() {
      console.debug(`[${this.name}] willActivate`);
    }

    didActivate() {
      this.activated = true;
      console.debug(`[${this.name}] didActivate`);
    }

    willDeactivate() {
      console.debug(`[${this.name}] willDeactivate`);
    }

    didDeactivate() {
      this.activated = false;
      console.debug(`[${this.name}] didDeactivate`);
    }
  };
});
