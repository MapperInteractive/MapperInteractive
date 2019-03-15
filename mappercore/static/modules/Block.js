"use strict";

/**
 * The base class for Block classes.
 */

define(function () {
  var _window = window,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model;


  return View.extend({

    initialize: function initialize(config) {
      this.config = new Model(config);

      // you can use the following shortcuts in your block
      this.workspace = this.config.get('workspace');
      this.graph = this.workspace.getGraph();

      this.didMount();
    },

    setContent: function setContent(content) {
      this.$el.html(content);
    },
    getWorkspace: function getWorkspace() {
      return this.workspace;
    },
    getGraph: function getGraph() {
      return this.getWorkspace().getGraph();
    },
    append: function append(view) {
      var wrapperTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'div';

      var wrapper = $('<' + wrapperTag + '></' + wrapperTag + '>');
      wrapper.appendTo(this.$el);

      view.setElement(wrapper);
      view.render();
    }
  });
});