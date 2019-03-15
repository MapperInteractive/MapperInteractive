"use strict";

/**
 * Create a set of graph UI elements include graph structure, toolbar and popovers.
 */

define(function (require) {
  var _window = window,
      d3 = _window.d3,
      _ = _window._,
      $ = _window.$,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model,
      guard = _window.guard;


  var Toolbar = require('./graph/Toolbar');
  var ToolsManager = require('./graph/managers/Tools');
  var PluginsManager = require('./graph/managers/Plugins');
  var ViewOnly = require('./graph/tools/ViewOnly');
  var Registry = require('./Registry');

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

    initialize: function initialize(config) {

      this.config = new Model(_.extend({
        plugins: [],
        tools: [],
        selection: null
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

    getWorkspace: function getWorkspace() {
      return this.config.get('workspace');
    },
    getData: function getData() {
      return this._data;
    },
    getSelection: function getSelection() {
      return this._selection;
    },
    getPlugins: function getPlugins() {
      return this.plugins;
    },
    getTools: function getTools() {
      return this.tools;
    },
    getLinks: function getLinks() {
      return this._links;
    },
    getNodes: function getNodes() {
      return this._nodes;
    },
    setGraphData: function setGraphData(graph) {
      this.getData().set(graph);
    },


    render: function render() {
      this.toolbar.render();

      var width = this.$container.width();
      var height = Math.max(this.$container.height(), 800);

      d3.select(this.container).html("");

      this.svg = d3.select(this.container).append('svg').attr('width', width).attr('height', height);

      var nodes = this.getData().get('nodes');

      if (!nodes || nodes.length === 0) {
        this._links = null;
        this._nodes = null;
        this.svg.append('text').attr('x', width / 2).attr('y', 100).attr('fill', 'gray').attr('text-anchor', 'middle').attr('font-size', 35).text("no data");
        return;
      }

      this.trigger('willRender');
      this._links = this._renderLinks();
      this._nodes = this._renderNodes();
      this.trigger('didRender');
    },

    _initEvents: function _initEvents() {
      var _this = this;

      this.getData().on('change', function () {
        _this.tools.activate('view');
        _this.render();
      });

      this.getData().on('change:selection', function () {
        _this.trigger(_this.EVENT_CHANGE_SELECTION);
      });
    },
    _renderNodes: function _renderNodes() {
      var _this2 = this;

      var nodesData = this.getData().get('nodes');
      return this.svg.selectAll("circle").data(nodesData).enter().append("circle").classed(this.CLASS_NAME_VERTEX, true).on("click", function () {
        _this2.trigger(_this2.EVENT_CLICK_NODE, d3.event);
      }).on("mouseenter", function () {
        _this2.trigger(_this2.EVENT_MOUSEENTER_NODE, d3.event);
      }).on("mouseover", function () {
        _this2.trigger(_this2.EVENT_MOUSEOVER_NODE, d3.event);
      }).on("mouseout", function () {
        _this2.trigger(_this2.EVENT_MOUSEOUT_NODE, d3.event);
      });
    },
    _renderLinks: function _renderLinks() {
      var _this3 = this;

      var linksData = this.getData().get('links');
      return this.svg.append('g').selectAll('line').data(linksData).enter().append("line").classed(this.CLASS_NAME_EDGE, true).on("click", function () {
        _this3.trigger(_this3.EVENT_CLICK_LINK, d3.event);
      }).on("mouseover", function () {
        _this3.trigger(_this3.EVENT_MOUSEOVER_LINK, d3.event);
      }).on("mouseout", function () {
        _this3.trigger(_this3.EVENT_MOUSEOUT_LINK, d3.event);
      });
    },
    selectNode: function selectNode(id) {
      this.getNodes().filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED, true);
      this.updateSelection();
    },
    selectNodeList: function selectNodeList(list) {
      var _this4 = this;

      list.map(function (id) {
        _this4.getNodes().filter(function (d) {
          return d['id'] === id;
        }).classed(_this4.CLASS_NAME_SELECTED, true);
      });
      this.updateSelection();
    },
    unselectNode: function unselectNode(id) {
      this.getNodes().filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED, false);
      this.updateSelection();
    },
    unselectNodeList: function unselectNodeList(list) {
      var _this5 = this;

      list.map(function (id) {
        _this5.getNodes().filter(function (d) {
          return d['id'] === id;
        }).classed(_this5.CLASS_NAME_SELECTED, false);
      });
      this.updateSelection();
    },
    isNodeSelected: function isNodeSelected(id) {
      return this.getNodes().filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED);
    },
    selectLink: function selectLink(targetEndPoints) {
      targetEndPoints = targetEndPoints.sort();

      this.getLinks().filter(function (d) {
        var testEndPoints = [d['source']['id'], d['target']['id']].sort();
        return testEndPoints[0] === targetEndPoints[0] && testEndPoints[1] === targetEndPoints[1];
      }).classed(this.CLASS_NAME_SELECTED, true);
    },
    updateSelection: function updateSelection() {
      var selection = this.svg.selectAll('circle.' + this.CLASS_NAME_SELECTED).data();
      this.config.set('selection', selection.map(function (n) {
        return n['id'];
      }));
    },
    clearSelection: function clearSelection() {
      this.getNodes().classed(this.CLASS_NAME_SELECTED, false);
      this.config.set('selection', []);
    },
    _initExtensions: function _initExtensions() {
      this._initCustomTools();
      this._initCustomPlugins();
    },
    _initCustomPlugins: function _initCustomPlugins() {
      var _this6 = this;

      guard(this.config.get('plugins'), []).map(function (item) {
        var Module = _this6._parseModule('plugins', item);
        _this6.plugins.add(new Module());
      });
    },
    _initCustomTools: function _initCustomTools() {
      var _this7 = this;

      this.tools.add(new ViewOnly());
      guard(this.config.get('tools'), []).map(function (item) {
        var Module = _this7._parseModule('tools', item);
        _this7.tools.add(new Module());
      });
      this.tools.activate('view');
    },
    _parseModule: function _parseModule(category, name) {
      if (typeof name === 'string') {
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