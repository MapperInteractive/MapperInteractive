"use strict";

/**
 * Mapper class.
 *
 * Use this class to create a mapper instance.
 * This class will create a instance for graph and sidebar.
 */

define(function (require) {

  var Sidebar = require('./Sidebar');
  var Graph = require('./Graph');

  var _window = window,
      $ = _window.$,
      _ = _window._,
      guard = _window.guard,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model;


  return View.extend({
    initialize: function initialize(states) {
      this.config = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, states));

      this.willMount();
      this.setElement(guard(this.config.get('element'), '#root'));
      this.didMount();
    },
    hasOption: function hasOption(name) {
      return this.getOption(name) !== undefined;
    },
    getOption: function getOption(name) {
      return guard(this.config.get('options'), {})[name];
    },
    willMount: function willMount() {},
    didMount: function didMount() {
      this.$el.append($(this.template));
      this.graph = new Graph({ el: '#app-graph', app: this });
      this.sidebar = new Sidebar({ el: '#app-sidebar', app: this });
    },


    /**
     * Call this method to generate the url for your app.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url: function url(path) {
      return [this.config.get('baseURL'), 'app', path].join('/');
    },
    render: function render() {
      this.graph.render();
      this.sidebar.render();
    },
    serverSideFunction: function serverSideFunction(name, data, onData) {
      $.ajax({
        type: 'POST',
        url: this.url('call') + '/' + name,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json"
      }).done(function (res) {
        onData(res);
      });
    },


    template: '<div class="row" style="margin-top: 20px;" id="app">' + '<div class="col-md-8 col-sm-12"><div id="app-graph"></div></div>' + '<div class="col-md-4 col-sm-12"><div id="app-sidebar"></div></div>' + '</div>',

    addBlock: function addBlock(module) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return this.sidebar.addBlock(module, config);
    }
  });
});