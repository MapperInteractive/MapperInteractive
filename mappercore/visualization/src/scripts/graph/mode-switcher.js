define(function (require) {

  const App = require('app');
  const _ = require('underscore');
  const $ = require('jquery');


  return App.defineComponent({

    template: _.template('<li data-mode-name="<%= mode.name %>"' +
      ' class="graph-mode-switcher__mode graph-mode-switcher__mode--<%= mode.name %> <%if (mode.activated) { %>active<% }%>" ' +
      ' title="<%= mode.label %>"></li>'),

    initialize: function () {
      this.labels = {
        'Normal': 'View',
        'SelectClickMode': 'Click Selection',
        'SelectClusterMode': 'Cluster Selection',
        'SelectPathMode': 'Path Selection'
      }
    },

    setGraph: function (graph) {
      this.graph = graph;
    },

    render: function () {
      this.$el.append('<ul class="graph-mode-switcher"></ul>');
      let container = this.$('ul');
      let modes = this.graph.modes;

      modes.map((mode) => {
        container.append(this.template({mode: mode}));
      });

      this.$('li').click((e) => {
        this.$('li').removeClass('active');
        e.preventDefault();
        let target = $(e.target);
        modes.activate(target.data('mode-name'));
        target.addClass('active');
      });
    }

  });

});
