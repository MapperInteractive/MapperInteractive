define(function (require) {
  let app = require('app');
  let d3 = require('d3');
  let _ = require('underscore');
  let project = require('./project');

  return app.view({

    initialize: function () {
      this.featureAttrs = ['age', 'bf1', 'bf2', 'bf3', 'bf4', 'bf5', 'bf6', 'bf7', 'bf8', 'bf9', 'bf10'];
      this.featureLabels = [
        'Age',
        'Extraversion (R)',
        'Agreeableness',
        'Conscientiousness (R)',
        'Neuroticism (R)',
        'Openness (R)',
        'Extraversion',
        'Agreeableness (R)',
        'Conscientiousness',
        'Neuroticism',
        'Openness',
      ];

      this.model = app.model({
        items: null,
        nodes: null,
        graph: null,
      });

      this.data = app.model();

      this.listenTo(this.model, 'change:graph', () => this.onGraphChange());
      this.listenTo(this.model, 'change:nodes', () => this.onNodesChange());
      this.listenTo(this.model, 'change:items', () => this.onItemsChange());
      this.listenTo(this.data, 'change', () => this.render());
    },

    onGraphChange: function () {
      this.model.get('graph').on('change:selection', (nodes) => {
        this.model.set('nodes', nodes);
      });
    },

    onNodesChange: function () {
      let nodes = this.model.get('nodes');
      let featureData = [], targetValuesPR = [], targetValuesAR = [];

      nodes.forEach((node) => {
        node.children.forEach((child) => {
          let item = this.items[parseInt(child['name'])];

          featureData.push(_.map(this.featureAttrs, (attr) => {
            return parseFloat(item[attr]);
          }));

          targetValuesAR.push(parseFloat(node['ar']));
          targetValuesPR.push(parseFloat(node['pr']));
        })
      });

      this.data.set({
        'features': featureData,
        'targets': {
          'AR': targetValuesAR,
          'PR': targetValuesPR
        }
      });
    },

    onItemsChange: function () {
      this.items = {};
      this.model.get('items').forEach((item) => {
        this.items[item['id']] = item;
      });
    },

    render: function () {
      d3.select(this.el).html("");

      let svgWidth = this.$el.width() - 20,
        svgHeight = 300,
        figWidth = svgWidth / 2,
        figHeight = svgHeight;

      let container = d3.select(this.el);

      // init svg
      let svg = container.select('svg');
      if (svg.empty()) {
        svg = container.append('svg')
          .attr('width', svgWidth)
          .attr('height', svgHeight);
        svg.append('g').classed('fig-AR', true).attr("transform", "translate(0,0)");
        svg.append('g').classed('fig-PR', true).attr("transform", "translate(" + figWidth + ",0)");
      }

      let plot = {
        figPR: svg.select('g.fig-PR'),
        figAR: svg.select('g.fig-AR')
      };

      // init AR and PR fig

      project
        .callback('linear_regression', this.data.attributes)
        .done((response) => {
          this.drawFig(
            plot.figAR,
            response['AR'],
            'Linear Regression (AR)',
            figWidth, figHeight);
          this.drawFig(
            plot.figPR,
            response['PR'],
            'Linear Regression (PR)',
            figWidth, figHeight);
        });
    },

    drawFig: function (fig, responseData, title, figWidth, figHeight) {
      let scaleMargin = {top: 40, left: 10, right: 10, bottom: 20},
        titleMargin = {left: figWidth / 2, top: 10},
        scaleWidth = figWidth - scaleMargin.left - scaleMargin.right,
        scaleHeight = figHeight - scaleMargin.top - scaleMargin.bottom,
        data = _.zip(this.featureLabels, responseData).map((f) => {
          return _.object(['feature', 'coefficient'], f);
        }),
        maxCoefficient = d3.max(data.map((i) => Math.abs(i['coefficient'])));

      let titleGroup = fig.append('g')
        .attr("transform", "translate(" + titleMargin.left + "," + titleMargin.top + ")");

      titleGroup.append('text')
        .attr('alignment-baseline', 'hanging')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .text(title);

      let scaleGroup = fig.append('g').attr("transform", "translate(0," + scaleMargin.top + ")");

      let xScale = d3.scaleLinear()
        .range([0, scaleWidth])
        .domain([-maxCoefficient, maxCoefficient])
        .nice();

      let yScale = d3.scaleBand()
        .rangeRound([0, scaleHeight])
        .paddingInner(0.1)
        .domain(data.map(function (d) {
          return d.feature;
        }));

      let xAxis = d3.axisBottom().scale(xScale);

      scaleGroup.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", function (d) {
          return d.coefficient < 0 ? "#F0803E" : "#61B97F";
        })
        .attr("x", function (d) {
          return xScale(Math.min(0, d.coefficient));
        })
        .attr("y", function (d) {
          return yScale(d.feature);
        })
        .attr("width", function (d) {
          return Math.abs(xScale(d.coefficient) - xScale(0));
        })
        .attr("height", yScale.bandwidth());

      scaleGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + scaleHeight + ")")
        .call(xAxis);

      let tickNeg = scaleGroup.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + xScale(0) + ",0)")
        .call(d3.axisLeft(yScale))
        .selectAll(".tick")
        .filter(function (d, i) {
          return data[i].coefficient < 0;
        });

      tickNeg.select("line")
        .attr("x2", 6);

      tickNeg.select("text")
        .attr("x", 9)
        .style("text-anchor", "start");
    }


  });

});
