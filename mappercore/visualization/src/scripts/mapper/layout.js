define(function (require) {

  let {View, Model} = require('backbone');
  let Panels = require('./panels');
  let Graph = require('./graph');
  let names = require('./names');

  /**
   * The layout control graph and attached panels.
   * It listen to all events from graph and pass them to panels.
   * Then panels react upon these events.
   * Panels have directed access to graph object.
   */

  return View.extend({

    LISTENED_GRAPH_EVENTS: [
      names.EVENT_GRAPH_WILL_LOAD,
      names.EVENT_GRAPH_DID_LOAD,
      names.EVENT_GRAPH_WILL_RENDER,
      names.EVENT_GRAPH_DID_RENDER,
      names.EVENT_GRAPH_CHANGE_SELECT,
    ],

    initialize: function () {
      this.states = new Model({});

      this.row = this.appendElement(this.el, '<div class="row" style="margin-top: 20px;"></div>');

      this.graphWrapper = this.appendElement(this.row, '<div class="col-md-8 col-sm-12"></div>');
      this.panelWrapper = this.appendElement(this.row, '<div class="col-md-4 col-sm-12"></div>');

      this.graph = new Graph({el: this.appendElement(this.graphWrapper)});
      this.panels = new Panels({el: this.panelWrapper, graph: this.graph});
    },

    render() {
      this.listenToGraph();
      this.graph.trigger(this.graph.EVENT_GRAPH_WILL_LOAD, 'sss');
      this.graph.render();
      this.panels.render();
    },

    listenToGraph() {
      this.LISTENED_GRAPH_EVENTS.map((eventName) => {
        this.listenTo(this.graph, eventName, () => {
          this.panels.trigger(eventName, this.graph);
        });
      });
    },

    appendElement(root, child = '<div></div>') {
      let el = $(child);
      el.appendTo(root);
      return el;
    },

  });
});
