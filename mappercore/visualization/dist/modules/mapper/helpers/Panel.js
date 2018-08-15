"use strict";

/**
 * Base class for the Panel.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function (require) {

  var _ = require('underscore');
  var $ = require('jquery');

  var PanelWrapper = function () {
    function PanelWrapper(app, title, module) {
      _classCallCheck(this, PanelWrapper);

      this.app = app;
      this.module = module;
      this.title = title;

      this.template = _.template('<div class="panel">' + '    <div class="panel__title" data-toggle="collapse"\n' + '         for="<%= id %>" href="#<%= id %>"\n' + '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' + '    <div class="panel__body collapse show" id="<%= id %>">\n' + '      <div class="panel__body-inner">\n' + '      </div>\n' + '    </div>\n' + ' </div>\n');
    }

    _createClass(PanelWrapper, [{
      key: 'render',
      value: function render() {
        var _this = this;

        var id = 'panel-' + (this.app.panels.length + 1);
        var wrapper = $(this.template({ id: id, title: this.title }));

        wrapper.appendTo(this.el);

        var inner = $('#' + id + ' .panel__body-inner:first-child');
        var constructor = this.module;
        var panel = new constructor({ el: inner, graph: this.graph, app: this.app });

        panel.on('all', function () {
          _this.trigger.apply(_this, arguments);
        });

        if (model) {
          panel.states.set(model);
        }

        this.panels.push(panel);
        return panel;
      }
    }]);

    return PanelWrapper;
  }();

  return function () {
    function PanelRegister(app) {
      _classCallCheck(this, PanelRegister);

      this.app = app;
    }

    _createClass(PanelRegister, [{
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
        var panel = new PanelWrapper(this.app, this._title, this._module);
        this.app.panels.push();
      }
    }, {
      key: 'hiden',
      value: function hiden() {}
    }]);

    return PanelRegister;
  }();

  // return Backbone.View.extend({
  //
  //   template: _.template('<div class="panel">' +
  //     '    <div class="panel__title" data-toggle="collapse"\n' +
  //     '         for="<%= id %>" href="#<%= id %>"\n' +
  //     '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
  //     '    <div class="panel__body collapse show" id="<%= id %>">\n' +
  //     '      <div class="panel__body-inner">\n' +
  //     '      </div>\n' +
  //     '    </div>\n' +
  //     ' </div>\n'),
  //
  //   initialize(conf) {
  //     console.log(conf);
  //     let {graph} = conf;
  //     this.graph = graph;
  //
  //     this.panels = [];
  //   },
  //
  //   add(conf) {
  //     let {title, constructor, model} = conf;
  //
  //     let id = 'panel-' + (this.panels.length + 1);
  //     let wrapper = $(this.template({id: id, title: title}));
  //
  //     wrapper.appendTo(this.el);
  //
  //     let inner = this.$('#' + id + ' .panel__body-inner:first-child');
  //     let panel = new constructor({el: inner, graph: this.graph, app: this.app});
  //
  //     panel.on('all', (...args) => {
  //       this.trigger(...args);
  //     });
  //
  //     if (model) {
  //       panel.states.set(model);
  //     }
  //
  //     this.panels.push(panel);
  //     return panel;
  //   },
  //
  //   render() {
  //     this.panels.map((p) => p.render());
  //   },
  //
  // });
});