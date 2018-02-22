define(function (require) {
  let App = require('app');
  let d3 = App.d3;

  const Backbone = require('backbone');
  const NormalMode = require('./graph/modes/normal');

  const ModesHelper = require('./graph/helpers/modes');
  const BehaviorsHelper = require('./graph/helpers/behaviors');

  return App.defineComponent({

    initialize: function () {
      this.model = new (Backbone.Model.extend({
        defaults: {
          width: 800,
          height: 700,
          data: null,
          selected: null,
        }
      }))();

      this.modes = new ModesHelper(this);
      this.behaviors = new BehaviorsHelper(this);

      this.modes.add(new NormalMode());
      this.modes.activate('Normal');
    },

    render() {
      d3.select(this.el).html("");

      this.container = d3.select(this.el)
        .append('svg')
        .attr('width', this.model.get('width'))
        .attr('height', this.model.get('height'))
        .classed('base-graph', true);

      this.sendEvent('graph:willRender');
      this._renderLinks();
      this._renderNodes();
      this.sendEvent('graph:didRender');
    },

    _renderLinks() {
      this.links = this.container
        .selectAll("line")
        .data(this.model.get('data').links)
        .enter()
        .append("line")
        .classed('link', true)
        .on("click", () => {
          this.sendEvent('link:clicked', d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent('link:mouseover', d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent('link:mouseout', d3.event);
        });
    },

    _renderNodes() {
      this.nodes = this.container
        .selectAll("circle")
        .data(this.model.get("data").nodes)
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("fill", "#777")
        .on("click", () => {
          this.sendEvent('node:clicked', d3.event);
        })
        .on("mouseover", () => {
          this.sendEvent('node:mouseover', d3.event);
        })
        .on("mouseout", () => {
          this.sendEvent('node:mouseout', d3.event);
        });
    },

    sendEvent(name, context) {
      this.modes.trigger(name, context);
      this.behaviors.trigger(name, context);
    }
  });
});
