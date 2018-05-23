define(function (require) {

  let App = require('./app');
  let Aside = require('./mapper/aside');
  let Graph = require('./mapper/graph');

  return App.extend({

    template: '<div class="row" style="margin-top: 20px;" id="app">' +
    '<div class="col-md-8 col-sm-12"><div id="app-graph"></div></div>' +
    '<div class="col-md-4 col-sm-12"><div id="app-aside"></div></div>' +
    '</div>',

    didMount() {
      this.$el.append($(this.template));
      this.graph = new Graph({el: '#app-graph', app: this});
      this.aside = new Aside({el: '#app-aside', app: this});
    },

    render() {
      this.graph.render();
      this.aside.render();
    },

    createPanel(config) {
      return this.aside.createPanel(config);
    }
  });
});
