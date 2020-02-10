"use strict";

/**
 * A mode to select a single node in a graph.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
  var _window = window,
      d3 = _window.d3;

  var GraphMode = require('../Tool');

  return function (_GraphMode) {
    _inherits(SelectClickMode, _GraphMode);

    function SelectClickMode() {
      _classCallCheck(this, SelectClickMode);

      var _this = _possibleConstructorReturn(this, (SelectClickMode.__proto__ || Object.getPrototypeOf(SelectClickMode)).call(this));

      _this.name = 'select-node';
      _this.label = 'Select Node';
      return _this;
    }

    _createClass(SelectClickMode, [{
      key: 'didActivate',
      value: function didActivate() {
        var _this2 = this;

        _get(SelectClickMode.prototype.__proto__ || Object.getPrototypeOf(SelectClickMode.prototype), 'didActivate', this).call(this);
        this.listenTo(this.graph, 'click:node', function (e) {
          var data = d3.select(e.target).datum();
          var isSelected = _this2.graph.isNodeSelected(data['id']);
          if (!isSelected) {
            _this2.graph.selectNode(data['id']);
          } else {
            _this2.graph.unselectNode(data['id']);
          }
        });
      }
    }, {
      key: 'didDeactivate',
      value: function didDeactivate() {
        _get(SelectClickMode.prototype.__proto__ || Object.getPrototypeOf(SelectClickMode.prototype), 'didDeactivate', this).call(this);
        this.stopListening();
      }
    }]);

    return SelectClickMode;
  }(GraphMode);
});