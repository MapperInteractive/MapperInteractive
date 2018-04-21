define(function (require) {

  const GraphMode = require('../mode');

  return class View extends GraphMode {

    constructor() {
      super();
      this.name = 'view';
      this.label = 'View';
    }

    didMount() {
      super.didMount();
    }

    willActivate() {
      super.willActivate();

      let draggable = this.graph.behaviors.get('draggable');
      if (draggable) {
        draggable.resume();
      }
    }

    willDeactivate() {
      super.willDeactivate();

      let draggable = this.graph.behaviors.get('draggable');
      if (draggable) {
        draggable.pause();
      }
    }
  };
});
