define(function (require) {

  const GraphListener = require('./listener');

  return class GraphMode extends GraphListener {

    constructor() {
      super();
      this.activated = false;
    }

    willMount() {
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
