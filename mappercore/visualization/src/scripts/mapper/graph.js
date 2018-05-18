define(function (require) {
  let d3 = require('d3');
  let $ = require('jquery');
  let {View, Model} = require('backbone');
  let Toolbar = require('./graph/toolbar');
  let ModesHelper = require('./graph/helpers/modes');
  let BehaviorsHelper = require('./graph/helpers/behaviors');
  let names = require('./names');
  let ViewMode = require('./graph/modes/view');
  let registry = require('./registry');


  return View.extend({

    // CLASS_NAME_VERTEX: 'viewer-graph__vertex',
    // CLASS_NAME_EDGE: 'viewer-graph__edge',
    // CLASS_NAME_SELECTED: '--selected',
    // CLASS_NAME_UNAVAILABLE: '--unavailable',
    // CLASS_NAME_CANDIDATE: '--candidate',
    //
    // EVENT_LINK_CLICK: 'link:click',
    // EVENT_LINK_MOUSEOVER: 'link:mouseover',
    // EVENT_LINK_MOUSEOUT: 'link:mouseout',
    //
    // EVENT_NODE_CLICK: 'node:click',
    // EVENT_NODE_MOUSEOVER: 'node:mouseover',
    // EVENT_NODE_MOUSEOUT: 'node:mouseout',
    // EVENT_NODE_MOUSEENTER: 'node:mouseenter',
    //
    // EVENT_GRAPH_WILL_RENDER: 'graph:willRender',
    // EVENT_GRAPH_DID_RENDER: 'graph:didRender',
    //
    // EVENT_GRAPH_WILL_LOAD: 'graph:didLoad',
    // EVENT_GRAPH_DID_LOAD: 'graph:didLoad',
    //
    // EVENT_GRAPH_CHANGE_SELECT: 'graph:change:select',
    //
    // EVENT_MIDDLEWARE_CHANGE: 'graph:change:middleware',
    // EVENT_MIDDLEWARE_CHANGE_PREFIX: 'graph:change:middleware:',
    //
    // EVENT_MODE_ACTIVATED: 'mode:activated',

    initialize: function (states) {
      this.states = new Model(_.extend({
        app: null,
        width: 800,
        height: 700,
        data: null,
        selection: [],
      }, states));

      this.app = this.states.get('app');

      // init html
      this.$el.addClass('viewer-graph');

      this.toolbarWrapper = $('<div class="viewer-graph__toolbar"></div>');
      this.toolbarWrapper.appendTo(this.el);

      this.graphWrapper = $('<div class="viewer-graph__graph"></div>');
      this.graphWrapper.appendTo(this.el);

      this.toolbar = new Toolbar({el: this.toolbarWrapper});
      this.toolbar.setGraph(this);

      // init modes & behaviors
      this.modes = new ModesHelper(this);
      this.behaviors = new BehaviorsHelper(this);

      // init customizations
      this.modes.add(new ViewMode());
      // this._initCustomizations();
      this.modes.activate('view');

      this._initEvents();
    },

    render: function () {
      this.toolbar.render();

      let width = this.$(this.graphWrapper).width();
      this.states.set('width', width);

      this.graphWrapper.html("");
      this.container = d3.select(this.graphWrapper.get(0))
        .append('svg')
        .attr('width', this.states.get('width'))
        .attr('height', this.states.get('height'));

      if (!this.states.get('data')) {
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

      this.trigger(names.EVENT_GRAPH_WILL_RENDER);
      this._renderLinks();
      this._renderNodes();
      this.trigger(names.EVENT_GRAPH_DID_RENDER);
    },

    _initEvents() {
      this.listenTo(this.states, 'change:data', () => {
        this.modes.activate('view');
        this.render();
      });

      this.listenTo(this.states, 'change:selection', () => {
        this.trigger(names.EVENT_GRAPH_CHANGE_SELECT);
      });
    },

    _renderNodes() {
      this.nodesContainer = this.container.append('g');
      this.nodes = this.nodesContainer
        .selectAll("circle")
        .data(this.states.get("data").nodes)
        .enter()
        .append("circle")
        .classed(names.CLASS_NAME_VERTEX, true)
        .on("click", () => {
          this.trigger(names.EVENT_NODE_CLICK, d3.event);
        })
        .on("mouseenter", () => {
          this.trigger(names.EVENT_NODE_MOUSEENTER, d3.event);
        })
        .on("mouseover", () => {
          this.trigger(names.EVENT_NODE_MOUSEOVER, d3.event);
        })
        .on("mouseout", () => {
          this.trigger(names.EVENT_NODE_MOUSEOUT, d3.event);
        });
    },

    _renderLinks() {
      this.links = this.container
        .append('g')
        .selectAll("line")
        .data(this.states.get('data').links)
        .enter()
        .append("line")
        .classed(names.CLASS_NAME_EDGE, true)
        .on("click", () => {
          this.trigger(names.EVENT_LINK_CLICK, d3.event);
        })
        .on("mouseover", () => {
          this.trigger(names.EVENT_LINK_MOUSEOVER, d3.event);
        })
        .on("mouseout", () => {
          this.trigger(names.EVENT_LINK_MOUSEOUT, d3.event);
        });
    },

    selectNode(id) {
      this.nodes.filter((d) => d['id'] === id).classed(names.CLASS_NAME_SELECTED, true);
      this.updateSelection();
    },

    selectNodeList(list) {
      list.map((id) => {
        this.nodes.filter((d) => d['id'] === id).classed(names.CLASS_NAME_SELECTED, true);
      });
      this.updateSelection();
    },

    unselectNode(id) {
      this.nodes
        .filter((d) => d['id'] === id)
        .classed(names.CLASS_NAME_SELECTED, false);
      this.updateSelection();
    },

    unselectNodeList(list) {
      list.map((id) => {
        this.nodes.filter((d) => d['id'] === id).classed(names.CLASS_NAME_SELECTED, false);
      });
      this.updateSelection();
    },

    isNodeSelected(id) {
      return this.nodes.filter((d) => d['id'] === id)
        .classed(names.CLASS_NAME_SELECTED);
    },

    selectLink(targetEndPoints) {
      targetEndPoints = targetEndPoints.sort();

      this.links.filter((d) => {
        let testEndPoints = [d['source']['id'], d['target']['id']].sort();
        return testEndPoints[0] === targetEndPoints[0] && testEndPoints[1] === targetEndPoints[1];
      }).classed(names.CLASS_NAME_SELECTED, true);
    },

    updateSelection() {
      let selection = this.nodesContainer.selectAll('.' + names.CLASS_NAME_SELECTED).data();
      this.states.set('selection', selection.map((n) => n['id']));
    },

    clearSelection() {
      this.nodes.classed(names.CLASS_NAME_SELECTED, false);
      this.states.set('selection', []);
    },

    _initCustomizations() {
      this.app
        .customize(names.MIDDLEWARE_GRAPH_ENABLE_MODES)
        .fallback([])
        .invoke()
        .map((m) => {
          let Script = this._parseScript('modes', m);
          this.modes.add(new Script());
        });

      this.app
        .customize(names.MIDDLEWARE_GRAPH_ENABLE_BEHAVIORS)
        .fallback([])
        .invoke((b) => {
          let Script = this._parseScript('behaviors', b);
          this.behaviors.add(new Script());
        });
    },

    _parseScript(category, name) {
      if ((typeof name) === 'string') {
        if (!registry[category][name]) {
          throw "Unknown " + category + ': ' + name;
        }
        return registry['modes'][name];
      } else {
        return name;
      }
    }

  });
});
