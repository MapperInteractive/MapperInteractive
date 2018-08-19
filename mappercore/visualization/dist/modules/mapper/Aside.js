"use strict";

/**
 * Right side bar, contains all pane instances.
 */

define(function (require) {

  var _ = require('underscore');

  var _require = require('backbone'),
      Model = _require.Model,
      View = _require.View;

  var _require2 = require('core/Helper'),
      guard = _require2.guard;

  return View.extend({

    template: _.template('<div class="pane">' + '    <div class="pane__title" data-toggle="collapse"\n' + '         for="<%= id %>" href="#<%= id %>"\n' + '         aria-expanded="true" aria-controls="pane-<%= id %>"><%= title %></div>\n' + '    <div class="pane__body collapse show" id="<%= id %>">\n' + '      <div class="pane__body-inner" id="pane-<%= id %>-body">\n' + '      </div>\n' + '    </div>\n' + ' </div>\n'),

    initialize: function initialize(states) {
      this.states = new Model(_.extend({
        app: null
      }, states));

      this.app = this.states.get('app');
      this._panes = [];
    },
    createPane: function createPane(module, config) {
      if (typeof module !== 'function') {
        throw "panes module is required";
      }

      var id = 'pane-' + this._panes.length + 1;
      var title = guard(config['title'], function () {
        return module.prototype.name;
      });
      var template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#pane-' + id + '-body',
        app: this.app,
        title: title
      });

      this._panes.push(new module(config));
    },
    render: function render() {
      _.map(this._panes, function (p) {
        return p.render();
      });
    }
  });
});