"use strict";

/**
 * Right side bar, contains block instances.
 */
define(function () {

  const { _, b: { View, Model }, guard } = window;

  return View.extend({

    template: _.template('<div class="block">' +
      '    <div class="block__title" data-toggle="collapse"\n' +
      '         for="<%= id %>" href="#<%= id %>"\n' +
      '         aria-expanded="true" aria-controls="block-<%= id %>"><%= title %></div>\n' +
      '    <div class="block__body collapse show" id="<%= id %>">\n' +
      '      <div class="block__body-inner" id="block-<%= id %>-body">\n' +
      '      </div>\n' +
      '    </div>\n' +
      ' </div>\n'),

    initialize(states) {
      this.states = new Model(_.extend({
        app: null,
      }, states));

      this.app = this.states.get('app');
      this._blocks = [];
    },

    addBlock(module, config) {
      if (typeof module !== 'function') {
        throw "blocks module is required"
      }

      let id = 'block-' + this._blocks.length + 1;
      let title = guard(config['title'], () => module.prototype.name);
      let template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#block-' + id + '-body',
        app: this.app,
        title: title,
      });

      this._blocks.push(new module(config));
    },

    render() {
      _.map(this._blocks, (p) => p.render());
    }

  });
});
