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

  const { $, _, guard, b: { View, Model } } = window;

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
      const graphConfig = _.extend(
        guard(this.config.get('graph'), {}),
        { el: '#workspace-graph', workspace: this });

      const sidebarConfig = { el: '#workspace-sidebar', workspace: this };

      this._graph = new Graph(graphConfig);
      this._sidebar = new Sidebar(sidebarConfig);
    },

    _composeGraphConfig() {
      let defaults = guard(this.config.get('graph'), {});
      return _.extend(defaults, { el: '#workspace-graph', workspace: this });
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

    serverSideFunction(name, data, onData) {
      $.ajax({
        type: 'POST',
        url: `${this.url('call')}/${name}`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
      }).done((res) => {
        onData(res);
      });
    },


    template: '<div class="row" style="margin-top: 20px;" id="workspace">' +
      '<div class="col-md-8 col-sm-12"><div id="workspace-graph"></div></div>' +
      '<div class="col-md-4 col-sm-12"><div id="workspace-sidebar"></div></div>' +
      '</div>',

  });

});
