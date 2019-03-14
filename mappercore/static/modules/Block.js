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
      this.app = this.config.get('app');
      this.graph = this.app.graph;

      this.didMount();
    }

  });
});