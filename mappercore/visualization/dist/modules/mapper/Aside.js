"use strict";

/**
 * Right side bar, contains all panel instances.
 */

define(function (require) {

  var _ = require('underscore');

  var _require = require('backbone'),
      Model = _require.Model,
      View = _require.View;

  var _require2 = require('core/Helper'),
      guard = _require2.guard;

  return View.extend({

    template: _.template('<div class="panel">' + '    <div class="panel__title" data-toggle="collapse"\n' + '         for="<%= id %>" href="#<%= id %>"\n' + '         aria-expanded="true" aria-controls="panel-<%= id %>"><%= title %></div>\n' + '    <div class="panel__body collapse show" id="<%= id %>">\n' + '      <div class="panel__body-inner" id="panel-<%= id %>-body">\n' + '      </div>\n' + '    </div>\n' + ' </div>\n'),

    initialize: function initialize(states) {
      this.states = new Model(_.extend({
        app: null
      }, states));

      this.app = this.states.get('app');
      this._panels = [];
    },
    createPanel: function createPanel(module, config) {
      if (typeof module !== 'function') {
        throw "panels module is required";
      }

      var id = 'panel-' + this._panels.length + 1;
      var title = guard(config['title'], function () {
        return module.prototype.name;
      });
      var template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#panel-' + id + '-body',
        app: this.app,
        title: title
      });

      this._panels.push(new module(config));
    },
    render: function render() {
      _.map(this._panels, function (p) {
        return p.render();
      });
    }
  });
});