define(function (require) {
  let App = require('app');
  let d3 = App.d3;

  let _ = require('underscore');
  let Backbone = require('backbone');
  let NormalMode = require('./graph/modes/normal');

  let ModesHelper = require('./graph/helpers/modes');
  let BehaviorsHelper = require('./graph/helpers/behaviors');

  let Toolbar = require('./graph/toolbar');

  return App.defineComponent({

    template: _.template('<div class="viewer-graph__toolbar" id="<%= id %>--toolbar"></div>' +
      '<div class="viewer-graph__graph" id="<%= id %>--graph"></div>'),

    CLASS_NAME_VERTEX: 'viewer-graph__vertex',
    CLASS_NAME_EDGE: 'viewer-graph__edge',
    CLASS_NAME_SELECTED: '--selected',
    CLASS_NAME_UNAVAILABLE: '--unavailable',
    CLASS_NAME_CANDIDATE: '--candidate',

    initialize: function () {
      this.model = new (Backbone.Model.extend({
        defaults: {
          width: 800,
          height: 700,
          data: null,
          selected: null,
        }
      }))();

      this.$el.addClass('viewer-graph');

      let id = this.$el.attr('id');
      this.$el.html(this.template({id}));

      this.toolbarContainerId = `#${id}--toolbar`;
      this.graphContainerId = `#${id}--graph`;

      this.toolbar = new Toolbar({el: this.toolbarContainerId});
      this.toolbar.setGraph(this);

      this.modes = new ModesHelper(this);
      this.behaviors = new BehaviorsHelper(this);

      this.modes.add(new NormalMode());
      this.modes.activate('view');
    },


    render() {
      this.toolbar.render();

      this.model.set('width', this.$(this.graphContainerId).width());

      let id = this.$el.attr('id');

      d3.select(`#${id}--graph`).html("");
      this.container = d3.select(`#${id}--graph`)
        .append('svg')
        .attr('width', this.model.get('width'))
        .attr('height', this.model.get('height'));

      this.links = null;
      this.nodes = null;

      this.sendEvent('graph:willRender');
      this._renderLinks();
      this._renderNodes();
      this.sendEvent('graph:didRender');
    }
    ,

    _renderNodes() {
      this.nodesContainer = this.container.append('g');
      this.nodes = this.nodesContainer
        .selectAll("circle")
        .data(this.model.get("data").nodes)
        .enter()
        .append("circle")
        .classed(this.CLASS_NAME_VERTEX, true)
        .on("click", () => {
          this.sendEvent('node:click', d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent('node:mouseover', d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent('node:mouseout', d3.event);
        });
    }
    ,

    _renderLinks() {
      this.links = this.container
        .append('g')
        .selectAll("line")
        .data(this.model.get('data').links)
        .enter()
        .append("line")
        .classed(this.CLASS_NAME_EDGE, true)
        .on("click", () => {
          this.sendEvent('link:click', d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent('link:mouseover', d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent('link:mouseout', d3.event);
        });
    }
    ,

    sendEvent(name, context) {
      this.behaviors.trigger(name, context);
      this.modes.trigger(name, context);
    }
  })
    ;
});
