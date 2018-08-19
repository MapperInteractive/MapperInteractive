"use strict";

/**
 * Base class for behavior classes.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var _ = require('underscore');
  var MountableManager = require('./Mountable');

  return function (_MountableManager) {
    _inherits(BehaviorsManager, _MountableManager);

    function BehaviorsManager() {
      _classCallCheck(this, BehaviorsManager);

      return _possibleConstructorReturn(this, (BehaviorsManager.__proto__ || Object.getPrototypeOf(BehaviorsManager)).apply(this, arguments));
    }

    _createClass(BehaviorsManager, [{
      key: 'trigger',
      value: function trigger(event, context) {
        _.mapObject(this.mounted, function (b) {
          b.trigger(event, context);
        });
      }
    }]);

    return BehaviorsManager;
  }(MountableManager);
});