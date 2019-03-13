"use strict";

/**
 * Base class for a graph mode.
 */
define(function () {

  const { _, b: { Events } } = window;

  return class Mode {

    constructor() {
      this.activated = false;
      this.events = _.extend({}, Events);

      // this.graph and this.app is available after mount
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
      console.log(`[${this.name}] willMount`);
    }

    didMount() {
      console.log(`[${this.name}] didMount`);
    }

    willActivate() {
      console.log(`[${this.name}] willActivate`);
    }

    didActivate() {
      this.activated = true;
      console.log(`[${this.name}] didActivate`);
    }

    willDeactivate() {
      console.log(`[${this.name}] willDeactivate`);
    }

    didDeactivate() {
      this.activated = false;
      console.log(`[${this.name}] didDeactivate`);
    }
  };
});
