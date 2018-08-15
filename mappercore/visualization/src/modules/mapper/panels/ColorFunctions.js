"use strict";

/**
 * Color Functions Panel.
 *
 * This class can create panel for set color of nodes base on customized functions and color maps.
 */
define(function (require) {

  const d3 = require('d3');
  const $ = require('jquery');
  const d3ScaleChromatic = require('d3-scale-chromatic');
  const Panel = require('core/mapper/Panel');

  return Panel.extend({

    name: 'Color Functions',

    COLOR_MAPS: [
      { name: '- None -', map: null },
      { name: 'Rainbow', map: 'interpolateRainbow' },
      { name: 'Yellow, Red', map: 'interpolateYlOrRd' },
      { name: 'Yellow, Blue', map: 'interpolateYlOrBr' },
      { name: 'Yellow, Green', map: 'interpolateYlGn' },
      { name: 'Yellow, Green, Blue', map: 'interpolateYlGnBu' },
      { name: 'Purple, Red', map: 'interpolatePuRd' },
      { name: 'Purple, Blue', map: 'interpolatePuBu' },
      { name: 'Purple, Blue, Green', map: 'interpolatePuBuGn' },
      { name: 'Green, Blue', map: 'interpolateGnBu' },
      { name: 'Red', map: 'interpolateOrRd' },
      { name: 'Red, Blue', map: 'interpolateRdPu' },
      { name: 'Blue', map: 'interpolateBlues' },
      { name: 'Blue, Purple', map: 'interpolateBuPu' },
    ],

    didMount() {
      this.graph = this.app.graph;

      this.model.set('colorFunctions', this.model.get('functions'));
      this.model.set('colorMaps', this._generateColorMaps());

      this.listenTo(this.graph.model, 'change:data', () => this._onGraphChangeData());
      this.listenTo(this.model, 'change:currentColorMap', () => this._onChangeColorMap());
      this.listenTo(this.model, 'change:currentColorFunction', () => this._onChangeColorFunction());

      d3.select(this.el).append('form').classed('form', true);

      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },

    render() {
      this._renderColorFunctionSelect();
      this._renderColorMapSelect();
      this._renderColorMapFigure();
    },

    _generateColorMaps() {
      return this.COLOR_MAPS.map((map) => {
        let scale = null;
        if (map['map']) {
          scale = d3.scaleSequential(d3ScaleChromatic[map['map']]);
        }
        return {
          label: map['name'],
          scale: scale
        }
      });
    },

    getCurrentColorMap() {
      let map = this.model.get('currentColorMap');
      if (!map) {
        return this.model.get('colorMaps')[0];
      } else {
        return map;
      }
    },

    /**
     * return {label: feature, evaluate: f}
     */
    getCurrentColorFunction() {
      let map = this.model.get('currentColorFunction');
      if (!map) {
        return this.model.get('colorFunctions')[0];
      } else {
        return map;
      }
    },

    _renderColorMapFigure() {
      this.svg.html("");

      let colorMap = this.getCurrentColorMap();
      let colorScale = colorMap['scale'];
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

    _renderColorFunctionSelect() {
      let colorFunctions = this.model.get('colorFunctions');
      let options = colorFunctions.map((fn) => fn['name']);
      let onClick = (index) => this.model.set('currentColorFunction', colorFunctions[index]);
      this.$form.append(this._generateDropDown('colorFunction', options, onClick));
    },

    _renderColorMapSelect() {
      let colorMaps = this.model.get('colorMaps');
      let options = colorMaps.map((map) => map['name']);
      let onClick = (index) => this.model.set('currentColorMap', colorMaps[index]);
      this.$form.append(this._generateDropDown('colorMap', options, onClick));
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

    _onChangeColorFunction() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },

    _updateGraphColor() {
      let graph = this.graph;
      let colorMap = this.getCurrentColorMap();
      let colorScale = colorMap['scale'];

      if (!colorScale || !graph.nodes) {
        if (graph.nodes) {
          graph.nodes.style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      colorScale.domain(this._getCurrentAxisDomain());

      let colorFunctionSettings = this.getCurrentColorFunction();
      let colorFunction = (d) => colorScale(colorFunctionSettings.func(d));
      graph.nodes.style('fill', colorFunction);

      this._invertLabelColors(graph, colorFunction);
    },

    _getCurrentAxisDomain() {
      let graph = this.graph;
      let data = graph.model.get('data');
      let colorFunction = this.getCurrentColorFunction();
      if (data) {
        return d3.extent(data['nodes'], (d) => colorFunction.func(d));
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
