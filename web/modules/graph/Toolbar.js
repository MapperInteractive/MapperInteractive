"use strict";

/**
 * The toolbar above the graph structure on UI.
 */
define(function () {

  const { _, $, b: { View } } = window;

  return View.extend({

    template: _.template('<button data-mode-name="<%= mode.name %>"' +
      ' class="viewer-graph__toolbar-item btn disabled <%if (mode.activated) { %>active<% }%>" ' +
      ' title="<%= mode.label %>" disabled><%= mode.label %></button>'),

    initialize: function () {
    },

    setGraph: function (graph) {
      this.graph = graph;
    },

    render: function () {
      this.$el.html("");

      let container = this.$el;
      let modes = this.graph.tools;

      modes.map((mode) => {
        container.append(this.template({ mode: mode }));
      });

      this.$('button').click((e) => {
        this.$('button').removeClass('active');
        e.preventDefault();
        let target = $(e.target);
        modes.activate(target.data('mode-name'));
        target.addClass('active');
      });

      let graphData = this.graph.getData();

      this.listenTo(graphData, 'change', () => {

        let graph = graphData.attributes;
        let buttons = this.$('button');

        if (graph) {
          buttons.removeClass('disabled').attr('disabled', false);
        } else {
          buttons.addClass('disabled').attr('disabled', true);
        }
      });
    }

  });

});
