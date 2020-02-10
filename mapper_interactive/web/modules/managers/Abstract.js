"use strict";

/**
 * Common part for Behavior and Mode.
 *
 * You can create a new mechanism which can be mount to a graph.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function () {
  var _window = window,
      _ = _window._;


  return function () {
    function AbstractManager(graph) {
      _classCallCheck(this, AbstractManager);

      this.graph = graph;
      this.mounted = {};
    }

    _createClass(AbstractManager, [{
      key: "add",
      value: function add(mountable) {
        mountable.willMount();
        mountable.graph = this.graph;
        mountable.app = this.graph.app;
        this.mounted[mountable.name] = mountable;
        mountable.didMount();
      }
    }, {
      key: "has",
      value: function has(name) {
        return this.mounted.hasOwnProperty(name);
      }
    }, {
      key: "get",
      value: function get(name) {
        return this.mounted[name];
      }
    }, {
      key: "map",
      value: function map(fn) {
        _.mapObject(this.mounted, fn);
      }
    }]);

    return AbstractManager;
  }();
});