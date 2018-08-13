"use strict";

/**
 * Linear Regression Panel
 */

define(function (require) {
  var _require = require('core/Lib'),
      d3 = _require.d3,
      _ = _require._;

  var Panel = require('../Panel');

  return Panel.extend({

    name: 'Linear Regression',

    template: _.template('<form><div class="row">' + '<div class="col-sm-8"><select name="algorithm" class="form-control mb-2 mr-sm-2 disabled" disabled></select></div>' + '<div class="col-sm-4"><button type="button" class="btn btn-outline-primary btn-block disabled" disabled>Run</button></div>' + '</div></form>'),

    didMount: function didMount() {
      var _this = this;

      this.algorithms = this.model.get('algorithms'); //[{ name: 'linear_regression', label: 'Linear Regression' }];
      this.attributes = this.model.get('attributes'); //['DAP', 'Humidity', 'Solar.Rad', 'Temperature'];

      this.listenTo(this.graph.model, 'change:selection', function () {
        return _this.onSelectionChanged();
      });

      this.UIWidth = this.$el.width();
      this.SVGHeight = 300;
    },


    onSelectionChanged: function onSelectionChanged() {
      this.render();
      var selection = this.graph.model.get('selection');
      if (selection.length > 0) {
        this.$('select').removeClass('disabled').attr('disabled', false);
        this.$('button').removeClass('disabled').attr('disabled', false);
      } else {
        this.$('select').addClass('disabled').attr('disabled', true);
        this.$('button').addClass('disabled').attr('disabled', true);
      }
    },

    render: function render() {
      var _this2 = this;

      var html = $(this.template());
      var select = html.find('select');

      this.algorithms.map(function (a) {
        select.append($('<option value="' + a['name'] + '">' + a['label'] + '</option>'));
      });

      this.$el.html(html);

      html.find('button').on('click', function () {

        var job = _this2.app.createJob('linear_regression', _.object([['algorithm', select.val()], ['params', _this2.buildData()]]));

        job.on('sent', function () {
          return console.log('sent');
        });

        job.on('finished', function (res) {
          _this2.draw(res['result']);
        });

        job.send();
      });
    },

    transform: function transform(selection) {
      var _this3 = this;

      var individuals = this.app.model.get('individuals');
      var featureData = [],
          targetValues = [];

      selection = selection.map(function (d) {
        return parseInt(d);
      });

      individuals.forEach(function (item) {
        var clusters = item['cluster.ids'].trim().split(',').map(function (d) {
          return parseInt(d);
        });
        var isSelected = _.intersection(clusters, selection).length > 0;

        if (isSelected) {
          featureData.push(_.map(_this3.attributes, function (attr) {
            return parseFloat(item[attr]);
          }));
          targetValues.push(parseFloat(item['GrowthRate']));
        }
      });

      return {
        'features': featureData,
        'targets': {
          'Growth Rate': targetValues
        }
      };
    },


    buildData: function buildData() {
      var selection = this.graph.model.get('selection');
      selection = this.transform(selection);
      return selection;
    },

    draw: function draw(data) {
      var _this4 = this;

      d3.select(this.el).selectAll('svg').remove();
      _.keys(data).map(function (key) {
        var svg = d3.select(_this4.el).append('svg').attr('width', _this4.UIWidth).attr('height', _this4.SVGHeight);
        _this4.drawFig(svg, data[key], key);
      });
    },

    drawFig: function drawFig(fig, responseData, title) {
      var scaleMargin = { top: 40, left: 10, right: 10, bottom: 20 },
          titleMargin = { left: this.UIWidth / 2, top: 10 },
          scaleWidth = this.UIWidth - scaleMargin.left - scaleMargin.right,
          scaleHeight = this.SVGHeight - scaleMargin.top - scaleMargin.bottom,
          data = _.zip(this.attributes, responseData).map(function (f) {
        return _.object(['feature', 'coefficient'], f);
      }),
          maxCoefficient = d3.max(data.map(function (i) {
        return Math.abs(i['coefficient']);
      }));

      var titleGroup = fig.append('g').attr("transform", "translate(" + titleMargin.left + "," + titleMargin.top + ")");

      titleGroup.append('text').attr('alignment-baseline', 'hanging').attr('text-anchor', 'middle').attr('x', 0).attr('y', 0).text(title);

      var scaleGroup = fig.append('g').attr("transform", "translate(0," + scaleMargin.top + ")");

      var xScale = d3.scaleLinear().range([0, scaleWidth]).domain([-maxCoefficient, maxCoefficient]).nice();

      var yScale = d3.scaleBand().rangeRound([0, scaleHeight]).paddingInner(0.1).domain(data.map(function (d) {
        return d.feature;
      }));

      var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('.2f'));

      scaleGroup.selectAll(".bar").data(data).enter().append("rect").attr("fill", function (d) {
        return d.coefficient < 0 ? "#F0803E" : "#61B97F";
      }).attr("x", function (d) {
        return xScale(Math.min(0, d.coefficient));
      }).attr("y", function (d) {
        return yScale(d.feature);
      }).attr("width", function (d) {
        return Math.abs(xScale(d.coefficient) - xScale(0));
      }).attr("height", yScale.bandwidth());

      scaleGroup.append("g").attr("class", "x axis").attr("transform", "translate(0," + scaleHeight + ")").call(xAxis);

      var numberGroup = scaleGroup.append("g");
      var numberFormat = d3.format('.2');
      var numberYOffset = yScale.bandwidth() / 2;

      numberGroup.selectAll('text').data(data).enter().append('text').attr("x", function (d) {
        var base = xScale(d.coefficient);
        if (d.coefficient >= 0) {
          return base + 5;
        } else {
          return base - 5;
        }
      }).attr("y", function (d) {
        return yScale(d.feature) + numberYOffset;
      }).attr("alignment-baseline", "middle").attr("font-size", ".9em").attr("text-anchor", function (d) {
        if (d.coefficient >= 0) {
          return 'start';
        } else {
          return 'end';
        }
      }).text(function (d) {
        return numberFormat(d.coefficient);
      });

      var labelGroup = scaleGroup.append("g").attr("class", "y axis").attr("transform", "translate(" + xScale(0) + ",0)").call(d3.axisLeft(yScale)).selectAll(".tick").filter(function (d, i) {
        return data[i].coefficient < 0;
      });

      labelGroup.select("line").attr("x2", 6);

      labelGroup.select("text").attr("x", 9).style("text-anchor", "start");
    }
  });
});