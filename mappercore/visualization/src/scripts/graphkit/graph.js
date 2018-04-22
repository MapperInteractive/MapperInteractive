define(function (require) {
  let d3 = require('d3');
  let $ = require('jquery');
  let Backbone = require('backbone');
  let Toolbar = require('./graph/toolbar');
  let ModesHelper = require('./graph/helpers/modes');
  let BehaviorsHelper = require('./graph/helpers/behaviors');

  let ViewMode = require('./graph/modes/view');
  let SelectClickMode = require('core/graphkit/graph/modes/select-click');
  let SelectClusterMode = require('core/graphkit/graph/modes/select-cluster');
  let SelectPathMode = require('core/graphkit/graph/modes/select-path');

  let ForceSimulation = require('core/graphkit/graph/behaviors/force-simulation');
  let Draggable = require('core/graphkit/graph/behaviors/draggable');
  let Labeled = require('core/graphkit/graph/behaviors/labeled');

  return Backbone.View.extend({

    CLASS_NAME_VERTEX: 'viewer-graph__vertex',
    CLASS_NAME_EDGE: 'viewer-graph__edge',
    CLASS_NAME_SELECTED: '--selected',
    CLASS_NAME_UNAVAILABLE: '--unavailable',
    CLASS_NAME_CANDIDATE: '--candidate',

    EVENT_LINK_CLICK: 'link:click',
    EVENT_LINK_MOUSEOVER: 'link:mouseover',
    EVENT_LINK_MOUSEOUT: 'link:mouseout',

    EVENT_NODE_CLICK: 'node:click',
    EVENT_NODE_MOUSEOVER: 'node:mouseover',
    EVENT_NODE_MOUSEOUT: 'node:mouseout',

    EVENT_GRAPH_WILL_RENDER: 'graph:willRender',
    EVENT_GRAPH_DID_RENDER: 'graph:didRender',

    EVENT_GRAPH_WILL_LOAD: 'graph:didLoad',
    EVENT_GRAPH_DID_LOAD: 'graph:didLoad',

    EVENT_GRAPH_CHANGE_SELECT: 'graph:change:select',

    initialize: function () {
      this.model = new Backbone.Model({
        width: 800,
        height: 700,
        data: null,
        selection: [],
      });

      this.$el.addClass('viewer-graph');

      this.toolbarWrapper = $('<div class="viewer-graph__toolbar"></div>');
      this.toolbarWrapper.appendTo(this.el);

      this.graphWrapper = $('<div class="viewer-graph__graph"></div>');
      this.graphWrapper.appendTo(this.el);

      this.toolbar = new Toolbar({el: this.toolbarWrapper});
      this.toolbar.setGraph(this);

      this.modes = new ModesHelper(this);
      this.behaviors = new BehaviorsHelper(this);

      this.modes.add(new ViewMode());

      this.modes.add(new SelectClickMode());
      this.modes.add(new SelectClusterMode());
      this.modes.add(new SelectPathMode());

      this.behaviors.add(new Draggable());
      this.behaviors.add(new ForceSimulation());
      this.behaviors.add(new Labeled());

      this.modes.activate('view');

      this.listenTo(this.model, 'change:data', () => {
        this.modes.activate('view');
        this.render();
      });

      this.listenTo(this.model, 'change:selection', () => {
        this.trigger(this.EVENT_GRAPH_CHANGE_SELECT);
      });
    },

    render: function () {
      this.toolbar.render();

      let width = this.$(this.graphWrapper).width();
      this.model.set('width', width);

      this.graphWrapper.html("");
      this.container = d3.select(this.graphWrapper.get(0))
        .append('svg')
        .attr('width', this.model.get('width'))
        .attr('height', this.model.get('height'));

      if (!this.model.get('data')) {
        this.container
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

      this.sendEvent(this.EVENT_GRAPH_WILL_RENDER);
      this._renderLinks();
      this._renderNodes();
      this.sendEvent(this.EVENT_GRAPH_DID_RENDER);
    },

    _renderNodes() {
      this.nodesContainer = this.container.append('g');
      this.nodes = this.nodesContainer
        .selectAll("circle")
        .data(this.model.get("data").nodes)
        .enter()
        .append("circle")
        .classed(this.CLASS_NAME_VERTEX, true)
        .on("click", () => {
          this.sendEvent(this.EVENT_NODE_CLICK, d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent(this.EVENT_NODE_MOUSEOVER, d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent(this.EVENT_NODE_MOUSEOUT, d3.event);
        });
    },

    _renderLinks() {
      this.links = this.container
        .append('g')
        .selectAll("line")
        .data(this.model.get('data').links)
        .enter()
        .append("line")
        .classed(this.CLASS_NAME_EDGE, true)
        .on("click", () => {
          this.sendEvent(this.EVENT_LINK_CLICK, d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent(this.EVENT_LINK_MOUSEOVER, d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent(this.EVENT_LINK_MOUSEOUT, d3.event);
        });
    },

    sendEvent(name, context) {
      this.behaviors.trigger(name, context);
      this.modes.trigger(name, context);
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
      let selection = this.nodesContainer.selectAll('.' + this.CLASS_NAME_SELECTED).data();
      this.model.set('selection', selection.map((n) => n['id']));
    },

    clearSelection() {
      this.nodes.classed(this.CLASS_NAME_SELECTED, false);
      this.model.set('selection', []);
    }

  });
});
