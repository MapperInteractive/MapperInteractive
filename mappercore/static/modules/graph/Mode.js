"use strict";

/**
 * Base class for a graph mode.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function () {
  var _window = window,
      _ = _window._,
      Events = _window.b.Events;


  return function () {
    function Mode() {
      _classCallCheck(this, Mode);

      this.activated = false;
      this.events = _.extend({}, Events);

      // this.graph and this.app is available after mount
      this.graph = undefined;
      this.app = undefined;

      // please override method `initialize`
      // rather than `constructor` to set name and label
      this.name = undefined;
      this.label = undefined;

      this.initialize();
    }

    _createClass(Mode, [{
      key: "listenTo",
      value: function listenTo() {
        var _events;

        (_events = this.events).listenTo.apply(_events, arguments);
      }
    }, {
      key: "stopListening",
      value: function stopListening() {
        this.events.stopListening();
      }

      // put your initialization codes here

    }, {
      key: "initialize",
      value: function initialize() {}
    }, {
      key: "willMount",
      value: function willMount() {
        if (!this.name || !this.label) {
          throw "A graph mode should have a name and a label.";
        }
        console.log("[" + this.name + "] willMount");
      }
    }, {
      key: "didMount",
      value: function didMount() {
        console.log("[" + this.name + "] didMount");
      }
    }, {
      key: "willActivate",
      value: function willActivate() {
        console.log("[" + this.name + "] willActivate");
      }
    }, {
      key: "didActivate",
      value: function didActivate() {
        this.activated = true;
        console.log("[" + this.name + "] didActivate");
      }
    }, {
      key: "willDeactivate",
      value: function willDeactivate() {
        console.log("[" + this.name + "] willDeactivate");
      }
    }, {
      key: "didDeactivate",
      value: function didDeactivate() {
        this.activated = false;
        console.log("[" + this.name + "] didDeactivate");
      }
    }]);

    return Mode;
  }();
});