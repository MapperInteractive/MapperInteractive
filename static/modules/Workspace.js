"use strict";

/**
 * Mapper class.
 *
 * Use this class to create a mapper instance.
 * This class will create a instance for graph and sidebar.
 */
define((require) => {

  const Sidebar = require('./Sidebar');
  const Graph = require('./Graph');

  const { $, _, d3, guard, b: { View, Model } } = window;

  return View.extend({

    /**
     *
     * Config should includes
     *
     *
     * @param config object
     */
    initialize(config) {
      this.config = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper',
      }, config));

      // bind workspace instance to window object
      window.workspace = this;

      // blank states, for end user only
      this._states = new Model({});

      this.willMount();
      this.setElement(guard(this.config.get('element'), '#root'));
      this.didMount();
    },

    getStates() {
      return this._states;
    },

    willMount() {
    },

    didMount() {
      this.$el.append($(this.template));

      // init graph
      const graphConfig = this._composeGraphConfig()
      const sidebarConfig = this._composeSidebarConfig()

      this._graph = new Graph(graphConfig);
      this._sidebar = new Sidebar(sidebarConfig);
    },

    _composeGraphConfig() {
      let defaults = guard(this.config.get('graph'), {});
      return _.extend(defaults, {
        el: '#workspace-graph',
        workspace: this
      });
    },

    _composeSidebarConfig() {
      let defaults = guard(this.config.get('blocks'), {});

      return _.extend(defaults, {
        el: '#workspace-sidebar',
        workspace: this
      });
    },

    getGraph() {
      return this._graph;
    },

    getSidebar() {
      return this._sidebar;
    },

    /**
     * Call this method to generate the url for your workspace.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url(path) {
      return [this.config.get('baseURL'), 'app', path].join('/');
    },

    render() {
      this.getGraph().render();
      this.getSidebar().render();
    },

    call(name, params) {
      const method = 'POST';
      const url = `${this.url('call')}/${name}`;
      const data = JSON.stringify(params);
      const contentType = "application/json; charset=utf-8";
      return $.ajax({
        method,
        url,
        data,
        contentType,
        dataType: "json"
      })
    },


    template: '<div class="row" style="margin-top: 20px;" id="workspace">' +
      '<div class="col-md-8 col-sm-12"><div id="workspace-graph"></div></div>' +
      '<div class="col-md-4 col-sm-12"><div id="workspace-sidebar"></div></div>' +
      '</div>',

  });

});
