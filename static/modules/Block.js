"use strict";

/**
 * The base class for Block classes.
 */
define(function () {

  const { b: { View, Model } } = window;

  return View.extend({

    initialize: function (config) {
      this.model = new Model(config);

      // you can use the following shortcuts in your pane
      this.app = this.model.get('app');
      this.graph = this.app.graph;

      this.didMount();
    },

  });
});
