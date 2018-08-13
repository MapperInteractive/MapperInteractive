"use strict";

/**
 * Create a set of graph UI elements include graph structure, toolbar and popovers.
 */
define(function (require) {
  let { d3, $, _, Backbone: { View, Model } } = require('core/Lib');

  let Toolbar = require('./graph/Toolbar');
  let ModesHelper = require('./graph/helpers/Modes');
  let BehaviorsHelper = require('./graph/helpers/Behaviors');
  let ViewMode = require('./graph/modes/View');
  let Registry = require('./Registry');


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

    initialize: function (states) {
      this.model = new Model(_.extend({
        data: null,
        app: null,
        selection: null,
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

    loadData(data) {
      this.model.set('data', data);
    },

    config(name, value) {
      this._config.set(name, value);
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

      if (!this.model.get('data')) {
        this.svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', 100)
          .attr('fill', 'gray')
          .attr('text-anchor', 'middle')
          .attr('font-size', 35)
          .text("no graph loaded yet");
        return;
      }

      this.links = null;
      this.nodes = null;

      this.trigger('willRender');
      this._renderLinks();
      this._renderNodes();
      this.trigger('didRender');
    },

    _initEvents() {
      this.listenTo(this.model, 'change:data', () => {
        this.modes.activate('view');
        this.render();
      });

      this.listenTo(this.model, 'change:selection', () => {
        this.trigger(this.EVENT_CHANGE_SELECTION);
      });
    },

    _renderNodes() {
      this.nodes = this.svg
        .selectAll("circle")
        .data(this.model.get("data").nodes)
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
      this.links = this.svg
        .append('g')
        .selectAll("line")
        .data(this.model.get('data').links)
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
      this.nodes.filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, true);
      this.updateSelection();
    },

    selectNodeList(list) {
      list.map((id) => {
        this.nodes.filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, true);
      });
      this.updateSelection();
    },

    unselectNode(id) {
      this.nodes
        .filter((d) => d['id'] === id)
        .classed(this.CLASS_NAME_SELECTED, false);
      this.updateSelection();
    },

    unselectNodeList(list) {
      list.map((id) => {
        this.nodes.filter((d) => d['id'] === id).classed(this.CLASS_NAME_SELECTED, false);
      });
      this.updateSelection();
    },

    isNodeSelected(id) {
      return this.nodes.filter((d) => d['id'] === id)
        .classed(this.CLASS_NAME_SELECTED);
    },

    selectLink(targetEndPoints) {
      targetEndPoints = targetEndPoints.sort();

      this.links.filter((d) => {
        let testEndPoints = [d['source']['id'], d['target']['id']].sort();
        return testEndPoints[0] === targetEndPoints[0] && testEndPoints[1] === targetEndPoints[1];
      }).classed(this.CLASS_NAME_SELECTED, true);
    },

    updateSelection() {
      let selection = this.svg.selectAll('circle.' + this.CLASS_NAME_SELECTED).data();
      this.model.set('selection', selection.map((n) => n['id']));
    },

    clearSelection() {
      this.nodes.classed(this.CLASS_NAME_SELECTED, false);
      this.model.set('selection', []);
    },

    _initConfig() {
      _.guard(this.app.model.get(this.CONFIG_ENABLE_BEHAVIORS), []).map((item) => {
        let Module = this._parseScript('behaviors', item);
        this.behaviors.add(new Module());
      });

      _.guard(this.app.model.get(this.CONFIG_ENABLE_MODES), []).map((item) => {
        let Module = this._parseScript('modes', item);
        this.modes.add(new Module());
      });
    },

    _parseScript(category, name) {
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
