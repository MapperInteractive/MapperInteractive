"use strict";

/**
 * Enable graph show arrows on edges.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var GraphMode = require('../Behavior');

  return function (_GraphMode) {
    _inherits(MarkerEnd, _GraphMode);

    function MarkerEnd() {
      _classCallCheck(this, MarkerEnd);

      return _possibleConstructorReturn(this, (MarkerEnd.__proto__ || Object.getPrototypeOf(MarkerEnd)).apply(this, arguments));
    }

    _createClass(MarkerEnd, [{
      key: 'didMount',
      value: function didMount() {
        var _this2 = this;

        this.listenTo('graph:didRender', function () {
          _this2.graphDidRender();
        });
      }
    }, {
      key: 'graphDidRender',
      value: function graphDidRender() {
        this.defs = this.graph.container.append('defs').append('marker').attr('id', 'arrowhead').attr('viewBox', '-0 -5 10 10').attr('refX', 19).attr('refY', 0).attr('orient', 'auto').attr('markerWidth', 3).attr('markerHeight', 3).attr('xoverflow', 'visible').append('svg:path').attr('d', 'M 0,-5 L 10 ,0 L 0,5').attr('fill', '#777').attr('stroke', '#777');

        this.graph.links.attr('marker-end', 'url(#arrowhead)');
      }
    }]);

    return MarkerEnd;
  }(GraphMode);
});