"use strict";

/**
 * Color Functions Block.
 */

define(function (require) {
  var _window = window,
      d3 = _window.d3,
      $ = _window.$;


  var d3ScaleChromatic = require('d3-scale-chromatic');
  var Block = require('Block');

  return Block.extend({

    name: 'Color Functions',

    SCHEMAS: [{ label: '- None -', scheme: null }, { label: 'Rainbow', scheme: 'interpolateRainbow' }, { label: 'Yellow, Red', scheme: 'interpolateYlOrRd' }, { label: 'Yellow, Blue', scheme: 'interpolateYlOrBr' }, { label: 'Yellow, Green', scheme: 'interpolateYlGn' }, { label: 'Yellow, Green, Blue', scheme: 'interpolateYlGnBu' }, { label: 'Purple, Red', scheme: 'interpolatePuRd' }, { label: 'Purple, Blue', scheme: 'interpolatePuBu' }, { label: 'Purple, Blue, Green', scheme: 'interpolatePuBuGn' }, { label: 'Green, Blue', scheme: 'interpolateGnBu' }, { label: 'Red', scheme: 'interpolateOrRd' }, { label: 'Red, Blue', scheme: 'interpolateRdPu' }, { label: 'Blue', scheme: 'interpolateBlues' }, { label: 'Blue, Purple', scheme: 'interpolateBuPu' }],

    /**
     * config:
     *  - values: function list
     */
    didMount: function didMount() {
      var _this = this;

      // get ref of graph
      this.graph = this.app.graph;

      // config
      this.functions = this.config.get("functions");
      this.maps = this.SCHEMAS;

      // set default schema as null
      this.setCurrentFunction(this.functions[0]);
      this.setCurrentMap(this.SCHEMAS[0]);

      // refresh the
      this.listenTo(this.graph.config, 'change:data', function () {
        return _this.refresh();
      });
      this.listenTo(this.config, 'change:currentMap', function () {
        return _this.refresh();
      });
      this.listenTo(this.config, 'change:currentFunction', function () {
        return _this.refresh();
      });

      // create HTML elements
      d3.select(this.el).append('form').classed('form', true);

      // set ref of form and svg
      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },
    render: function render() {
      this._appendFunctionsDropdown();
      this._appendMapDropdown();
      this._renderColorMapFigure();
    },
    _firstValueFunction: function _firstValueFunction() {
      return this.config.get('values')[0];
    },
    _renderColorMapFigure: function _renderColorMapFigure() {
      this.svg.html("");

      var colorMap = this.getCurrentMap();

      var colorScale = colorMap['scale'];
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
    getCurrentFunction: function getCurrentFunction() {
      return this.config.get('currentFunction');
    },
    setCurrentFunction: function setCurrentFunction(func) {
      if (func['attr'] && !func['func']) {
        func['func'] = function (d) {
          return d[func['attr']];
        };
      }
      this.config.set('currentFunction', func);
    },
    getCurrentMap: function getCurrentMap() {
      return this.config.get('currentMap');
    },
    setCurrentMap: function setCurrentMap(map) {
      if (map['scheme']) {
        map['scale'] = d3.scaleSequential(d3ScaleChromatic[map['scheme']]);
      } else {
        map['scale'] = null;
      }
      this.config.set('currentMap', map);
    },
    getFunctionNames: function getFunctionNames() {
      return this.functions.map(function (f) {
        return f['name'];
      });
    },
    getMapLabels: function getMapLabels() {
      return this.maps.map(function (s) {
        return s['label'];
      });
    },
    _appendFunctionsDropdown: function _appendFunctionsDropdown() {
      var _this2 = this;

      this.$form.append(this._dropdown('value', this.getFunctionNames(), function (index) {
        _this2.setCurrentFunction(_this2.functions[index]);
      }));
    },
    _appendMapDropdown: function _appendMapDropdown() {
      var _this3 = this;

      this.$form.append(this._dropdown('map', this.getMapLabels(), function (index) {
        _this3.setCurrentMap(_this3.maps[index]);
      }));
    },
    _dropdown: function _dropdown(label, options, onClick) {
      var $html = $('<div class="form-group row">' + '<label class="col-sm-2 col-form-label" style="font-size:1.2em;font-weight:lighter;">' + label + '</label>' + '<div class="col-sm-10"><div class="btn-group" style="margin-right:1em;">' + '<button class="btn btn-outline-secondary dropdown-toggle btn-sm" ' + 'role="button" data-toggle="dropdown" aria-haspopup="true" ' + 'aria-expanded="false">' + options[0] + '</button>' + '<div class="dropdown-menu"></div>' + '</div></div></div>');

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
    refresh: function refresh() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },
    _updateGraphColor: function _updateGraphColor() {
      var graph = this.graph;

      var currentMap = this.getCurrentMap();
      var colorScale = currentMap['scale'];

      if (!colorScale || !graph.nodes) {
        if (graph.nodes) {
          graph.nodes.style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      colorScale.domain(this._getCurrentAxisDomain());

      var currentFunc = this.getCurrentFunction();
      var d3ValueFunction = function d3ValueFunction(d) {
        return colorScale(currentFunc['func'](d));
      };
      graph.nodes.style('fill', d3ValueFunction);

      this._invertLabelColors(graph, d3ValueFunction);
    },
    _getCurrentAxisDomain: function _getCurrentAxisDomain() {
      var data = this.graph.config.get('data');
      var valueFunction = this.getCurrentFunction();
      if (data) {
        return d3.extent(data['nodes'], function (d) {
          return valueFunction['func'](d);
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