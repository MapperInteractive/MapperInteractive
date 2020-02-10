"use strict";

/**
 * Color Functions Block.
 */

define(function (require) {
  var _window = window,
      d3 = _window.d3,
      $ = _window.$,
      Model = _window.b.Model;


  var d3ScaleChromatic = require('d3-scale-chromatic');
  var Block = require('Block');

  return Block.extend({

    name: 'Color Functions',

    COLORMAPS: [{ label: '- None -', scheme: null }, { label: 'Rainbow', scheme: 'interpolateRainbow' }, { label: 'Yellow, Red', scheme: 'interpolateYlOrRd' }, { label: 'Yellow, Blue', scheme: 'interpolateYlOrBr' }, { label: 'Yellow, Green', scheme: 'interpolateYlGn' }, { label: 'Yellow, Green, Blue', scheme: 'interpolateYlGnBu' }, { label: 'Purple, Red', scheme: 'interpolatePuRd' }, { label: 'Purple, Blue', scheme: 'interpolatePuBu' }, { label: 'Purple, Blue, Green', scheme: 'interpolatePuBuGn' }, { label: 'Green, Blue', scheme: 'interpolateGnBu' }, { label: 'Red', scheme: 'interpolateOrRd' }, { label: 'Red, Blue', scheme: 'interpolateRdPu' }, { label: 'Blue', scheme: 'interpolateBlues' }, { label: 'Blue, Purple', scheme: 'interpolateBuPu' }],

    /**
     * config:
     *  - values: function list
     */
    didMount: function didMount() {
      var _this = this;

      // config
      this.selection = this.config.get("selection").map(this._initSelections.bind(this));
      this.maps = this.COLORMAPS.map(this._initMap.bind(this));

      // states
      this.data = this.getGraph().getData();
      this.color = new Model({
        getter: this.selection[0]['getter'],
        scale: this.maps[0]['scale']
      });

      // refresh when data or config changed
      [this.data, this.color].map(function (sender) {
        return sender.on('change', function () {
          _this.refresh();
        });
      });

      // create HTML elements
      d3.select(this.el).append('form').classed('form', true);

      // set ref of form and svg
      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },
    _initSelections: function _initSelections(s) {
      s['getter'] = typeof s['attr'] != 'string' ? s['attr'] : function (d) {
        return d[s['attr']];
      };

      return s;
    },
    _initMap: function _initMap(m) {
      m['scale'] = m['scheme'] === null ? null : d3.scaleSequential(d3ScaleChromatic[m['scheme']]);
      return m;
    },
    render: function render() {
      this._appendFunctionsDropdown();
      this._appendMapDropdown();
      this._renderColorMapFigure();
    },
    _renderColorMapFigure: function _renderColorMapFigure() {
      this.svg.html("");

      var colorScale = this.color.get('scale');
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
    getFunctionNames: function getFunctionNames() {
      return this.selection.map(function (f) {
        return f['name'];
      });
    },
    getMapLabels: function getMapLabels() {
      return this.COLORMAPS.map(function (s) {
        return s['label'];
      });
    },
    _appendFunctionsDropdown: function _appendFunctionsDropdown() {
      var _this2 = this;

      this.$form.append(this._dropdown('value', this.getFunctionNames(), function (index) {
        _this2.color.set('getter', _this2.selection[index]['getter']);
      }));
    },
    _appendMapDropdown: function _appendMapDropdown() {
      var _this3 = this;

      this.$form.append(this._dropdown('map', this.getMapLabels(), function (index) {
        _this3.color.set('scale', _this3.maps[index]['scale']);
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
      var graph = this.getGraph();

      var scale = this.color.get('scale');

      if (!scale || !graph.getNodes()) {
        if (graph.getNodes()) {
          graph.getNodes().style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      scale.domain(this._getCurrentAxisDomain());

      var getter = this.color.get('getter');
      var svgColor = function svgColor(d) {
        return scale(getter(d));
      };

      graph.getNodes().style('fill', svgColor);
      this._invertLabelColors(graph, svgColor);
    },
    _getCurrentAxisDomain: function _getCurrentAxisDomain() {
      var nodes = this.data.get('nodes');
      var getter = this.color.get('getter');
      if (nodes && nodes.length > 0) {
        return d3.extent(nodes, function (d) {
          return getter(d);
        });
      } else {
        return [0, 1];
      }
    },
    _invertLabelColors: function _invertLabelColors(graph, fn) {
      var labeled = graph.getPlugins().get('labeled');
      if (labeled) {
        labeled.labels.style('fill', function (d) {
          var bgColor = fn(d);
          var rgb = bgColor.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
          for (var i = 0; i < rgb.length; i++) {
            rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
          }return 'rgb(' + rgb.join(',') + ')';
        });
      }
    },
    _clearLabelColor: function _clearLabelColor() {
      var labeled = this.getGraph().getPlugins().get('labeled');
      if (labeled) {
        labeled.labels.style('fill', '#333');
      }
    }
  });
});