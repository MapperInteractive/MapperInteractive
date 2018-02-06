define(function (require) {
  var Backbone = require('backbone');
  var d3 = require('d3');
  var ViewModel = Backbone.Model.extend();
  var ForceSimulation = require('./directed-graph/force-simulation');

  return Backbone.View.extend({

    behaviors: {},
    defaultBehaviors: [
      new ForceSimulation()
    ],
    customBehaviors: [],

    initialize: function () {
      this.model = new ViewModel({
        width: 800,
        height: 700,
        graph: null
      });

      this.container = d3.select(this.el)
        .append('svg')
        .attr('width', this.model.get('width'))
        .attr('height', this.model.get('height'))
        .classed('directed-graph', true);

      this.defaultBehaviors
        .concat(this.customBehaviors)
        .map(function (br) {
          this.addBehavior(br);
        }.bind(this));
    },

    render: function () {
      this.container.html("");

      this.links = this.container
        .selectAll("line")
        .data(this.model.get('graph').links)
        .enter().append("line")
        .classed('link', true);

      this.nodes = this.container
        .selectAll("circle")
        .data(this.model.get("graph").nodes)
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("fill", "#777")
        .on("click", this.onNodeClicked.bind(this));

      this.trigger('render');
    },

    onNodeClicked: function () {
      this.trigger('nodeClicked', d3.event);
    },

    addBehavior: function (behavior) {
      behavior.setDirectedGraph(this);
      behavior.initialize();
      this.behaviors[behavior.name] = behavior;
      console.log('[base/directed-graph] behavior added: ' + behavior.name);
    },

    hasBehavior: function (name) {
      return this.behaviors.hasOwnProperty(name);
    },

    getBehavior: function (name) {
      return this.behaviors[name];
    }
  });
});
