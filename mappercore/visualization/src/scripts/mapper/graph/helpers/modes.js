define(function (require) {

  const MountableHelper = require('./mountable');

  return class ModesHelper extends MountableHelper {

    init() {
      this.activated = null;
    }

    activate(name) {
      if (this.activated) {
        if (this.activated.name === name) {
          return true;
        } else {
          this.activated.willDeactivate();
          this.activated.didDeactivate();
        }
      }
      let mode = this.get(name);
      mode.willActivate();
      this.activated = mode;
      this.activated.didActivate();
      this.graph.trigger(this.graph.EVENT_MODE_ACTIVATED, name);
    }

    trigger(event, context) {
      if (!this.activated) {
        return false;
      }

      this.activated.trigger(event, context);
    }

  }

});
