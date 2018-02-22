define(function (require) {

  const App = require('app');
  const _ = require('underscore');
  const $ = require('jquery');


  return App.defineComponent({

    template: _.template('<label data-mode-name="<%= name %>" class="btn btn-secondary <%if (activated) { %>active<% }%>">' +
      '<input type="radio" name="<%= name %>" autocomplete="off" <%if (activated) { %>checked<% }%>>' +
      '<%= label %>' +
      '</label>'),


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
      this.$el.append('<div class="btn-group-vertical btn-group-toggle" data-toggle="buttons"></div>');
      let container = this.$('.btn-group-vertical');
      let modes = this.graph.modes;

      modes.map((mode, name) => {
        container.append(this.template({
          name: name,
          label: this.labels[name],
          activated: mode.activated
        }));
      });

      this.$('label').click((e) => {
        e.preventDefault();
        modes.activate($(e.target).data('mode-name'));
      });
    }

  });

});
