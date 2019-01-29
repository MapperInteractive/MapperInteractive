"use strict";

/**
 * Base class for the Pane.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function (require) {

  var _ = require('underscore');
  var $ = require('jquery');

  var PaneWrapper = function () {
    function PaneWrapper(app, title, module) {
      _classCallCheck(this, PaneWrapper);

      this.app = app;
      this.module = module;
      this.title = title;

      this.template = _.template('<div class="pane">' + '    <div class="pane__title" data-toggle="collapse"\n' + '         for="<%= id %>" href="#<%= id %>"\n' + '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' + '    <div class="pane__body collapse show" id="<%= id %>">\n' + '      <div class="pane__body-inner">\n' + '      </div>\n' + '    </div>\n' + ' </div>\n');
    }

    _createClass(PaneWrapper, [{
      key: 'render',
      value: function render() {
        var _this = this;

        var id = 'pane-' + (this.app.panes.length + 1);
        var wrapper = $(this.template({ id: id, title: this.title }));

        wrapper.appendTo(this.el);

        var inner = $('#' + id + ' .pane__body-inner:first-child');
        var constructor = this.module;
        var pane = new constructor({ el: inner, graph: this.graph, app: this.app });

        pane.on('all', function () {
          _this.trigger.apply(_this, arguments);
        });

        if (model) {
          pane.states.set(model);
        }

        this.panes.push(pane);
        return pane;
      }
    }]);

    return PaneWrapper;
  }();

  return function () {
    function PaneRegister(app) {
      _classCallCheck(this, PaneRegister);

      this.app = app;
    }

    _createClass(PaneRegister, [{
      key: 'title',
      value: function title(text) {
        this._title = text;
        return this;
      }
    }, {
      key: 'script',
      value: function script(module) {
        this._module = module;
        return this;
      }
    }, {
      key: 'show',
      value: function show() {
        var pane = new PaneWrapper(this.app, this._title, this._module);
        this.app.panes.push();
      }
    }, {
      key: 'hiden',
      value: function hiden() {}
    }]);

    return PaneRegister;
  }();

  // return Backbone.View.extend({
  //
  //   template: _.template('<div class="pane">' +
  //     '    <div class="pane__title" data-toggle="collapse"\n' +
  //     '         for="<%= id %>" href="#<%= id %>"\n' +
  //     '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
  //     '    <div class="pane__body collapse show" id="<%= id %>">\n' +
  //     '      <div class="pane__body-inner">\n' +
  //     '      </div>\n' +
  //     '    </div>\n' +
  //     ' </div>\n'),
  //
  //   initialize(conf) {
  //     console.log(conf);
  //     let {graph} = conf;
  //     this.graph = graph;
  //
  //     this.panes = [];
  //   },
  //
  //   add(conf) {
  //     let {title, constructor, model} = conf;
  //
  //     let id = 'pane-' + (this.panes.length + 1);
  //     let wrapper = $(this.template({id: id, title: title}));
  //
  //     wrapper.appendTo(this.el);
  //
  //     let inner = this.$('#' + id + ' .pane__body-inner:first-child');
  //     let pane = new constructor({el: inner, graph: this.graph, app: this.app});
  //
  //     pane.on('all', (...args) => {
  //       this.trigger(...args);
  //     });
  //
  //     if (model) {
  //       pane.states.set(model);
  //     }
  //
  //     this.panes.push(pane);
  //     return pane;
  //   },
  //
  //   render() {
  //     this.panes.map((p) => p.render());
  //   },
  //
  // });
});