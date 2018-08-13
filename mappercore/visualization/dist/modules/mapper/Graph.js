"use strict";

/**
 * Create a set of graph UI elements include graph structure, toolbar and popovers.
 */

define(function (require) {
  var _require = require('core/Lib'),
      d3 = _require.d3,
      $ = _require.$,
      _ = _require._,
      _require$Backbone = _require.Backbone,
      View = _require$Backbone.View,
      Model = _require$Backbone.Model;

  var Toolbar = require('./graph/Toolbar');
  var ModesHelper = require('./graph/helpers/Modes');
  var BehaviorsHelper = require('./graph/helpers/Behaviors');
  var ViewMode = require('./graph/modes/View');
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
    CONFIG_ENABLE_MODES: 'enableModes',
    CONFIG_ENABLE_BEHAVIORS: 'enabledBehaviors',

    EVENT_MODE_ACTIVATED: 'activate:mode',

    initialize: function initialize(states) {
      this.model = new Model(_.extend({
        data: null,
        app: null,
        selection: null
      }, states));

      this.app = this.model.get('app');

      // init html
      this.$el.addClass('viewer-graph');

      // init toolbar
      this.toolbar = new Toolbar({ el: d3.select(this.el).append('div').classed('viewer-graph__toolbar', true).node() });
      this.toolbar.setGraph(this);

      // init graph container
      this.container = d3.select(this.el).append('div').classed('viewer-graph__graph', true).node();
      this.$container = $(this.container);

      // init modes & behaviors
      this.modes = new ModesHelper(this);
      this.behaviors = new BehaviorsHelper(this);

      // init customizations
      this.modes.add(new ViewMode());
      this._initConfig();
      this.modes.activate('view');

      this._initEvents();
    },

    loadData: function loadData(data) {
      this.model.set('data', data);
    },
    config: function config(name, value) {
      this._config.set(name, value);
    },


    render: function render() {
      this.toolbar.render();

      var width = this.$container.width();
      var height = Math.max(this.$container.height(), 800);

      d3.select(this.container).html("");

      this.svg = d3.select(this.container).append('svg').attr('width', width).attr('height', height);

      if (!this.model.get('data')) {
        this.svg.append('text').attr('x', width / 2).attr('y', 100).attr('fill', 'gray').attr('text-anchor', 'middle').attr('font-size', 35).text("no graph loaded yet");
        return;
      }

      this.links = null;
      this.nodes = null;

      this.trigger('willRender');
      this._renderLinks();
      this._renderNodes();
      this.trigger('didRender');
    },

    _initEvents: function _initEvents() {
      var _this = this;

      this.listenTo(this.model, 'change:data', function () {
        _this.modes.activate('view');
        _this.render();
      });

      this.listenTo(this.model, 'change:selection', function () {
        _this.trigger(_this.EVENT_CHANGE_SELECTION);
      });
    },
    _renderNodes: function _renderNodes() {
      var _this2 = this;

      this.nodes = this.svg.selectAll("circle").data(this.model.get("data").nodes).enter().append("circle").classed(this.CLASS_NAME_VERTEX, true).on("click", function () {
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

      this.links = this.svg.append('g').selectAll("line").data(this.model.get('data').links).enter().append("line").classed(this.CLASS_NAME_EDGE, true).on("click", function () {
        _this3.trigger(_this3.EVENT_CLICK_LINK, d3.event);
      }).on("mouseover", function () {
        _this3.trigger(_this3.EVENT_MOUSEOVER_LINK, d3.event);
      }).on("mouseout", function () {
        _this3.trigger(_this3.EVENT_MOUSEOUT_LINK, d3.event);
      });
    },
    selectNode: function selectNode(id) {
      this.nodes.filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED, true);
      this.updateSelection();
    },
    selectNodeList: function selectNodeList(list) {
      var _this4 = this;

      list.map(function (id) {
        _this4.nodes.filter(function (d) {
          return d['id'] === id;
        }).classed(_this4.CLASS_NAME_SELECTED, true);
      });
      this.updateSelection();
    },
    unselectNode: function unselectNode(id) {
      this.nodes.filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED, false);
      this.updateSelection();
    },
    unselectNodeList: function unselectNodeList(list) {
      var _this5 = this;

      list.map(function (id) {
        _this5.nodes.filter(function (d) {
          return d['id'] === id;
        }).classed(_this5.CLASS_NAME_SELECTED, false);
      });
      this.updateSelection();
    },
    isNodeSelected: function isNodeSelected(id) {
      return this.nodes.filter(function (d) {
        return d['id'] === id;
      }).classed(this.CLASS_NAME_SELECTED);
    },
    selectLink: function selectLink(targetEndPoints) {
      targetEndPoints = targetEndPoints.sort();

      this.links.filter(function (d) {
        var testEndPoints = [d['source']['id'], d['target']['id']].sort();
        return testEndPoints[0] === targetEndPoints[0] && testEndPoints[1] === targetEndPoints[1];
      }).classed(this.CLASS_NAME_SELECTED, true);
    },
    updateSelection: function updateSelection() {
      var selection = this.svg.selectAll('circle.' + this.CLASS_NAME_SELECTED).data();
      this.model.set('selection', selection.map(function (n) {
        return n['id'];
      }));
    },
    clearSelection: function clearSelection() {
      this.nodes.classed(this.CLASS_NAME_SELECTED, false);
      this.model.set('selection', []);
    },
    _initConfig: function _initConfig() {
      var _this6 = this;

      _.guard(this.app.model.get(this.CONFIG_ENABLE_BEHAVIORS), []).map(function (item) {
        var Module = _this6._parseScript('behaviors', item);
        _this6.behaviors.add(new Module());
      });

      _.guard(this.app.model.get(this.CONFIG_ENABLE_MODES), []).map(function (item) {
        var Module = _this6._parseScript('modes', item);
        _this6.modes.add(new Module());
      });
    },
    _parseScript: function _parseScript(category, name) {
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