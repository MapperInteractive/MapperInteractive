define(function (require) {

  let Backbone = require('backbone');
  let Panels = require('./panels');
  let Graph = require('core/graphkit/graph');

  /**
   * The layout control graph and attached panels.
   * It listen to all events from graph and pass them to panels.
   * Then panels react upon these events.
   * Panels have directed access to graph object.
   */

  return Backbone.View.extend({

    LISTENED_GRAPH_EVENTS: [
      Graph.EVENT_GRAPH_WILL_LOAD,
      Graph.EVENT_GRAPH_DID_LOAD,
      Graph.EVENT_GRAPH_WILL_RENDER,
      Graph.EVENT_GRAPH_DID_RENDER,
      Graph.EVENT_GRAPH_CHANGE_SELECT,
    ],

    initialize: function () {
      this.model = new Backbone.Model({});

      this.row = this.appendElement(this.el, '<div class="row" style="margin-top: 20px;"></div>');

      this.graphWrapper = this.appendElement(this.row, '<div class="col-md-8 col-sm-12"></div>');
      this.panelWrapper = this.appendElement(this.row, '<div class="col-md-4 col-sm-12"></div>');

      this.graph = new Graph({el: this.appendElement(this.graphWrapper)});
      this.panels = new Panels({el: this.panelWrapper, graph: this.graph});
    },

    render() {
      this.startListening();
      this.graph.trigger(this.graph.EVENT_GRAPH_WILL_LOAD, 'sss');
      this.graph.render();
      this.panels.render();
    },

    startListening() {
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
