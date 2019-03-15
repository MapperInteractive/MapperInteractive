"use strict";

/**
 * Color Functions Block.
 */
define((require) => {

  const { d3, $, b: { Model } } = window;

  const d3ScaleChromatic = require('d3-scale-chromatic');
  const Block = require('Block');

  return Block.extend({

    name: 'Color Functions',

    COLORMAPS: [
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
      [
        this.data,
        this.color,
      ].map(sender => sender.on('change', () => {
        this.refresh();
      }));

      // create HTML elements
      d3.select(this.el).append('form').classed('form', true);

      // set ref of form and svg
      this.$form = this.$('form');
      this.svg = d3.select(this.el).append('svg');
    },

    _initSelections(s) {
      s['getter'] =
        typeof s['attr'] != 'string' ? s['attr'] : function (d) {
          return d[s['attr']];
        };

      return s;
    },

    _initMap(m) {
      m['scale'] = m['scheme'] === null ? null : d3.scaleSequential(d3ScaleChromatic[m['scheme']]);
      return m;
    },

    render() {
      this._appendFunctionsDropdown();
      this._appendMapDropdown();
      this._renderColorMapFigure();
    },

    _renderColorMapFigure() {
      this.svg.html("");

      let colorScale = this.color.get('scale');
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

    getFunctionNames() {
      return this.selection.map((f) => f['name']);
    },

    getMapLabels() {
      return this.COLORMAPS.map((s) => s['label']);
    },

    _appendFunctionsDropdown() {
      this.$form.append(this._dropdown('value', this.getFunctionNames(), (index) => {
        this.color.set('getter', this.selection[index]['getter']);
      }));
    },

    _appendMapDropdown() {
      this.$form.append(this._dropdown('map', this.getMapLabels(), (index) => {
        this.color.set('scale', this.maps[index]['scale']);
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
      let graph = this.getGraph();

      let scale = this.color.get('scale');

      if (!scale || !graph.getNodes()) {
        if (graph.getNodes()) {
          graph.getNodes().style('fill', null);
          this._clearLabelColor();
        }
        return false;
      }

      scale.domain(this._getCurrentAxisDomain());

      let getter = this.color.get('getter');
      let svgColor = (d) => scale(getter(d));

      graph.getNodes().style('fill', svgColor);
      this._invertLabelColors(graph, svgColor);
    },

    _getCurrentAxisDomain() {
      let nodes = this.data.get('nodes');
      let getter = this.color.get('getter');
      if (nodes && nodes.length > 0) {
        return d3.extent(nodes, (d) => getter(d));
      } else {
        return [0, 1];
      }
    },

    _invertLabelColors(graph, fn) {
      let labeled = graph.getPlugins().get('labeled');
      if (labeled) {
        labeled.labels.style('fill', (d) => {
          let bgColor = fn(d);
          let rgb = bgColor.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
          for (let i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
          return 'rgb(' + rgb.join(',') + ')';
        });
      }
    },

    _clearLabelColor() {
      let labeled = this.getGraph().getPlugins().get('labeled');
      if (labeled) {
        labeled.labels.style('fill', '#333');
      }
    }

  });

});
