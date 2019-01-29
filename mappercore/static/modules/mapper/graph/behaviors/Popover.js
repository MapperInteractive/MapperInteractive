"use strict";

/**
 * Enable graph showing popover when use hover a node.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var d3 = require('d3');
  var $ = require('jquery');
  var GraphBehavior = require('../Behavior');

  return function (_GraphBehavior) {
    _inherits(Popover, _GraphBehavior);

    function Popover() {
      _classCallCheck(this, Popover);

      return _possibleConstructorReturn(this, (Popover.__proto__ || Object.getPrototypeOf(Popover)).apply(this, arguments));
    }

    _createClass(Popover, [{
      key: 'initialize',
      value: function initialize() {
        this.name = 'popover';
        this.popover = $('<div class="popover" role="tooltip" style="position: absolute"><div class="popover-body">!!!</div></div>');
      }
    }, {
      key: 'didMount',
      value: function didMount() {
        var _this2 = this;

        _get(Popover.prototype.__proto__ || Object.getPrototypeOf(Popover.prototype), 'didMount', this).call(this);

        this.popover.hide();
        $('body').append(this.popover);

        this.listenTo(this.graph, 'didRender', function () {
          _this2._onDidRender();
        });

        window.addEventListener('scroll', function () {
          return _this2._adjustPosition();
        });
      }
    }, {
      key: '_onDidRender',
      value: function _onDidRender() {
        var _this3 = this;

        this.popover.hide();
        this.listenTo(this.graph, 'mouseenter:node', function (e) {
          _this3.popover.find('.popover-body').html("");

          var target = d3.select(e.target);
          var datum = target.datum();

          var contentFunction = _this3.app.getOption('behavior.popover.content');
          if (!contentFunction) {
            return null;
          }
          var html = contentFunction(datum);

          _this3.popover.find('.popover-body').html(html);
          _this3._adjustPosition();
          _this3.popover.show();
        });
      }
    }, {
      key: '_adjustPosition',
      value: function _adjustPosition() {
        if (!this.popover.is(":visible")) {
          return false;
        }

        var baseElement = this.graph.svg.node();
        var basePosition = baseElement.getBoundingClientRect();

        var left = basePosition.left;
        var top = basePosition.top;

        if (top < 0) {
          top = window.scrollY;
        }

        this.popover.css('top', top + 10);
        this.popover.css('left', left + 10);
      }
    }]);

    return Popover;
  }(GraphBehavior);
});