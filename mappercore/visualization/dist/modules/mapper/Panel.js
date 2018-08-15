"use strict";

/**
 * The base class for panel classes.
 */

define(function (require) {
  var _require = require('backbone'),
      View = _require.View,
      Model = _require.Model;

  return View.extend({

    initialize: function initialize(config) {
      this.model = new Model(config);

      // you can use the following shortcuts in your panel
      this.app = this.model.get('app');
      this.graph = this.app.graph;

      this.didMount();
    }

  });
});