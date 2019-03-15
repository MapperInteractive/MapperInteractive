"use strict";

/**
 * A read only mode.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var Mode = require('../Tool');

  return function (_Mode) {
    _inherits(ViewMode, _Mode);

    function ViewMode() {
      _classCallCheck(this, ViewMode);

      return _possibleConstructorReturn(this, (ViewMode.__proto__ || Object.getPrototypeOf(ViewMode)).apply(this, arguments));
    }

    _createClass(ViewMode, [{
      key: 'initialize',
      value: function initialize() {
        this.name = 'view';
        this.label = 'View';
      }
    }, {
      key: 'didMount',
      value: function didMount() {
        _get(ViewMode.prototype.__proto__ || Object.getPrototypeOf(ViewMode.prototype), 'didMount', this).call(this);
        this.draggable = this.graph.plugins.get('draggable');
      }
    }, {
      key: 'willActivate',
      value: function willActivate() {
        _get(ViewMode.prototype.__proto__ || Object.getPrototypeOf(ViewMode.prototype), 'willActivate', this).call(this);

        if (this.draggable) {
          this.draggable.resume();
        }
      }
    }, {
      key: 'willDeactivate',
      value: function willDeactivate() {
        _get(ViewMode.prototype.__proto__ || Object.getPrototypeOf(ViewMode.prototype), 'willDeactivate', this).call(this);

        if (this.draggable) {
          this.draggable.pause();
        }
      }
    }]);

    return ViewMode;
  }(Mode);
});