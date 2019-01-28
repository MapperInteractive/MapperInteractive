"use strict";

/**
 * Right side bar, contains all pane instances.
 */
define(function (require) {

  const _ = require('underscore');
  const { Model, View } = require('backbone');
  const { guard } = require('core/Helper');

  return View.extend({

    template: _.template('<div class="pane">' +
      '    <div class="pane__title" data-toggle="collapse"\n' +
      '         for="<%= id %>" href="#<%= id %>"\n' +
      '         aria-expanded="true" aria-controls="pane-<%= id %>"><%= title %></div>\n' +
      '    <div class="pane__body collapse show" id="<%= id %>">\n' +
      '      <div class="pane__body-inner" id="pane-<%= id %>-body">\n' +
      '      </div>\n' +
      '    </div>\n' +
      ' </div>\n'),

    initialize(states) {
      this.states = new Model(_.extend({
        app: null,
      }, states));

      this.app = this.states.get('app');
      this._panes = [];
    },

    createPane(module, config) {
      if (typeof module !== 'function') {
        throw "panes module is required"
      }

      let id = 'pane-' + this._panes.length + 1;
      let title = guard(config['title'], () => module.prototype.name);
      let template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#pane-' + id + '-body',
        app: this.app,
        title: title,
      });

      this._panes.push(new module(config));
    },

    render() {
      _.map(this._panes, (p) => p.render());
    }

  });
});
