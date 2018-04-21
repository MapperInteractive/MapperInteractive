define(function (require) {

  const _ = require('underscore');
  const $ = require('jquery');
  let Backbone = require('backbone');

  return Backbone.View.extend({

    template: _.template('<button data-mode-name="<%= mode.name %>"' +
      ' class="viewer-graph__toolbar-item <%if (mode.activated) { %>active<% }%>" ' +
      ' title="<%= mode.label %>"><%= mode.label %></button>'),

    initialize: function () {
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
