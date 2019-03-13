'use strict';

define(function (require) {

  var d3 = require('d3');
  var Block = require('Block');

  return Block.extend({

    name: 'Size',

    didMount: function didMount() {
      var _this = this;

      this.model.set('functions', this.model.get('functions'));
      this.model.set('currentFunction', this.model.get('functions')[0]);

      this.listenTo(this.model, 'change:currentFunction', function () {
        return _this._onCurrentSizeFunctionChange();
      });
      this.listenTo(this.graph.model, 'change:data', function () {
        return _this._onGraphChangeData();
      });
    },
    render: function render() {
      var _this2 = this;

      var $container = $('<div class="btn-group" role="group"></div>');

      this.model.get('functions').map(function (func) {
        var $btn = $('<button type="button" class="btn btn-outline-secondary">' + func['name'] + '</button>');
        $btn.on('click', function () {
          $container.find('.active').removeClass('active');
          $btn.addClass('active');
          _this2.model.set('currentFunction', func);
        });
        $container.append($btn);
      });

      this.$el.append($container);
    },
    _onGraphChangeData: function _onGraphChangeData() {
      this._updateSize();
    },
    _onCurrentSizeFunctionChange: function _onCurrentSizeFunctionChange() {
      this._updateSize();
    },
    _updateSize: function _updateSize() {
      var data = this.graph.model.get('data');
      var nodes = this.graph.nodes;

      if (!nodes) {
        return false;
      }

      var currentFunction = this.model.get('currentFunction');
      var valueParser = currentFunction['func'];

      if (!valueParser) {
        nodes.transition().style('r', null);
        return;
      }

      var sizeDomain = d3.extent(data['nodes'], function (d) {
        return valueParser(d);
      });
      var sizeRange = [10, 20];
      var sizeScale = d3.scaleLinear().domain(sizeDomain).range(sizeRange);

      nodes.each(function (d) {
        d3.select(this).transition().style("r", sizeScale(valueParser(d)));
      });
    }
  });
});