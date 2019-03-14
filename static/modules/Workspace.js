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

    initialize(states) {
      this.config = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, states));

      this.willMount();
      this.setElement(guard(this.config.get('element'), '#root'));
      this.didMount();
    },

    hasOption(name) {
      return this.getOption(name) !== undefined;
    },

    getOption(name) {
      return guard(this.config.get('options'), {})[name];
    },

    willMount() {
    },

    didMount() {
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
    url(path) {
      return [this.config.get('baseURL'), 'app', path].join('/');
    },

    render() {
      this.graph.render();
      this.sidebar.render();
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

    template: '<div class="row" style="margin-top: 20px;" id="app">' +
      '<div class="col-md-8 col-sm-12"><div id="app-graph"></div></div>' +
      '<div class="col-md-4 col-sm-12"><div id="app-sidebar"></div></div>' +
      '</div>',

    addBlock(module, config = {}) {
      return this.sidebar.addBlock(module, config);
    }
  });

});
