"use strict";

/**
 * Create a set of graph UI elements include graph structure, toolbar and popovers.
 */
define((require) => {
  const { d3, _, $, b: { View, Model }, guard } = window;

  const Toolbar = require('./graph/Toolbar');
  const ToolsManager = require('./managers/Tools');
  const PluginsManager = require('./managers/Plugins');
  const ViewOnly = require('./graph/tools/ViewOnly');
  const Registry = require('./Registry');

  return View.extend({

    CLASS_NAME_VERTEX: 'viewer-graph__vertex',
    CLASS_NAME_EDGE: 'viewer-graph__edge',
    CLASS_NAME_SELECTED: '--selected',
    CLASS_NAME_UNAVAILABLE: '--unavailable',
    CLASS_NAME_CANDIDATE: '--candidate',
    EVENT_CLICK_LINK: 'click:link',
    EVENT_MOUSEOVER_LINK: 'mouseover:link',
    EVENT_MOUSEOUT_LINK: 'mouseout:link',
    EVENT_CLICK_NODE: 'click:node',
    EVENT_MOUSEOVER_NODE: 'mouseover:node',
    EVENT_MOUSEOUT_NODE: 'mouseout:node',
    EVENT_MOUSEENTER_NODE: 'mouseenter:node',
    EVENT_CHANGE_SELECTION: 'change:selection',
    EVENT_WILL_RENDER: 'willRender',
    EVENT_DID_RENDER: 'didRender',
    EVENT_WILL_LOAD: 'didLoad',
    EVENT_DID_LOAD: 'didLoad',
    EVENT_DID_LAYOUT: 'didLayout',
    EVENT_MODE_ACTIVATED: 'activate:mode',

    initialize: function (config) {

      this.config = new Model(_.extend({
        plugins: [],
        tools: [],
        selection: null,
      }, config));

      // init data container
      this._data = new Model({ links: [], nodes: [] });
      this._selection = new Model([]);

      // init links and nodes

      // init html
      this.$el.addClass('viewer-graph');

      // init toolbar
      this.toolbar = new Toolbar({ el: d3.select(this.el).append('div').classed('viewer-graph__toolbar', true).node() });
      this.toolbar.setGraph(this);

      // init graph container
      this.container = d3.select(this.el).append('div').classed('viewer-graph__graph', true).node();
      this.$container = $(this.container);

      // init tools and plugins
      this.tools = new ToolsManager(this);
      this.plugins = new PluginsManager(this);

      this._initExtensions();
      this._initEvents();
    },

    getWorkspace() {
      return this.config.get('workspace');
    },

    getData() {
      return this._data;
    },

    getSelection() {
      return this._selection;
    },

    getPlugins() {
      return this.plugins;
    },

    getTools() {
      return this.tools;
    },

    getLinks() {
      return this._links;
    },

    getNodes() {
      return this._nodes;
    },

    setGraphData(graph) {
      this.getData().set(graph);
    },

    render: function () {
      this.toolbar.render();

      let width = this.$container.width();
      let height = Math.max(this.$container.height(), 800);

      d3.select(this.container).html("");

      this.svg = d3.select(this.container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      let nodes = this.getData().get('nodes');

      if (!nodes || nodes.length === 0) {
        this._links = null;
        this._nodes = null;
        this.svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', 100)
          .attr('fill', 'gray')
          .attr('text-anchor', 'middle')
          .attr('font-size', 35)
          .text("no data");
        return;
      }

      this.trigger('willRender');
      this._links = this._renderLinks();
      this._nodes = this._renderNodes();
      this.trigger('didRender');
    },

    _initEvents() {
      this.getData().on('change', () => {
        this.tools.activate('view');
        this.render();
      });

      this.getData().on('change:selection', () => {
        this.trigger(this.EVENT_CHANGE_SELECTION);
      });
    },

    _renderNodes() {
      let nodesData = this.getData().get('nodes');
      return this.svg
        .selectAll("circle")
        .data(nodesData)
        .enter()
        .append("circle")
        .classed(this.CLASS_NAME_VERTEX, true)
        .on("click", () => {
          this.trigger(this.EVENT_CLICK_NODE, d3.event);
        })
        .on("mouseenter", () => {
          this.trigger(this.EVENT_MOUSEENTER_NODE, d3.event);
        })
        .on("mouseover", () => {
          this.trigger(this.EVENT_MOUSEOVER_NODE, d3.event);
        })
        .on("mouseout", () => {
          this.trigger(this.EVENT_MOUSEOUT_NODE, d3.event);
        });
    },

    _renderLinks() {
      let linksData = this.getData().get('links');
      return this.svg
        .append('g')
        .selectAll('line')
        .data(linksData)
        .enter()
        .append("line")
        .classed(this.CLASS_NAME_EDGE, true)
        .on("click", () => {
          this.trigger(this.EVENT_CLICK_LINK, d3.event);
        })
        .on("mouseover", () => {
          this.trigger(this.EVENT_MOUSEOVER_LINK, d3.event);
        })
        .on("mouseout", () => {
          this.trigger(this.EVENT_MOUSEOUT_LINK, d3.event);
        });
    },

    selectNode(id) {
      this.getNodes().filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, true);
      this.updateSelection();
    },

    selectNodeList(list) {
      list.map((id) => {
        this.getNodes().filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, true);
      });
      this.updateSelection();
    },

    unselectNode(id) {
      this.getNodes()
        .filter((d) => d['id'] === id)
        .classed(this.CLASS_NAME_SELECTED, false);
      this.updateSelection();
    },

    unselectNodeList(list) {
      list.map((id) => {
        this.getNodes().filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, false);
      });
      this.updateSelection();
    },

    isNodeSelected(id) {
      return this.getNodes().filter((d) => d['id'] === id)
        .classed(this.CLASS_NAME_SELECTED);
    },

    selectLink(targetEndPoints) {
      targetEndPoints = targetEndPoints.sort();

      this.getLinks().filter((d) => {
        let testEndPoints = [d['source']['id'], d['target']['id']].sort();
        return testEndPoints[0] === targetEndPoints[0] && testEndPoints[1] === targetEndPoints[1];
      }).classed(this.CLASS_NAME_SELECTED, true);
    },

    updateSelection() {
      let selection = this.svg.selectAll('circle.' + this.CLASS_NAME_SELECTED).data();
      this.config.set('selection', selection.map((n) => n['id']));
    },

    clearSelection() {
      this.getNodes().classed(this.CLASS_NAME_SELECTED, false);
      this.config.set('selection', []);
    },

    _initExtensions() {
      this._initCustomTools();
      this._initCustomPlugins();
    },

    _initCustomPlugins() {
      guard(this.config.get('plugins'), []).map((item) => {
        let Module = this._parseModule('plugins', item);
        this.plugins.add(new Module());
      });
    },

    _initCustomTools() {
      this.tools.add(new ViewOnly());
      guard(this.config.get('tools'), []).map((item) => {
        let Module = this._parseModule('tools', item);
        this.tools.add(new Module());
      });
      this.tools.activate('view');
    },

    _parseModule(category, name) {
      if ((typeof name) === 'string') {
        if (!Registry[category][name]) {
          throw "Unknown " + category + ': ' + name;
        }
        return Registry[category][name];
      } else {
        return name;
      }
    }

  });
});
