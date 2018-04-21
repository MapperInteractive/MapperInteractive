define(function (require) {

  const GraphListener = require('./listener');

  class GraphBehavior extends GraphListener {

    constructor() {
      super();
      this.paused = false;
    }

    willMount() {
    }

    didMount() {
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

  return GraphBehavior;
});
