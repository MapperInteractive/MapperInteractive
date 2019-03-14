"use strict";

/**
 * Color Functions Block.
 */
define((require) => {

  const { d3, $ } = window;

  const d3ScaleChromatic = require('d3-scale-chromatic');
  const Block = require('Block');

  return Block.extend({

    name: 'Color Functions',

    SCHEMAS: [
      { label: '- None -', scheme: null },
      { label: 'Rainbow', scheme: 'interpolateRainbow' },
      { label: 'Yellow, Red', scheme: 'interpolateYlOrRd' },
      { label: 'Yellow, Blue', scheme: 'interpolateYlOrBr' },
      { label: 'Yellow, Green', scheme: 'interpolateYlGn' },
      { label: 'Yellow, Green, Blue', scheme: 'interpolateYlGnBu' },
      { label: 'Purple, Red', scheme: 'interpolatePuRd' },
      { label: 'Purple, Blue', scheme: 'interpolatePuBu' },
      { label: 'Purple, Blue, Green', scheme: 'interpolatePuBuGn' },
      { label: 'Green, Blue', scheme: 'interpolateGnBu' },
      { label: 'Red', scheme: 'interpolateOrRd' },
      { label: 'Red, Blue', scheme: 'interpolateRdPu' },
      { label: 'Blue', scheme: 'interpolateBlues' },
      { label: 'Blue, Purple', scheme: 'interpolateBuPu' },
    ],

    /**
     * config:
     *  - values: function list
     */
    didMount() {

      // get ref of graph
      this.graph = this.app.graph;

      // config
      this.functions = this.config.get("functions");
      this.maps = this.SCHEMAS;

      // set default schema as null
      this.setCurrentFunction(this.functions[0]);
      this.setCurrentMap(this.SCHEMAS[0]);

      // refresh the
      this.listenTo(this.graph.config, 'change:data', () => this.refresh());
      this.listenTo(this.config, 'change:currentMap', () => this.refresh());
      this.listenTo(this.config, 'change:currentFunction', () => this.refresh());

      // create HTML elements
      d3.select(this.el).append('form').classed('form', true);

      // set ref of form and svg
      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },

    render() {
      this._appendFunctionsDropdown();
      this._appendMapDropdown();
      this._renderColorMapFigure();
    },

    _firstValueFunction() {
      return this.config.get('values')[0];
    },

    _renderColorMapFigure() {
      this.svg.html("");

      let colorMap = this.getCurrentMap();

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

    getCurrentFunction() {
      return this.config.get('currentFunction');
    },

    setCurrentFunction(func) {
      if (func['attr'] && !func['func']) {
        func['func'] = (d) => d[func['attr']];
      }
      this.config.set('currentFunction', func);
    },

    getCurrentMap() {
      return this.config.get('currentMap');
    },

    setCurrentMap(map) {
      if (map['scheme']) {
        map['scale'] = d3.scaleSequential(d3ScaleChromatic[map['scheme']]);
      } else {
        map['scale'] = null;
      }
      this.config.set('currentMap', map);
    },

    getFunctionNames() {
      return this.functions.map((f) => f['name']);
    },

    getMapLabels() {
      return this.maps.map((s) => s['label']);
    },

    _appendFunctionsDropdown() {
      this.$form.append(this._dropdown('value', this.getFunctionNames(), (index) => {
        this.setCurrentFunction(this.functions[index]);
      }));
    },

    _appendMapDropdown() {
      this.$form.append(this._dropdown('map', this.getMapLabels(), (index) => {
        this.setCurrentMap(this.maps[index]);
      }));
    },

    _dropdown(label, options, onClick) {
      let $html = $('<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label" style="font-size:1.2em;font-weight:lighter;">' + label + '</label>' +
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

    refresh() {
      this._renderColorMapFigure();
      this._updateGraphColor();
    },

    _updateGraphColor() {
      let graph = this.graph;

      let currentMap = this.getCurrentMap();
      let colorScale = currentMap['scale'];

      if (!colorScale || !graph.nodes) {
        if (graph.nodes) {
          graph.nodes.style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      colorScale.domain(this._getCurrentAxisDomain());

      let currentFunc = this.getCurrentFunction();
      let d3ValueFunction = (d) => colorScale(currentFunc['func'](d));
      graph.nodes.style('fill', d3ValueFunction);

      this._invertLabelColors(graph, d3ValueFunction);
    },

    _getCurrentAxisDomain() {
      let data = this.graph.config.get('data');
      let valueFunction = this.getCurrentFunction();
      if (data) {
        return d3.extent(data['nodes'], (d) => valueFunction['func'](d));
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
