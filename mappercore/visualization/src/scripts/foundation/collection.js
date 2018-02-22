define(function () {

  return class ListenerCollection {

    constructor(graph, single = true) {
      this.single = single;
      this.graph = graph;
      this.mounted = {};
      this.activated = null;
    }

    add(mode) {
      mode.willMount();
      mode.setGraph(this.graph);
      this.mounted[mode.constructor.name] = mode;
      mode.didMount();
    }

    has(name) {
      return this.mounted.hasOwnProperty(name);
    }

    get(name) {
      if (this.mounted.hasOwnProperty(name)) {
        return this.mounted[name];
      }
    }

    activate(name) {
      if (this.activated) {
        if (this.activated.constructor.name === name) {
          return true;
        } else {
          this.activated.deactivate();
        }
      }
      let mode = this.get(name);
      mode.willActivate();
      this.activated = mode;
      this.activated.didActivate();
    }

    trigger(event, context) {
      if (!this.activated) {
        return false;
      }

      this.activated.trigger(event, context);
    }

  }

});
