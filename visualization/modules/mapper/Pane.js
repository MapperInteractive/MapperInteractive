"use strict";

/**
 * The base class for pane classes.
 */
define(function (require) {

  const { View, Model } = require('backbone');

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
