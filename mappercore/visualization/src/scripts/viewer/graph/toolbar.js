define(function (require) {

  const App = require('app');
  const _ = require('underscore');
  const $ = require('jquery');


  return App.defineComponent({

    template: _.template('<button data-mode-name="<%= mode.name %>"' +
      ' class="viewer-graph__toolbar-item viewer-graph__toolbar-item--<%= mode.name %> <%if (mode.activated) { %>active<% }%>" ' +
      ' title="<%= mode.label %>"></button>'),

    initialize: function () {
      this.labels = {
        'Normal': 'View',
        'SelectClickMode': 'Click Selection',
        'SelectClusterMode': 'Cluster Selection',
        'SelectPathMode': 'Path Selection'
      };
    },

    setGraph: function (graph) {
      this.graph = graph;
    },

    render: function () {
      this.$el.html("");

      let container = this.$el;
      let modes = this.graph.modes;

      modes.map((mode) => {
        container.append(this.template({mode: mode}));
      });

      this.$('button').click((e) => {
        this.$('button').removeClass('active');
        e.preventDefault();
        let target = $(e.target);
        modes.activate(target.data('mode-name'));
        target.addClass('active');
      });
    }

  });

});
