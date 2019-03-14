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
      this.app = this.config.get('app');
      this.graph = this.app.graph;

      this.didMount();
    },

  });
});
