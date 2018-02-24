define(function (require) {

  const GraphMode = require('../mode');

  return class View extends GraphMode {

    constructor() {
      super();
      this.name = 'view';
      this.label = 'view the graph';
    }

    willMount() {
      super.willMount()
    }

  };
});
