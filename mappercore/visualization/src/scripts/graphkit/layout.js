define(function (require) {

  let Backbone = require('backbone');
  let Panels = require('./panels');
  let Graph = require('core/graphkit/graph');

  return Backbone.View.extend({

    LISTENED_GRAPH_EVENTS: [
      Graph.EVENT_GRAPH_WILL_LOAD,
      Graph.EVENT_GRAPH_DID_LOAD,
      Graph.EVENT_GRAPH_WILL_RENDER,
      Graph.EVENT_GRAPH_DID_RENDER,
      Graph.EVENT_GRAPH_CHANGE_SELECT,
    ],

    initialize: function () {
      this.model = new Backbone.Model({
        'graph': []
      });

      this.row = this.appendElement(this.el, '<div class="row" style="margin-top: 20px;"></div>');

      this.graphWrapper = this.appendElement(this.row, '<div class="col-md-8 col-sm-12"></div>');
      this.panelWrapper = this.appendElement(this.row, '<div class="col-md-4 col-sm-12"></div>');

      this.graph = new Graph({el: this.appendElement(this.graphWrapper)});
      this.panels = new Panels({el: this.appendElement(this.panelWrapper)});
    },

    render() {
      this.startListening();
      this.graph.trigger(this.graph.EVENT_GRAPH_WILL_LOAD, 'sss');
      this.graph.render();
      this.panels.render();
    },

    startListening() {
      this.LISTENED_GRAPH_EVENTS.map((eventName) => {
        this.graph.on(eventName, () => {
          this.panels.trigger(eventName, this.graph);
        });
      });

      this.panels.on('LOADER:WILL_REQUEST', (...args) => {
        console.log(['LOADER:WILL_REQUEST', args]);
      });

      this.panels.on('LOADER:DATA', (data) => {
        this.graph.model.set('data', data);
      });
    },

    appendElement(root, child = '<div></div>') {
      let el = $(child);
      el.appendTo(root);
      return el;
    },

  });
});
