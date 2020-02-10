"use strict";

/**
 * Base class for mode classes.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var AbstractManager = require('./Abstract');

  return function (_AbstractManager) {
    _inherits(ToolsManager, _AbstractManager);

    function ToolsManager() {
      _classCallCheck(this, ToolsManager);

      return _possibleConstructorReturn(this, (ToolsManager.__proto__ || Object.getPrototypeOf(ToolsManager)).apply(this, arguments));
    }

    _createClass(ToolsManager, [{
      key: "init",
      value: function init() {
        this.activated = null;
      }
    }, {
      key: "activate",
      value: function activate(name) {
        if (this.activated) {
          if (this.activated.name === name) {
            return true;
          } else {
            this.activated.willDeactivate();
            this.activated.didDeactivate();
          }
        }
        var mode = this.get(name);
        mode.willActivate();
        this.activated = mode;
        this.activated.didActivate();
        this.graph.trigger(this.graph.EVENT_MODE_ACTIVATED, name);
      }
    }, {
      key: "trigger",
      value: function trigger(event, context) {
        if (!this.activated) {
          return false;
        }

        this.activated.trigger(event, context);
      }
    }]);

    return ToolsManager;
  }(AbstractManager);
});