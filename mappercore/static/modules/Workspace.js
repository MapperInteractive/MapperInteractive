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

    /**
     *
     * Config should includes
     *
     *
     * @param config object
     */
    initialize: function initialize(config) {
      this.config = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, config));

      // blank states, for end user only
      this._states = new Model({});

      this.willMount();
      this.setElement(guard(this.config.get('element'), '#root'));
      this.didMount();
    },
    getStates: function getStates() {
      return this._states;
    },
    willMount: function willMount() {},
    didMount: function didMount() {
      this.$el.append($(this.template));

      // init graph
      var graphConfig = _.extend(guard(this.config.get('graph'), {}), { el: '#workspace-graph', workspace: this });

      var sidebarConfig = { el: '#workspace-sidebar', workspace: this };

      this._graph = new Graph(graphConfig);
      this._sidebar = new Sidebar(sidebarConfig);
    },
    _composeGraphConfig: function _composeGraphConfig() {
      var defaults = guard(this.config.get('graph'), {});
      return _.extend(defaults, { el: '#workspace-graph', workspace: this });
    },
    getGraph: function getGraph() {
      return this._graph;
    },
    getSidebar: function getSidebar() {
      return this._sidebar;
    },


    /**
     * Call this method to generate the url for your workspace.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url: function url(path) {
      return [this.config.get('baseURL'), 'app', path].join('/');
    },
    render: function render() {
      this.getGraph().render();
      this.getSidebar().render();
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


    template: '<div class="row" style="margin-top: 20px;" id="workspace">' + '<div class="col-md-8 col-sm-12"><div id="workspace-graph"></div></div>' + '<div class="col-md-4 col-sm-12"><div id="workspace-sidebar"></div></div>' + '</div>'

  });
});