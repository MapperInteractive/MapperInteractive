define(function (require) {

  let Base = require('./base');
  let Panels = require('./mapper/panels');
  let Graph = require('./mapper/graph');

  return Base.extend({

    template: '<div class="row" style="margin-top: 20px;" id="app">' +
    '<div class="col-md-8 col-sm-12"><div id="app-graph"></div></div>' +
    '<div class="col-md-4 col-sm-12"><div id="app-panels"></div></div>' +
    '</div>',

    didMount() {
      this.$el.append($(this.template));
      this.graph = new Graph({el: '#app-graph', app: this});
      this.panels = new Panels({el: '#app-panels', app: this});
    },

    render() {
      this.graph.render();
      this.panels.render();
    },

    appendElement(root, child) {
      let el = $(child);
      el.appendTo(root);
      return el;
    },
  });
});
