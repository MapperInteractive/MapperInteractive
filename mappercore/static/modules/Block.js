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
      this.model = new Model(config);

      // you can use the following shortcuts in your pane
      this.app = this.model.get('app');
      this.graph = this.app.graph;

      this.didMount();
    }

  });
});