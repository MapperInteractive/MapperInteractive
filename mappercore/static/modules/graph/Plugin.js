"use strict";

/**
 * Base class for a graph behavior.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function () {
  var _window = window,
      _ = _window._,
      Events = _window.b.Events;


  return function () {
    function Plugin() {
      _classCallCheck(this, Plugin);

      this.paused = false;
      this.events = _.extend({}, Events);

      // this.graph and this.workspace is available after mount
      this.graph = undefined;
      this.app = undefined;

      // please override method `initialize`
      // rather than `constructor` to set name
      this.name = undefined;

      this.initialize();
    }

    _createClass(Plugin, [{
      key: 'initialize',
      value: function initialize() {}
    }, {
      key: 'willMount',
      value: function willMount() {}
    }, {
      key: 'didMount',
      value: function didMount() {}
    }, {
      key: 'listenTo',
      value: function listenTo() {
        var _events;

        (_events = this.events).listenTo.apply(_events, arguments);
      }
    }, {
      key: 'pause',
      value: function pause() {
        this.paused = true;
        console.log('[' + this.constructor.name + '] paused');
      }
    }, {
      key: 'resume',
      value: function resume() {
        this.paused = false;
        console.log('[' + this.constructor.name + '] resume');
      }
    }]);

    return Plugin;
  }();
});