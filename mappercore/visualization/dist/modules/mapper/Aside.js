"use strict";

/**
 * Right side bar, contains all panel instances.
 */

define(function (require) {
  var _require = require('core/Lib'),
      _require$Backbone = _require.Backbone,
      Model = _require$Backbone.Model,
      View = _require$Backbone.View,
      _ = _require._;

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

      console.log(config);
      var id = 'panel-' + this._panels.length + 1;
      var title = _.guard(config['title'], function () {
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