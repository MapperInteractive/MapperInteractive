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
  }

});
