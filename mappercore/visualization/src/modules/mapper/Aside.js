"use strict";

/**
 * Right side bar, contains all panel instances.
 */
define(function (require) {

  const _ = require('underscore');
  const { Model, View } = require('backbone');
  const { guard } = require('core/Helper');

  return View.extend({

    template: _.template('<div class="panel">' +
      '    <div class="panel__title" data-toggle="collapse"\n' +
      '         for="<%= id %>" href="#<%= id %>"\n' +
      '         aria-expanded="true" aria-controls="panel-<%= id %>"><%= title %></div>\n' +
      '    <div class="panel__body collapse show" id="<%= id %>">\n' +
      '      <div class="panel__body-inner" id="panel-<%= id %>-body">\n' +
      '      </div>\n' +
      '    </div>\n' +
      ' </div>\n'),

    initialize(states) {
      this.states = new Model(_.extend({
        app: null,
      }, states));

      this.app = this.states.get('app');
      this._panels = [];
    },

    createPanel(module, config) {
      if (typeof module !== 'function') {
        throw "panels module is required"
      }

      let id = 'panel-' + this._panels.length + 1;
      let title = guard(config['title'], () => module.prototype.name);
      let template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#panel-' + id + '-body',
        app: this.app,
        title: title,
      });

      this._panels.push(new module(config));
    },

    render() {
      _.map(this._panels, (p) => p.render());
    }

  });
});
