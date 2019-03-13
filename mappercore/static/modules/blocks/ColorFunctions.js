"use strict";

/**
 * Color Functions Block.
 *
 * This class can create block for set color of nodes base on customized functions and color maps.
 */

define(function (require) {

  var d3 = require('d3');
  var $ = require('jquery');
  var d3ScaleChromatic = require('d3-scale-chromatic');
  var Block = require('Block');

  return Block.extend({

    name: 'Color Functions',

    COLOR_MAPS: [{ colormapName: '- None -', colormapFunc: null }, { colormapName: 'Rainbow', colormapFunc: 'interpolateRainbow' }, { colormapName: 'Yellow, Red', colormapFunc: 'interpolateYlOrRd' }, { colormapName: 'Yellow, Blue', colormapFunc: 'interpolateYlOrBr' }, { colormapName: 'Yellow, Green', colormapFunc: 'interpolateYlGn' }, { colormapName: 'Yellow, Green, Blue', colormapFunc: 'interpolateYlGnBu' }, { colormapName: 'Purple, Red', colormapFunc: 'interpolatePuRd' }, { colormapName: 'Purple, Blue', colormapFunc: 'interpolatePuBu' }, { colormapName: 'Purple, Blue, Green', colormapFunc: 'interpolatePuBuGn' }, { colormapName: 'Green, Blue', colormapFunc: 'interpolateGnBu' }, { colormapName: 'Red', colormapFunc: 'interpolateOrRd' }, { colormapName: 'Red, Blue', colormapFunc: 'interpolateRdPu' }, { colormapName: 'Blue', colormapFunc: 'interpolateBlues' }, { colormapName: 'Blue, Purple', colormapFunc: 'interpolateBuPu' }],

    didMount: function didMount() {
      var _this = this;

      this.graph = this.app.graph;

      this.model.set('valueFunctions', this.model.get('valueFunctions'));
      this.model.set('colorMaps', this._generateColorMaps());

      this.listenTo(this.graph.model, 'change:data', function () {
        return _this._onGraphChangeData();
      });
      this.listenTo(this.model, 'change:currentColorMap', function () {
        return _this._onChangeColorMap();
      });
      this.listenTo(this.model, 'change:currentValueFunction', function () {
        return _this._onChangeValueFunction();
      });

      d3.select(this.el).append('form').classed('form', true);

      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },
    render: function render() {
      this._renderValueFunctionSelect();
      this._renderColorMapSelect();
      this._renderColorMapFigure();
    },
    _generateColorMaps: function _generateColorMaps() {
      return this.COLOR_MAPS.map(function (one) {
        var func = null;
        if (one['colormapFunc']) {
          func = d3.scaleSequential(d3ScaleChromatic[one['colormapFunc']]);
        }
        return {
          colormapName: one['colormapName'],
          colormapFunc: func
        };
      });
    },
    getCurrentColorMap: function getCurrentColorMap() {
      var current = this.model.get('currentColorMap');
      if (!current) {
        return this.model.get('colorMaps')[0];
      } else {
        return current;
      }
    },


    /**
     * return {label: feature, evaluate: f}
     */
    getCurrentValueFunction: function getCurrentValueFunction() {
      var current = this.model.get('currentValueFunction');
      if (!current) {
        return this.model.get('valueFunctions')[0];
      } else {
        return current;
      }
    },
    _renderColorMapFigure: function _renderColorMapFigure() {
      this.svg.html("");

      var colorMap = this.getCurrentColorMap();
      var colorScale = colorMap['colormapFunc'];
      if (!colorScale) {
        this.svg.attr('width', 0).attr('height', 0);
        return false;
      }

      var width = this.$el.width();
      var height = 60;
      var axisMargin = 20;
      var colorTileNumber = 50;
      var colorTileHeight = 20;
      var colorTileWidth = (width - axisMargin * 2) / colorTileNumber;
      var svg = this.svg.attr('width', width).attr('height', height);

      var axisDomain = this._getCurrentAxisDomain();

      var tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
      var axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin]);
      var axis = d3.axisBottom(axisScale).tickValues(tickValues);

      svg.append("g").attr("transform", "translate(0,25)").call(axis);

      colorScale.domain(axisDomain);

      var domainMin = axisDomain[0];
      var domainMax = axisDomain[1];
      var domainStep = (domainMax - domainMin) / colorTileNumber;
      var tilesGroup = svg.append("g");

      d3.range(domainMin, domainMax, domainStep).map(function (d) {
        var color = colorScale(d);
        var x = axisScale(d);
        tilesGroup.append('rect').attr('x', x).attr('width', colorTileWidth).attr('height', colorTileHeight).attr('fill', color).classed('rect', true);
      });

      return svg;
    },
    _renderValueFunctionSelect: function _renderValueFunctionSelect() {
      var _this2 = this;

      var valueFunctions = this.model.get('valueFunctions');
      var options = valueFunctions.map(function (fn) {
        return fn['valueName'];
      });
      var onClick = function onClick(index) {
        return _this2.model.set('currentValueFunction', valueFunctions[index]);
      };
      this.$form.append(this._generateDropDown('value', options, onClick));
    },
    _renderColorMapSelect: function _renderColorMapSelect() {
      var _this3 = this;

      var colorMaps = this.model.get('colorMaps');
      var options = colorMaps.map(function (map) {
        return map['colormapName'];
      });
      var onClick = function onClick(index) {
        return _this3.model.set('currentColorMap', colorMaps[index]);
      };
      this.$form.append(this._generateDropDown('map', options, onClick));
    },
    _generateDropDown: function _generateDropDown(name, options, onClick) {
      var $html = $('<div class="form-group row">' + '<label class="col-sm-2 col-form-label" style="font-size:1.2em;font-weight:lighter;">' + name + '</label>' + '<div class="col-sm-10"><div class="btn-group" style="margin-right:1em;">' + '<button class="btn btn-outline-secondary dropdown-toggle btn-sm" ' + 'role="button" data-toggle="dropdown" aria-haspopup="true" ' + 'aria-expanded="false">' + options[0] + '</button>' + '<div class="dropdown-menu"></div>' + '</div></div></div>');

      var $button = $html.find('.dropdown-toggle');
      var $selection = $html.find('.dropdown-menu');

      options.map(function (d, index) {
        var $option = $('<a class="dropdown-item" href="#">' + d + '</a>');
        $option.on('click', function () {
          $selection.find('.active').removeClass('active');
          $option.addClass('active');
          $button.text(d);
          onClick(index);
        });
        $selection.append($option);
      });

      return $html;
    },
    _onGraphChangeData: function _onGraphChangeData() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },
    _onChangeColorMap: function _onChangeColorMap() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },
    _onChangeValueFunction: function _onChangeValueFunction() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },
    _updateGraphColor: function _updateGraphColor() {
      var graph = this.graph;
      var colorMap = this.getCurrentColorMap();
      var colorScale = colorMap['colormapFunc'];

      if (!colorScale || !graph.nodes) {
        if (graph.nodes) {
          graph.nodes.style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      colorScale.domain(this._getCurrentAxisDomain());

      var currentValueFunction = this.getCurrentValueFunction();
      var d3ValueFunction = function d3ValueFunction(d) {
        return colorScale(currentValueFunction['valueFunc'](d));
      };
      graph.nodes.style('fill', d3ValueFunction);

      this._invertLabelColors(graph, d3ValueFunction);
    },
    _getCurrentAxisDomain: function _getCurrentAxisDomain() {
      var graph = this.graph;
      var data = graph.model.get('data');
      var valueFunction = this.getCurrentValueFunction();
      if (data) {
        return d3.extent(data['nodes'], function (d) {
          return valueFunction['valueFunc'](d);
        });
      } else {
        return [0, 1];
      }
    },
    _invertLabelColors: function _invertLabelColors(graph, fn) {
      var labelBehavior = graph.behaviors.get('labeled');
      if (labelBehavior) {
        labelBehavior.labels.style('fill', function (d) {
          var bgColor = fn(d);
          var rgb = bgColor.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
          for (var i = 0; i < rgb.length; i++) {
            rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
          }return 'rgb(' + rgb.join(',') + ')';
        });
      }
    },
    _clearLabelColor: function _clearLabelColor() {
      var labelBehavior = this.graph.behaviors.get('labeled');
      if (labelBehavior) {
        labelBehavior.labels.style('fill', '#333');
      }
    }
  });
});