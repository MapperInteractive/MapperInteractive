"use strict";

/**
 * The base class for Block classes.
 */
define(function () {

  const { b: { View, Model } } = window;


  return View.extend({

    initialize: function (config) {
      this.config = new Model(config);

      // you can use the following shortcuts in your block
      this.workspace = this.config.get('workspace');
      this.graph = this.workspace.getGraph();

      this.didMount();
    },

    setContent(content) {
      this.$el.html(content);
    },

    getWorkspace() {
      return this.workspace;
    },

    getGraph() {
      return this.getWorkspace().getGraph();
    },

    append(view, wrapperTag = 'div') {
      let wrapper = $(`<${wrapperTag}></${wrapperTag}>`);
      wrapper.appendTo(this.$el);

      view.setElement(wrapper);
      view.render();
    }

  });
});
