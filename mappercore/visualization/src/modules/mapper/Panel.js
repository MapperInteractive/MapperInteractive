"use strict";

/**
 * The base class for panel classes.
 */
define(function (require) {

  let { Backbone: { Model, View } } = require('core/Lib');

  return View.extend({

    initialize: function (config) {
      this.model = new Model(config);

      // you can use the following shortcuts in your panel
      this.app = this.model.get('app');
      this.graph = this.app.graph;

      this.didMount();
    },

  });
});
