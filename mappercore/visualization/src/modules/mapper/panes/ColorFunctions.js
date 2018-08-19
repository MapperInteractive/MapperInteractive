"use strict";

/**
 * Color Functions Pane.
 *
 * This class can create pane for set color of nodes base on customized functions and color maps.
 */
define(function (require) {

  const d3 = require('d3');
  const $ = require('jquery');
  const d3ScaleChromatic = require('d3-scale-chromatic');
  const Pane = require('core/mapper/Pane');

  return Pane.extend({

    name: 'Color Functions',

    COLOR_MAPS: [
      { colormapName: '- None -', colormapFunc: null },
      { colormapName: 'Rainbow', colormapFunc: 'interpolateRainbow' },
      { colormapName: 'Yellow, Red', colormapFunc: 'interpolateYlOrRd' },
      { colormapName: 'Yellow, Blue', colormapFunc: 'interpolateYlOrBr' },
      { colormapName: 'Yellow, Green', colormapFunc: 'interpolateYlGn' },
      { colormapName: 'Yellow, Green, Blue', colormapFunc: 'interpolateYlGnBu' },
      { colormapName: 'Purple, Red', colormapFunc: 'interpolatePuRd' },
      { colormapName: 'Purple, Blue', colormapFunc: 'interpolatePuBu' },
      { colormapName: 'Purple, Blue, Green', colormapFunc: 'interpolatePuBuGn' },
      { colormapName: 'Green, Blue', colormapFunc: 'interpolateGnBu' },
      { colormapName: 'Red', colormapFunc: 'interpolateOrRd' },
      { colormapName: 'Red, Blue', colormapFunc: 'interpolateRdPu' },
      { colormapName: 'Blue', colormapFunc: 'interpolateBlues' },
      { colormapName: 'Blue, Purple', colormapFunc: 'interpolateBuPu' },
    ],

    didMount() {
      this.graph = this.app.graph;

      this.model.set('valueFunctions', this.model.get('valueFunctions'));
      this.model.set('colorMaps', this._generateColorMaps());

      this.listenTo(this.graph.model, 'change:data', () => this._onGraphChangeData());
      this.listenTo(this.model, 'change:currentColorMap', () => this._onChangeColorMap());
      this.listenTo(this.model, 'change:currentValueFunction', () => this._onChangeValueFunction());

      d3.select(this.el).append('form').classed('form', true);

      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },

    render() {
      this._renderValueFunctionSelect();
      this._renderColorMapSelect();
      this._renderColorMapFigure();
    },

    _generateColorMaps() {
      return this.COLOR_MAPS.map((one) => {
        let func = null;
        if (one['colormapFunc']) {
          func = d3.scaleSequential(d3ScaleChromatic[one['colormapFunc']]);
        }
        return {
          colormapName: one['colormapName'],
          colormapFunc: func
        }
      });
    },

    getCurrentColorMap() {
      let current = this.model.get('currentColorMap');
      if (!current) {
        return this.model.get('colorMaps')[0];
      } else {
        return current;
      }
    },

    /**
     * return {label: feature, evaluate: f}
     */
    getCurrentValueFunction() {
      let current = this.model.get('currentValueFunction');
      if (!current) {
        return this.model.get('valueFunctions')[0];
      } else {
        return current;
      }
    },

    _renderColorMapFigure() {
      this.svg.html("");

      let colorMap = this.getCurrentColorMap();
      let colorScale = colorMap['colormapFunc'];
      if (!colorScale) {
        this.svg.attr('width', 0).attr('height', 0);
        return false;
      }

      let width = this.$el.width();
      let height = 60;
      let axisMargin = 20;
      let colorTileNumber = 50;
      let colorTileHeight = 20;
      let colorTileWidth = (width - (axisMargin * 2)) / colorTileNumber;
      let svg = this.svg.attr('width', width).attr('height', height);

      let axisDomain = this._getCurrentAxisDomain();

      let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
      let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin]);
      let axis = d3.axisBottom(axisScale).tickValues(tickValues);

      svg.append("g").attr("transform", "translate(0,25)").call(axis);

      colorScale.domain(axisDomain);

      let domainMin = axisDomain[0];
      let domainMax = axisDomain[1];
      let domainStep = (domainMax - domainMin) / colorTileNumber;
      let tilesGroup = svg.append("g");

      d3.range(domainMin, domainMax, domainStep).map((d) => {
        let color = colorScale(d);
        let x = axisScale(d);
        tilesGroup.append('rect')
          .attr('x', x)
          .attr('width', colorTileWidth)
          .attr('height', colorTileHeight)
          .attr('fill', color)
          .classed('rect', true);
      });

      return svg;
    },

    _renderValueFunctionSelect() {
      let valueFunctions = this.model.get('valueFunctions');
      let options = valueFunctions.map((fn) => fn['valueName']);
      let onClick = (index) => this.model.set('currentValueFunction', valueFunctions[index]);
      this.$form.append(this._generateDropDown('value', options, onClick));
    },

    _renderColorMapSelect() {
      let colorMaps = this.model.get('colorMaps');
      let options = colorMaps.map((map) => map['colormapName']);
      let onClick = (index) => this.model.set('currentColorMap', colorMaps[index]);
      this.$form.append(this._generateDropDown('map', options, onClick));
    },

    _generateDropDown(name, options, onClick) {
      let $html = $('<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label" style="font-size:1.2em;font-weight:lighter;">' + name + '</label>' +
        '<div class="col-sm-10"><div class="btn-group" style="margin-right:1em;">' +
        '<button class="btn btn-outline-secondary dropdown-toggle btn-sm" ' +
        'role="button" data-toggle="dropdown" aria-haspopup="true" ' +
        'aria-expanded="false">' + options[0] + '</button>' +
        '<div class="dropdown-menu"></div>' +
        '</div></div></div>');

      let $button = $html.find('.dropdown-toggle');
      let $selection = $html.find('.dropdown-menu');

      options.map((d, index) => {
        let $option = $('<a class="dropdown-item" href="#">' + d + '</a>');
        $option.on('click', () => {
          $selection.find('.active').removeClass('active');
          $option.addClass('active');
          $button.text(d);
          onClick(index);
        });
        $selection.append($option);
      });

      return $html;
    },

    _onGraphChangeData() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },

    _onChangeColorMap() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },

    _onChangeValueFunction() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },

    _updateGraphColor() {
      let graph = this.graph;
      let colorMap = this.getCurrentColorMap();
      let colorScale = colorMap['colormapFunc'];

      if (!colorScale || !graph.nodes) {
        if (graph.nodes) {
          graph.nodes.style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      colorScale.domain(this._getCurrentAxisDomain());

      let currentValueFunction = this.getCurrentValueFunction();
      let d3ValueFunction = (d) => colorScale(currentValueFunction['valueFunc'](d));
      graph.nodes.style('fill', d3ValueFunction);

      this._invertLabelColors(graph, d3ValueFunction);
    },

    _getCurrentAxisDomain() {
      let graph = this.graph;
      let data = graph.model.get('data');
      let valueFunction = this.getCurrentValueFunction();
      if (data) {
        return d3.extent(data['nodes'], (d) => valueFunction['valueFunc'](d));
      } else {
        return [0, 1];
      }
    },

    _invertLabelColors(graph, fn) {
      let labelBehavior = graph.behaviors.get('labeled');
      if (labelBehavior) {
        labelBehavior.labels.style('fill', (d) => {
          let bgColor = fn(d);
          let rgb = bgColor.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
          for (let i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
          return 'rgb(' + rgb.join(',') + ')';
        });
      }
    },

    _clearLabelColor() {
      let labelBehavior = this.graph.behaviors.get('labeled');
      if (labelBehavior) {
        labelBehavior.labels.style('fill', '#333');
      }
    }

  });

});
