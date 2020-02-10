"use strict";


/**
 * Right side bar, contains block instances.
 */
define(function (require) {
  const { _, b: { View, Model }, guard } = window;
  const BlocksManager = require('./managers/Plugins');

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

    initialize(config) {

      this.config = new Model(_.extend({
        app: null,
        blocks: [],
      }, config));

      this.workspace = this.config.get('workspace');
      this._blocks = [];

      this.tools = new BlocksManager(this);
    },

    addBlock(klass, config) {
      if (typeof klass !== 'function') {
        throw "blocks module is required";
      }

      let id = 'block-' + this._blocks.length + 1;
      let title = guard(config['title'], () => klass.prototype.name);
      let template = this.template({ id: id, title: title });

      this.$el.append(template);

      let blockConfig = _.extend(config, {
        el: '#block-' + id + '-body',
        workspace: this.workspace,
        title: title,
      });

      this._blocks.push(new klass(blockConfig));
    },

    render() {
      _.map(this._blocks, (b) => b.render());
    }

  });
});
