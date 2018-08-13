"use strict";

/**
 * Mapper class.
 *
 * Use this class to create a mapper instance.
 * This class will create a instance for graph and aside.
 */

define(function (require) {

  var App = require('./App');
  var Aside = require('./mapper/Aside');
  var Graph = require('./mapper/Graph');

  return App.extend({

    template: '<div class="row" style="margin-top: 20px;" id="app">' + '<div class="col-md-8 col-sm-12"><div id="app-graph"></div></div>' + '<div class="col-md-4 col-sm-12"><div id="app-aside"></div></div>' + '</div>',

    didMount: function didMount() {
      this.$el.append($(this.template));
      this.graph = new Graph({ el: '#app-graph', app: this });
      this.aside = new Aside({ el: '#app-aside', app: this });
    },
    render: function render() {
      this.graph.render();
      this.aside.render();
    },
    createPanel: function createPanel(module) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return this.aside.createPanel(module, config);
    }
  });
});