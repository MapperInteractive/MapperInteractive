define(function (require) {
  let Backbone = require('backbone');
  let _ = require('underscore');
  let d3 = require('d3');

  return Backbone.View.extend({

    template: _.template('<form><div class="row">' +
      '<div class="col-sm-8"><select name="algorithm" class="form-control mb-2 mr-sm-2 disabled" disabled></select></div>' +
      '<div class="col-sm-4"><button type="button" class="btn btn-outline-primary btn-block disabled" disabled>Run</button></div>' +
      '</div></form>'),

    initialize: function (states) {
      this.model = new Backbone.Model(_.extend({
        data: [],
        features: [],
        algorithms: [
          {name: 'linear_regression', label: 'Linear Regression'},
        ],
        transform: undefined
      }, states));

      this.graph = this.model.get('graph');
      this.listenTo(this.graph.model, 'change:selection', () => this.onSelectionChanged());

      this.UIWidth = this.$el.width();
      this.SVGHeight = 300;
      this.app = window.app;
    },

    onSelectionChanged: function () {
      this.render();
      let selection = this.graph.model.get('selection');
      if (selection.length > 0) {
        this.$('select').removeClass('disabled').attr('disabled', false);
        this.$('button').removeClass('disabled').attr('disabled', false);
      } else {
        this.$('select').addClass('disabled').attr('disabled', true);
        this.$('button').addClass('disabled').attr('disabled', true);
      }
    },

    render: function () {
      let html = $(this.template());
      let select = html.find('select');

      this.model.get('algorithms').map((a) => {
        select.append($('<option value="' + a['name'] + '">' + a['label'] + '</option>'));
      });

      this.$el.html(html);

      html.find('button').on('click', () => {

        let job = this.app.createJob('linear_regression', _.object([
          ['algorithm', select.val()],
          ['params', this.buildData()]
        ]));
        job.on('sent', () => console.log('sent'));
        job.on('finished', (res) => {
          this.draw(res['result'])
        });

        job.send();
      });
    },

    buildData: function () {
      let transform = this.model.get('transform');
      let selection = this.graph.model.get('selection');

      if (transform) {
        selection = transform(selection);
      }

      return selection;
    },

    draw: function (data) {
      d3.select(this.el).selectAll('svg').remove();
      _.keys(data).map((key) => {
        let svg = d3.select(this.el).append('svg')
          .attr('width', this.UIWidth)
          .attr('height', this.SVGHeight);
        this.drawFig(svg, data[key], key);
      });
    },

    drawFig: function (fig, responseData, title) {
      let scaleMargin = {top: 40, left: 10, right: 10, bottom: 20},
        titleMargin = {left: this.UIWidth / 2, top: 10},
        scaleWidth = this.UIWidth - scaleMargin.left - scaleMargin.right,
        scaleHeight = this.SVGHeight - scaleMargin.top - scaleMargin.bottom,
        data = _.zip(this.model.get('attributes'), responseData).map((f) => {
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
