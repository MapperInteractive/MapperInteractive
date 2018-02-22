define(function () {

  return class GraphListener {

    constructor() {
      this._listeningTo = {};
    }

    listenTo(name, fn) {
      if (!this._listeningTo.hasOwnProperty(name)) {
        this._listeningTo[name] = [];
      }
      this._listeningTo[name].push(fn);
    }

    trigger(name, context) {
      if (this._listeningTo.hasOwnProperty(name)) {
        this._listeningTo[name].map((fn) => {
          fn(context);
        })
      }
    }

    stopListening(event, fn) {
      if (fn === undefined) {
        if (event === undefined) {
          this._listeningTo = {};
        } else {
          delete this._listeningTo[event];
        }
      } else {
        // TODO
      }
    }

    setGraph(graph) {
      this.graph = graph;
    }
  }

});
