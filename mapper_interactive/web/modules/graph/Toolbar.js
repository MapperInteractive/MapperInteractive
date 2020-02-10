"use strict";

/**
 * The toolbar above the graph structure on UI.
 */

define(function () {
  var _window = window,
      _ = _window._,
      $ = _window.$,
      View = _window.b.View;


  return View.extend({

    template: _.template('<button data-mode-name="<%= mode.name %>"' + ' class="viewer-graph__toolbar-item btn disabled <%if (mode.activated) { %>active<% }%>" ' + ' title="<%= mode.label %>" disabled><%= mode.label %></button>'),

    initialize: function initialize() {},

    setGraph: function setGraph(graph) {
      this.graph = graph;
    },

    render: function render() {
      var _this = this;

      this.$el.html("");

      var container = this.$el;
      var modes = this.graph.tools;

      modes.map(function (mode) {
        container.append(_this.template({ mode: mode }));
      });

      this.$('button').click(function (e) {
        _this.$('button').removeClass('active');
        e.preventDefault();
        var target = $(e.target);
        modes.activate(target.data('mode-name'));
        target.addClass('active');
      });

      var graphData = this.graph.getData();

      this.listenTo(graphData, 'change', function () {

        var graph = graphData.attributes;
        var buttons = _this.$('button');

        if (graph) {
          buttons.removeClass('disabled').attr('disabled', false);
        } else {
          buttons.addClass('disabled').attr('disabled', true);
        }
      });
    }

  });
});