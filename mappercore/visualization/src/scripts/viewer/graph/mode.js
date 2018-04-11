define(function (require) {

  const GraphListener = require('./listener');

  return class GraphMode extends GraphListener {

    constructor() {
      super();
      this.activated = false;
      this.name = false;
      this.label = false;
    }

    willMount() {
      if (!this.name || !this.label) {
        throw "A graph mode should have a name and a label.";
      }
    }

    didMount() {
    }

    willActivate() {
    }

    didActivate() {
      this.activated = true;
    }

    willDeactivate() {
    }

    didDeactivate() {
      this.activated = false;
    }
  }

});
